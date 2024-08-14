import lunary from "."
import { cleanExtra, generateUUID } from "./utils"

import type { WrapExtras, WrappableFn, WrapParams } from "./types"
import type { Anthropic } from "@anthropic-ai/sdk"
import { Stream } from "@anthropic-ai/sdk/streaming"
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream.mjs"

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

function* parseMessage(message: Anthropic.Messages.MessageParam) {
  const role = message.role
  const content = message.content

  if (typeof content === "string") {
    yield { role, content }
  } else if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === "text") {
        yield { content: item.text, role }
      } else if (item.type === "tool_use") {
        yield {
          functionCall: {
            name: item.name,
            arguments: item.input,
          },
          toolCallId: item.id,
        }
      } else if (item.type == "tool_result") {
        yield {
          role: "tool",
          tool_call_id: item.tool_use_id,
          content: item.content,
        }
      }
    }
  } else {
    throw new TypeError(`Invalid 'content' type for message: ${message}`)
  }
}

type RegularContent = { type: string; content: string }
type ToolCallContent = {
  functionCall: {
    name: string
    arguments: any
  }
  toolCallId: string,
  partialJSON: string
}

type MessageContent = RegularContent | ToolCallContent

type Message = {
  role: string
  model: string
  usage: { input: number; output: number }
  content: Array<MessageContent>
}

const sum = (items: number[]) => {
  let value = 0
  for (const item of items) {
    value += item
  }
  return value
}

const wrapOptions = {
  nameParser: (request) => request.model,
  inputParser: (request) => {
    const inputs: any[] = []

    if (request.system) {
      if (typeof request.system === "string") {
        inputs.push({
          role: "system",
          content: request.system
        })
      } else if (Array.isArray(request.system)) {
        for (const item of request.system) {
          (item.type === "text") && inputs.push({
            role: "system", content: item.text
          })
        }
      }
    }

    for (const message of (request?.messages || [])) {
      for (const input of parseMessage(message)) {
        inputs.push(input)
      }
    }
    return inputs
  },
  paramsParser: (request) => {
    const rawExtra = {}
    for (const param of PARAMS_TO_CAPTURE) {
      if (param === "tools") {
        rawExtra[param] = []
        for (const tool of request[param] || []) {
          rawExtra[param].push({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              inputSchema: tool.input_schema,
            },
          })
        }
      } else if (request[param]) {
        rawExtra[param] = request[param]
      }
    }
    return cleanExtra(rawExtra)
  },
  metadataParser(request) {
    const metadata = request.metadata

    // Throws TypeError when running typescript code
    try {
      // 'user_id' is the only supported key for anthropic `body.metadata` option
      request.metadata = { user_id: metadata?.user_id }
    } catch (err) {}

    delete metadata?.user_id

    return { ...metadata }
  },
  outputParser: (respose: Anthropic.Messages.Message | Array<any>) => {
    // Output from `handleStream` function
    if (Array.isArray(respose)) {
      const output: any[] = []

      for (const message of respose) {
        for (const item of message.content) {
          if ("content" in item) {
            if (typeof item.content === "string") {
              output.push({
                role: message["role"],
                content: item.content,
              })
            }
          } else {
            const toolCall = (item as ToolCallContent)
            output.push({
              functionCall: {
                name: toolCall.functionCall.name,
                arguments: (
                  toolCall.partialJSON 
                    ? JSON.parse(toolCall.partialJSON)
                    : toolCall.functionCall.arguments
                ),
              },
              toolCallId: toolCall.toolCallId,
            })
          }
        }
      }

      return output
    }

    // Output from `.messages.create` function
    const outputs: any[] = []
    for (const content of respose.content) {
      if (content.type === "text") {
        outputs.push({
          role: respose.role,
          content: content.text,
        })
      } else {
        outputs.push({
          functionCall: {
            name: content.name,
            arguments: content.input,
          },
          toolCallId: content.id,
        })
      }
    }
    return outputs
  },
  tokensUsageParser: async (response) => {
    if (Array.isArray(response)) {
      return {
        completion: sum(response.map((item) => item.usage?.output)),
        prompt: sum(response.map((item) => item.usage?.input)),
      }
    }

    return {
      completion: response.usage?.output_tokens,
      prompt: response.usage?.input_tokens,
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
    const [stream_1, stream_2] = stream.tee()
    handleStream(stream_2, onComplete, onError)
    return stream_1
  },
}

