export type JSON = string | number | boolean | {
    [x: string]: JSON;
} | Array<JSON>;
export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    parentRunId?: string;
    userId?: string;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
export type EventType = "log" | "tool" | "agent" | "llm" | "convo" | "chain";
export interface Event {
    type: EventType;
    app: string;
    timestamp: number;
    event: string;
    parentRunId?: string;
    extra?: JSON;
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
    input?: JSON;
    output?: JSON;
    tokensUsage?: TokenUsage;
    [key: string]: unknown;
}
export interface LogEvent extends Event {
    message: string;
}
export interface ChatMessage {
    role: "human" | "ai" | "generic" | "system" | "function";
    text: string;
    function_call?: JSON;
    [key: string]: JSON;
}
export type WrapParams = {
    name?: string;
    inputParser?: (...any: any[]) => JSON;
    outputParser?: (...any: any[]) => JSON;
    tokensUsageParser?: (...any: any[]) => TokenUsage;
    extra?: JSON;
    tags?: string[];
};
export type ConstructorParameters<T> = T extends new (...args: infer U) => any ? U : never;
export type MethodParameters<T> = T extends (...args: infer U) => any ? U : never;
export type MethodReturn<T> = T extends (...args: any[]) => infer R ? R : never;
