import { Callbacks } from "langchain/callbacks"
import { ChatOpenAI, ChatOpenAICallOptions } from "langchain/chat_models/openai"
import { BaseMessage, LLMResult } from "langchain/schema"
import ctx from "src/context"
import LLMonitor from "src/llmonitor"
import { cleanError, cleanExtra, parseLangchainMessages } from "src/utils"

// TODO: type with other chat models (not basechat/llm, but an union of all chat models)
export function monitorLangchainLLM(
  chat: ChatOpenAI,
  llmonitor: LLMonitor,
  tags?: string[]
) {
  const originalGenerate = chat.generate

  chat.generate = async function (
    messages: BaseMessage[][],
    options?: ChatOpenAICallOptions | string[],
    callbacks?: Callbacks
  ) {
    const runId = crypto.randomUUID()
    const input = parseLangchainMessages(messages)
    const { modelName: name } = chat

    const rawExtra = {
      temperature: chat.temperature,
      maxTokens: chat.maxTokens,
      frequencyPenalty: chat.frequencyPenalty,
      presencePenalty: chat.presencePenalty,
      stop: chat.stop,
      timeout: chat.timeout,
      modelKwargs: Object.keys(chat.modelKwargs || {}).length
        ? chat.modelKwargs
        : undefined,
    }
    const extra = cleanExtra(rawExtra)

    const event = { name, input, runId, extra, tags }

    try {
      llmonitor.trackEvent("llm", "start", event)

      const rawOutput = await ctx.callAsync<LLMResult>(runId, () =>
        originalGenerate.apply(this, [messages, options, callbacks])
      )

      const output = parseLangchainMessages(rawOutput.generations)

      const tokensUsage = {
        completion: rawOutput.llmOutput?.tokenUsage?.completionTokens,
        prompt: rawOutput.llmOutput?.tokenUsage?.promptTokens,
      }

      //@ts-ignore
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
