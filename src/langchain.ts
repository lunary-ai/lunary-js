import { ChatOpenAI } from "langchain/chat_models/openai"
import { Tool } from "langchain/tools"

import LLMonitor from "src/llmonitor"
import { cleanExtra, parseLangchainMessages } from "src/utils"

// TODO: type with other chat models (not basechat/llm, but an union of all chat models)
export function monitorLangchainLLM(
  chat: ChatOpenAI,
  llmonitor: LLMonitor,
  tags?: string[]
) {
  const originalGenerate = chat.generate.bind(chat)

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

  chat.generate = llmonitor.wrapModel(originalGenerate, {
    name,
    inputParser: (messages) => parseLangchainMessages(messages), // Input message will be the first argument
    outputParser: ({ generations }) => parseLangchainMessages(generations),
    tokensUsageParser: ({ llmOutput }) => ({
      completion: llmOutput?.tokenUsage?.completionTokens,
      prompt: llmOutput?.tokenUsage?.promptTokens,
    }),
    extra,
    tags: tags || chat.tags,
  })
}

export function monitorLangchainTool(
  tool: Tool,
  llmonitor: LLMonitor,
  tags?: string[]
) {
  const originalCall = tool.call

  tool.call = llmonitor.wrapTool(originalCall, {
    name: tool.name,
    inputParser: (arg) => (arg[0] instanceof Object ? arg[0].input : arg),
    tags,
  })
}
