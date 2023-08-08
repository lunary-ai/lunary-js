import { Callbacks } from "langchain/callbacks"
import { Tool } from "langchain/tools"
import { LLMonitor } from "src"
import ctx from "src/context"
import { cleanError } from "src/utils"

export function monitorTool(tool: Tool, llmonitor: LLMonitor) {
  const originalCall = tool.call

  tool.call = async function call(
    arg:
      | string
      | {
          input?: string
        },
    callbacks?: Callbacks
  ) {
    const runId = crypto.randomUUID()
    const input = arg instanceof Object ? arg.input : arg

    const event = {
      name: tool.name,
      input,
    }

    try {
      llmonitor.trackEvent("tool", "start", { ...event })

      const output = await ctx.callAsync<string>(runId, () =>
        originalCall.apply(this, [arg, callbacks])
      )

      llmonitor.trackEvent("llm", "end", {
        ...event,
        output,
      })

      return output
    } catch (error: unknown) {
      llmonitor.trackEvent("tool", "error", {
        runId,
        name: tool.name,
        error: cleanError(error),
      })

      throw error
    }
  }
}
