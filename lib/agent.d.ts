import LLMonitor from "./index";
import { LLMonitorOptions } from "./types";
type AgentProps = LLMonitorOptions & {
    name?: string;
    tags?: string[];
};
export declare class AgentMonitor extends LLMonitor {
    constructor(options: AgentProps);
}
export {};
