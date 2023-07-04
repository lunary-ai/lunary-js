export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    agentRunId?: string;
    toolRunId?: string;
    userId?: string;
    apiUrl?: string;
    log?: boolean;
}
type MessageType = "human" | "ai" | "generic" | "system" | "function";
export interface Event {
    [key: string]: any;
}
export type ChatMessage = {
    role: MessageType;
    text: string;
    function_call?: any;
    [key: string]: unknown;
};
export type LLMessage = ChatMessage | ChatMessage[] | string | string[];
export {};
