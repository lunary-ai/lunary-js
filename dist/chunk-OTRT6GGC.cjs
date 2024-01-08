"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }




var _chunkAFCLBUQJcjs = require('./chunk-AFCLBUQJ.cjs');

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
_chunkAFCLBUQJcjs.__name.call(void 0, identify, "identify");
async function setParent(runId2) {
  const { target, next } = this;
  return context_default.runId.callAsync(runId2, async () => {
    return next(target);
  });
}
_chunkAFCLBUQJcjs.__name.call(void 0, setParent, "setParent");
var chainable_default = {
  identify,
  setParent
};

// src/index.ts
var BackendMonitor = class extends _chunkAFCLBUQJcjs.lunary_default {
  static {
    _chunkAFCLBUQJcjs.__name.call(void 0, this, "BackendMonitor");
  }
  wrap(type, func, params) {
    const lunary2 = this;
    const wrappedFn = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (...args) => {
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
    const name = _optionalChain([params, 'optionalAccess', _ => _.nameParser]) ? params.nameParser(...args) : _nullishCoalesce(_optionalChain([params, 'optionalAccess', _2 => _2.name]), () => ( func.name));
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
    const extraData = _optionalChain([params, 'optionalAccess', _3 => _3.extraParser]) ? params.extraParser(...args) : extra;
    const tagsData = _optionalChain([params, 'optionalAccess', _4 => _4.tagsParser]) ? params.tagsParser(...args) : tags;
    const userIdData = _optionalChain([params, 'optionalAccess', _5 => _5.userIdParser]) ? params.userIdParser(...args) : userId;
    const userPropsData = _optionalChain([params, 'optionalAccess', _6 => _6.userPropsParser]) ? params.userPropsParser(...args) : userProps;
    const templateId = _optionalChain([params, 'optionalAccess', _7 => _7.templateParser]) ? params.templateParser(...args) : templateParser;
    const input = inputParser ? inputParser(...args) : _chunkAFCLBUQJcjs.getFunctionInput.call(void 0, func, args);
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
    const processOutput = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, async (output) => {
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
        error: _chunkAFCLBUQJcjs.cleanError.call(void 0, error)
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



exports.src_default = src_default;
