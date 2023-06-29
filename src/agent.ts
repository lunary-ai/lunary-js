import LLMonitor from "./index"
import { LLMonitorOptions } from "./types"

type AgentProps = LLMonitorOptions & { name?: string; tags?: string[] }

// Inits LLMonitor with a unique agentRunId
export class AgentMonitor extends LLMonitor {
  constructor(options: AgentProps) {
    const agentRunId = options?.agentRunId || crypto.randomUUID()

    // this.agent = new Agent(props)
    super({ ...options, agentRunId })

    this.agentStart({
      name: options?.name,
      tags: options?.tags,
    })
  }
}
