import LLMonitor from "./llmonitor";
import { LLMonitorOptions, EventType, Event } from "./types";
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
export declare class ToolMonitor extends LLMonitor {
    private name;
    private toolRunId;
    constructor(options?: Partial<LLMonitorOptions>);
    trackEvent(type: EventType, data?: Partial<Event>): Promise<void>;
    wrapExecutor<T extends (...args: any[]) => Promise<any>>(func: T): (...args: Parameters<T>) => Promise<any>;
}
