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

// src/index.ts
var LLMonitor = class {
  appId;
  convoId;
  convoTags;
  apiUrl;
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
  constructor(options) {
    this.appId = options.appId || checkEnv("LLMONITOR_APP_ID");
    this.convoId = options.convoId || crypto.randomUUID();
    this.convoTags = options.convoTags;
    this.apiUrl = options.apiUrl || checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com";
  }
  async trackEvent(type, data = {}) {
    const eventData = {
      type,
      app: this.appId,
      convo: this.convoId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      ...data
    };
    if (this.convoTags) {
      eventData.tags = Array.isArray(this.convoTags) ? this.convoTags : this.convoTags.split(",");
    }
    try {
      await fetch(`${this.apiUrl}/api/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: [eventData] })
      });
    } catch (error) {
      console.warn("Error sending event to LLMonitor", error);
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
   * Use this to log any external action or tool you use.
   * @param {string} message - Log message
   * @example
   * monitor.log("Running tool Google Search")
   **/
  log(message) {
    this.trackEvent("log", { message });
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
    this.trackEvent("user:feedback", { message: "GOOD" });
  }
  /**
   * Vote on the quality of the conversation.
   */
  userDownvotes() {
    this.trackEvent("user:feedback", { message: "BAD" });
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
      message = void 0;
    }
    this.trackEvent("error", { message, error });
  }
};
var src_default = LLMonitor;
export {
  src_default as default
};
