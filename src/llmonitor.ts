import {
  LANGCHAIN_ARGS_TO_REPORT,
  checkEnv,
  cleanError,
  debounce,
  formatLog,
} from "./utils"

import { LLMonitorOptions, LLMessage, Event, EventType } from "./types"
import { LLMonitorCallbackHandler } from "./langchain"

class LLMonitor {
  appId: string
  // convoId: string
  logConsole: boolean
  apiUrl: string
  userId?: string

  private queue: any[] = []
  private queueRunning: boolean = false

  /**
   * @param {LLMonitorOptions} options
   * @constructor
   */

  constructor(customOptions?: LLMonitorOptions) {
    const defaultOptions = {
      appId: checkEnv("LLMONITOR_API_URL"),
      // convoId: checkEnv("LL_CONVO_ID"),
      log: true,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com",
    }

    const options = { ...defaultOptions, ...customOptions }

    this.appId = options.appId
    this.logConsole = options.log
    this.apiUrl = options.apiUrl
    this.userId = options.userId
  }

  async trackEvent(type: EventType, data: Partial<Event> = {}) {
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

  agentStart(data: { name?: string; input: any; agentRunId: string }) {
    this.trackEvent("agent", {
      event: "start",
      ...data,
    })
  }

  agentEnd(data: { output: any; agentRunId: string }) {
    this.trackEvent("agent", {
      event: "end",
      ...data,
    })
  }

  agentError(data: { error: any; agentRunId: string }) {
    this.trackEvent("agent", {
      event: "error",
      ...data,
      error: cleanError(data.error),
    })
  }

  llmStart(data: { runId: string; input: LLMessage; extra: any }) {
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
    output: LLMessage
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
      error: cleanError(data.error),
    })
  }

  toolStart(data: { toolRunId: string; name?: string; input?: any }) {
    this.trackEvent("tool", {
      event: "start",
      ...data,
    })
  }

  toolEnd(data: { toolRunId: string; output?: any }) {
    this.trackEvent("tool", {
      event: "end",
      ...data,
    })
  }

  toolError(data: { toolRunId: string; error: any }) {
    this.trackEvent("tool", {
      event: "error",
      ...data,
      error: cleanError(data.error),
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

  // Extends Langchain's LLM classes like ChatOpenAI
  // TODO: test with non-chat classes see if it works (should if it supports callbacks)
  extendModel(baseClass: any) {
    // TODO: get model vendor from (lc_namespace: [ "langchain", "chat_models", "openai" ])

    const monitor = this

    return class extends baseClass {
      constructor(...args: any[]) {
        const interestingArgs = LANGCHAIN_ARGS_TO_REPORT.reduce((acc, arg) => {
          if (args[0][arg]) acc[arg] = args[0][arg]
          return acc
        }, {} as Record<string, unknown>)

        args[0].callbacks = [
          new LLMonitorCallbackHandler(monitor, interestingArgs),
        ]
        super(...args)
      }
    }
  }
}

export default LLMonitor
