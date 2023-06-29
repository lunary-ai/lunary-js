var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// node_modules/.deno/ansi-styles@5.2.0/node_modules/ansi-styles/index.js
var require_ansi_styles = __commonJS({
  "node_modules/.deno/ansi-styles@5.2.0/node_modules/ansi-styles/index.js"(exports, module) {
    "use strict";
    var ANSI_BACKGROUND_OFFSET = 10;
    var wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    var wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    function assembleStyles() {
      const codes = /* @__PURE__ */ new Map();
      const styles2 = {
        modifier: {
          reset: [0, 0],
          // 21 isn't widely supported and 22 does the same thing
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          overline: [53, 55],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          // Bright color
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          // Bright color
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles2.color.gray = styles2.color.blackBright;
      styles2.bgColor.bgGray = styles2.bgColor.bgBlackBright;
      styles2.color.grey = styles2.color.blackBright;
      styles2.bgColor.bgGrey = styles2.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles2)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles2[styleName] = {
            open: `\x1B[${style[0]}m`,
            close: `\x1B[${style[1]}m`
          };
          group[styleName] = styles2[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles2, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles2, "codes", {
        value: codes,
        enumerable: false
      });
      styles2.color.close = "\x1B[39m";
      styles2.bgColor.close = "\x1B[49m";
      styles2.color.ansi256 = wrapAnsi256();
      styles2.color.ansi16m = wrapAnsi16m();
      styles2.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
      styles2.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
      Object.defineProperties(styles2, {
        rgbToAnsi256: {
          value: (red, green, blue) => {
            if (red === green && green === blue) {
              if (red < 8) {
                return 16;
              }
              if (red > 248) {
                return 231;
              }
              return Math.round((red - 8) / 247 * 24) + 232;
            }
            return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
          },
          enumerable: false
        },
        hexToRgb: {
          value: (hex) => {
            const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
            if (!matches) {
              return [0, 0, 0];
            }
            let { colorString } = matches.groups;
            if (colorString.length === 3) {
              colorString = colorString.split("").map((character) => character + character).join("");
            }
            const integer = Number.parseInt(colorString, 16);
            return [
              integer >> 16 & 255,
              integer >> 8 & 255,
              integer & 255
            ];
          },
          enumerable: false
        },
        hexToAnsi256: {
          value: (hex) => styles2.rgbToAnsi256(...styles2.hexToRgb(hex)),
          enumerable: false
        }
      });
      return styles2;
    }
    Object.defineProperty(module, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

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
  const { type, message, extra, model } = event;
  return `[LLMonitor: ${type}] ${model ? `(${model})` : ""} ${message || ""} ${extra ? "\n" + JSON.stringify(extra, null, 2) : ""} `;
};
var debounce = (func, timeout = 50) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(void 0, args);
    }, timeout);
  };
};

// src/agent.ts
var AgentMonitor = class extends src_default {
  constructor(options) {
    const agentRunId = options?.agentRunId || crypto.randomUUID();
    super({ ...options, agentRunId });
  }
  /*
   * Wrap an agent Promise to track it's input, results and any errors.
   * @param {string} name - Agent name
   * @param {Promise} func - Agent function
   **/
  wrapAgent(name, func) {
    return async (...args) => {
      this.agentStart({
        name,
        input: args
      });
      try {
        const result = await func(...args);
        this.agentEnd({
          output: result
        });
        return result;
      } catch (error) {
        this.agentError({
          error
        });
        throw error;
      }
    };
  }
};

// node_modules/.deno/uuid@9.0.0/node_modules/uuid/dist/esm-browser/rng.js
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  if (!getRandomValues) {
    getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
    if (!getRandomValues) {
      throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
    }
  }
  return getRandomValues(rnds8);
}

// node_modules/.deno/uuid@9.0.0/node_modules/uuid/dist/esm-browser/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/.deno/uuid@9.0.0/node_modules/uuid/dist/esm-browser/native.js
var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
var native_default = {
  randomUUID
};

