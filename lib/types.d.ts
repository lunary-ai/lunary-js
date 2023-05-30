import { BaseChatMessage as LangchainChatMessage } from "langchain/schema";
export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    convoTags?: string;
    apiUrl?: string;
    log?: boolean;
}
export interface Event {
    type: string;
    app: string;
    convo: string;
    timestamp: number;
    tags?: string[];
    message?: string;
    history?: any;
    extra?: any;
    model?: string;
}
export type ChatMessage = LangchainChatMessage | {
    role: "assistant" | "user" | "system";
    text: string;
} | {
    role: "assistant" | "user" | "system";
    content: string;
};
export type LLMInput = ChatMessage[] | string;
export type LLMOutput = ChatMessage | string;
