import { OpenAIApi } from "openai"
import { cleanExtra, parseOpenaiMessage } from "src/utils"
import LLMonitor from "./llmonitor"
import { WrapExtras } from "./types"

export function monitorOpenAi(
  baseClass: typeof OpenAIApi,
  llmonitor: LLMonitor,
  params: WrapExtras
) {
  const originalCreateChatCompletion = baseClass.prototype.createChatCompletion

  Object.assign(baseClass.prototype, {
    createChatCompletion(
      ...args: Parameters<typeof originalCreateChatCompletion>
    ) {
      const boundCompletion = originalCreateChatCompletion.bind(this)

      return llmonitor.wrapModel(boundCompletion, {
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
        outputParser: ({ data }) => parseOpenaiMessage(data.choices[0].message),
        tokensUsageParser: ({ data }) => ({
          completion: data.usage?.completion_tokens,
          prompt: data.usage?.prompt_tokens,
        }),
        ...params,
      })(...args)
    },
  })
}
