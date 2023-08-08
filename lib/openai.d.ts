import { OpenAIApi } from "openai";
import LLMonitor from "./llmonitor";
export declare function monitorOpenAi(baseClass: typeof OpenAIApi, llmonitor: LLMonitor, tags?: string[]): void;
