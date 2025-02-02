import Lunary from "./lunary"
import { cJSON } from "./types"
import { generateUUID } from "./utils"

/**
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
  private userId: string
  private userProps: cJSON

  constructor(
    monitor: Lunary,
    options: {
      id?: string
      started?: boolean
      tags?: string[]
      userId?: string
      userProps?: cJSON
    }
  ) {
    this.monitor = monitor
    this.id = options?.id || generateUUID()
    this.started = options?.started || false
    if (options?.tags) this.tags = options?.tags
    if (options?.userId) this.userId = options?.userId
    if (options?.userProps) this.userProps = options?.userProps
  }

  /**
   * Track a new message from the user
   *
   * @param {Message} message - The message to track
   * @returns {string} - The message ID, to reconcile with feedback and backend LLM calls
   * */

  trackMessage = (message: Message) => {
    const runId = message.id ?? generateUUID()

    // thread.chat is a special event
    // the backend will reconcile the messages
    this.monitor.trackEvent("thread", "chat", {
      runId,
      parentRunId: this.id,
      threadTags: this.tags,
      userId: this.userId,
      userProps: this.userProps,
      feedback: message.feedback,
      message,
    })

    return runId
  }

  /**
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
    const runId = customId ?? generateUUID()

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

  /**
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

  /**
   * Track a custom event in the thread
   *
   * @param {string} eventName - The name of the event
   * @param {cJSON} [metadata] - Optional metadata associated with the event
   */
  trackEvent = (eventName: string, metadata?: cJSON) => {
    this.monitor.trackEvent("thread", "custom-event", {
      name: eventName,
      runId: generateUUID(),
      userId: this.userId,
      userProps: this.userProps,
      parentRunId: this.id,
      metadata,
    })
  }
}
