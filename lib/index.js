var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

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
  console.log(JSON.stringify(event, null, 2));
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
var getArgumentNames = /* @__PURE__ */ __name((func) => {
  const funcString = func.toString().replace(/[\r\n\s]+/g, " ");
  const result = funcString.slice(funcString.indexOf("(") + 1, funcString.indexOf(")")).match(/([^\s,]+)/g);
  if (result === null)
    return [];
  else
    return result;
}, "getArgumentNames");
var getFunctionInput = /* @__PURE__ */ __name((func, args) => {
  const argNames = getArgumentNames(func);
  const input = argNames.length === 1 ? args[0] : argNames.reduce((obj, argName, index) => {
    obj[argName] = args[index];
    return obj;
  }, {});
  return input;
}, "getFunctionInput");
var parseLangchainMessages = /* @__PURE__ */ __name((input) => {
  const parseRole = /* @__PURE__ */ __name((id) => {
    const roleHint = id[id.length - 1];
    if (roleHint.includes("Human"))
      return "user";
    if (roleHint.includes("System"))
      return "system";
    if (roleHint.includes("AI"))
      return "ai";
    if (roleHint.includes("Function"))
      return "function";
  }, "parseRole");
  const parseMessage = /* @__PURE__ */ __name((raw) => {
    if (typeof raw === "string")
      return raw;
    if (raw.message)
      return parseMessage(raw.message);
    const message = JSON.parse(JSON.stringify(raw));
    try {
      const role = parseRole(message.id);
      const obj = message.kwargs;
      const text = message.text ?? obj.content;
      const kwargs = obj.additionalKwargs;
      return {
        role,
        text,
        ...kwargs
      };
    } catch (e) {
      return message.text ?? message;
    }
  }, "parseMessage");
  if (Array.isArray(input)) {
    return input.length === 1 ? parseLangchainMessages(input[0]) : input.map(parseMessage);
  }
  return parseMessage(input);
}, "parseLangchainMessages");
var parseOpenaiMessage = /* @__PURE__ */ __name((message) => {
  if (!message)
    return void 0;
  const { role, content, name, function_call } = message;
  return {
    role: role.replace("assistant", "ai"),
    text: content,
    function_call
  };
}, "parseOpenaiMessage");

// src/langchain.ts
function monitorLangchainLLM(baseClass, llmonitor, tags) {
  const originalGenerate = baseClass.prototype.generate;
  baseClass.prototype.generate = async function(...args) {
    const chat = this;
    const boundSuperGenerate = originalGenerate.bind(chat);
    const rawExtra = {
      temperature: chat.temperature,
      maxTokens: chat.maxTokens,
      frequencyPenalty: chat.frequencyPenalty,
      presencePenalty: chat.presencePenalty,
      stop: chat.stop,
      timeout: chat.timeout,
      modelKwargs: Object.keys(chat.modelKwargs || {}).length ? chat.modelKwargs : void 0
    };
    const extra = cleanExtra(rawExtra);
    const name = chat.modelName || chat.model;
    return llmonitor.wrapModel(boundSuperGenerate, {
      name,
      inputParser: (messages) => parseLangchainMessages(messages),
      // Input message will be the first argument
      outputParser: ({ generations }) => parseLangchainMessages(generations),
      tokensUsageParser: ({ llmOutput }) => ({
        completion: llmOutput?.tokenUsage?.completionTokens,
        prompt: llmOutput?.tokenUsage?.promptTokens
      }),
      extra,
      tags: tags || chat.tags
    })(...args);
  };
}
__name(monitorLangchainLLM, "monitorLangchainLLM");
function monitorLangchainTool(baseClass, llmonitor, tags) {
  const originalCall = baseClass.prototype.call;
  baseClass.prototype.call = async function(...args) {
    const boundSuperCall = originalCall.bind(this);
    return llmonitor.wrapTool(boundSuperCall, {
      name: this.name,
      inputParser: (arg) => arg[0] instanceof Object ? arg[0].input : arg,
      tags
    })(...args);
  };
}
__name(monitorLangchainTool, "monitorLangchainTool");

