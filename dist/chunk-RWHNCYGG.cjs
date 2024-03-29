"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }




var _chunkEC6JY3PVcjs = require('./chunk-EC6JY3PV.cjs');

// node_modules/decamelize/index.js
var require_decamelize = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/decamelize/index.js"(exports, module) {
    "use strict";
    module.exports = function(str, sep) {
      if (typeof str !== "string") {
        throw new TypeError("Expected a string");
      }
      sep = typeof sep === "undefined" ? "_" : sep;
      return str.replace(/([a-z\d])([A-Z])/g, "$1" + sep + "$2").replace(/([A-Z]+)([A-Z][a-z\d]+)/g, "$1" + sep + "$2").toLowerCase();
    };
  }
});

// node_modules/camelcase/index.js
var require_camelcase = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/camelcase/index.js"(exports, module) {
    "use strict";
    var UPPERCASE = /[\p{Lu}]/u;
    var LOWERCASE = /[\p{Ll}]/u;
    var LEADING_CAPITAL = /^[\p{Lu}](?![\p{Lu}])/gu;
    var IDENTIFIER = /([\p{Alpha}\p{N}_]|$)/u;
    var SEPARATORS = /[_.\- ]+/;
    var LEADING_SEPARATORS = new RegExp("^" + SEPARATORS.source);
    var SEPARATORS_AND_IDENTIFIER = new RegExp(SEPARATORS.source + IDENTIFIER.source, "gu");
    var NUMBERS_AND_IDENTIFIER = new RegExp("\\d+" + IDENTIFIER.source, "gu");
    var preserveCamelCase = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (string, toLowerCase, toUpperCase) => {
      let isLastCharLower = false;
      let isLastCharUpper = false;
      let isLastLastCharUpper = false;
      for (let i = 0; i < string.length; i++) {
        const character = string[i];
        if (isLastCharLower && UPPERCASE.test(character)) {
          string = string.slice(0, i) + "-" + string.slice(i);
          isLastCharLower = false;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = true;
          i++;
        } else if (isLastCharUpper && isLastLastCharUpper && LOWERCASE.test(character)) {
          string = string.slice(0, i - 1) + "-" + string.slice(i - 1);
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = false;
          isLastCharLower = true;
        } else {
          isLastCharLower = toLowerCase(character) === character && toUpperCase(character) !== character;
          isLastLastCharUpper = isLastCharUpper;
          isLastCharUpper = toUpperCase(character) === character && toLowerCase(character) !== character;
        }
      }
      return string;
    }, "preserveCamelCase");
    var preserveConsecutiveUppercase = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (input, toLowerCase) => {
      LEADING_CAPITAL.lastIndex = 0;
      return input.replace(LEADING_CAPITAL, (m1) => toLowerCase(m1));
    }, "preserveConsecutiveUppercase");
    var postProcess = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (input, toUpperCase) => {
      SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
      NUMBERS_AND_IDENTIFIER.lastIndex = 0;
      return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, (m) => toUpperCase(m));
    }, "postProcess");
    var camelCase2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (input, options) => {
      if (!(typeof input === "string" || Array.isArray(input))) {
        throw new TypeError("Expected the input to be `string | string[]`");
      }
      options = {
        pascalCase: false,
        preserveConsecutiveUppercase: false,
        ...options
      };
      if (Array.isArray(input)) {
        input = input.map((x) => x.trim()).filter((x) => x.length).join("-");
      } else {
        input = input.trim();
      }
      if (input.length === 0) {
        return "";
      }
      const toLowerCase = options.locale === false ? (string) => string.toLowerCase() : (string) => string.toLocaleLowerCase(options.locale);
      const toUpperCase = options.locale === false ? (string) => string.toUpperCase() : (string) => string.toLocaleUpperCase(options.locale);
      if (input.length === 1) {
        return options.pascalCase ? toUpperCase(input) : toLowerCase(input);
      }
      const hasUpperCase = input !== toLowerCase(input);
      if (hasUpperCase) {
        input = preserveCamelCase(input, toLowerCase, toUpperCase);
      }
      input = input.replace(LEADING_SEPARATORS, "");
      if (options.preserveConsecutiveUppercase) {
        input = preserveConsecutiveUppercase(input, toLowerCase);
      } else {
        input = toLowerCase(input);
      }
      if (options.pascalCase) {
        input = toUpperCase(input.charAt(0)) + input.slice(1);
      }
      return postProcess(input, toUpperCase);
    }, "camelCase");
    module.exports = camelCase2;
    module.exports.default = camelCase2;
  }
});

// node_modules/retry/lib/retry_operation.js
var require_retry_operation = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/retry/lib/retry_operation.js"(exports, module) {
    function RetryOperation(timeouts, options) {
      if (typeof options === "boolean") {
        options = { forever: options };
      }
      this._originalTimeouts = JSON.parse(JSON.stringify(timeouts));
      this._timeouts = timeouts;
      this._options = options || {};
      this._maxRetryTime = options && options.maxRetryTime || Infinity;
      this._fn = null;
      this._errors = [];
      this._attempts = 1;
      this._operationTimeout = null;
      this._operationTimeoutCb = null;
      this._timeout = null;
      this._operationStart = null;
      this._timer = null;
      if (this._options.forever) {
        this._cachedTimeouts = this._timeouts.slice(0);
      }
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, RetryOperation, "RetryOperation");
    module.exports = RetryOperation;
    RetryOperation.prototype.reset = function() {
      this._attempts = 1;
      this._timeouts = this._originalTimeouts.slice(0);
    };
    RetryOperation.prototype.stop = function() {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (this._timer) {
        clearTimeout(this._timer);
      }
      this._timeouts = [];
      this._cachedTimeouts = null;
    };
    RetryOperation.prototype.retry = function(err) {
      if (this._timeout) {
        clearTimeout(this._timeout);
      }
      if (!err) {
        return false;
      }
      var currentTime = (/* @__PURE__ */ new Date()).getTime();
      if (err && currentTime - this._operationStart >= this._maxRetryTime) {
        this._errors.push(err);
        this._errors.unshift(new Error("RetryOperation timeout occurred"));
        return false;
      }
      this._errors.push(err);
      var timeout = this._timeouts.shift();
      if (timeout === void 0) {
        if (this._cachedTimeouts) {
          this._errors.splice(0, this._errors.length - 1);
          timeout = this._cachedTimeouts.slice(-1);
        } else {
          return false;
        }
      }
      var self = this;
      this._timer = setTimeout(function() {
        self._attempts++;
        if (self._operationTimeoutCb) {
          self._timeout = setTimeout(function() {
            self._operationTimeoutCb(self._attempts);
          }, self._operationTimeout);
          if (self._options.unref) {
            self._timeout.unref();
          }
        }
        self._fn(self._attempts);
      }, timeout);
      if (this._options.unref) {
        this._timer.unref();
      }
      return true;
    };
    RetryOperation.prototype.attempt = function(fn, timeoutOps) {
      this._fn = fn;
      if (timeoutOps) {
        if (timeoutOps.timeout) {
          this._operationTimeout = timeoutOps.timeout;
        }
        if (timeoutOps.cb) {
          this._operationTimeoutCb = timeoutOps.cb;
        }
      }
      var self = this;
      if (this._operationTimeoutCb) {
        this._timeout = setTimeout(function() {
          self._operationTimeoutCb();
        }, self._operationTimeout);
      }
      this._operationStart = (/* @__PURE__ */ new Date()).getTime();
      this._fn(this._attempts);
    };
    RetryOperation.prototype.try = function(fn) {
      console.log("Using RetryOperation.try() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = function(fn) {
      console.log("Using RetryOperation.start() is deprecated");
      this.attempt(fn);
    };
    RetryOperation.prototype.start = RetryOperation.prototype.try;
    RetryOperation.prototype.errors = function() {
      return this._errors;
    };
    RetryOperation.prototype.attempts = function() {
      return this._attempts;
    };
    RetryOperation.prototype.mainError = function() {
      if (this._errors.length === 0) {
        return null;
      }
      var counts = {};
      var mainError = null;
      var mainErrorCount = 0;
      for (var i = 0; i < this._errors.length; i++) {
        var error = this._errors[i];
        var message = error.message;
        var count = (counts[message] || 0) + 1;
        counts[message] = count;
        if (count >= mainErrorCount) {
          mainError = error;
          mainErrorCount = count;
        }
      }
      return mainError;
    };
  }
});

// node_modules/retry/lib/retry.js
var require_retry = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/retry/lib/retry.js"(exports) {
    var RetryOperation = require_retry_operation();
    exports.operation = function(options) {
      var timeouts = exports.timeouts(options);
      return new RetryOperation(timeouts, {
        forever: options && (options.forever || options.retries === Infinity),
        unref: options && options.unref,
        maxRetryTime: options && options.maxRetryTime
      });
    };
    exports.timeouts = function(options) {
      if (options instanceof Array) {
        return [].concat(options);
      }
      var opts = {
        retries: 10,
        factor: 2,
        minTimeout: 1 * 1e3,
        maxTimeout: Infinity,
        randomize: false
      };
      for (var key in options) {
        opts[key] = options[key];
      }
      if (opts.minTimeout > opts.maxTimeout) {
        throw new Error("minTimeout is greater than maxTimeout");
      }
      var timeouts = [];
      for (var i = 0; i < opts.retries; i++) {
        timeouts.push(this.createTimeout(i, opts));
      }
      if (options && options.forever && !timeouts.length) {
        timeouts.push(this.createTimeout(i, opts));
      }
      timeouts.sort(function(a, b) {
        return a - b;
      });
      return timeouts;
    };
    exports.createTimeout = function(attempt, opts) {
      var random = opts.randomize ? Math.random() + 1 : 1;
      var timeout = Math.round(random * Math.max(opts.minTimeout, 1) * Math.pow(opts.factor, attempt));
      timeout = Math.min(timeout, opts.maxTimeout);
      return timeout;
    };
    exports.wrap = function(obj, options, methods) {
      if (options instanceof Array) {
        methods = options;
        options = null;
      }
      if (!methods) {
        methods = [];
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            methods.push(key);
          }
        }
      }
      for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        var original = obj[method];
        obj[method] = (/* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function retryWrapper(original2) {
          var op = exports.operation(options);
          var args = Array.prototype.slice.call(arguments, 1);
          var callback = args.pop();
          args.push(function(err) {
            if (op.retry(err)) {
              return;
            }
            if (err) {
              arguments[0] = op.mainError();
            }
            callback.apply(this, arguments);
          });
          op.attempt(function() {
            original2.apply(obj, args);
          });
        }, "retryWrapper")).bind(obj, original);
        obj[method].options = options;
      }
    };
  }
});

// node_modules/retry/index.js
var require_retry2 = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/retry/index.js"(exports, module) {
    module.exports = require_retry();
  }
});

// node_modules/p-retry/index.js
var require_p_retry = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-retry/index.js"(exports, module) {
    "use strict";
    var retry = require_retry2();
    var networkErrorMsgs = [
      "Failed to fetch",
      // Chrome
      "NetworkError when attempting to fetch resource.",
      // Firefox
      "The Internet connection appears to be offline.",
      // Safari
      "Network request failed"
      // `cross-fetch`
    ];
    var AbortError = class extends Error {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "AbortError");
      }
      constructor(message) {
        super();
        if (message instanceof Error) {
          this.originalError = message;
          ({ message } = message);
        } else {
          this.originalError = new Error(message);
          this.originalError.stack = this.stack;
        }
        this.name = "AbortError";
        this.message = message;
      }
    };
    var decorateErrorWithCounts = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (error, attemptNumber, options) => {
      const retriesLeft = options.retries - (attemptNumber - 1);
      error.attemptNumber = attemptNumber;
      error.retriesLeft = retriesLeft;
      return error;
    }, "decorateErrorWithCounts");
    var isNetworkError = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (errorMessage) => networkErrorMsgs.includes(errorMessage), "isNetworkError");
    var pRetry4 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (input, options) => new Promise((resolve, reject) => {
      options = {
        onFailedAttempt: () => {
        },
        retries: 10,
        ...options
      };
      const operation = retry.operation(options);
      operation.attempt(async (attemptNumber) => {
        try {
          resolve(await input(attemptNumber));
        } catch (error) {
          if (!(error instanceof Error)) {
            reject(new TypeError(`Non-error was thrown: "${error}". You should only throw errors.`));
            return;
          }
          if (error instanceof AbortError) {
            operation.stop();
            reject(error.originalError);
          } else if (error instanceof TypeError && !isNetworkError(error.message)) {
            operation.stop();
            reject(error);
          } else {
            decorateErrorWithCounts(error, attemptNumber, options);
            try {
              await options.onFailedAttempt(error);
            } catch (error2) {
              reject(error2);
              return;
            }
            if (!operation.retry(error)) {
              reject(operation.mainError());
            }
          }
        }
      });
    }), "pRetry");
    module.exports = pRetry4;
    module.exports.default = pRetry4;
    module.exports.AbortError = AbortError;
  }
});

// node_modules/ansi-styles/index.js
var require_ansi_styles = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/ansi-styles/index.js"(exports, module) {
    "use strict";
    var ANSI_BACKGROUND_OFFSET = 10;
    var wrapAnsi256 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`, "wrapAnsi256");
    var wrapAnsi16m = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`, "wrapAnsi16m");
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
    _chunkEC6JY3PVcjs.__name.call(void 0, assembleStyles, "assembleStyles");
    Object.defineProperty(module, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  }
});

// node_modules/eventemitter3/index.js
var require_eventemitter3 = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/eventemitter3/index.js"(exports, module) {
    "use strict";
    var has = Object.prototype.hasOwnProperty;
    var prefix = "~";
    function Events() {
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, Events, "Events");
    if (Object.create) {
      Events.prototype = /* @__PURE__ */ Object.create(null);
      if (!new Events().__proto__)
        prefix = false;
    }
    function EE(fn, context, once) {
      this.fn = fn;
      this.context = context;
      this.once = once || false;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, EE, "EE");
    function addListener(emitter, event, fn, context, once) {
      if (typeof fn !== "function") {
        throw new TypeError("The listener must be a function");
      }
      var listener = new EE(fn, context || emitter, once), evt = prefix ? prefix + event : event;
      if (!emitter._events[evt])
        emitter._events[evt] = listener, emitter._eventsCount++;
      else if (!emitter._events[evt].fn)
        emitter._events[evt].push(listener);
      else
        emitter._events[evt] = [emitter._events[evt], listener];
      return emitter;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, addListener, "addListener");
    function clearEvent(emitter, evt) {
      if (--emitter._eventsCount === 0)
        emitter._events = new Events();
      else
        delete emitter._events[evt];
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, clearEvent, "clearEvent");
    function EventEmitter() {
      this._events = new Events();
      this._eventsCount = 0;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, EventEmitter, "EventEmitter");
    EventEmitter.prototype.eventNames = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function eventNames() {
      var names = [], events, name;
      if (this._eventsCount === 0)
        return names;
      for (name in events = this._events) {
        if (has.call(events, name))
          names.push(prefix ? name.slice(1) : name);
      }
      if (Object.getOwnPropertySymbols) {
        return names.concat(Object.getOwnPropertySymbols(events));
      }
      return names;
    }, "eventNames");
    EventEmitter.prototype.listeners = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function listeners(event) {
      var evt = prefix ? prefix + event : event, handlers = this._events[evt];
      if (!handlers)
        return [];
      if (handlers.fn)
        return [handlers.fn];
      for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
      }
      return ee;
    }, "listeners");
    EventEmitter.prototype.listenerCount = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function listenerCount(event) {
      var evt = prefix ? prefix + event : event, listeners = this._events[evt];
      if (!listeners)
        return 0;
      if (listeners.fn)
        return 1;
      return listeners.length;
    }, "listenerCount");
    EventEmitter.prototype.emit = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function emit(event, a1, a2, a3, a4, a5) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return false;
      var listeners = this._events[evt], len = arguments.length, args, i;
      if (listeners.fn) {
        if (listeners.once)
          this.removeListener(event, listeners.fn, void 0, true);
        switch (len) {
          case 1:
            return listeners.fn.call(listeners.context), true;
          case 2:
            return listeners.fn.call(listeners.context, a1), true;
          case 3:
            return listeners.fn.call(listeners.context, a1, a2), true;
          case 4:
            return listeners.fn.call(listeners.context, a1, a2, a3), true;
          case 5:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
          case 6:
            return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
        }
        for (i = 1, args = new Array(len - 1); i < len; i++) {
          args[i - 1] = arguments[i];
        }
        listeners.fn.apply(listeners.context, args);
      } else {
        var length = listeners.length, j;
        for (i = 0; i < length; i++) {
          if (listeners[i].once)
            this.removeListener(event, listeners[i].fn, void 0, true);
          switch (len) {
            case 1:
              listeners[i].fn.call(listeners[i].context);
              break;
            case 2:
              listeners[i].fn.call(listeners[i].context, a1);
              break;
            case 3:
              listeners[i].fn.call(listeners[i].context, a1, a2);
              break;
            case 4:
              listeners[i].fn.call(listeners[i].context, a1, a2, a3);
              break;
            default:
              if (!args)
                for (j = 1, args = new Array(len - 1); j < len; j++) {
                  args[j - 1] = arguments[j];
                }
              listeners[i].fn.apply(listeners[i].context, args);
          }
        }
      }
      return true;
    }, "emit");
    EventEmitter.prototype.on = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function on(event, fn, context) {
      return addListener(this, event, fn, context, false);
    }, "on");
    EventEmitter.prototype.once = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function once(event, fn, context) {
      return addListener(this, event, fn, context, true);
    }, "once");
    EventEmitter.prototype.removeListener = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function removeListener(event, fn, context, once) {
      var evt = prefix ? prefix + event : event;
      if (!this._events[evt])
        return this;
      if (!fn) {
        clearEvent(this, evt);
        return this;
      }
      var listeners = this._events[evt];
      if (listeners.fn) {
        if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
          clearEvent(this, evt);
        }
      } else {
        for (var i = 0, events = [], length = listeners.length; i < length; i++) {
          if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
            events.push(listeners[i]);
          }
        }
        if (events.length)
          this._events[evt] = events.length === 1 ? events[0] : events;
        else
          clearEvent(this, evt);
      }
      return this;
    }, "removeListener");
    EventEmitter.prototype.removeAllListeners = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, function removeAllListeners(event) {
      var evt;
      if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt])
          clearEvent(this, evt);
      } else {
        this._events = new Events();
        this._eventsCount = 0;
      }
      return this;
    }, "removeAllListeners");
    EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
    EventEmitter.prototype.addListener = EventEmitter.prototype.on;
    EventEmitter.prefixed = prefix;
    EventEmitter.EventEmitter = EventEmitter;
    if ("undefined" !== typeof module) {
      module.exports = EventEmitter;
    }
  }
});

// node_modules/p-finally/index.js
var require_p_finally = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-finally/index.js"(exports, module) {
    "use strict";
    module.exports = (promise, onFinally) => {
      onFinally = onFinally || (() => {
      });
      return promise.then(
        (val) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => val),
        (err) => new Promise((resolve) => {
          resolve(onFinally());
        }).then(() => {
          throw err;
        })
      );
    };
  }
});

// node_modules/p-timeout/index.js
var require_p_timeout = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-timeout/index.js"(exports, module) {
    "use strict";
    var pFinally = require_p_finally();
    var TimeoutError = class extends Error {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "TimeoutError");
      }
      constructor(message) {
        super(message);
        this.name = "TimeoutError";
      }
    };
    var pTimeout = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (promise, milliseconds, fallback) => new Promise((resolve, reject) => {
      if (typeof milliseconds !== "number" || milliseconds < 0) {
        throw new TypeError("Expected `milliseconds` to be a positive number");
      }
      if (milliseconds === Infinity) {
        resolve(promise);
        return;
      }
      const timer = setTimeout(() => {
        if (typeof fallback === "function") {
          try {
            resolve(fallback());
          } catch (error) {
            reject(error);
          }
          return;
        }
        const message = typeof fallback === "string" ? fallback : `Promise timed out after ${milliseconds} milliseconds`;
        const timeoutError = fallback instanceof Error ? fallback : new TimeoutError(message);
        if (typeof promise.cancel === "function") {
          promise.cancel();
        }
        reject(timeoutError);
      }, milliseconds);
      pFinally(
        // eslint-disable-next-line promise/prefer-await-to-then
        promise.then(resolve, reject),
        () => {
          clearTimeout(timer);
        }
      );
    }), "pTimeout");
    module.exports = pTimeout;
    module.exports.default = pTimeout;
    module.exports.TimeoutError = TimeoutError;
  }
});

// node_modules/p-queue/dist/lower-bound.js
var require_lower_bound = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-queue/dist/lower-bound.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function lowerBound(array, value, comparator) {
      let first = 0;
      let count = array.length;
      while (count > 0) {
        const step = count / 2 | 0;
        let it = first + step;
        if (comparator(array[it], value) <= 0) {
          first = ++it;
          count -= step + 1;
        } else {
          count = step;
        }
      }
      return first;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, lowerBound, "lowerBound");
    exports.default = lowerBound;
  }
});

// node_modules/p-queue/dist/priority-queue.js
var require_priority_queue = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-queue/dist/priority-queue.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var lower_bound_1 = require_lower_bound();
    var PriorityQueue = class {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "PriorityQueue");
      }
      constructor() {
        this._queue = [];
      }
      enqueue(run, options) {
        options = Object.assign({ priority: 0 }, options);
        const element = {
          priority: options.priority,
          run
        };
        if (this.size && this._queue[this.size - 1].priority >= options.priority) {
          this._queue.push(element);
          return;
        }
        const index = lower_bound_1.default(this._queue, element, (a, b) => b.priority - a.priority);
        this._queue.splice(index, 0, element);
      }
      dequeue() {
        const item = this._queue.shift();
        return item === null || item === void 0 ? void 0 : item.run;
      }
      filter(options) {
        return this._queue.filter((element) => element.priority === options.priority).map((element) => element.run);
      }
      get size() {
        return this._queue.length;
      }
    };
    exports.default = PriorityQueue;
  }
});

