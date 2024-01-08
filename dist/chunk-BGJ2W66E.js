import {
  __name,
  cleanError,
  getFunctionInput,
  lunary_default
} from "./chunk-632QYEL3.js";

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

// src/index.ts
var BackendMonitor = class extends lunary_default {
  static {
    __name(this, "BackendMonitor");
  }
  wrap(type, func, params) {
    const lunary2 = this;
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
              next: lunary2.executeWrappedFunction.bind(lunary2)
            });
          }
          if (prop === "setParent") {
            return chainable_default.setParent.bind({
              target,
              next: lunary2.executeWrappedFunction.bind(lunary2)
            });
          }
          const promise = lunary2.executeWrappedFunction(target);
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
      templateParser,
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
    const templateId = params?.templateParser ? params.templateParser(...args) : templateParser;
    const input = inputParser ? inputParser(...args) : getFunctionInput(func, args);
    this.trackEvent(type, "start", {
      runId: runId2,
      input,
      name,
      extra: extraData,
      tags: tagsData,
      userId: userIdData,
      userProps: userPropsData,
      templateId
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
};
var lunary = new BackendMonitor(context_default);
var src_default = lunary;

export {
  src_default
};
