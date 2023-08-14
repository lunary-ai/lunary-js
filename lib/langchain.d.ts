import { ChatOpenAI } from "langchain/chat_models/openai";
import { Tool } from "langchain/tools";
import LLMonitor from "src/llmonitor";
import { WrapExtras } from "./types";
export declare function monitorLangchainLLM(baseClass: typeof ChatOpenAI, llmonitor: LLMonitor, params: WrapExtras): void;
export declare function monitorLangchainTool(baseClass: typeof Tool, llmonitor: LLMonitor, params: WrapExtras): void;
