export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    agentRunId?: string;
    userId?: string;
    apiUrl?: string;
    log?: boolean;
}
export interface Event {
    [key: string]: any;
}
export type ChatMessage = any;
export type LLMInput = any;
export type LLMOutput = any;
