import {
  cleanExtra,
  src_default
} from "./chunk-G6ZIQCTK.mjs";

// src/openai.ts
var parseOpenaiMessage = (message) => {
  if (!message)
    return void 0;
  const { role, content, name, function_call } = message;
  return {
    role: role.replace("assistant", "ai"),
    text: content,
    function_call
  };
};
var teeAsync = (iterable) => {
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
  return buffers.map(makeIterator);
};
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
        stop: request.stop
      };
      return cleanExtra(rawExtra);
    },
    outputParser: ({ data }) => parseOpenaiMessage(data.choices[0].text || ""),
    tokensUsageParser: async ({ data }) => ({
      completion: data.usage?.completion_tokens,
      prompt: data.usage?.prompt_tokens
    }),
    ...params
  });
  openai.createChatCompletion = wrapped;
  return openai;
}
function monitorOpenAI(openai, params = {}) {
  const createChatCompletion = openai.chat.completions.create.bind(openai);
  async function handleStream(stream, onComplete, onError) {
    try {
      let tokens = 0;
      let choices = [];
      for await (const part of stream) {
        tokens += 1;
        const chunk = part.choices[0];
        const { index, delta } = chunk;
        const { content, function_call, role } = delta;
        if (!choices[index]) {
          choices.splice(index, 0, {
            message: { role, content, function_call }
          });
          continue;
        }
        if (content)
          choices[index].message.content += content;
        if (role)
          choices[index].message.role = role;
        if (function_call?.name)
          choices[index].message.function_call.name = function_call.name;
        if (function_call?.arguments)
          choices[index].message.function_call.arguments += function_call.arguments;
      }
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
  const wrapped = src_default.wrapModel(createChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        frequencyPenalty: request.frequency_penalty,
        presencePenalty: request.presence_penalty,
        stop: request.stop
      };
      return cleanExtra(rawExtra);
    },
    outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
    tokensUsageParser: async (res) => {
      return {
        completion: res.usage?.completion_tokens,
        prompt: res.usage?.prompt_tokens
      };
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
export {
  monitorOpenAI,
  openAIv3
};
