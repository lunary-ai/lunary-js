import { BaseChatMessage as LangchainChatMessage } from "langchain/schema"

export interface LLMonitorOptions {
  appId?: string
  convoId?: string
  convoType?: string
  apiUrl?: string
}

export type ChatMessage =
  | LangchainChatMessage
  | {
      role: "assistant" | "user" | "system"
      text: string
    }

/* For chat-style models (ie GPT-4), the input is an array of ChatMessage objects. */
export type LLMInput = ChatMessage[] | string

export type LLMOutput = ChatMessage | string
