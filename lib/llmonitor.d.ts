import { LLMonitorOptions, EventType, RunEvent, LogEvent, WrapParams } from "./types";
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
    constructor();
    load(options?: Partial<LLMonitorOptions>): void;
    trackEvent(type: EventType, event: string, data: Partial<RunEvent | LogEvent>): Promise<void>;
    private debouncedProcessQueue;
    private processQueue;
    private wrap;
    wrapAgent<T extends (...args: any[]) => Promise<any>>(func: T, params?: WrapParams): (...args: Parameters<T>) => Promise<any>;
    wrapTool<T extends (...args: any[]) => Promise<any>>(func: T, params?: WrapParams): (...args: Parameters<T>) => Promise<any>;
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
     **/
    error(message: string | any, error?: any): void;
    /**
     * Extends Langchain's LLM classes like ChatOpenAI
     * We need to extend instead of using `callbacks` as callbacks run in a different context & don't allow us to tie parent IDs correctly.
     * @param baseClass - Langchain's LLM class
     * @returns Extended class
     * @example
     * const monitor = new LLMonitor()
     * const MonitoredChat = monitor.extendModel(ChatOpenAI)
     * const chat = new MonitoredChat({
     *  modelName: "gpt-4"
     * })
     **/
    langchain(baseClass: any): {
        new (...args: any[]): {
            [x: string]: any;
            interestingArgs?: Record<string, unknown>;
            generate(...args: any): Promise<any>;
        };
        [x: string]: any;
    };
}
export default LLMonitor;
