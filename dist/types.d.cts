type cJSON = string | number | boolean | {
    [x: string]: cJSON;
} | Array<cJSON>;
interface LLMonitorOptions {
    appId?: string;
    apiUrl?: string;
    verbose?: boolean;
}
type EventType = "log" | "tool" | "agent" | "llm" | "convo" | "chain" | "retriever" | "embed" | "chat" | "convo";
type EventName = "start" | "end" | "error" | "info" | "warn" | "feedback";
interface Event {
    type: EventType;
    event: EventName;
    app: string;
    timestamp: number;
    userId?: string;
    userProps?: cJSON;
    parentRunId?: string;
    extra?: cJSON;
    tags?: string[];
    runtime?: string;
    error?: {
        message: string;
        stack?: string;
    };
}
type TokenUsage = {
    completion: number;
    prompt: number;
};
interface RunEvent extends Event {
    runId: string;
    input?: cJSON;
    output?: cJSON;
    tokensUsage?: TokenUsage;
    [key: string]: unknown;
}
interface LogEvent extends Event {
    message: string;
}
interface ChatMessage {
    role: "user" | "ai" | "system" | "function";
    text: string;
    functionCall?: {
        name: string;
        arguments: cJSON;
    };
    [key: string]: cJSON;
}
type WrapExtras = {
    name?: string;
    extra?: cJSON;
    tags?: string[];
    userId?: string;
    userProps?: cJSON;
};
type WrapParams<T extends WrappableFn> = {
    inputParser?: (...args: Parameters<T>) => cJSON;
    extraParser?: (...args: Parameters<T>) => cJSON;
    nameParser?: (...args: Parameters<T>) => string;
    outputParser?: (result: Awaited<ReturnType<T>>) => cJSON;
    tokensUsageParser?: (result: Awaited<ReturnType<T>>) => Promise<TokenUsage>;
    enableWaitUntil?: (...args: Parameters<T>) => boolean;
    waitUntil?: (result: Awaited<ReturnType<T>>, onComplete: (any: any) => any, onError: (any: any) => any) => ReturnType<T>;
} & WrapExtras;
type WrappableFn = (...args: any[]) => any;
type Identify<T extends WrappableFn> = (userId: string, userProps?: cJSON) => ReturnType<T>;
type WrappedReturn<T extends WrappableFn> = ReturnType<T> & {
    identify: Identify<T>;
};
type WrappedFn<T extends WrappableFn> = (...args: Parameters<T>) => WrappedReturn<T>;

export { ChatMessage, Event, EventName, EventType, Identify, LLMonitorOptions, LogEvent, RunEvent, TokenUsage, WrapExtras, WrapParams, WrappableFn, WrappedFn, WrappedReturn, cJSON };
