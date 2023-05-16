import { checkEnv, messageAdapter } from "./utils"
import { LLMonitorOptions, LLMOutput, LLMInput } from "./types"

class LLMonitor {
  appId: string
  convoId: string
  convoTags: string | undefined
  apiUrl: string

  /**
   * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
   * @param {string} convoId - Tie to an existing conversation ID
   * @param {string} convoTags - Add a label to the conversation
   * @param {string} apiUrl - Custom tracking URL if you are self-hosting (can also be set with LLMONITOR_API_URL)
   * @constructor
   * @example
   * const monitor = new LLMonitor({
   *   appId: "00000000-0000-0000-0000-000000000000",
   *   convoId: "my-convo-id",
   *   convoTags: "home",
   *   apiUrl: "https://app.llmonitor.com/api"
   * })
   */

  constructor(options: LLMonitorOptions) {
    this.appId = options.appId || checkEnv("LLMONITOR_APP_ID")
    this.convoId = options.convoId || crypto.randomUUID()
    this.convoTags = options.convoTags
    this.apiUrl =
      options.apiUrl ||
      checkEnv("LLMONITOR_API_URL") ||
      "https://app.llmonitor.com"
  }

  private async trackEvent(type: string, data: any = {}) {
    const eventData = {
      type,
      app: this.appId,
      convo: this.convoId,
      timestamp: new Date().toISOString(),
      ...data,
    }

    if (this.convoTags) {
      eventData.tags = Array.isArray(this.convoTags)
        ? this.convoTags
        : this.convoTags.split(",")
    }

    try {
      // fetch
      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events: [eventData] }),
      })
    } catch (error) {
      console.warn("Error sending event to LLMonitor", error)
    }
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
  get id() {
    return this.convoId
  }

  /**
   * Use this for higher accuracy as soon as the user sends a message.
   * @param {string} msg - User message
   **/
  messageReceived(msg: LLMInput) {
    const { message } = messageAdapter(msg)

    this.trackEvent("PROMPT", { message })
  }

  /**
   * Use this just before calling a model
   * @param {string | ChatHistory} prompt - Prompt sent to the model
   **/
  call(prompt: LLMInput, model?: string) {
    const { message, history } = messageAdapter(prompt)

    this.trackEvent("CALL", { message, history, model })
  }

  /**
   * Use this when the model returns an answer, but the chain isn't complete yet.
   * @param {string | ChatHistory} answer - Answer returned by the model
   **/
  intermediateResult(answer: LLMOutput) {
    const { message } = messageAdapter(answer)
    this.trackEvent("RESULT", { message })
  }

  /**
   * Use this when the model returns the final answer you'll show to the user.
   * @param {string | ChatHistory} answer - Answer returned by the model
   * @example
   * const answer = await model.generate("Hello")
   * monitor.finalResult(answer)
   **/
  finalResult(answer: LLMOutput) {
    const { message } = messageAdapter(answer)
    this.trackEvent("ANSWER", { message })
  }

  /**
   * Use this when the model returns the final answer you'll show to the user.
   * @param {string | ChatHistory} answer - Answer returned by the model
   * @example
   * const answer = await model.generate("Hello")
   * monitor.result(answer)
   **/
  result(answer: LLMOutput) {
    this.finalResult(answer)
  }

  log(message: string) {
    this.trackEvent("LOG", { message })
  }

  /**
   * Use this when you start streaming the model's output to the user.
   * Used to measure the time it takes for the model to generate the first response.
   */
  streamingStarts() {
    this.trackEvent("STREAMING_START")
  }

  /**
   * Vote on the quality of the conversation.
   */
  userUpvotes() {
    this.trackEvent("FEEDBACK", { message: "GOOD" })
  }

  /**
   * Vote on the quality of the conversation.
   */
  userDownvotes() {
    this.trackEvent("FEEDBACK", { message: "BAD" })
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
      message = undefined
    }

    this.trackEvent("ERROR", { message, error })
  }
}

export default LLMonitor
