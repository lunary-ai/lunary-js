"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class LLMonitor {
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
    constructor(options) {
        this.appId = options.appId || (0, utils_1.getDefaultAppId)();
        this.convoId = options.convoId || crypto.randomUUID();
        this.convoType = options.convoType;
        this.apiUrl = options.apiUrl || "https://app.llmonitor.com/api";
    }
    async trackEvent(type, data = {}) {
        const eventData = {
            type,
            app: this.appId,
            convo: this.convoId,
            timestamp: new Date().toISOString(),
            ...data,
        };
        if (this.convoType) {
            eventData.convoType = this.convoType;
        }
        // fetch
        await fetch(`${this.apiUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ event: eventData }),
        });
    }
    get id() {
        return this.convoId;
    }
    call(prompt) {
        const { message, chat } = (0, utils_1.messageAdapter)(prompt);
        this.trackEvent("LLM_CALL", { message, chat });
    }
    intermediateResult(answer) {
        const { message } = (0, utils_1.messageAdapter)(answer);
        this.trackEvent("LLM_RESULT", { message, intermediate: true });
    }
    finalResult(answer) {
        const { message } = (0, utils_1.messageAdapter)(answer);
        this.trackEvent("LLM_RESULT", { message, intermediate: false });
    }
    /* Alias final result for simple use cases */
    result(answer) {
        this.finalResult(answer);
    }
    log(message) {
        this.trackEvent("LOG", { message });
    }
    streamingStarts() {
        this.trackEvent("STREAMING_START");
    }
    userUpvotes() {
        this.trackEvent("FEEDBACK", { message: "GOOD" });
    }
    userDownvotes() {
        this.trackEvent("FEEDBACK", { message: "BAD" });
    }
    error(message, error) {
        // Allow error obj to be the first argument
        if (typeof message === "object") {
            error = message;
            message = undefined;
        }
        this.trackEvent("ERROR", { message, error });
    }
}
exports.default = LLMonitor;
