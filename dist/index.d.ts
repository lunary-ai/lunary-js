import { L as LLMonitorOptions, E as EventType, a as EventName, R as RunEvent, b as LogEvent, W as WrappableFn, c as WrapParams, d as WrappedFn } from './types-f442f931.js';

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
    trackEvent(type: EventType, event: EventName, data: Partial<RunEvent | LogEvent>): Promise<void>;
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

declare const llmonitor: LLMonitor;

export { llmonitor as default };