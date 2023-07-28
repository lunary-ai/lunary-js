import {
  LANGCHAIN_ARGS_TO_REPORT,
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput,
} from "./utils"

import {
  LLMonitorOptions,
  LLMessage,
  Event,
  EventType,
  RunEvent,
  LogEvent,
} from "./types"

import ctx from "./context"

class LLMonitor {
  appId?: string
  // convoId: string
  logConsole?: boolean
  apiUrl?: string
  userId?: string

  private queue: any[] = []
  private queueRunning: boolean = false

  /**
   * @param {LLMonitorOptions} options
   */

  load(customOptions?: LLMonitorOptions) {
    const defaultOptions = {
      appId: checkEnv("LLMONITOR_APP_ID"),
      log: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com",
    }

    const options = { ...defaultOptions, ...customOptions }

    this.appId = options.appId
    this.logConsole = options.log
    this.apiUrl = options.apiUrl
    this.userId = options.userId
  }

  async trackEvent(type: EventType, data: Partial<RunEvent | LogEvent>) {
    if (!this.appId)
      return console.error("LLMonitor: App ID not set. Not reporting anything.")

    // Add 1ms to timestamp if it's the same/lower than the last event
    // Keep the order of events in case they are sent in the same millisecond

    let timestamp = Date.now()
    const lastEvent = this.queue?.[this.queue.length - 1]
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1
    }

    const eventData: Event = {
      type,
      app: this.appId,
      // convo: this.convoId,
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
    params?: { name?: string }
  ) {
    return async (...args: Parameters<T>) => {
      // Get agent name from function name or params
      const runId = crypto.randomUUID()

      const parentId = ctx.tryUse()

      const name = params?.name || func.name
      const input = getFunctionInput(func, args)

      console.log(
        `Calling ${name} with runId ${runId} and parentId ${parentId}`
      )

      this.trackEvent(type, {
        runId,
        parentId,
        input,
        name,
      })

      try {
        // Inject runId into context
        const output = await ctx.callAsync(runId, async () => {
          return func(...args)
        })

        this.trackEvent(type, {
          runId,
          parentId,
          output,
        })

        return output
      } catch (error) {
        this.trackEvent(type, {
          runId,
          parentId,
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
    params?: { name?: string }
  ) {
    return this.wrap("agent", func, params)
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapTool<T extends (...args: any[]) => Promise<any>>(
    func: T,
    params?: { name?: string }
  ) {
    return this.wrap("tool", func, params)
  }

  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapModel<T extends (...args: any[]) => Promise<any>>(
    func: T,
    params?: { name?: string }
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
    this.trackEvent("log", {
      event: "info",
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
    this.trackEvent("log", {
      event: "warn",
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
      message = error.message || undefined
    }

    this.trackEvent("log", {
      event: "error",
      message,
      extra: cleanError(error),
    })
  }

  /**
   * Extends Langchain's LLM classes like ChatOpenAI
   * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
   * @param baseClass - Langchain's LLM class
   * @returns Extended class
   * @example
   * const monitor = new LLMonitor()
   * const MonitoredChat = monitor.extendModel(ChatOpenAI)
   * const chat = new MonitoredChat({
   *  modelName: "gpt-4"
   * })
   **/

  langchain(baseClass: any) {
    const monitor = this

    return class extends baseClass {
      interestingArgs?: Record<string, unknown>

      constructor(...args: any[]) {
        super(...args)

        this.interestingArgs = LANGCHAIN_ARGS_TO_REPORT.reduce((acc, arg) => {
          if (args[0][arg]) acc[arg] = args[0][arg]
          return acc
        }, {} as Record<string, unknown>)
      }

      // wrap the call method to track input/output and name
      async call(...args: any): Promise<any> {
        // Bind the super call to the current instance, otherwise 'this' will be undefined
        const boundSuperCall = super.call.bind(this)

        return await monitor.wrapModel(boundSuperCall, {
          name: this.interestingArgs?.modelName as string,
        })(...args)
      }
    }
  }
}

export default LLMonitor
