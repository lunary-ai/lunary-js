import {
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput,
  parseLangchainMessages,
} from "./utils"

import {
  LLMonitorOptions,
  Event,
  EventType,
  RunEvent,
  LogEvent,
  WrapParams,
} from "./types"

import ctx from "./context"

class LLMonitor {
  appId?: string
  logConsole?: boolean
  apiUrl?: string
  userId?: string

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

  load(options?: Partial<LLMonitorOptions>) {
    if (options.appId) this.appId = options.appId
    if (options.log) this.logConsole = options.log
    if (options.apiUrl) this.apiUrl = options.apiUrl
    if (options.userId) this.userId = options.userId
  }

  async trackEvent(
    type: EventType,
    event: string,
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

  /*
   * Wrap a Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent/tool/model executor function
   */
  private wrap<T extends (...args: any[]) => Promise<any>>(
    type: EventType,
    func: T,
    params?: WrapParams
  ) {
    return async (...args: Parameters<T>) => {
      // Generate a random ID for this run (will be injected into the context)
      const runId = crypto.randomUUID()

      // Get agent name from function name or params
      const name = params?.name ?? func.name

      const { inputParser, outputParser, tokensUsageParser, extra, tags } =
        params || {}

      const input = inputParser
        ? inputParser(args)
        : getFunctionInput(func, args)

      this.trackEvent(type, "start", {
        runId,
        input,
        name,
        extra,
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

        throw error
      }
    }
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapAgent<T extends (...args: any[]) => Promise<any>>(
    func: T,
    params?: WrapParams
  ) {
    return this.wrap("agent", func, params)
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapTool<T extends (...args: any[]) => Promise<any>>(
    func: T,
    params?: WrapParams
  ) {
    return this.wrap("tool", func, params)
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapModel<T extends (...args: any[]) => Promise<any>>(
    func: T,
    params?: WrapParams
  ) {
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
   **/
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

  /**
   * Extends Langchain's LLM and Chat classes like OpenAI and ChatOpenAI
   * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
   * @param baseClass - Langchain's LLM class
   * @returns Extended class
   * @example
   * const MonitoredChat = monitor.langchain(ChatOpenAI)
   * const chat = new MonitoredChat({
   *  modelName: "gpt-4"
   * })
   **/

  langchain(baseClass: any) {
    const monitor = this

    return class extends baseClass {
      // Wrap the `generate` function instead of .call to get token usages information
      async generate(...args: any): Promise<any> {
        // Batch calls, richer outputs
        const boundSuperGenerate = super.generate.bind(this)

        const extra = {
          temperature: this.temperature,
          maxTokens: this.maxTokens,
          frequencyPenalty: this.frequencyPenalty,
          presencePenalty: this.presencePenalty,
          stop: this.stop,
          timeout: this.timeout,
          modelKwargs: Object.keys(this.modelKwargs).length
            ? this.modelKwargs
            : undefined,
        }

        const extraCleaned = Object.fromEntries(
          Object.entries(extra).filter(([_, v]) => v != null)
        )

        const output = await monitor.wrapModel(boundSuperGenerate, {
          name: this.modelName || (this.model as string),
          inputParser: (args) => parseLangchainMessages(args[0]), // Input message will be the first argument
          outputParser: ({ generations }) =>
            parseLangchainMessages(generations),
          tokensUsageParser: ({ llmOutput }) => ({
            completion: llmOutput?.tokenUsage?.completionTokens,
            prompt: llmOutput?.tokenUsage?.promptTokens,
          }),
          extra: extraCleaned,
          tags: this.tags,
        })(...args)

        return output
      }
    }
  }
}

export default LLMonitor
