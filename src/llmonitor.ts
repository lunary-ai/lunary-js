import { checkEnv, cleanError, debounce, formatLog } from "./utils"

import {
  Event,
  EventName,
  RunType,
  LLMonitorOptions,
  LogEvent,
  RunEvent,
  cJSON,
} from "./types"

import { Thread } from "./thread"

const MAX_CHUNK_SIZE = 20

class LLMonitor {
  appId?: string
  verbose?: boolean
  apiUrl?: string
  ctx?: any

  private queue: any[] = []
  private queueRunning: boolean = false

  /**
   * @param {LLMonitorOptions} options
   */
  constructor(ctx?) {
    this.init({
      appId: checkEnv("LLMONITOR_APP_ID"),
      verbose: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com",
    })

    this.ctx = ctx
  }

  init({ appId, verbose, apiUrl }: LLMonitorOptions = {}) {
    if (appId) this.appId = appId
    if (verbose) this.verbose = verbose
    if (apiUrl) this.apiUrl = apiUrl
  }

  /**
   * Manually track a run event.
   * @param {RunType} type - The type of the run.
   * @param {EventName} event - The name of the event.
   * @param {Partial<RunEvent | LogEvent>} data - The data associated with the event.
   * @example
   * monitor.trackEvent("llm", "start", { name: "gpt-4", input: "Hello I'm a bot" });
   */
  trackEvent(
    type: RunType,
    event: EventName,
    data: Partial<RunEvent | LogEvent>
  ): void {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      )

    // Add 1ms to timestamp if it's the same/lower than the last event
    // Keep the order of events in case they are sent in the same millisecond
    let timestamp = Date.now()
    const lastEvent = this.queue?.[this.queue.length - 1]
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1
    }

    const parentRunId = data.parentRunId ?? this.ctx?.runId.tryUse()
    const user = this.ctx?.user?.tryUse()
    const userId = data.userId ?? user?.userId
    let userProps = data.userProps ?? user?.userProps

    if (userProps && !userId) {
      console.warn(
        "LLMonitor: userProps passed without userId. Ignoring userProps."
      )
      userProps = undefined
    }

    const runtime = data.runtime ?? "llmonitor-js"

    const eventData: Event = {
      event,
      type,
      userId,
      userProps,
      app: this.appId,
      parentRunId,
      timestamp,
      runtime,
      ...data,
    }

    if (this.verbose) {
      console.log(formatLog(eventData))
    }

    this.queue.push(eventData)

    if (this.queue.length > MAX_CHUNK_SIZE) {
      this.processQueue()
    } else {
      this.debouncedProcessQueue()
    }
  }

  // Wait 500ms to allow other events to be added to the queue
  private debouncedProcessQueue = debounce(() => this.processQueue())

  async processQueue() {
    if (!this.queue.length || this.queueRunning) return

    this.queueRunning = true

    try {
      if (this.verbose) console.log("LLMonitor: Sending events now")

      const copy = this.queue.slice()

      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: copy }),
      })

      if (this.verbose) console.log("LLMonitor: Events sent")

      // Clear the events we just sent (don't clear it all in case new events were added while sending)
      this.queue = this.queue.slice(copy.length)

      this.queueRunning = false

      // If there are new events in the queue
      if (this.queue.length) this.processQueue()
    } catch (error) {
      this.queueRunning = false
      console.error("Error sending event(s) to LLMonitor", error)
    }
  }

  trackFeedback = (runId: string, feedback: cJSON) => {
    if (!runId || typeof runId !== "string")
      return console.error(
        "LLMonitor: No message ID provided to track feedback"
      )

    if (typeof feedback !== "object")
      return console.error(
        "LLMonitor: Invalid feedback provided. Pass a valid object"
      )

    this.trackEvent(null, "feedback", {
      runId,
      extra: feedback,
    })
  }

  /**
   * @deprecated Use startThread() instead
   */
  startChat(id?: string) {
    return new Thread(this, id)
  }

  startThread(id?: string) {
    return new Thread(this, id)
  }

  resumeThread(id: string) {
    return new Thread(this, id, true)
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

  /**
   * Make sure the queue is flushed before exiting the program
   */
  async flush() {
    await this.processQueue()
  }
}

export default LLMonitor
