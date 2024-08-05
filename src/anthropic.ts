import lunary from "."
import { cleanExtra } from "./utils"

import type { WrapExtras } from "./types"
import type { Anthropic } from "@anthropic-ai/sdk"
import type { Stream } from "@anthropic-ai/sdk/streaming"

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
  toolCallId: string
}

type MessageContent = RegularContent | ToolCallContent

type Message = {
  role: string
  model: string
  usage: { input: number; output: number }
  content: Array<MessageContent>
}

async function handleStream(
  stream: Stream<Anthropic.Messages.RawMessageStreamEvent>,
  onComplete,
  onError
) {
  const messages: Message[] = []

  try {
    for await (const event of stream) {
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
          if (!message) continue

          message["usage"]["tokens"] = event.usage.output_tokens
        }
      } else if (event.type == "message_stop") {
      } else if (event.type == "content_block_start") {
        if (messages.length >= 1) {
          const message = messages.at(-1)
          if (!message) continue

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
            })
          }
        }
      } else if (event.type === "content_block_delta") {
        if (messages.length >= 1) {
          const message = messages.at(-1)
          if (!message) continue

          const event_content = message.content[event.index]

          if (event.delta.type == "text_delta") {
            ;(event_content as RegularContent).content += event.delta.text
          }
        }
      } else if (event.type == "content_block_stop") {
        // if (typeof event.content_block === "undefined" && messages.length >= 1) {
        //     const message = messages.at(-1)
        //     const event_content = message.content[event.index]
        //     if (event.content_block.type == "text") {
        //         event_content.content = event.content_block.text
        //     } else if (event.content_block.type == "tool_use") {
        //         event_content.update(
        //             {
        //                 "functionCall": {
        //                     "name": event.content_block.name,
        //                     "arguments": event.content_block.input,
        //                 },
        //                 "toolCallId": event.content_block.id,
        //             }
        //         )
        //     } else {
        //         onError("Invalid `content_block` type");
        //     }
        // }
      }
    }
  } catch (error) {
    return onError(error)
  }

  const output: any[] = []

  for (const message of messages) {
    for (const item of message.content) {
      if ("content" in item) {
        if (typeof item.content === "string") {
          output.push({
            role: message["role"],
            content: item.content,
          })
        }
      } else {
        output.push(item)
      }
    }
  }

  return onComplete(output)
}

export function monitorAnthrophic<T extends any>(
  client: T,
  extras?: WrapExtras
): T {
  // @ts-ignore
  const target = client.messages.create.bind(client.messages)

  // @ts-ignore
  client.messages.create = lunary.wrapModel(target, {
    nameParser: (request) => request.model,
    inputParser: (request) => {
      const inputs: any[] = []
      for (const message of request.messages) {
        for (const input of parseMessage(message)) {
          inputs.push(input)
        }
      }
      return inputs
    },
    paramsParser: (request) => {
      const rawExtra = {}
      for (const param of PARAMS_TO_CAPTURE) {
        if (request[param]) rawExtra[param] = request[param]
      }
      return cleanExtra(rawExtra)
    },
    metadataParser(request) {
      const metadata = request.metadata

      // 'user_id' is the only supported key for anthropic `body.metadata` option
      request.metadata = { user_id: metadata?.user_id }

      delete metadata?.user_id

      return { ...metadata }
    },
    // @ts-ignore
    outputParser: (respose: Anthropic.Messages.Message | Array<any>) => {
      if (Array.isArray(respose)) return respose

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
      return {
        // @ts-ignore
        completion: response.usage?.output_tokens,
        // @ts-ignore
        prompt: response.usage?.input_tokens,
      }
    },
    tagsParser: (request) => {
      // @ts-ignore
      const t = request.tags
      // @ts-ignore
      delete request.tags // delete key otherwise openai will throw error
      return t
    },
    // @ts-ignore
    userIdParser: (request) => request.user,
    userPropsParser: (request) => {
      // @ts-ignore
      const props = request.userProps
      // @ts-ignore
      delete request.userProps // delete key otherwise openai will throw error
      return props
    },
    templateParser: (request) => {
      // @ts-ignore
      const templateId = request.templateId
      // @ts-ignore
      delete request.templateId // delete key otherwise openai will throw error
      // @ts-ignore
      delete request.prompt // extra key might be returned by template fn
      return templateId
    },
    enableWaitUntil: (request) => !!request.stream,
    waitUntil: (stream, onComplete, onError) => {
      const [stream_1, stream_2] = stream.tee()
      handleStream(stream_2, onComplete, onError)
      return stream_1
    },
    ...extras,
  })

  return client
}

export default monitorAnthrophic
