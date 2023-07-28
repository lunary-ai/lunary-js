import { LLMonitorOptions, Event, EventType } from "./types";
declare class LLMonitor {
    appId?: string;
    logConsole?: boolean;
    apiUrl?: string;
    userId?: string;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     */
    load(customOptions?: LLMonitorOptions): void;
    trackEvent(type: EventType, data: Partial<Event>): Promise<void>;
    private debouncedProcessQueue;
    private processQueue;
    private wrap;
    wrapAgent<T extends (...args: any[]) => Promise<any>>(func: T, params?: {
        name?: string;
    }): (...args: Parameters<T>) => Promise<any>;
    wrapTool<T extends (...args: any[]) => Promise<any>>(func: T, params?: {
        name?: string;
    }): (...args: Parameters<T>) => Promise<any>;
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
     **/
    error(message: string | any, error?: any): void;
}
export default LLMonitor;