// node_modules/p-queue/dist/index.js
var require_dist = _chunkEC6JY3PVcjs.__commonJS.call(void 0, {
  "node_modules/p-queue/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var EventEmitter = require_eventemitter3();
    var p_timeout_1 = require_p_timeout();
    var priority_queue_1 = require_priority_queue();
    var empty = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => {
    }, "empty");
    var timeoutError = new p_timeout_1.TimeoutError();
    var PQueue = class extends EventEmitter {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "PQueue");
      }
      constructor(options) {
        var _a, _b, _c, _d;
        super();
        this._intervalCount = 0;
        this._intervalEnd = 0;
        this._pendingCount = 0;
        this._resolveEmpty = empty;
        this._resolveIdle = empty;
        options = Object.assign({ carryoverConcurrencyCount: false, intervalCap: Infinity, interval: 0, concurrency: Infinity, autoStart: true, queueClass: priority_queue_1.default }, options);
        if (!(typeof options.intervalCap === "number" && options.intervalCap >= 1)) {
          throw new TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${(_b = (_a = options.intervalCap) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : ""}\` (${typeof options.intervalCap})`);
        }
        if (options.interval === void 0 || !(Number.isFinite(options.interval) && options.interval >= 0)) {
          throw new TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${(_d = (_c = options.interval) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : ""}\` (${typeof options.interval})`);
        }
        this._carryoverConcurrencyCount = options.carryoverConcurrencyCount;
        this._isIntervalIgnored = options.intervalCap === Infinity || options.interval === 0;
        this._intervalCap = options.intervalCap;
        this._interval = options.interval;
        this._queue = new options.queueClass();
        this._queueClass = options.queueClass;
        this.concurrency = options.concurrency;
        this._timeout = options.timeout;
        this._throwOnTimeout = options.throwOnTimeout === true;
        this._isPaused = options.autoStart === false;
      }
      get _doesIntervalAllowAnother() {
        return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
      }
      get _doesConcurrentAllowAnother() {
        return this._pendingCount < this._concurrency;
      }
      _next() {
        this._pendingCount--;
        this._tryToStartAnother();
        this.emit("next");
      }
      _resolvePromises() {
        this._resolveEmpty();
        this._resolveEmpty = empty;
        if (this._pendingCount === 0) {
          this._resolveIdle();
          this._resolveIdle = empty;
          this.emit("idle");
        }
      }
      _onResumeInterval() {
        this._onInterval();
        this._initializeIntervalIfNeeded();
        this._timeoutId = void 0;
      }
      _isIntervalPaused() {
        const now = Date.now();
        if (this._intervalId === void 0) {
          const delay = this._intervalEnd - now;
          if (delay < 0) {
            this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
          } else {
            if (this._timeoutId === void 0) {
              this._timeoutId = setTimeout(() => {
                this._onResumeInterval();
              }, delay);
            }
            return true;
          }
        }
        return false;
      }
      _tryToStartAnother() {
        if (this._queue.size === 0) {
          if (this._intervalId) {
            clearInterval(this._intervalId);
          }
          this._intervalId = void 0;
          this._resolvePromises();
          return false;
        }
        if (!this._isPaused) {
          const canInitializeInterval = !this._isIntervalPaused();
          if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
            const job = this._queue.dequeue();
            if (!job) {
              return false;
            }
            this.emit("active");
            job();
            if (canInitializeInterval) {
              this._initializeIntervalIfNeeded();
            }
            return true;
          }
        }
        return false;
      }
      _initializeIntervalIfNeeded() {
        if (this._isIntervalIgnored || this._intervalId !== void 0) {
          return;
        }
        this._intervalId = setInterval(() => {
          this._onInterval();
        }, this._interval);
        this._intervalEnd = Date.now() + this._interval;
      }
      _onInterval() {
        if (this._intervalCount === 0 && this._pendingCount === 0 && this._intervalId) {
          clearInterval(this._intervalId);
          this._intervalId = void 0;
        }
        this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
        this._processQueue();
      }
      /**
      Executes all queued functions until it reaches the limit.
      */
      _processQueue() {
        while (this._tryToStartAnother()) {
        }
      }
      get concurrency() {
        return this._concurrency;
      }
      set concurrency(newConcurrency) {
        if (!(typeof newConcurrency === "number" && newConcurrency >= 1)) {
          throw new TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${newConcurrency}\` (${typeof newConcurrency})`);
        }
        this._concurrency = newConcurrency;
        this._processQueue();
      }
      /**
      Adds a sync or async task to the queue. Always returns a promise.
      */
      async add(fn, options = {}) {
        return new Promise((resolve, reject) => {
          const run = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, async () => {
            this._pendingCount++;
            this._intervalCount++;
            try {
              const operation = this._timeout === void 0 && options.timeout === void 0 ? fn() : p_timeout_1.default(Promise.resolve(fn()), options.timeout === void 0 ? this._timeout : options.timeout, () => {
                if (options.throwOnTimeout === void 0 ? this._throwOnTimeout : options.throwOnTimeout) {
                  reject(timeoutError);
                }
                return void 0;
              });
              resolve(await operation);
            } catch (error) {
              reject(error);
            }
            this._next();
          }, "run");
          this._queue.enqueue(run, options);
          this._tryToStartAnother();
          this.emit("add");
        });
      }
      /**
          Same as `.add()`, but accepts an array of sync or async functions.
      
          @returns A promise that resolves when all functions are resolved.
          */
      async addAll(functions, options) {
        return Promise.all(functions.map(async (function_) => this.add(function_, options)));
      }
      /**
      Start (or resume) executing enqueued tasks within concurrency limit. No need to call this if queue is not paused (via `options.autoStart = false` or by `.pause()` method.)
      */
      start() {
        if (!this._isPaused) {
          return this;
        }
        this._isPaused = false;
        this._processQueue();
        return this;
      }
      /**
      Put queue execution on hold.
      */
      pause() {
        this._isPaused = true;
      }
      /**
      Clear the queue.
      */
      clear() {
        this._queue = new this._queueClass();
      }
      /**
          Can be called multiple times. Useful if you for example add additional items at a later time.
      
          @returns A promise that settles when the queue becomes empty.
          */
      async onEmpty() {
        if (this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveEmpty;
          this._resolveEmpty = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
          The difference with `.onEmpty` is that `.onIdle` guarantees that all work from the queue has finished. `.onEmpty` merely signals that the queue is empty, but it could mean that some promises haven't completed yet.
      
          @returns A promise that settles when the queue becomes empty, and all promises have completed; `queue.size === 0 && queue.pending === 0`.
          */
      async onIdle() {
        if (this._pendingCount === 0 && this._queue.size === 0) {
          return;
        }
        return new Promise((resolve) => {
          const existingResolve = this._resolveIdle;
          this._resolveIdle = () => {
            existingResolve();
            resolve();
          };
        });
      }
      /**
      Size of the queue.
      */
      get size() {
        return this._queue.size;
      }
      /**
          Size of the queue, filtered by the given options.
      
          For example, this can be used to find the number of items remaining in the queue with a specific priority level.
          */
      sizeBy(options) {
        return this._queue.filter(options).length;
      }
      /**
      Number of pending promises.
      */
      get pending() {
        return this._pendingCount;
      }
      /**
      Whether the queue is currently paused.
      */
      get isPaused() {
        return this._isPaused;
      }
      get timeout() {
        return this._timeout;
      }
      /**
      Set the timeout for future operations.
      */
      set timeout(milliseconds) {
        this._timeout = milliseconds;
      }
    };
    exports.default = PQueue;
  }
});

// node_modules/@langchain/core/dist/load/map_keys.js
var import_decamelize = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_decamelize(), 1);
var import_camelcase = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_camelcase(), 1);
function keyToJson(key, map) {
  return _optionalChain([map, 'optionalAccess', _2 => _2[key]]) || (0, import_decamelize.default)(key);
}
_chunkEC6JY3PVcjs.__name.call(void 0, keyToJson, "keyToJson");
function mapKeys(fields, mapper, map) {
  const mapped = {};
  for (const key in fields) {
    if (Object.hasOwn(fields, key)) {
      mapped[mapper(key, map)] = fields[key];
    }
  }
  return mapped;
}
_chunkEC6JY3PVcjs.__name.call(void 0, mapKeys, "mapKeys");

// node_modules/@langchain/core/dist/load/serializable.js
function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}
_chunkEC6JY3PVcjs.__name.call(void 0, shallowCopy, "shallowCopy");
function replaceSecrets(root, secretsMap) {
  const result = shallowCopy(root);
  for (const [path, secretId] of Object.entries(secretsMap)) {
    const [last, ...partsReverse] = path.split(".").reverse();
    let current = result;
    for (const part of partsReverse.reverse()) {
      if (current[part] === void 0) {
        break;
      }
      current[part] = shallowCopy(current[part]);
      current = current[part];
    }
    if (current[last] !== void 0) {
      current[last] = {
        lc: 1,
        type: "secret",
        id: [secretId]
      };
    }
  }
  return result;
}
_chunkEC6JY3PVcjs.__name.call(void 0, replaceSecrets, "replaceSecrets");
function get_lc_unique_name(serializableClass) {
  const parentClass = Object.getPrototypeOf(serializableClass);
  const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
  if (lcNameIsSubclassed) {
    return serializableClass.lc_name();
  } else {
    return serializableClass.name;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, get_lc_unique_name, "get_lc_unique_name");
var Serializable = class _Serializable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "Serializable");
  }
  /**
   * The name of the serializable. Override to provide an alias or
   * to preserve the serialized module name in minified environments.
   *
   * Implemented as a static method to support loading logic.
   */
  static lc_name() {
    return this.name;
  }
  /**
   * The final serialized identifier for the module.
   */
  get lc_id() {
    return [
      ...this.lc_namespace,
      get_lc_unique_name(this.constructor)
    ];
  }
  /**
   * A map of secrets, which will be omitted from serialization.
   * Keys are paths to the secret in constructor args, e.g. "foo.bar.baz".
   * Values are the secret ids, which will be used when deserializing.
   */
  get lc_secrets() {
    return void 0;
  }
  /**
   * A map of additional attributes to merge with constructor args.
   * Keys are the attribute names, e.g. "foo".
   * Values are the attribute values, which will be serialized.
   * These attributes need to be accepted by the constructor as arguments.
   */
  get lc_attributes() {
    return void 0;
  }
  /**
   * A map of aliases for constructor args.
   * Keys are the attribute names, e.g. "foo".
   * Values are the alias that will replace the key in serialization.
   * This is used to eg. make argument names match Python.
   */
  get lc_aliases() {
    return void 0;
  }
  constructor(kwargs, ..._args) {
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "lc_kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.lc_kwargs = kwargs || {};
  }
  toJSON() {
    if (!this.lc_serializable) {
      return this.toJSONNotImplemented();
    }
    if (
      // eslint-disable-next-line no-instanceof/no-instanceof
      this.lc_kwargs instanceof _Serializable || typeof this.lc_kwargs !== "object" || Array.isArray(this.lc_kwargs)
    ) {
      return this.toJSONNotImplemented();
    }
    const aliases = {};
    const secrets = {};
    const kwargs = Object.keys(this.lc_kwargs).reduce((acc, key) => {
      acc[key] = key in this ? this[key] : this.lc_kwargs[key];
      return acc;
    }, {});
    for (let current = Object.getPrototypeOf(this); current; current = Object.getPrototypeOf(current)) {
      Object.assign(aliases, Reflect.get(current, "lc_aliases", this));
      Object.assign(secrets, Reflect.get(current, "lc_secrets", this));
      Object.assign(kwargs, Reflect.get(current, "lc_attributes", this));
    }
    Object.keys(secrets).forEach((keyPath) => {
      let read = this;
      let write = kwargs;
      const [last, ...partsReverse] = keyPath.split(".").reverse();
      for (const key of partsReverse.reverse()) {
        if (!(key in read) || read[key] === void 0)
          return;
        if (!(key in write) || write[key] === void 0) {
          if (typeof read[key] === "object" && read[key] != null) {
            write[key] = {};
          } else if (Array.isArray(read[key])) {
            write[key] = [];
          }
        }
        read = read[key];
        write = write[key];
      }
      if (last in read && read[last] !== void 0) {
        write[last] = write[last] || read[last];
      }
    });
    return {
      lc: 1,
      type: "constructor",
      id: this.lc_id,
      kwargs: mapKeys(Object.keys(secrets).length ? replaceSecrets(kwargs, secrets) : kwargs, keyToJson, aliases)
    };
  }
  toJSONNotImplemented() {
    return {
      lc: 1,
      type: "not_implemented",
      id: this.lc_id
    };
  }
};

// node_modules/@langchain/core/dist/messages/index.js
function mergeContent(firstContent, secondContent) {
  if (typeof firstContent === "string") {
    if (typeof secondContent === "string") {
      return firstContent + secondContent;
    } else {
      return [{ type: "text", text: firstContent }, ...secondContent];
    }
  } else if (Array.isArray(secondContent)) {
    return [...firstContent, ...secondContent];
  } else {
    return [...firstContent, { type: "text", text: secondContent }];
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, mergeContent, "mergeContent");
var BaseMessage = class extends Serializable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseMessage");
  }
  get lc_aliases() {
    return { additional_kwargs: "additional_kwargs" };
  }
  /**
   * @deprecated
   * Use {@link BaseMessage.content} instead.
   */
  get text() {
    return typeof this.content === "string" ? this.content : "";
  }
  constructor(fields, kwargs) {
    if (typeof fields === "string") {
      fields = { content: fields, additional_kwargs: kwargs };
    }
    if (!fields.additional_kwargs) {
      fields.additional_kwargs = {};
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "messages"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "content", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "additional_kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.name = fields.name;
    this.content = fields.content;
    this.additional_kwargs = fields.additional_kwargs;
  }
  toDict() {
    return {
      type: this._getType(),
      data: this.toJSON().kwargs
    };
  }
  toChunk() {
    const type = this._getType();
    if (type === "human") {
      return new HumanMessageChunk({ ...this });
    } else if (type === "ai") {
      return new AIMessageChunk({ ...this });
    } else if (type === "system") {
      return new SystemMessageChunk({ ...this });
    } else if (type === "function") {
      return new FunctionMessageChunk({ ...this });
    } else if (ChatMessage.isInstance(this)) {
      return new ChatMessageChunk({ ...this });
    } else {
      throw new Error("Unknown message type.");
    }
  }
};
function isOpenAIToolCallArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v.index === "number");
}
_chunkEC6JY3PVcjs.__name.call(void 0, isOpenAIToolCallArray, "isOpenAIToolCallArray");
var BaseMessageChunk = class extends BaseMessage {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseMessageChunk");
  }
  static _mergeAdditionalKwargs(left, right) {
    const merged = { ...left };
    for (const [key, value] of Object.entries(right)) {
      if (merged[key] === void 0) {
        merged[key] = value;
      } else if (typeof merged[key] !== typeof value) {
        throw new Error(`additional_kwargs[${key}] already exists in the message chunk, but with a different type.`);
      } else if (typeof merged[key] === "string") {
        merged[key] = merged[key] + value;
      } else if (!Array.isArray(merged[key]) && typeof merged[key] === "object") {
        merged[key] = this._mergeAdditionalKwargs(merged[key], value);
      } else if (key === "tool_calls" && isOpenAIToolCallArray(merged[key]) && isOpenAIToolCallArray(value)) {
        for (const toolCall of value) {
          if (_optionalChain([merged, 'access', _3 => _3[key], 'optionalAccess', _4 => _4[toolCall.index]]) !== void 0) {
            merged[key] = _optionalChain([merged, 'access', _5 => _5[key], 'optionalAccess', _6 => _6.map, 'call', _7 => _7((value2, i) => {
              if (i !== toolCall.index) {
                return value2;
              }
              return {
                ...value2,
                ...toolCall,
                function: {
                  name: _nullishCoalesce(toolCall.function.name, () => ( value2.function.name)),
                  arguments: (_nullishCoalesce(value2.function.arguments, () => ( ""))) + (_nullishCoalesce(toolCall.function.arguments, () => ( "")))
                }
              };
            })]);
          } else {
            merged[key][toolCall.index] = toolCall;
          }
        }
      } else {
        throw new Error(`additional_kwargs[${key}] already exists in this message chunk.`);
      }
    }
    return merged;
  }
};
var HumanMessage = class extends BaseMessage {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "HumanMessage");
  }
  static lc_name() {
    return "HumanMessage";
  }
  _getType() {
    return "human";
  }
};
var HumanMessageChunk = class _HumanMessageChunk extends BaseMessageChunk {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "HumanMessageChunk");
  }
  static lc_name() {
    return "HumanMessageChunk";
  }
  _getType() {
    return "human";
  }
  concat(chunk) {
    return new _HumanMessageChunk({
      content: mergeContent(this.content, chunk.content),
      additional_kwargs: _HumanMessageChunk._mergeAdditionalKwargs(this.additional_kwargs, chunk.additional_kwargs)
    });
  }
};
var AIMessage = class extends BaseMessage {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AIMessage");
  }
  static lc_name() {
    return "AIMessage";
  }
  _getType() {
    return "ai";
  }
};
var AIMessageChunk = class _AIMessageChunk extends BaseMessageChunk {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AIMessageChunk");
  }
  static lc_name() {
    return "AIMessageChunk";
  }
  _getType() {
    return "ai";
  }
  concat(chunk) {
    return new _AIMessageChunk({
      content: mergeContent(this.content, chunk.content),
      additional_kwargs: _AIMessageChunk._mergeAdditionalKwargs(this.additional_kwargs, chunk.additional_kwargs)
    });
  }
};
var SystemMessage = class extends BaseMessage {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "SystemMessage");
  }
  static lc_name() {
    return "SystemMessage";
  }
  _getType() {
    return "system";
  }
};
var SystemMessageChunk = class _SystemMessageChunk extends BaseMessageChunk {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "SystemMessageChunk");
  }
  static lc_name() {
    return "SystemMessageChunk";
  }
  _getType() {
    return "system";
  }
  concat(chunk) {
    return new _SystemMessageChunk({
      content: mergeContent(this.content, chunk.content),
      additional_kwargs: _SystemMessageChunk._mergeAdditionalKwargs(this.additional_kwargs, chunk.additional_kwargs)
    });
  }
};
var FunctionMessageChunk = class _FunctionMessageChunk extends BaseMessageChunk {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "FunctionMessageChunk");
  }
  static lc_name() {
    return "FunctionMessageChunk";
  }
  _getType() {
    return "function";
  }
  concat(chunk) {
    return new _FunctionMessageChunk({
      content: mergeContent(this.content, chunk.content),
      additional_kwargs: _FunctionMessageChunk._mergeAdditionalKwargs(this.additional_kwargs, chunk.additional_kwargs),
      name: _nullishCoalesce(this.name, () => ( ""))
    });
  }
};
var ChatMessage = class extends BaseMessage {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ChatMessage");
  }
  static lc_name() {
    return "ChatMessage";
  }
  constructor(fields, role) {
    if (typeof fields === "string") {
      fields = { content: fields, role };
    }
    super(fields);
    Object.defineProperty(this, "role", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.role = fields.role;
  }
  _getType() {
    return "generic";
  }
  static isInstance(message) {
    return message._getType() === "generic";
  }
};
function isBaseMessage(messageLike) {
  return typeof _optionalChain([messageLike, 'optionalAccess', _8 => _8._getType]) === "function";
}
_chunkEC6JY3PVcjs.__name.call(void 0, isBaseMessage, "isBaseMessage");
function coerceMessageLikeToMessage(messageLike) {
  if (typeof messageLike === "string") {
    return new HumanMessage(messageLike);
  } else if (isBaseMessage(messageLike)) {
    return messageLike;
  }
  const [type, content] = messageLike;
  if (type === "human" || type === "user") {
    return new HumanMessage({ content });
  } else if (type === "ai" || type === "assistant") {
    return new AIMessage({ content });
  } else if (type === "system") {
    return new SystemMessage({ content });
  } else {
    throw new Error(`Unable to coerce message from array: only human, AI, or system message coercion is currently supported.`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, coerceMessageLikeToMessage, "coerceMessageLikeToMessage");
var ChatMessageChunk = class _ChatMessageChunk extends BaseMessageChunk {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ChatMessageChunk");
  }
  static lc_name() {
    return "ChatMessageChunk";
  }
  constructor(fields, role) {
    if (typeof fields === "string") {
      fields = { content: fields, role };
    }
    super(fields);
    Object.defineProperty(this, "role", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.role = fields.role;
  }
  _getType() {
    return "generic";
  }
  concat(chunk) {
    return new _ChatMessageChunk({
      content: mergeContent(this.content, chunk.content),
      additional_kwargs: _ChatMessageChunk._mergeAdditionalKwargs(this.additional_kwargs, chunk.additional_kwargs),
      role: this.role
    });
  }
};
function getBufferString(messages, humanPrefix = "Human", aiPrefix = "AI") {
  const string_messages = [];
  for (const m of messages) {
    let role;
    if (m._getType() === "human") {
      role = humanPrefix;
    } else if (m._getType() === "ai") {
      role = aiPrefix;
    } else if (m._getType() === "system") {
      role = "System";
    } else if (m._getType() === "function") {
      role = "Function";
    } else if (m._getType() === "tool") {
      role = "Tool";
    } else if (m._getType() === "generic") {
      role = m.role;
    } else {
      throw new Error(`Got unsupported message type: ${m._getType()}`);
    }
    const nameStr = m.name ? `${m.name}, ` : "";
    string_messages.push(`${role}: ${nameStr}${m.content}`);
  }
  return string_messages.join("\n");
}
_chunkEC6JY3PVcjs.__name.call(void 0, getBufferString, "getBufferString");

// node_modules/@langchain/core/dist/prompt_values.js
var BasePromptValue = class extends Serializable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BasePromptValue");
  }
};
var StringPromptValue = class extends BasePromptValue {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "StringPromptValue");
  }
  static lc_name() {
    return "StringPromptValue";
  }
  constructor(value) {
    super({ value });
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompt_values"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "value", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.value = value;
  }
  toString() {
    return this.value;
  }
  toChatMessages() {
    return [new HumanMessage(this.value)];
  }
};
var ChatPromptValue = class extends BasePromptValue {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ChatPromptValue");
  }
  static lc_name() {
    return "ChatPromptValue";
  }
  constructor(fields) {
    if (Array.isArray(fields)) {
      fields = { messages: fields };
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompt_values"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "messages", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.messages = fields.messages;
  }
  toString() {
    return getBufferString(this.messages);
  }
  toChatMessages() {
    return this.messages;
  }
};

// node_modules/@langchain/core/dist/runnables/base.js
var import_p_retry3 = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_p_retry(), 1);

// node_modules/uuid/dist/esm-node/rng.js
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    _crypto2.default.randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
_chunkEC6JY3PVcjs.__name.call(void 0, rng, "rng");

// node_modules/uuid/dist/esm-node/regex.js
var regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

// node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
  return typeof uuid === "string" && regex_default.test(uuid);
}
_chunkEC6JY3PVcjs.__name.call(void 0, validate, "validate");
var validate_default = validate;

// node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
_chunkEC6JY3PVcjs.__name.call(void 0, unsafeStringify, "unsafeStringify");

// node_modules/uuid/dist/esm-node/native.js

var native_default = {
  randomUUID: _crypto2.default.randomUUID
};

// node_modules/uuid/dist/esm-node/v4.js
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
_chunkEC6JY3PVcjs.__name.call(void 0, v4, "v4");
var v4_default = v4;

// node_modules/@langchain/core/dist/callbacks/base.js
var BaseCallbackHandlerMethodsClass = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseCallbackHandlerMethodsClass");
  }
};
var BaseCallbackHandler = class _BaseCallbackHandler extends BaseCallbackHandlerMethodsClass {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseCallbackHandler");
  }
  get lc_namespace() {
    return ["langchain_core", "callbacks", this.name];
  }
  get lc_secrets() {
    return void 0;
  }
  get lc_attributes() {
    return void 0;
  }
  get lc_aliases() {
    return void 0;
  }
  /**
   * The name of the serializable. Override to provide an alias or
   * to preserve the serialized module name in minified environments.
   *
   * Implemented as a static method to support loading logic.
   */
  static lc_name() {
    return this.name;
  }
  /**
   * The final serialized identifier for the module.
   */
  get lc_id() {
    return [
      ...this.lc_namespace,
      get_lc_unique_name(this.constructor)
    ];
  }
  constructor(input) {
    super();
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "lc_kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
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
    Object.defineProperty(this, "ignoreRetriever", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "awaitHandlers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: typeof process !== "undefined" ? (
        // eslint-disable-next-line no-process-env
        _optionalChain([process, 'access', _9 => _9.env, 'optionalAccess', _10 => _10.LANGCHAIN_CALLBACKS_BACKGROUND]) !== "true"
      ) : true
    });
    this.lc_kwargs = input || {};
    if (input) {
      this.ignoreLLM = _nullishCoalesce(input.ignoreLLM, () => ( this.ignoreLLM));
      this.ignoreChain = _nullishCoalesce(input.ignoreChain, () => ( this.ignoreChain));
      this.ignoreAgent = _nullishCoalesce(input.ignoreAgent, () => ( this.ignoreAgent));
      this.ignoreRetriever = _nullishCoalesce(input.ignoreRetriever, () => ( this.ignoreRetriever));
    }
  }
  copy() {
    return new this.constructor(this);
  }
  toJSON() {
    return Serializable.prototype.toJSON.call(this);
  }
  toJSONNotImplemented() {
    return Serializable.prototype.toJSONNotImplemented.call(this);
  }
  static fromMethods(methods) {
    class Handler extends _BaseCallbackHandler {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "Handler");
      }
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

// node_modules/@langchain/core/dist/tracers/console.js
var import_ansi_styles = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_ansi_styles(), 1);

