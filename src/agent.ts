import LLMonitor from "./index"
import { LLMonitorOptions } from "./types"

type AgentProps = LLMonitorOptions & { name?: string; tags?: string[] }

// Inits LLMonitor with a unique agentRunId
/**
 * AgentMonitor is a wrapper around LLMonitor that adds a few methods for tracking custom agents.
 * By using AgentMonitor, all sub LLM calls, tools and logs will be linked to the agent.
 * @example
 * const monitor = new AgentMonitor({ name: "translator" })
 *
 * const translatorAgentRunner = async (input: string) => {
 *  const chat = new ChatOpenAI({
 *    temperature: 0.2,
 *    monitor,
 *  })
 *
 *  const res = await chat.call([
 *    new SystemChatMessage("You are a translator agent."),
 *    new HumanChatMessage(`Translate this sentence from English to French. ${input}`),
 *  ])
 *
 *  return res
 * }
 *
 * const wrappedAgent = monitor.wrapExecutor(translatorAgentRunner)
 *
 * const result = await wrappedAgent("Bonjour, comment allez-vous?")
 */
export class AgentMonitor extends LLMonitor {
  constructor(options: AgentProps) {
    const agentRunId = options?.agentRunId || crypto.randomUUID()

    // this.agent = new Agent(props)
    super({ ...options, agentRunId })
  }

  /*
   * Wrap an agent Promise to track it's input, results and any errors.
   * @param {string} name - Agent name
   * @param {Promise} func - Agent function
   **/
  wrapExecutor<T extends (...args: any[]) => Promise<any>>(func: T) {
    return async (...args: Parameters<T>) => {
      this.agentStart({
        input: args,
      })

      try {
        const result = await func(...args)

        this.agentEnd({
          output: result,
        })

        return result
      } catch (error) {
        this.agentError({
          error,
        })

        throw error
      }
    }
  }
}
