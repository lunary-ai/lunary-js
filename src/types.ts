import { BaseChatModel } from "langchain/chat_models/base"
import { BaseLanguageModel } from "langchain/base_language"
import { Tool, StructuredTool } from "langchain/tools"
import { OpenAIApi } from "openai"
import { ChatOpenAI } from "langchain/chat_models/openai"

// using 'JSON' causes problems with esbuild (probably because a type JSON alrady exists)
export type cJSON =
  | string
  | number
  | boolean
  | { [x: string]: cJSON }
  | Array<cJSON>

export interface LLMonitorOptions {
  appId?: string
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

export type WrappableFn = (...args: any[]) => any

export type Identify<T extends WrappableFn> = (
  userId: string,
  userProps?: cJSON
) => ReturnType<T>

// Create a type for the function returning that promise
export type WrappedFn<T extends WrappableFn> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>> & {
  identify: Identify<T>
}

export type WrapExtras = {
  name?: string
  extra?: cJSON
  tags?: string[]
  userId?: string
  userProps?: cJSON
}

export type WrapParams<T extends WrappableFn> = {
  inputParser?: (...args: Parameters<T>) => cJSON
  extraParser?: (...args: Parameters<T>) => cJSON
  nameParser?: (...args: Parameters<T>) => string
  outputParser?: (result: Awaited<ReturnType<T>>) => cJSON
  tokensUsageParser?: (result: Awaited<ReturnType<T>>) => TokenUsage
} & WrapExtras

export type EntityToMonitor =
  | typeof BaseLanguageModel
  | typeof BaseChatModel
  | typeof ChatOpenAI
  | typeof OpenAIApi
  | typeof Tool
  | typeof StructuredTool
