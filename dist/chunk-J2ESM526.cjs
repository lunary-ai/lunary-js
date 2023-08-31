"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;var __defProp = Object.defineProperty;
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

// src/context.ts
var _unctx = require('unctx');
var _async_hooks = require('async_hooks');
var runId = _unctx.createContext.call(void 0, {
  asyncContext: true,
  AsyncLocalStorage: _async_hooks.AsyncLocalStorage
});
var user = _unctx.createContext.call(void 0, {
  asyncContext: true,
  AsyncLocalStorage: _async_hooks.AsyncLocalStorage
});
var context_default = {
  runId,
  user
};

// src/chainable.ts
async function identify(userId, userProps) {
  const { target, next } = this;
  const context = {
    userId,
    userProps
  };
  return context_default.user.callAsync(context, async () => {
    return next(target);
  });
}
__name(identify, "identify");
var chainable_default = {
  identify
};

// src/llmonitor.ts
var LLMonitor = (_class = class {
  static {
    __name(this, "LLMonitor");
  }
  
  
  
  __init() {this.queue = []}
  __init2() {this.queueRunning = false}
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);
    this.init({
      appId: checkEnv("LLMONITOR_APP_ID"),
      verbose: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com"
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
  async trackEvent(type, event, data) {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      );
    let timestamp = Date.now();
    const lastEvent = _optionalChain([this, 'access', _7 => _7.queue, 'optionalAccess', _8 => _8[this.queue.length - 1]]);
    if (_optionalChain([lastEvent, 'optionalAccess', _9 => _9.timestamp]) >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = _nullishCoalesce(data.parentRunId, () => ( context_default.runId.tryUse()));
    const user2 = context_default.user.tryUse();
    const runtime = _nullishCoalesce(data.runtime, () => ( "llmonitor-js"));
    const eventData = {
      event,
      type,
      userId: _optionalChain([user2, 'optionalAccess', _10 => _10.userId]),
      userProps: _optionalChain([user2, 'optionalAccess', _11 => _11.userProps]),
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
    this.debouncedProcessQueue();
  }
  // Wait 500ms to allow other events to be added to the queue
  __init3() {this.debouncedProcessQueue = debounce(() => this.processQueue())}
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
  wrap(type, func, params) {
    const llmonitor2 = this;
    const wrappedFn = /* @__PURE__ */ __name((...args) => {
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
    }, "wrappedFn");
    return wrappedFn;
  }
  // Extract the actual execution logic into a function
  async executeWrappedFunction(target) {
    const { type, args, func, params } = target;
    const runId2 = crypto.randomUUID();
    const name = _optionalChain([params, 'optionalAccess', _12 => _12.nameParser]) ? params.nameParser(...args) : _nullishCoalesce(_optionalChain([params, 'optionalAccess', _13 => _13.name]), () => ( func.name));
    const {
      inputParser,
      outputParser,
      tokensUsageParser,
      waitUntil,
      enableWaitUntil,
      extra,
      tags,
      userId,
      userProps
    } = params || {};
    const extraData = _optionalChain([params, 'optionalAccess', _14 => _14.extraParser]) ? params.extraParser(...args) : extra;
    const input = inputParser ? inputParser(...args) : getFunctionInput(func, args);
    this.trackEvent(type, "start", {
      runId: runId2,
      input,
      name,
      extra: extraData,
      tags
    });
    const processOutput = /* @__PURE__ */ __name(async (output) => {
      const tokensUsage = tokensUsageParser ? await tokensUsageParser(output) : void 0;
      this.trackEvent(type, "end", {
        runId: runId2,
        output: outputParser ? outputParser(output) : output,
        tokensUsage
      });
    }, "processOutput");
    try {
      const output = await context_default.runId.callAsync(runId2, async () => {
        return func(...args);
      });
      if (typeof enableWaitUntil === "function" ? enableWaitUntil(...args) : waitUntil) {
        return waitUntil(
          output,
          (res) => processOutput(res),
          (error) => console.error(error)
        );
      } else {
        await processOutput(output);
      }
      return output;
    } catch (error) {
      this.trackEvent(type, "error", {
        runId: runId2,
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
      message = _nullishCoalesce(error.message, () => ( void 0));
    }
    this.trackEvent("log", "error", {
      message,
      extra: cleanError(error)
    });
  }
}, _class);
var llmonitor_default = LLMonitor;

// src/index.ts
var llmonitor = new llmonitor_default();
var src_default = llmonitor;





exports.__name = __name; exports.cleanExtra = cleanExtra; exports.src_default = src_default;
