import { BaseChatMessage as LangchainChatMessage } from "langchain/schema"

export interface LLMonitorOptions {
  appId?: string
  convoId?: string
  agentRunId?: string
  toolRunId?: string
  userId?: string
  apiUrl?: string
  log?: boolean
  name?: string
}

export interface Event {
  type: string
  app: string
  event?: string
  agentRunId?: string
  toolRunId?: string
  convo?: string
  level?: "info" | "warn" | "error"
  timestamp: number
  input?: any
  output?: any
  extra?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
}

// Same as Langchain's
type MessageType = "human" | "ai" | "generic" | "system" | "function"

// export interface Event {
//   [key: string]: any
// }

// Inspired from OpenAi's format, less heavy than Langchain's type
export type ChatMessage = {
  role: MessageType
  text: string
  function_call?: any
  [key: string]: unknown
}

export type LLMessage = ChatMessage | ChatMessage[] | string | string[]
