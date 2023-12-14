import { cJSON, LunaryOptions, RunType, EventName, RunEvent, LogEvent, Template } from './types.js';

type Message = {
    id?: string;
    role: "user" | "assistant" | "tool" | "system";
    content?: string | null;
    isRetry?: boolean;
    tags?: string[];
    extra?: cJSON;
    feedback?: cJSON;
};
declare class Thread {
    id: string;
    private monitor;
    private started;
    private tags;
    constructor(monitor: Lunary, options: {
        id?: string;
        started?: boolean;
        tags?: string[];
    });
    trackMessage: (message: Message) => string;
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
}

declare class Lunary {
    appId?: string;
    verbose?: boolean;
    apiUrl?: string;
    ctx?: any;
    private queue;
    private queueRunning;
    private templateCache;
    /**
     * @param {LunaryOptions} options
     */
    constructor(ctx?: any);
    init({ appId, verbose, apiUrl }?: LunaryOptions): void;
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
    getRawTemplate: (templateSlug: string) => Promise<any>;
    /**
     * Render a template with the given data in the OpenAI completion format.
     * @param {string} templateSlug - The slug of the template to render.
     * @param {any} data - The data to pass to the template.
     * @returns {Promise<Template>} The rendered template.
     * @example
     * const template = await lunary.renderTemplate("welcome", { name: "John" })
     * console.log(template)
     */
    renderTemplate: (templateSlug: string, data?: any) => Promise<Template>;
    /**
     * Attach feedback to a run.
     * @param {string} runId - The ID of the run.
     * @param {cJSON} feedback - The feedback to attach.
     * @example
     * monitor.trackFeedback("some-run-id", { thumbs: "up" });
     **/
    trackFeedback: (runId: string, feedback: cJSON) => void;
    /**
     * @deprecated Use openThread() instead
     */
    startChat(id?: string): Thread;
    /**
     * @deprecated Use startThread() instead
     */
    startThread(id?: string): Thread;
    /**
     * @deprecated Use resumeThread() instead
     */
    resumeThread(id: string): Thread;
    openThread(params?: string | {
        id?: string;
        tags?: string[];
    }): Thread;
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

export { Lunary as L, Thread as T };
