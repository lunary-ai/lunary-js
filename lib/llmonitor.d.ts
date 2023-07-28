import { LLMonitorOptions, LLMessage, Event, EventType } from "./types";
declare class LLMonitor {
    appId: string;
    logConsole: boolean;
    apiUrl: string;
    userId?: string;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     * @constructor
     */
    constructor(customOptions?: LLMonitorOptions);
    trackEvent(type: EventType, data?: Partial<Event>): Promise<void>;
    private debouncedProcessQueue;
    private processQueue;
    agentStart(data: {
        name?: string;
        input: any;
        runId: string;
        parentRunId: string;
    }): void;
    agentEnd(data: {
        output: any;
        runId: string;
        parentRunId: string;
    }): void;
    agentError(data: {
        error: any;
        runId: string;
        parentRunId: string;
    }): void;
    llmStart(data: {
        runId: string;
        parentRunId: string;
        input: LLMessage;
        name?: string;
        extra?: any;
    }): void;
    /**
     * Use this when you start streaming the model's output to the user.
     * Used to measure the time it takes for the model to generate the first response.
     */
    streamingStart(data: {
        runId: string;
        parentRunId: string;
    }): void;
    llmEnd(data: {
        runId: string;
        parentRunId: string;
        output: LLMessage;
        promptTokens?: number;
        completionTokens?: number;
    }): void;
    llmError(data: {
        runId: string;
        error: any;
        parentRunId: string;
    }): void;
    toolStart(data: {
        runId: string;
        name?: string;
        input?: any;
        parentRunId: string;
    }): void;
    toolEnd(data: {
        runId: string;
        output?: any;
        parentRunId: string;
    }): void;
    toolError(data: {
        runId: string;
        error: any;
        parentRunId: string;
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
    /**
     * Extends Langchain's LLM classes like ChatOpenAI
     * @param baseClass - Langchain's LLM class
     * @returns Extended class
     * @example
     * const monitor = new LLMonitor()
     * const MonitoredChat = monitor.extendModel(ChatOpenAI)
     * const chat = new MonitoredChat({
     *  modelName: "gpt-4"
     * })
     **/
    extendModel(baseClass: any): {
        new (...args: any[]): {
            [x: string]: any;
        };
        [x: string]: any;
    };
}
export default LLMonitor;