// src/openai.ts
function monitorOpenAi(baseClass, llmonitor, tags) {
  const originalCreateChatCompletion = baseClass.prototype.createChatCompletion;
  baseClass.prototype.createChatCompletion = async function(...args) {
    const boundCompletion = originalCreateChatCompletion.bind(this);
    return llmonitor.wrapModel(boundCompletion, {
      nameParser: (request) => request.model,
      inputParser: (request) => request.messages.map(parseOpenaiMessage),
      extraParser: (request) => {
        const rawExtra = {
          temperature: request.temperature,
          maxTokens: request.max_tokens,
          frequencyPenalty: request.frequency_penalty,
          presencePenalty: request.presence_penalty,
          stop: request.stop
        };
        return cleanExtra(rawExtra);
      },
      outputParser: ({ data }) => parseOpenaiMessage(data.choices[0].message),
      tokensUsageParser: ({ data }) => ({
        completion: data.usage?.completion_tokens,
        prompt: data.usage?.prompt_tokens
      }),
      tags
    })(...args);
  };
}
__name(monitorOpenAi, "monitorOpenAi");

// node_modules/.pnpm/unctx@2.3.1/node_modules/unctx/dist/index.mjs
function createContext(opts = {}) {
  let currentInstance;
  let isSingleton = false;
  const checkConflict = /* @__PURE__ */ __name((instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  }, "checkConflict");
  let als;
  if (opts.asyncContext) {
    const _AsyncLocalStorage = opts.AsyncLocalStorage || globalThis.AsyncLocalStorage;
    if (_AsyncLocalStorage) {
      als = new _AsyncLocalStorage();
    } else {
      console.warn("[unctx] `AsyncLocalStorage` is not provided.");
    }
  }
  const _getCurrentInstance = /* @__PURE__ */ __name(() => {
    if (als && currentInstance === void 0) {
      const instance = als.getStore();
      if (instance !== void 0) {
        return instance;
      }
    }
    return currentInstance;
  }, "_getCurrentInstance");
  return {
    use: () => {
      const _instance = _getCurrentInstance();
      if (_instance === void 0) {
        throw new Error("Context is not available");
      }
      return _instance;
    },
    tryUse: () => {
      return _getCurrentInstance();
    },
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = void 0;
      isSingleton = false;
    },
    call: (instance, callback) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return als ? als.run(instance, callback) : callback();
      } finally {
        if (!isSingleton) {
          currentInstance = void 0;
        }
      }
    },
    async callAsync(instance, callback) {
      currentInstance = instance;
      const onRestore = /* @__PURE__ */ __name(() => {
        currentInstance = instance;
      }, "onRestore");
      const onLeave = /* @__PURE__ */ __name(() => currentInstance === instance ? onRestore : void 0, "onLeave");
      asyncHandlers.add(onLeave);
      try {
        const r = als ? als.run(instance, callback) : callback();
        if (!isSingleton) {
          currentInstance = void 0;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
__name(createContext, "createContext");
function createNamespace(defaultOpts = {}) {
  const contexts = {};
  return {
    get(key, opts = {}) {
      if (!contexts[key]) {
        contexts[key] = createContext({ ...defaultOpts, ...opts });
      }
      contexts[key];
      return contexts[key];
    }
  };
}
__name(createNamespace, "createNamespace");
var _globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : typeof window !== "undefined" ? window : {};
var globalKey = "__unctx__";
var defaultNamespace = _globalThis[globalKey] || (_globalThis[globalKey] = createNamespace());
var asyncHandlersKey = "__unctx_async_handlers__";
var asyncHandlers = _globalThis[asyncHandlersKey] || (_globalThis[asyncHandlersKey] = /* @__PURE__ */ new Set());

// src/context.ts
import { AsyncLocalStorage } from "node:async_hooks";
var ctx = createContext({
  asyncContext: true,
  AsyncLocalStorage
});
var context_default = ctx;

// src/llmonitor.ts
var LLMonitor = class {
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {
    __publicField(this, "appId");
    __publicField(this, "logConsole");
    __publicField(this, "apiUrl");
    __publicField(this, "userId");
    __publicField(this, "userProps");
    __publicField(this, "queue", []);
    __publicField(this, "queueRunning", false);
    // Wait 500ms to allow other events to be added to the queue
    __publicField(this, "debouncedProcessQueue", debounce(() => this.processQueue()));
    this.load({
      appId: checkEnv("LLMONITOR_APP_ID"),
      log: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com"
    });
  }
  load({ appId, log, apiUrl, userId, userProps } = {}) {
    if (appId)
      this.appId = appId;
    if (log)
      this.logConsole = log;
    if (apiUrl)
      this.apiUrl = apiUrl;
    if (userId)
      this.userId = userId;
    if (userProps)
      this.userProps = userProps;
  }
  /**
   * Identify the user (optional)
   * @param {string} userId - User ID
   * @param {cJSON} userProps - User properties object
   */
  identify(userId, userProps) {
    this.userId = userId;
    this.userProps = userProps;
  }
  /**
   * Attach LLMonitor to an entity (Langchain Chat/LLM/Tool classes, OpenAI class)
   * @param {EntityToMonitor | [EntityToMonitor]} entities - Entity or array of entities to monitor
   * @param {string[]} tags - (optinal) Tags to add to all events
   * @example
   * const chat = new ChatOpenAI({
   *   modelName: "gpt-3.5-turbo",
   * })
   * monitor.attach(chat)
   */
  attach(entities, { tags } = {}) {
    const llmonitor = this;
    entities = Array.isArray(entities) ? entities : [entities];
    entities.forEach((entity) => {
      const entityName = entity.name;
      const parentName = Object.getPrototypeOf(entity).name;
      if (entityName === "OpenAIApi") {
        monitorOpenAi(entity, llmonitor, tags);
      }
      if (parentName === "BaseChatModel") {
        monitorLangchainLLM(entity, llmonitor, tags);
      }
      if (parentName === "Tool" || parentName === "StructuredTool") {
        monitorLangchainTool(entity, llmonitor, tags);
      }
    });
  }
  async trackEvent(type, event, data) {
    if (!this.appId)
      return console.error("LLMonitor: App ID not set. Not reporting anything.");
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = context_default.tryUse();
    const eventData = {
      event,
      type,
      userId: this.userId,
      userProps: this.userProps,
      app: this.appId,
      parentRunId,
      timestamp,
      ...data
    };
    if (this.logConsole) {
      console.log(formatLog(eventData));
    }
    this.queue.push(eventData);
    this.debouncedProcessQueue();
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
    } catch (error) {
      console.warn("Error sending event(s) to LLMonitor", error);
    }
    this.queueRunning = false;
    if (this.queue.length)
      this.processQueue();
  }
  /**
   * Wrap a Promise to track it's input, results and any errors.
   * @param {EventType} type - Event type
   * @param {Promise} func - Agent function
   * @param {WrapParams} params - Wrap params
   * @returns {Promise} - Wrapped promise
   */
  wrap(type, func, params) {
    return async (...args) => {
      const runId = crypto.randomUUID();
      const name = params?.nameParser ? params.nameParser(...args) : params?.name ?? func.name;
      const { inputParser, outputParser, tokensUsageParser, extra, tags } = params || {};
      const extraData = params?.extraParser ? params.extraParser(...args) : extra;
      const input = inputParser ? (
        //  @ts-ignore TODO: fix this TS error
        inputParser(...args)
      ) : getFunctionInput(func, args);
      this.trackEvent(type, "start", {
        runId,
        input,
        name,
        extra: extraData,
        tags
      });
      try {
        const output = await context_default.callAsync(runId, async () => {
          return func(...args);
        });
        const tokensUsage = tokensUsageParser ? tokensUsageParser(output) : void 0;
        this.trackEvent(type, "end", {
          runId,
          output: outputParser ? outputParser(output) : output,
          tokensUsage
        });
        return output;
      } catch (error) {
        this.trackEvent(type, "error", {
          runId,
          error: cleanError(error)
        });
        await this.processQueue();
        throw error;
      }
    };
  }
  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapAgent(func, params) {
    return this.wrap("agent", func, params);
  }
  /**
   * Wrap an tool's Promise to track it's input, results and any errors.
   * @param {Promise} func - Tool function
   * @param {WrapParams} params - Wrap params
   */
  wrapTool(func, params) {
    return this.wrap("tool", func, params);
  }
  /**
   * Wrap an model's Promise to track it's input, results and any errors.
   * @param {Promise} func - Model generation function
   * @param {WrapParams} params - Wrap params
   */
  wrapModel(func, params) {
    return this.wrap("llm", func, params);
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
};
__name(LLMonitor, "LLMonitor");
var llmonitor_default = LLMonitor;

// src/index.ts
var monitor = new llmonitor_default();
var src_default = monitor;
export {
  llmonitor_default as LLMonitor,
  src_default as default
};
