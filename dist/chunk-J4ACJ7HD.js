var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/utils.ts
var checkEnv = /* @__PURE__ */ __name((variable) => {
  if (typeof process !== "undefined" && process.env?.[variable]) {
    return process.env[variable];
  }
  if (typeof Deno !== "undefined" && Deno.env?.get(variable)) {
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
var Thread = class {
  static {
    __name(this, "Thread");
  }
  id;
  monitor;
  started;
  tags;
  constructor(monitor, options) {
    this.monitor = monitor;
    this.id = options?.id || crypto.randomUUID();
    this.started = options?.started || false;
    if (options?.tags)
      this.tags = options?.tags;
  }
  /*
   * Track a new message from the user
   *
   * @param {Message} message - The message to track
   * @returns {string} - The message ID, to reconcile with feedback and backend LLM calls
   * */
  trackMessage = (message) => {
    const runId = message.id ?? crypto.randomUUID();
    this.monitor.trackEvent("thread", "chat", {
      runId,
      parentRunId: this.id,
      threadTags: this.tags,
      feedback: message.feedback,
      message
    });
    return runId;
  };
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
  trackUserMessage = (text, props, customId) => {
    const runId = customId ?? crypto.randomUUID();
    if (!this.started) {
      this.monitor.trackEvent("thread", "start", {
        runId: this.id,
        input: text
      });
      this.started = true;
    }
    this.monitor.trackEvent("chat", "start", {
      runId,
      input: text,
      parentRunId: this.id,
      extra: props
    });
    return runId;
  };
  /*
   * Track a new message from the bot
   *
   * @deprecated Use trackMessage instead
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
    });
  };
};

// src/lunary.ts
var MAX_CHUNK_SIZE = 20;
var Lunary = class {
  static {
    __name(this, "Lunary");
  }
  appId;
  verbose;
  apiUrl;
  ctx;
  queue = [];
  queueRunning = false;
  /**
   * @param {LunaryOptions} options
   */
  constructor(ctx) {
    this.init({
      appId: checkEnv("LUNARY_APP_ID") || checkEnv("LLMONITOR_APP_ID"),
      apiUrl: checkEnv("LUNARY_API_URL") || checkEnv("LLMONITOR_API_URL") || "https://app.lunary.ai",
      verbose: false
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
        "Lunary: App ID not set. Not reporting anything. Get one on the dashboard: https://app.lunary.ai"
      );
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = data.parentRunId ?? this.ctx?.runId.tryUse();
    const user = this.ctx?.user?.tryUse();
    const userId = data.userId ?? user?.userId;
    let userProps = data.userProps ?? user?.userProps;
    if (userProps && !userId) {
      console.warn(
        "Lunary: userProps passed without userId. Ignoring userProps."
      );
      userProps = void 0;
    }
    const runtime = data.runtime ?? "lunary-js";
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
  debouncedProcessQueue = debounce(() => this.processQueue());
  async processQueue() {
    if (!this.queue.length || this.queueRunning)
      return;
    this.queueRunning = true;
    try {
      if (this.verbose)
        console.log("Lunary: Sending events now");
      const copy = this.queue.slice();
      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: copy })
      });
      if (this.verbose)
        console.log("Lunary: Events sent");
      this.queue = this.queue.slice(copy.length);
      this.queueRunning = false;
      if (this.queue.length)
        this.processQueue();
    } catch (error) {
      this.queueRunning = false;
      console.error("Error sending event(s) to Lunary", error);
    }
  }
  trackFeedback = (runId, feedback) => {
    if (!runId || typeof runId !== "string")
      return console.error("Lunary: No message ID provided to track feedback");
    if (typeof feedback !== "object")
      return console.error(
        "Lunary: Invalid feedback provided. Pass a valid object"
      );
    this.trackEvent(null, "feedback", {
      runId,
      extra: feedback
    });
  };
  /**
   * @deprecated Use openThread() instead
   */
  startChat(id) {
    return new Thread(this, { id });
  }
  /**
   * @deprecated Use startThread() instead
   */
  startThread(id) {
    return new Thread(this, { id });
  }
  /**
   * @deprecated Use resumeThread() instead
   */
  resumeThread(id) {
    return new Thread(this, { id, started: true });
  }
  openThread(params) {
    return new Thread(
      this,
      typeof params === "string" ? { id: params } : params
    );
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
      message = error.message ?? void 0;
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
};
var lunary_default = Lunary;

export {
  __name,
  cleanError,
  cleanExtra,
  getFunctionInput,
  lunary_default
};
