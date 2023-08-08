import { OpenAIApi } from "openai";
import LLMonitor from "./llmonitor";
export declare function monitorOpenAi(openai: OpenAIApi, llmonitor: LLMonitor, tags?: string[]): void;
