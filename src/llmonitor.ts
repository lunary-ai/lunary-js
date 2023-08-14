import {
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput,
} from "./utils"

import {
  EntityToMonitor,
  Event,
  EventName,
  EventType,
  LLMonitorOptions,
  LogEvent,
  RunEvent,
  WrapExtras,
  WrapParams,
  WrappableFn,
  WrappedFn,
  cJSON,
} from "./types"

import { monitorLangchainLLM, monitorLangchainTool } from "src/langchain"
import { monitorOpenAi } from "src/openai"

import ctx from "./context"

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

  /**
   * Attach LLMonitor to an entity (Langchain Chat/LLM/Tool classes, OpenAI class)
   * @param {EntityToMonitor | [EntityToMonitor]} entities - Entity or array of entities to monitor
   * @param {string[]} tags - (optinal) Tags to add to all events
   * @example
   * const chat = new ChatOpenAI({
   *   modelName: "gpt-3.5-turbo",
   * })
   * monitor(chat)
   */
  monitor(
    entities: EntityToMonitor | EntityToMonitor[],
    params: WrapExtras = {}
  ) {
    const llmonitor = this

    entities = Array.isArray(entities) ? entities : [entities]

    for (const entity of entities) {
      const entityName = entity.name
      const parentName = Object.getPrototypeOf(entity).name

      if (entityName === "OpenAIApi") {
        monitorOpenAi(entity as any, llmonitor, params)
      } else if (parentName === "BaseChatModel") {
        monitorLangchainLLM(entity as any, llmonitor, params)
      } else if (parentName === "Tool" || parentName === "StructuredTool") {
        monitorLangchainTool(entity as any, llmonitor, params)
      }
    }
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

    const context = ctx.tryUse()

    const eventData: Event = {
      event,
      type,
      userId: context?.userId,
      userProps: context?.userProps,
      app: this.appId,
      parentRunId: context?.parentRunId,
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

  // TODO: refactor this to be cleaner
  // I'll admit to not fully understand what's going on here
  private wrap<T extends WrappableFn>(
    type: EventType,
    func: T,
    params?: WrapParams<T>
  ): WrappedFn<T> {
    const wrappedFn = (...args: Parameters<T>) => {
      // Keep a reference to the execution context
      let executeOriginalPromise = () =>
        this.executeWrappedFunction(type, func, args, params)

      // Because Promises are immutable, we need to wrap all their methods
      // To add another one
      const result = {
        then: (onFulfilled, onRejected) =>
          executeOriginalPromise().then(onFulfilled, onRejected),
        catch: (onRejected) => executeOriginalPromise().catch(onRejected),
        finally: (onFinally) => executeOriginalPromise().finally(onFinally),
        identify: (userId: string, userProps: cJSON) => {
          return this.executeIdentifiedWrappedFunction(
            type,
            func,
            args,
            userId,
            userProps,
            params
          )
        },
      }

      return result
    }

    return wrappedFn as WrappedFn<T>
  }

  // Extract the actual execution logic into a function
  private async executeWrappedFunction<T extends WrappableFn>(
    type: EventType,
    func: T,
    args: Parameters<T>,
    params?: WrapParams<T>
  ): Promise<ReturnType<T>> {
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
      extra,
      tags,
      userId,
      userProps,
    } = params || {}

    // Get extra data from function or params
    const extraData = params?.extraParser ? params.extraParser(...args) : extra

    const input = inputParser
      ? //  @ts-ignore TODO: fix this TS error
        inputParser(...args)
      : getFunctionInput(func, args)

    this.trackEvent(type, "start", {
      runId,
      input,
      name,
      extra: extraData,
      tags,
    })

    try {
      const currentContext = ctx.tryUse()

      const context = {
        parentRunId: runId,
        // If we already have a userId/userProps in the context, use that
        userId: userId || currentContext?.userId,
        userProps: userProps || currentContext?.userProps,
      }

      // Call function with runId into context
      const output = await ctx.callAsync(context, async () => {
        return func(...args)
      })

      // Allow parsing of token usage (useful for LLMs)
      const tokensUsage = tokensUsageParser
        ? tokensUsageParser(output)
        : undefined

      this.trackEvent(type, "end", {
        runId,
        output: outputParser ? outputParser(output) : output,
        tokensUsage,
      })

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

  // Run a wrap function injecting a userId and userProps into the context first
  private async executeIdentifiedWrappedFunction<T extends WrappableFn>(
    type: EventType,
    func: T,
    args: Parameters<T>,
    userId: string,
    userProps?: cJSON,
    params?: WrapParams<T>
  ): Promise<ReturnType<T>> {
    const currentContext = ctx.tryUse()

    const context = {
      parentRunId: currentContext?.parentRunId,
      userId,
      userProps,
    }

    return ctx.callAsync(context, async () => {
      return this.executeWrappedFunction(type, func, args, params)
    })
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
