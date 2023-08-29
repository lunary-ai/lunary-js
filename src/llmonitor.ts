import {
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput,
} from "./utils"

import {
  Event,
  EventName,
  EventType,
  LLMonitorOptions,
  LogEvent,
  RunEvent,
  WrapParams,
  WrappableFn,
  WrappedFn,
} from "./types"

import { runIdCtx, userCtx } from "./context"
import chainable from "./chainable"

class LLMonitor {
  appId?: string
  logConsole?: boolean
  apiUrl?: string

  private queue: any[] = []
  private queueRunning: boolean = false

  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {
    this.load({
      appId: checkEnv("LLMONITOR_APP_ID"),
      log: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com",
    })
  }

  load({ appId, log, apiUrl }: LLMonitorOptions = {}) {
    if (appId) this.appId = appId
    if (log) this.logConsole = log
    if (apiUrl) this.apiUrl = apiUrl
  }

  private async trackEvent(
    type: EventType,
    event: EventName,
    data: Partial<RunEvent | LogEvent>
  ) {
    if (!this.appId)
      return console.error("LLMonitor: App ID not set. Not reporting anything.")

    // Add 1ms to timestamp if it's the same/lower than the last event
    // Keep the order of events in case they are sent in the same millisecond
    let timestamp = Date.now()
    const lastEvent = this.queue?.[this.queue.length - 1]
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1
    }

    const parentRunId = runIdCtx.tryUse()
    const user = userCtx.tryUse()

    const eventData: Event = {
      event,
      type,
      userId: user?.userId,
      userProps: user?.userProps,
      app: this.appId,
      parentRunId,
      timestamp,
      ...data,
    }

    if (this.logConsole) {
      console.log(formatLog(eventData))
    }

    this.queue.push(eventData)

    this.debouncedProcessQueue()
  }

  // Wait 500ms to allow other events to be added to the queue
  private debouncedProcessQueue = debounce(() => this.processQueue())

  private async processQueue() {
    if (!this.queue.length || this.queueRunning) return

    this.queueRunning = true

    try {
      const copy = this.queue.slice()

      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: copy }),
      })

      // Clear the events we just sent (don't clear it all in case new events were added while sending)
      this.queue = this.queue.slice(copy.length)

      this.queueRunning = false

      // If there are new events in the queue
      if (this.queue.length) this.processQueue()
    } catch (error) {
      this.queueRunning = false
      console.warn("Error sending event(s) to LLMonitor", error)
    }
  }

  private wrap<T extends WrappableFn>(
    type: EventType,
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    const llmonitor = this

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
              next: llmonitor.executeWrappedFunction.bind(llmonitor),
            })
          }

          const promise = llmonitor.executeWrappedFunction(target)

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
    // : Promise<ReturnType<T>> {
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
      waitUntil,
      enableWaitUntil,
      extra,
      tags,
      userId,
      userProps,
    }: WrapParams<T> = params || {}

    // Get extra data from function or params
    const extraData = params?.extraParser ? params.extraParser(...args) : extra

    const input = inputParser
      ? inputParser(...args)
      : getFunctionInput(func, args)

    this.trackEvent(type, "start", {
      runId,
      input,
      name,
      extra: extraData,
      tags,
    })

    const processOutput = async (output) => {
      // Allow parsing of token usage (useful for LLMs)
      const tokensUsage = tokensUsageParser
        ? await tokensUsageParser(output)
        : undefined

      this.trackEvent(type, "end", {
        runId,
        output: outputParser ? outputParser(output) : output,
        tokensUsage,
      })
    }

    try {
      // Inject runId into context
      const output = await runIdCtx.callAsync(runId, async () => {
        return func(...args)
      })

      if (
        typeof enableWaitUntil === "function"
          ? enableWaitUntil(...args)
          : waitUntil
      ) {
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

  /**
   * Use this to log any external action or tool you use.
   * @param {string} message - Log message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.info("Running tool Google Search")
   **/
  info(message: string, extra?: any) {
    this.trackEvent("log", "info", {
      message,
      extra,
    })
  }

  log(message: string, extra?: any) {
    this.info(message, extra)
  }

  /**
   * Use this to warn
   * @param {string} message - Warning message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.log("Running tool Google Search")
   **/
  warn(message: string, extra?: any) {
    this.trackEvent("log", "warn", {
      message,
      extra,
    })
  }

  /**
   * Report any errors that occur during the conversation.
   * @param {string} message - Error message
   * @param {any} error - Error object
   * @example
   * try {
   *   const answer = await model.generate("Hello")
   *   monitor.result(answer)
   * } catch (error) {
   *   monitor.error("Error generating answer", error)
   * }
   */
  error(message: string | any, error?: any) {
    // Allow error obj to be the first argument
    if (typeof message === "object") {
      error = message
      message = error.message ?? undefined
    }

    this.trackEvent("log", "error", {
      message,
      extra: cleanError(error),
    })
  }
}

export default LLMonitor
