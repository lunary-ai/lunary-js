import { AxiosRequestConfig } from "axios"
import { CreateChatCompletionRequest, OpenAIApi } from "openai"
import ctx from "src/context"
import { cleanError, cleanExtra, parseOpenaiMessage } from "src/utils"
import LLMonitor from "./llmonitor"

export function monitorOpenAi(openai: OpenAIApi, llmonitor: LLMonitor) {
  const originalCreateChatCompletion = openai.createChatCompletion

  openai.createChatCompletion = async function (
    request: CreateChatCompletionRequest,
    options?: AxiosRequestConfig
  ) {
    const runId = crypto.randomUUID()
    const input = request.messages.map(parseOpenaiMessage)
    const { model: name } = request

    const rawExtra = {
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      frequencyPenalty: request.frequency_penalty,
      presencePenalty: request.presence_penalty,
      stop: request.stop,
    }
    const extra = cleanExtra(rawExtra)
    const tags = ["test-tag"]

    const event = { name, input, runId, extra, tags }

    try {
      llmonitor.trackEvent("llm", "start", event)
      const rawOutput = await ctx.callAsync<
        ReturnType<typeof originalCreateChatCompletion>
      >(runId, () =>
        originalCreateChatCompletion.apply(this, [request, options])
      )

      const { data } = rawOutput
      const output = parseOpenaiMessage(data.choices[0].message)

      const tokensUsage = {
        completion: data.usage?.completion_tokens,
        prompt: data.usage?.prompt_tokens,
      }

      llmonitor.trackEvent("llm", "end", { ...event, output, tokensUsage })

      return rawOutput
    } catch (error: unknown) {
      llmonitor.trackEvent("llm", "error", {
        runId,
        name,
        error: cleanError(error),
      })

      throw error
    }
  }
}
