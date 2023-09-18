import { cJSON, LLMonitorOptions, EventType, EventName, RunEvent, LogEvent } from './types.cjs';

declare class Conversation {
    private monitor;
    private convoId;
    private started;
    constructor(monitor: LLMonitor);
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
}
declare class LLMonitor {
    appId?: string;
    verbose?: boolean;
    apiUrl?: string;
    userId?: string;
    userProps?: cJSON;
    private queue;
    private queueRunning;
    /**
     * @param {LLMonitorOptions} options
     */
    constructor();
    init({ appId, verbose, apiUrl }?: LLMonitorOptions): void;
    identify(userId: string, userProps: cJSON): void;
    trackEvent(type: EventType, event: EventName, data: Partial<RunEvent | LogEvent>): Promise<void>;
    private processQueue;
    trackFeedback: (messageId: string, feedback: cJSON) => void;
    startChat(): Conversation;
}
declare const llmonitor: LLMonitor;

export { Conversation, llmonitor as default };
