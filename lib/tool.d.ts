import LLMonitor from "./llmonitor";
/**
 * ToolMonitor is a wrapper around LLMonitor that adds a few methods for tracking custom agents.
 * @example
 * const monitor = new ToolMonitor({ name: "translator" })
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
export declare class ToolMonitor extends LLMonitor {
    private name;
    private toolRunId;
    trackEvent(type: string, data?: Partial<Event>): Promise<void>;
    wrapExecutor<T extends (...args: any[]) => Promise<any>>(func: T): (...args: Parameters<T>) => Promise<any>;
}