// node_modules/@langchain/core/dist/tracers/base.js
function _coerceToDict(value, defaultKey) {
  return value && !Array.isArray(value) && typeof value === "object" ? value : { [defaultKey]: value };
}
_chunkEC6JY3PVcjs.__name.call(void 0, _coerceToDict, "_coerceToDict");
function stripNonAlphanumeric(input) {
  return input.replace(/[-:.]/g, "");
}
_chunkEC6JY3PVcjs.__name.call(void 0, stripNonAlphanumeric, "stripNonAlphanumeric");
function convertToDottedOrderFormat(epoch, runId) {
  return stripNonAlphanumeric(`${new Date(epoch).toISOString().slice(0, -1)}000Z`) + runId;
}
_chunkEC6JY3PVcjs.__name.call(void 0, convertToDottedOrderFormat, "convertToDottedOrderFormat");
var BaseTracer = class extends BaseCallbackHandler {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseTracer");
  }
  constructor(_fields) {
    super(...arguments);
    Object.defineProperty(this, "runMap", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
  }
  copy() {
    return this;
  }
  _addChildRun(parentRun, childRun) {
    parentRun.child_runs.push(childRun);
  }
  async _startTrace(run) {
    const currentDottedOrder = convertToDottedOrderFormat(run.start_time, run.id);
    const storedRun = { ...run };
    if (storedRun.parent_run_id !== void 0) {
      const parentRun = this.runMap.get(storedRun.parent_run_id);
      if (parentRun) {
        this._addChildRun(parentRun, storedRun);
        parentRun.child_execution_order = Math.max(parentRun.child_execution_order, storedRun.child_execution_order);
        storedRun.trace_id = parentRun.trace_id;
        if (parentRun.dotted_order !== void 0) {
          storedRun.dotted_order = [
            parentRun.dotted_order,
            currentDottedOrder
          ].join(".");
        } else {
        }
      } else {
      }
    } else {
      storedRun.trace_id = storedRun.id;
      storedRun.dotted_order = currentDottedOrder;
    }
    this.runMap.set(storedRun.id, storedRun);
    await _optionalChain([this, 'access', _11 => _11.onRunCreate, 'optionalCall', _12 => _12(storedRun)]);
  }
  async _endTrace(run) {
    const parentRun = run.parent_run_id !== void 0 && this.runMap.get(run.parent_run_id);
    if (parentRun) {
      parentRun.child_execution_order = Math.max(parentRun.child_execution_order, run.child_execution_order);
    } else {
      await this.persistRun(run);
    }
    this.runMap.delete(run.id);
    await _optionalChain([this, 'access', _13 => _13.onRunUpdate, 'optionalCall', _14 => _14(run)]);
  }
  _getExecutionOrder(parentRunId) {
    const parentRun = parentRunId !== void 0 && this.runMap.get(parentRunId);
    if (!parentRun) {
      return 1;
    }
    return parentRun.child_execution_order + 1;
  }
  async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata, name) {
    const execution_order = this._getExecutionOrder(parentRunId);
    const start_time = Date.now();
    const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
    const run = {
      id: runId,
      name: _nullishCoalesce(name, () => ( llm.id[llm.id.length - 1])),
      parent_run_id: parentRunId,
      start_time,
      serialized: llm,
      events: [
        {
          name: "start",
          time: new Date(start_time).toISOString()
        }
      ],
      inputs: { prompts },
      execution_order,
      child_runs: [],
      child_execution_order: execution_order,
      run_type: "llm",
      extra: _nullishCoalesce(finalExtraParams, () => ( {})),
      tags: tags || []
    };
    await this._startTrace(run);
    await _optionalChain([this, 'access', _15 => _15.onLLMStart, 'optionalCall', _16 => _16(run)]);
    return run;
  }
  async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata, name) {
    const execution_order = this._getExecutionOrder(parentRunId);
    const start_time = Date.now();
    const finalExtraParams = metadata ? { ...extraParams, metadata } : extraParams;
    const run = {
      id: runId,
      name: _nullishCoalesce(name, () => ( llm.id[llm.id.length - 1])),
      parent_run_id: parentRunId,
      start_time,
      serialized: llm,
      events: [
        {
          name: "start",
          time: new Date(start_time).toISOString()
        }
      ],
      inputs: { messages },
      execution_order,
      child_runs: [],
      child_execution_order: execution_order,
      run_type: "llm",
      extra: _nullishCoalesce(finalExtraParams, () => ( {})),
      tags: tags || []
    };
    await this._startTrace(run);
    await _optionalChain([this, 'access', _17 => _17.onLLMStart, 'optionalCall', _18 => _18(run)]);
    return run;
  }
  async handleLLMEnd(output, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _19 => _19.run_type]) !== "llm") {
      throw new Error("No LLM run to end.");
    }
    run.end_time = Date.now();
    run.outputs = output;
    run.events.push({
      name: "end",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _20 => _20.onLLMEnd, 'optionalCall', _21 => _21(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleLLMError(error, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _22 => _22.run_type]) !== "llm") {
      throw new Error("No LLM run to end.");
    }
    run.end_time = Date.now();
    run.error = error.message;
    run.events.push({
      name: "error",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _23 => _23.onLLMError, 'optionalCall', _24 => _24(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata, runType, name) {
    const execution_order = this._getExecutionOrder(parentRunId);
    const start_time = Date.now();
    const run = {
      id: runId,
      name: _nullishCoalesce(name, () => ( chain.id[chain.id.length - 1])),
      parent_run_id: parentRunId,
      start_time,
      serialized: chain,
      events: [
        {
          name: "start",
          time: new Date(start_time).toISOString()
        }
      ],
      inputs,
      execution_order,
      child_execution_order: execution_order,
      run_type: _nullishCoalesce(runType, () => ( "chain")),
      child_runs: [],
      extra: metadata ? { metadata } : {},
      tags: tags || []
    };
    await this._startTrace(run);
    await _optionalChain([this, 'access', _25 => _25.onChainStart, 'optionalCall', _26 => _26(run)]);
    return run;
  }
  async handleChainEnd(outputs, runId, _parentRunId, _tags, kwargs) {
    const run = this.runMap.get(runId);
    if (!run) {
      throw new Error("No chain run to end.");
    }
    run.end_time = Date.now();
    run.outputs = _coerceToDict(outputs, "output");
    run.events.push({
      name: "end",
      time: new Date(run.end_time).toISOString()
    });
    if (_optionalChain([kwargs, 'optionalAccess', _27 => _27.inputs]) !== void 0) {
      run.inputs = _coerceToDict(kwargs.inputs, "input");
    }
    await _optionalChain([this, 'access', _28 => _28.onChainEnd, 'optionalCall', _29 => _29(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleChainError(error, runId, _parentRunId, _tags, kwargs) {
    const run = this.runMap.get(runId);
    if (!run) {
      throw new Error("No chain run to end.");
    }
    run.end_time = Date.now();
    run.error = error.message + (_optionalChain([error, 'optionalAccess', _30 => _30.stack]) ? `

${error.stack}` : "");
    run.events.push({
      name: "error",
      time: new Date(run.end_time).toISOString()
    });
    if (_optionalChain([kwargs, 'optionalAccess', _31 => _31.inputs]) !== void 0) {
      run.inputs = _coerceToDict(kwargs.inputs, "input");
    }
    await _optionalChain([this, 'access', _32 => _32.onChainError, 'optionalCall', _33 => _33(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleToolStart(tool, input, runId, parentRunId, tags, metadata, name) {
    const execution_order = this._getExecutionOrder(parentRunId);
    const start_time = Date.now();
    const run = {
      id: runId,
      name: _nullishCoalesce(name, () => ( tool.id[tool.id.length - 1])),
      parent_run_id: parentRunId,
      start_time,
      serialized: tool,
      events: [
        {
          name: "start",
          time: new Date(start_time).toISOString()
        }
      ],
      inputs: { input },
      execution_order,
      child_execution_order: execution_order,
      run_type: "tool",
      child_runs: [],
      extra: metadata ? { metadata } : {},
      tags: tags || []
    };
    await this._startTrace(run);
    await _optionalChain([this, 'access', _34 => _34.onToolStart, 'optionalCall', _35 => _35(run)]);
    return run;
  }
  async handleToolEnd(output, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _36 => _36.run_type]) !== "tool") {
      throw new Error("No tool run to end");
    }
    run.end_time = Date.now();
    run.outputs = { output };
    run.events.push({
      name: "end",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _37 => _37.onToolEnd, 'optionalCall', _38 => _38(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleToolError(error, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _39 => _39.run_type]) !== "tool") {
      throw new Error("No tool run to end");
    }
    run.end_time = Date.now();
    run.error = error.message;
    run.events.push({
      name: "error",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _40 => _40.onToolError, 'optionalCall', _41 => _41(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleAgentAction(action, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _42 => _42.run_type]) !== "chain") {
      return;
    }
    const agentRun = run;
    agentRun.actions = agentRun.actions || [];
    agentRun.actions.push(action);
    agentRun.events.push({
      name: "agent_action",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      kwargs: { action }
    });
    await _optionalChain([this, 'access', _43 => _43.onAgentAction, 'optionalCall', _44 => _44(run)]);
  }
  async handleAgentEnd(action, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _45 => _45.run_type]) !== "chain") {
      return;
    }
    run.events.push({
      name: "agent_end",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      kwargs: { action }
    });
    await _optionalChain([this, 'access', _46 => _46.onAgentEnd, 'optionalCall', _47 => _47(run)]);
  }
  async handleRetrieverStart(retriever, query, runId, parentRunId, tags, metadata, name) {
    const execution_order = this._getExecutionOrder(parentRunId);
    const start_time = Date.now();
    const run = {
      id: runId,
      name: _nullishCoalesce(name, () => ( retriever.id[retriever.id.length - 1])),
      parent_run_id: parentRunId,
      start_time,
      serialized: retriever,
      events: [
        {
          name: "start",
          time: new Date(start_time).toISOString()
        }
      ],
      inputs: { query },
      execution_order,
      child_execution_order: execution_order,
      run_type: "retriever",
      child_runs: [],
      extra: metadata ? { metadata } : {},
      tags: tags || []
    };
    await this._startTrace(run);
    await _optionalChain([this, 'access', _48 => _48.onRetrieverStart, 'optionalCall', _49 => _49(run)]);
    return run;
  }
  async handleRetrieverEnd(documents, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _50 => _50.run_type]) !== "retriever") {
      throw new Error("No retriever run to end");
    }
    run.end_time = Date.now();
    run.outputs = { documents };
    run.events.push({
      name: "end",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _51 => _51.onRetrieverEnd, 'optionalCall', _52 => _52(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleRetrieverError(error, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _53 => _53.run_type]) !== "retriever") {
      throw new Error("No retriever run to end");
    }
    run.end_time = Date.now();
    run.error = error.message;
    run.events.push({
      name: "error",
      time: new Date(run.end_time).toISOString()
    });
    await _optionalChain([this, 'access', _54 => _54.onRetrieverError, 'optionalCall', _55 => _55(run)]);
    await this._endTrace(run);
    return run;
  }
  async handleText(text, runId) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _56 => _56.run_type]) !== "chain") {
      return;
    }
    run.events.push({
      name: "text",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      kwargs: { text }
    });
    await _optionalChain([this, 'access', _57 => _57.onText, 'optionalCall', _58 => _58(run)]);
  }
  async handleLLMNewToken(token, idx, runId, _parentRunId, _tags, fields) {
    const run = this.runMap.get(runId);
    if (!run || _optionalChain([run, 'optionalAccess', _59 => _59.run_type]) !== "llm") {
      throw new Error(`Invalid "runId" provided to "handleLLMNewToken" callback.`);
    }
    run.events.push({
      name: "new_token",
      time: (/* @__PURE__ */ new Date()).toISOString(),
      kwargs: { token, idx, chunk: _optionalChain([fields, 'optionalAccess', _60 => _60.chunk]) }
    });
    await _optionalChain([this, 'access', _61 => _61.onLLMNewToken, 'optionalCall', _62 => _62(run, token)]);
    return run;
  }
};

// node_modules/@langchain/core/dist/tracers/console.js
function wrap(style, text) {
  return `${style.open}${text}${style.close}`;
}
_chunkEC6JY3PVcjs.__name.call(void 0, wrap, "wrap");
function tryJsonStringify(obj, fallback) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, tryJsonStringify, "tryJsonStringify");
function elapsed(run) {
  if (!run.end_time)
    return "";
  const elapsed2 = run.end_time - run.start_time;
  if (elapsed2 < 1e3) {
    return `${elapsed2}ms`;
  }
  return `${(elapsed2 / 1e3).toFixed(2)}s`;
}
_chunkEC6JY3PVcjs.__name.call(void 0, elapsed, "elapsed");
var { color } = import_ansi_styles.default;
var ConsoleCallbackHandler = class extends BaseTracer {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ConsoleCallbackHandler");
  }
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "console_callback_handler"
    });
  }
  /**
   * Method used to persist the run. In this case, it simply returns a
   * resolved promise as there's no persistence logic.
   * @param _run The run to persist.
   * @returns A resolved promise.
   */
  persistRun(_run) {
    return Promise.resolve();
  }
  // utility methods
  /**
   * Method used to get all the parent runs of a given run.
   * @param run The run whose parents are to be retrieved.
   * @returns An array of parent runs.
   */
  getParents(run) {
    const parents = [];
    let currentRun = run;
    while (currentRun.parent_run_id) {
      const parent = this.runMap.get(currentRun.parent_run_id);
      if (parent) {
        parents.push(parent);
        currentRun = parent;
      } else {
        break;
      }
    }
    return parents;
  }
  /**
   * Method used to get a string representation of the run's lineage, which
   * is used in logging.
   * @param run The run whose lineage is to be retrieved.
   * @returns A string representation of the run's lineage.
   */
  getBreadcrumbs(run) {
    const parents = this.getParents(run).reverse();
    const string = [...parents, run].map((parent, i, arr) => {
      const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
      return i === arr.length - 1 ? wrap(import_ansi_styles.default.bold, name) : name;
    }).join(" > ");
    return wrap(color.grey, string);
  }
  // logging methods
  /**
   * Method used to log the start of a chain run.
   * @param run The chain run that has started.
   * @returns void
   */
  onChainStart(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.green, "[chain/start]")} [${crumbs}] Entering Chain run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
  }
  /**
   * Method used to log the end of a chain run.
   * @param run The chain run that has ended.
   * @returns void
   */
  onChainEnd(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.cyan, "[chain/end]")} [${crumbs}] [${elapsed(run)}] Exiting Chain run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
  }
  /**
   * Method used to log any errors of a chain run.
   * @param run The chain run that has errored.
   * @returns void
   */
  onChainError(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.red, "[chain/error]")} [${crumbs}] [${elapsed(run)}] Chain run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
  }
  /**
   * Method used to log the start of an LLM run.
   * @param run The LLM run that has started.
   * @returns void
   */
  onLLMStart(run) {
    const crumbs = this.getBreadcrumbs(run);
    const inputs = "prompts" in run.inputs ? { prompts: run.inputs.prompts.map((p) => p.trim()) } : run.inputs;
    console.log(`${wrap(color.green, "[llm/start]")} [${crumbs}] Entering LLM run with input: ${tryJsonStringify(inputs, "[inputs]")}`);
  }
  /**
   * Method used to log the end of an LLM run.
   * @param run The LLM run that has ended.
   * @returns void
   */
  onLLMEnd(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.cyan, "[llm/end]")} [${crumbs}] [${elapsed(run)}] Exiting LLM run with output: ${tryJsonStringify(run.outputs, "[response]")}`);
  }
  /**
   * Method used to log any errors of an LLM run.
   * @param run The LLM run that has errored.
   * @returns void
   */
  onLLMError(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.red, "[llm/error]")} [${crumbs}] [${elapsed(run)}] LLM run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
  }
  /**
   * Method used to log the start of a tool run.
   * @param run The tool run that has started.
   * @returns void
   */
  onToolStart(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.green, "[tool/start]")} [${crumbs}] Entering Tool run with input: "${_optionalChain([run, 'access', _63 => _63.inputs, 'access', _64 => _64.input, 'optionalAccess', _65 => _65.trim, 'call', _66 => _66()])}"`);
  }
  /**
   * Method used to log the end of a tool run.
   * @param run The tool run that has ended.
   * @returns void
   */
  onToolEnd(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.cyan, "[tool/end]")} [${crumbs}] [${elapsed(run)}] Exiting Tool run with output: "${_optionalChain([run, 'access', _67 => _67.outputs, 'optionalAccess', _68 => _68.output, 'optionalAccess', _69 => _69.trim, 'call', _70 => _70()])}"`);
  }
  /**
   * Method used to log any errors of a tool run.
   * @param run The tool run that has errored.
   * @returns void
   */
  onToolError(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.red, "[tool/error]")} [${crumbs}] [${elapsed(run)}] Tool run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
  }
  /**
   * Method used to log the start of a retriever run.
   * @param run The retriever run that has started.
   * @returns void
   */
  onRetrieverStart(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.green, "[retriever/start]")} [${crumbs}] Entering Retriever run with input: ${tryJsonStringify(run.inputs, "[inputs]")}`);
  }
  /**
   * Method used to log the end of a retriever run.
   * @param run The retriever run that has ended.
   * @returns void
   */
  onRetrieverEnd(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.cyan, "[retriever/end]")} [${crumbs}] [${elapsed(run)}] Exiting Retriever run with output: ${tryJsonStringify(run.outputs, "[outputs]")}`);
  }
  /**
   * Method used to log any errors of a retriever run.
   * @param run The retriever run that has errored.
   * @returns void
   */
  onRetrieverError(run) {
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.red, "[retriever/error]")} [${crumbs}] [${elapsed(run)}] Retriever run errored with error: ${tryJsonStringify(run.error, "[error]")}`);
  }
  /**
   * Method used to log the action selected by the agent.
   * @param run The run in which the agent action occurred.
   * @returns void
   */
  onAgentAction(run) {
    const agentRun = run;
    const crumbs = this.getBreadcrumbs(run);
    console.log(`${wrap(color.blue, "[agent/action]")} [${crumbs}] Agent selected action: ${tryJsonStringify(agentRun.actions[agentRun.actions.length - 1], "[action]")}`);
  }
};

// node_modules/langsmith/dist/utils/async_caller.js
var import_p_retry = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_p_retry(), 1);
var import_p_queue = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_dist(), 1);
var STATUS_NO_RETRY = [
  400,
  401,
  403,
  404,
  405,
  406,
  407,
  408,
  409
  // Conflict
];
var AsyncCaller = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AsyncCaller");
  }
  constructor(params) {
    Object.defineProperty(this, "maxConcurrency", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "maxRetries", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "queue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.maxConcurrency = _nullishCoalesce(params.maxConcurrency, () => ( Infinity));
    this.maxRetries = _nullishCoalesce(params.maxRetries, () => ( 6));
    const PQueue = "default" in import_p_queue.default ? import_p_queue.default.default : import_p_queue.default;
    this.queue = new PQueue({ concurrency: this.maxConcurrency });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(callable, ...args) {
    return this.queue.add(() => (0, import_p_retry.default)(() => callable(...args).catch((error) => {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }), {
      onFailedAttempt(error) {
        if (error.message.startsWith("Cancel") || error.message.startsWith("TimeoutError") || error.message.startsWith("AbortError")) {
          throw error;
        }
        if (_optionalChain([error, 'optionalAccess', _71 => _71.code]) === "ECONNABORTED") {
          throw error;
        }
        const status = _optionalChain([error, 'optionalAccess', _72 => _72.response, 'optionalAccess', _73 => _73.status]);
        if (status && STATUS_NO_RETRY.includes(+status)) {
          throw error;
        }
      },
      retries: this.maxRetries,
      randomize: true
      // If needed we can change some of the defaults here,
      // but they're quite sensible.
    }), { throwOnTimeout: true });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callWithOptions(options, callable, ...args) {
    if (options.signal) {
      return Promise.race([
        this.call(callable, ...args),
        new Promise((_, reject) => {
          _optionalChain([options, 'access', _74 => _74.signal, 'optionalAccess', _75 => _75.addEventListener, 'call', _76 => _76("abort", () => {
            reject(new Error("AbortError"));
          })]);
        })
      ]);
    }
    return this.call(callable, ...args);
  }
  fetch(...args) {
    return this.call(() => fetch(...args).then((res) => res.ok ? res : Promise.reject(res)));
  }
};

// node_modules/langsmith/dist/utils/messages.js
function isLangChainMessage(message) {
  return typeof _optionalChain([message, 'optionalAccess', _77 => _77._getType]) === "function";
}
_chunkEC6JY3PVcjs.__name.call(void 0, isLangChainMessage, "isLangChainMessage");
function convertLangChainMessageToExample(message) {
  const converted = {
    type: message._getType(),
    data: { content: message.content }
  };
  if (_optionalChain([message, 'optionalAccess', _78 => _78.additional_kwargs]) && Object.keys(message.additional_kwargs).length > 0) {
    converted.data.additional_kwargs = { ...message.additional_kwargs };
  }
  return converted;
}
_chunkEC6JY3PVcjs.__name.call(void 0, convertLangChainMessageToExample, "convertLangChainMessageToExample");

// node_modules/langsmith/dist/utils/env.js
var globalEnv;
var isBrowser = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof window !== "undefined" && typeof window.document !== "undefined", "isBrowser");
var isWebWorker = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope", "isWebWorker");
var isJsDom = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")), "isJsDom");
var isDeno = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof Deno !== "undefined", "isDeno");
var isNode = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno(), "isNode");
var getEnv = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => {
  if (globalEnv) {
    return globalEnv;
  }
  if (isBrowser()) {
    globalEnv = "browser";
  } else if (isNode()) {
    globalEnv = "node";
  } else if (isWebWorker()) {
    globalEnv = "webworker";
  } else if (isJsDom()) {
    globalEnv = "jsdom";
  } else if (isDeno()) {
    globalEnv = "deno";
  } else {
    globalEnv = "other";
  }
  return globalEnv;
}, "getEnv");
var runtimeEnvironment;
async function getRuntimeEnvironment() {
  if (runtimeEnvironment === void 0) {
    const env = getEnv();
    const releaseEnv = getShas();
    runtimeEnvironment = {
      library: "langsmith",
      runtime: env,
      sdk: "langsmith-js",
      sdk_version: __version__,
      ...releaseEnv
    };
  }
  return runtimeEnvironment;
}
_chunkEC6JY3PVcjs.__name.call(void 0, getRuntimeEnvironment, "getRuntimeEnvironment");
function getLangChainEnvVarsMetadata() {
  const allEnvVars = getEnvironmentVariables() || {};
  const envVars = {};
  const excluded = [
    "LANGCHAIN_API_KEY",
    "LANGCHAIN_ENDPOINT",
    "LANGCHAIN_TRACING_V2",
    "LANGCHAIN_PROJECT",
    "LANGCHAIN_SESSION"
  ];
  for (const [key, value] of Object.entries(allEnvVars)) {
    if (key.startsWith("LANGCHAIN_") && typeof value === "string" && !excluded.includes(key) && !key.toLowerCase().includes("key") && !key.toLowerCase().includes("secret") && !key.toLowerCase().includes("token")) {
      if (key === "LANGCHAIN_REVISION_ID") {
        envVars["revision_id"] = value;
      } else {
        envVars[key] = value;
      }
    }
  }
  return envVars;
}
_chunkEC6JY3PVcjs.__name.call(void 0, getLangChainEnvVarsMetadata, "getLangChainEnvVarsMetadata");
function getEnvironmentVariables() {
  try {
    if (typeof process !== "undefined" && process.env) {
      return Object.entries(process.env).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {});
    }
    return void 0;
  } catch (e) {
    return void 0;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, getEnvironmentVariables, "getEnvironmentVariables");
function getEnvironmentVariable(name) {
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      _optionalChain([process, 'access', _79 => _79.env, 'optionalAccess', _80 => _80[name]])
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, getEnvironmentVariable, "getEnvironmentVariable");
var cachedCommitSHAs;
function getShas() {
  if (cachedCommitSHAs !== void 0) {
    return cachedCommitSHAs;
  }
  const common_release_envs = [
    "VERCEL_GIT_COMMIT_SHA",
    "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA",
    "COMMIT_REF",
    "RENDER_GIT_COMMIT",
    "CI_COMMIT_SHA",
    "CIRCLE_SHA1",
    "CF_PAGES_COMMIT_SHA",
    "REACT_APP_GIT_SHA",
    "SOURCE_VERSION",
    "GITHUB_SHA",
    "TRAVIS_COMMIT",
    "GIT_COMMIT",
    "BUILD_VCS_NUMBER",
    "bamboo_planRepository_revision",
    "Build.SourceVersion",
    "BITBUCKET_COMMIT",
    "DRONE_COMMIT_SHA",
    "SEMAPHORE_GIT_SHA",
    "BUILDKITE_COMMIT"
  ];
  const shas = {};
  for (const env of common_release_envs) {
    const envVar = getEnvironmentVariable(env);
    if (envVar !== void 0) {
      shas[env] = envVar;
    }
  }
  cachedCommitSHAs = shas;
  return shas;
}
_chunkEC6JY3PVcjs.__name.call(void 0, getShas, "getShas");

// node_modules/langsmith/dist/client.js
var isLocalhost = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (url) => {
  const strippedUrl = url.replace("http://", "").replace("https://", "");
  const hostname = strippedUrl.split("/")[0].split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}, "isLocalhost");
