import { checkEnv, debounce, formatLog, messageAdapter } from "./utils"
import { LLMonitorOptions, LLMOutput, LLMInput, Event } from "./types"

class LLMonitor {
  appId: string
  // convoId: string
  logConsole: boolean
  apiUrl: string
  userId?: string
  agentRunId?: string

  private queue: any[] = []
  private queueRunning: boolean = false

  /**
   * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
   * @param {boolean} log - Log events to the console
   * @param {string | string[]} convoTags - Add a label to the conversation
   * @param {string} apiUrl - Custom tracking URL if you are self-hosting (can also be set with LLMONITOR_API_URL)
   * @constructor
   */

  constructor(options?: LLMonitorOptions) {
    this.appId = options?.appId || checkEnv("LLMONITOR_APP_ID")
    // this.convoId = options?.convoId || crypto.randomUUID()
    this.userId = options?.userId
    this.agentRunId = options?.agentRunId
    this.logConsole = options?.log || false
    this.apiUrl =
      options?.apiUrl ||
      checkEnv("LLMONITOR_API_URL") ||
      "https://app.llmonitor.com"
  }

  private async trackEvent(type: string, data: Partial<Event> = {}) {
    let timestamp = Date.now()

    // Add 1ms to timestamp if it's the same/lower than the last event
    // Keep the order of events in case they are sent in the same millisecond

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

  // Wait 50ms to allow other events to be added to the queue
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
   * Get the conversation ID to continue tracking an existing conversation.
   * @returns {string} - Conversation ID
   * @example
   * const monitor = new LLMonitor()
   * const convoId = monitor.id
   *
   * // Later on...
   * const monitor = new LLMonitor({ convoId })
   **/
  // get id() {
  //   return this.convoId
  // }

  agentStart(data: { tags?: string[]; name?: string }) {
    this.trackEvent("agent", {
      event: "start",
      ...data,
    })
  }

  llmStart(data: { runId: string; messages: LLMInput[]; params: any }) {
    this.trackEvent("llm", {
      event: "start",
      ...data,
    })
  }

  /**
   * Use this when you start streaming the model's output to the user.
   * Used to measure the time it takes for the model to generate the first response.
   */
  streamingStart(data: { runId: string }) {
    this.trackEvent("llm", {
      event: "stream",
      ...data,
    })
  }

  llmEnd(data: {
    runId: string

    output: LLMOutput
    promptTokens: number
    completionTokens: number
  }) {
    this.trackEvent("llm", {
      event: "end",
      ...data,
    })
  }

  llmError(data: { runId: string; error: any }) {
    this.trackEvent("llm", {
      event: "error",
      ...data,
    })
  }

  toolStart(data: { runId: string; name: string; input: any }) {
    this.trackEvent("tool", {
      event: "start",
      ...data,
    })
  }

  toolEnd(data: { runId: string; output: any }) {
    this.trackEvent("tool", {
      event: "end",
      ...data,
    })
  }

  toolError(data: { runId: string; error: any }) {
    this.trackEvent("tool", {
      event: "error",
      ...data,
    })
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
      level: "info",
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
      level: "warn",
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
      level: "error",
      message,
      extra: error,
    })
  }
}

export default LLMonitor

export * from "./agent"
export * from "./langchain"
