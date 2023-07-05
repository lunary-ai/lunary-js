import { BaseCallbackHandler } from "langchain/callbacks"
import { LLMResult, BaseChatMessage } from "langchain/schema"
import LLMonitor from "./llmonitor"
import { LLMessage } from "./types"

// Langchain message don't seem consisten
// Sometimes:
// {
//   "type": "system",
//   "data": {
//     "content": "You are a translator agent.",
//     "additional_kwargs": {}
//   }
// },
// Sometimes:
//  {
//   "text": "Bonjour, comment ça va ?",
//   "message": {
//     "type": "ai",
//     "data": {
//       "content": "Bonjour, comment ça va ?",
//       "additional_kwargs": {}
//     }
//   }
// }

const messageAdapter = (llmMessage: any): any => {
  if (Array.isArray(llmMessage)) {
    if (llmMessage.length === 1) return messageAdapter(llmMessage[0])
    else return llmMessage.map(messageAdapter)
  } else {
    if (llmMessage.message) return messageAdapter(llmMessage.message)

    return {
      role: llmMessage.type,
      text: llmMessage.data.content,
      ...llmMessage.data.additional_kwargs,
    } as LLMessage
  }
}

// TODO: set convoId with a helper state that compares chat history
export class LLMonitorCallbackHandler extends BaseCallbackHandler {
  name = "llmonitor"
  private streamingState = {} as Record<string, boolean>
  private params = {} as Record<string, unknown>
  private monitor: LLMonitor

  constructor(monitor: LLMonitor, args: any) {
    super()

    this.monitor = monitor
    this.params = args
  }

  async handleLLMStart(
    llm: any,
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    if (this.params.streaming) {
      this.streamingState[runId] = false
    }

    this.monitor.llmStart({ runId, input: prompts, extra: this.params })

    // console.log("llm:start", llm.name, prompts, runId, parentRunId, extraParams)
  }

  // handleLLMStart won't be called if the model is chat-style
  async handleChatModelStart(
    chat: any,
    messages: BaseChatMessage[][],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    if (this.params.streaming) {
      this.streamingState[runId] = false
    }

    this.monitor.llmStart({
      runId,
      input: messageAdapter(messages[0]),
      extra: this.params,
    })

    // console.log("chat:start", chat.name, runId, messages, parentRunId, "\n")
  }

  // Used to calculate latency to first token
  async handleLLMNewToken(
    token: string,
    idx: any,
    runId: string,
    parentRunId?: string
  ) {
    // Track when streaming starts
    if (this.params.streaming && !this.streamingState[runId]) {
      this.streamingState[runId] = true
      this.monitor.streamingStart({ runId })
    }
  }

  async handleLLMError?(
    error: Error,
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    // console.error("llm:error", error, runId, parentRunId, extraParams)

    this.monitor.llmError({ runId, error })
  }

  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string) {
    const { generations, llmOutput } = output

    // console.log("llm:end", output, runId, parentRunId)

    this.monitor.llmEnd({
      runId,
      output: messageAdapter(generations),
      promptTokens: llmOutput?.promptTokens,
      completionTokens: llmOutput?.completionTokens,
    })
  }

  async handleToolStart(
    tool: any,
    input: string,
    runId: string,
    parentRunId?: string
  ) {
    this.monitor.toolStart({ toolRunId: runId, name: tool.name, input })
  }

  // TODO: what is parentRunId for? agent id?
  async handleToolError(error: any, runId: string, parentRunId?: string) {
    this.monitor.toolError({ toolRunId: runId, error })
  }

  async handleToolEnd(output: string, runId: string, parentRunId?: string) {
    this.monitor.toolEnd({ toolRunId: runId, output })
  }
}
