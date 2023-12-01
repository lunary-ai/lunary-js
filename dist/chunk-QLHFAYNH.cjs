"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class; var _class2;var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils.ts
var checkEnv = /* @__PURE__ */ __name((variable) => {
  if (typeof process !== "undefined" && _optionalChain([process, 'access', _2 => _2.env, 'optionalAccess', _3 => _3[variable]])) {
    return process.env[variable];
  }
  if (typeof Deno !== "undefined" && _optionalChain([Deno, 'access', _4 => _4.env, 'optionalAccess', _5 => _5.get, 'call', _6 => _6(variable)])) {
    return Deno.env.get(variable);
  }
  return void 0;
}, "checkEnv");
var formatLog = /* @__PURE__ */ __name((event) => {
  return JSON.stringify(event, null, 2);
}, "formatLog");
var debounce = /* @__PURE__ */ __name((func, timeout = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(void 0, args);
    }, timeout);
  };
}, "debounce");
var cleanError = /* @__PURE__ */ __name((error) => {
  if (typeof error === "string")
    return {
      message: error
    };
  else if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack
    };
  } else {
    error = new Error("Unknown error");
    return {
      message: error.message,
      stack: error.stack
    };
  }
}, "cleanError");
var cleanExtra = /* @__PURE__ */ __name((extra) => {
  return Object.fromEntries(Object.entries(extra).filter(([_, v]) => v != null));
}, "cleanExtra");
function getArgumentNames(func) {
  let str = func.toString();
  str = str.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/(.)*/g, "").replace(/{[\s\S]*}/, "").replace(/=>/g, "").trim();
  const start = str.indexOf("(") + 1;
  const end = str.length - 1;
  const result = str.substring(start, end).split(",").map((el) => el.trim());
  const params = [];
  result.forEach((element) => {
    element = element.replace(/=[\s\S]*/g, "").trim();
    if (element.length > 0)
      params.push(element);
  });
  return params;
}
__name(getArgumentNames, "getArgumentNames");
var getFunctionInput = /* @__PURE__ */ __name((func, args) => {
  const argNames = getArgumentNames(func);
  const input = argNames.length === 1 ? args[0] : argNames.reduce((obj, argName, index) => {
    obj[argName] = args[index];
    return obj;
  }, {});
  return input;
}, "getFunctionInput");

