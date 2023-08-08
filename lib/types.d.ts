import { BaseChatModel } from "langchain/chat_models/base";
import { BaseLanguageModel } from "langchain/base_language";
import { Tool, StructuredTool } from "langchain/tools";
export type cJSON = string | number | boolean | {
    [x: string]: cJSON;
} | Array<JSON>;
export interface LLMonitorOptions {
    appId?: string;
    userId?: string;
    userProps?: cJSON;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
export type EventType = "log" | "tool" | "agent" | "llm" | "convo" | "chain";
export type EventName = "start" | "end" | "error" | "info" | "warn";
export interface Event {
    type: EventType;
    event: EventName;
    app: string;
    timestamp: number;
    userId?: string;
    userProps?: cJSON;
    parentRunId?: string;
    extra?: cJSON;
    error?: {
        message: string;
        stack?: string;
    };
}
export type TokenUsage = {
    completion: number;
    prompt: number;
};
export interface RunEvent extends Event {
    runId: string;
    input?: cJSON;
    output?: cJSON;
    tokensUsage?: TokenUsage;
    [key: string]: unknown;
}
export interface LogEvent extends Event {
    message: string;
}
export interface ChatMessage {
    role: "human" | "ai" | "generic" | "system" | "function";
    text: string;
    function_call?: cJSON;
    [key: string]: cJSON;
}
export type WrapParams = {
    name?: string;
    inputParser?: (...any: any[]) => cJSON;
    outputParser?: (...any: any[]) => cJSON;
    tokensUsageParser?: (...any: any[]) => TokenUsage;
    extra?: cJSON;
    tags?: string[];
};
export type ConstructorParameters<T> = T extends new (...args: infer U) => any ? U : never;
export type MethodParameters<T> = T extends (...args: infer U) => any ? U : never;
export type MethodReturn<T> = T extends (...args: any[]) => infer R ? R : never;
export type EntityToMonitor = BaseLanguageModel | BaseChatModel | Tool | StructuredTool;
