import { ChatOpenAI } from "langchain/chat_models/openai";
import { Tool } from "langchain/tools";
import LLMonitor from "src/llmonitor";
export declare function monitorLangchainLLM(baseClass: typeof ChatOpenAI, llmonitor: LLMonitor, tags?: string[]): void;
export declare function monitorLangchainTool(baseClass: typeof Tool, llmonitor: LLMonitor, tags?: string[]): void;
