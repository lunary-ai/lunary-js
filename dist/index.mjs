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
  return JSON.stringify(event, null, 2);
};
var debounce = (func, timeout = 500) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(void 0, args);
    }, timeout);
  };
};
var cleanError = (error) => {
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
};
var cleanExtra = (extra) => {
  return Object.fromEntries(Object.entries(extra).filter(([_, v]) => v != null));
};
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
var getFunctionInput = (func, args) => {
  const argNames = getArgumentNames(func);
  const input = argNames.length === 1 ? args[0] : argNames.reduce((obj, argName, index) => {
    obj[argName] = args[index];
    return obj;
  }, {});
  return input;
};
var parseLangchainMessages = (input) => {
  const parseRole = (id) => {
    const roleHint = id[id.length - 1];
    if (roleHint.includes("Human"))
      return "user";
    if (roleHint.includes("System"))
      return "system";
    if (roleHint.includes("AI"))
      return "ai";
    if (roleHint.includes("Function"))
      return "function";
  };
  const parseMessage = (raw) => {
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
  };
  if (Array.isArray(input)) {
    return input.length === 1 ? parseLangchainMessages(input[0]) : input.map(parseMessage);
  }
  return parseMessage(input);
};
var parseOpenaiMessage = (message) => {
  if (!message)
    return void 0;
  const { role, content, name, function_call } = message;
  return {
    role: role.replace("assistant", "ai"),
    text: content,
    function_call
  };
};

// src/openai.ts
function monitorOpenAi(baseClass, llmonitor2, params) {
  const originalCreateChatCompletion = baseClass.prototype.createChatCompletion;
  Object.assign(baseClass.prototype, {
    createChatCompletion(...args) {
      const boundCompletion = originalCreateChatCompletion.bind(this);
      return llmonitor2.wrapModel(boundCompletion, {
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
        ...params
      })(...args);
    }
  });
}

// src/context.ts
import { createContext } from "unctx";
import { AsyncLocalStorage } from "node:async_hooks";
var runIdCtx = createContext({
  asyncContext: true,
  AsyncLocalStorage
});
var userCtx = createContext({
  asyncContext: true,
  AsyncLocalStorage
});

// src/chainable.ts
async function identify(userId, userProps) {
  const { target, next } = this;
  const context = {
    userId,
    userProps
  };
  return userCtx.callAsync(context, async () => {
    return next(target);
  });
}
var chainable_default = {
  identify
};

// src/langchain.ts
function monitorLangchainLLM(baseClass, llmonitor2, params) {
  const originalGenerate = baseClass.prototype.generate;
  Object.assign(baseClass.prototype, {
    generate: async function(...args) {
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
      return llmonitor2.wrapModel(boundSuperGenerate, {
        name,
        inputParser: (messages) => parseLangchainMessages(messages),
        // Input message will be the first argument
        outputParser: ({ generations }) => parseLangchainMessages(generations),
        tokensUsageParser: ({ llmOutput }) => ({
          completion: llmOutput?.tokenUsage?.completionTokens,
          prompt: llmOutput?.tokenUsage?.promptTokens
        }),
        extra,
        ...params,
        tags: params.tags || chat.tags
      })(...args);
    }
  });
}
function monitorLangchainTool(baseClass, llmonitor2, params) {
  const originalCall = baseClass.prototype.call;
  Object.assign(baseClass.prototype, {
    call: async function(...args) {
      const boundSuperCall = originalCall.bind(this);
      return llmonitor2.wrapTool(boundSuperCall, {
        name: this.name,
        inputParser: (arg) => arg[0] instanceof Object ? arg[0].input : arg,
        ...params
      })(...args);
    }
  });
}

