import type Anthropic from "@anthropic-ai/sdk"
import { ChatMessage, WrapExtras } from "./types"
import { cleanExtra, teeAsync } from "./utils"
import monitor from "./index"
import { Stream } from "@anthropic-ai/sdk/streaming.mjs"
import { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream.mjs"

const parseAnthropicMessage = (
  message?:
    | Anthropic.Message
    | Anthropic.MessageParam
    | { role: "system"; content: string }
): ChatMessage | undefined => {
  if (!message) return undefined

  //*
  //   * Each input message `content` may be either a single `string` or an array of
  //   * content blocks, where each block has a specific `type`. Using a `string` for
  //   * `content` is shorthand for an array of one content block of type `"text"`. The
  //   * following input messages are equivalent:
  //   *
  //   * ```json
  //   * { "role": "user", "content": "Hello, Claude" }
  //   * ```
  //   *
  //   * ```json
  //   * { "role": "user", "content": [{ "type": "text", "text": "Hello, Claude" }] }
  //   * ```
  //   *
  //  * Starting with Claude 3 models, you can also send image content blocks:
  //    *
  //   * ```json
  //   * {
  //   *   "role": "user",
  //   *   "content": [
  //   *     {
  //   *       "type": "image",
  //   *       "source": {
  //   *         "type": "base64",
  //   *         "media_type": "image/jpeg",
  //   *         "data": "/9j/4AAQSkZJRg..."
  //   *       }
  //   *     },
  //   *     { "type": "text", "text": "What is in this image?" }
  //   *   ]
  //   * }

  if (typeof message.content === "string") {
    return {
      role: message.role as ChatMessage["role"],
      content: message.content,
    }
  }

  const mappedContent = message.content.map((block) => {
    if (block.type === "text") {
      return {
        type: "text",
        text: block.text,
      }
    } else if (block.type === "image") {
      return {
        type: "image_url",
        image_url: {
          url: `data:${block.source.media_type};base64,${block.source.data}`,
        },
      }
    }
    return block
  })

  return {
    role: message.role,
    content: mappedContent,
  }
}

const PARAMS_TO_CAPTURE = [
  "max_tokens",
  "stop_sequences",
  "temperature",
  "tool_choice",
  "tools",
  "top_p",
  "top_k",
]

type CustomProps = {
  userId?: string
  userProps?: Record<string, any>
  tags?: string[]
  metadata?: Record<string, any>
  templateId?: string
}

// Get the parameter types from Anthropic's methods
type BaseCreateParams = Anthropic.MessageCreateParamsNonStreaming
type BaseStreamParams = Anthropic.MessageCreateParamsStreaming
type BaseOptions = Anthropic.RequestOptions

type WrappedAnthropic<T> = Omit<T, "messages"> & {
  messages: {
    create: {
      // Non-streaming overload
      (
        params: BaseCreateParams & CustomProps,
        options?: BaseOptions
      ): Anthropic.Message
      // Streaming overload
      (
        params: BaseStreamParams & CustomProps,
        options?: BaseOptions
      ): Stream<Anthropic.MessageStreamEvent>
    }
    stream: (
      params: Anthropic.MessageStreamParams & CustomProps,
      options?: BaseOptions
    ) => MessageStream
  }
}

export function monitorAnthropic<T extends Anthropic>(
  anthropic: T,
  params: WrapExtras = {}
): WrappedAnthropic<T> {
  // @ts-ignore
  const createMessage = anthropic.messages.create

  async function handleStream(stream, onComplete, onError) {
    try {
      let content = ""
      let role = ""
      let usage = {
        input_tokens: 0,
        output_tokens: 0,
      }

      for await (const part of stream) {
        if (part.type === "message_start") {
          role = part.message.role
          usage.input_tokens = part.message.usage?.input_tokens
        } else if (part.type === "content_block_delta") {
          content += part.delta.text
        } else if (part.type === "message_delta" && part.usage?.output_tokens) {
          usage.output_tokens = part.usage.output_tokens
        }
      }

      const res = {
        content,
        role,
        usage,
      }

      onComplete(res)
    } catch (error) {
      console.error(error)
      onError(error)
    }
  }

  const wrapped = monitor.wrapModel(
    // @ts-ignore
    (...args) => createMessage.apply(anthropic.messages, args),
    {
      nameParser: (request) => request.model,
      inputParser: (request) => {
        const messages = request.messages.map(parseAnthropicMessage)
        // Parse system message using the same parser for consistency
        if (request.system) {
          messages.unshift(
            parseAnthropicMessage({
              role: "system",
              content: request.system,
            })
          )
        }
        return messages
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
        return metadata
      },
      outputParser: (res: Anthropic.Message) => parseAnthropicMessage(res),
      tokensUsageParser: async (res: Anthropic.Message) => {
        return {
          completion: res.usage?.output_tokens,
          prompt: res.usage?.input_tokens,
        }
      },
      tagsParser: (request) => {
        const t = request.tags
        delete request.tags
        return t
      },
      userIdParser: (request) => {
        const userId = request.userId
        delete request.userId
        return userId
      },
      userPropsParser: (request) => {
        const props = request.userProps
        delete request.userProps
        return props
      },
      templateParser: (request) => {
        const templateId = request.templateId
        delete request.templateId
        delete request.prompt
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
    }
  )

  // Fix the type error by using type assertion through unknown
  const wrappedAnthropicMessages = anthropic.messages as any
  wrappedAnthropicMessages.create = wrapped
  // Leave stream() unwrapped since we're not handling streaming
  //   wrappedAnthropicMessages.stream = anthropic.messages.stream

  return anthropic as unknown as WrappedAnthropic<T>
}
