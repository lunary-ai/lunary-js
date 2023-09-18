import { cJSON } from './types.js';
import llmonitor, { Conversation } from './browser.js';

declare function useChatMonitor(): {
    restart: () => Conversation;
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
    trackFeedback: (messageId: string, feedback: cJSON) => void;
};

export { llmonitor as default, useChatMonitor };
