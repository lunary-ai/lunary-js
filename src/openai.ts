import { AxiosRequestConfig } from "axios"
import { CreateChatCompletionRequest, OpenAIApi } from "openai"
import { cleanError, cleanExtra } from "src/utils"
import LLMonitor from "./llmonitor"
import ctx from "src/context"

export function monitorOpenAi(openai: OpenAIApi, llmonitor: LLMonitor) {
  const originalCreateChatCompletion = openai.createChatCompletion

  openai.createChatCompletion = async function (
    request: CreateChatCompletionRequest,
    options?: AxiosRequestConfig
  ) {
    const runId = crypto.randomUUID()
    const input = request.messages
    const { model: name } = request

    const rawExtra = {
      temperature: request.temperature,
      maxTokens: request.max_tokens,
      frequencyPenalty: request.frequency_penalty,
      presencePenalty: request.presence_penalty,
      stop: request.stop,
    }
    const extra = cleanExtra(rawExtra)

    const event = { name, input, runId, extra }

    try {
      llmonitor.trackEvent("llm", "start", event)
      const rawOutput = await ctx.callAsync<
        ReturnType<typeof originalCreateChatCompletion>
      >(runId, () =>
        originalCreateChatCompletion.apply(this, [request, options])
      )

      const output = rawOutput.data.choices[0]
      llmonitor.trackEvent("llm", "end", { ...event, output })

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
