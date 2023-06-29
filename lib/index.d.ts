import { LLMonitorOptions, LLMOutput, LLMInput } from "./types";
declare class LLMonitor {
    appId: string;
    logConsole: boolean;
    apiUrl: string;
    userId?: string;
    agentRunId?: string;
    private queue;
    private queueRunning;
    /**
     * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
     * @param {boolean} log - Log events to the console
     * @param {string | string[]} convoTags - Add a label to the conversation
     * @param {string} apiUrl - Custom tracking URL if you are self-hosting (can also be set with LLMONITOR_API_URL)
     * @constructor
     */
    constructor(options?: LLMonitorOptions);
    private trackEvent;
    private debouncedProcessQueue;
    private processQueue;
    /**
     * Get the conversation ID to continue tracking an existing conversation.
     * @returns {string} - Conversation ID
     * @example
     * const monitor = new LLMonitor()
     * const convoId = monitor.id
     *
     * // Later on...
     * const monitor = new LLMonitor({ convoId })
     **/
    agentStart(data: {
        tags?: string[];
        name?: string;
    }): void;
    llmStart(data: {
        runId: string;
        messages: LLMInput[];
        params: any;
    }): void;
    /**
     * Use this when you start streaming the model's output to the user.
     * Used to measure the time it takes for the model to generate the first response.
     */
    streamingStart(data: {
        runId: string;
    }): void;
    llmEnd(data: {
        runId: string;
        output: LLMOutput;
        promptTokens: number;
        completionTokens: number;
    }): void;
    llmError(data: {
        runId: string;
        error: any;
    }): void;
    toolStart(data: {
        runId: string;
        name: string;
        input: any;
    }): void;
    toolEnd(data: {
        runId: string;
        output: any;
    }): void;
    toolError(data: {
        runId: string;
        error: any;
    }): void;
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
export * from "./agent";
export * from "./langchain";
