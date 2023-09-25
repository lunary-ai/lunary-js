import { cJSON } from './types.js';
import llmonitor, { Conversation } from './browser.js';

declare function useChatMonitor(): {
    restart: () => Conversation;
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
    trackFeedback: (messageId: string, feedback: cJSON) => void;
};
declare const useMonitorVercelAI: (props: any) => any;

export { llmonitor as default, useChatMonitor, useMonitorVercelAI };
