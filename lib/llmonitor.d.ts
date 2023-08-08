import { EntityToMonitor, LLMonitorOptions, WrapParams, WrappableFn, cJSON } from "./types";
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
    /**
     * Identify the user (optional)
     * @param {string} userId - User ID
     * @param {cJSON} userProps - User properties object
     */
    identify(userId: string, userProps?: cJSON): void;
    /**
     * Attach LLMonitor to an entity (Langchain Chat/LLM/Tool classes, OpenAI class)
     * @param {EntityToMonitor | [EntityToMonitor]} entities - Entity or array of entities to monitor
     * @param {string[]} tags - (optinal) Tags to add to all events
     * @example
     * const chat = new ChatOpenAI({
     *   modelName: "gpt-3.5-turbo",
     * })
     * monitor.attach(chat)
     */
    attach(entities: EntityToMonitor | EntityToMonitor[], { tags }?: {
        tags?: string[];
    }): void;
    private trackEvent;
    private debouncedProcessQueue;
    private processQueue;
    /**
     * Wrap a Promise to track it's input, results and any errors.
     * @param {EventType} type - Event type
     * @param {Promise} func - Agent function
     * @param {WrapParams} params - Wrap params
     * @returns {Promise} - Wrapped promise
     */
    private wrap;
    /**
     * Wrap an agent's Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent function
     */
    wrapAgent<T extends WrappableFn>(func: T, params?: WrapParams<T>): T;
    /**
     * Wrap an tool's Promise to track it's input, results and any errors.
     * @param {Promise} func - Tool function
     * @param {WrapParams} params - Wrap params
     */
    wrapTool<T extends WrappableFn>(func: T, params?: WrapParams<T>): T;
    /**
     * Wrap an model's Promise to track it's input, results and any errors.
     * @param {Promise} func - Model generation function
     * @param {WrapParams} params - Wrap params
     */
    wrapModel<T extends WrappableFn>(func: T, params?: WrapParams<T>): T;
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
export default LLMonitor;
