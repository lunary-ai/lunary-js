import {
  __name,
  checkEnv,
  cleanError,
  debounce,
  formatLog,
  getFunctionInput
} from "./chunk-NILRUNLS.js";

// src/context.ts
import { createContext } from "unctx";
import { AsyncLocalStorage } from "node:async_hooks";
var runId = createContext({
  asyncContext: true,
  AsyncLocalStorage
});
var user = createContext({
  asyncContext: true,
  AsyncLocalStorage
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
async function setParent(runId2) {
  const { target, next } = this;
  return context_default.runId.callAsync(runId2, async () => {
    return next(target);
  });
}
__name(setParent, "setParent");
var chainable_default = {
  identify,
  setParent
};

// src/llmonitor.ts
var MAX_CHUNK_SIZE = 20;
var LLMonitor = class {
  static {
    __name(this, "LLMonitor");
  }
  appId;
  verbose;
  apiUrl;
  queue = [];
  queueRunning = false;
  /**
   * @param {LLMonitorOptions} options
   */
  constructor() {
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
  trackEvent(type, event, data) {
    if (!this.appId)
      return console.warn(
        "LLMonitor: App ID not set. Not reporting anything. Get one on the dashboard: https://app.llmonitor.com"
      );
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const parentRunId = data.parentRunId ?? context_default.runId.tryUse();
    const user2 = context_default.user.tryUse();
    const userId = data.userId ?? user2?.userId;
    let userProps = data.userProps ?? user2?.userProps;
    if (userProps && !userId) {
      console.warn(
        "LLMonitor: userProps passed without userId. Ignoring userProps."
      );
      userProps = void 0;
    }
    const runtime = data.runtime ?? "llmonitor-js";
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
    const name = params?.nameParser ? params.nameParser(...args) : params?.name ?? func.name;
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
    const extraData = params?.extraParser ? params.extraParser(...args) : extra;
    const tagsData = params?.tagsParser ? params.tagsParser(...args) : tags;
    const userIdData = params?.userIdParser ? params.userIdParser(...args) : userId;
    const userPropsData = params?.userPropsParser ? params.userPropsParser(...args) : userProps;
    const input = inputParser ? inputParser(...args) : getFunctionInput(func, args);
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
    const processOutput = /* @__PURE__ */ __name(async (output) => {
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
  /**
   * Make sure the queue is flushed before exiting the program
   */
  async flush() {
    await this.processQueue();
  }
};
var llmonitor_default = LLMonitor;

// src/index.ts
var llmonitor = new llmonitor_default();
var src_default = llmonitor;

export {
  src_default
};
