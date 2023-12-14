import { cleanError, getFunctionInput } from "./utils"

import { RunType, WrapParams, WrappableFn, WrappedFn } from "./types"

import ctx from "./context"
import chainable from "./chainable"

import Lunary from "./lunary"

// extend the Lunary class to add a new method

class BackendMonitor extends Lunary {
  private wrap<T extends WrappableFn>(
    type: RunType,
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    const lunary = this

    const wrappedFn = (...args: Parameters<T>) => {
      // Don't pass the function directly to proxy to avoid it being called directly
      const callInfo = {
        type,
        func,
        args,
        params,
      }

      const proxy = new Proxy(callInfo, {
        get: function (target, prop) {
          if (prop === "identify") {
            return chainable.identify.bind({
              target,
              next: lunary.executeWrappedFunction.bind(lunary),
            })
          }

          if (prop === "setParent") {
            return chainable.setParent.bind({
              target,
              next: lunary.executeWrappedFunction.bind(lunary),
            })
          }

          const promise = lunary.executeWrappedFunction(target)

          if (prop === "then") {
            return (onFulfilled, onRejected) =>
              promise.then(onFulfilled, onRejected)
          }

          if (prop === "catch") {
            return (onRejected) => promise.catch(onRejected)
          }

          if (prop === "finally") {
            return (onFinally) => promise.finally(onFinally)
          }
        },
      }) as unknown

      return proxy
    }

    return wrappedFn as WrappedFn<T>
  }

  // Extract the actual execution logic into a function
  private async executeWrappedFunction<T extends WrappableFn>(target) {
    const { type, args, func, params } = target

    // Generate a random ID for this run (will be injected into the context)
    const runId = crypto.randomUUID()

    // Get agent name from function name or params
    const name = params?.nameParser
      ? params.nameParser(...args)
      : params?.name ?? func.name

    const {
      inputParser,
      outputParser,
      tokensUsageParser,
      templateParser,
      waitUntil,
      enableWaitUntil,
      extra,
      tags,
      userId,
      userProps,
    }: WrapParams<T> = params || {}

    // Get extra data from function or params
    const extraData = params?.extraParser ? params.extraParser(...args) : extra

    const tagsData = params?.tagsParser ? params.tagsParser(...args) : tags

    const userIdData = params?.userIdParser
      ? params.userIdParser(...args)
      : userId

    const userPropsData = params?.userPropsParser
      ? params.userPropsParser(...args)
      : userProps

    const templateId = params?.templateParser
      ? params.templateParser(...args)
      : templateParser

    const input = inputParser
      ? inputParser(...args)
      : getFunctionInput(func, args)

    this.trackEvent(type, "start", {
      runId,
      input,
      name,
      extra: extraData,
      tags: tagsData,
      userId: userIdData,
      userProps: userPropsData,
      templateId,
    })

    const shouldWaitUntil =
      typeof enableWaitUntil === "function"
        ? enableWaitUntil(...args)
        : waitUntil

    const processOutput = async (output) => {
      // Allow parsing of token usage (useful for LLMs)
      const tokensUsage = tokensUsageParser
        ? await tokensUsageParser(output)
        : undefined

      this.trackEvent(type, "end", {
        runId,
        name, // need name in case need to count tokens usage server-side
        output: outputParser ? outputParser(output) : output,
        tokensUsage,
      })

      if (shouldWaitUntil) {
        // Process queue immediately, in case it's a stream, we can't ask the user to manually flush
        await this.flush()
      }
    }

    try {
      // Inject runId into context
      const output = await ctx.runId.callAsync(runId, async () => {
        return func(...args)
      })

      if (shouldWaitUntil) {
        // Support waiting for a callback to be called to complete the run
        // Useful for streaming API
        return waitUntil(
          output,
          (res) => processOutput(res),
          (error) => console.error(error)
        )
      } else {
        await processOutput(output)
      }

      return output
    } catch (error) {
      this.trackEvent(type, "error", {
        runId,
        error: cleanError(error),
      })

      // Process queue immediately as if there is an uncaught exception next, it won't be processed
      // TODO: find a cleaner (and non platform-specific) way to do this
      await this.processQueue()

      throw error
    }
  }

  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   * @param {WrapParams} params - Wrap params
   */
  wrapAgent<T extends WrappableFn>(
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    return this.wrap("agent", func, params)
  }

  /**
   * Wrap an tool's Promise to track it's input, results and any errors.
   * @param {Promise} func - Tool function
   * @param {WrapParams} params - Wrap params
   */
  wrapTool<T extends WrappableFn>(
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    return this.wrap("tool", func, params)
  }

  /**
   * Wrap an model's Promise to track it's input, results and any errors.
   * @param {Promise} func - Model generation function
   * @param {WrapParams} params - Wrap params
   */
  wrapModel<T extends WrappableFn>(
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    return this.wrap("llm", func, params) as WrappedFn<T>
  }
}

// Create a new instance of the monitor with the async context
const lunary = new BackendMonitor(ctx)

export default lunary
