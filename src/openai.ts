// Support for old OpenAI v3

import {
  ChatMessage,
  WrapExtras,
  WrappedFn,
  WrappedReturn,
  cJSON,
} from "./types"

import OpenAI from "openai"
import OpenAIStreaming from "openai/streaming"

import { cleanExtra } from "./utils"

import monitor from "./index"

const parseOpenaiMessage = (message) => {
  if (!message) return undefined

  // Is name (of the function gpt wanted to call) actually useful to report?
  const { role, content, name, function_call } = message

  return {
    role: role.replace("assistant", "ai"),
    text: content,
    functionCall: function_call as cJSON,
  } as ChatMessage
}

// Forks a stream in two
// https://stackoverflow.com/questions/63543455/how-to-multicast-an-async-iterable
const teeAsync = (iterable) => {
  const AsyncIteratorProto = Object.getPrototypeOf(
    Object.getPrototypeOf(async function* () {}.prototype)
  )

  const iterator = iterable[Symbol.asyncIterator]()
  const buffers = [[], []]
  function makeIterator(buffer, i) {
    return Object.assign(Object.create(AsyncIteratorProto), {
      next() {
        if (!buffer) return Promise.resolve({ done: true, value: undefined })
        if (buffer.length) return buffer.shift()
        const res = iterator.next()
        if (buffers[i ^ 1]) buffers[i ^ 1].push(res)
        return res
      },
      async return() {
        if (buffer) {
          buffer = buffers[i] = null
          if (!buffers[i ^ 1]) await iterator.return()
        }
        return { done: true, value: undefined }
      },
    })
  }
  return buffers.map(makeIterator)
}

// Will be removed in the future
type WrappedOldOpenAi<T> = Omit<T, "createChatCompletion"> & {
  // @ts-ignore
  createChatCompletion: WrappedFn<T["createChatCompletion"]>
}

type CreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => U

type WrapCreateFunction<T, U> = (
  body: T,
  options?: OpenAI.RequestOptions
) => WrappedReturn<CreateFunction<T, U>>

/* Just forwarding the types doesn't work, as it's an overloaded function (tried many solutions, couldn't get it to work) */

type WrapCreate<T> = {
  chat: {
    completions: {
      create: WrapCreateFunction<
        OpenAI.Chat.CompletionCreateParamsNonStreaming,
        Promise<OpenAI.Chat.ChatCompletion>
      > &
        WrapCreateFunction<
          OpenAI.Chat.CompletionCreateParamsStreaming,
          Promise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>>
        > &
        WrapCreateFunction<
          OpenAI.Chat.CompletionCreateParams,
          | Promise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>>
          | Promise<OpenAI.Chat.ChatCompletion>
        >
    }
  }
}

type WrappedOpenAi<T> = Omit<T, "chat"> & WrapCreate<T>

export function openAIv3<T extends any>(
  openai: T,
  params: WrapExtras = {}
): WrappedOldOpenAi<T> {
  // @ts-ignore
  const createChatCompletion = openai.createChatCompletion.bind(openai)

  const wrapped = monitor.wrapModel(createChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        frequencyPenalty: request.frequency_penalty,
        presencePenalty: request.presence_penalty,
        stop: request.stop,
      }
      return cleanExtra(rawExtra)
    },
    outputParser: ({ data }) => parseOpenaiMessage(data.choices[0].text || ""),
    tokensUsageParser: async ({ data }) => ({
      completion: data.usage?.completion_tokens,
      prompt: data.usage?.prompt_tokens,
    }),
    ...params,
  })

  // @ts-ignore
  openai.createChatCompletion = wrapped

  return openai as WrappedOldOpenAi<T>
}

export function monitorOpenAI<T extends any>(
  openai: T,
  params: WrapExtras = {}
): WrappedOpenAi<T> {
  // @ts-ignore
  const createChatCompletion = openai.chat.completions.create.bind(openai)

  async function handleStream(stream, onComplete, onError) {
    try {
      let tokens = 0
      let choices = []
      for await (const part of stream) {
        // 1 chunk = 1 token
        tokens += 1

        const chunk = part.choices[0]

        const { index, delta } = chunk

        const { content, function_call, role } = delta

        if (!choices[index]) {
          choices.splice(index, 0, {
            message: { role, content, function_call },
          })
          continue
        }

        if (content) choices[index].message.content += content
        if (role) choices[index].message.role = role
        if (function_call?.name)
          choices[index].message.function_call.name = function_call.name
        if (function_call?.arguments)
          choices[index].message.function_call.arguments +=
            function_call.arguments
      }

      const res = {
        choices,
        usage: { completion_tokens: tokens, prompt_tokens: undefined },
      }

      onComplete(res)
    } catch (error) {
      console.error(error)
      onError(error)
    }
  }

  const wrapped = monitor.wrapModel(createChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    extraParser: (request) => {
      const rawExtra = {
        temperature: request.temperature,
        maxTokens: request.max_tokens,
        frequencyPenalty: request.frequency_penalty,
        presencePenalty: request.presence_penalty,
        stop: request.stop,
      }
      return cleanExtra(rawExtra)
    },
    outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
    tokensUsageParser: async (res) => {
      return {
        completion: res.usage?.completion_tokens,
        prompt: res.usage?.prompt_tokens,
      }
    },
    enableWaitUntil: (request) => !!request.stream,
    waitUntil: (stream, onComplete, onError) => {
      // Fork the stream in two to be able to process it / multicast it
      const [og, copy] = teeAsync(stream)
      handleStream(copy, onComplete, onError)
      return og
    },
    ...params,
  })

  // @ts-ignore
  openai.chat.completions.create = wrapped

  return openai as WrappedOpenAi<T>
}