// node_modules/.deno/uuid@9.0.0/node_modules/uuid/dist/esm-browser/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random || (options.rng || rng)();
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/.deno/langchain@0.0.75/node_modules/langchain/dist/callbacks/base.js
var BaseCallbackHandlerMethodsClass = class {
};
var BaseCallbackHandler = class extends BaseCallbackHandlerMethodsClass {
  constructor(input) {
    super();
    Object.defineProperty(this, "ignoreLLM", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "ignoreChain", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "ignoreAgent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    if (input) {
      this.ignoreLLM = input.ignoreLLM ?? this.ignoreLLM;
      this.ignoreChain = input.ignoreChain ?? this.ignoreChain;
      this.ignoreAgent = input.ignoreAgent ?? this.ignoreAgent;
    }
  }
  copy() {
    return new this.constructor(this);
  }
  static fromMethods(methods) {
    class Handler extends BaseCallbackHandler {
      constructor() {
        super();
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: v4_default()
        });
        Object.assign(this, methods);
      }
    }
    return new Handler();
  }
};

// node_modules/.deno/langchain@0.0.75/node_modules/langchain/dist/callbacks/handlers/console.js
var import_ansi_styles = __toESM(require_ansi_styles(), 1);
var { color } = import_ansi_styles.default;

// src/langchain.ts
var LLMonitorCallbackHandler = class extends BaseCallbackHandler {
  name = "llmonitor";
  streamingState = {};
  params = {};
  monitor;
  constructor(args) {
    super(...args);
    this.monitor = args.monitor || new src_default();
    this.params = args;
  }
  async handleLLMStart(llm, prompts, runId, parentRunId, extraParams) {
    if (this.params.streaming) {
      this.streamingState[runId] = false;
    }
    this.monitor.llmStart({ runId, messages: prompts, input: this.params });
    console.log("llm:start", llm.name, prompts, runId, parentRunId, extraParams);
  }
  // handleLLMStart won't be called if the model is chat-style
  async handleChatModelStart(chat, messages, runId, parentRunId, extraParams) {
    if (this.params.streaming) {
      this.streamingState[runId] = false;
    }
    this.monitor.llmStart({ runId, messages, input: this.params });
    console.log("chat:start", chat.name, runId, messages, parentRunId, "\n");
  }
  // Used to calculate latency to first token
  async handleLLMNewToken(token, runId, parentRunId) {
    if (this.params.streaming && !this.streamingState[runId]) {
      this.streamingState[runId] = true;
      this.monitor.streamingStart({ runId });
    }
  }
  async handleLLMError(error, runId, parentRunId, extraParams) {
    console.error("llm:error", error, runId, parentRunId, extraParams);
    this.monitor.llmError({ runId, error });
  }
  async handleLLMEnd(output, runId, parentRunId) {
    const { generations, llmOutput } = output;
    const { promptTokens, completionTokens } = llmOutput;
    console.log("llm:end", output, runId, parentRunId);
    this.monitor.llmEnd({
      runId,
      output: generations,
      promptTokens,
      completionTokens
    });
  }
  async handleToolStart(tool, input, runId, parentRunId) {
    console.log("tool:start", tool.name, input, runId, parentRunId, "\n");
    this.monitor.toolStart({ runId, name: tool.name, input });
  }
  async handleToolError(error, runId, parentRunId) {
    console.log("tool:error", error, runId, parentRunId, "\n");
    this.monitor.toolError({ runId, error });
  }
  async handleToolEnd(output, runId, parentRunId) {
    console.log("tool:end", output, runId, parentRunId, "\n");
    this.monitor.toolEnd({ runId, output });
  }
};
var ARGS_TO_REPORT = [
  "temperature",
  "modelName",
  "streaming",
  "tags",
  "streaming"
];
var extendModel = (baseClass) => (
  // TODO: get vendor from (lc_namespace: [ "langchain", "chat_models", "openai" ])
  class extends baseClass {
    constructor(...args) {
      const interestingArgs = ARGS_TO_REPORT.reduce((acc, arg) => {
        if (args[0][arg])
          acc[arg] = args[0][arg];
        return acc;
      }, {});
      args[0].callbacks = [new LLMonitorCallbackHandler(interestingArgs)];
      super(...args);
    }
  }
);

