import LLMonitor from "./llmonitor"
import { LLMonitorOptions, EventType, Event } from "./types"

/**
 * ToolMonitor is a wrapper around LLMonitor that adds a few methods for tracking custom tools.
 * @example
 * const monitor = new ToolMonitor({ name: "translator" })
 *
 * const Chat = monitor.extendModel(ChatOpenAI)
 * const chat = new Chat({
 *    temperature: 0.2,
 *    monitor,
 * })
 *
 * const tool = monitor.wrapExecutor(async (input: string) => {
 *
 *  monitor.log("Starting translator tool")
 *
 *  return res
 * })
 *
 * const result = await tool("Bonjour, comment allez-vous?")
 */
export class ToolMonitor extends LLMonitor {
  private name: string | undefined
  private toolRunId: string | undefined

  constructor(options: Partial<LLMonitorOptions> = {}) {
    super(options)
    this.name = options.name
  }

  trackEvent(type: EventType, data: Partial<Event> = {}) {
    return super.trackEvent(type, {
      ...data,
      toolRunId: this.toolRunId,
    })
  }

  /*
   * Wrap an agent Promise to track it's input, results and any errors.
   * @param {string} name - Agent name
   * @param {Promise} func - Agent function
   **/
  wrapExecutor<T extends (...args: any[]) => Promise<any>>(func: T) {
    return async (...args: Parameters<T>) => {
      this.toolRunId = crypto.randomUUID()

      this.toolStart({
        name: this.name,
        input: args.length === 1 ? args[0] : args,
        toolRunId: this.toolRunId,
      })

      try {
        const result = await func(...args)

        this.toolEnd({
          output: result,
          toolRunId: this.toolRunId,
        })

        return result
      } catch (error) {
        this.toolError({
          toolRunId: this.toolRunId,
          error,
        })

        throw error
      }
    }
  }
}
