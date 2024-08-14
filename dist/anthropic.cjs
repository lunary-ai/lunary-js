"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } function _optionalChainDelete(ops) { const result = _optionalChain(ops); return result == null ? true : result; }

var _chunk26SNBQOHcjs = require('./chunk-26SNBQOH.cjs');



var _chunkD35PBWYWcjs = require('./chunk-D35PBWYW.cjs');


var _chunkEC6JY3PVcjs = require('./chunk-EC6JY3PV.cjs');

// src/anthropic.ts
var PARAMS_TO_CAPTURE = [
  "temperature",
  "top_p",
  "top_k",
  "stop",
  "presence_penalty",
  "frequency_penalty",
  "seed",
  "function_call",
  "functions",
  "tools",
  "tool_choice",
  "response_format",
  "max_tokens",
  "logit_bias"
];
function* parseMessage(message) {
  const role = message.role;
  const content = message.content;
  if (typeof content === "string") {
    yield { role, content };
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === "text") {
        yield { content: item.text, role };
      } else if (item.type === "tool_use") {
        yield {
          functionCall: {
            name: item.name,
            arguments: item.input
          },
          toolCallId: item.id
        };
      } else if (item.type == "tool_result") {
        yield {
          role: "tool",
          tool_call_id: item.tool_use_id,
          content: item.content
        };
      }
    }
  } else {
    throw new TypeError(`Invalid 'content' type for message: ${message}`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, parseMessage, "parseMessage");
var sum = /* @__PURE__ */ _chunkEC6JY3PVcjs.__name.call(void 0, (items) => {
  let value = 0;
  for (const item of items) {
    value += item;
  }
  return value;
}, "sum");
var wrapOptions = {
  nameParser: (request) => request.model,
  inputParser: (request) => {
    const inputs = [];
    if (request.system) {
      if (typeof request.system === "string") {
        inputs.push({
          role: "system",
          content: request.system
        });
      } else if (Array.isArray(request.system)) {
        for (const item of request.system) {
          item.type === "text" && inputs.push({
            role: "system",
            content: item.text
          });
        }
      }
    }
    for (const message of _optionalChain([request, 'optionalAccess', _ => _.messages]) || []) {
      for (const input of parseMessage(message)) {
        inputs.push(input);
      }
    }
    return inputs;
  },
  paramsParser: (request) => {
    const rawExtra = {};
    for (const param of PARAMS_TO_CAPTURE) {
      if (param === "tools") {
        rawExtra[param] = [];
        for (const tool of request[param] || []) {
          rawExtra[param].push({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              inputSchema: tool.input_schema
            }
          });
        }
      } else if (request[param]) {
        rawExtra[param] = request[param];
      }
    }
    return _chunkD35PBWYWcjs.cleanExtra.call(void 0, rawExtra);
  },
  metadataParser(request) {
    const metadata = request.metadata;
    try {
      request.metadata = { user_id: _optionalChain([metadata, 'optionalAccess', _2 => _2.user_id]) };
    } catch (err) {
    }
     _optionalChainDelete([metadata, 'optionalAccess', _3 => delete _3.user_id]);
    return { ...metadata };
  },
  outputParser: (respose) => {
    if (Array.isArray(respose)) {
      const output = [];
      for (const message of respose) {
        for (const item of message.content) {
          if ("content" in item) {
            if (typeof item.content === "string") {
              output.push({
                role: message["role"],
                content: item.content
              });
            }
          } else {
            const toolCall = item;
            output.push({
              functionCall: {
                name: toolCall.functionCall.name,
                arguments: toolCall.partialJSON ? JSON.parse(toolCall.partialJSON) : toolCall.functionCall.arguments
              },
              toolCallId: toolCall.toolCallId
            });
          }
        }
      }
      return output;
    }
    const outputs = [];
    for (const content of respose.content) {
      if (content.type === "text") {
        outputs.push({
          role: respose.role,
          content: content.text
        });
      } else {
        outputs.push({
          functionCall: {
            name: content.name,
            arguments: content.input
          },
          toolCallId: content.id
        });
      }
    }
    return outputs;
  },
  tokensUsageParser: async (response) => {
    if (Array.isArray(response)) {
      return {
        completion: sum(response.map((item) => _optionalChain([item, 'access', _4 => _4.usage, 'optionalAccess', _5 => _5.output]))),
        prompt: sum(response.map((item) => _optionalChain([item, 'access', _6 => _6.usage, 'optionalAccess', _7 => _7.input])))
      };
    }
    return {
      completion: _optionalChain([response, 'access', _8 => _8.usage, 'optionalAccess', _9 => _9.output_tokens]),
      prompt: _optionalChain([response, 'access', _10 => _10.usage, 'optionalAccess', _11 => _11.input_tokens])
    };
  },
  tagsParser: (request) => {
    const t = request.tags;
    delete request.tags;
    return t;
  },
  userIdParser: (request) => request.user,
  userPropsParser: (request) => {
    const props = request.userProps;
    delete request.userProps;
    return props;
  },
  templateParser: (request) => {
    const templateId = request.templateId;
    delete request.templateId;
    delete request.prompt;
    return templateId;
  },
  enableWaitUntil: (request) => !!request.stream,
  waitUntil: (stream, onComplete, onError) => {
    const [stream_1, stream_2] = stream.tee();
    handleStream(stream_2, onComplete, onError);
    return stream_1;
  }
};
async function handleStreamEvent(event, messages) {
  console.log(event);
  if (event.type == "message_start") {
    messages.push({
      role: event.message.role,
      model: event.message.model,
      usage: {
        input: event.message.usage.input_tokens,
        output: event.message.usage.output_tokens
      },
      content: []
    });
  } else if (event.type == "message_delta") {
    if (messages.length >= 1) {
      const message = messages.at(-1);
      if (!message)
        return;
      message["usage"]["output"] = event.usage.output_tokens;
    }
  } else if (event.type == "message_stop") {
  } else if (event.type == "content_block_start") {
    if (messages.length >= 1) {
      const message = messages.at(-1);
      if (!message)
        return;
      if (event.content_block.type == "text") {
        message.content.splice(event.index, 0, {
          type: event.content_block.type,
          content: event.content_block.text
        });
      } else {
        message.content.splice(event.index, 0, {
          functionCall: {
            name: event.content_block.name,
            arguments: event.content_block.input
          },
          toolCallId: event.content_block.id,
          partialJSON: ""
        });
      }
    }
  } else if (event.type === "content_block_delta") {
    if (messages.length >= 1) {
      const message = messages.at(-1);
      if (!message)
        return;
      const event_content = message.content[event.index];
      if (event.delta.type == "text_delta") {
        event_content.content += event.delta.text;
      } else if (event.delta.type == "input_json_delta") {
        event_content.partialJSON += event.delta.partial_json;
      }
    }
  } else if (event.type == "content_block_stop") {
    if (typeof event.content_block !== "undefined" && messages.length >= 1) {
      const message = messages.at(-1);
      const event_content = message.content[event.index];
      if (_optionalChain([event, 'access', _12 => _12.content_block, 'optionalAccess', _13 => _13.type]) == "text") {
        event_content.content = _optionalChain([event, 'access', _14 => _14.content_block, 'optionalAccess', _15 => _15.text]);
      } else if (_optionalChain([event, 'access', _16 => _16.content_block, 'optionalAccess', _17 => _17.type]) == "tool_use") {
        event_content.update({
          functionCall: {
            // @ts-ignore
            name: _optionalChain([event, 'access', _18 => _18.content_block, 'optionalAccess', _19 => _19.name]),
            // @ts-ignore
            arguments: _optionalChain([event, 'access', _20 => _20.content_block, 'optionalAccess', _21 => _21.input])
          },
          // @ts-ignore
          toolCallId: _optionalChain([event, 'access', _22 => _22.content_block, 'optionalAccess', _23 => _23.id])
        });
      } else {
      }
    }
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, handleStreamEvent, "handleStreamEvent");
async function handleStream(stream, onComplete, onError) {
  const messages = [];
  try {
    for await (const event of stream) {
      await handleStreamEvent(event, messages);
    }
  } catch (error) {
    return onError(error);
  }
  return onComplete(messages);
}
_chunkEC6JY3PVcjs.__name.call(void 0, handleStream, "handleStream");
function wrap(fn, extras) {
  return _chunk26SNBQOHcjs.src_default.wrapModel(fn, {
    ...wrapOptions,
    ...extras
  });
}
_chunkEC6JY3PVcjs.__name.call(void 0, wrap, "wrap");
function monitorAnthrophic(client, extras) {
  client.messages.create = wrap(
    client.messages.create.bind(client.messages),
    extras
  );
  const originalStream = client.messages.stream.bind(client.messages);
  client.messages.stream = (body, options) => {
    const runId = _chunkD35PBWYWcjs.generateUUID.call(void 0, );
    const outputs = [];
    const stream = originalStream(body, options);
    stream.once("connect", () => {
      _chunk26SNBQOHcjs.src_default.trackEvent("llm", "start", {
        runId,
        input: wrapOptions.inputParser(body),
        name: wrapOptions.nameParser(body),
        params: wrapOptions.paramsParser(body),
        metadata: wrapOptions.metadataParser(body),
        tags: wrapOptions.tagsParser(body),
        userId: wrapOptions.userIdParser(body),
        userProps: wrapOptions.userPropsParser(body),
        templateId: wrapOptions.templateParser(body)
      });
    });
    stream.on("streamEvent", (event, snapshot) => {
      handleStreamEvent(event, outputs);
    });
    stream.done().then(async () => {
      const messages = [];
      for (const output of outputs) {
        for (const item of output.content) {
          const content = item.content;
          if (typeof content === "string") {
            messages.push({ role: output["role"], content });
          } else {
            const toolCall = item;
            messages.push({
              functionCall: {
                name: toolCall.functionCall.name,
                arguments: toolCall.partialJSON ? JSON.parse(toolCall.partialJSON) : toolCall.functionCall.arguments
              },
              toolCallId: toolCall.toolCallId
            });
          }
        }
      }
      _chunk26SNBQOHcjs.src_default.trackEvent("llm", "end", {
        runId,
        output: messages,
        name: wrapOptions.nameParser(body),
        tokensUsage: await wrapOptions.tokensUsageParser(outputs)
      });
    });
    stream.on("error", (error) => {
    });
    return stream;
  };
  return client;
}
_chunkEC6JY3PVcjs.__name.call(void 0, monitorAnthrophic, "monitorAnthrophic");
function wrapAgent(fn, extras = {}) {
  return _chunk26SNBQOHcjs.src_default.wrapAgent(fn, {
    ...wrapOptions,
    ...extras
  });
}
_chunkEC6JY3PVcjs.__name.call(void 0, wrapAgent, "wrapAgent");
function wrapTool(fn, extras = {}) {
  return _chunk26SNBQOHcjs.src_default.wrapTool(fn, {
    ...wrapOptions,
    ...extras
  });
}
_chunkEC6JY3PVcjs.__name.call(void 0, wrapTool, "wrapTool");
var anthropic_default = monitorAnthrophic;





exports.default = anthropic_default; exports.monitorAnthrophic = monitorAnthrophic; exports.wrapAgent = wrapAgent; exports.wrapTool = wrapTool;