async function handleStreamEvent(
  event: Anthropic.Messages.RawMessageStreamEvent,
  messages: Message[]
) {
  console.log(event)
  if (event.type == "message_start") {
    messages.push({
      role: event.message.role,
      model: event.message.model,
      usage: {
        input: event.message.usage.input_tokens,
        output: event.message.usage.output_tokens,
      },
      content: [],
    })
  } else if (event.type == "message_delta") {
    if (messages.length >= 1) {
      const message = messages.at(-1)
      if (!message) return

      message["usage"]["output"] = event.usage.output_tokens
    }
  } else if (event.type == "message_stop") {
  } else if (event.type == "content_block_start") {
    if (messages.length >= 1) {
      const message = messages.at(-1)
      if (!message) return

      if (event.content_block.type == "text") {
        message.content.splice(event.index, 0, {
          type: event.content_block.type,
          content: event.content_block.text,
        })
      } else {
        message.content.splice(event.index, 0, {
          functionCall: {
            name: event.content_block.name,
            arguments: event.content_block.input,
          },
          toolCallId: event.content_block.id,
          partialJSON: ""
        })
      }
    }
  } else if (event.type === "content_block_delta") {
    if (messages.length >= 1) {
      const message = messages.at(-1)
      if (!message) return

      const event_content = message.content[event.index]

      if (event.delta.type == "text_delta") {
        (event_content as RegularContent).content += event.delta.text
      } else if (event.delta.type == "input_json_delta") {
        (event_content as ToolCallContent).partialJSON += event.delta.partial_json
      }
    }
  } else if (event.type == "content_block_stop") {
    // @ts-ignore
    if (typeof event.content_block !== "undefined" && messages.length >= 1) {
      const message = messages.at(-1)
      const event_content = message.content[event.index]
      // @ts-ignore
      if (event.content_block?.type == "text") {
        // @ts-ignore
        event_content.content = event.content_block?.text
        // @ts-ignore
      } else if (event.content_block?.type == "tool_use") {
        // @ts-ignore
        event_content.update({
          functionCall: {
            // @ts-ignore
            name: event.content_block?.name, // @ts-ignore
            arguments: event.content_block?.input,
          },
          // @ts-ignore
          toolCallId: event.content_block?.id,
        })
      } else {
      }
    }
  }
}

async function handleStream(
  stream: Stream<Anthropic.Messages.RawMessageStreamEvent>,
  onComplete,
  onError
) {
  const messages: Message[] = []

  try {
    for await (const event of stream) {
      await handleStreamEvent(event, messages)
    }
  } catch (error) {
    return onError(error)
  }

  return onComplete(messages)
}

function wrap<T extends WrappableFn>(fn: WrappableFn, extras: WrapParams<T>) {
  return lunary.wrapModel(fn, {
    ...wrapOptions,
    ...extras,
  })
}

export function monitorAnthrophic<T extends Anthropic>(
  client: T,
  extras?: WrapExtras
): T {
  client.messages.create = wrap(
    client.messages.create.bind(client.messages),
    extras
  )

  const originalStream = client.messages.stream.bind(client.messages)
  client.messages.stream = (body, options): MessageStream => {
    const runId = generateUUID()
    const outputs: Message[] = []
    const stream = originalStream(body, options)

    stream.once("connect", () => {
      lunary.trackEvent("llm", "start", {
        runId,
        input: wrapOptions.inputParser(body),
        name: wrapOptions.nameParser(body),
        params: wrapOptions.paramsParser(body),
        metadata: wrapOptions.metadataParser(body),
        tags: wrapOptions.tagsParser(body),
        userId: wrapOptions.userIdParser(body),
        userProps: wrapOptions.userPropsParser(body),
        templateId: wrapOptions.templateParser(body),
      })
    })

    stream.on("streamEvent", (event, snapshot) => {
      handleStreamEvent(event, outputs)
    })

    stream.done().then(async () => {
      const messages = []

      for (const output of outputs) {
        for (const item of output.content) {
          const content = (item as RegularContent).content
          if (typeof content === "string") {
            messages.push({ role: output["role"], content: content })
          } else {
            const toolCall = (item as ToolCallContent)
            messages.push({
              functionCall: {
                name: toolCall.functionCall.name,
                arguments: (
                  toolCall.partialJSON 
                    ? JSON.parse(toolCall.partialJSON)
                    : toolCall.functionCall.arguments
                ),
              },
              toolCallId: toolCall.toolCallId,
            })
          }
        }
      }

      lunary.trackEvent("llm", "end", {
        runId,
        output: messages,
        name: wrapOptions.nameParser(body),
        tokensUsage: await wrapOptions.tokensUsageParser(outputs),
      })
    })

    stream.on("error", (error) => {})
    return stream
  }

  return client
}

export function wrapAgent(fn, extras={}) {
  return lunary.wrapAgent(fn, {
    ...wrapOptions,
    ...extras,
  })
}

export function wrapTool(fn, extras={}) {
  return lunary.wrapTool(fn, {
    ...wrapOptions,
    ...extras,
  })
}

export default monitorAnthrophic
