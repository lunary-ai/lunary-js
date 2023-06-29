import LLMonitor from "./index";
import { LLMonitorOptions } from "./types";
type AgentProps = LLMonitorOptions & {
    name?: string;
    tags?: string[];
};
/**
 * AgentMonitor is a wrapper around LLMonitor that adds a few methods for tracking custom agents.
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
 * const wrappedAgent = monitor.wrapAgent("my-agent", translatorAgentRunner)
 *
 * const result = await wrappedAgent("Bonjour, comment allez-vous?")
 */
export declare class AgentMonitor extends LLMonitor {
    constructor(options: AgentProps);
    wrapAgent<T extends (...args: any[]) => Promise<any>>(name: string, func: T): (...args: Parameters<T>) => Promise<any>;
}
export {};
