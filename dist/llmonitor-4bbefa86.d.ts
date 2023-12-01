import { cJSON, LLMonitorOptions, RunType, EventName, RunEvent, LogEvent } from './types.js';

declare class Thread {
    threadId: string;
    private monitor;
    private started;
    constructor(monitor: LLMonitor, id?: string, started?: boolean);
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
}

declare class LLMonitor {
    appId?: string;
    verbose?: boolean;
    apiUrl?: string;
    ctx?: any;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     */
    constructor(ctx?: any);
    init({ appId, verbose, apiUrl }?: LLMonitorOptions): void;
    /**
     * Manually track a run event.
     * @param {RunType} type - The type of the run.
     * @param {EventName} event - The name of the event.
     * @param {Partial<RunEvent | LogEvent>} data - The data associated with the event.
     * @example
     * monitor.trackEvent("llm", "start", { name: "gpt-4", input: "Hello I'm a bot" });
     */
    trackEvent(type: RunType, event: EventName, data: Partial<RunEvent | LogEvent>): void;
    private debouncedProcessQueue;
    processQueue(): Promise<void>;
    trackFeedback: (runId: string, feedback: cJSON) => void;
    /**
     * @deprecated Use startThread() instead
     */
    startChat(id?: string): Thread;
    startThread(id?: string): Thread;
    resumeThread(id: string): Thread;
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
     * Make sure the queue is flushed before exiting the program
     */
    flush(): Promise<void>;
}

export { LLMonitor as L, Thread as T };
