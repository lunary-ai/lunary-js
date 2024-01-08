"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } var _class;

var _chunkOTRT6GGCcjs = require('./chunk-OTRT6GGC.cjs');




var _chunkAFCLBUQJcjs = require('./chunk-AFCLBUQJ.cjs');

// node_modules/decamelize/index.js
var require_decamelize = _chunkAFCLBUQJcjs.__commonJS.call(void 0, {
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
var require_camelcase = _chunkAFCLBUQJcjs.__commonJS.call(void 0, {
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
    var preserveCamelCase = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (string, toLowerCase, toUpperCase) => {
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
    var preserveConsecutiveUppercase = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (input, toLowerCase) => {
      LEADING_CAPITAL.lastIndex = 0;
      return input.replace(LEADING_CAPITAL, (m1) => toLowerCase(m1));
    }, "preserveConsecutiveUppercase");
    var postProcess = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (input, toUpperCase) => {
      SEPARATORS_AND_IDENTIFIER.lastIndex = 0;
      NUMBERS_AND_IDENTIFIER.lastIndex = 0;
      return input.replace(SEPARATORS_AND_IDENTIFIER, (_, identifier) => toUpperCase(identifier)).replace(NUMBERS_AND_IDENTIFIER, (m) => toUpperCase(m));
    }, "postProcess");
    var camelCase2 = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (input, options) => {
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

// node_modules/@langchain/core/dist/utils/env.js
function getEnvironmentVariable(name) {
  try {
    return typeof process !== "undefined" ? (
      // eslint-disable-next-line no-process-env
      _optionalChain([process, 'access', _2 => _2.env, 'optionalAccess', _3 => _3[name]])
    ) : void 0;
  } catch (e) {
    return void 0;
  }
}
_chunkAFCLBUQJcjs.__name.call(void 0, getEnvironmentVariable, "getEnvironmentVariable");

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
_chunkAFCLBUQJcjs.__name.call(void 0, rng, "rng");

// node_modules/uuid/dist/esm-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
}
_chunkAFCLBUQJcjs.__name.call(void 0, unsafeStringify, "unsafeStringify");

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
_chunkAFCLBUQJcjs.__name.call(void 0, v4, "v4");
var v4_default = v4;

// node_modules/@langchain/core/dist/load/map_keys.js
var import_decamelize = _chunkAFCLBUQJcjs.__toESM.call(void 0, require_decamelize(), 1);
var import_camelcase = _chunkAFCLBUQJcjs.__toESM.call(void 0, require_camelcase(), 1);
function keyToJson(key, map) {
  return _optionalChain([map, 'optionalAccess', _4 => _4[key]]) || (0, import_decamelize.default)(key);
}
_chunkAFCLBUQJcjs.__name.call(void 0, keyToJson, "keyToJson");
function mapKeys(fields, mapper, map) {
  const mapped = {};
  for (const key in fields) {
    if (Object.hasOwn(fields, key)) {
      mapped[mapper(key, map)] = fields[key];
    }
  }
  return mapped;
}
_chunkAFCLBUQJcjs.__name.call(void 0, mapKeys, "mapKeys");

// node_modules/@langchain/core/dist/load/serializable.js
function shallowCopy(obj) {
  return Array.isArray(obj) ? [...obj] : { ...obj };
}
_chunkAFCLBUQJcjs.__name.call(void 0, shallowCopy, "shallowCopy");
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
_chunkAFCLBUQJcjs.__name.call(void 0, replaceSecrets, "replaceSecrets");
function get_lc_unique_name(serializableClass) {
  const parentClass = Object.getPrototypeOf(serializableClass);
  const lcNameIsSubclassed = typeof serializableClass.lc_name === "function" && (typeof parentClass.lc_name !== "function" || serializableClass.lc_name() !== parentClass.lc_name());
  if (lcNameIsSubclassed) {
    return serializableClass.lc_name();
  } else {
    return serializableClass.name;
  }
}
_chunkAFCLBUQJcjs.__name.call(void 0, get_lc_unique_name, "get_lc_unique_name");
var Serializable = class _Serializable {
  static {
    _chunkAFCLBUQJcjs.__name.call(void 0, this, "Serializable");
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

// node_modules/@langchain/core/dist/callbacks/base.js
var BaseCallbackHandlerMethodsClass = class {
  static {
    _chunkAFCLBUQJcjs.__name.call(void 0, this, "BaseCallbackHandlerMethodsClass");
  }
};
var BaseCallbackHandler = class _BaseCallbackHandler extends BaseCallbackHandlerMethodsClass {
  static {
    _chunkAFCLBUQJcjs.__name.call(void 0, this, "BaseCallbackHandler");
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
        _optionalChain([process, 'access', _5 => _5.env, 'optionalAccess', _6 => _6.LANGCHAIN_CALLBACKS_BACKGROUND]) !== "true"
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
        _chunkAFCLBUQJcjs.__name.call(void 0, this, "Handler");
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

// src/langchain.ts
var parseRole = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (ids) => {
  const roleHint = ids[ids.length - 1];
  if (roleHint.includes("Human"))
    return "user";
  if (roleHint.includes("System"))
    return "system";
  if (roleHint.includes("AI"))
    return "assistant";
  if (roleHint.includes("Function"))
    return "function";
  if (roleHint.includes("Tool"))
    return "tool";
  return "assistant";
}, "parseRole");
var PARAMS_TO_CAPTURE = [
  "stop",
  "stop_sequences",
  "function_call",
  "functions",
  "tools",
  "tool_choice",
  "response_format"
];
var convertToLunaryMessages = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (input) => {
  const parseMessage = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (raw) => {
    if (typeof raw === "string")
      return raw;
    if ("message" in raw)
      return parseMessage(raw.message);
    const message = JSON.parse(JSON.stringify(raw));
    try {
      const role = parseRole(message.id);
      const obj = message.kwargs;
      const content = _nullishCoalesce(message.text, () => ( obj.content));
      return {
        role,
        content,
        ..._nullishCoalesce(obj.additional_kwargs, () => ( {}))
      };
    } catch (e) {
      return _nullishCoalesce(message.text, () => ( message));
    }
  }, "parseMessage");
  if (Array.isArray(input)) {
    return input.length === 1 ? convertToLunaryMessages(input[0]) : input.map(convertToLunaryMessages);
  }
  return parseMessage(input);
}, "convertToLunaryMessages");
var parseInput = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (rawInput) => {
  if (!rawInput)
    return null;
  const { input, inputs, question } = rawInput;
  if (input)
    return input;
  if (inputs)
    return inputs;
  if (question)
    return question;
  return rawInput;
}, "parseInput");
var parseOutput = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (rawOutput) => {
  if (!rawOutput)
    return null;
  const { text, output, answer, result } = rawOutput;
  if (text)
    return text;
  if (answer)
    return answer;
  if (output)
    return output;
  if (result)
    return result;
  return rawOutput;
}, "parseOutput");
var parseExtraAndName = /* @__PURE__ */ _chunkAFCLBUQJcjs.__name.call(void 0, (llm, extraParams, metadata) => {
  const params = {
    ..._nullishCoalesce(_optionalChain([extraParams, 'optionalAccess', _7 => _7.invocation_params]), () => ( {})),
    // @ts-ignore this is a valid property
    ..._nullishCoalesce(_optionalChain([llm, 'optionalAccess', _8 => _8.kwargs]), () => ( {})),
    ...metadata || {}
  };
  const { model, model_name, modelName, model_id, userId, userProps, ...rest } = params;
  const name = model || modelName || model_name || model_id || llm.id.at(-1);
  const extra = Object.fromEntries(
    Object.entries(rest).filter(
      ([key]) => PARAMS_TO_CAPTURE.includes(key) || ["string", "number", "boolean"].includes(typeof rest[key])
    )
  );
  return { name, extra, userId, userProps };
}, "parseExtraAndName");
var LunaryHandler = (_class = class extends BaseCallbackHandler {
  static {
    _chunkAFCLBUQJcjs.__name.call(void 0, this, "LunaryHandler");
  }
  __init() {this.name = "lunary_handler"}
  
  constructor(fields = {}) {
    super(fields);_class.prototype.__init.call(this);;
    this.lunary = _chunkOTRT6GGCcjs.src_default;
    if (fields) {
      const { appId, apiUrl, verbose } = fields;
      this.lunary.init({
        verbose,
        appId: _nullishCoalesce(_nullishCoalesce(appId, () => ( getEnvironmentVariable("LUNARY_APP_ID"))), () => ( getEnvironmentVariable("LLMONITOR_APP_ID"))),
        apiUrl: _nullishCoalesce(_nullishCoalesce(apiUrl, () => ( getEnvironmentVariable("LUNARY_API_URL"))), () => ( getEnvironmentVariable("LLMONITOR_API_URL")))
      });
    }
  }
  async handleLLMStart(llm, prompts, runId, parentRunId, extraParams, tags, metadata) {
    const { name, extra, userId, userProps } = parseExtraAndName(
      llm,
      extraParams,
      metadata
    );
    await this.lunary.trackEvent("llm", "start", {
      runId,
      parentRunId,
      name,
      input: convertToLunaryMessages(prompts),
      extra,
      userId,
      userProps,
      tags,
      runtime: "langchain-js"
    });
  }
  async handleChatModelStart(llm, messages, runId, parentRunId, extraParams, tags, metadata) {
    const { name, extra, userId, userProps } = parseExtraAndName(
      llm,
      extraParams,
      metadata
    );
    await this.lunary.trackEvent("llm", "start", {
      runId,
      parentRunId,
      name,
      input: convertToLunaryMessages(messages),
      extra,
      userId,
      userProps,
      tags,
      runtime: "langchain-js"
    });
  }
  async handleLLMEnd(output, runId) {
    const { generations, llmOutput } = output;
    await this.lunary.trackEvent("llm", "end", {
      runId,
      output: convertToLunaryMessages(generations),
      tokensUsage: {
        completion: _optionalChain([llmOutput, 'optionalAccess', _9 => _9.tokenUsage, 'optionalAccess', _10 => _10.completionTokens]),
        prompt: _optionalChain([llmOutput, 'optionalAccess', _11 => _11.tokenUsage, 'optionalAccess', _12 => _12.promptTokens])
      }
    });
  }
  async handleLLMError(error, runId) {
    await this.lunary.trackEvent("llm", "error", {
      runId,
      error
    });
  }
  async handleChainStart(chain, inputs, runId, parentRunId, tags, metadata) {
    const { agentName, userId, userProps, ...rest } = metadata || {};
    const name = agentName || chain.id.at(-1);
    const runType = agentName || ["AgentExecutor", "PlanAndExecute"].includes(name) ? "agent" : "chain";
    await this.lunary.trackEvent(runType, "start", {
      runId,
      parentRunId,
      name,
      userId,
      userProps,
      input: parseInput(inputs),
      extra: rest,
      tags,
      runtime: "langchain-js"
    });
  }
  async handleChainEnd(outputs, runId) {
    await this.lunary.trackEvent("chain", "end", {
      runId,
      output: parseOutput(outputs)
    });
  }
  async handleChainError(error, runId) {
    await this.lunary.trackEvent("chain", "error", {
      runId,
      error
    });
  }
  async handleToolStart(tool, input, runId, parentRunId, tags, metadata) {
    const { toolName, userId, userProps, ...rest } = metadata || {};
    const name = toolName || tool.id.at(-1);
    await this.lunary.trackEvent("tool", "start", {
      runId,
      parentRunId,
      name,
      userId,
      userProps,
      input,
      extra: rest,
      tags,
      runtime: "langchain-js"
    });
  }
  async handleToolEnd(output, runId) {
    await this.lunary.trackEvent("tool", "end", {
      runId,
      output
    });
  }
  async handleToolError(error, runId) {
    await this.lunary.trackEvent("tool", "error", {
      runId,
      error
    });
  }
}, _class);


exports.LunaryHandler = LunaryHandler;
