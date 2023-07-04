import LLMonitor from "./llmonitor"
import { LLMonitorOptions } from "./types"

/**
 * AgentMonitor is a wrapper around LLMonitor that adds a few methods for tracking custom agents.
 * @example
 * const monitor = new AgentMonitor({ name: "translator" })
 *
 * const Chat = monitor.extendModel(ChatOpenAI)
 * const chat = new Chat({
 *    temperature: 0.2,
 *    monitor,
 * })
 *
 * const agent = monitor.wrapExecutor(async (input: string) => {
 *
 *  monitor.log("Starting translator agent")
 *
 *  const res = await chat.call([
 *    new SystemChatMessage("You are a translator agent."),
 *    new HumanChatMessage(`Translate this sentence from English to French. ${input}`),
 *  ])
 *
 *  return res
 * })
 *
 * const result = await agent("Bonjour, comment allez-vous?")
 */
export class AgentMonitor extends LLMonitor {
  private name: string | undefined
  private agentRunId: string | undefined

  constructor(options: Partial<LLMonitorOptions> = {}) {
    super(options)
    this.name = options.name
  }

  trackEvent(type: string, data: Partial<Event> = {}) {
    return super.trackEvent(type, {
      ...data,
      agentRunId: this.agentRunId,
    })
  }

  /*
   * Wrap an agent Promise to track it's input, results and any errors.
   * @param {string} name - Agent name
   * @param {Promise} func - Agent function
   */
  wrapExecutor<T extends (...args: any[]) => Promise<any>>(func: T) {
    return async (...args: Parameters<T>) => {
      this.agentRunId = crypto.randomUUID()

      this.agentStart({
        name: this.name,
        input: args,
        agentRunId: this.agentRunId,
      })

      try {
        const result = await func(...args)

        this.agentEnd({
          output: result,
          agentRunId: this.agentRunId,
        })

        return result
      } catch (error) {
        this.agentError({
          error,
          agentRunId: this.agentRunId,
        })

        throw error
      }
    }
  }
}
