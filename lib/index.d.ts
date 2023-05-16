import { LLMonitorOptions, LLMOutput, LLMInput } from "./types";
declare class LLMonitor {
    appId: string;
    convoId: string;
    convoTags: string | undefined;
    apiUrl: string;
    /**
     * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
     * @param {string} convoId - Tie to an existing conversation ID
     * @param {string} convoTags - Add a label to the conversation
     * @param {string} apiUrl - Custom tracking URL if you are self-hosting (can also be set with LLMONITOR_API_URL)
     * @constructor
     * @example
     * const monitor = new LLMonitor({
     *   appId: "00000000-0000-0000-0000-000000000000",
     *   convoId: "my-convo-id",
     *   convoTags: "home",
     *   apiUrl: "https://app.llmonitor.com/api"
     * })
     */
    constructor(options: LLMonitorOptions);
    private trackEvent;
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
    get id(): string;
    /**
     * Use this for higher accuracy as soon as the user sends a message.
     * @param {string} msg - User message
     **/
    messageReceived(msg: LLMInput): void;
    /**
     * Use this just before calling a model
     * @param {string | ChatHistory} prompt - Prompt sent to the model
     **/
    call(prompt: LLMInput, model?: string): void;
    /**
     * Use this when the model returns an answer, but the chain isn't complete yet.
     * @param {string | ChatHistory} answer - Answer returned by the model
     **/
    intermediateResult(answer: LLMOutput): void;
    /**
     * Use this when the model returns the final answer you'll show to the user.
     * @param {string | ChatHistory} answer - Answer returned by the model
     * @example
     * const answer = await model.generate("Hello")
     * monitor.finalResult(answer)
     **/
    finalResult(answer: LLMOutput): void;
    /**
     * Use this when the model returns the final answer you'll show to the user.
     * @param {string | ChatHistory} answer - Answer returned by the model
     * @example
     * const answer = await model.generate("Hello")
     * monitor.result(answer)
     **/
    result(answer: LLMOutput): void;
    log(message: string): void;
    /**
     * Use this when you start streaming the model's output to the user.
     * Used to measure the time it takes for the model to generate the first response.
     */
    streamingStarts(): void;
    /**
     * Vote on the quality of the conversation.
     */
    userUpvotes(): void;
    /**
     * Vote on the quality of the conversation.
     */
    userDownvotes(): void;
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
