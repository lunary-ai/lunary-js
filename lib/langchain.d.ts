import { BaseCallbackHandler } from "langchain/callbacks";
export declare class LLMonitorCallbackHandler extends BaseCallbackHandler {
    name: string;
    private streamingState;
    private params;
    private monitor;
    constructor(args: any);
    handleLLMStart(llm: {
        name: string;
    }, prompts: string[], runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleChatModelStart(chat: {
        name: string;
    }, messages: any[][], runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleLLMNewToken(token: string, runId: string, parentRunId?: string): Promise<void>;
    handleLLMError?(error: Error, runId: string, parentRunId?: string, extraParams?: Record<string, unknown>): Promise<void>;
    handleLLMEnd(output: any, runId: string, parentRunId?: string): Promise<void>;
    handleToolStart(tool: {
        name: string;
    }, input: string, runId: string, parentRunId?: string): Promise<void>;
    handleToolError(error: any, runId: string, parentRunId?: string): Promise<void>;
    handleToolEnd(output: string, runId: string, parentRunId?: string): Promise<void>;
}
export declare const extendModel: (baseClass: any) => any;
