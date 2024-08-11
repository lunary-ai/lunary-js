"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } function _optionalChainDelete(ops) { const result = _optionalChain(ops); return result == null ? true : result; }

var _chunkCSZ7JMNHcjs = require('./chunk-CSZ7JMNH.cjs');



var _chunkTUK3O2HZcjs = require('./chunk-TUK3O2HZ.cjs');


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
    for (const message of request.messages) {
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
    return _chunkTUK3O2HZcjs.cleanExtra.call(void 0, rawExtra);
  },
  metadataParser(request) {
    const metadata = request.metadata;
    request.metadata = { user_id: _optionalChain([metadata, 'optionalAccess', _ => _.user_id]) };
     _optionalChainDelete([metadata, 'optionalAccess', _2 => delete _2.user_id]);
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
        completion: sum(response.map((item) => _optionalChain([item, 'access', _3 => _3.usage, 'optionalAccess', _4 => _4.output]))),
        prompt: sum(response.map((item) => _optionalChain([item, 'access', _5 => _5.usage, 'optionalAccess', _6 => _6.input])))
      };
    }
    return {
      completion: _optionalChain([response, 'access', _7 => _7.usage, 'optionalAccess', _8 => _8.output_tokens]),
      prompt: _optionalChain([response, 'access', _9 => _9.usage, 'optionalAccess', _10 => _10.input_tokens])
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
      if (_optionalChain([event, 'access', _11 => _11.content_block, 'optionalAccess', _12 => _12.type]) == "text") {
        event_content.content = _optionalChain([event, 'access', _13 => _13.content_block, 'optionalAccess', _14 => _14.text]);
      } else if (_optionalChain([event, 'access', _15 => _15.content_block, 'optionalAccess', _16 => _16.type]) == "tool_use") {
        event_content.update({
          functionCall: {
            // @ts-ignore
            name: _optionalChain([event, 'access', _17 => _17.content_block, 'optionalAccess', _18 => _18.name]),
            // @ts-ignore
            arguments: _optionalChain([event, 'access', _19 => _19.content_block, 'optionalAccess', _20 => _20.input])
          },
          // @ts-ignore
          toolCallId: _optionalChain([event, 'access', _21 => _21.content_block, 'optionalAccess', _22 => _22.id])
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
  return _chunkCSZ7JMNHcjs.src_default.wrapModel(fn, {
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
    const runId = _chunkTUK3O2HZcjs.generateUUID.call(void 0, );
    const outputs = [];
    const stream = originalStream(body, options);
    stream.once("connect", () => {
      _chunkCSZ7JMNHcjs.src_default.trackEvent("llm", "start", {
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
      _chunkCSZ7JMNHcjs.src_default.trackEvent("llm", "end", {
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
var anthropic_default = monitorAnthrophic;



exports.default = anthropic_default; exports.monitorAnthrophic = monitorAnthrophic;
