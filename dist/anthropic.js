import {
  src_default
} from "./chunk-DN4SXRQC.js";
import {
  cleanError,
  cleanExtra,
  generateUUID
} from "./chunk-AX3726TK.js";
import {
  __name
} from "./chunk-AGSXOS4O.js";

// src/anthropic.ts
var PARAMS_TO_CAPTURE = [
  "betas",
  "cache_control",
  "container",
  "context_management",
  "inference_geo",
  "max_tokens",
  "mcp_servers",
  "metadata",
  "output_config",
  "output_format",
  "service_tier",
  "speed",
  "stop_sequences",
  "stream",
  "system",
  "temperature",
  "thinking",
  "tool_choice",
  "tools",
  "top_k",
  "top_p"
];
var USAGE_METADATA_KEYS = {
  cache_creation_input_tokens: "cacheCreationInputTokens",
  cache_read_input_tokens: "cacheReadInputTokens",
  inference_geo: "inferenceGeo",
  service_tier: "serviceTier"
};
var getProperty = /* @__PURE__ */ __name((obj, key, defaultValue = void 0) => {
  if (obj == null)
    return defaultValue;
  if (typeof obj === "object" && key in obj)
    return obj[key];
  return defaultValue;
}, "getProperty");
var serializeValue = /* @__PURE__ */ __name((value) => {
  if (value == null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(serializeValue);
  }
  if (typeof value === "object") {
    if (typeof value.toJSON === "function") {
      return serializeValue(value.toJSON());
    }
    return Object.fromEntries(
      Object.entries(value).filter(([, item]) => item != null).map(([key, item]) => [key, serializeValue(item)])
    );
  }
  return value;
}, "serializeValue");
var normalizeContent = /* @__PURE__ */ __name((content) => {
  if (typeof content === "string" || content == null)
    return content;
  return serializeValue(content);
}, "normalizeContent");
var parseUsage = /* @__PURE__ */ __name((usage) => {
  if (!usage)
    return void 0;
  const prompt = getProperty(usage, "input_tokens");
  const completion = getProperty(usage, "output_tokens");
  const cacheCreationInputTokens = getProperty(
    usage,
    "cache_creation_input_tokens"
  );
  const cacheReadInputTokens = getProperty(usage, "cache_read_input_tokens");
  const tokenUsage = cleanExtra({
    prompt,
    completion,
    promptCached: cacheCreationInputTokens != null || cacheReadInputTokens != null ? (cacheCreationInputTokens || 0) + (cacheReadInputTokens || 0) : void 0
  });
  return Object.keys(tokenUsage).length ? tokenUsage : void 0;
}, "parseUsage");
var buildMetadata = /* @__PURE__ */ __name((message) => {
  const metadata = {};
  for (const [key, targetKey] of Object.entries({
    id: "messageId",
    model: "model",
    stop_reason: "stopReason",
    stop_sequence: "stopSequence"
  })) {
    const value = getProperty(message, key);
    if (value != null)
      metadata[targetKey] = value;
  }
  const usage = getProperty(message, "usage");
  if (usage) {
    for (const [key, targetKey] of Object.entries(USAGE_METADATA_KEYS)) {
      const value = getProperty(usage, key);
      if (value != null)
        metadata[targetKey] = value;
    }
  }
  return Object.keys(metadata).length ? metadata : void 0;
}, "buildMetadata");
var parseAnthropicMessage = /* @__PURE__ */ __name((message) => {
  if (!message)
    return void 0;
  return cleanExtra({
    role: getProperty(message, "role"),
    content: normalizeContent(getProperty(message, "content")),
    parsed_output: serializeValue(getProperty(message, "parsed_output")),
    refusal: getProperty(message, "refusal"),
    name: getProperty(message, "name"),
    tool_call_id: getProperty(message, "tool_call_id"),
    id: getProperty(message, "id"),
    model: getProperty(message, "model"),
    stop_reason: getProperty(message, "stop_reason"),
    stop_sequence: getProperty(message, "stop_sequence")
  });
}, "parseAnthropicMessage");
var parseAnthropicInput = /* @__PURE__ */ __name((request) => {
  const messages = (request.messages || []).map(parseAnthropicMessage);
  const system = request.system;
  if (system != null) {
    messages.unshift({
      role: "system",
      content: normalizeContent(system)
    });
  }
  return messages;
}, "parseAnthropicInput");
var buildContentBlock = /* @__PURE__ */ __name((block) => {
  return serializeValue(block);
}, "buildContentBlock");
var updateContentBlock = /* @__PURE__ */ __name((block, delta) => {
  const serializedDelta = serializeValue(delta) || {};
  if (!block)
    return;
  if (serializedDelta.type === "text_delta") {
    block.text = (block.text || "") + (serializedDelta.text || "");
    return;
  }
  if (serializedDelta.type === "thinking_delta") {
    block.thinking = (block.thinking || "") + (serializedDelta.thinking || "");
    return;
  }
  if (serializedDelta.type === "input_json_delta") {
    block.__partialJson = (block.__partialJson || "") + (serializedDelta.partial_json || "");
    try {
      block.input = JSON.parse(block.__partialJson);
    } catch (_) {
    }
    return;
  }
  if (serializedDelta.type === "signature_delta") {
    block.signature = serializedDelta.signature;
    return;
  }
  Object.assign(block, serializedDelta);
}, "updateContentBlock");
var finalizeContentBlocks = /* @__PURE__ */ __name((contentBlocks) => {
  return contentBlocks.filter((block) => block != null).map((block) => {
    if (block && typeof block === "object" && "__partialJson" in block) {
      const { __partialJson, ...rest } = block;
      return rest;
    }
    return block;
  });
}, "finalizeContentBlocks");
var updateUsageState = /* @__PURE__ */ __name((tokenUsage, state, usage) => {
  if (!usage)
    return;
  const parsedUsage = parseUsage(usage);
  if (parsedUsage?.prompt != null)
    tokenUsage.prompt = parsedUsage.prompt;
  if (parsedUsage?.completion != null)
    tokenUsage.completion = parsedUsage.completion;
  if (parsedUsage?.promptCached != null)
    tokenUsage.promptCached = parsedUsage.promptCached;
  for (const key of Object.keys(USAGE_METADATA_KEYS)) {
    const value = getProperty(usage, key);
    if (value != null)
      state[key] = value;
  }
}, "updateUsageState");
var buildStreamResult = /* @__PURE__ */ __name((contentBlocks, tokenUsage, state) => {
  const message = cleanExtra({
    role: state.role || "assistant",
    content: finalizeContentBlocks(contentBlocks),
    id: state.message_id,
    model: state.model || state.name,
    stop_reason: state.stop_reason,
    stop_sequence: state.stop_sequence,
    usage: cleanExtra({
      input_tokens: tokenUsage.prompt,
      output_tokens: tokenUsage.completion,
      cache_creation_input_tokens: state.cache_creation_input_tokens,
      cache_read_input_tokens: state.cache_read_input_tokens,
      inference_geo: state.inference_geo,
      service_tier: state.service_tier,
      server_tool_use: state.server_tool_use
    })
  });
  return {
    ...message,
    tokensUsage: Object.keys(cleanExtra(tokenUsage)).length ? cleanExtra(tokenUsage) : void 0,
    metadata: buildMetadata(message)
  };
}, "buildStreamResult");
var consumeStreamEvent = /* @__PURE__ */ __name((event, contentBlocks, tokenUsage, state) => {
  const eventType = getProperty(event, "type");
  if (eventType === "message_start") {
    const message = getProperty(event, "message");
    state.role = getProperty(message, "role") || state.role;
    state.message_id = getProperty(message, "id") || state.message_id;
    state.model = getProperty(message, "model") || state.model;
    updateUsageState(tokenUsage, state, getProperty(message, "usage"));
    return;
  }
  if (eventType === "content_block_start") {
    const index = getProperty(event, "index", 0);
    contentBlocks[index] = buildContentBlock(
      getProperty(event, "content_block")
    );
    return;
  }
  if (eventType === "content_block_delta") {
    const index = getProperty(event, "index", 0);
    updateContentBlock(contentBlocks[index], getProperty(event, "delta"));
    return;
  }
  if (eventType === "message_delta") {
    const delta = getProperty(event, "delta");
    const stopReason = getProperty(delta, "stop_reason");
    const stopSequence = getProperty(delta, "stop_sequence");
    if (stopReason != null)
      state.stop_reason = stopReason;
    if (stopSequence != null)
      state.stop_sequence = stopSequence;
    updateUsageState(tokenUsage, state, getProperty(event, "usage"));
    state.server_tool_use = getProperty(getProperty(event, "usage"), "server_tool_use") || state.server_tool_use;
  }
}, "consumeStreamEvent");
var buildTrackedParams = /* @__PURE__ */ __name((request) => {
  const rawExtra = {};
  for (const param of PARAMS_TO_CAPTURE) {
    if (request?.[param] != null) {
      rawExtra[param] = serializeValue(request[param]);
    }
  }
  return cleanExtra(rawExtra);
}, "buildTrackedParams");
var parseTrackedResult = /* @__PURE__ */ __name((result) => ({
  output: parseAnthropicMessage(
    "output" in result && result.output ? result.output : result
  ),
  metadata: "metadata" in result && result.metadata ? result.metadata : buildMetadata(result),
  tokensUsage: "tokensUsage" in result && result.tokensUsage ? result.tokensUsage : parseUsage(result?.usage)
}), "parseTrackedResult");
var buildTrackedRequest = /* @__PURE__ */ __name((request, defaults = {}) => {
  const providerRequest = { ...request };
  const tags = providerRequest.tags;
  const userId = providerRequest.userId;
  const userProps = providerRequest.userProps;
  const templateId = providerRequest.templateId;
  delete providerRequest.tags;
  delete providerRequest.userId;
  delete providerRequest.userProps;
  delete providerRequest.templateId;
  delete providerRequest.prompt;
  return {
    providerRequest,
    trackedRequest: {
      input: parseAnthropicInput(providerRequest),
      metadata: providerRequest.metadata,
      name: providerRequest.model || defaults.name,
      params: buildTrackedParams(providerRequest),
      tags,
      templateId,
      userId,
      userProps
    }
  };
}, "buildTrackedRequest");
var buildPromiseLike = /* @__PURE__ */ __name((promise, extras = {}) => Object.assign(
  {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
    [Symbol.toStringTag]: "Promise"
  },
  cleanExtra(extras)
), "buildPromiseLike");
var wrapTrackedStream = /* @__PURE__ */ __name((stream, onComplete, onError, fallbackName) => {
  const contentBlocks = [];
  const tokenUsage = {};
  const state = {
    role: "assistant",
    name: fallbackName
  };
  let settled = false;
  const finishSuccess = /* @__PURE__ */ __name(async () => {
    if (settled)
      return;
    settled = true;
    await onComplete(buildStreamResult(contentBlocks, tokenUsage, state));
  }, "finishSuccess");
  const finishError = /* @__PURE__ */ __name(async (error) => {
    if (settled)
      return;
    settled = true;
    await onError(error);
  }, "finishError");
  const wrapIterator = /* @__PURE__ */ __name((iterator) => ({
    async next() {
      try {
        const result = await iterator.next();
        if (result.done) {
          await finishSuccess();
          return result;
        }
        consumeStreamEvent(result.value, contentBlocks, tokenUsage, state);
        return result;
      } catch (error) {
        await finishError(error);
        throw error;
      }
    },
    async return(value) {
      try {
        const result = iterator.return ? await iterator.return(value) : { done: true, value };
        await finishSuccess();
        return result;
      } catch (error) {
        await finishError(error);
        throw error;
      }
    },
    async throw(error) {
      if (!iterator.throw) {
        await finishError(error);
        throw error;
      }
      try {
        const result = await iterator.throw(error);
        if (result?.done) {
          await finishSuccess();
        }
        return result;
      } catch (thrown) {
        await finishError(thrown);
        throw thrown;
      }
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  }), "wrapIterator");
  const wrappedController = stream?.controller ? new Proxy(stream.controller, {
    get(target, prop, receiver) {
      if (prop === "abort") {
        return (...args) => {
          const result = target.abort(...args);
          Promise.resolve(finishSuccess()).catch(
            (error) => console.error(error)
          );
          return result;
        };
      }
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    }
  }) : void 0;
  return new Proxy(stream, {
    get(target, prop, receiver) {
      if (prop === Symbol.asyncIterator) {
        return () => wrapIterator(target[Symbol.asyncIterator]());
      }
      if (prop === "controller" && wrappedController) {
        return wrappedController;
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    }
  });
}, "wrapTrackedStream");
var createTrackedCreate = /* @__PURE__ */ __name((api, createMethod, defaults = {}) => {
  return (request, options) => {
    const runId = generateUUID();
    const { providerRequest, trackedRequest } = buildTrackedRequest(
      request,
      defaults
    );
    src_default.trackEvent("llm", "start", {
      runId,
      input: trackedRequest.input,
      metadata: trackedRequest.metadata,
      name: trackedRequest.name,
      params: trackedRequest.params,
      tags: trackedRequest.tags,
      templateId: trackedRequest.templateId,
      userId: trackedRequest.userId,
      userProps: trackedRequest.userProps
    });
    let settled = false;
    const finishSuccess = /* @__PURE__ */ __name(async (result2) => {
      if (settled)
        return;
      settled = true;
      const parsedResult = parseTrackedResult(result2);
      src_default.trackEvent("llm", "end", {
        runId,
        name: trackedRequest.name,
        output: parsedResult.output,
        tokensUsage: parsedResult.tokensUsage,
        metadata: parsedResult.metadata
      });
      if (providerRequest.stream) {
        await src_default.flush();
      }
    }, "finishSuccess");
    const finishError = /* @__PURE__ */ __name(async (error) => {
      if (settled)
        return;
      settled = true;
      src_default.trackEvent("llm", "error", {
        runId,
        error: cleanError(error)
      });
      await src_default.processQueue();
    }, "finishError");
    let result;
    try {
      result = createMethod.call(api, providerRequest, options);
    } catch (error) {
      void finishError(error);
      throw error;
    }
    if (providerRequest.stream) {
      let wrappedStreamPromise;
      const getWrappedStream = /* @__PURE__ */ __name(() => {
        if (!wrappedStreamPromise) {
          wrappedStreamPromise = Promise.resolve(result).then(
            (stream) => wrapTrackedStream(
              stream,
              finishSuccess,
              finishError,
              trackedRequest.name
            ),
            async (error) => {
              await finishError(error);
              throw error;
            }
          );
        }
        return wrappedStreamPromise;
      }, "getWrappedStream");
      return buildPromiseLike(getWrappedStream(), {
        asResponse: typeof result?.asResponse === "function" ? result.asResponse.bind(result) : void 0,
        withResponse: typeof result?.withResponse === "function" ? async () => {
          const [payload, wrappedStream] = await Promise.all([
            result.withResponse(),
            getWrappedStream()
          ]);
          return {
            ...payload,
            data: wrappedStream
          };
        } : void 0
      });
    }
    const trackedPromise = Promise.resolve(result).then(
      async (output) => {
        await finishSuccess(output);
        return output;
      },
      async (error) => {
        await finishError(error);
        throw error;
      }
    );
    return buildPromiseLike(trackedPromise, {
      asResponse: typeof result?.asResponse === "function" ? result.asResponse.bind(result) : void 0,
      withResponse: typeof result?.withResponse === "function" ? async () => {
        const [payload] = await Promise.all([
          result.withResponse(),
          trackedPromise
        ]);
        return payload;
      } : void 0
    });
  };
}, "createTrackedCreate");
function monitorAnthropic(anthropic, params = {}) {
  if (anthropic?.messages?.create) {
    anthropic.messages.create = createTrackedCreate(
      anthropic.messages,
      anthropic.messages.create,
      params
    );
  }
  if (anthropic?.beta?.messages?.create) {
    anthropic.beta.messages.create = createTrackedCreate(
      anthropic.beta.messages,
      anthropic.beta.messages.create,
      params
    );
  }
  return anthropic;
}
__name(monitorAnthropic, "monitorAnthropic");
export {
  monitorAnthropic
};
