import { EntityToMonitor, EventName, EventType, LLMonitorOptions, LogEvent, RunEvent, WrapParams, cJSON } from "./types";
declare class LLMonitor {
    appId?: string;
    logConsole?: boolean;
    apiUrl?: string;
    userId?: string;
    userProps?: cJSON;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     */
    constructor();
    load({ appId, log, apiUrl, userId, userProps }?: LLMonitorOptions): void;
    identify(userId: string, userProps?: cJSON): void;
    monitor(entities: EntityToMonitor | [EntityToMonitor], { tags }?: {
        tags?: string[];
    }): void;
    trackEvent(type: EventType, event: EventName, data: Partial<RunEvent | LogEvent>): Promise<void>;
    private debouncedProcessQueue;
    private processQueue;
    /**
     * Wrap a Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent/tool/model executor function
     */
    private wrap;
    /**
     * Wrap an agent's Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent function
     */
    wrapAgent<T extends (...args: any[]) => Promise<any>>(func: T, params?: WrapParams): (...args: Parameters<T>) => Promise<any>;
    wrapTool<T extends (...args: any[]) => Promise<any>>(func: T, params?: WrapParams): (...args: Parameters<T>) => Promise<any>;
    /**
     * Wrap an agent's Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent function
     */
    wrapModel<T extends (...args: any[]) => Promise<any>>(func: T, params?: WrapParams): (...args: Parameters<T>) => Promise<any>;
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
    /**
     * Extends Langchain's LLM and Chat classes like OpenAI and ChatOpenAI
     * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
     * @param baseClass - Langchain's LLM class
     * @returns Extended class
     * @example
     * const MonitoredChat = monitor.langchain(ChatOpenAI)
     * const chat = new MonitoredChat({
     *  modelName: "gpt-4"
     * })
     */
    langchain(baseClass: any): {
        new (): {
            [x: string]: any;
            generate(...args: any): Promise<any>;
        };
        [x: string]: any;
    };
}
export default LLMonitor;
