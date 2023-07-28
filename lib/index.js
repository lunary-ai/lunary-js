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
  console.log(JSON.stringify(event, null, 2));
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
  return {
    message: error.message,
    stack: error.stack
  };
};
var getArgumentNames = (func) => {
  const funcString = func.toString().replace(/[\r\n\s]+/g, " ");
  const result = funcString.slice(funcString.indexOf("(") + 1, funcString.indexOf(")")).match(/([^\s,]+)/g);
  if (result === null)
    return [];
  else
    return result;
};
var getFunctionInput = (func) => {
  const args = getArgumentNames(func);
  const input = argNames.length === 1 ? args[0] : argNames.reduce((obj, argName, index) => {
    obj[argName] = args[index];
    return obj;
  }, {});
  return input;
};

// src/llmonitor.ts
var LLMonitor = class {
  appId;
  // convoId: string
  logConsole;
  apiUrl;
  userId;
  queue = [];
  queueRunning = false;
  /**
   * @param {LLMonitorOptions} options
   */
  load(customOptions) {
    const defaultOptions = {
      appId: checkEnv("LLMONITOR_APP_ID"),
      log: false,
      apiUrl: checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com"
    };
    const options = { ...defaultOptions, ...customOptions };
    this.appId = options.appId;
    this.logConsole = options.log;
    this.apiUrl = options.apiUrl;
    this.userId = options.userId;
  }
  async trackEvent(type, data) {
    if (!this.appId)
      return console.error("LLMonitor: App ID not set");
    let timestamp = Date.now();
    const lastEvent = this.queue?.[this.queue.length - 1];
    if (lastEvent?.timestamp >= timestamp) {
      timestamp = lastEvent.timestamp + 1;
    }
    const eventData = {
      type,
      app: this.appId,
      // convo: this.convoId,
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
    } catch (error) {
      console.warn("Error sending event(s) to LLMonitor", error);
    }
    this.queueRunning = false;
    if (this.queue.length)
      this.processQueue();
  }
  /*
   * Wrap a Promise to track it's input, results and any errors.
   * @param {Promise} func - Agent/tool/model executor function
   */
  wrap(type, func, params) {
    const runId = crypto.randomUUID();
    return async (...args) => {
      const name = func.name || params?.name;
      const input = getFunctionInput(func);
      this.trackEvent(type, {
        runId,
        input,
        name
      });
      try {
        const output = await func(...args);
        this.trackEvent(type, {
          runId,
          output
        });
        return output;
      } catch (error) {
        this.trackEvent(type, {
          runId,
          error: cleanError(error)
        });
        throw error;
      }
    };
  }
  /*
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
   * Use this to log any external action or tool you use.
   * @param {string} message - Log message
   * @param {any} extra - Extra data to pass
   * @example
   * monitor.info("Running tool Google Search")
   **/
  info(message, extra) {
    this.trackEvent("log", {
      event: "info",
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
    this.trackEvent("log", {
      event: "warn",
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
   **/
  error(message, error) {
    if (typeof message === "object") {
      error = message;
      message = error.message || void 0;
    }
    this.trackEvent("log", {
      event: "error",
      message,
      extra: cleanError(error)
    });
  }
  /**
   * Extends Langchain's LLM classes like ChatOpenAI
   * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
   * @param baseClass - Langchain's LLM class
   * @returns Extended class
   * @example
   * const monitor = new LLMonitor()
   * const MonitoredChat = monitor.extendModel(ChatOpenAI)
   * const chat = new MonitoredChat({
   *  modelName: "gpt-4"
   * })
   **/
  // langchain(baseClass: any) {
  //   const monitor = this
  //   return class extends baseClass {
  //     constructor(...args: any[]) {
  //       const interestingArgs = LANGCHAIN_ARGS_TO_REPORT.reduce((acc, arg) => {
  //         if (args[0][arg]) acc[arg] = args[0][arg]
  //         return acc
  //       }, {} as Record<string, unknown>)
  //       args[0].callbacks = [
  //         new LLMonitorCallbackHandler(monitor, interestingArgs),
  //         ...(args[0]?.callbacks || []),
  //       ]
  //       super(...args)
  //     }
  //   }
  // }
};
var llmonitor_default = LLMonitor;

// src/index.ts
var monitor = new llmonitor_default();
var src_default = monitor;
export {
  src_default as default
};
