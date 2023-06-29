import { BaseCallbackHandler } from "langchain/callbacks"
import LLMonitor from "./index"

// TODO: set convoId with a helper state that compares chat history
export class LLMonitorCallbackHandler extends BaseCallbackHandler {
  name = "llmonitor"
  private streamingState = {} as Record<string, boolean>
  private params = {} as Record<string, unknown>
  private monitor: LLMonitor

  constructor(args: any) {
    super(...args)
    this.monitor = args.monitor || new LLMonitor()
    this.params = args
  }

  async handleLLMStart(
    llm: { name: string },
    prompts: string[],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    if (this.params.streaming) {
      this.streamingState[runId] = false
    }

    this.monitor.llmStart({ runId, messages: prompts, input: this.params })

    console.log("llm:start", llm.name, prompts, runId, parentRunId, extraParams)
  }

  // handleLLMStart won't be called if the model is chat-style
  async handleChatModelStart(
    chat: { name: string },
    messages: any[][],
    runId: string,
    parentRunId?: string,
    extraParams?: Record<string, unknown>
  ) {
    if (this.params.streaming) {
      this.streamingState[runId] = false
    }

    this.monitor.llmStart({ runId, messages, input: this.params })

    console.log("chat:start", chat.name, runId, messages, parentRunId, "\n")
  }

  // Used to calculate latency to first token
  async handleLLMNewToken(token: string, runId: string, parentRunId?: string) {
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
    console.error("llm:error", error, runId, parentRunId, extraParams)

    this.monitor.llmError({ runId, error })
  }

  async handleLLMEnd(output: any, runId: string, parentRunId?: string) {
    const { generations, llmOutput } = output
    const { promptTokens, completionTokens } = llmOutput

    console.log("llm:end", output, runId, parentRunId)

    this.monitor.llmEnd({
      runId,
      output: generations,
      promptTokens,
      completionTokens,
    })
  }

  async handleToolStart(
    tool: { name: string },
    input: string,
    runId: string,
    parentRunId?: string
  ) {
    console.log("tool:start", tool.name, input, runId, parentRunId, "\n")

    this.monitor.toolStart({ runId, name: tool.name, input })
  }

  async handleToolError(error: any, runId: string, parentRunId?: string) {
    console.log("tool:error", error, runId, parentRunId, "\n")

    this.monitor.toolError({ runId, error })
  }

  async handleToolEnd(output: string, runId: string, parentRunId?: string) {
    console.log("tool:end", output, runId, parentRunId, "\n")

    this.monitor.toolEnd({ runId, output })
  }
}

const ARGS_TO_REPORT = [
  "temperature",
  "modelName",
  "streaming",
  "tags",
  "streaming",
]

// Extends Langchain's LLM classes like ChatOpenAI
// TODO: test with non-chat classes see if it works (should)
export const extendModel = (baseClass: any): any =>
  // TODO: get vendor from (lc_namespace: [ "langchain", "chat_models", "openai" ])

  class extends baseClass {
    constructor(...args: any[]) {
      const interestingArgs = ARGS_TO_REPORT.reduce((acc, arg) => {
        if (args[0][arg]) acc[arg] = args[0][arg]
        return acc
      }, {} as Record<string, unknown>)

      args[0].callbacks = [new LLMonitorCallbackHandler(interestingArgs)]
      super(...args)
    }
  }
