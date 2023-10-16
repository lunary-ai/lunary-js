"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkUPZBADTYcjs = require('./chunk-UPZBADTY.cjs');



var _chunkM3TFISX5cjs = require('./chunk-M3TFISX5.cjs');

// src/openai.ts
var parseOpenaiMessage = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, (message) => {
  if (!message)
    return void 0;
  const { role, content, name, function_call } = message;
  return {
    role: role.replace("assistant", "ai"),
    text: content,
    functionCall: function_call
  };
}, "parseOpenaiMessage");
var teeAsync = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, (iterable) => {
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
  _chunkM3TFISX5cjs.__name.call(void 0, makeIterator, "makeIterator");
  return buffers.map(makeIterator);
}, "teeAsync");
function openAIv3(openai, params = {}) {
  const createChatCompletion = openai.createChatCompletion.bind(openai);
  const wrapped = _chunkUPZBADTYcjs.src_default.wrapModel(createChatCompletion, {
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
      return _chunkM3TFISX5cjs.cleanExtra.call(void 0, rawExtra);
    },
    outputParser: ({ data }) => parseOpenaiMessage(data.choices[0].text || ""),
    tokensUsageParser: async ({ data }) => ({
      completion: _optionalChain([data, 'access', _ => _.usage, 'optionalAccess', _2 => _2.completion_tokens]),
      prompt: _optionalChain([data, 'access', _3 => _3.usage, 'optionalAccess', _4 => _4.prompt_tokens])
    }),
    ...params
  });
  openai.createChatCompletion = wrapped;
  return openai;
}
_chunkM3TFISX5cjs.__name.call(void 0, openAIv3, "openAIv3");
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
        if (_optionalChain([function_call, 'optionalAccess', _5 => _5.name]))
          choices[index].message.function_call.name = function_call.name;
        if (_optionalChain([function_call, 'optionalAccess', _6 => _6.arguments]))
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
  _chunkM3TFISX5cjs.__name.call(void 0, handleStream, "handleStream");
  const wrapped = _chunkUPZBADTYcjs.src_default.wrapModel(createChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        frequencyPenalty: request.frequency_penalty,
        presencePenalty: request.presence_penalty,
        stop: request.stop,
        functions: request.functions
      };
      return _chunkM3TFISX5cjs.cleanExtra.call(void 0, rawExtra);
    },
    outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
    tokensUsageParser: async (res) => {
      return {
        completion: _optionalChain([res, 'access', _7 => _7.usage, 'optionalAccess', _8 => _8.completion_tokens]),
        prompt: _optionalChain([res, 'access', _9 => _9.usage, 'optionalAccess', _10 => _10.prompt_tokens])
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
_chunkM3TFISX5cjs.__name.call(void 0, monitorOpenAI, "monitorOpenAI");



exports.monitorOpenAI = monitorOpenAI; exports.openAIv3 = openAIv3;
