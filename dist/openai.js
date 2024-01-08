import {
  src_default
} from "./chunk-BGJ2W66E.js";
import {
  __name,
  cleanExtra
} from "./chunk-632QYEL3.js";

// src/openai.ts
var parseOpenaiMessage = /* @__PURE__ */ __name((message) => {
  if (!message)
    return void 0;
  const { role, content, name, function_call, tool_calls, tool_call_id } = message;
  return {
    role,
    content,
    function_call,
    tool_calls,
    tool_call_id,
    name
  };
}, "parseOpenaiMessage");
var teeAsync = /* @__PURE__ */ __name((iterable) => {
  const AsyncIteratorProto = Object.getPrototypeOf(
    Object.getPrototypeOf(async function* () {
    }.prototype)
  );
  const iterator = iterable[Symbol.asyncIterator]();
  const buffers = [[], []];
  function makeIterator(buffer, i) {
    return Object.assign(Object.create(AsyncIteratorProto), {
      next() {
        if (!buffer)
          return Promise.resolve({ done: true, value: void 0 });
        if (buffer.length)
          return buffer.shift();
        const res = iterator.next();
        if (buffers[i ^ 1])
          buffers[i ^ 1].push(res);
        return res;
      },
      async return() {
        if (buffer) {
          buffer = buffers[i] = null;
          if (!buffers[i ^ 1])
            await iterator.return();
        }
        return { done: true, value: void 0 };
      }
    });
  }
  __name(makeIterator, "makeIterator");
  return buffers.map(makeIterator);
}, "teeAsync");
var PARAMS_TO_CAPTURE = [
  "temperature",
  "top_p",
  "top_k",
  "stop",
  "presence_penalty",
  "frequence_penalty",
  "seed",
  "function_call",
  "functions",
  "tools",
  "tool_choice",
  "response_format",
  "max_tokens",
  "logit_bias"
];
function openAIv3(openai, params = {}) {
  const createChatCompletion = openai.createChatCompletion.bind(openai);
  const wrapped = src_default.wrapModel(createChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        frequencyPenalty: request.frequency_penalty,
        presencePenalty: request.presence_penalty,
        stop: request.stop,
        functionCall: request.function_call
      };
      return cleanExtra(rawExtra);
    },
    outputParser: ({ data }) => parseOpenaiMessage(data.choices[0]),
    tokensUsageParser: async ({ data }) => ({
      completion: data.usage?.completion_tokens,
      prompt: data.usage?.prompt_tokens
    }),
    ...params
  });
  openai.createChatCompletion = wrapped;
  return openai;
}
__name(openAIv3, "openAIv3");
function monitorOpenAI(openai, params = {}) {
  const createChatCompletion = openai.chat.completions.create;
  const wrappedCreateChatCompletion = /* @__PURE__ */ __name((...args) => (
    // @ts-ignore
    createChatCompletion.apply(openai.chat.completions, args)
  ), "wrappedCreateChatCompletion");
  async function handleStream(stream, onComplete, onError) {
    try {
      let tokens = 0;
      let choices = [];
      for await (const part of stream) {
        tokens += 1;
        const chunk = part.choices[0];
        const { index, delta } = chunk;
        const { content, function_call, role, tool_calls } = delta;
        if (!choices[index]) {
          choices.splice(index, 0, {
            message: { role, content, function_call, tool_calls: [] }
          });
        }
        if (content)
          choices[index].message.content += content || "";
        if (role)
          choices[index].message.role = role;
        if (function_call?.name)
          choices[index].message.function_call.name = function_call.name;
        if (function_call?.arguments)
          choices[index].message.function_call.arguments += function_call.arguments;
        if (tool_calls) {
          for (const tool_call of tool_calls) {
            const existingCallIndex = choices[index].message.tool_calls.findIndex((tc) => tc.index === tool_call.index);
            if (existingCallIndex === -1) {
              choices[index].message.tool_calls.push(tool_call);
            } else {
              const existingCall = choices[index].message.tool_calls[existingCallIndex];
              if (tool_call.function?.arguments) {
                existingCall.function.arguments += tool_call.function.arguments;
              }
            }
          }
        }
      }
      choices = choices.map((c) => {
        if (c.message.tool_calls) {
          c.message.tool_calls = c.message.tool_calls.map((tc) => {
            const { index, ...rest } = tc;
            return rest;
          });
        }
        return c;
      });
      const res = {
        choices,
        usage: { completion_tokens: tokens, prompt_tokens: void 0 }
      };
      onComplete(res);
    } catch (error) {
      console.error(error);
      onError(error);
    }
  }
  __name(handleStream, "handleStream");
  const wrapped = src_default.wrapModel(wrappedCreateChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {};
      for (const param of PARAMS_TO_CAPTURE) {
        if (request[param])
          rawExtra[param] = request[param];
      }
      return cleanExtra(rawExtra);
    },
    outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
    tokensUsageParser: async (res) => {
      return {
        completion: res.usage?.completion_tokens,
        prompt: res.usage?.prompt_tokens
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
      const [og, copy] = teeAsync(stream);
      handleStream(copy, onComplete, onError);
      return og;
    },
    ...params
  });
  openai.chat.completions.create = wrapped;
  return openai;
}
__name(monitorOpenAI, "monitorOpenAI");
export {
  monitorOpenAI,
  openAIv3
};
