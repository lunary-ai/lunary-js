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
    /**
     * Use this for higher accuracy as soon as the user sends a message.
     * @param {string} msg - User message
     **/
    messageReceived(msg) {
        const { message } = (0, utils_1.messageAdapter)(msg);
        this.trackEvent("MSG_RECEIVED", { message });
    }
    /**
     * Use this just before calling a model
     * @param {string | ChatHistory} prompt - Prompt sent to the model
     **/
    call(prompt, model) {
        const { message, chat } = (0, utils_1.messageAdapter)(prompt);
        this.trackEvent("LLM_CALL", { message, chat, model });
    }
    /**
     * Use this when the model returns an answer, but the chain isn't complete yet.
     * @param {string | ChatHistory} answer - Answer returned by the model
     **/
    intermediateResult(answer) {
        const { message } = (0, utils_1.messageAdapter)(answer);
        this.trackEvent("LLM_RESULT", { message, intermediate: true });
    }
    /**
     * Use this when the model returns the final answer you'll show to the user.
     * @param {string | ChatHistory} answer - Answer returned by the model
     * @example
     * const answer = await model.generate("Hello")
     * monitor.finalResult(answer)
     **/
    finalResult(answer) {
        const { message } = (0, utils_1.messageAdapter)(answer);
        this.trackEvent("LLM_RESULT", { message, intermediate: false });
    }
    /**
     * Use this when the model returns the final answer you'll show to the user.
     * @param {string | ChatHistory} answer - Answer returned by the model
     * @example
     * const answer = await model.generate("Hello")
     * monitor.result(answer)
     **/
    result(answer) {
        this.finalResult(answer);
    }
    log(message) {
        this.trackEvent("LOG", { message });
    }
    /**
     * Use this when you start streaming the model's output to the user.
     * Used to measure the time it takes for the model to generate the first response.
     */
    streamingStarts() {
        this.trackEvent("STREAMING_START");
    }
    /**
     * Vote on the quality of the conversation.
     */
    userUpvotes() {
        this.trackEvent("FEEDBACK", { message: "GOOD" });
    }
    /**
     * Vote on the quality of the conversation.
     */
    userDownvotes() {
        this.trackEvent("FEEDBACK", { message: "BAD" });
    }
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
