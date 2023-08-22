import { BaseChatModel } from 'langchain/chat_models/base';
import { BaseLanguageModel } from 'langchain/base_language';
import { Tool, StructuredTool } from 'langchain/tools';
import { OpenAIApi } from 'openai';
import { ChatOpenAI } from 'langchain/chat_models/openai';

type cJSON = string | number | boolean | {
    [x: string]: cJSON;
} | Array<cJSON>;
interface LLMonitorOptions {
    appId?: string;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
type TokenUsage = {
    completion: number;
    prompt: number;
};
type WrappableFn = (...args: any[]) => any;
type Identify<T extends WrappableFn> = (userId: string, userProps?: cJSON) => ReturnType<T>;
type WrappedFn<T extends WrappableFn> = (...args: Parameters<T>) => Promise<ReturnType<T>> & {
    identify: Identify<T>;
};
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
    tokensUsageParser?: (result: Awaited<ReturnType<T>>) => TokenUsage;
} & WrapExtras;
type EntityToMonitor = typeof BaseLanguageModel | typeof BaseChatModel | typeof ChatOpenAI | typeof OpenAIApi | typeof Tool | typeof StructuredTool;

declare class LLMonitor {
    appId?: string;
    logConsole?: boolean;
    apiUrl?: string;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     */
    constructor();
    load({ appId, log, apiUrl }?: LLMonitorOptions): void;
    /**
     * Attach LLMonitor to an entity (Langchain Chat/LLM/Tool classes, OpenAI class)
     * @param {EntityToMonitor | [EntityToMonitor]} entities - Entity or array of entities to monitor
     * @param {string[]} tags - (optinal) Tags to add to all events
     * @example
     * const chat = new ChatOpenAI({
     *   modelName: "gpt-3.5-turbo",
     * })
     * monitor(chat)
     */
    monitor(entities: EntityToMonitor | EntityToMonitor[], params?: WrapExtras): void;
    private trackEvent;
    private debouncedProcessQueue;
    private processQueue;
    private wrap;
    private executeWrappedFunction;
    /**
     * Wrap an agent's Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent function
     * @param {WrapParams} params - Wrap params
     */
    wrapAgent<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
    /**
     * Wrap an tool's Promise to track it's input, results and any errors.
     * @param {Promise} func - Tool function
     * @param {WrapParams} params - Wrap params
     */
    wrapTool<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
    /**
     * Wrap an model's Promise to track it's input, results and any errors.
     * @param {Promise} func - Model generation function
     * @param {WrapParams} params - Wrap params
     */
    wrapModel<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
    /**
     * Use this to log any external action or tool you use.
     * @param {string} message - Log message
     * @param {any} extra - Extra data to pass
     * @example
     * monitor.info("Running tool Google Search")
     **/
    info(message: string, extra?: any): void;
    log(message: string, extra?: any): void;
    /**
     * Use this to warn
     * @param {string} message - Warning message
     * @param {any} extra - Extra data to pass
     * @example
     * monitor.log("Running tool Google Search")
     **/
    warn(message: string, extra?: any): void;
    /**
     * Report any errors that occur during the conversation.
     * @param {string} message - Error message
     * @param {any} error - Error object
     * @example
     * try {
     *   const answer = await model.generate("Hello")
     *   monitor.result(answer)
     * } catch (error) {
     *   monitor.error("Error generating answer", error)
     * }
     */
    error(message: string | any, error?: any): void;
}

type PickMatching<T, V> = {
    [K in keyof T as T[K] extends V ? K : never]: T[K];
};
type ExtractMethods<T> = PickMatching<T, Function>;
type Monitor = LLMonitor["monitor"] & ExtractMethods<LLMonitor>;
declare const monitor: Monitor;

export { monitor as default };
