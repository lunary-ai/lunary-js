import { ChatOpenAI } from "langchain/chat_models/openai"
import { Tool } from "langchain/tools"

import LLMonitor from "./llmonitor"
import { cleanExtra, parseLangchainMessages } from "./utils"
import { WrapExtras } from "./types"

// TODO: type with other chat models (not basechat/llm, but an union of all chat models)
export function monitorLangchainLLM(
  baseClass: typeof ChatOpenAI,
  llmonitor: LLMonitor,
  params: WrapExtras
) {
  const originalGenerate = baseClass.prototype.generate

  Object.assign(baseClass.prototype, {
    generate: async function (
      ...args: Parameters<typeof originalGenerate>
    ): ReturnType<typeof originalGenerate> {
      const chat = this

      // Bind the original method to the instance
      const boundSuperGenerate = originalGenerate.bind(chat)

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

      // Some chat classes use the `model` property, others use `modelName`
      // @ts-ignore
      const name = chat.modelName || chat.model

      return llmonitor.wrapModel(boundSuperGenerate, {
        name,
        inputParser: (messages) => parseLangchainMessages(messages), // Input message will be the first argument
        outputParser: ({ generations }) => parseLangchainMessages(generations),
        tokensUsageParser: ({ llmOutput }) => ({
          completion: llmOutput?.tokenUsage?.completionTokens,
          prompt: llmOutput?.tokenUsage?.promptTokens,
        }),
        extra,
        ...params,
        tags: params.tags || chat.tags,
      })(...args)
    },
  })
}

export function monitorLangchainTool(
  baseClass: typeof Tool,
  llmonitor: LLMonitor,
  params: WrapExtras
) {
  // Keep a reference to the original method
  const originalCall = baseClass.prototype.call

  // Replace the original method with the new one
  Object.assign(baseClass.prototype, {
    call: async function (
      ...args: Parameters<typeof originalCall>
    ): ReturnType<typeof originalCall> {
      // Use 'this' to reference the instance

      // Bind the original method to the instance
      const boundSuperCall = originalCall.bind(this)

      return llmonitor.wrapTool(boundSuperCall, {
        name: this.name,
        inputParser: (arg) => (arg[0] instanceof Object ? arg[0].input : arg),
        ...params,
      })(...args)
    },
  })
}
