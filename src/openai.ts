import { OpenAIApi } from "openai"
import { cleanExtra, parseOpenaiMessage } from "src/utils"
import LLMonitor from "./llmonitor"

export function monitorOpenAi(
  openai: OpenAIApi,
  llmonitor: LLMonitor,
  tags?: string[]
) {
  const originalCreateChatCompletion = openai.createChatCompletion.bind(openai)

  openai.createChatCompletion = llmonitor.wrapModel(
    originalCreateChatCompletion,
    {
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
      tags,
    }
  )
}
