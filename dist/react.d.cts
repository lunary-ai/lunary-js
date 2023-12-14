import { cJSON } from './types.cjs';
import lunary from './browser.cjs';
import { T as Thread } from './lunary-04184cd5.js';

declare function useChatMonitor(): {
    restart: () => Thread;
    restartThread: () => Thread;
    resumeThread: (id: string) => Thread;
    trackMessage: (message: {
        id?: string;
        role: "user" | "assistant" | "tool" | "system";
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