var raiseForStatus = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, async (response, operation) => {
  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Failed to ${operation}: ${response.status} ${response.statusText} ${body}`);
  }
}, "raiseForStatus");
async function toArray(iterable) {
  const result = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
}
_chunkEC6JY3PVcjs.__name.call(void 0, toArray, "toArray");
function trimQuotes(str) {
  if (str === void 0) {
    return void 0;
  }
  return str.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
}
_chunkEC6JY3PVcjs.__name.call(void 0, trimQuotes, "trimQuotes");
function hideInputs(inputs) {
  if (getEnvironmentVariable("LANGCHAIN_HIDE_INPUTS") === "true") {
    return {};
  }
  return inputs;
}
_chunkEC6JY3PVcjs.__name.call(void 0, hideInputs, "hideInputs");
function hideOutputs(outputs) {
  if (getEnvironmentVariable("LANGCHAIN_HIDE_OUTPUTS") === "true") {
    return {};
  }
  return outputs;
}
_chunkEC6JY3PVcjs.__name.call(void 0, hideOutputs, "hideOutputs");
function assertUuid(str) {
  if (!validate_default(str)) {
    throw new Error(`Invalid UUID: ${str}`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, assertUuid, "assertUuid");
var Client = class _Client {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "Client");
  }
  constructor(config = {}) {
    Object.defineProperty(this, "apiKey", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "apiUrl", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "webUrl", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "caller", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "timeout_ms", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_tenantId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: null
    });
    const defaultConfig = _Client.getDefaultClientConfig();
    this.apiUrl = _nullishCoalesce(trimQuotes(_nullishCoalesce(config.apiUrl, () => ( defaultConfig.apiUrl))), () => ( ""));
    this.apiKey = trimQuotes(_nullishCoalesce(config.apiKey, () => ( defaultConfig.apiKey)));
    this.webUrl = trimQuotes(_nullishCoalesce(config.webUrl, () => ( defaultConfig.webUrl)));
    this.validateApiKeyIfHosted();
    this.timeout_ms = _nullishCoalesce(config.timeout_ms, () => ( 12e3));
    this.caller = new AsyncCaller(_nullishCoalesce(config.callerOptions, () => ( {})));
  }
  static getDefaultClientConfig() {
    const apiKey = getEnvironmentVariable("LANGCHAIN_API_KEY");
    const apiUrl = _nullishCoalesce(getEnvironmentVariable("LANGCHAIN_ENDPOINT"), () => ( "https://api.smith.langchain.com"));
    return {
      apiUrl,
      apiKey,
      webUrl: void 0
    };
  }
  validateApiKeyIfHosted() {
    const isLocal = isLocalhost(this.apiUrl);
    if (!isLocal && !this.apiKey) {
      throw new Error("API key must be provided when using hosted LangSmith API");
    }
  }
  getHostUrl() {
    if (this.webUrl) {
      return this.webUrl;
    } else if (isLocalhost(this.apiUrl)) {
      this.webUrl = "http://localhost";
      return "http://localhost";
    } else if (this.apiUrl.includes("/api") && !this.apiUrl.split(".", 1)[0].endsWith("api")) {
      this.webUrl = this.apiUrl.replace("/api", "");
      return this.webUrl;
    } else if (this.apiUrl.split(".", 1)[0].includes("dev")) {
      this.webUrl = "https://dev.smith.langchain.com";
      return "https://dev.smith.langchain.com";
    } else {
      this.webUrl = "https://smith.langchain.com";
      return "https://smith.langchain.com";
    }
  }
  get headers() {
    const headers = {
      "User-Agent": `langsmith-js/${__version__}`
    };
    if (this.apiKey) {
      headers["x-api-key"] = `${this.apiKey}`;
    }
    return headers;
  }
  async _getResponse(path, queryParams) {
    const paramsString = _nullishCoalesce(_optionalChain([queryParams, 'optionalAccess', _81 => _81.toString, 'call', _82 => _82()]), () => ( ""));
    const url = `${this.apiUrl}${path}?${paramsString}`;
    const response = await this.caller.call(fetch, url, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
    }
    return response;
  }
  async _get(path, queryParams) {
    const response = await this._getResponse(path, queryParams);
    return response.json();
  }
  async *_getPaginated(path, queryParams = new URLSearchParams()) {
    let offset = Number(queryParams.get("offset")) || 0;
    const limit = Number(queryParams.get("limit")) || 100;
    while (true) {
      queryParams.set("offset", String(offset));
      queryParams.set("limit", String(limit));
      const url = `${this.apiUrl}${path}?${queryParams}`;
      const response = await this.caller.call(fetch, url, {
        method: "GET",
        headers: this.headers,
        signal: AbortSignal.timeout(this.timeout_ms)
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${path}: ${response.status} ${response.statusText}`);
      }
      const items = await response.json();
      if (items.length === 0) {
        break;
      }
      yield items;
      if (items.length < limit) {
        break;
      }
      offset += items.length;
    }
  }
  async *_getCursorPaginatedList(path, body = null, requestMethod = "POST", dataKey = "runs") {
    const bodyParams = body ? { ...body } : {};
    while (true) {
      const response = await this.caller.call(fetch, `${this.apiUrl}${path}`, {
        method: requestMethod,
        headers: { ...this.headers, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(this.timeout_ms),
        body: JSON.stringify(bodyParams)
      });
      const responseBody = await response.json();
      if (!responseBody) {
        break;
      }
      if (!responseBody[dataKey]) {
        break;
      }
      yield responseBody[dataKey];
      const cursors = responseBody.cursors;
      if (!cursors) {
        break;
      }
      if (!cursors.next) {
        break;
      }
      bodyParams.cursor = cursors.next;
    }
  }
  async createRun(run) {
    const headers = { ...this.headers, "Content-Type": "application/json" };
    const extra = _nullishCoalesce(run.extra, () => ( {}));
    const metadata = extra.metadata;
    const runtimeEnv = await getRuntimeEnvironment();
    const envVars = getLangChainEnvVarsMetadata();
    const session_name = run.project_name;
    delete run.project_name;
    const runCreate = {
      session_name,
      ...run,
      extra: {
        ...run.extra,
        runtime: {
          ...runtimeEnv,
          ...extra.runtime
        },
        metadata: {
          ...envVars,
          ...envVars.revision_id || run.revision_id ? { revision_id: _nullishCoalesce(run.revision_id, () => ( envVars.revision_id)) } : {},
          ...metadata
        }
      }
    };
    runCreate.inputs = hideInputs(runCreate.inputs);
    if (runCreate.outputs) {
      runCreate.outputs = hideOutputs(runCreate.outputs);
    }
    const response = await this.caller.call(fetch, `${this.apiUrl}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify(runCreate),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "create run");
  }
  async updateRun(runId, run) {
    assertUuid(runId);
    if (run.inputs) {
      run.inputs = hideInputs(run.inputs);
    }
    if (run.outputs) {
      run.outputs = hideOutputs(run.outputs);
    }
    const headers = { ...this.headers, "Content-Type": "application/json" };
    const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(run),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "update run");
  }
  async readRun(runId, { loadChildRuns } = { loadChildRuns: false }) {
    assertUuid(runId);
    let run = await this._get(`/runs/${runId}`);
    if (loadChildRuns && run.child_run_ids) {
      run = await this._loadChildRuns(run);
    }
    return run;
  }
  async getRunUrl({ runId, run, projectOpts }) {
    if (run !== void 0) {
      let sessionId;
      if (run.session_id) {
        sessionId = run.session_id;
      } else if (_optionalChain([projectOpts, 'optionalAccess', _83 => _83.projectName])) {
        sessionId = (await this.readProject({ projectName: _optionalChain([projectOpts, 'optionalAccess', _84 => _84.projectName]) })).id;
      } else if (_optionalChain([projectOpts, 'optionalAccess', _85 => _85.projectId])) {
        sessionId = _optionalChain([projectOpts, 'optionalAccess', _86 => _86.projectId]);
      } else {
        const project = await this.readProject({
          projectName: getEnvironmentVariable("LANGCHAIN_PROJECT") || "default"
        });
        sessionId = project.id;
      }
      const tenantId = await this._getTenantId();
      return `${this.getHostUrl()}/o/${tenantId}/projects/p/${sessionId}/r/${run.id}?poll=true`;
    } else if (runId !== void 0) {
      const run_ = await this.readRun(runId);
      if (!run_.app_path) {
        throw new Error(`Run ${runId} has no app_path`);
      }
      const baseUrl = this.getHostUrl();
      return `${baseUrl}${run_.app_path}`;
    } else {
      throw new Error("Must provide either runId or run");
    }
  }
  async _loadChildRuns(run) {
    const childRuns = await toArray(this.listRuns({ id: run.child_run_ids }));
    const treemap = {};
    const runs = {};
    childRuns.sort((a, b) => (_nullishCoalesce(_optionalChain([a, 'optionalAccess', _87 => _87.dotted_order]), () => ( ""))).localeCompare(_nullishCoalesce(_optionalChain([b, 'optionalAccess', _88 => _88.dotted_order]), () => ( ""))));
    for (const childRun of childRuns) {
      if (childRun.parent_run_id === null || childRun.parent_run_id === void 0) {
        throw new Error(`Child run ${childRun.id} has no parent`);
      }
      if (!(childRun.parent_run_id in treemap)) {
        treemap[childRun.parent_run_id] = [];
      }
      treemap[childRun.parent_run_id].push(childRun);
      runs[childRun.id] = childRun;
    }
    run.child_runs = treemap[run.id] || [];
    for (const runId in treemap) {
      if (runId !== run.id) {
        runs[runId].child_runs = treemap[runId];
      }
    }
    return run;
  }
  async *listRuns({ projectId, projectName, parentRunId, referenceExampleId, startTime, executionOrder, runType, error, id, query, filter, limit }) {
    let projectId_ = projectId;
    if (projectName) {
      if (projectId) {
        throw new Error("Only one of projectId or projectName may be given");
      }
      projectId_ = (await this.readProject({ projectName })).id;
    }
    const body = {
      session: projectId_ ? [projectId_] : null,
      run_type: runType,
      reference_example: referenceExampleId,
      query,
      filter,
      execution_order: executionOrder,
      parent_run: parentRunId ? [parentRunId] : null,
      start_time: startTime ? startTime.toISOString() : null,
      error,
      id,
      limit
    };
    for await (const runs of this._getCursorPaginatedList("/runs/query", body)) {
      yield* runs;
    }
  }
  async shareRun(runId, { shareId } = {}) {
    const data = {
      run_id: runId,
      share_token: shareId || v4_default()
    };
    assertUuid(runId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const result = await response.json();
    if (result === null || !("share_token" in result)) {
      throw new Error("Invalid response from server");
    }
    return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
  }
  async unshareRun(runId) {
    assertUuid(runId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "unshare run");
  }
  async readRunSharedLink(runId) {
    assertUuid(runId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/runs/${runId}/share`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const result = await response.json();
    if (result === null || !("share_token" in result)) {
      return void 0;
    }
    return `${this.getHostUrl()}/public/${result["share_token"]}/r`;
  }
  async listSharedRuns(shareToken, { runIds } = {}) {
    const queryParams = new URLSearchParams({
      share_token: shareToken
    });
    if (runIds !== void 0) {
      for (const runId of runIds) {
        queryParams.append("id", runId);
      }
    }
    assertUuid(shareToken);
    const response = await this.caller.call(fetch, `${this.apiUrl}/public/${shareToken}/runs${queryParams}`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const runs = await response.json();
    return runs;
  }
  async readDatasetSharedSchema(datasetId, datasetName) {
    if (!datasetId && !datasetName) {
      throw new Error("Either datasetId or datasetName must be given");
    }
    if (!datasetId) {
      const dataset = await this.readDataset({ datasetName });
      datasetId = dataset.id;
    }
    assertUuid(datasetId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const shareSchema = await response.json();
    shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
    return shareSchema;
  }
  async shareDataset(datasetId, datasetName) {
    if (!datasetId && !datasetName) {
      throw new Error("Either datasetId or datasetName must be given");
    }
    if (!datasetId) {
      const dataset = await this.readDataset({ datasetName });
      datasetId = dataset.id;
    }
    const data = {
      dataset_id: datasetId
    };
    assertUuid(datasetId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const shareSchema = await response.json();
    shareSchema.url = `${this.getHostUrl()}/public/${shareSchema.share_token}/d`;
    return shareSchema;
  }
  async unshareDataset(datasetId) {
    assertUuid(datasetId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/datasets/${datasetId}/share`, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "unshare dataset");
  }
  async readSharedDataset(shareToken) {
    assertUuid(shareToken);
    const response = await this.caller.call(fetch, `${this.apiUrl}/public/${shareToken}/datasets`, {
      method: "GET",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const dataset = await response.json();
    return dataset;
  }
  async createProject({ projectName, description = null, metadata = null, upsert = false, projectExtra = null, referenceDatasetId = null }) {
    const upsert_ = upsert ? `?upsert=true` : "";
    const endpoint = `${this.apiUrl}/sessions${upsert_}`;
    const extra = projectExtra || {};
    if (metadata) {
      extra["metadata"] = metadata;
    }
    const body = {
      name: projectName,
      extra,
      description
    };
    if (referenceDatasetId !== null) {
      body["reference_dataset_id"] = referenceDatasetId;
    }
    const response = await this.caller.call(fetch, endpoint, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to create session ${projectName}: ${response.status} ${response.statusText}`);
    }
    return result;
  }
  async updateProject(projectId, { name = null, description = null, metadata = null, projectExtra = null, endTime = null }) {
    const endpoint = `${this.apiUrl}/sessions/${projectId}`;
    let extra = projectExtra;
    if (metadata) {
      extra = { ...extra || {}, metadata };
    }
    const body = {
      name,
      extra,
      description,
      end_time: endTime ? new Date(endTime).toISOString() : null
    };
    const response = await this.caller.call(fetch, endpoint, {
      method: "PATCH",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to update project ${projectId}: ${response.status} ${response.statusText}`);
    }
    return result;
  }
  async readProject({ projectId, projectName }) {
    let path = "/sessions";
    const params = new URLSearchParams();
    if (projectId !== void 0 && projectName !== void 0) {
      throw new Error("Must provide either projectName or projectId, not both");
    } else if (projectId !== void 0) {
      assertUuid(projectId);
      path += `/${projectId}`;
    } else if (projectName !== void 0) {
      params.append("name", projectName);
    } else {
      throw new Error("Must provide projectName or projectId");
    }
    const response = await this._get(path, params);
    let result;
    if (Array.isArray(response)) {
      if (response.length === 0) {
        throw new Error(`Project[id=${projectId}, name=${projectName}] not found`);
      }
      result = response[0];
    } else {
      result = response;
    }
    return result;
  }
  async _getTenantId() {
    if (this._tenantId !== null) {
      return this._tenantId;
    }
    const queryParams = new URLSearchParams({ limit: "1" });
    for await (const projects of this._getPaginated("/sessions", queryParams)) {
      this._tenantId = projects[0].tenant_id;
      return projects[0].tenant_id;
    }
    throw new Error("No projects found to resolve tenant.");
  }
  async *listProjects({ projectIds, name, nameContains, referenceDatasetId, referenceDatasetName, referenceFree } = {}) {
    const params = new URLSearchParams();
    if (projectIds !== void 0) {
      for (const projectId of projectIds) {
        params.append("id", projectId);
      }
    }
    if (name !== void 0) {
      params.append("name", name);
    }
    if (nameContains !== void 0) {
      params.append("name_contains", nameContains);
    }
    if (referenceDatasetId !== void 0) {
      params.append("reference_dataset", referenceDatasetId);
    } else if (referenceDatasetName !== void 0) {
      const dataset = await this.readDataset({
        datasetName: referenceDatasetName
      });
      params.append("reference_dataset", dataset.id);
    }
    if (referenceFree !== void 0) {
      params.append("reference_free", referenceFree.toString());
    }
    for await (const projects of this._getPaginated("/sessions", params)) {
      yield* projects;
    }
  }
  async deleteProject({ projectId, projectName }) {
    let projectId_;
    if (projectId === void 0 && projectName === void 0) {
      throw new Error("Must provide projectName or projectId");
    } else if (projectId !== void 0 && projectName !== void 0) {
      throw new Error("Must provide either projectName or projectId, not both");
    } else if (projectId === void 0) {
      projectId_ = (await this.readProject({ projectName })).id;
    } else {
      projectId_ = projectId;
    }
    assertUuid(projectId_);
    const response = await this.caller.call(fetch, `${this.apiUrl}/sessions/${projectId_}`, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, `delete session ${projectId_} (${projectName})`);
  }
  async uploadCsv({ csvFile, fileName, inputKeys, outputKeys, description, dataType, name }) {
    const url = `${this.apiUrl}/datasets/upload`;
    const formData = new FormData();
    formData.append("file", csvFile, fileName);
    inputKeys.forEach((key) => {
      formData.append("input_keys", key);
    });
    outputKeys.forEach((key) => {
      formData.append("output_keys", key);
    });
    if (description) {
      formData.append("description", description);
    }
    if (dataType) {
      formData.append("data_type", dataType);
    }
    if (name) {
      formData.append("name", name);
    }
    const response = await this.caller.call(fetch, url, {
      method: "POST",
      headers: this.headers,
      body: formData,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      const result2 = await response.json();
      if (result2.detail && result2.detail.includes("already exists")) {
        throw new Error(`Dataset ${fileName} already exists`);
      }
      throw new Error(`Failed to upload CSV: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  }
  async createDataset(name, { description, dataType } = {}) {
    const body = {
      name,
      description
    };
    if (dataType) {
      body.data_type = dataType;
    }
    const response = await this.caller.call(fetch, `${this.apiUrl}/datasets`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      const result2 = await response.json();
      if (result2.detail && result2.detail.includes("already exists")) {
        throw new Error(`Dataset ${name} already exists`);
      }
      throw new Error(`Failed to create dataset ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  }
  async readDataset({ datasetId, datasetName }) {
    let path = "/datasets";
    const params = new URLSearchParams({ limit: "1" });
    if (datasetId !== void 0 && datasetName !== void 0) {
      throw new Error("Must provide either datasetName or datasetId, not both");
    } else if (datasetId !== void 0) {
      assertUuid(datasetId);
      path += `/${datasetId}`;
    } else if (datasetName !== void 0) {
      params.append("name", datasetName);
    } else {
      throw new Error("Must provide datasetName or datasetId");
    }
    const response = await this._get(path, params);
    let result;
    if (Array.isArray(response)) {
      if (response.length === 0) {
        throw new Error(`Dataset[id=${datasetId}, name=${datasetName}] not found`);
      }
      result = response[0];
    } else {
      result = response;
    }
    return result;
  }
  async readDatasetOpenaiFinetuning({ datasetId, datasetName }) {
    const path = "/datasets";
    if (datasetId !== void 0) {
    } else if (datasetName !== void 0) {
      datasetId = (await this.readDataset({ datasetName })).id;
    } else {
      throw new Error("Must provide datasetName or datasetId");
    }
    const response = await this._getResponse(`${path}/${datasetId}/openai_ft`);
    const datasetText = await response.text();
    const dataset = datasetText.trim().split("\n").map((line) => JSON.parse(line));
    return dataset;
  }
  async *listDatasets({ limit = 100, offset = 0, datasetIds, datasetName, datasetNameContains } = {}) {
    const path = "/datasets";
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (datasetIds !== void 0) {
      for (const id_ of datasetIds) {
        params.append("id", id_);
      }
    }
    if (datasetName !== void 0) {
      params.append("name", datasetName);
    }
    if (datasetNameContains !== void 0) {
      params.append("name_contains", datasetNameContains);
    }
    for await (const datasets of this._getPaginated(path, params)) {
      yield* datasets;
    }
  }
  async deleteDataset({ datasetId, datasetName }) {
    let path = "/datasets";
    let datasetId_ = datasetId;
    if (datasetId !== void 0 && datasetName !== void 0) {
      throw new Error("Must provide either datasetName or datasetId, not both");
    } else if (datasetName !== void 0) {
      const dataset = await this.readDataset({ datasetName });
      datasetId_ = dataset.id;
    }
    if (datasetId_ !== void 0) {
      assertUuid(datasetId_);
      path += `/${datasetId_}`;
    } else {
      throw new Error("Must provide datasetName or datasetId");
    }
    const response = await this.caller.call(fetch, this.apiUrl + path, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
    }
    await response.json();
  }
  async createExample(inputs, outputs, { datasetId, datasetName, createdAt, exampleId }) {
    let datasetId_ = datasetId;
    if (datasetId_ === void 0 && datasetName === void 0) {
      throw new Error("Must provide either datasetName or datasetId");
    } else if (datasetId_ !== void 0 && datasetName !== void 0) {
      throw new Error("Must provide either datasetName or datasetId, not both");
    } else if (datasetId_ === void 0) {
      const dataset = await this.readDataset({ datasetName });
      datasetId_ = dataset.id;
    }
    const createdAt_ = createdAt || /* @__PURE__ */ new Date();
    const data = {
      dataset_id: datasetId_,
      inputs,
      outputs,
      created_at: _optionalChain([createdAt_, 'optionalAccess', _89 => _89.toISOString, 'call', _90 => _90()]),
      id: exampleId
    };
    const response = await this.caller.call(fetch, `${this.apiUrl}/examples`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to create example: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  }
  async createExamples(props) {
    const { inputs, outputs, sourceRunIds, exampleIds, datasetId, datasetName } = props;
    let datasetId_ = datasetId;
    if (datasetId_ === void 0 && datasetName === void 0) {
      throw new Error("Must provide either datasetName or datasetId");
    } else if (datasetId_ !== void 0 && datasetName !== void 0) {
      throw new Error("Must provide either datasetName or datasetId, not both");
    } else if (datasetId_ === void 0) {
      const dataset = await this.readDataset({ datasetName });
      datasetId_ = dataset.id;
    }
    const formattedExamples = inputs.map((input, idx) => {
      return {
        dataset_id: datasetId_,
        inputs: input,
        outputs: outputs ? outputs[idx] : void 0,
        id: exampleIds ? exampleIds[idx] : void 0,
        source_run_id: sourceRunIds ? sourceRunIds[idx] : void 0
      };
    });
    const response = await this.caller.call(fetch, `${this.apiUrl}/examples/bulk`, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(formattedExamples),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to create examples: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  }
  async createLLMExample(input, generation, options) {
    return this.createExample({ input }, { output: generation }, options);
  }
  async createChatExample(input, generations, options) {
    const finalInput = input.map((message) => {
      if (isLangChainMessage(message)) {
        return convertLangChainMessageToExample(message);
      }
      return message;
    });
    const finalOutput = isLangChainMessage(generations) ? convertLangChainMessageToExample(generations) : generations;
    return this.createExample({ input: finalInput }, { output: finalOutput }, options);
  }
  async readExample(exampleId) {
    assertUuid(exampleId);
    const path = `/examples/${exampleId}`;
    return await this._get(path);
  }
  async *listExamples({ datasetId, datasetName, exampleIds } = {}) {
    let datasetId_;
    if (datasetId !== void 0 && datasetName !== void 0) {
      throw new Error("Must provide either datasetName or datasetId, not both");
    } else if (datasetId !== void 0) {
      datasetId_ = datasetId;
    } else if (datasetName !== void 0) {
      const dataset = await this.readDataset({ datasetName });
      datasetId_ = dataset.id;
    } else {
      throw new Error("Must provide a datasetName or datasetId");
    }
    const params = new URLSearchParams({ dataset: datasetId_ });
    if (exampleIds !== void 0) {
      for (const id_ of exampleIds) {
        params.append("id", id_);
      }
    }
    for await (const examples of this._getPaginated("/examples", params)) {
      yield* examples;
    }
  }
  async deleteExample(exampleId) {
    assertUuid(exampleId);
    const path = `/examples/${exampleId}`;
    const response = await this.caller.call(fetch, this.apiUrl + path, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
    }
    await response.json();
  }
  async updateExample(exampleId, update) {
    assertUuid(exampleId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/examples/${exampleId}`, {
      method: "PATCH",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(update),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to update example ${exampleId}: ${response.status} ${response.statusText}`);
    }
    const result = await response.json();
    return result;
  }
  async evaluateRun(run, evaluator, { sourceInfo, loadChildRuns, referenceExample } = { loadChildRuns: false }) {
    let run_;
    if (typeof run === "string") {
      run_ = await this.readRun(run, { loadChildRuns });
    } else if (typeof run === "object" && "id" in run) {
      run_ = run;
    } else {
      throw new Error(`Invalid run type: ${typeof run}`);
    }
    if (run_.reference_example_id !== null && run_.reference_example_id !== void 0) {
      referenceExample = await this.readExample(run_.reference_example_id);
    }
    const feedbackResult = await evaluator.evaluateRun(run_, referenceExample);
    let sourceInfo_ = _nullishCoalesce(sourceInfo, () => ( {}));
    if (feedbackResult.evaluatorInfo) {
      sourceInfo_ = { ...sourceInfo_, ...feedbackResult.evaluatorInfo };
    }
    const runId = _nullishCoalesce(feedbackResult.targetRunId, () => ( run_.id));
    return await this.createFeedback(runId, feedbackResult.key, {
      score: _optionalChain([feedbackResult, 'optionalAccess', _91 => _91.score]),
      value: _optionalChain([feedbackResult, 'optionalAccess', _92 => _92.value]),
      comment: _optionalChain([feedbackResult, 'optionalAccess', _93 => _93.comment]),
      correction: _optionalChain([feedbackResult, 'optionalAccess', _94 => _94.correction]),
      sourceInfo: sourceInfo_,
      feedbackSourceType: "model",
      sourceRunId: _optionalChain([feedbackResult, 'optionalAccess', _95 => _95.sourceRunId])
    });
  }
  async createFeedback(runId, key, { score, value, correction, comment, sourceInfo, feedbackSourceType = "api", sourceRunId, feedbackId, eager = false }) {
    const feedback_source = {
      type: _nullishCoalesce(feedbackSourceType, () => ( "api")),
      metadata: _nullishCoalesce(sourceInfo, () => ( {}))
    };
    if (sourceRunId !== void 0 && _optionalChain([feedback_source, 'optionalAccess', _96 => _96.metadata]) !== void 0 && !feedback_source.metadata["__run"]) {
      feedback_source.metadata["__run"] = { run_id: sourceRunId };
    }
    if (_optionalChain([feedback_source, 'optionalAccess', _97 => _97.metadata]) !== void 0 && _optionalChain([feedback_source, 'access', _98 => _98.metadata, 'access', _99 => _99["__run"], 'optionalAccess', _100 => _100.run_id]) !== void 0) {
      assertUuid(feedback_source.metadata["__run"].run_id);
    }
    const feedback = {
      id: _nullishCoalesce(feedbackId, () => ( v4_default())),
      run_id: runId,
      key,
      score,
      value,
      correction,
      comment,
      feedback_source
    };
    const url = `${this.apiUrl}/feedback` + (eager ? "/eager" : "");
    const response = await this.caller.call(fetch, url, {
      method: "POST",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "create feedback");
    return feedback;
  }
  async updateFeedback(feedbackId, { score, value, correction, comment }) {
    const feedbackUpdate = {};
    if (score !== void 0 && score !== null) {
      feedbackUpdate["score"] = score;
    }
    if (value !== void 0 && value !== null) {
      feedbackUpdate["value"] = value;
    }
    if (correction !== void 0 && correction !== null) {
      feedbackUpdate["correction"] = correction;
    }
    if (comment !== void 0 && comment !== null) {
      feedbackUpdate["comment"] = comment;
    }
    assertUuid(feedbackId);
    const response = await this.caller.call(fetch, `${this.apiUrl}/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { ...this.headers, "Content-Type": "application/json" },
      body: JSON.stringify(feedbackUpdate),
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    await raiseForStatus(response, "update feedback");
  }
  async readFeedback(feedbackId) {
    assertUuid(feedbackId);
    const path = `/feedback/${feedbackId}`;
    const response = await this._get(path);
    return response;
  }
  async deleteFeedback(feedbackId) {
    assertUuid(feedbackId);
    const path = `/feedback/${feedbackId}`;
    const response = await this.caller.call(fetch, this.apiUrl + path, {
      method: "DELETE",
      headers: this.headers,
      signal: AbortSignal.timeout(this.timeout_ms)
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ${path}: ${response.status} ${response.statusText}`);
    }
    await response.json();
  }
  async *listFeedback({ runIds, feedbackKeys, feedbackSourceTypes } = {}) {
    const queryParams = new URLSearchParams();
    if (runIds) {
      queryParams.append("run", runIds.join(","));
    }
    if (feedbackKeys) {
      for (const key of feedbackKeys) {
        queryParams.append("key", key);
      }
    }
    if (feedbackSourceTypes) {
      for (const type of feedbackSourceTypes) {
        queryParams.append("source", type);
      }
    }
    for await (const feedbacks of this._getPaginated("/feedback", queryParams)) {
      yield* feedbacks;
    }
  }
};

// node_modules/langsmith/dist/index.js
var __version__ = "0.0.63";

// node_modules/@langchain/core/dist/utils/env.js
var isBrowser2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof window !== "undefined" && typeof window.document !== "undefined", "isBrowser");
var isWebWorker2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof globalThis === "object" && globalThis.constructor && globalThis.constructor.name === "DedicatedWorkerGlobalScope", "isWebWorker");
var isJsDom2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof window !== "undefined" && window.name === "nodejs" || typeof navigator !== "undefined" && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom")), "isJsDom");
var isDeno2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof Deno !== "undefined", "isDeno");
var isNode2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => typeof process !== "undefined" && typeof process.versions !== "undefined" && typeof process.versions.node !== "undefined" && !isDeno2(), "isNode");
var getEnv2 = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, () => {
  let env;
  if (isBrowser2()) {
    env = "browser";
  } else if (isNode2()) {
    env = "node";
  } else if (isWebWorker2()) {
    env = "webworker";
  } else if (isJsDom2()) {
    env = "jsdom";
  } else if (isDeno2()) {
    env = "deno";
  } else {
    env = "other";
  }
  return env;
}, "getEnv");
var runtimeEnvironment2;
async function getRuntimeEnvironment2() {
  if (runtimeEnvironment2 === void 0) {
    const env = getEnv2();
    runtimeEnvironment2 = {
      library: "langchain-js",
      runtime: env
    };
  }
  return runtimeEnvironment2;
}
_chunkEC6JY3PVcjs.__name.call(void 0, getRuntimeEnvironment2, "getRuntimeEnvironment");
function getEnvironmentVariable2(name) {
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      _optionalChain([process, 'access', _101 => _101.env, 'optionalAccess', _102 => _102[name]])
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, getEnvironmentVariable2, "getEnvironmentVariable");

// node_modules/@langchain/core/dist/tracers/tracer_langchain.js
var LangChainTracer = class extends BaseTracer {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "LangChainTracer");
  }
  constructor(fields = {}) {
    super(fields);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "langchain_tracer"
    });
    Object.defineProperty(this, "projectName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "exampleId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "client", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    const { exampleId, projectName, client } = fields;
    this.projectName = _nullishCoalesce(_nullishCoalesce(projectName, () => ( getEnvironmentVariable2("LANGCHAIN_PROJECT"))), () => ( getEnvironmentVariable2("LANGCHAIN_SESSION")));
    this.exampleId = exampleId;
    this.client = _nullishCoalesce(client, () => ( new Client({})));
  }
  async _convertToCreate(run, example_id = void 0) {
    return {
      ...run,
      extra: {
        ...run.extra,
        runtime: await getRuntimeEnvironment2()
      },
      child_runs: void 0,
      session_name: this.projectName,
      reference_example_id: run.parent_run_id ? void 0 : example_id
    };
  }
  async persistRun(_run) {
  }
  async _persistRunSingle(run) {
    const persistedRun = await this._convertToCreate(run, this.exampleId);
    await this.client.createRun(persistedRun);
  }
  async _updateRunSingle(run) {
    const runUpdate = {
      end_time: run.end_time,
      error: run.error,
      outputs: run.outputs,
      events: run.events,
      inputs: run.inputs
    };
    await this.client.updateRun(run.id, runUpdate);
  }
  async onRetrieverStart(run) {
    await this._persistRunSingle(run);
  }
  async onRetrieverEnd(run) {
    await this._updateRunSingle(run);
  }
  async onRetrieverError(run) {
    await this._updateRunSingle(run);
  }
  async onLLMStart(run) {
    await this._persistRunSingle(run);
  }
  async onLLMEnd(run) {
    await this._updateRunSingle(run);
  }
  async onLLMError(run) {
    await this._updateRunSingle(run);
  }
  async onChainStart(run) {
    await this._persistRunSingle(run);
  }
  async onChainEnd(run) {
    await this._updateRunSingle(run);
  }
  async onChainError(run) {
    await this._updateRunSingle(run);
  }
  async onToolStart(run) {
    await this._persistRunSingle(run);
  }
  async onToolEnd(run) {
    await this._updateRunSingle(run);
  }
  async onToolError(run) {
    await this._updateRunSingle(run);
  }
};

// node_modules/@langchain/core/dist/tracers/initialize.js
async function getTracingV2CallbackHandler() {
  return new LangChainTracer();
}
_chunkEC6JY3PVcjs.__name.call(void 0, getTracingV2CallbackHandler, "getTracingV2CallbackHandler");

// node_modules/@langchain/core/dist/callbacks/promises.js
var import_p_queue2 = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_dist(), 1);
var queue;
function createQueue() {
  const PQueue = "default" in import_p_queue2.default ? import_p_queue2.default.default : import_p_queue2.default;
  return new PQueue({
    autoStart: true,
    concurrency: 1
  });
}
_chunkEC6JY3PVcjs.__name.call(void 0, createQueue, "createQueue");
async function consumeCallback(promiseFn, wait) {
  if (wait === true) {
    await promiseFn();
  } else {
    if (typeof queue === "undefined") {
      queue = createQueue();
    }
    void queue.add(promiseFn);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, consumeCallback, "consumeCallback");

// node_modules/@langchain/core/dist/callbacks/manager.js
var BaseCallbackManager = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseCallbackManager");
  }
  setHandler(handler) {
    return this.setHandlers([handler]);
  }
};
var BaseRunManager = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseRunManager");
  }
  constructor(runId, handlers, inheritableHandlers, tags, inheritableTags, metadata, inheritableMetadata, _parentRunId) {
    Object.defineProperty(this, "runId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: runId
    });
    Object.defineProperty(this, "handlers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: handlers
    });
    Object.defineProperty(this, "inheritableHandlers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: inheritableHandlers
    });
    Object.defineProperty(this, "tags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: tags
    });
    Object.defineProperty(this, "inheritableTags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: inheritableTags
    });
    Object.defineProperty(this, "metadata", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: metadata
    });
    Object.defineProperty(this, "inheritableMetadata", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: inheritableMetadata
    });
    Object.defineProperty(this, "_parentRunId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: _parentRunId
    });
  }
  async handleText(text) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      try {
        await _optionalChain([handler, 'access', _103 => _103.handleText, 'optionalCall', _104 => _104(text, this.runId, this._parentRunId, this.tags)]);
      } catch (err) {
        console.error(`Error in handler ${handler.constructor.name}, handleText: ${err}`);
      }
    }, handler.awaitHandlers)));
  }
};
var CallbackManagerForRetrieverRun = class extends BaseRunManager {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "CallbackManagerForRetrieverRun");
  }
  getChild(tag) {
    const manager = new CallbackManager(this.runId);
    manager.setHandlers(this.inheritableHandlers);
    manager.addTags(this.inheritableTags);
    manager.addMetadata(this.inheritableMetadata);
    if (tag) {
      manager.addTags([tag], false);
    }
    return manager;
  }
  async handleRetrieverEnd(documents) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreRetriever) {
        try {
          await _optionalChain([handler, 'access', _105 => _105.handleRetrieverEnd, 'optionalCall', _106 => _106(documents, this.runId, this._parentRunId, this.tags)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleRetriever`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleRetrieverError(err) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreRetriever) {
        try {
          await _optionalChain([handler, 'access', _107 => _107.handleRetrieverError, 'optionalCall', _108 => _108(err, this.runId, this._parentRunId, this.tags)]);
        } catch (error) {
          console.error(`Error in handler ${handler.constructor.name}, handleRetrieverError: ${error}`);
        }
      }
    }, handler.awaitHandlers)));
  }
};
var CallbackManagerForLLMRun = class extends BaseRunManager {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "CallbackManagerForLLMRun");
  }
  async handleLLMNewToken(token, idx, _runId, _parentRunId, _tags, fields) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreLLM) {
        try {
          await _optionalChain([handler, 'access', _109 => _109.handleLLMNewToken, 'optionalCall', _110 => _110(token, _nullishCoalesce(idx, () => ( { prompt: 0, completion: 0 })), this.runId, this._parentRunId, this.tags, fields)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleLLMNewToken: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleLLMError(err) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreLLM) {
        try {
          await _optionalChain([handler, 'access', _111 => _111.handleLLMError, 'optionalCall', _112 => _112(err, this.runId, this._parentRunId, this.tags)]);
        } catch (err2) {
          console.error(`Error in handler ${handler.constructor.name}, handleLLMError: ${err2}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleLLMEnd(output) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreLLM) {
        try {
          await _optionalChain([handler, 'access', _113 => _113.handleLLMEnd, 'optionalCall', _114 => _114(output, this.runId, this._parentRunId, this.tags)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleLLMEnd: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
};
var CallbackManagerForChainRun = class extends BaseRunManager {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "CallbackManagerForChainRun");
  }
  getChild(tag) {
    const manager = new CallbackManager(this.runId);
    manager.setHandlers(this.inheritableHandlers);
    manager.addTags(this.inheritableTags);
    manager.addMetadata(this.inheritableMetadata);
    if (tag) {
      manager.addTags([tag], false);
    }
    return manager;
  }
  async handleChainError(err, _runId, _parentRunId, _tags, kwargs) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreChain) {
        try {
          await _optionalChain([handler, 'access', _115 => _115.handleChainError, 'optionalCall', _116 => _116(err, this.runId, this._parentRunId, this.tags, kwargs)]);
        } catch (err2) {
          console.error(`Error in handler ${handler.constructor.name}, handleChainError: ${err2}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleChainEnd(output, _runId, _parentRunId, _tags, kwargs) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreChain) {
        try {
          await _optionalChain([handler, 'access', _117 => _117.handleChainEnd, 'optionalCall', _118 => _118(output, this.runId, this._parentRunId, this.tags, kwargs)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleChainEnd: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleAgentAction(action) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreAgent) {
        try {
          await _optionalChain([handler, 'access', _119 => _119.handleAgentAction, 'optionalCall', _120 => _120(action, this.runId, this._parentRunId, this.tags)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleAgentAction: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleAgentEnd(action) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreAgent) {
        try {
          await _optionalChain([handler, 'access', _121 => _121.handleAgentEnd, 'optionalCall', _122 => _122(action, this.runId, this._parentRunId, this.tags)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleAgentEnd: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
};
var CallbackManagerForToolRun = class extends BaseRunManager {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "CallbackManagerForToolRun");
  }
  getChild(tag) {
    const manager = new CallbackManager(this.runId);
    manager.setHandlers(this.inheritableHandlers);
    manager.addTags(this.inheritableTags);
    manager.addMetadata(this.inheritableMetadata);
    if (tag) {
      manager.addTags([tag], false);
    }
    return manager;
  }
  async handleToolError(err) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreAgent) {
        try {
          await _optionalChain([handler, 'access', _123 => _123.handleToolError, 'optionalCall', _124 => _124(err, this.runId, this._parentRunId, this.tags)]);
        } catch (err2) {
          console.error(`Error in handler ${handler.constructor.name}, handleToolError: ${err2}`);
        }
      }
    }, handler.awaitHandlers)));
  }
  async handleToolEnd(output) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreAgent) {
        try {
          await _optionalChain([handler, 'access', _125 => _125.handleToolEnd, 'optionalCall', _126 => _126(output, this.runId, this._parentRunId, this.tags)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleToolEnd: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
  }
};
var CallbackManager = class _CallbackManager extends BaseCallbackManager {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "CallbackManager");
  }
  constructor(parentRunId, options) {
    super();
    Object.defineProperty(this, "handlers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "inheritableHandlers", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "tags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "inheritableTags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "metadata", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "inheritableMetadata", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "callback_manager"
    });
    Object.defineProperty(this, "_parentRunId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.handlers = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _127 => _127.handlers]), () => ( this.handlers));
    this.inheritableHandlers = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _128 => _128.inheritableHandlers]), () => ( this.inheritableHandlers));
    this.tags = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _129 => _129.tags]), () => ( this.tags));
    this.inheritableTags = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _130 => _130.inheritableTags]), () => ( this.inheritableTags));
    this.metadata = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _131 => _131.metadata]), () => ( this.metadata));
    this.inheritableMetadata = _nullishCoalesce(_optionalChain([options, 'optionalAccess', _132 => _132.inheritableMetadata]), () => ( this.inheritableMetadata));
    this._parentRunId = parentRunId;
  }
  async handleLLMStart(llm, prompts, _runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
    return Promise.all(prompts.map(async (prompt) => {
      const runId = v4_default();
      await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
        if (!handler.ignoreLLM) {
          try {
            await _optionalChain([handler, 'access', _133 => _133.handleLLMStart, 'optionalCall', _134 => _134(llm, [prompt], runId, this._parentRunId, extraParams, this.tags, this.metadata, runName)]);
          } catch (err) {
            console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
          }
        }
      }, handler.awaitHandlers)));
      return new CallbackManagerForLLMRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }));
  }
  async handleChatModelStart(llm, messages, _runId = void 0, _parentRunId = void 0, extraParams = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
    return Promise.all(messages.map(async (messageGroup) => {
      const runId = v4_default();
      await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
        if (!handler.ignoreLLM) {
          try {
            if (handler.handleChatModelStart) {
              await _optionalChain([handler, 'access', _135 => _135.handleChatModelStart, 'optionalCall', _136 => _136(llm, [messageGroup], runId, this._parentRunId, extraParams, this.tags, this.metadata, runName)]);
            } else if (handler.handleLLMStart) {
              const messageString = getBufferString(messageGroup);
              await _optionalChain([handler, 'access', _137 => _137.handleLLMStart, 'optionalCall', _138 => _138(llm, [messageString], runId, this._parentRunId, extraParams, this.tags, this.metadata, runName)]);
            }
          } catch (err) {
            console.error(`Error in handler ${handler.constructor.name}, handleLLMStart: ${err}`);
          }
        }
      }, handler.awaitHandlers)));
      return new CallbackManagerForLLMRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
    }));
  }
  async handleChainStart(chain, inputs, runId = v4_default(), runType = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreChain) {
        try {
          await _optionalChain([handler, 'access', _139 => _139.handleChainStart, 'optionalCall', _140 => _140(chain, inputs, runId, this._parentRunId, this.tags, this.metadata, runType, runName)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleChainStart: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
    return new CallbackManagerForChainRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
  }
  async handleToolStart(tool, input, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreAgent) {
        try {
          await _optionalChain([handler, 'access', _141 => _141.handleToolStart, 'optionalCall', _142 => _142(tool, input, runId, this._parentRunId, this.tags, this.metadata, runName)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleToolStart: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
    return new CallbackManagerForToolRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
  }
  async handleRetrieverStart(retriever, query, runId = v4_default(), _parentRunId = void 0, _tags = void 0, _metadata = void 0, runName = void 0) {
    await Promise.all(this.handlers.map((handler) => consumeCallback(async () => {
      if (!handler.ignoreRetriever) {
        try {
          await _optionalChain([handler, 'access', _143 => _143.handleRetrieverStart, 'optionalCall', _144 => _144(retriever, query, runId, this._parentRunId, this.tags, this.metadata, runName)]);
        } catch (err) {
          console.error(`Error in handler ${handler.constructor.name}, handleRetrieverStart: ${err}`);
        }
      }
    }, handler.awaitHandlers)));
    return new CallbackManagerForRetrieverRun(runId, this.handlers, this.inheritableHandlers, this.tags, this.inheritableTags, this.metadata, this.inheritableMetadata, this._parentRunId);
  }
  addHandler(handler, inherit = true) {
    this.handlers.push(handler);
    if (inherit) {
      this.inheritableHandlers.push(handler);
    }
  }
  removeHandler(handler) {
    this.handlers = this.handlers.filter((_handler) => _handler !== handler);
    this.inheritableHandlers = this.inheritableHandlers.filter((_handler) => _handler !== handler);
  }
  setHandlers(handlers, inherit = true) {
    this.handlers = [];
    this.inheritableHandlers = [];
    for (const handler of handlers) {
      this.addHandler(handler, inherit);
    }
  }
  addTags(tags, inherit = true) {
    this.removeTags(tags);
    this.tags.push(...tags);
    if (inherit) {
      this.inheritableTags.push(...tags);
    }
  }
  removeTags(tags) {
    this.tags = this.tags.filter((tag) => !tags.includes(tag));
    this.inheritableTags = this.inheritableTags.filter((tag) => !tags.includes(tag));
  }
  addMetadata(metadata, inherit = true) {
    this.metadata = { ...this.metadata, ...metadata };
    if (inherit) {
      this.inheritableMetadata = { ...this.inheritableMetadata, ...metadata };
    }
  }
  removeMetadata(metadata) {
    for (const key of Object.keys(metadata)) {
      delete this.metadata[key];
      delete this.inheritableMetadata[key];
    }
  }
  copy(additionalHandlers = [], inherit = true) {
    const manager = new _CallbackManager(this._parentRunId);
    for (const handler of this.handlers) {
      const inheritable = this.inheritableHandlers.includes(handler);
      manager.addHandler(handler, inheritable);
    }
    for (const tag of this.tags) {
      const inheritable = this.inheritableTags.includes(tag);
      manager.addTags([tag], inheritable);
    }
    for (const key of Object.keys(this.metadata)) {
      const inheritable = Object.keys(this.inheritableMetadata).includes(key);
      manager.addMetadata({ [key]: this.metadata[key] }, inheritable);
    }
    for (const handler of additionalHandlers) {
      if (
        // Prevent multiple copies of console_callback_handler
        manager.handlers.filter((h) => h.name === "console_callback_handler").some((h) => h.name === handler.name)
      ) {
        continue;
      }
      manager.addHandler(handler, inherit);
    }
    return manager;
  }
  static fromHandlers(handlers) {
    class Handler extends BaseCallbackHandler {
      static {
        _chunkEC6JY3PVcjs.__name.call(void 0, this, "Handler");
      }
      constructor() {
        super();
        Object.defineProperty(this, "name", {
          enumerable: true,
          configurable: true,
          writable: true,
          value: v4_default()
        });
        Object.assign(this, handlers);
      }
    }
    const manager = new this();
    manager.addHandler(new Handler());
    return manager;
  }
  static async configure(inheritableHandlers, localHandlers, inheritableTags, localTags, inheritableMetadata, localMetadata, options) {
    let callbackManager;
    if (inheritableHandlers || localHandlers) {
      if (Array.isArray(inheritableHandlers) || !inheritableHandlers) {
        callbackManager = new _CallbackManager();
        callbackManager.setHandlers(_nullishCoalesce(_optionalChain([inheritableHandlers, 'optionalAccess', _145 => _145.map, 'call', _146 => _146(ensureHandler)]), () => ( [])), true);
      } else {
        callbackManager = inheritableHandlers;
      }
      callbackManager = callbackManager.copy(Array.isArray(localHandlers) ? localHandlers.map(ensureHandler) : _optionalChain([localHandlers, 'optionalAccess', _147 => _147.handlers]), false);
    }
    const verboseEnabled = getEnvironmentVariable2("LANGCHAIN_VERBOSE") === "true" || _optionalChain([options, 'optionalAccess', _148 => _148.verbose]);
    const tracingV2Enabled = getEnvironmentVariable2("LANGCHAIN_TRACING_V2") === "true";
    const tracingEnabled = tracingV2Enabled || (_nullishCoalesce(getEnvironmentVariable2("LANGCHAIN_TRACING"), () => ( false)));
    if (verboseEnabled || tracingEnabled) {
      if (!callbackManager) {
        callbackManager = new _CallbackManager();
      }
      if (verboseEnabled && !callbackManager.handlers.some((handler) => handler.name === ConsoleCallbackHandler.prototype.name)) {
        const consoleHandler = new ConsoleCallbackHandler();
        callbackManager.addHandler(consoleHandler, true);
      }
      if (tracingEnabled && !callbackManager.handlers.some((handler) => handler.name === "langchain_tracer")) {
        if (tracingV2Enabled) {
          callbackManager.addHandler(await getTracingV2CallbackHandler(), true);
        }
      }
    }
    if (inheritableTags || localTags) {
      if (callbackManager) {
        callbackManager.addTags(_nullishCoalesce(inheritableTags, () => ( [])));
        callbackManager.addTags(_nullishCoalesce(localTags, () => ( [])), false);
      }
    }
    if (inheritableMetadata || localMetadata) {
      if (callbackManager) {
        callbackManager.addMetadata(_nullishCoalesce(inheritableMetadata, () => ( {})));
        callbackManager.addMetadata(_nullishCoalesce(localMetadata, () => ( {})), false);
      }
    }
    return callbackManager;
  }
};
function ensureHandler(handler) {
  if ("name" in handler) {
    return handler;
  }
  return BaseCallbackHandler.fromMethods(handler);
}
_chunkEC6JY3PVcjs.__name.call(void 0, ensureHandler, "ensureHandler");

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js
var core_exports = {};
_chunkEC6JY3PVcjs.__export.call(void 0, core_exports, {
  JsonPatchError: () => JsonPatchError,
  _areEquals: () => _areEquals,
  applyOperation: () => applyOperation,
  applyPatch: () => applyPatch,
  applyReducer: () => applyReducer,
  deepClone: () => deepClone,
  getValueByPointer: () => getValueByPointer,
  validate: () => validate2,
  validator: () => validator
});

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/helpers.js
var _hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProperty(obj, key) {
  return _hasOwnProperty.call(obj, key);
}
_chunkEC6JY3PVcjs.__name.call(void 0, hasOwnProperty, "hasOwnProperty");
function _objectKeys(obj) {
  if (Array.isArray(obj)) {
    const keys2 = new Array(obj.length);
    for (let k = 0; k < keys2.length; k++) {
      keys2[k] = "" + k;
    }
    return keys2;
  }
  if (Object.keys) {
    return Object.keys(obj);
  }
  let keys = [];
  for (let i in obj) {
    if (hasOwnProperty(obj, i)) {
      keys.push(i);
    }
  }
  return keys;
}
_chunkEC6JY3PVcjs.__name.call(void 0, _objectKeys, "_objectKeys");
function _deepClone(obj) {
  switch (typeof obj) {
    case "object":
      return JSON.parse(JSON.stringify(obj));
    case "undefined":
      return null;
    default:
      return obj;
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, _deepClone, "_deepClone");
function isInteger(str) {
  let i = 0;
  const len = str.length;
  let charCode;
  while (i < len) {
    charCode = str.charCodeAt(i);
    if (charCode >= 48 && charCode <= 57) {
      i++;
      continue;
    }
    return false;
  }
  return true;
}
_chunkEC6JY3PVcjs.__name.call(void 0, isInteger, "isInteger");
function escapePathComponent(path) {
  if (path.indexOf("/") === -1 && path.indexOf("~") === -1)
    return path;
  return path.replace(/~/g, "~0").replace(/\//g, "~1");
}
_chunkEC6JY3PVcjs.__name.call(void 0, escapePathComponent, "escapePathComponent");
function unescapePathComponent(path) {
  return path.replace(/~1/g, "/").replace(/~0/g, "~");
}
_chunkEC6JY3PVcjs.__name.call(void 0, unescapePathComponent, "unescapePathComponent");
function hasUndefined(obj) {
  if (obj === void 0) {
    return true;
  }
  if (obj) {
    if (Array.isArray(obj)) {
      for (let i2 = 0, len = obj.length; i2 < len; i2++) {
        if (hasUndefined(obj[i2])) {
          return true;
        }
      }
    } else if (typeof obj === "object") {
      const objKeys = _objectKeys(obj);
      const objKeysLength = objKeys.length;
      for (var i = 0; i < objKeysLength; i++) {
        if (hasUndefined(obj[objKeys[i]])) {
          return true;
        }
      }
    }
  }
  return false;
}
_chunkEC6JY3PVcjs.__name.call(void 0, hasUndefined, "hasUndefined");
function patchErrorMessageFormatter(message, args) {
  const messageParts = [message];
  for (const key in args) {
    const value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
    if (typeof value !== "undefined") {
      messageParts.push(`${key}: ${value}`);
    }
  }
  return messageParts.join("\n");
}
_chunkEC6JY3PVcjs.__name.call(void 0, patchErrorMessageFormatter, "patchErrorMessageFormatter");
var PatchError = class extends Error {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "PatchError");
  }
  constructor(message, name, index, operation, tree) {
    super(patchErrorMessageFormatter(message, { name, index, operation, tree }));
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: name
    });
    Object.defineProperty(this, "index", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: index
    });
    Object.defineProperty(this, "operation", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: operation
    });
    Object.defineProperty(this, "tree", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: tree
    });
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = patchErrorMessageFormatter(message, {
      name,
      index,
      operation,
      tree
    });
  }
};

