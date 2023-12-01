import { cJSON } from './types.cjs';
import llmonitor from './browser.cjs';
import { T as Thread } from './llmonitor-c9762f9d.js';

declare function useChatMonitor(): {
    restart: () => Thread;
    restartThread: () => Thread;
    resumeThread: (id: string) => Thread;
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
    trackFeedback: (runId: string, feedback: cJSON) => void;
    identify: (userId: string, userProps?: cJSON) => void;
};
declare const useMonitorVercelAI: (props: any) => any;

export { llmonitor as default, useChatMonitor, useMonitorVercelAI };
