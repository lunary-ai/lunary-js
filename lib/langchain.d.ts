import { ChatOpenAI } from "langchain/chat_models/openai";
import LLMonitor from "src/llmonitor";
export declare function monitorLangchainLLM(chat: ChatOpenAI, llmonitor: LLMonitor, tags?: string[]): void;
