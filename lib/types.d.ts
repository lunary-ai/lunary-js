export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    agentRunId?: string;
    toolRunId?: string;
    userId?: string;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
export interface Event {
    type: string;
    app: string;
    event?: string;
    agentRunId?: string;
    toolRunId?: string;
    convo?: string;
    level?: "info" | "warn" | "error";
    timestamp: number;
    input?: any;
    output?: any;
    message?: string;
    extra?: Record<string, unknown>;
    error?: {
        message: string;
        stack?: string;
    };
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
