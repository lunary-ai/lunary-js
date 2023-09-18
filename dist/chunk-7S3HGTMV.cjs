"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class; var _class2;


var _chunkM3TFISX5cjs = require('./chunk-M3TFISX5.cjs');

// src/browser.ts
var Conversation = (_class = class {
  static {
    _chunkM3TFISX5cjs.__name.call(void 0, this, "Conversation");
  }
  
  
  __init() {this.started = false}
  constructor(monitor) {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);
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
  __init2() {this.trackUserMessage = (text, props, customId) => {
    const runId = _nullishCoalesce(customId, () => ( crypto.randomUUID()));
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
  }}
  /*
   * Track a new message from the bot
   *
   * @param {string} replyToId - The message ID to reply to
   * @param {string} text - The bot message
   * @param {cJSON} props - Extra properties to send with the message
   * */
  __init3() {this.trackBotMessage = (replyToId, text, props) => {
    this.monitor.trackEvent("chat", "end", {
      runId: replyToId,
      output: text,
      extra: props
    }).then(() => {
      this.monitor.trackEvent("convo", "end", {
        runId: this.convoId
      });
    });
  }}
}, _class);
var LLMonitor = (_class2 = class {
  static {
    _chunkM3TFISX5cjs.__name.call(void 0, this, "LLMonitor");
  }
  
  
  
  
  
  __init4() {this.queue = []}
  __init5() {this.queueRunning = false}
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {;_class2.prototype.__init4.call(this);_class2.prototype.__init5.call(this);_class2.prototype.__init6.call(this);
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
    const lastEvent = _optionalChain([this, 'access', _ => _.queue, 'optionalAccess', _2 => _2[this.queue.length - 1]]);
    if (_optionalChain([lastEvent, 'optionalAccess', _3 => _3.timestamp]) >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const runtime = _nullishCoalesce(data.runtime, () => ( "llmonitor-browser"));
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
      console.log(_chunkM3TFISX5cjs.formatLog.call(void 0, eventData));
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
  __init6() {this.trackFeedback = (messageId, feedback) => {
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
  }}
  startChat() {
    return new Conversation(this);
  }
}, _class2);
var llmonitor = new LLMonitor();
var browser_default = llmonitor;




exports.Conversation = Conversation; exports.browser_default = browser_default;
