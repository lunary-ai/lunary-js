export type JSON =
  | string
  | number
  | boolean
  | { [x: string]: JSON }
  | Array<JSON>

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
  event: string
  parentRunId?: string
  extra?: JSON
  error?: {
    message: string
    stack?: string
  }
}

export type TokenUsage = {
  completion: number
  prompt: number
}

export interface RunEvent extends Event {
  runId: string
  input?: JSON
  output?: JSON
  tokensUsage?: TokenUsage
  [key: string]: unknown
}

export interface LogEvent extends Event {
  message: string
}

// Inspired from OpenAi's format, less heavy than Langchain's type
export interface ChatMessage {
  role: "human" | "ai" | "generic" | "system" | "function"
  text: string
  function_call?: JSON
  [key: string]: JSON
}

export type WrapParams = {
  name?: string
  inputParser?: (...any) => JSON
  outputParser?: (...any) => JSON
  tokensUsageParser?: (...any) => TokenUsage
}

// Keep the types when wrapping
export type ConstructorParameters<T> = T extends new (...args: infer U) => any
  ? U
  : never
export type MethodParameters<T> = T extends (...args: infer U) => any
  ? U
  : never
export type MethodReturn<T> = T extends (...args: any[]) => infer R ? R : never
