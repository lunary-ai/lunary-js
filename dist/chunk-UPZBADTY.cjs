"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;






var _chunkM3TFISX5cjs = require('./chunk-M3TFISX5.cjs');

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
_chunkM3TFISX5cjs.__name.call(void 0, identify, "identify");
async function setParent(runId2) {
  const { target, next } = this;
  return context_default.runId.callAsync(runId2, async () => {
    return next(target);
  });
}
_chunkM3TFISX5cjs.__name.call(void 0, setParent, "setParent");
var chainable_default = {
  identify,
  setParent
};

// src/llmonitor.ts
var MAX_CHUNK_SIZE = 20;
var LLMonitor = (_class = class {
  static {
    _chunkM3TFISX5cjs.__name.call(void 0, this, "LLMonitor");
  }
  
  
  
  __init() {this.queue = []}
  __init2() {this.queueRunning = false}
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {;_class.prototype.__init.call(this);_class.prototype.__init2.call(this);_class.prototype.__init3.call(this);
    this.init({
      appId: _chunkM3TFISX5cjs.checkEnv.call(void 0, "LLMONITOR_APP_ID"),
      verbose: false,
      apiUrl: _chunkM3TFISX5cjs.checkEnv.call(void 0, "LLMONITOR_API_URL") || "https://app.llmonitor.com"
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
    const lastEvent = _optionalChain([this, 'access', _ => _.queue, 'optionalAccess', _2 => _2[this.queue.length - 1]]);
    if (_optionalChain([lastEvent, 'optionalAccess', _3 => _3.timestamp]) >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = _nullishCoalesce(data.parentRunId, () => ( context_default.runId.tryUse()));
    const user2 = context_default.user.tryUse();
    const userId = _nullishCoalesce(data.userId, () => ( _optionalChain([user2, 'optionalAccess', _4 => _4.userId])));
    let userProps = _nullishCoalesce(data.userProps, () => ( _optionalChain([user2, 'optionalAccess', _5 => _5.userProps])));
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
      console.log(_chunkM3TFISX5cjs.formatLog.call(void 0, eventData));
    }
    this.queue.push(eventData);
    if (this.queue.length > MAX_CHUNK_SIZE) {
      this.processQueue();
    } else {
      this.debouncedProcessQueue();
    }
  }
  // Wait 500ms to allow other events to be added to the queue
  __init3() {this.debouncedProcessQueue = _chunkM3TFISX5cjs.debounce.call(void 0, () => this.processQueue())}
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
  wrap(type, func, params) {
    const llmonitor2 = this;
    const wrappedFn = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, (...args) => {
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
          if (prop === "setParent") {
            return chainable_default.setParent.bind({
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
    const name = _optionalChain([params, 'optionalAccess', _6 => _6.nameParser]) ? params.nameParser(...args) : _nullishCoalesce(_optionalChain([params, 'optionalAccess', _7 => _7.name]), () => ( func.name));
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
    const extraData = _optionalChain([params, 'optionalAccess', _8 => _8.extraParser]) ? params.extraParser(...args) : extra;
    const tagsData = _optionalChain([params, 'optionalAccess', _9 => _9.tagsParser]) ? params.tagsParser(...args) : tags;
    const userIdData = _optionalChain([params, 'optionalAccess', _10 => _10.userIdParser]) ? params.userIdParser(...args) : userId;
    const userPropsData = _optionalChain([params, 'optionalAccess', _11 => _11.userPropsParser]) ? params.userPropsParser(...args) : userProps;
    const input = inputParser ? inputParser(...args) : _chunkM3TFISX5cjs.getFunctionInput.call(void 0, func, args);
    this.trackEvent(type, "start", {
      runId: runId2,
      input,
      name,
      extra: extraData,
      tags: tagsData,
      userId: userIdData,
      userProps: userPropsData
    });
    const shouldWaitUntil = typeof enableWaitUntil === "function" ? enableWaitUntil(...args) : waitUntil;
    const processOutput = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, async (output) => {
      const tokensUsage = tokensUsageParser ? await tokensUsageParser(output) : void 0;
      this.trackEvent(type, "end", {
        runId: runId2,
        name,
        // need name in case need to count tokens usage server-side
        output: outputParser ? outputParser(output) : output,
        tokensUsage
      });
      if (shouldWaitUntil) {
        await this.flush();
      }
    }, "processOutput");
    try {
      const output = await context_default.runId.callAsync(runId2, async () => {
        return func(...args);
      });
      if (shouldWaitUntil) {
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
        error: _chunkM3TFISX5cjs.cleanError.call(void 0, error)
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
      extra: _chunkM3TFISX5cjs.cleanError.call(void 0, error)
    });
  }
  /**
   * Make sure the queue is flushed before exiting the program
   */
  async flush() {
    await this.processQueue();
  }
}, _class);
var llmonitor_default = LLMonitor;

// src/index.ts
var llmonitor = new llmonitor_default();
var src_default = llmonitor;



exports.src_default = src_default;