// src/llmonitor.ts
var LLMonitor = class {
  appId;
  logConsole;
  apiUrl;
  queue = [];
  queueRunning = false;
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {
    this.load({
      appId: checkEnv("LLMONITOR_APP_ID"),
      log: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com"
    });
  }
  load({ appId, log, apiUrl } = {}) {
    if (appId)
      this.appId = appId;
    if (log)
      this.logConsole = log;
    if (apiUrl)
      this.apiUrl = apiUrl;
  }
  /**
   * Attach LLMonitor to an entity (Langchain Chat/LLM/Tool classes, OpenAI class)
   * @param {EntityToMonitor | [EntityToMonitor]} entities - Entity or array of entities to monitor
   * @param {string[]} tags - (optinal) Tags to add to all events
   * @example
   * const chat = new ChatOpenAI({
   *   modelName: "gpt-3.5-turbo",
   * })
   * monitor(chat)
   */
  monitor(entities, params = {}) {
    const llmonitor2 = this;
    entities = Array.isArray(entities) ? entities : [entities];
    entities.forEach((entity) => {
      const entityName = entity.name;
      const parentName = Object.getPrototypeOf(entity).name;
      if (entityName === "OpenAIApi") {
        console.log(`wrap ${entityName} through entityProxy`);
        monitorOpenAi(entity, llmonitor2, params);
      } else if (parentName === "BaseChatModel") {
        monitorLangchainLLM(entity, llmonitor2, params);
      } else if (parentName === "Tool" || parentName === "StructuredTool") {
        monitorLangchainTool(entity, llmonitor2, params);
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
    const parentRunId = runIdCtx.tryUse();
    const user = userCtx.tryUse();
    const eventData = {
      event,
      type,
      userId: user?.userId,
      userProps: user?.userProps,
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
  // Wait 500ms to allow other events to be added to the queue
  debouncedProcessQueue = debounce(() => this.processQueue());
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
      console.warn("Error sending event(s) to LLMonitor", error);
    }
  }
  wrap(type, func, params) {
    const llmonitor2 = this;
    const wrappedFn = (...args) => {
      const callInfo = {
        type,
        func,
        args,
        params
      };
      const proxy = new Proxy(callInfo, {
        get: function(target, prop) {
          if (prop === "identify") {
            return chainable_default.identify.bind({
              target,
              next: llmonitor2.executeWrappedFunction.bind(llmonitor2)
            });
          }
          const promise = llmonitor2.executeWrappedFunction(target);
          if (prop === "then") {
            return (onFulfilled, onRejected) => promise.then(onFulfilled, onRejected);
          }
          if (prop === "catch") {
            return (onRejected) => promise.catch(onRejected);
          }
          if (prop === "finally") {
            return (onFinally) => promise.finally(onFinally);
          }
        }
      });
      return proxy;
    };
    return wrappedFn;
  }
  // Extract the actual execution logic into a function
  async executeWrappedFunction(target) {
    const { type, args, func, params } = target;
    const runId = crypto.randomUUID();
    const name = params?.nameParser ? params.nameParser(...args) : params?.name ?? func.name;
    const {
      inputParser,
      outputParser,
      tokensUsageParser,
      extra,
      tags,
      userId,
      userProps
    } = params || {};
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
      const output = await runIdCtx.callAsync(runId, async () => {
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
  }
  /**
   * Wrap an agent's Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent function
   * @param {WrapParams} params - Wrap params
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
var llmonitor_default = LLMonitor;

// src/index.ts
var llmonitor = new llmonitor_default();
var monitor = (...args) => llmonitor.monitor.bind(llmonitor).apply(llmonitor, [...args]);
monitor.load = llmonitor.load.bind(llmonitor);
monitor.monitor = llmonitor.monitor.bind(llmonitor);
monitor.wrapAgent = llmonitor.wrapAgent.bind(llmonitor);
monitor.wrapTool = llmonitor.wrapTool.bind(llmonitor);
monitor.wrapModel = llmonitor.wrapModel.bind(llmonitor);
monitor.info = llmonitor.info.bind(llmonitor);
monitor.log = llmonitor.log.bind(llmonitor);
monitor.warn = llmonitor.warn.bind(llmonitor);
monitor.error = llmonitor.error.bind(llmonitor);
var src_default = monitor;
export {
  src_default as default
};
