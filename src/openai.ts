// Support for old OpenAI v3

import {
  ChatMessage,
  Template,
  WrapExtras,
  WrappedFn,
  WrappedReturn,
  cJSON,
} from "./types"

import OpenAI from "openai"
import { APIPromise } from "openai/core"
import OpenAIStreaming from "openai/streaming"

import { cleanExtra, teeAsync } from "./utils"

import monitor from "./index"

const parseOpenaiMessage = (message) => {
  if (!message) return undefined

  const {
    role,
    content,
    audio,
    refusal,
    name,
    function_call,
    tool_calls,
    tool_call_id,
  } = message

  return {
    role,
    content,
    audio,
    refusal,
    function_call,
    tool_calls,
    tool_call_id,
    name,
  } as ChatMessage
}

type CreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => U

/* Just forwarding the types doesn't work, as it's an overloaded function (tried many solutions, couldn't get it to work) */
type NewParams = {
  tags?: string[]
  userProps?: cJSON
  metadata?: cJSON
}

type WrapCreateFunction<T, U> = (
  body: (T & NewParams) | Template | (Template & T),
  options?: OpenAI.RequestOptions
) => WrappedReturn<CreateFunction<T, U>>

type WrapCreate<T> = {
  chat: {
    completions: {
      create: WrapCreateFunction<
        OpenAI.Chat.ChatCompletionCreateParamsNonStreaming,
        APIPromise<OpenAI.ChatCompletion>
      > &
        WrapCreateFunction<
          OpenAI.Chat.ChatCompletionCreateParamsStreaming,
          APIPromise<OpenAIStreaming.Stream<OpenAI.ChatCompletionChunk>>
        > &
        WrapCreateFunction<
          OpenAI.Chat.ChatCompletionCreateParams,
          | APIPromise<OpenAI.ChatCompletion>
          | APIPromise<OpenAIStreaming.Stream<OpenAI.ChatCompletionChunk>>
        >
    }
  }
}

const PARAMS_TO_CAPTURE = [
  "temperature",
  "top_p",
  "top_k",
  "stop",
  "audio",
  "prediction",
  "modalities",
  "presence_penalty",
  "frequency_penalty",
  "seed",
  "function_call",
  "service_tier",
  "parallel_tool_calls",
  "functions",
  "tools",
  "tool_choice",
  "top_logprobs",
  "logprobs",
  "response_format",
  "max_tokens",
  "max_completion_tokens",
  "logit_bias",
]

type WrappedOpenAi<T> = Omit<T, "chat"> & WrapCreate<T>

export function monitorOpenAI<T extends any>(
  openai: T,
  params: WrapExtras = {}
): WrappedOpenAi<T> {
  // @ts-ignore
  const createChatCompletion = openai.chat.completions.create
  const wrappedCreateChatCompletion = (...args) =>
    // @ts-ignore
    createChatCompletion.apply(openai.chat.completions, args)

  async function handleStream(stream, onComplete, onError) {
    try {
      let tokens = 0
      let choices = []
      for await (const part of stream) {
        // 1 chunk = 1 token
        tokens += 1

        const chunk = part.choices[0]

        const { index, delta } = chunk

        const { content, function_call, role, tool_calls } = delta

        if (!choices[index]) {
          choices.splice(index, 0, {
            message: { role, content, function_call, tool_calls: [] },
          })
        }

        if (content) choices[index].message.content += content || ""

        if (role) choices[index].message.role = role

        if (function_call?.name)
          choices[index].message.function_call.name = function_call.name

        if (function_call?.arguments)
          choices[index].message.function_call.arguments +=
            function_call.arguments

        if (tool_calls) {
          for (const tool_call of tool_calls) {
            const existingCallIndex = choices[
              index
            ].message.tool_calls.findIndex((tc) => tc.index === tool_call.index)

            if (existingCallIndex === -1) {
              choices[index].message.tool_calls.push(tool_call)
            } else {
              const existingCall =
                choices[index].message.tool_calls[existingCallIndex]

              if (tool_call.function?.arguments) {
                existingCall.function.arguments += tool_call.function.arguments
              }
            }
          }
        }
      }

      // remove the `index` property from the tool_calls if any
      // as it's only used to help us merge the tool_calls
      choices = choices.map((c) => {
        if (c.message.tool_calls) {
          c.message.tool_calls = c.message.tool_calls.map((tc) => {
            const { index, ...rest } = tc
            return rest
          })
        }
        return c
      })

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

  const wrapped = monitor.wrapModel(wrappedCreateChatCompletion, {
    nameParser: (request) => request.model,
    inputParser: (request) => request.messages.map(parseOpenaiMessage),
    paramsParser: (request) => {
      const rawExtra = {}
      for (const param of PARAMS_TO_CAPTURE) {
        if (request[param]) rawExtra[param] = request[param]
      }
      return cleanExtra(rawExtra)
    },
    metadataParser(request) {
      return request.metadata
    },
    outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
    tokensUsageParser: async (res) => {
      return {
        completion: res.usage?.completion_tokens,
        prompt: res.usage?.prompt_tokens,
      }
    },
    tagsParser: (request) => {
      const t = request.tags
      delete request.tags // delete key otherwise openai will throw error
      return t
    },
    userIdParser: (request) => request.user,
    userPropsParser: (request) => {
      const props = request.userProps
      delete request.userProps // delete key otherwise openai will throw error
      return props
    },
    templateParser: (request) => {
      const templateId = request.templateId
      delete request.templateId // delete key otherwise openai will throw error
      delete request.prompt // extra key might be returned by template fn
      return templateId
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
