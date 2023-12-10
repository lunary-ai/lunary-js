import Lunary from "./lunary"
import { RunEvent, cJSON } from "./types"

/*
 * Flow:
 * - const thread = monitor.startThread()
 * - const message = thread.userMessage(string)
 * - message.botAnswer(string)
 * - message.feedback(string)
 */

// Annex 1: Logic for reconciliation

// if previousRun and not retry_of
//     if this is bot message, then append to previous output's array

//     if this is user message:
//         if previous run output has bot then create new run and add to input array
//         if previous run is user and this is user, then append to previous input array

// else if retry_of
//     change ID of existingRun, set retry_of to previousRun, clear output, and:
//        if bot message: set output with message
//        if user message: replace input with message

// else
//     create new run with either input or output depending on role

type Message = {
  id?: string
  role: "user" | "assistant" | "tool" | "system"
  content?: string | null
  isRetry?: boolean
  extra?: cJSON
  feedback?: cJSON
}

export class Thread {
  public id: string

  private monitor: Lunary
  private started: boolean

  constructor(monitor: Lunary, id?: string, started?: boolean) {
    this.monitor = monitor
    this.id = id || crypto.randomUUID()
    this.started = started || false
  }

  /*
   * Track a new message from the user
   *
   * @param {Message} message - The message to track
   * @returns {string} - The message ID, to reconcile with feedback and backend LLM calls
   * */

  trackMessage = (message: Message) => {
    const runId = message.id ?? crypto.randomUUID()

    this.monitor.trackEvent("thread", "chat", {
      runId,
      parentRunId: this.id,
      message,
    })

    return runId
  }

  // trackMessage = (message: Message, isRetry = false) => {
  // const runId = message.id ?? crypto.randomUUID()

  // TODO: do this server-side
  // if (!this.started) {
  //   this.monitor.trackEvent("thread", "start", {
  //     runId: this.id,
  //     input: message.content,
  //   })

  //   this.started = true
  // }

  // const closeRun = message.role === "assistant"

  // const event = closeRun ? "end" : "start"

  // const data = {
  //   runId,
  //   input: {
  //     role: message.role,
  //     text: message.text,
  //     extra: message.extra,
  //   },
  //   parentRunId: this.id,
  //   feedback: message.feedback,
  // }

  // this.monitor.trackEvent("chat", event, data)

  // this.lastMessage = closeRun ? null : message

  // return runId
  // }

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
