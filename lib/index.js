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
  return {
    role: message.role,
    text: message.content
  };
}, "parseOpenaiMessage");

// node_modules/unctx/dist/index.mjs
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

// src/langchain.ts
function monitorLangchainLLM(chat, llmonitor2, tags) {
  const originalGenerate = chat.generate;
  chat.generate = async function(messages, options, callbacks) {
    const runId = crypto.randomUUID();
    const input = parseLangchainMessages(messages);
    const { modelName: name } = chat;
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
    const event = { name, input, runId, extra, tags };
    try {
      llmonitor2.trackEvent("llm", "start", event);
      const rawOutput = await context_default.callAsync(
        runId,
        () => originalGenerate.apply(this, [messages, options, callbacks])
      );
      const output = parseLangchainMessages(rawOutput.generations);
      const tokensUsage = {
        completion: rawOutput.llmOutput?.tokenUsage?.completionTokens,
        prompt: rawOutput.llmOutput?.tokenUsage?.promptTokens
      };
      llmonitor2.trackEvent("llm", "end", { ...event, output, tokensUsage });
      return rawOutput;
    } catch (error) {
      llmonitor2.trackEvent("llm", "error", {
        runId,
        name,
        error: cleanError(error)
      });
      throw error;
    }
  };
}
__name(monitorLangchainLLM, "monitorLangchainLLM");

// src/openai.ts
function monitorOpenAi(openai, llmonitor2, tags) {
  const originalCreateChatCompletion = openai.createChatCompletion;
  openai.createChatCompletion = async function(request, options) {
    const runId = crypto.randomUUID();
    const input = request.messages.map(parseOpenaiMessage);
    const { model: name } = request;
    const rawExtra = {
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      frequencyPenalty: request.frequency_penalty,
      presencePenalty: request.presence_penalty,
      stop: request.stop
    };
    const extra = cleanExtra(rawExtra);
    const event = { name, input, runId, extra, tags };
    try {
      llmonitor2.trackEvent("llm", "start", event);
      const rawOutput = await context_default.callAsync(
        runId,
        () => originalCreateChatCompletion.apply(this, [request, options])
      );
      const { data } = rawOutput;
      const output = parseOpenaiMessage(data.choices[0].message);
      const tokensUsage = {
        completion: data.usage?.completion_tokens,
        prompt: data.usage?.prompt_tokens
      };
      llmonitor2.trackEvent("llm", "end", { ...event, output, tokensUsage });
      return rawOutput;
    } catch (error) {
      llmonitor2.trackEvent("llm", "error", {
        runId,
        name,
        error: cleanError(error)
      });
      throw error;
    }
  };
}
__name(monitorOpenAi, "monitorOpenAi");

// src/tool.ts
function monitorTool(tool, llmonitor2, tags) {
  const originalCall = tool.call;
  tool.call = /* @__PURE__ */ __name(async function call(arg, callbacks) {
    const runId = crypto.randomUUID();
    const input = arg instanceof Object ? arg.input : arg;
    const event = {
      name: tool.name,
      input,
      tags
    };
    try {
      llmonitor2.trackEvent("tool", "start", { ...event });
      const output = await context_default.callAsync(
        runId,
        () => originalCall.apply(this, [arg, callbacks])
      );
      llmonitor2.trackEvent("llm", "end", {
        ...event,
        output
      });
      return output;
    } catch (error) {
      llmonitor2.trackEvent("tool", "error", {
        runId,
        name: tool.name,
        error: cleanError(error)
      });
      throw error;
    }
  }, "call");
}
__name(monitorTool, "monitorTool");

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
  identify(userId, userProps) {
    this.userId = userId;
    this.userProps = userProps;
  }
  monitor(entities, { tags } = {}) {
    const llmonitor2 = this;
    entities = Array.isArray(entities) ? entities : [entities];
    entities.forEach((entity) => {
      if (entity.constructor.name === "OpenAIApi") {
        monitorOpenAi(entity, llmonitor2, tags);
        return;
      }
      if (Object.getPrototypeOf(Object.getPrototypeOf(entity.constructor)).name === "BaseLanguageModel") {
        monitorLangchainLLM(entity, llmonitor2, tags);
        return;
      }
      const parentName = Object.getPrototypeOf(
        Object.getPrototypeOf(entity.constructor)
      ).name;
      if (parentName === "Tool" || parentName === "StructuredTool") {
        monitorTool(entity, llmonitor2, tags);
        return;
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
   * @param {Promise} func - Agent/tool/model executor function
   */
  wrap(type, func, params) {
    return async (...args) => {
      const runId = crypto.randomUUID();
      const name = func.name;
      const { inputParser, outputParser, tokensUsageParser, extra, tags } = params || {};
      const input = inputParser ? inputParser(args) : getFunctionInput(func, args);
      this.trackEvent(type, "start", {
        runId,
        input,
        name,
        extra,
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
  /*
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   */
  wrapTool(func, params) {
    return this.wrap("tool", func, params);
  }
  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
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
  /**
   * Extends Langchain's LLM and Chat classes like OpenAI and ChatOpenAI
   * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
   * @param baseClass - Langchain's LLM class
   * @returns Extended class
   * @example
   * const MonitoredChat = monitor.langchain(ChatOpenAI)
   * const chat = new MonitoredChat({
   *  modelName: "gpt-4"
   * })
   */
  langchain(baseClass) {
    const monitor2 = this;
    return class extends baseClass {
      // Wrap the `generate` function instead of .call to get token usages information
      async generate(...args) {
        const boundSuperGenerate = super.generate.bind(this);
        const extra = {
          temperature: this.temperature,
          maxTokens: this.maxTokens,
          frequencyPenalty: this.frequencyPenalty,
          presencePenalty: this.presencePenalty,
          stop: this.stop,
          timeout: this.timeout,
          modelKwargs: Object.keys(this.modelKwargs).length ? this.modelKwargs : void 0
        };
        const extraCleaned = Object.fromEntries(
          Object.entries(extra).filter(([_, v]) => v != null)
        );
        const output = await monitor2.wrapModel(boundSuperGenerate, {
          name: this.modelName || this.model,
          //@ts-ignore
          inputParser: (args2) => parseLangchainMessages(args2[0]),
          // Input message will be the first argument
          outputParser: ({ generations }) => (
            //@ts-ignore
            parseLangchainMessages(generations)
          ),
          tokensUsageParser: ({ llmOutput }) => ({
            completion: llmOutput?.tokenUsage?.completionTokens,
            prompt: llmOutput?.tokenUsage?.promptTokens
          }),
          extra: extraCleaned,
          tags: this.tags
        })(...args);
        return output;
      }
    };
  }
};
__name(LLMonitor, "LLMonitor");
var llmonitor_default = LLMonitor;

// src/index.ts
var llmonitor = new llmonitor_default();
var monitor = llmonitor.monitor.bind(llmonitor);
var src_default = monitor;
export {
  src_default as default,
  llmonitor
};
