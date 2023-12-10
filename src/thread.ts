import Lunary from "./lunary"
import { cJSON } from "./types"

/*
 * Flow:
 * - const thread = monitor.startThread()
 * - const message = thread.userMessage(string)
 * - message.botAnswer(string)
 * - message.feedback(string)
 */

type Message = {
  id?: string
  role: "user" | "assistant" | "tool" | "system"
  content?: string | null
  isRetry?: boolean
  tags?: string[]
  extra?: cJSON
  feedback?: cJSON
}

export class Thread {
  public id: string

  private monitor: Lunary
  private started: boolean
  private tags: string[]

  constructor(
    monitor: Lunary,
    options: {
      id?: string
      started?: boolean
      tags?: string[]
    }
  ) {
    this.monitor = monitor
    this.id = options?.id || crypto.randomUUID()
    this.started = options?.started || false
    if (options?.tags) this.tags = options?.tags
  }

  /*
   * Track a new message from the user
   *
   * @param {Message} message - The message to track
   * @returns {string} - The message ID, to reconcile with feedback and backend LLM calls
   * */

  trackMessage = (message: Message) => {
    const runId = message.id ?? crypto.randomUUID()

    // thread.chat is a special event
    // the backend will reconcile the messages
    this.monitor.trackEvent("thread", "chat", {
      runId,
      parentRunId: this.id,
      threadTags: this.tags,
      feedback: message.feedback,
      message,
    })

    return runId
  }

  /*
   * Track a new message from the user
   *
   * @deprecated Use trackMessage instead
   *
   * @param {string} text - The user message
   * @param {cJSON} props - Extra properties to send with the message
   * @param {string} customId - Set a custom ID for the message
   * @returns {string} - The message ID, to reconcile with the bot's reply
   * */

  trackUserMessage = (text: string, props?: cJSON, customId?: string) => {
    const runId = customId ?? crypto.randomUUID()

    if (!this.started) {
      // first open the thread
      this.monitor.trackEvent("thread", "start", {
        runId: this.id,
        input: text,
      })

      this.started = true
    }

    this.monitor.trackEvent("chat", "start", {
      runId,
      input: text,
      parentRunId: this.id,
      extra: props,
    })

    return runId
  }

  /*
   * Track a new message from the bot
   *
   * @deprecated Use trackMessage instead
   *
   * @param {string} replyToId - The message ID to reply to
   * @param {string} text - The bot message
   * @param {cJSON} props - Extra properties to send with the message
   * */

  trackBotMessage = (replyToId: string, text: string, props?: cJSON) => {
    this.monitor.trackEvent("chat", "end", {
      runId: replyToId,
      output: text,
      extra: props,
    })
  }
}
