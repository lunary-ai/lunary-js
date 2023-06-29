import { BaseChatMessage as LangchainChatMessage } from "langchain/schema"

export interface LLMonitorOptions {
  appId?: string
  convoId?: string
  agentRunId?: string
  userId?: string
  apiUrl?: string
  log?: boolean
}

// export interface Event {
//   type: string
//   app: string
//   convo: string
//   level?: "info" | "warn" | "error"
//   timestamp: number
//   tags?: string[]
//   message?: string
//   history?: any
//   extra?: any
//   model?: string
// }

export interface Event {
  [key: string]: any
}

export type ChatMessage = any
// | LangchainChatMessage
// | {
//     role: "assistant" | "user" | "system"
//     text: string
//   }
// | {
//     role: "assistant" | "user" | "system"
//     content: string
//   }

/* For chat-style models (ie GPT-4), the input is an array of ChatMessage objects. */
export type LLMInput = any // ChatMessage[] | string

export type LLMOutput = any // ChatMessage | string
