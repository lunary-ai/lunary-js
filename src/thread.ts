import LLMonitor from "./llmonitor"
import { cJSON } from "./types"

/*
 * Flow:
 * - const thread = monitor.startThread()
 * - const message = thread.userMessage(string)
 * - message.botAnswer(string)
 * - message.feedback(string)
 */

export class Thread {
  public id: string

  private monitor: LLMonitor
  private started: boolean

  constructor(monitor: LLMonitor, id?: string, started?: boolean) {
    this.monitor = monitor
    this.id = id || crypto.randomUUID()
    this.started = started || false
  }

  /*
   * Track a new message from the user
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

      this.monitor.trackEvent("chat", "start", {
        runId,
        input: text,
        parentRunId: this.id,
        extra: props,
      })

      this.started = true
    } else {
      this.monitor.trackEvent("chat", "start", {
        runId,
        input: text,
        parentRunId: this.id,
        extra: props,
      })
    }

    return runId
  }

  /*
   * Track a new message from the bot
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
