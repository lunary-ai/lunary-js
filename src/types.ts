import { BaseChatModel } from "langchain/chat_models/base"
import { BaseLanguageModel } from "langchain/base_language"
import { Tool, StructuredTool } from "langchain/tools"
import { OpenAIApi } from "openai"

// using 'JSON' causes problems with esbuild (probably because a type JSON alrady exists)
export type cJSON =
  | string
  | number
  | boolean
  | { [x: string]: cJSON }
  | Array<cJSON>

export interface LLMonitorOptions {
  appId?: string
  userId?: string
  userProps?: cJSON
  apiUrl?: string
  log?: boolean
  name?: string
}

export type EventType = "log" | "tool" | "agent" | "llm" | "convo" | "chain"
export type EventName = "start" | "end" | "error" | "info" | "warn"

export interface Event {
  type: EventType
  event: EventName
  app: string
  timestamp: number
  userId?: string
  userProps?: cJSON
  parentRunId?: string
  extra?: cJSON
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
  input?: cJSON
  output?: cJSON
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
  function_call?: cJSON
  [key: string]: cJSON
}

export type WrappableFn = (...args: any[]) => Promise<any>

export type WrapParams<T extends WrappableFn> = {
  name?: string
  inputParser?: (...args: Parameters<T>) => cJSON
  extraParser?: (...args: Parameters<T>) => cJSON
  nameParser?: (...args: Parameters<T>) => string

  outputParser?: (result: Awaited<ReturnType<T>>) => cJSON
  tokensUsageParser?: (result: Awaited<ReturnType<T>>) => TokenUsage
  extra?: cJSON
  tags?: string[]
}

export type EntityToMonitor =
  | BaseLanguageModel
  | BaseChatModel
  | OpenAIApi
  | Tool
  | StructuredTool
