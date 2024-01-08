var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

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
var compileTemplate = /* @__PURE__ */ __name((content, variables) => {
  const regex = /{{(.*?)}}/g;
  return content.replace(regex, (_, g1) => variables[g1] || "");
}, "compileTemplate");
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
  userId;
  userProps;
  constructor(monitor, options) {
    this.monitor = monitor;
    this.id = options?.id || crypto.randomUUID();
    this.started = options?.started || false;
    if (options?.tags)
      this.tags = options?.tags;
    if (options?.userId)
      this.userId = options?.userId;
    if (options?.userProps)
      this.userProps = options?.userProps;
  }
  /**
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
      userId: this.userId,
      userProps: this.userProps,
      feedback: message.feedback,
      message
    });
    return runId;
  };
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
  /**
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
  templateCache = {};
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
   * @param {Partial<RunEvent>} data - The data associated with the event.
   * @example
   * monitor.trackEvent("llm", "start", { name: "gpt-4", input: "Hello I'm a bot" });
   */
  trackEvent(type, event, data) {
    if (!this.appId)
      return console.warn(
        "Lunary: Project tracking ID not set. Not reporting anything. Get one on the dashboard: https://app.lunary.ai"
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
      ...cleanExtra(data)
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
        console.log(`Lunary: Sending events now to ${this.apiUrl}`);
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
  /**
   * Get a dataset's runs from the API.
   * @param {string} datasetSlug - The slug of the dataset to get.
   * @returns {Promise<Run[]>} The dataset's runs.
   */
  getDataset = async (datasetId) => {
    try {
      const response = await fetch(
        `${this.apiUrl}/v1/projects/${this.appId}/datasets/${datasetId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      const data = await response.json();
      return data.runs;
    } catch (e) {
      throw new Error(
        `Lunary: Error fetching dataset: you must be on the Unlimited or Enterprise plan to use this feature.`
      );
    }
  };
  /**
   * Get a raw template's data from the API.
   * @param {string} slug - The slug of the template to get.
   * @returns {Promise<RawTemplate>} The template data.
   * @example
   * const template = await lunary.getRawTemplate("welcome")
   * console.log(template)
   */
  getRawTemplate = async (slug) => {
    const cacheEntry = this.templateCache[slug];
    const now = Date.now();
    if (cacheEntry && now - cacheEntry.timestamp < 6e4) {
      return cacheEntry.data;
    }
    const response = await fetch(
      `${this.apiUrl}/api/v1/template?slug=${slug}&app_id=${this.appId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    if (!response.ok) {
      throw new Error(
        `Lunary: Error fetching template: ${response.statusText || response.status} - ${await response.text()}`
      );
    }
    const data = await response.json();
    this.templateCache[slug] = { timestamp: now, data };
    return data;
  };
  /**
   * Render a template with the given data in the OpenAI completion format.
   * @param {string} slug - The slug of the template to render.
   * @param {any} data - The data to pass to the template.
   * @returns {Promise<Template>} The rendered template.
   * @example
   * const template = await lunary.renderTemplate("welcome", { name: "John" })
   * console.log(template)
   */
  renderTemplate = async (slug, data) => {
    const { id: templateId, content, extra } = await this.getRawTemplate(slug);
    const textMode = typeof content === "string";
    try {
      const rendered = textMode ? compileTemplate(content, data) : content.map((t) => ({
        ...t,
        content: compileTemplate(t.content, data)
      }));
      return {
        ...extra,
        [textMode ? "prompt" : "messages"]: rendered,
        templateId
      };
    } catch (error) {
      throw new Error(`Error rendering template ${slug} - ` + error.message);
    }
  };
  /**
   * Attach feedback to a message or run directly.
   * @param {string} runId - The ID of the message or the run.
   * @param {cJSON} feedback - The feedback to attach.
   * @example
   * monitor.trackFeedback("some-id", { thumbs: "up" });
   **/
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
   * @deprecated Use openThread() instead
   */
  startThread(id) {
    return new Thread(this, { id });
  }
  /**
   * @deprecated Use openThread() instead
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
  __commonJS,
  __toESM,
  cleanError,
  cleanExtra,
  getFunctionInput,
  lunary_default
};
