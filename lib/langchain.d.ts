import { BaseCallbackHandler } from "langchain/callbacks";
import { LLMResult, BaseChatMessage } from "langchain/schema";
import LLMonitor from "./llmonitor";
export declare class LLMonitorCallbackHandler extends BaseCallbackHandler {
    name: string;
    private streamingState;
    private params;
    private monitor;
    constructor(monitor: LLMonitor, args: any);
    handleLLMStart(llm: any, prompts: string[], runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleChatModelStart(chat: any, messages: BaseChatMessage[][], runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleLLMNewToken(token: string, idx: any, runId: string, parentRunId?: string): Promise<void>;
    handleLLMError?(error: Error, runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleLLMEnd(output: LLMResult, runId: string, parentRunId?: string): Promise<void>;
    handleToolStart(tool: any, input: string, runId: string, parentRunId?: string): Promise<void>;
    handleToolError(error: any, runId: string, parentRunId?: string): Promise<void>;
    handleToolEnd(output: string, runId: string, parentRunId?: string): Promise<void>;
}
