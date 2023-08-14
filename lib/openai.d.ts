import { OpenAIApi } from "openai";
import LLMonitor from "./llmonitor";
import { WrapExtras } from "./types";
export declare function monitorOpenAi(baseClass: typeof OpenAIApi, llmonitor: LLMonitor, params: WrapExtras): void;
