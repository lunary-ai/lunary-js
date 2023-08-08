import {
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput,
  parseLangchainMessages,
} from "./utils"

import {
  EntityToMonitor,
  Event,
  EventName,
  EventType,
  LLMonitorOptions,
  LogEvent,
  RunEvent,
  WrapParams,
  WrappableFn,
  cJSON,
} from "./types"

import { monitorLangchainLLM, monitorLangchainTool } from "src/langchain"
import { monitorOpenAi } from "src/openai"

import ctx from "./context"

class LLMonitor {
  appId?: string
  logConsole?: boolean
  apiUrl?: string
  userId?: string
  userProps?: cJSON

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

  load({ appId, log, apiUrl, userId, userProps }: LLMonitorOptions = {}) {
    if (appId) this.appId = appId
    if (log) this.logConsole = log
    if (apiUrl) this.apiUrl = apiUrl
    if (userId) this.userId = userId
    if (userProps) this.userProps = userProps
  }

  identify(userId: string, userProps?: cJSON) {
    this.userId = userId
    this.userProps = userProps
  }

  monitor(
    entities: EntityToMonitor | [EntityToMonitor],
    { tags }: { tags?: string[] } = {}
  ) {
    const llmonitor = this

    entities = Array.isArray(entities) ? entities : [entities]

    entities.forEach((entity) => {
      if (entity.constructor.name === "OpenAIApi") {
        monitorOpenAi(entity as any, llmonitor, tags)
        return
      }

      if (
        Object.getPrototypeOf(Object.getPrototypeOf(entity.constructor))
          .name === "BaseLanguageModel"
      ) {
        monitorLangchainLLM(entity as any, llmonitor, tags)
        return
      }

      const parentName = Object.getPrototypeOf(
        Object.getPrototypeOf(entity.constructor)
      ).name
      if (parentName === "Tool" || parentName === "StructuredTool") {
        monitorLangchainTool(entity as any, llmonitor, tags)
        return
      }
    })
  }

  async trackEvent(
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

    const parentRunId = ctx.tryUse()

    const eventData: Event = {
      event,
      type,
      userId: this.userId,
      userProps: this.userProps,
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
    } catch (error) {
      console.warn("Error sending event(s) to LLMonitor", error)
    }

    this.queueRunning = false

    // If there are new events in the queue
    if (this.queue.length) this.processQueue()
  }

  /**
   * Wrap a Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent/tool/model executor function
   */
  private wrap<T extends WrappableFn>(
    type: EventType,
    func: T,
    params?: WrapParams<T>
  ): T {
    // @ts-ignore TODO: fix this TS error
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      // Generate a random ID for this run (will be injected into the context)
      const runId = crypto.randomUUID()

      // Get agent name from function name or params
      const name = params?.nameParser
        ? params.nameParser(...args)
        : params?.name ?? func.name

      const { inputParser, outputParser, tokensUsageParser, extra, tags } =
        params || {}

      // Get extra data from function or params
      const extraData = params?.extraParser
        ? params.extraParser(...args)
        : extra

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
        // Call function with runId into context
        const output = await ctx.callAsync(runId, async () => {
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
  }

  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapAgent<T extends WrappableFn>(func: T, params?: WrapParams<T>): T {
    return this.wrap("agent", func, params)
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapTool<T extends WrappableFn>(func: T, params?: WrapParams<T>): T {
    return this.wrap("tool", func, params)
  }

  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapModel<T extends WrappableFn>(func: T, params?: WrapParams<T>): T {
    return this.wrap("llm", func, params)
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