// node_modules/@langchain/core/dist/utils/fast-json-patch/src/core.js
var JsonPatchError = PatchError;
var deepClone = _deepClone;
var objOps = {
  add: function(obj, key, document) {
    obj[key] = this.value;
    return { newDocument: document };
  },
  remove: function(obj, key, document) {
    var removed = obj[key];
    delete obj[key];
    return { newDocument: document, removed };
  },
  replace: function(obj, key, document) {
    var removed = obj[key];
    obj[key] = this.value;
    return { newDocument: document, removed };
  },
  move: function(obj, key, document) {
    let removed = getValueByPointer(document, this.path);
    if (removed) {
      removed = _deepClone(removed);
    }
    const originalValue = applyOperation(document, {
      op: "remove",
      path: this.from
    }).removed;
    applyOperation(document, {
      op: "add",
      path: this.path,
      value: originalValue
    });
    return { newDocument: document, removed };
  },
  copy: function(obj, key, document) {
    const valueToCopy = getValueByPointer(document, this.from);
    applyOperation(document, {
      op: "add",
      path: this.path,
      value: _deepClone(valueToCopy)
    });
    return { newDocument: document };
  },
  test: function(obj, key, document) {
    return { newDocument: document, test: _areEquals(obj[key], this.value) };
  },
  _get: function(obj, key, document) {
    this.value = obj[key];
    return { newDocument: document };
  }
};
var arrOps = {
  add: function(arr, i, document) {
    if (isInteger(i)) {
      arr.splice(i, 0, this.value);
    } else {
      arr[i] = this.value;
    }
    return { newDocument: document, index: i };
  },
  remove: function(arr, i, document) {
    var removedList = arr.splice(i, 1);
    return { newDocument: document, removed: removedList[0] };
  },
  replace: function(arr, i, document) {
    var removed = arr[i];
    arr[i] = this.value;
    return { newDocument: document, removed };
  },
  move: objOps.move,
  copy: objOps.copy,
  test: objOps.test,
  _get: objOps._get
};
function getValueByPointer(document, pointer) {
  if (pointer == "") {
    return document;
  }
  var getOriginalDestination = { op: "_get", path: pointer };
  applyOperation(document, getOriginalDestination);
  return getOriginalDestination.value;
}
_chunkEC6JY3PVcjs.__name.call(void 0, getValueByPointer, "getValueByPointer");
function applyOperation(document, operation, validateOperation = false, mutateDocument = true, banPrototypeModifications = true, index = 0) {
  if (validateOperation) {
    if (typeof validateOperation == "function") {
      validateOperation(operation, 0, document, operation.path);
    } else {
      validator(operation, 0);
    }
  }
  if (operation.path === "") {
    let returnValue = { newDocument: document };
    if (operation.op === "add") {
      returnValue.newDocument = operation.value;
      return returnValue;
    } else if (operation.op === "replace") {
      returnValue.newDocument = operation.value;
      returnValue.removed = document;
      return returnValue;
    } else if (operation.op === "move" || operation.op === "copy") {
      returnValue.newDocument = getValueByPointer(document, operation.from);
      if (operation.op === "move") {
        returnValue.removed = document;
      }
      return returnValue;
    } else if (operation.op === "test") {
      returnValue.test = _areEquals(document, operation.value);
      if (returnValue.test === false) {
        throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
      }
      returnValue.newDocument = document;
      return returnValue;
    } else if (operation.op === "remove") {
      returnValue.removed = document;
      returnValue.newDocument = null;
      return returnValue;
    } else if (operation.op === "_get") {
      operation.value = document;
      return returnValue;
    } else {
      if (validateOperation) {
        throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
      } else {
        return returnValue;
      }
    }
  } else {
    if (!mutateDocument) {
      document = _deepClone(document);
    }
    const path = operation.path || "";
    const keys = path.split("/");
    let obj = document;
    let t = 1;
    let len = keys.length;
    let existingPathFragment = void 0;
    let key;
    let validateFunction;
    if (typeof validateOperation == "function") {
      validateFunction = validateOperation;
    } else {
      validateFunction = validator;
    }
    while (true) {
      key = keys[t];
      if (key && key.indexOf("~") != -1) {
        key = unescapePathComponent(key);
      }
      if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t > 0 && keys[t - 1] == "constructor")) {
        throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
      }
      if (validateOperation) {
        if (existingPathFragment === void 0) {
          if (obj[key] === void 0) {
            existingPathFragment = keys.slice(0, t).join("/");
          } else if (t == len - 1) {
            existingPathFragment = operation.path;
          }
          if (existingPathFragment !== void 0) {
            validateFunction(operation, 0, document, existingPathFragment);
          }
        }
      }
      t++;
      if (Array.isArray(obj)) {
        if (key === "-") {
          key = obj.length;
        } else {
          if (validateOperation && !isInteger(key)) {
            throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
          } else if (isInteger(key)) {
            key = ~~key;
          }
        }
        if (t >= len) {
          if (validateOperation && operation.op === "add" && key > obj.length) {
            throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
          }
          const returnValue = arrOps[operation.op].call(operation, obj, key, document);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
          }
          return returnValue;
        }
      } else {
        if (t >= len) {
          const returnValue = objOps[operation.op].call(operation, obj, key, document);
          if (returnValue.test === false) {
            throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
          }
          return returnValue;
        }
      }
      obj = obj[key];
      if (validateOperation && t < len && (!obj || typeof obj !== "object")) {
        throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
      }
    }
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, applyOperation, "applyOperation");
function applyPatch(document, patch, validateOperation, mutateDocument = true, banPrototypeModifications = true) {
  if (validateOperation) {
    if (!Array.isArray(patch)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
  }
  if (!mutateDocument) {
    document = _deepClone(document);
  }
  const results = new Array(patch.length);
  for (let i = 0, length = patch.length; i < length; i++) {
    results[i] = applyOperation(document, patch[i], validateOperation, true, banPrototypeModifications, i);
    document = results[i].newDocument;
  }
  results.newDocument = document;
  return results;
}
_chunkEC6JY3PVcjs.__name.call(void 0, applyPatch, "applyPatch");
function applyReducer(document, operation, index) {
  const operationResult = applyOperation(document, operation);
  if (operationResult.test === false) {
    throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
  }
  return operationResult.newDocument;
}
_chunkEC6JY3PVcjs.__name.call(void 0, applyReducer, "applyReducer");
function validator(operation, index, document, existingPathFragment) {
  if (typeof operation !== "object" || operation === null || Array.isArray(operation)) {
    throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
  } else if (!objOps[operation.op]) {
    throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
  } else if (typeof operation.path !== "string") {
    throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
  } else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) {
    throw new JsonPatchError('Operation `path` property must start with "/"', "OPERATION_PATH_INVALID", index, operation, document);
  } else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") {
    throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
  } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && hasUndefined(operation.value)) {
    throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
  } else if (document) {
    if (operation.op == "add") {
      var pathLen = operation.path.split("/").length;
      var existingPathLen = existingPathFragment.split("/").length;
      if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
        throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
      }
    } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
      if (operation.path !== existingPathFragment) {
        throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
      }
    } else if (operation.op === "move" || operation.op === "copy") {
      var existingValue = {
        op: "_get",
        path: operation.from,
        value: void 0
      };
      var error = validate2([existingValue], document);
      if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") {
        throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
      }
    }
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, validator, "validator");
function validate2(sequence, document, externalValidator) {
  try {
    if (!Array.isArray(sequence)) {
      throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
    }
    if (document) {
      applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
    } else {
      externalValidator = externalValidator || validator;
      for (var i = 0; i < sequence.length; i++) {
        externalValidator(sequence[i], i, document, void 0);
      }
    }
  } catch (e) {
    if (e instanceof JsonPatchError) {
      return e;
    } else {
      throw e;
    }
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, validate2, "validate");
function _areEquals(a, b) {
  if (a === b)
    return true;
  if (a && b && typeof a == "object" && typeof b == "object") {
    var arrA = Array.isArray(a), arrB = Array.isArray(b), i, length, key;
    if (arrA && arrB) {
      length = a.length;
      if (length != b.length)
        return false;
      for (i = length; i-- !== 0; )
        if (!_areEquals(a[i], b[i]))
          return false;
      return true;
    }
    if (arrA != arrB)
      return false;
    var keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length)
      return false;
    for (i = length; i-- !== 0; )
      if (!b.hasOwnProperty(keys[i]))
        return false;
    for (i = length; i-- !== 0; ) {
      key = keys[i];
      if (!_areEquals(a[key], b[key]))
        return false;
    }
    return true;
  }
  return a !== a && b !== b;
}
_chunkEC6JY3PVcjs.__name.call(void 0, _areEquals, "_areEquals");

