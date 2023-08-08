import { OpenAIApi } from "openai"
import { cleanExtra, parseOpenaiMessage } from "src/utils"
import LLMonitor from "./llmonitor"

export function monitorOpenAi(
  baseClass: typeof OpenAIApi,
  llmonitor: LLMonitor,
  tags?: string[]
) {
  // Keep a reference to the original method
  const originalCreateChatCompletion = baseClass.prototype.createChatCompletion

  // Replace the original method with the new one
  baseClass.prototype.createChatCompletion = async function (
    ...args: Parameters<typeof originalCreateChatCompletion>
  ): ReturnType<typeof originalCreateChatCompletion> {
    // Use 'this' to reference the instance

    // Bind the original method to the instance
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
      tags,
    })(...args)
  }
}
