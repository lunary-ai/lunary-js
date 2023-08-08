import { Tool } from "langchain/tools";
import LLMonitor from "src/llmonitor";
export declare function monitorTool(tool: Tool, llmonitor: LLMonitor, tags?: string[]): void;
