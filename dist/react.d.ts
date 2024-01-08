import { cJSON } from './types.js';
import lunary from './browser.js';
import { T as Thread } from './lunary-m-FECa5n.js';

declare function useChatMonitor(): {
    restart: () => Thread;
    restartThread: () => Thread;
    resumeThread: (id: string) => Thread;
    trackMessage: (message: {
        id?: string;
        role: "tool" | "user" | "assistant" | "system";
        content?: string;
        isRetry?: boolean;
        tags?: string[];
        extra?: cJSON;
        feedback?: cJSON;
    }) => string;
    trackFeedback: (runId: string, feedback: cJSON) => void;
    identify: (userId: string, userProps?: cJSON) => void;
};
declare const useMonitorVercelAI: (props: any) => any;

export { lunary as default, useChatMonitor, useMonitorVercelAI };
