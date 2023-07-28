export interface LLMonitorOptions {
  appId?: string
  convoId?: string
  parentRunId?: string
  userId?: string
  apiUrl?: string
  log?: boolean
  name?: string
}

export type EventType = "log" | "tool" | "agent" | "llm" | "convo" | "chain"

export interface Event {
  type: EventType
  app: string
  timestamp: number
}

export interface RunEvent extends Event {
  runId: string
  parentRunId?: string
  input?: any
  output?: any
  message?: string
  extra?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
  [key: string]: unknown
}

export interface LogEvent extends Event {
  level: string
  runId?: string
  message: string
  extra: Record<string, unknown>
  error: {
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

// Keep the types when wrapping
export type ConstructorParameters<T> = T extends new (...args: infer U) => any
  ? U
  : never
export type MethodParameters<T> = T extends (...args: infer U) => any
  ? U
  : never
export type MethodReturn<T> = T extends (...args: any[]) => infer R ? R : never