// node_modules/@langchain/core/dist/utils/fast-json-patch/index.js
var fast_json_patch_default = {
  ...core_exports,
  // ...duplex,
  JsonPatchError: PatchError,
  deepClone: _deepClone,
  escapePathComponent,
  unescapePathComponent
};

// node_modules/@langchain/core/dist/utils/stream.js
var IterableReadableStream = class _IterableReadableStream extends ReadableStream {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "IterableReadableStream");
  }
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "reader", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  ensureReader() {
    if (!this.reader) {
      this.reader = this.getReader();
    }
  }
  async next() {
    this.ensureReader();
    try {
      const result = await this.reader.read();
      if (result.done) {
        this.reader.releaseLock();
        return {
          done: true,
          value: void 0
        };
      } else {
        return {
          done: false,
          value: result.value
        };
      }
    } catch (e) {
      this.reader.releaseLock();
      throw e;
    }
  }
  async return() {
    this.ensureReader();
    if (this.locked) {
      const cancelPromise = this.reader.cancel();
      this.reader.releaseLock();
      await cancelPromise;
    }
    return { done: true, value: void 0 };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async throw(e) {
    this.ensureReader();
    if (this.locked) {
      const cancelPromise = this.reader.cancel();
      this.reader.releaseLock();
      await cancelPromise;
    }
    throw e;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  static fromReadableStream(stream) {
    const reader = stream.getReader();
    return new _IterableReadableStream({
      start(controller) {
        return pump();
        function pump() {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            controller.enqueue(value);
            return pump();
          });
        }
        _chunkEC6JY3PVcjs.__name.call(void 0, pump, "pump");
      },
      cancel() {
        reader.releaseLock();
      }
    });
  }
  static fromAsyncGenerator(generator) {
    return new _IterableReadableStream({
      async pull(controller) {
        const { value, done } = await generator.next();
        if (done) {
          controller.close();
        }
        controller.enqueue(value);
      }
    });
  }
};
function atee(iter, length = 2) {
  const buffers = Array.from({ length }, () => []);
  return buffers.map(/* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, async function* makeIter(buffer) {
    while (true) {
      if (buffer.length === 0) {
        const result = await iter.next();
        for (const buffer2 of buffers) {
          buffer2.push(result);
        }
      } else if (buffer[0].done) {
        return;
      } else {
        yield buffer.shift().value;
      }
    }
  }, "makeIter"));
}
_chunkEC6JY3PVcjs.__name.call(void 0, atee, "atee");
function concat(first, second) {
  if (Array.isArray(first) && Array.isArray(second)) {
    return first.concat(second);
  } else if (typeof first === "string" && typeof second === "string") {
    return first + second;
  } else if (typeof first === "number" && typeof second === "number") {
    return first + second;
  } else if (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "concat" in first && // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof first.concat === "function"
  ) {
    return first.concat(second);
  } else if (typeof first === "object" && typeof second === "object") {
    const chunk = { ...first };
    for (const [key, value] of Object.entries(second)) {
      if (key in chunk) {
        chunk[key] = concat(chunk[key], value);
      } else {
        chunk[key] = value;
      }
    }
    return chunk;
  } else {
    throw new Error(`Cannot concat ${typeof first} and ${typeof second}`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, concat, "concat");
var AsyncGeneratorWithSetup = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AsyncGeneratorWithSetup");
  }
  constructor(generator, startSetup) {
    Object.defineProperty(this, "generator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "setup", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "firstResult", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "firstResultUsed", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    this.generator = generator;
    this.setup = new Promise((resolve, reject) => {
      this.firstResult = generator.next();
      if (startSetup) {
        this.firstResult.then(startSetup).then(resolve, reject);
      } else {
        this.firstResult.then((_result) => resolve(void 0), reject);
      }
    });
  }
  async next(...args) {
    if (!this.firstResultUsed) {
      this.firstResultUsed = true;
      return this.firstResult;
    }
    return this.generator.next(...args);
  }
  async return(value) {
    return this.generator.return(value);
  }
  async throw(e) {
    return this.generator.throw(e);
  }
  [Symbol.asyncIterator]() {
    return this;
  }
};
async function pipeGeneratorWithSetup(to, generator, startSetup, ...args) {
  const gen = new AsyncGeneratorWithSetup(generator, startSetup);
  const setup = await gen.setup;
  return { output: to(gen, setup, ...args), setup };
}
_chunkEC6JY3PVcjs.__name.call(void 0, pipeGeneratorWithSetup, "pipeGeneratorWithSetup");

// node_modules/@langchain/core/dist/tracers/log_stream.js
var RunLogPatch = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunLogPatch");
  }
  constructor(fields) {
    Object.defineProperty(this, "ops", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.ops = fields.ops;
  }
  concat(other) {
    const ops = this.ops.concat(other.ops);
    const states = applyPatch({}, ops);
    return new RunLog({
      ops,
      state: states[states.length - 1].newDocument
    });
  }
};
var RunLog = class _RunLog extends RunLogPatch {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunLog");
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "state", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.state = fields.state;
  }
  concat(other) {
    const ops = this.ops.concat(other.ops);
    const states = applyPatch(this.state, other.ops);
    return new _RunLog({ ops, state: states[states.length - 1].newDocument });
  }
};
var LogStreamCallbackHandler = class extends BaseTracer {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "LogStreamCallbackHandler");
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "autoClose", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "includeNames", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "includeTypes", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "includeTags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "excludeNames", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "excludeTypes", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "excludeTags", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "rootId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "keyMapByRunId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "counterMapByRunName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "transformStream", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "writer", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "receiveStream", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "log_stream_tracer"
    });
    this.autoClose = _nullishCoalesce(_optionalChain([fields, 'optionalAccess', _149 => _149.autoClose]), () => ( true));
    this.includeNames = _optionalChain([fields, 'optionalAccess', _150 => _150.includeNames]);
    this.includeTypes = _optionalChain([fields, 'optionalAccess', _151 => _151.includeTypes]);
    this.includeTags = _optionalChain([fields, 'optionalAccess', _152 => _152.includeTags]);
    this.excludeNames = _optionalChain([fields, 'optionalAccess', _153 => _153.excludeNames]);
    this.excludeTypes = _optionalChain([fields, 'optionalAccess', _154 => _154.excludeTypes]);
    this.excludeTags = _optionalChain([fields, 'optionalAccess', _155 => _155.excludeTags]);
    this.transformStream = new TransformStream();
    this.writer = this.transformStream.writable.getWriter();
    this.receiveStream = IterableReadableStream.fromReadableStream(this.transformStream.readable);
  }
  [Symbol.asyncIterator]() {
    return this.receiveStream;
  }
  async persistRun(_run) {
  }
  _includeRun(run) {
    if (run.id === this.rootId) {
      return false;
    }
    const runTags = _nullishCoalesce(run.tags, () => ( []));
    let include = this.includeNames === void 0 && this.includeTags === void 0 && this.includeTypes === void 0;
    if (this.includeNames !== void 0) {
      include = include || this.includeNames.includes(run.name);
    }
    if (this.includeTypes !== void 0) {
      include = include || this.includeTypes.includes(run.run_type);
    }
    if (this.includeTags !== void 0) {
      include = include || runTags.find((tag) => _optionalChain([this, 'access', _156 => _156.includeTags, 'optionalAccess', _157 => _157.includes, 'call', _158 => _158(tag)])) !== void 0;
    }
    if (this.excludeNames !== void 0) {
      include = include && !this.excludeNames.includes(run.name);
    }
    if (this.excludeTypes !== void 0) {
      include = include && !this.excludeTypes.includes(run.run_type);
    }
    if (this.excludeTags !== void 0) {
      include = include && runTags.every((tag) => !_optionalChain([this, 'access', _159 => _159.excludeTags, 'optionalAccess', _160 => _160.includes, 'call', _161 => _161(tag)]));
    }
    return include;
  }
  async *tapOutputIterable(runId, output) {
    for await (const chunk of output) {
      if (runId !== this.rootId) {
        const key = this.keyMapByRunId[runId];
        if (key) {
          await this.writer.write(new RunLogPatch({
            ops: [
              {
                op: "add",
                path: `/logs/${key}/streamed_output/-`,
                value: chunk
              }
            ]
          }));
        }
      }
      yield chunk;
    }
  }
  async onRunCreate(run) {
    if (this.rootId === void 0) {
      this.rootId = run.id;
      await this.writer.write(new RunLogPatch({
        ops: [
          {
            op: "replace",
            path: "",
            value: {
              id: run.id,
              streamed_output: [],
              final_output: void 0,
              logs: {}
            }
          }
        ]
      }));
    }
    if (!this._includeRun(run)) {
      return;
    }
    if (this.counterMapByRunName[run.name] === void 0) {
      this.counterMapByRunName[run.name] = 0;
    }
    this.counterMapByRunName[run.name] += 1;
    const count = this.counterMapByRunName[run.name];
    this.keyMapByRunId[run.id] = count === 1 ? run.name : `${run.name}:${count}`;
    const logEntry = {
      id: run.id,
      name: run.name,
      type: run.run_type,
      tags: _nullishCoalesce(run.tags, () => ( [])),
      metadata: _nullishCoalesce(_optionalChain([run, 'access', _162 => _162.extra, 'optionalAccess', _163 => _163.metadata]), () => ( {})),
      start_time: new Date(run.start_time).toISOString(),
      streamed_output: [],
      streamed_output_str: [],
      final_output: void 0,
      end_time: void 0
    };
    await this.writer.write(new RunLogPatch({
      ops: [
        {
          op: "add",
          path: `/logs/${this.keyMapByRunId[run.id]}`,
          value: logEntry
        }
      ]
    }));
  }
  async onRunUpdate(run) {
    try {
      const runName = this.keyMapByRunId[run.id];
      if (runName === void 0) {
        return;
      }
      const ops = [
        {
          op: "add",
          path: `/logs/${runName}/final_output`,
          value: run.outputs
        }
      ];
      if (run.end_time !== void 0) {
        ops.push({
          op: "add",
          path: `/logs/${runName}/end_time`,
          value: new Date(run.end_time).toISOString()
        });
      }
      const patch = new RunLogPatch({ ops });
      await this.writer.write(patch);
    } finally {
      if (run.id === this.rootId) {
        const patch = new RunLogPatch({
          ops: [
            {
              op: "replace",
              path: "/final_output",
              value: run.outputs
            }
          ]
        });
        await this.writer.write(patch);
        if (this.autoClose) {
          await this.writer.close();
        }
      }
    }
  }
  async onLLMNewToken(run, token) {
    const runName = this.keyMapByRunId[run.id];
    if (runName === void 0) {
      return;
    }
    const patch = new RunLogPatch({
      ops: [
        {
          op: "add",
          path: `/logs/${runName}/streamed_output_str/-`,
          value: token
        }
      ]
    });
    await this.writer.write(patch);
  }
};

// node_modules/@langchain/core/dist/runnables/config.js
var DEFAULT_RECURSION_LIMIT = 25;
async function getCallbackManagerForConfig(config) {
  return CallbackManager.configure(_optionalChain([config, 'optionalAccess', _164 => _164.callbacks]), void 0, _optionalChain([config, 'optionalAccess', _165 => _165.tags]), void 0, _optionalChain([config, 'optionalAccess', _166 => _166.metadata]));
}
_chunkEC6JY3PVcjs.__name.call(void 0, getCallbackManagerForConfig, "getCallbackManagerForConfig");
function mergeConfigs(...configs) {
  const copy = ensureConfig();
  for (const options of configs.filter((c) => !!c)) {
    for (const key of Object.keys(options)) {
      if (key === "metadata") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "tags") {
        copy[key] = [...new Set(copy[key].concat(_nullishCoalesce(options[key], () => ( []))))];
      } else if (key === "configurable") {
        copy[key] = { ...copy[key], ...options[key] };
      } else if (key === "callbacks") {
        const baseCallbacks = copy.callbacks;
        const providedCallbacks = options.callbacks;
        if (Array.isArray(providedCallbacks)) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            copy.callbacks = baseCallbacks.concat(providedCallbacks);
          } else {
            const manager = baseCallbacks.copy();
            for (const callback of providedCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          }
        } else if (providedCallbacks) {
          if (!baseCallbacks) {
            copy.callbacks = providedCallbacks;
          } else if (Array.isArray(baseCallbacks)) {
            const manager = providedCallbacks.copy();
            for (const callback of baseCallbacks) {
              manager.addHandler(ensureHandler(callback), true);
            }
            copy.callbacks = manager;
          } else {
            copy.callbacks = new CallbackManager(providedCallbacks._parentRunId, {
              handlers: baseCallbacks.handlers.concat(providedCallbacks.handlers),
              inheritableHandlers: baseCallbacks.inheritableHandlers.concat(providedCallbacks.inheritableHandlers),
              tags: Array.from(new Set(baseCallbacks.tags.concat(providedCallbacks.tags))),
              inheritableTags: Array.from(new Set(baseCallbacks.inheritableTags.concat(providedCallbacks.inheritableTags))),
              metadata: {
                ...baseCallbacks.metadata,
                ...providedCallbacks.metadata
              }
            });
          }
        }
      } else {
        const typedKey = key;
        copy[typedKey] = _nullishCoalesce(options[typedKey], () => ( copy[typedKey]));
      }
    }
  }
  return copy;
}
_chunkEC6JY3PVcjs.__name.call(void 0, mergeConfigs, "mergeConfigs");
var PRIMITIVES = /* @__PURE__ */ new Set(["string", "number", "boolean"]);
function ensureConfig(config) {
  let empty = {
    tags: [],
    metadata: {},
    callbacks: void 0,
    recursionLimit: 25
  };
  if (config) {
    empty = { ...empty, ...config };
  }
  if (_optionalChain([config, 'optionalAccess', _167 => _167.configurable])) {
    for (const key of Object.keys(config.configurable)) {
      if (PRIMITIVES.has(typeof config.configurable[key]) && !_optionalChain([empty, 'access', _168 => _168.metadata, 'optionalAccess', _169 => _169[key]])) {
        if (!empty.metadata) {
          empty.metadata = {};
        }
        empty.metadata[key] = config.configurable[key];
      }
    }
  }
  return empty;
}
_chunkEC6JY3PVcjs.__name.call(void 0, ensureConfig, "ensureConfig");
function patchConfig(config = {}, { callbacks, maxConcurrency, recursionLimit, runName, configurable } = {}) {
  const newConfig = ensureConfig(config);
  if (callbacks !== void 0) {
    delete newConfig.runName;
    newConfig.callbacks = callbacks;
  }
  if (recursionLimit !== void 0) {
    newConfig.recursionLimit = recursionLimit;
  }
  if (maxConcurrency !== void 0) {
    newConfig.maxConcurrency = maxConcurrency;
  }
  if (runName !== void 0) {
    newConfig.runName = runName;
  }
  if (configurable !== void 0) {
    newConfig.configurable = { ...newConfig.configurable, ...configurable };
  }
  return newConfig;
}
_chunkEC6JY3PVcjs.__name.call(void 0, patchConfig, "patchConfig");

// node_modules/@langchain/core/dist/utils/async_caller.js
var import_p_retry2 = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_p_retry(), 1);
var import_p_queue3 = _chunkEC6JY3PVcjs.__toESM.call(void 0, require_dist(), 1);
var STATUS_NO_RETRY2 = [
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409
  // Conflict
];
var defaultFailedAttemptHandler = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (error) => {
  if (error.message.startsWith("Cancel") || error.message.startsWith("TimeoutError") || error.name === "TimeoutError" || error.message.startsWith("AbortError") || error.name === "AbortError") {
    throw error;
  }
  if (_optionalChain([error, 'optionalAccess', _170 => _170.code]) === "ECONNABORTED") {
    throw error;
  }
  const status = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _nullishCoalesce(_optionalChain([error, 'optionalAccess', _171 => _171.response, 'optionalAccess', _172 => _172.status]), () => ( _optionalChain([error, 'optionalAccess', _173 => _173.status])))
  );
  if (status && STATUS_NO_RETRY2.includes(+status)) {
    throw error;
  }
  if (_optionalChain([error, 'optionalAccess', _174 => _174.error, 'optionalAccess', _175 => _175.code]) === "insufficient_quota") {
    const err = new Error(_optionalChain([error, 'optionalAccess', _176 => _176.message]));
    err.name = "InsufficientQuotaError";
    throw err;
  }
}, "defaultFailedAttemptHandler");
var AsyncCaller2 = class {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AsyncCaller");
  }
  constructor(params) {
    Object.defineProperty(this, "maxConcurrency", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "maxRetries", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "onFailedAttempt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "queue", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.maxConcurrency = _nullishCoalesce(params.maxConcurrency, () => ( Infinity));
    this.maxRetries = _nullishCoalesce(params.maxRetries, () => ( 6));
    this.onFailedAttempt = _nullishCoalesce(params.onFailedAttempt, () => ( defaultFailedAttemptHandler));
    const PQueue = "default" in import_p_queue3.default ? import_p_queue3.default.default : import_p_queue3.default;
    this.queue = new PQueue({ concurrency: this.maxConcurrency });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  call(callable, ...args) {
    return this.queue.add(() => (0, import_p_retry2.default)(() => callable(...args).catch((error) => {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error);
      }
    }), {
      onFailedAttempt: this.onFailedAttempt,
      retries: this.maxRetries,
      randomize: true
      // If needed we can change some of the defaults here,
      // but they're quite sensible.
    }), { throwOnTimeout: true });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callWithOptions(options, callable, ...args) {
    if (options.signal) {
      return Promise.race([
        this.call(callable, ...args),
        new Promise((_, reject) => {
          _optionalChain([options, 'access', _177 => _177.signal, 'optionalAccess', _178 => _178.addEventListener, 'call', _179 => _179("abort", () => {
            reject(new Error("AbortError"));
          })]);
        })
      ]);
    }
    return this.call(callable, ...args);
  }
  fetch(...args) {
    return this.call(() => fetch(...args).then((res) => res.ok ? res : Promise.reject(res)));
  }
};

