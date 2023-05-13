import { getDefaultAppId, messageAdapter } from "./utils"
import { LLMonitorOptions, LLMOutput, LLMInput } from "./types"

class LLMonitor {
  appId: string
  convoId: string
  convoType: string | undefined
  apiUrl: string

  /**
   * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
   * @param {string} convoId - Tie to an existing conversation ID
   * @param {string} convoType - Add a label to the conversation
   * @param {string} apiUrl - Custom tracking URL if you are self-hosting
   * @constructor
   * @example
   * const monitor = new LLMonitor({
   *   appId: "00000000-0000-0000-0000-000000000000",
   *   convoId: "my-convo-id",
   *   convoType: "my-convo-type",
   *   apiUrl: "https://app.llmonitor.com/api"
   * })
   */

  constructor(options: LLMonitorOptions) {
    this.appId = options.appId || getDefaultAppId()
    this.convoId = options.convoId || crypto.randomUUID()
    this.convoType = options.convoType
    this.apiUrl = options.apiUrl || "https://app.llmonitor.com/api"
  }

  private async trackEvent(type: string, data: any = {}) {
    const eventData = {
      type,
      app: this.appId,
      convo: this.convoId,
      timestamp: new Date().toISOString(),
      ...data,
    }

    if (this.convoType) {
      eventData.convoType = this.convoType
    }

    // fetch
    await fetch(`${this.apiUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event: eventData }),
    })
  }

  get id() {
    return this.convoId
  }

  call(prompt: LLMInput) {
    const { message, chat } = messageAdapter(prompt)

    this.trackEvent("LLM_CALL", { message, chat })
  }

  intermediateResult(answer: LLMOutput) {
    const { message } = messageAdapter(answer)
    this.trackEvent("LLM_RESULT", { message, intermediate: true })
  }

  finalResult(answer: LLMOutput) {
    const { message } = messageAdapter(answer)
    this.trackEvent("LLM_RESULT", { message, intermediate: false })
  }

  /* Alias final result for simple use cases */
  result(answer: LLMOutput) {
    this.finalResult(answer)
  }

  log(message: string) {
    this.trackEvent("LOG", { message })
  }

  streamingStarts() {
    this.trackEvent("STREAMING_START")
  }

  userUpvotes() {
    this.trackEvent("FEEDBACK", { message: "GOOD" })
  }

  userDownvotes() {
    this.trackEvent("FEEDBACK", { message: "BAD" })
  }

  error(message: string | any, error: any) {
    // Allow error obj to be the first argument
    if (typeof message === "object") {
      error = message
      message = undefined
    }

    this.trackEvent("ERROR", { message, error })
  }
}

export default LLMonitor
