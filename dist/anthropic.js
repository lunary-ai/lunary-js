import {
  src_default
} from "./chunk-MCZY3SVW.js";
import {
  cleanExtra
} from "./chunk-QHQ3L67R.js";
import {
  __name
} from "./chunk-AGSXOS4O.js";

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
__name(parseMessage, "parseMessage");
async function handleStream(stream, onComplete, onError) {
  const messages = [];
  try {
    for await (const event of stream) {
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
            continue;
          message["usage"]["tokens"] = event.usage.output_tokens;
        }
      } else if (event.type == "message_stop") {
      } else if (event.type == "content_block_start") {
        if (messages.length >= 1) {
          const message = messages.at(-1);
          if (!message)
            continue;
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
              toolCallId: event.content_block.id
            });
          }
        }
      } else if (event.type === "content_block_delta") {
        if (messages.length >= 1) {
          const message = messages.at(-1);
          if (!message)
            continue;
          const event_content = message.content[event.index];
          if (event.delta.type == "text_delta") {
            ;
            event_content.content += event.delta.text;
          }
        }
      } else if (event.type == "content_block_stop") {
      }
    }
  } catch (error) {
    return onError(error);
  }
  const output = [];
  for (const message of messages) {
    for (const item of message.content) {
      if ("content" in item) {
        if (typeof item.content === "string") {
          output.push({
            role: message["role"],
            content: item.content
          });
        }
      } else {
        output.push(item);
      }
    }
  }
  return onComplete(output);
}
__name(handleStream, "handleStream");
function monitorAnthrophic(client, extras) {
  const target = client.messages.create.bind(client.messages);
  client.messages.create = src_default.wrapModel(target, {
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
        if (request[param])
          rawExtra[param] = request[param];
      }
      return cleanExtra(rawExtra);
    },
    metadataParser(request) {
      const metadata = request.metadata;
      request.metadata = { user_id: metadata?.user_id };
      delete metadata?.user_id;
      return { ...metadata };
    },
    // @ts-ignore
    outputParser: (respose) => {
      if (Array.isArray(respose))
        return respose;
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
      return {
        // @ts-ignore
        completion: response.usage?.output_tokens,
        // @ts-ignore
        prompt: response.usage?.input_tokens
      };
    },
    tagsParser: (request) => {
      const t = request.tags;
      delete request.tags;
      return t;
    },
    // @ts-ignore
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
    },
    ...extras
  });
  return client;
}
__name(monitorAnthrophic, "monitorAnthrophic");
var anthropic_default = monitorAnthrophic;
export {
  anthropic_default as default,
  monitorAnthrophic
};