// node_modules/@langchain/core/dist/tracers/root_listener.js
var RootListenersTracer = class extends BaseTracer {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RootListenersTracer");
  }
  constructor({ config, onStart, onEnd, onError }) {
    super();
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "RootListenersTracer"
    });
    Object.defineProperty(this, "rootId", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "argOnStart", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "argOnEnd", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "argOnError", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.config = config;
    this.argOnStart = onStart;
    this.argOnEnd = onEnd;
    this.argOnError = onError;
  }
  /**
   * This is a legacy method only called once for an entire run tree
   * therefore not useful here
   * @param {Run} _ Not used
   */
  persistRun(_) {
    return Promise.resolve();
  }
  async onRunCreate(run) {
    if (this.rootId) {
      return;
    }
    this.rootId = run.id;
    if (this.argOnStart) {
      if (this.argOnStart.length === 1) {
        await this.argOnStart(run);
      } else if (this.argOnStart.length === 2) {
        await this.argOnStart(run, this.config);
      }
    }
  }
  async onRunUpdate(run) {
    if (run.id !== this.rootId) {
      return;
    }
    if (!run.error) {
      if (this.argOnEnd) {
        if (this.argOnEnd.length === 1) {
          await this.argOnEnd(run);
        } else if (this.argOnEnd.length === 2) {
          await this.argOnEnd(run, this.config);
        }
      }
    } else if (this.argOnError) {
      if (this.argOnError.length === 1) {
        await this.argOnError(run);
      } else if (this.argOnError.length === 2) {
        await this.argOnError(run, this.config);
      }
    }
  }
};

// node_modules/@langchain/core/dist/runnables/base.js
function _coerceToDict2(value, defaultKey) {
  return value && !Array.isArray(value) && // eslint-disable-next-line no-instanceof/no-instanceof
  !(value instanceof Date) && typeof value === "object" ? value : { [defaultKey]: value };
}
_chunkEC6JY3PVcjs.__name.call(void 0, _coerceToDict2, "_coerceToDict");
var Runnable = class extends Serializable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "Runnable");
  }
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "lc_runnable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
  }
  getName(suffix) {
    const name = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      _nullishCoalesce(_nullishCoalesce(this.name, () => ( this.constructor.lc_name())), () => ( this.constructor.name))
    );
    return suffix ? `${name}${suffix}` : name;
  }
  /**
   * Bind arguments to a Runnable, returning a new Runnable.
   * @param kwargs
   * @returns A new RunnableBinding that, when invoked, will apply the bound args.
   */
  bind(kwargs) {
    return new RunnableBinding({ bound: this, kwargs, config: {} });
  }
  /**
   * Return a new Runnable that maps a list of inputs to a list of outputs,
   * by calling invoke() with each input.
   */
  map() {
    return new RunnableEach({ bound: this });
  }
  /**
   * Add retry logic to an existing runnable.
   * @param kwargs
   * @returns A new RunnableRetry that, when invoked, will retry according to the parameters.
   */
  withRetry(fields) {
    return new RunnableRetry({
      bound: this,
      kwargs: {},
      config: {},
      maxAttemptNumber: _optionalChain([fields, 'optionalAccess', _180 => _180.stopAfterAttempt]),
      ...fields
    });
  }
  /**
   * Bind config to a Runnable, returning a new Runnable.
   * @param config New configuration parameters to attach to the new runnable.
   * @returns A new RunnableBinding with a config matching what's passed.
   */
  withConfig(config) {
    return new RunnableBinding({
      bound: this,
      config,
      kwargs: {}
    });
  }
  /**
   * Create a new runnable from the current one that will try invoking
   * other passed fallback runnables if the initial invocation fails.
   * @param fields.fallbacks Other runnables to call if the runnable errors.
   * @returns A new RunnableWithFallbacks.
   */
  withFallbacks(fields) {
    return new RunnableWithFallbacks({
      runnable: this,
      fallbacks: fields.fallbacks
    });
  }
  _getOptionsList(options, length = 0) {
    if (Array.isArray(options)) {
      if (options.length !== length) {
        throw new Error(`Passed "options" must be an array with the same length as the inputs, but got ${options.length} options for ${length} inputs`);
      }
      return options.map(ensureConfig);
    }
    return Array.from({ length }, () => ensureConfig(options));
  }
  async batch(inputs, options, batchOptions) {
    const configList = this._getOptionsList(_nullishCoalesce(options, () => ( {})), inputs.length);
    const maxConcurrency = _nullishCoalesce(_optionalChain([configList, 'access', _181 => _181[0], 'optionalAccess', _182 => _182.maxConcurrency]), () => ( _optionalChain([batchOptions, 'optionalAccess', _183 => _183.maxConcurrency])));
    const caller = new AsyncCaller2({
      maxConcurrency,
      onFailedAttempt: (e) => {
        throw e;
      }
    });
    const batchCalls = inputs.map((input, i) => caller.call(async () => {
      try {
        const result = await this.invoke(input, configList[i]);
        return result;
      } catch (e) {
        if (_optionalChain([batchOptions, 'optionalAccess', _184 => _184.returnExceptions])) {
          return e;
        }
        throw e;
      }
    }));
    return Promise.all(batchCalls);
  }
  /**
   * Default streaming implementation.
   * Subclasses should override this method if they support streaming output.
   * @param input
   * @param options
   */
  async *_streamIterator(input, options) {
    yield this.invoke(input, options);
  }
  /**
   * Stream output in chunks.
   * @param input
   * @param options
   * @returns A readable stream that is also an iterable.
   */
  async stream(input, options) {
    const wrappedGenerator = new AsyncGeneratorWithSetup(this._streamIterator(input, options));
    await wrappedGenerator.setup;
    return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
  }
  _separateRunnableConfigFromCallOptions(options = {}) {
    const runnableConfig = ensureConfig({
      callbacks: options.callbacks,
      tags: options.tags,
      metadata: options.metadata,
      runName: options.runName,
      configurable: options.configurable,
      recursionLimit: options.recursionLimit,
      maxConcurrency: options.maxConcurrency
    });
    const callOptions = { ...options };
    delete callOptions.callbacks;
    delete callOptions.tags;
    delete callOptions.metadata;
    delete callOptions.runName;
    delete callOptions.configurable;
    delete callOptions.recursionLimit;
    delete callOptions.maxConcurrency;
    return [runnableConfig, callOptions];
  }
  async _callWithConfig(func, input, options) {
    const config = ensureConfig(options);
    const callbackManager_ = await getCallbackManagerForConfig(config);
    const runManager = await _optionalChain([callbackManager_, 'optionalAccess', _185 => _185.handleChainStart, 'call', _186 => _186(this.toJSON(), _coerceToDict2(input, "input"), void 0, _optionalChain([config, 'optionalAccess', _187 => _187.runType]), void 0, void 0, _nullishCoalesce(_optionalChain([config, 'optionalAccess', _188 => _188.runName]), () => ( this.getName())))]);
    let output;
    try {
      output = await func.call(this, input, config, runManager);
    } catch (e) {
      await _optionalChain([runManager, 'optionalAccess', _189 => _189.handleChainError, 'call', _190 => _190(e)]);
      throw e;
    }
    await _optionalChain([runManager, 'optionalAccess', _191 => _191.handleChainEnd, 'call', _192 => _192(_coerceToDict2(output, "output"))]);
    return output;
  }
  /**
   * Internal method that handles batching and configuration for a runnable
   * It takes a function, input values, and optional configuration, and
   * returns a promise that resolves to the output values.
   * @param func The function to be executed for each input value.
   * @param input The input values to be processed.
   * @param config Optional configuration for the function execution.
   * @returns A promise that resolves to the output values.
   */
  async _batchWithConfig(func, inputs, options, batchOptions) {
    const optionsList = this._getOptionsList(_nullishCoalesce(options, () => ( {})), inputs.length);
    const callbackManagers = await Promise.all(optionsList.map(getCallbackManagerForConfig));
    const runManagers = await Promise.all(callbackManagers.map((callbackManager, i) => _optionalChain([callbackManager, 'optionalAccess', _193 => _193.handleChainStart, 'call', _194 => _194(this.toJSON(), _coerceToDict2(inputs[i], "input"), void 0, optionsList[i].runType, void 0, void 0, _nullishCoalesce(optionsList[i].runName, () => ( this.getName())))])));
    let outputs;
    try {
      outputs = await func.call(this, inputs, optionsList, runManagers, batchOptions);
    } catch (e) {
      await Promise.all(runManagers.map((runManager) => _optionalChain([runManager, 'optionalAccess', _195 => _195.handleChainError, 'call', _196 => _196(e)])));
      throw e;
    }
    await Promise.all(runManagers.map((runManager) => _optionalChain([runManager, 'optionalAccess', _197 => _197.handleChainEnd, 'call', _198 => _198(_coerceToDict2(outputs, "output"))])));
    return outputs;
  }
  /**
   * Helper method to transform an Iterator of Input values into an Iterator of
   * Output values, with callbacks.
   * Use this to implement `stream()` or `transform()` in Runnable subclasses.
   */
  async *_transformStreamWithConfig(inputGenerator, transformer, options) {
    let finalInput;
    let finalInputSupported = true;
    let finalOutput;
    let finalOutputSupported = true;
    const config = ensureConfig(options);
    const callbackManager_ = await getCallbackManagerForConfig(config);
    async function* wrapInputForTracing() {
      for await (const chunk of inputGenerator) {
        if (finalInputSupported) {
          if (finalInput === void 0) {
            finalInput = chunk;
          } else {
            try {
              finalInput = concat(finalInput, chunk);
            } catch (e2) {
              finalInput = void 0;
              finalInputSupported = false;
            }
          }
        }
        yield chunk;
      }
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, wrapInputForTracing, "wrapInputForTracing");
    let runManager;
    try {
      const pipe = await pipeGeneratorWithSetup(transformer.bind(this), wrapInputForTracing(), async () => _optionalChain([callbackManager_, 'optionalAccess', _199 => _199.handleChainStart, 'call', _200 => _200(this.toJSON(), { input: "" }, void 0, _optionalChain([config, 'optionalAccess', _201 => _201.runType]), void 0, void 0, _nullishCoalesce(_optionalChain([config, 'optionalAccess', _202 => _202.runName]), () => ( this.getName())))]), config);
      runManager = pipe.setup;
      const isLogStreamHandler = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (handler) => handler.name === "log_stream_tracer", "isLogStreamHandler");
      const streamLogHandler = _optionalChain([runManager, 'optionalAccess', _203 => _203.handlers, 'access', _204 => _204.find, 'call', _205 => _205(isLogStreamHandler)]);
      let iterator = pipe.output;
      if (streamLogHandler !== void 0 && runManager !== void 0) {
        iterator = await streamLogHandler.tapOutputIterable(runManager.runId, pipe.output);
      }
      for await (const chunk of iterator) {
        yield chunk;
        if (finalOutputSupported) {
          if (finalOutput === void 0) {
            finalOutput = chunk;
          } else {
            try {
              finalOutput = concat(finalOutput, chunk);
            } catch (e3) {
              finalOutput = void 0;
              finalOutputSupported = false;
            }
          }
        }
      }
    } catch (e) {
      await _optionalChain([runManager, 'optionalAccess', _206 => _206.handleChainError, 'call', _207 => _207(e, void 0, void 0, void 0, {
        inputs: _coerceToDict2(finalInput, "input")
      })]);
      throw e;
    }
    await _optionalChain([runManager, 'optionalAccess', _208 => _208.handleChainEnd, 'call', _209 => _209(_nullishCoalesce(finalOutput, () => ( {})), void 0, void 0, void 0, { inputs: _coerceToDict2(finalInput, "input") })]);
  }
  /**
   * Create a new runnable sequence that runs each individual runnable in series,
   * piping the output of one runnable into another runnable or runnable-like.
   * @param coerceable A runnable, function, or object whose values are functions or runnables.
   * @returns A new runnable sequence.
   */
  pipe(coerceable) {
    return new RunnableSequence({
      first: this,
      last: _coerceToRunnable(coerceable)
    });
  }
  /**
   * Pick keys from the dict output of this runnable. Returns a new runnable.
   */
  pick(keys) {
    return this.pipe(new RunnablePick(keys));
  }
  /**
   * Assigns new fields to the dict output of this runnable. Returns a new runnable.
   */
  assign(mapping) {
    return this.pipe(
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      new RunnableAssign(
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        new RunnableMap({ steps: mapping })
      )
    );
  }
  /**
   * Default implementation of transform, which buffers input and then calls stream.
   * Subclasses should override this method if they can start producing output while
   * input is still being generated.
   * @param generator
   * @param options
   */
  async *transform(generator, options) {
    let finalChunk;
    for await (const chunk of generator) {
      if (finalChunk === void 0) {
        finalChunk = chunk;
      } else {
        finalChunk = concat(finalChunk, chunk);
      }
    }
    yield* this._streamIterator(finalChunk, options);
  }
  /**
   * Stream all output from a runnable, as reported to the callback system.
   * This includes all inner runs of LLMs, Retrievers, Tools, etc.
   * Output is streamed as Log objects, which include a list of
   * jsonpatch ops that describe how the state of the run has changed in each
   * step, and the final state of the run.
   * The jsonpatch ops can be applied in order to construct state.
   * @param input
   * @param options
   * @param streamOptions
   */
  async *streamLog(input, options, streamOptions) {
    const stream = new LogStreamCallbackHandler({
      ...streamOptions,
      autoClose: false
    });
    const config = ensureConfig(options);
    const { callbacks } = config;
    if (callbacks === void 0) {
      config.callbacks = [stream];
    } else if (Array.isArray(callbacks)) {
      config.callbacks = callbacks.concat([stream]);
    } else {
      const copiedCallbacks = callbacks.copy();
      copiedCallbacks.inheritableHandlers.push(stream);
      config.callbacks = copiedCallbacks;
    }
    const runnableStream = await this.stream(input, config);
    async function consumeRunnableStream() {
      try {
        for await (const chunk of runnableStream) {
          const patch = new RunLogPatch({
            ops: [
              {
                op: "add",
                path: "/streamed_output/-",
                value: chunk
              }
            ]
          });
          await stream.writer.write(patch);
        }
      } finally {
        await stream.writer.close();
      }
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, consumeRunnableStream, "consumeRunnableStream");
    const runnableStreamPromise = consumeRunnableStream();
    try {
      for await (const log of stream) {
        yield log;
      }
    } finally {
      await runnableStreamPromise;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isRunnable(thing) {
    return thing ? thing.lc_runnable : false;
  }
  /**
   * Bind lifecycle listeners to a Runnable, returning a new Runnable.
   * The Run object contains information about the run, including its id,
   * type, input, output, error, startTime, endTime, and any tags or metadata
   * added to the run.
   *
   * @param {Object} params - The object containing the callback functions.
   * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
   * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
   * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
   */
  withListeners({ onStart, onEnd, onError }) {
    return new RunnableBinding({
      bound: this,
      config: {},
      configFactories: [
        (config) => ({
          callbacks: [
            new RootListenersTracer({
              config,
              onStart,
              onEnd,
              onError
            })
          ]
        })
      ]
    });
  }
};
var RunnableBinding = class _RunnableBinding extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableBinding");
  }
  static lc_name() {
    return "RunnableBinding";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "bound", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "config", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "kwargs", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "configFactories", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.bound = fields.bound;
    this.kwargs = fields.kwargs;
    this.config = fields.config;
    this.configFactories = fields.configFactories;
  }
  getName(suffix) {
    return this.bound.getName(suffix);
  }
  async _mergeConfig(...options) {
    const config = mergeConfigs(this.config, ...options);
    return mergeConfigs(config, ...this.configFactories ? await Promise.all(this.configFactories.map(async (configFactory) => await configFactory(config))) : []);
  }
  bind(kwargs) {
    return new this.constructor({
      bound: this.bound,
      kwargs: { ...this.kwargs, ...kwargs },
      config: this.config
    });
  }
  withConfig(config) {
    return new this.constructor({
      bound: this.bound,
      kwargs: this.kwargs,
      config: { ...this.config, ...config }
    });
  }
  withRetry(fields) {
    return new this.constructor({
      bound: this.bound.withRetry(fields),
      kwargs: this.kwargs,
      config: this.config
    });
  }
  async invoke(input, options) {
    return this.bound.invoke(input, await this._mergeConfig(options, this.kwargs));
  }
  async batch(inputs, options, batchOptions) {
    const mergedOptions = Array.isArray(options) ? await Promise.all(options.map(async (individualOption) => this._mergeConfig(individualOption, this.kwargs))) : await this._mergeConfig(options, this.kwargs);
    return this.bound.batch(inputs, mergedOptions, batchOptions);
  }
  async *_streamIterator(input, options) {
    yield* this.bound._streamIterator(input, await this._mergeConfig(options, this.kwargs));
  }
  async stream(input, options) {
    return this.bound.stream(input, await this._mergeConfig(options, this.kwargs));
  }
  async *transform(generator, options) {
    yield* this.bound.transform(generator, await this._mergeConfig(options, this.kwargs));
  }
  static isRunnableBinding(thing) {
    return thing.bound && Runnable.isRunnable(thing.bound);
  }
  /**
   * Bind lifecycle listeners to a Runnable, returning a new Runnable.
   * The Run object contains information about the run, including its id,
   * type, input, output, error, startTime, endTime, and any tags or metadata
   * added to the run.
   *
   * @param {Object} params - The object containing the callback functions.
   * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
   * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
   * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
   */
  withListeners({ onStart, onEnd, onError }) {
    return new _RunnableBinding({
      bound: this.bound,
      kwargs: this.kwargs,
      config: this.config,
      configFactories: [
        (config) => ({
          callbacks: [
            new RootListenersTracer({
              config,
              onStart,
              onEnd,
              onError
            })
          ]
        })
      ]
    });
  }
};
var RunnableEach = class _RunnableEach extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableEach");
  }
  static lc_name() {
    return "RunnableEach";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "bound", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.bound = fields.bound;
  }
  /**
   * Binds the runnable with the specified arguments.
   * @param kwargs The arguments to bind the runnable with.
   * @returns A new instance of the `RunnableEach` class that is bound with the specified arguments.
   */
  bind(kwargs) {
    return new _RunnableEach({
      bound: this.bound.bind(kwargs)
    });
  }
  /**
   * Invokes the runnable with the specified input and configuration.
   * @param input The input to invoke the runnable with.
   * @param config The configuration to invoke the runnable with.
   * @returns A promise that resolves to the output of the runnable.
   */
  async invoke(inputs, config) {
    return this._callWithConfig(this._invoke, inputs, config);
  }
  /**
   * A helper method that is used to invoke the runnable with the specified input and configuration.
   * @param input The input to invoke the runnable with.
   * @param config The configuration to invoke the runnable with.
   * @returns A promise that resolves to the output of the runnable.
   */
  async _invoke(inputs, config, runManager) {
    return this.bound.batch(inputs, patchConfig(config, { callbacks: _optionalChain([runManager, 'optionalAccess', _210 => _210.getChild, 'call', _211 => _211()]) }));
  }
  /**
   * Bind lifecycle listeners to a Runnable, returning a new Runnable.
   * The Run object contains information about the run, including its id,
   * type, input, output, error, startTime, endTime, and any tags or metadata
   * added to the run.
   *
   * @param {Object} params - The object containing the callback functions.
   * @param {(run: Run) => void} params.onStart - Called before the runnable starts running, with the Run object.
   * @param {(run: Run) => void} params.onEnd - Called after the runnable finishes running, with the Run object.
   * @param {(run: Run) => void} params.onError - Called if the runnable throws an error, with the Run object.
   */
  withListeners({ onStart, onEnd, onError }) {
    return new _RunnableEach({
      bound: this.bound.withListeners({ onStart, onEnd, onError })
    });
  }
};
var RunnableRetry = class extends RunnableBinding {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableRetry");
  }
  static lc_name() {
    return "RunnableRetry";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "maxAttemptNumber", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: 3
    });
    Object.defineProperty(this, "onFailedAttempt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: () => {
      }
    });
    this.maxAttemptNumber = _nullishCoalesce(fields.maxAttemptNumber, () => ( this.maxAttemptNumber));
    this.onFailedAttempt = _nullishCoalesce(fields.onFailedAttempt, () => ( this.onFailedAttempt));
  }
  _patchConfigForRetry(attempt, config, runManager) {
    const tag = attempt > 1 ? `retry:attempt:${attempt}` : void 0;
    return patchConfig(config, { callbacks: _optionalChain([runManager, 'optionalAccess', _212 => _212.getChild, 'call', _213 => _213(tag)]) });
  }
  async _invoke(input, config, runManager) {
    return (0, import_p_retry3.default)((attemptNumber) => super.invoke(input, this._patchConfigForRetry(attemptNumber, config, runManager)), {
      onFailedAttempt: this.onFailedAttempt,
      retries: Math.max(this.maxAttemptNumber - 1, 0),
      randomize: true
    });
  }
  /**
   * Method that invokes the runnable with the specified input, run manager,
   * and config. It handles the retry logic by catching any errors and
   * recursively invoking itself with the updated config for the next retry
   * attempt.
   * @param input The input for the runnable.
   * @param runManager The run manager for the runnable.
   * @param config The config for the runnable.
   * @returns A promise that resolves to the output of the runnable.
   */
  async invoke(input, config) {
    return this._callWithConfig(this._invoke, input, config);
  }
  async _batch(inputs, configs, runManagers, batchOptions) {
    const resultsMap = {};
    try {
      await (0, import_p_retry3.default)(async (attemptNumber) => {
        const remainingIndexes = inputs.map((_, i) => i).filter((i) => resultsMap[i.toString()] === void 0 || // eslint-disable-next-line no-instanceof/no-instanceof
        resultsMap[i.toString()] instanceof Error);
        const remainingInputs = remainingIndexes.map((i) => inputs[i]);
        const patchedConfigs = remainingIndexes.map((i) => this._patchConfigForRetry(attemptNumber, _optionalChain([configs, 'optionalAccess', _214 => _214[i]]), _optionalChain([runManagers, 'optionalAccess', _215 => _215[i]])));
        const results = await super.batch(remainingInputs, patchedConfigs, {
          ...batchOptions,
          returnExceptions: true
        });
        let firstException;
        for (let i = 0; i < results.length; i += 1) {
          const result = results[i];
          const resultMapIndex = remainingIndexes[i];
          if (result instanceof Error) {
            if (firstException === void 0) {
              firstException = result;
            }
          }
          resultsMap[resultMapIndex.toString()] = result;
        }
        if (firstException) {
          throw firstException;
        }
        return results;
      }, {
        onFailedAttempt: this.onFailedAttempt,
        retries: Math.max(this.maxAttemptNumber - 1, 0),
        randomize: true
      });
    } catch (e) {
      if (_optionalChain([batchOptions, 'optionalAccess', _216 => _216.returnExceptions]) !== true) {
        throw e;
      }
    }
    return Object.keys(resultsMap).sort((a, b) => parseInt(a, 10) - parseInt(b, 10)).map((key) => resultsMap[parseInt(key, 10)]);
  }
  async batch(inputs, options, batchOptions) {
    return this._batchWithConfig(this._batch.bind(this), inputs, options, batchOptions);
  }
};
var RunnableSequence = class _RunnableSequence extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableSequence");
  }
  static lc_name() {
    return "RunnableSequence";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "first", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "middle", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "last", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    this.first = fields.first;
    this.middle = _nullishCoalesce(fields.middle, () => ( this.middle));
    this.last = fields.last;
    this.name = fields.name;
  }
  get steps() {
    return [this.first, ...this.middle, this.last];
  }
  async invoke(input, options) {
    const callbackManager_ = await getCallbackManagerForConfig(options);
    const runManager = await _optionalChain([callbackManager_, 'optionalAccess', _217 => _217.handleChainStart, 'call', _218 => _218(this.toJSON(), _coerceToDict2(input, "input"), void 0, void 0, void 0, void 0, _optionalChain([options, 'optionalAccess', _219 => _219.runName]))]);
    let nextStepInput = input;
    let finalOutput;
    try {
      const initialSteps = [this.first, ...this.middle];
      for (let i = 0; i < initialSteps.length; i += 1) {
        const step = initialSteps[i];
        nextStepInput = await step.invoke(nextStepInput, patchConfig(options, {
          callbacks: _optionalChain([runManager, 'optionalAccess', _220 => _220.getChild, 'call', _221 => _221(`seq:step:${i + 1}`)])
        }));
      }
      finalOutput = await this.last.invoke(nextStepInput, patchConfig(options, {
        callbacks: _optionalChain([runManager, 'optionalAccess', _222 => _222.getChild, 'call', _223 => _223(`seq:step:${this.steps.length}`)])
      }));
    } catch (e) {
      await _optionalChain([runManager, 'optionalAccess', _224 => _224.handleChainError, 'call', _225 => _225(e)]);
      throw e;
    }
    await _optionalChain([runManager, 'optionalAccess', _226 => _226.handleChainEnd, 'call', _227 => _227(_coerceToDict2(finalOutput, "output"))]);
    return finalOutput;
  }
  async batch(inputs, options, batchOptions) {
    const configList = this._getOptionsList(_nullishCoalesce(options, () => ( {})), inputs.length);
    const callbackManagers = await Promise.all(configList.map(getCallbackManagerForConfig));
    const runManagers = await Promise.all(callbackManagers.map((callbackManager, i) => _optionalChain([callbackManager, 'optionalAccess', _228 => _228.handleChainStart, 'call', _229 => _229(this.toJSON(), _coerceToDict2(inputs[i], "input"), void 0, void 0, void 0, void 0, configList[i].runName)])));
    let nextStepInputs = inputs;
    try {
      for (let i = 0; i < this.steps.length; i += 1) {
        const step = this.steps[i];
        nextStepInputs = await step.batch(nextStepInputs, runManagers.map((runManager, j) => {
          const childRunManager = _optionalChain([runManager, 'optionalAccess', _230 => _230.getChild, 'call', _231 => _231(`seq:step:${i + 1}`)]);
          return patchConfig(configList[j], { callbacks: childRunManager });
        }), batchOptions);
      }
    } catch (e) {
      await Promise.all(runManagers.map((runManager) => _optionalChain([runManager, 'optionalAccess', _232 => _232.handleChainError, 'call', _233 => _233(e)])));
      throw e;
    }
    await Promise.all(runManagers.map((runManager) => _optionalChain([runManager, 'optionalAccess', _234 => _234.handleChainEnd, 'call', _235 => _235(_coerceToDict2(nextStepInputs, "output"))])));
    return nextStepInputs;
  }
  async *_streamIterator(input, options) {
    const callbackManager_ = await getCallbackManagerForConfig(options);
    const runManager = await _optionalChain([callbackManager_, 'optionalAccess', _236 => _236.handleChainStart, 'call', _237 => _237(this.toJSON(), _coerceToDict2(input, "input"), void 0, void 0, void 0, void 0, _optionalChain([options, 'optionalAccess', _238 => _238.runName]))]);
    const steps = [this.first, ...this.middle, this.last];
    let concatSupported = true;
    let finalOutput;
    async function* inputGenerator() {
      yield input;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, inputGenerator, "inputGenerator");
    try {
      let finalGenerator = steps[0].transform(inputGenerator(), patchConfig(options, {
        callbacks: _optionalChain([runManager, 'optionalAccess', _239 => _239.getChild, 'call', _240 => _240(`seq:step:1`)])
      }));
      for (let i = 1; i < steps.length; i += 1) {
        const step = steps[i];
        finalGenerator = await step.transform(finalGenerator, patchConfig(options, {
          callbacks: _optionalChain([runManager, 'optionalAccess', _241 => _241.getChild, 'call', _242 => _242(`seq:step:${i + 1}`)])
        }));
      }
      for await (const chunk of finalGenerator) {
        yield chunk;
        if (concatSupported) {
          if (finalOutput === void 0) {
            finalOutput = chunk;
          } else {
            try {
              finalOutput = concat(finalOutput, chunk);
            } catch (e) {
              finalOutput = void 0;
              concatSupported = false;
            }
          }
        }
      }
    } catch (e) {
      await _optionalChain([runManager, 'optionalAccess', _243 => _243.handleChainError, 'call', _244 => _244(e)]);
      throw e;
    }
    await _optionalChain([runManager, 'optionalAccess', _245 => _245.handleChainEnd, 'call', _246 => _246(_coerceToDict2(finalOutput, "output"))]);
  }
  pipe(coerceable) {
    if (_RunnableSequence.isRunnableSequence(coerceable)) {
      return new _RunnableSequence({
        first: this.first,
        middle: this.middle.concat([
          this.last,
          coerceable.first,
          ...coerceable.middle
        ]),
        last: coerceable.last,
        name: _nullishCoalesce(this.name, () => ( coerceable.name))
      });
    } else {
      return new _RunnableSequence({
        first: this.first,
        middle: [...this.middle, this.last],
        last: _coerceToRunnable(coerceable),
        name: this.name
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static isRunnableSequence(thing) {
    return Array.isArray(thing.middle) && Runnable.isRunnable(thing);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static from([first, ...runnables], name) {
    return new _RunnableSequence({
      first: _coerceToRunnable(first),
      middle: runnables.slice(0, -1).map(_coerceToRunnable),
      last: _coerceToRunnable(runnables[runnables.length - 1]),
      name
    });
  }
};
var RunnableMap = class _RunnableMap extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableMap");
  }
  static lc_name() {
    return "RunnableMap";
  }
  getStepsKeys() {
    return Object.keys(this.steps);
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "steps", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.steps = {};
    for (const [key, value] of Object.entries(fields.steps)) {
      this.steps[key] = _coerceToRunnable(value);
    }
  }
  static from(steps) {
    return new _RunnableMap({ steps });
  }
  async invoke(input, options) {
    const callbackManager_ = await getCallbackManagerForConfig(options);
    const runManager = await _optionalChain([callbackManager_, 'optionalAccess', _247 => _247.handleChainStart, 'call', _248 => _248(this.toJSON(), {
      input
    }, void 0, void 0, void 0, void 0, _optionalChain([options, 'optionalAccess', _249 => _249.runName]))]);
    const output = {};
    try {
      await Promise.all(Object.entries(this.steps).map(async ([key, runnable]) => {
        output[key] = await runnable.invoke(input, patchConfig(options, {
          callbacks: _optionalChain([runManager, 'optionalAccess', _250 => _250.getChild, 'call', _251 => _251(`map:key:${key}`)])
        }));
      }));
    } catch (e) {
      await _optionalChain([runManager, 'optionalAccess', _252 => _252.handleChainError, 'call', _253 => _253(e)]);
      throw e;
    }
    await _optionalChain([runManager, 'optionalAccess', _254 => _254.handleChainEnd, 'call', _255 => _255(output)]);
    return output;
  }
  async *_transform(generator, runManager, options) {
    const steps = { ...this.steps };
    const inputCopies = atee(generator, Object.keys(steps).length);
    const tasks = new Map(Object.entries(steps).map(([key, runnable], i) => {
      const gen = runnable.transform(inputCopies[i], patchConfig(options, {
        callbacks: _optionalChain([runManager, 'optionalAccess', _256 => _256.getChild, 'call', _257 => _257(`map:key:${key}`)])
      }));
      return [key, gen.next().then((result) => ({ key, gen, result }))];
    }));
    while (tasks.size) {
      const { key, result, gen } = await Promise.race(tasks.values());
      tasks.delete(key);
      if (!result.done) {
        yield { [key]: result.value };
        tasks.set(key, gen.next().then((result2) => ({ key, gen, result: result2 })));
      }
    }
  }
  transform(generator, options) {
    return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
  }
  async stream(input, options) {
    async function* generator() {
      yield input;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, generator, "generator");
    const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
    await wrappedGenerator.setup;
    return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
  }
};
var RunnableLambda = class _RunnableLambda extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableLambda");
  }
  static lc_name() {
    return "RunnableLambda";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "func", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.func = fields.func;
  }
  static from(func) {
    return new _RunnableLambda({
      func
    });
  }
  async _invoke(input, config, runManager) {
    let output = await this.func(input, { config });
    if (output && Runnable.isRunnable(output)) {
      if (_optionalChain([config, 'optionalAccess', _258 => _258.recursionLimit]) === 0) {
        throw new Error("Recursion limit reached.");
      }
      output = await output.invoke(input, patchConfig(config, {
        callbacks: _optionalChain([runManager, 'optionalAccess', _259 => _259.getChild, 'call', _260 => _260()]),
        recursionLimit: (_nullishCoalesce(_optionalChain([config, 'optionalAccess', _261 => _261.recursionLimit]), () => ( DEFAULT_RECURSION_LIMIT))) - 1
      }));
    }
    return output;
  }
  async invoke(input, options) {
    return this._callWithConfig(this._invoke, input, options);
  }
  async *_transform(generator, runManager, config) {
    let finalChunk;
    for await (const chunk of generator) {
      if (finalChunk === void 0) {
        finalChunk = chunk;
      } else {
        try {
          finalChunk = concat(finalChunk, chunk);
        } catch (e) {
          finalChunk = chunk;
        }
      }
    }
    const output = await this.func(finalChunk, { config });
    if (output && Runnable.isRunnable(output)) {
      if (_optionalChain([config, 'optionalAccess', _262 => _262.recursionLimit]) === 0) {
        throw new Error("Recursion limit reached.");
      }
      const stream = await output.stream(finalChunk, patchConfig(config, {
        callbacks: _optionalChain([runManager, 'optionalAccess', _263 => _263.getChild, 'call', _264 => _264()]),
        recursionLimit: (_nullishCoalesce(_optionalChain([config, 'optionalAccess', _265 => _265.recursionLimit]), () => ( DEFAULT_RECURSION_LIMIT))) - 1
      }));
      for await (const chunk of stream) {
        yield chunk;
      }
    } else {
      yield output;
    }
  }
  transform(generator, options) {
    return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
  }
  async stream(input, options) {
    async function* generator() {
      yield input;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, generator, "generator");
    const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
    await wrappedGenerator.setup;
    return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
  }
};
var RunnableWithFallbacks = class extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableWithFallbacks");
  }
  static lc_name() {
    return "RunnableWithFallbacks";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "runnable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "fallbacks", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.runnable = fields.runnable;
    this.fallbacks = fields.fallbacks;
  }
  *runnables() {
    yield this.runnable;
    for (const fallback of this.fallbacks) {
      yield fallback;
    }
  }
  async invoke(input, options) {
    const callbackManager_ = await CallbackManager.configure(_optionalChain([options, 'optionalAccess', _266 => _266.callbacks]), void 0, _optionalChain([options, 'optionalAccess', _267 => _267.tags]), void 0, _optionalChain([options, 'optionalAccess', _268 => _268.metadata]));
    const runManager = await _optionalChain([callbackManager_, 'optionalAccess', _269 => _269.handleChainStart, 'call', _270 => _270(this.toJSON(), _coerceToDict2(input, "input"), void 0, void 0, void 0, void 0, _optionalChain([options, 'optionalAccess', _271 => _271.runName]))]);
    let firstError;
    for (const runnable of this.runnables()) {
      try {
        const output = await runnable.invoke(input, patchConfig(options, { callbacks: _optionalChain([runManager, 'optionalAccess', _272 => _272.getChild, 'call', _273 => _273()]) }));
        await _optionalChain([runManager, 'optionalAccess', _274 => _274.handleChainEnd, 'call', _275 => _275(_coerceToDict2(output, "output"))]);
        return output;
      } catch (e) {
        if (firstError === void 0) {
          firstError = e;
        }
      }
    }
    if (firstError === void 0) {
      throw new Error("No error stored at end of fallback.");
    }
    await _optionalChain([runManager, 'optionalAccess', _276 => _276.handleChainError, 'call', _277 => _277(firstError)]);
    throw firstError;
  }
  async batch(inputs, options, batchOptions) {
    if (_optionalChain([batchOptions, 'optionalAccess', _278 => _278.returnExceptions])) {
      throw new Error("Not implemented.");
    }
    const configList = this._getOptionsList(_nullishCoalesce(options, () => ( {})), inputs.length);
    const callbackManagers = await Promise.all(configList.map((config) => CallbackManager.configure(_optionalChain([config, 'optionalAccess', _279 => _279.callbacks]), void 0, _optionalChain([config, 'optionalAccess', _280 => _280.tags]), void 0, _optionalChain([config, 'optionalAccess', _281 => _281.metadata]))));
    const runManagers = await Promise.all(callbackManagers.map((callbackManager, i) => _optionalChain([callbackManager, 'optionalAccess', _282 => _282.handleChainStart, 'call', _283 => _283(this.toJSON(), _coerceToDict2(inputs[i], "input"), void 0, void 0, void 0, void 0, configList[i].runName)])));
    let firstError;
    for (const runnable of this.runnables()) {
      try {
        const outputs = await runnable.batch(inputs, runManagers.map((runManager, j) => patchConfig(configList[j], {
          callbacks: _optionalChain([runManager, 'optionalAccess', _284 => _284.getChild, 'call', _285 => _285()])
        })), batchOptions);
        await Promise.all(runManagers.map((runManager, i) => _optionalChain([runManager, 'optionalAccess', _286 => _286.handleChainEnd, 'call', _287 => _287(_coerceToDict2(outputs[i], "output"))])));
        return outputs;
      } catch (e) {
        if (firstError === void 0) {
          firstError = e;
        }
      }
    }
    if (!firstError) {
      throw new Error("No error stored at end of fallbacks.");
    }
    await Promise.all(runManagers.map((runManager) => _optionalChain([runManager, 'optionalAccess', _288 => _288.handleChainError, 'call', _289 => _289(firstError)])));
    throw firstError;
  }
};
function _coerceToRunnable(coerceable) {
  if (typeof coerceable === "function") {
    return new RunnableLambda({ func: coerceable });
  } else if (Runnable.isRunnable(coerceable)) {
    return coerceable;
  } else if (!Array.isArray(coerceable) && typeof coerceable === "object") {
    const runnables = {};
    for (const [key, value] of Object.entries(coerceable)) {
      runnables[key] = _coerceToRunnable(value);
    }
    return new RunnableMap({
      steps: runnables
    });
  } else {
    throw new Error(`Expected a Runnable, function or object.
Instead got an unsupported type.`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, _coerceToRunnable, "_coerceToRunnable");
var RunnableAssign = class extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnableAssign");
  }
  static lc_name() {
    return "RunnableAssign";
  }
  constructor(fields) {
    if (fields instanceof RunnableMap) {
      fields = { mapper: fields };
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "mapper", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.mapper = fields.mapper;
  }
  async invoke(input, options) {
    const mapperResult = await this.mapper.invoke(input, options);
    return {
      ...input,
      ...mapperResult
    };
  }
  async *_transform(generator, runManager, options) {
    const mapperKeys = this.mapper.getStepsKeys();
    const [forPassthrough, forMapper] = atee(generator);
    const mapperOutput = this.mapper.transform(forMapper, patchConfig(options, { callbacks: _optionalChain([runManager, 'optionalAccess', _290 => _290.getChild, 'call', _291 => _291()]) }));
    const firstMapperChunkPromise = mapperOutput.next();
    for await (const chunk of forPassthrough) {
      if (typeof chunk !== "object" || Array.isArray(chunk)) {
        throw new Error(`RunnableAssign can only be used with objects as input, got ${typeof chunk}`);
      }
      const filtered = Object.fromEntries(Object.entries(chunk).filter(([key]) => !mapperKeys.includes(key)));
      if (Object.keys(filtered).length > 0) {
        yield filtered;
      }
    }
    yield (await firstMapperChunkPromise).value;
    for await (const chunk of mapperOutput) {
      yield chunk;
    }
  }
  transform(generator, options) {
    return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
  }
  async stream(input, options) {
    async function* generator() {
      yield input;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, generator, "generator");
    const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
    await wrappedGenerator.setup;
    return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
  }
};
var RunnablePick = class extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "RunnablePick");
  }
  static lc_name() {
    return "RunnablePick";
  }
  constructor(fields) {
    if (typeof fields === "string" || Array.isArray(fields)) {
      fields = { keys: fields };
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "runnables"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "keys", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.keys = fields.keys;
  }
  async _pick(input) {
    if (typeof this.keys === "string") {
      return input[this.keys];
    } else {
      const picked = this.keys.map((key) => [key, input[key]]).filter((v) => v[1] !== void 0);
      return picked.length === 0 ? void 0 : Object.fromEntries(picked);
    }
  }
  async invoke(input, options) {
    return this._callWithConfig(this._pick.bind(this), input, options);
  }
  async *_transform(generator) {
    for await (const chunk of generator) {
      const picked = await this._pick(chunk);
      if (picked !== void 0) {
        yield picked;
      }
    }
  }
  transform(generator, options) {
    return this._transformStreamWithConfig(generator, this._transform.bind(this), options);
  }
  async stream(input, options) {
    async function* generator() {
      yield input;
    }
    _chunkEC6JY3PVcjs.__name.call(void 0, generator, "generator");
    const wrappedGenerator = new AsyncGeneratorWithSetup(this.transform(generator(), options));
    await wrappedGenerator.setup;
    return IterableReadableStream.fromAsyncGenerator(wrappedGenerator);
  }
};

