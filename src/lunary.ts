import { checkEnv, cleanError, debounce, formatLog } from "./utils"

import {
  Event,
  EventName,
  RunType,
  LunaryOptions,
  LogEvent,
  RunEvent,
  cJSON,
  Template,
} from "./types"

import { Thread } from "./thread"

import Mustache from "mustache"

const MAX_CHUNK_SIZE = 20

class Lunary {
  appId?: string
  verbose?: boolean
  apiUrl?: string
  ctx?: any

  private queue: any[] = []
  private queueRunning: boolean = false

  private templateCache: Record<string, { timestamp: number; data: any }> = {}

  /**
   * @param {LunaryOptions} options
   */
  constructor(ctx?) {
    this.init({
      appId: checkEnv("LUNARY_APP_ID") || checkEnv("LLMONITOR_APP_ID"),
      apiUrl:
        checkEnv("LUNARY_API_URL") ||
        checkEnv("LLMONITOR_API_URL") ||
        "https://app.lunary.ai",
      verbose: false,
    })

    this.ctx = ctx
  }

  init({ appId, verbose, apiUrl }: LunaryOptions = {}) {
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
        "Lunary: App ID not set. Not reporting anything. Get one on the dashboard: https://app.lunary.ai"
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
        "Lunary: userProps passed without userId. Ignoring userProps."
      )
      userProps = undefined
    }

    const runtime = data.runtime ?? "lunary-js"

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
      if (this.verbose)
        console.log(`Lunary: Sending events now to ${this.apiUrl}`)

      const copy = this.queue.slice()

      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: copy }),
      })

      if (this.verbose) console.log("Lunary: Events sent")

      // Clear the events we just sent (don't clear it all in case new events were added while sending)
      this.queue = this.queue.slice(copy.length)

      this.queueRunning = false

      // If there are new events in the queue
      if (this.queue.length) this.processQueue()
    } catch (error) {
      this.queueRunning = false
      console.error("Error sending event(s) to Lunary", error)
    }
  }

  /**
   * Get a raw template's data from the API.
   * @param {string} slug - The slug of the template to get.
   * @returns {Promise<RawTemplate>} The template data.
   * @example
   * const template = await lunary.getRawTemplate("welcome")
   * console.log(template)
   */
  getRawTemplate = async (slug: string) => {
    const cacheEntry = this.templateCache[slug]
    const now = Date.now()

    if (cacheEntry && now - cacheEntry.timestamp < 60000) {
      return cacheEntry.data
    }

    const response = await fetch(
      `${this.apiUrl}/api/v1/template?slug=${slug}&app_id=${this.appId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error(
        `Lunary: Error fetching template: ${
          response.statusText || response.status
        } - ${await response.text()}`
      )
    }

    const data = await response.json()
    this.templateCache[slug] = { timestamp: now, data }
    return data
  }

  /**
   * Render a template with the given data in the OpenAI completion format.
   * @param {string} slug - The slug of the template to render.
   * @param {any} data - The data to pass to the template.
   * @returns {Promise<Template>} The rendered template.
   * @example
   * const template = await lunary.renderTemplate("welcome", { name: "John" })
   * console.log(template)
   */
  renderTemplate = async (slug: string, data?: any): Promise<Template> => {
    const { id: templateId, content, extra } = await this.getRawTemplate(slug)

    const textMode = typeof content === "string"

    try {
      const rendered = textMode
        ? Mustache.render(content, data)
        : content.map((t) => ({
            ...t,
            content: Mustache.render(t.content, data),
          }))

      return {
        ...extra,
        [textMode ? "text" : "messages"]: rendered,
        templateId,
      }
    } catch (error) {
      throw new Error(`Error rendering template ${slug} - ` + error.message)
    }
  }

  /**
   * Attach feedback to a run.
   * @param {string} runId - The ID of the run.
   * @param {cJSON} feedback - The feedback to attach.
   * @example
   * monitor.trackFeedback("some-run-id", { thumbs: "up" });
   **/
  trackFeedback = (runId: string, feedback: cJSON) => {
    if (!runId || typeof runId !== "string")
      return console.error("Lunary: No message ID provided to track feedback")

    if (typeof feedback !== "object")
      return console.error(
        "Lunary: Invalid feedback provided. Pass a valid object"
      )

    this.trackEvent(null, "feedback", {
      runId,
      extra: feedback,
    })
  }

  /**
   * @deprecated Use openThread() instead
   */
  startChat(id?: string) {
    return new Thread(this, { id })
  }

  /**
   * @deprecated Use openThread() instead
   */
  startThread(id?: string) {
    return new Thread(this, { id })
  }

  /**
   * @deprecated Use resumeThread() instead
   */
  resumeThread(id: string) {
    return new Thread(this, { id, started: true })
  }

  openThread(params?: string | { id?: string; tags?: string[] }) {
    return new Thread(
      this,
      typeof params === "string" ? { id: params } : params
    )
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

export default Lunary