// src/index.ts
var LLMonitor = class {
  appId;
  // convoId: string
  logConsole;
  apiUrl;
  userId;
  agentRunId;
  queue = [];
  queueRunning = false;
  /**
   * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
   * @param {boolean} log - Log events to the console
   * @param {string | string[]} convoTags - Add a label to the conversation
   * @param {string} apiUrl - Custom tracking URL if you are self-hosting (can also be set with LLMONITOR_API_URL)
   * @constructor
   */
  constructor(options) {
    this.appId = options?.appId || checkEnv("LLMONITOR_APP_ID");
    this.userId = options?.userId;
    this.agentRunId = options?.agentRunId;
    this.logConsole = options?.log || false;
    this.apiUrl = options?.apiUrl || checkEnv("LLMONITOR_API_URL") || "https://app.llmonitor.com";
  }
  async trackEvent(type, data = {}) {
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
  // Wait 50ms to allow other events to be added to the queue
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
  /**
   * Get the conversation ID to continue tracking an existing conversation.
   * @returns {string} - Conversation ID
   * @example
   * const monitor = new LLMonitor()
   * const convoId = monitor.id
   *
   * // Later on...
   * const monitor = new LLMonitor({ convoId })
   **/
  // get id() {
  //   return this.convoId
  // }
  agentStart(data) {
    this.trackEvent("agent", {
      event: "start",
      ...data
    });
  }
  agentEnd(data) {
    this.trackEvent("agent", {
      event: "end",
      ...data
    });
  }
  agentError(data) {
    this.trackEvent("agent", {
      event: "error",
      ...data
    });
  }
  llmStart(data) {
    this.trackEvent("llm", {
      event: "start",
      ...data
    });
  }
  /**
   * Use this when you start streaming the model's output to the user.
   * Used to measure the time it takes for the model to generate the first response.
   */
  streamingStart(data) {
    this.trackEvent("llm", {
      event: "stream",
      ...data
    });
  }
  llmEnd(data) {
    this.trackEvent("llm", {
      event: "end",
      ...data
    });
  }
  llmError(data) {
    this.trackEvent("llm", {
      event: "error",
      ...data
    });
  }
  toolStart(data) {
    this.trackEvent("tool", {
      event: "start",
      ...data
    });
  }
  toolEnd(data) {
    this.trackEvent("tool", {
      event: "end",
      ...data
    });
  }
  toolError(data) {
    this.trackEvent("tool", {
      event: "error",
      ...data
    });
  }
  /**
   * Use this to wrap any external tool you use.
   * @param {string} name - Tool name
   * @param {Function} func - Tool function
   * @returns {Function} - Wrapped tool function
   * @example
   * const monitor = new LLMonitor()
   * const googleSearch = monitor.wrapTool("Google Search", async (query) => {
   *  const response = await fetch(`https://google.com/search?q=${query}`)
   *  return response.text()
   * })
   * const result = await googleSearch("test")
   **/
  wrapTool(name, func) {
    return async (...args) => {
      const runId = crypto.randomUUID();
      this.toolStart({ runId, name, input: args });
      try {
        const output = await func(...args);
        this.toolEnd({ runId, output });
        return output;
      } catch (error) {
        this.toolError({ runId, error });
        throw error;
      }
    };
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
      level: "info",
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
      level: "warn",
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
      level: "error",
      message,
      extra: error
    });
  }
};
var src_default = LLMonitor;
export {
  AgentMonitor,
  LLMonitorCallbackHandler,
  src_default as default,
  extendModel
};