// node_modules/@langchain/core/dist/prompts/base.js
var BasePromptTemplate = class extends Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BasePromptTemplate");
  }
  get lc_attributes() {
    return {
      partialVariables: void 0
      // python doesn't support this yet
    };
  }
  constructor(input) {
    super(input);
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompts", this._getPromptType()]
    });
    Object.defineProperty(this, "inputVariables", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "outputParser", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "partialVariables", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    const { inputVariables } = input;
    if (inputVariables.includes("stop")) {
      throw new Error("Cannot have an input variable named 'stop', as it is used internally, please rename.");
    }
    Object.assign(this, input);
  }
  /**
   * Merges partial variables and user variables.
   * @param userVariables The user variables to merge with the partial variables.
   * @returns A Promise that resolves to an object containing the merged variables.
   */
  async mergePartialAndUserVariables(userVariables) {
    const partialVariables = _nullishCoalesce(this.partialVariables, () => ( {}));
    const partialValues = {};
    for (const [key, value] of Object.entries(partialVariables)) {
      if (typeof value === "string") {
        partialValues[key] = value;
      } else {
        partialValues[key] = await value();
      }
    }
    const allKwargs = {
      ...partialValues,
      ...userVariables
    };
    return allKwargs;
  }
  /**
   * Invokes the prompt template with the given input and options.
   * @param input The input to invoke the prompt template with.
   * @param options Optional configuration for the callback.
   * @returns A Promise that resolves to the output of the prompt template.
   */
  async invoke(input, options) {
    return this._callWithConfig((input2) => this.formatPromptValue(input2), input, { ...options, runType: "prompt" });
  }
  /**
   * Return a json-like object representing this prompt template.
   * @deprecated
   */
  serialize() {
    throw new Error("Use .toJSON() instead");
  }
  /**
   * @deprecated
   * Load a prompt template from a json-like object describing it.
   *
   * @remarks
   * Deserializing needs to be async because templates (e.g. {@link FewShotPromptTemplate}) can
   * reference remote resources that we read asynchronously with a web
   * request.
   */
  static async deserialize(data) {
    switch (data._type) {
      case "prompt": {
        const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => _interopRequireWildcard(require("./prompt-LG5K3JO3.cjs")));
        return PromptTemplate2.deserialize(data);
      }
      case void 0: {
        const { PromptTemplate: PromptTemplate2 } = await Promise.resolve().then(() => _interopRequireWildcard(require("./prompt-LG5K3JO3.cjs")));
        return PromptTemplate2.deserialize({ ...data, _type: "prompt" });
      }
      case "few_shot": {
        const { FewShotPromptTemplate } = await Promise.resolve().then(() => _interopRequireWildcard(require("./few_shot-JXI77EMJ.cjs")));
        return FewShotPromptTemplate.deserialize(data);
      }
      default:
        throw new Error(`Invalid prompt type in config: ${data._type}`);
    }
  }
};

// node_modules/@langchain/core/dist/prompts/string.js
var BaseStringPromptTemplate = class extends BasePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseStringPromptTemplate");
  }
  /**
   * Formats the prompt given the input values and returns a formatted
   * prompt value.
   * @param values The input values to format the prompt.
   * @returns A Promise that resolves to a formatted prompt value.
   */
  async formatPromptValue(values) {
    const formattedPrompt = await this.format(values);
    return new StringPromptValue(formattedPrompt);
  }
};

// node_modules/@langchain/core/dist/prompts/template.js
var parseFString = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (template) => {
  const chars = template.split("");
  const nodes = [];
  const nextBracket = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (bracket, start) => {
    for (let i2 = start; i2 < chars.length; i2 += 1) {
      if (bracket.includes(chars[i2])) {
        return i2;
      }
    }
    return -1;
  }, "nextBracket");
  let i = 0;
  while (i < chars.length) {
    if (chars[i] === "{" && i + 1 < chars.length && chars[i + 1] === "{") {
      nodes.push({ type: "literal", text: "{" });
      i += 2;
    } else if (chars[i] === "}" && i + 1 < chars.length && chars[i + 1] === "}") {
      nodes.push({ type: "literal", text: "}" });
      i += 2;
    } else if (chars[i] === "{") {
      const j = nextBracket("}", i);
      if (j < 0) {
        throw new Error("Unclosed '{' in template.");
      }
      nodes.push({
        type: "variable",
        name: chars.slice(i + 1, j).join("")
      });
      i = j + 1;
    } else if (chars[i] === "}") {
      throw new Error("Single '}' in template.");
    } else {
      const next = nextBracket("{}", i);
      const text = (next < 0 ? chars.slice(i) : chars.slice(i, next)).join("");
      nodes.push({ type: "literal", text });
      i = next < 0 ? chars.length : next;
    }
  }
  return nodes;
}, "parseFString");
var interpolateFString = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (template, values) => parseFString(template).reduce((res, node) => {
  if (node.type === "variable") {
    if (node.name in values) {
      return res + values[node.name];
    }
    throw new Error(`Missing value for input ${node.name}`);
  }
  return res + node.text;
}, ""), "interpolateFString");
var DEFAULT_FORMATTER_MAPPING = {
  "f-string": interpolateFString
};
var DEFAULT_PARSER_MAPPING = {
  "f-string": parseFString
};
var renderTemplate = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (template, templateFormat, inputValues) => DEFAULT_FORMATTER_MAPPING[templateFormat](template, inputValues), "renderTemplate");
var parseTemplate = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (template, templateFormat) => DEFAULT_PARSER_MAPPING[templateFormat](template), "parseTemplate");
var checkValidTemplate = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (template, templateFormat, inputVariables) => {
  if (!(templateFormat in DEFAULT_FORMATTER_MAPPING)) {
    const validFormats = Object.keys(DEFAULT_FORMATTER_MAPPING);
    throw new Error(`Invalid template format. Got \`${templateFormat}\`;
                         should be one of ${validFormats}`);
  }
  try {
    const dummyInputs = inputVariables.reduce((acc, v) => {
      acc[v] = "foo";
      return acc;
    }, {});
    renderTemplate(template, templateFormat, dummyInputs);
  } catch (e) {
    throw new Error(`Invalid prompt schema: ${e.message}`);
  }
}, "checkValidTemplate");

// node_modules/@langchain/core/dist/prompts/prompt.js
var PromptTemplate = class _PromptTemplate extends BaseStringPromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "PromptTemplate");
  }
  static lc_name() {
    return "PromptTemplate";
  }
  constructor(input) {
    super(input);
    Object.defineProperty(this, "template", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "templateFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "f-string"
    });
    Object.defineProperty(this, "validateTemplate", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.assign(this, input);
    if (this.validateTemplate) {
      let totalInputVariables = this.inputVariables;
      if (this.partialVariables) {
        totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
      }
      checkValidTemplate(this.template, this.templateFormat, totalInputVariables);
    }
  }
  _getPromptType() {
    return "prompt";
  }
  /**
   * Formats the prompt template with the provided values.
   * @param values The values to be used to format the prompt template.
   * @returns A promise that resolves to a string which is the formatted prompt.
   */
  async format(values) {
    const allValues = await this.mergePartialAndUserVariables(values);
    return renderTemplate(this.template, this.templateFormat, allValues);
  }
  /**
   * Take examples in list format with prefix and suffix to create a prompt.
   *
   * Intended to be used a a way to dynamically create a prompt from examples.
   *
   * @param examples - List of examples to use in the prompt.
   * @param suffix - String to go after the list of examples. Should generally set up the user's input.
   * @param inputVariables - A list of variable names the final prompt template will expect
   * @param exampleSeparator - The separator to use in between examples
   * @param prefix - String that should go before any examples. Generally includes examples.
   *
   * @returns The final prompt template generated.
   */
  static fromExamples(examples, suffix, inputVariables, exampleSeparator = "\n\n", prefix = "") {
    const template = [prefix, ...examples, suffix].join(exampleSeparator);
    return new _PromptTemplate({
      inputVariables,
      template
    });
  }
  /**
   * Load prompt template from a template f-string
   */
  static fromTemplate(template, { templateFormat = "f-string", ...rest } = {}) {
    const names = /* @__PURE__ */ new Set();
    parseTemplate(template, templateFormat).forEach((node) => {
      if (node.type === "variable") {
        names.add(node.name);
      }
    });
    return new _PromptTemplate({
      // Rely on extracted types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inputVariables: [...names],
      templateFormat,
      template,
      ...rest
    });
  }
  /**
   * Partially applies values to the prompt template.
   * @param values The values to be partially applied to the prompt template.
   * @returns A new instance of PromptTemplate with the partially applied values.
   */
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
    const newPartialVariables = {
      ..._nullishCoalesce(this.partialVariables, () => ( {})),
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _PromptTemplate(promptDict);
  }
  serialize() {
    if (this.outputParser !== void 0) {
      throw new Error("Cannot serialize a prompt template with an output parser");
    }
    return {
      _type: this._getPromptType(),
      input_variables: this.inputVariables,
      template: this.template,
      template_format: this.templateFormat
    };
  }
  static async deserialize(data) {
    if (!data.template) {
      throw new Error("Prompt template must have a template");
    }
    const res = new _PromptTemplate({
      inputVariables: data.input_variables,
      template: data.template,
      templateFormat: data.template_format
    });
    return res;
  }
};


















exports.getEnvironmentVariable = getEnvironmentVariable2; exports.BaseCallbackHandler = BaseCallbackHandler; exports.BaseMessage = BaseMessage; exports.HumanMessage = HumanMessage; exports.AIMessage = AIMessage; exports.SystemMessage = SystemMessage; exports.ChatMessage = ChatMessage; exports.isBaseMessage = isBaseMessage; exports.coerceMessageLikeToMessage = coerceMessageLikeToMessage; exports.Runnable = Runnable; exports.ChatPromptValue = ChatPromptValue; exports.BaseStringPromptTemplate = BaseStringPromptTemplate; exports.renderTemplate = renderTemplate; exports.checkValidTemplate = checkValidTemplate; exports.PromptTemplate = PromptTemplate; exports.BasePromptTemplate = BasePromptTemplate;
/*! Bundled license information:

@langchain/core/dist/utils/fast-json-patch/src/helpers.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017-2022 Joachim Wester
   * MIT licensed
   *)

@langchain/core/dist/utils/fast-json-patch/src/duplex.js:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2013-2021 Joachim Wester
   * MIT license
   *)
*/