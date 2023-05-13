import { LLMonitorOptions, LLMOutput, LLMInput } from "./types";
declare class LLMonitor {
    appId: string;
    convoId: string;
    convoType: string | undefined;
    apiUrl: string;
    /**
     * @param {string} appId - App ID generated from the LLMonitor dashboard, required if LLMONITOR_APP_ID is not set in the environment
     * @param {string} convoId - Tie to an existing conversation ID
     * @param {string} convoType - Add a label to the conversation
     * @param {string} apiUrl - Custom tracking URL if you are self-hosting
     * @constructor
     * @example
     * const monitor = new LLMonitor({
     *   appId: "00000000-0000-0000-0000-000000000000",
     *   convoId: "my-convo-id",
     *   convoType: "my-convo-type",
     *   apiUrl: "https://app.llmonitor.com/api"
     * })
     */
    constructor(options: LLMonitorOptions);
    private trackEvent;
    get id(): string;
    call(prompt: LLMInput): void;
    intermediateResult(answer: LLMOutput): void;
    finalResult(answer: LLMOutput): void;
    result(answer: LLMOutput): void;
    log(message: string): void;
    streamingStarts(): void;
    userUpvotes(): void;
    userDownvotes(): void;
    error(message: string | any, error: any): void;
}
export default LLMonitor;
