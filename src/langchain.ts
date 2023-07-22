import { BaseCallbackHandler } from "langchain/callbacks"
import { LLMResult, BaseChatMessage } from "langchain/schema"
import LLMonitor from "./llmonitor"
import { LLMessage } from "./types"

// Langchain outputs are highly inconsistents
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
// Sometimes:
// {
//   text: "Bonjour, comment ça va ?",
//   message: AIChatMessage {
//     text: "Bonjour, comment ça va ?",
//     name: undefined,
//     additional_kwargs: { function_call: undefined }
//   }
// }

const messageAdapter = (llmMessage: any): any => {
  if (Array.isArray(llmMessage)) {
    if (llmMessage.length === 1) return messageAdapter(llmMessage[0])
    else return llmMessage.map(messageAdapter)
  } else {
    let obj = llmMessage.message || llmMessage

    if (typeof obj.toJSON === "function") {
      // For instances of BaseChatMessage
      obj = obj.toJSON()
    }

    const role = obj.type
    const text = obj.text || obj.content || obj.data?.content
    const kwargs = obj.additional_kwargs || obj.data.additional_kwargs

    return {
      role,
      text,
      ...kwargs,
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

    const modelName = this.params?.modelName as string

    // Create copy of params without modelName
    const copiedArgs = { ...this.params }
    delete copiedArgs.modelName

    this.monitor.llmStart({
      runId,
      parentRunId,
      name: modelName,
      input: prompts,
      extra: copiedArgs,
    })
  }

  // handleLLMStart won't be called if the model is chat-style
  async handleChatModelStart(
    chat: any,
    messages: BaseChatMessage[][],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown> // Params as sent to OpenAI
  ) {
    if (this.params.streaming) {
      this.streamingState[runId] = false
    }

    const modelName = this.params?.modelName as string
    delete this.params?.modelName

    this.monitor.llmStart({
      runId,
      parentRunId,
      input: messageAdapter(messages[0]), // TODO: handle multiple completions at the same time
      name: modelName,
      extra: this.params,
    })
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
      this.monitor.streamingStart({ runId, parentRunId })
    }
  }

  async handleLLMError?(
    error: Error,
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    this.monitor.llmError({ runId, parentRunId, error })
  }

  async handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string) {
    const { generations, llmOutput } = output

    this.monitor.llmEnd({
      runId,
      output: messageAdapter(generations),
      promptTokens: llmOutput?.tokenUsage?.promptTokens,
      completionTokens: llmOutput?.tokenUsage?.completionTokens,
    })
  }

  async handleToolStart(
    tool: any,
    input: string,
    runId: string,
    parentRunId?: string
  ) {
    this.monitor.toolStart({ runId, parentRunId, name: tool.name, input })
  }

  // TODO: what is parentRunId for? agent id?
  async handleToolError(error: any, runId: string, parentRunId?: string) {
    this.monitor.toolError({ runId, parentRunId, error })
  }

  async handleToolEnd(output: string, runId: string, parentRunId?: string) {
    this.monitor.toolEnd({ runId, parentRunId, output })
  }
}
