import OpenAI from "openai"
import { Stream } from "openai/streaming"

import monitor from "./index"
import { cleanExtra, generateUUID } from "./utils"

import type { ChatMessage, WrapExtras, WrappedOpenAI } from "./types"

const parseOpenaiMessage = (message) => {
  if (!message) return undefined

  // Is name (of the function gpt wanted to call) actually useful to report?
  const { role, content, name, function_call, tool_calls, tool_call_id } =
    message

  return {
    role,
    content,
    function_call,
    tool_calls,
    tool_call_id,
    name,
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

const PARAMS_TO_CAPTURE = [
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
  "logit_bias",
]

// const ASSISTANTS = new Map()
// const THREADS = new Map()

const WRAP_OPTIONS = {
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
    const metadata = request.metadata
    // delete request.metadata
    return metadata
  },
  outputParser: (res) => parseOpenaiMessage(res.choices[0].message || ""),
  tokensUsageParser: async (res) => {
    return {
      completion: res.usage?.completion_tokens,
      prompt: res.usage?.prompt_tokens,
    }
  },
  tagsParser: (request) => {
    const tags = request.tags
    delete request.tags
    return tags
  },
  userIdParser: (request) => {
    const user = request.user
    delete request.user
    return user
  },
  userPropsParser: (request) => {
    const props = request.userProps
    delete request.userProps
    return props
  },
  templateParser: (request) => {
    const templateId = request.templateId
    delete request.templateId
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
}

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
          const existingCallIndex = choices[index].message.tool_calls.findIndex(
            (tc) => tc.index === tool_call.index
          )

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

export function monitorOpenAI(
  openai: OpenAI,
  params: WrapExtras = {}
): WrappedOpenAI<OpenAI> {
  const createChatCompletion = openai.chat.completions.create
  const wrappedCreateChatCompletion = (...args) =>
    // @ts-ignore
    createChatCompletion.apply(openai.chat.completions, args)

  const wrapped = monitor.wrapModel(wrappedCreateChatCompletion, {
    ...WRAP_OPTIONS,
    ...params,
  })

  // @ts-ignore
  openai.chat.completions.create = wrapped

  // For when users need to be able to pass lunary options
  // via the `assistants.create` function

  // function wrapAndStore(fn: (...args: any) => any, map: Map<string, any>) {
  //   return async (...args) => {
  //     const output = await fn(...args)
  //     map.set(output.id, { args, output })
  //     return output
  //   }
  // }

  // // @ts-ignore
  // openai.beta.assistants.create = wrapAndStore(
  //   openai.beta.assistants.create.bind(
  //     openai.beta.assistants
  //   ),
  //   ASSISTANTS
  // )

  // // @ts-ignore
  // openai.beta.threads.create = wrapAndStore(
  //   openai.beta.threads.create.bind(
  //     openai.beta.threads
  //   ),
  //   THREADS
  // )

  const createStream = openai.beta.threads.runs.create.bind(
    openai.beta.threads.runs
  )

  // @ts-ignore
  openai.beta.threads.runs.create = async (threadID, options) => {
    const messages = []
    const runId = generateUUID()
    const lunaryOptions = {
      tags: WRAP_OPTIONS.tagsParser(options),
      userId: WRAP_OPTIONS.userIdParser(options),
      metadata: WRAP_OPTIONS.metadataParser(options),
      userProps: WRAP_OPTIONS.userPropsParser(options),
      templateId: WRAP_OPTIONS.templateParser(options),
    }

    const output = await createStream(threadID, options)

    if (output instanceof Stream) {
      const [ogStream, stream] = output.tee()

      for await (const event of stream) {
        await handleStreamEvent(event, {
          runId,
          openai,
          messages,
          lunaryOptions,
        })
      }

      return ogStream
    } else {
      return output
    }
  }

  // @ts-ignore
  return openai
}

async function inputParser(data, openai: OpenAI) {
  const messages = await openai.beta.threads.messages.list(data.thread_id)

  let inputs: any[] = messages.data.map((message) => {
    return {
      role: message.role,
      content: message.content.map((content) => {
        if (content.type === "text") {
          return { type: "text", text: content.text.value }
        }
        // TODO: Get file_url using file_id
        return { type: content.type, fileID: content.image_file.file_id }
      }),
    }
  })

  if (data.instructions) {
    inputs = [{ role: "system", content: data.instructions }, ...inputs]
  }

  return inputs.filter((item) => item.content.length >= 1)
}

async function handleStreamEvent(
  event: OpenAI.Beta.Assistants.AssistantStreamEvent,
  { runId, lunaryOptions, messages, openai }
) {
  console.log(event.event)
  switch (event.event) {
    case "thread.run.created":
      monitor.trackEvent("llm", "start", {
        runId,
        name: event.data.model,
        ...lunaryOptions,

        input: await inputParser(event.data, openai),
        params: WRAP_OPTIONS.paramsParser(event.data),
      })
      break
    case "thread.run.completed":
      monitor.trackEvent("llm", "end", {
        runId,
        output: messages,
        tokensUsage: {
          prompt: event.data.usage.prompt_tokens,
          completion: event.data.usage.completion_tokens,
        },
      })
      break
    case "thread.message.created":
      messages.push({
        role: event.data.role,
        content: event.data.content.map((content) => {
          if (content.type === "text") {
            return { type: "text", text: content.text.value }
          }
          // TODO: Get file_url using file_id
          return {
            type: content.type,
            fileID: content.image_file.file_id,
          }
        }),
      })
      break
    case "thread.message.delta":
      if (event.data.delta.content) {
        const message = messages.at(-1)

        event.data.delta.content.forEach((content) => {
          if (content.type === "text") {
            // Append new entry is no previous entry or previous entry not type text
            if (
              message.content.length < 1 ||
              (message.content.length >= 1 &&
                message.content.at(-1).type !== "text")
            ) {
              message.content.push({ type: "text", text: "" })
            }
            message.content.at(-1).text += content.text.value
          } else {
            // TODO: Get file_url using file_id
            message.content.push({
              type: content.type,
              fileID: content.image_file.file_id,
            })
          }
        })
      } else if (event.data.delta.file_ids) {
        // TODO: Return file urls from ids
      }
      break
    case "thread.run.requires_action":
      if (event.data.required_action.type === "submit_tool_outputs") {
        event.data.required_action.submit_tool_outputs.tool_calls.map(
          (toolCall) => {
            messages.push({
              toolCallId: toolCall.id,
              functionCall: toolCall.function,
            })
          }
        )
      }

      monitor.trackEvent("llm", "end", {
        runId,
        output: messages,
        tokensUsage: {
          prompt: event.data.usage?.prompt_tokens,
          completion: event.data.usage?.completion_tokens,
        },
      })
      break
    case "error":
      monitor.trackEvent("llm", "error", {
        runId,
        error: event.data,
      })
      break
  }
}
