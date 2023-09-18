import {
  __name,
  formatLog
} from "./chunk-NILRUNLS.js";

// src/browser.ts
var Conversation = class {
  static {
    __name(this, "Conversation");
  }
  monitor;
  convoId;
  started = false;
  constructor(monitor) {
    this.monitor = monitor;
    this.convoId = crypto.randomUUID();
  }
  /*
   * Track a new message from the user
   *
   * @param {string} text - The user message
   * @param {cJSON} props - Extra properties to send with the message
   * @param {string} customId - Set a custom ID for the message
   * @returns {string} - The message ID, to reconcile with the bot's reply
   * */
  trackUserMessage = (text, props, customId) => {
    const runId = customId ?? crypto.randomUUID();
    if (!this.started) {
      this.monitor.trackEvent("convo", "start", {
        runId: this.convoId,
        input: text
      }).then(() => {
        this.monitor.trackEvent("chat", "start", {
          runId,
          input: text,
          parentRunId: this.convoId,
          extra: props
        });
      });
      this.started = true;
    } else {
      this.monitor.trackEvent("chat", "start", {
        runId,
        input: text,
        parentRunId: this.convoId,
        extra: props
      });
    }
    return runId;
  };
  /*
   * Track a new message from the bot
   *
   * @param {string} replyToId - The message ID to reply to
   * @param {string} text - The bot message
   * @param {cJSON} props - Extra properties to send with the message
   * */
  trackBotMessage = (replyToId, text, props) => {
    this.monitor.trackEvent("chat", "end", {
      runId: replyToId,
      output: text,
      extra: props
    }).then(() => {
      this.monitor.trackEvent("convo", "end", {
        runId: this.convoId
      });
    });
  };
};
var LLMonitor = class {
  static {
    __name(this, "LLMonitor");
  }
  appId;
  verbose;
  apiUrl;
  userId;
  userProps;
  queue = [];
  queueRunning = false;
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {
    this.init({
      apiUrl: "https://app.llmonitor.com"
    });
  }
  init({ appId, verbose, apiUrl } = {}) {
    if (appId)
      this.appId = appId;
    if (verbose)
      this.verbose = verbose;
    if (apiUrl)
      this.apiUrl = apiUrl;
  }
  identify(userId, userProps) {
    this.userId = userId;
    this.userProps = userProps;
  }
  async trackEvent(type, event, data) {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      );
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const runtime = data.runtime ?? "llmonitor-browser";
    const eventData = {
      event,
      type,
      userId: this.userId,
      userProps: this.userProps,
      app: this.appId,
      timestamp,
      runtime,
      ...data
    };
    if (this.verbose) {
      console.log(formatLog(eventData));
    }
    this.queue.push(eventData);
    this.processQueue();
  }
  async processQueue() {
    if (!this.queue.length || this.queueRunning)
      return;
    this.queueRunning = true;
    try {
      const copy = this.queue.slice();
      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: copy })
      });
      this.queue = this.queue.slice(copy.length);
      this.queueRunning = false;
      if (this.queue.length)
        this.processQueue();
    } catch (error) {
      this.queueRunning = false;
      console.error("Error sending event(s) to LLMonitor", error);
    }
  }
  trackFeedback = (messageId, feedback) => {
    if (!messageId)
      return console.error(
        "LLMonitor: No message ID provided to track feedback"
      );
    if (typeof feedback !== "object")
      return console.error(
        "LLMonitor: Invalid feedback provided. Pass a valid object"
      );
    this.trackEvent("chat", "feedback", {
      runId: messageId,
      extra: feedback
    });
  };
  startChat() {
    return new Conversation(this);
  }
};
var llmonitor = new LLMonitor();
var browser_default = llmonitor;

export {
  Conversation,
  browser_default
};
