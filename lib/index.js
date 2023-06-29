// src/utils.ts
var checkEnv = (variable) => {
  if (typeof process !== "undefined" && process.env?.[variable]) {
    return process.env[variable];
  }
  if (typeof Deno !== "undefined" && Deno.env?.get(variable)) {
    return Deno.env.get(variable);
  }
  return void 0;
};
var formatLog = (event) => {
  const { type, message, extra, model } = event;
  return `[LLMonitor: ${type}] ${model ? `(${model})` : ""} ${message || ""} ${extra ? "\n" + JSON.stringify(extra, null, 2) : ""} `;
};
var messageAdapter = (variable) => {
  let message;
  let history;
  if (typeof variable === "string") {
    message = variable;
    history = void 0;
  } else if (Array.isArray(variable)) {
    const last = variable[variable.length - 1];
    message = last.text || last.content;
    history = variable;
  } else if (typeof variable === "object") {
    message = variable.text || variable.content;
    history = [variable];
  }
  return { message, history };
};
var debounce = (func, timeout = 50) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(void 0, args);
    }, timeout);
  };
};

// src/index.ts
var LLMonitor = class {
  appId;
  convoId;
  log;
  convoTags;
  apiUrl;
  queue = [];
  queueRunning = false;
  /**
   * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
   * @param {string} convoId - Tie to an existing conversation ID
   * @param {boolean} log - Log events to the console
   * @param {string | string[]} convoTags - Add a label to the conversation
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
  constructor(options) {
    this.appId = options.appId || checkEnv("LLMONITOR_APP_ID");
    this.convoId = options.convoId || crypto.randomUUID();
    this.log = options.log || false;
    this.convoTags = options.convoTags;
    this.apiUrl = options.apiUrl || checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com";
  }
  async trackEvent(type, data = {}) {
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const eventData = {
      type,
      app: this.appId,
      convo: this.convoId,
      timestamp,
      ...data
    };
    if (this.convoTags) {
      eventData.tags = Array.isArray(this.convoTags) ? this.convoTags : this.convoTags.split(",");
    }
    if (this.log) {
      console.log(formatLog(eventData));
    }
    this.queue.push(eventData);
    this.debouncedProcessQueue();
  }
  // Wait 50ms to allow other events to be added to the queue
  debouncedProcessQueue = debounce(() => this.processQueue());
  async processQueue() {
    if (!this.queue.length || this.queueRunning)
      return;
    this.queueRunning = true;
    try {
      const copy = this.queue.slice();
      const res = await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: copy })
      });
      this.queue = this.queue.slice(copy.length);
    } catch (error) {
      console.warn("Error sending event(s) to LLMonitor", error);
    }
    this.queueRunning = false;
    if (this.queue.length)
      this.processQueue();
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
    return this.convoId;
  }
  /**
   * Use this for higher accuracy as soon as the user sends a message.
   * @param {string} msg - User message
   **/
  userMessage(msg) {
    const { message } = messageAdapter(msg);
    this.trackEvent("user:message", { message });
  }
  /**
   * Use this just before calling a model
   * @param {string | ChatHistory} prompt - Prompt sent to the model
   **/
  call(prompt, model) {
    const { message, history } = messageAdapter(prompt);
    this.trackEvent("llm:call", { message, history, model });
  }
  /**
   * Use this when the model returns an answer.
   * @param {string | ChatHistory} answer - Answer returned by the model
   * @example
   * const answer = await model.generate("Hello")
   * monitor.result(answer)
   **/
  result(result) {
    const { message } = messageAdapter(result);
    this.trackEvent("llm:result", { message });
  }
  /**
   * Use this when the model returns the final answer you'll show to the user.
   * @param {string | ChatHistory} answer - Answer returned by the model
   * @example
   * const answer = await model.generate("Hello")
   * monitor.assistantAnswer(answer)
   **/
  assistantAnswer(answer) {
    const { message } = messageAdapter(answer);
    this.trackEvent("assistant:message", { message });
  }
  /**
   * Use this when you start streaming the model's output to the user.
   * Used to measure the time it takes for the model to generate the first response.
   */
  streamingStarts() {
    this.trackEvent("llm:stream");
  }
  /**
   * Vote on the quality of the conversation.
   */
  userUpvotes() {
    this.trackEvent("user:upvote");
  }
  /**
   * Vote on the quality of the conversation.
   */
  userDownvotes() {
    this.trackEvent("user:downvote");
  }
  /**
   * Use this to log any external action or tool you use.
   * @param {string} message - Log message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.info("Running tool Google Search")
   **/
  info(message, extra) {
    this.trackEvent("log:info", { message, extra });
  }
  /**
   * Use this to warn
   * @param {string} message - Warning message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.log("Running tool Google Search")
   **/
  warn(message, extra) {
    this.trackEvent("log:warn", { message, extra });
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
  error(message, error) {
    if (typeof message === "object") {
      error = message;
      message = error.message || void 0;
    }
    this.trackEvent("log:error", { message, extra: error });
  }
};
var src_default = LLMonitor;
export {
  src_default as default
};
