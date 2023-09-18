import { cJSON } from './types.cjs';
import llmonitor, { Conversation } from './browser.cjs';

declare function useChatMonitor(): {
    restart: () => Conversation;
    trackUserMessage: (text: string, props?: cJSON, customId?: string) => string;
    trackBotMessage: (replyToId: string, text: string, props?: cJSON) => void;
    trackFeedback: (messageId: string, feedback: cJSON) => void;
};

export { llmonitor as default, useChatMonitor };
