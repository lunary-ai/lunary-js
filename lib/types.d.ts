export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    parentRunId?: string;
    userId?: string;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
export type EventType = "log" | "tool" | "agent" | "llm" | "convo";
export interface Event {
    type: EventType;
    app: string;
    event?: string;
    runId?: string;
    parentRunId?: string;
    convo?: string;
    timestamp: number;
    input?: any;
    output?: any;
    message?: string;
    extra?: Record<string, unknown>;
    error?: {
        message: string;
        stack?: string;
    };
    [key: string]: unknown;
}
type MessageType = "human" | "ai" | "generic" | "system" | "function";
export type ChatMessage = {
    role: MessageType;
    text: string;
    function_call?: any;
    [key: string]: unknown;
};
export type LLMessage = ChatMessage | ChatMessage[] | string | string[];
export {};
