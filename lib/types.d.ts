import { ChatMessage as LangchainChatMessage } from "langchain/schema";
export interface LLMonitorOptions {
    appId?: string;
    convoId?: string;
    convoType?: string;
    apiUrl?: string;
}
export type ChatMessage = LangchainChatMessage | {
    role: "assistant" | "user" | "system";
    text: string;
};
export type LLMInput = ChatMessage[] | string;
export type LLMOutput = ChatMessage | string;