// src/thread.ts
var Thread = (_class = class {
  static {
    __name(this, "Thread");
  }
  
  
  
  constructor(monitor, id, started) {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);
    this.monitor = monitor;
    this.threadId = id || crypto.randomUUID();
    this.started = started || false;
  }
  /*
   * Track a new message from the user
   *
   * @param {string} text - The user message
   * @param {cJSON} props - Extra properties to send with the message
   * @param {string} customId - Set a custom ID for the message
   * @returns {string} - The message ID, to reconcile with the bot's reply
   * */
  __init() {this.trackUserMessage = (text, props, customId) => {
    const runId = _nullishCoalesce(customId, () => ( crypto.randomUUID()));
    if (!this.started) {
      this.monitor.trackEvent("thread", "start", {
        runId: this.threadId,
        input: text
      });
      this.monitor.trackEvent("chat", "start", {
        runId,
        input: text,
        parentRunId: this.threadId,
        extra: props
      });
      this.started = true;
    } else {
      this.monitor.trackEvent("chat", "start", {
        runId,
        input: text,
        parentRunId: this.threadId,
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
  __init2() {this.trackBotMessage = (replyToId, text, props) => {
    this.monitor.trackEvent("chat", "end", {
      runId: replyToId,
      output: text,
      extra: props
    });
  }}
}, _class);

// src/llmonitor.ts
var MAX_CHUNK_SIZE = 20;
var LLMonitor = (_class2 = class {
  static {
    __name(this, "LLMonitor");
  }
  
  
  
  
  __init3() {this.queue = []}
  __init4() {this.queueRunning = false}
  /**
   * @param {LLMonitorOptions} options
   */
  constructor(ctx) {;_class2.prototype.__init3.call(this);_class2.prototype.__init4.call(this);_class2.prototype.__init5.call(this);_class2.prototype.__init6.call(this);
    this.init({
      appId: checkEnv("LLMONITOR_APP_ID"),
      verbose: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com"
    });
    this.ctx = ctx;
  }
  init({ appId, verbose, apiUrl } = {}) {
    if (appId)
      this.appId = appId;
    if (verbose)
      this.verbose = verbose;
    if (apiUrl)
      this.apiUrl = apiUrl;
  }
  /**
   * Manually track a run event.
   * @param {RunType} type - The type of the run.
   * @param {EventName} event - The name of the event.
   * @param {Partial<RunEvent | LogEvent>} data - The data associated with the event.
   * @example
   * monitor.trackEvent("llm", "start", { name: "gpt-4", input: "Hello I'm a bot" });
   */
  trackEvent(type, event, data) {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      );
    let timestamp = Date.now();
    const lastEvent = _optionalChain([this, 'access', _7 => _7.queue, 'optionalAccess', _8 => _8[this.queue.length - 1]]);
    if (_optionalChain([lastEvent, 'optionalAccess', _9 => _9.timestamp]) >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = _nullishCoalesce(data.parentRunId, () => ( _optionalChain([this, 'access', _10 => _10.ctx, 'optionalAccess', _11 => _11.runId, 'access', _12 => _12.tryUse, 'call', _13 => _13()])));
    const user = _optionalChain([this, 'access', _14 => _14.ctx, 'optionalAccess', _15 => _15.user, 'optionalAccess', _16 => _16.tryUse, 'call', _17 => _17()]);
    const userId = _nullishCoalesce(data.userId, () => ( _optionalChain([user, 'optionalAccess', _18 => _18.userId])));
    let userProps = _nullishCoalesce(data.userProps, () => ( _optionalChain([user, 'optionalAccess', _19 => _19.userProps])));
    if (userProps && !userId) {
      console.warn(
        "LLMonitor: userProps passed without userId. Ignoring userProps."
      );
      userProps = void 0;
    }
    const runtime = _nullishCoalesce(data.runtime, () => ( "llmonitor-js"));
    const eventData = {
      event,
      type,
      userId,
      userProps,
      app: this.appId,
      parentRunId,
      timestamp,
      runtime,
      ...data
    };
    if (this.verbose) {
      console.log(formatLog(eventData));
    }
    this.queue.push(eventData);
    if (this.queue.length > MAX_CHUNK_SIZE) {
      this.processQueue();
    } else {
      this.debouncedProcessQueue();
    }
  }
  // Wait 500ms to allow other events to be added to the queue
  __init5() {this.debouncedProcessQueue = debounce(() => this.processQueue())}
  async processQueue() {
    if (!this.queue.length || this.queueRunning)
      return;
    this.queueRunning = true;
    try {
      if (this.verbose)
        console.log("LLMonitor: Sending events now");
      const copy = this.queue.slice();
      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: copy })
      });
      if (this.verbose)
        console.log("LLMonitor: Events sent");
      this.queue = this.queue.slice(copy.length);
      this.queueRunning = false;
      if (this.queue.length)
        this.processQueue();
    } catch (error) {
      this.queueRunning = false;
      console.error("Error sending event(s) to LLMonitor", error);
    }
  }
  __init6() {this.trackFeedback = (runId, feedback) => {
    if (!runId || typeof runId !== "string")
      return console.error(
        "LLMonitor: No message ID provided to track feedback"
      );
    if (typeof feedback !== "object")
      return console.error(
        "LLMonitor: Invalid feedback provided. Pass a valid object"
      );
    this.trackEvent(null, "feedback", {
      runId,
      extra: feedback
    });
  }}
  /**
   * @deprecated Use startThread() instead
   */
  startChat(id) {
    return new Thread(this, id);
  }
  startThread(id) {
    return new Thread(this, id);
  }
  resumeThread(id) {
    return new Thread(this, id, true);
  }
  /**
   * Use this to log any external action or tool you use.
   * @param {string} message - Log message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.info("Running tool Google Search")
   **/
  info(message, extra) {
    this.trackEvent("log", "info", {
      message,
      extra
    });
  }
  log(message, extra) {
    this.info(message, extra);
  }
  /**
   * Use this to warn
   * @param {string} message - Warning message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.log("Running tool Google Search")
   **/
  warn(message, extra) {
    this.trackEvent("log", "warn", {
      message,
      extra
    });
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
  error(message, error) {
    if (typeof message === "object") {
      error = message;
      message = _nullishCoalesce(error.message, () => ( void 0));
    }
    this.trackEvent("log", "error", {
      message,
      extra: cleanError(error)
    });
  }
  /**
   * Make sure the queue is flushed before exiting the program
   */
  async flush() {
    await this.processQueue();
  }
}, _class2);
var llmonitor_default = LLMonitor;







exports.__name = __name; exports.cleanError = cleanError; exports.cleanExtra = cleanExtra; exports.getFunctionInput = getFunctionInput; exports.llmonitor_default = llmonitor_default;
