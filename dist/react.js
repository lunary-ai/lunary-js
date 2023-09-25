import {
  browser_default
} from "./chunk-ZRFACYGL.js";
import {
  __name
} from "./chunk-NILRUNLS.js";

// src/react.ts
import { useEffect, useRef, useState } from "react";
function useChatMonitor() {
  const [chat, setChat] = useState();
  const restart = /* @__PURE__ */ __name(() => {
    const newChat = browser_default.startChat();
    setChat(newChat);
    return newChat;
  }, "restart");
  useEffect(() => {
    restart();
  }, []);
  return {
    restart,
    trackUserMessage: chat?.trackUserMessage,
    trackBotMessage: chat?.trackBotMessage,
    trackFeedback: browser_default.trackFeedback
  };
}
__name(useChatMonitor, "useChatMonitor");
var useMonitorVercelAI = /* @__PURE__ */ __name((props) => {
  const { messages, isLoading } = props;
  const { restart, trackFeedback, trackUserMessage, trackBotMessage } = useChatMonitor();
  const previousMessages = useRef(messages);
  useEffect(() => {
    if (previousMessages.current.length < messages.length) {
      const newMessage = messages[messages.length - 1];
      if (newMessage.role === "user") {
        trackUserMessage(newMessage.content, void 0, newMessage.id);
      } else if (newMessage.role === "assistant" && // Make sure it's not streaming
      !isLoading) {
        const userMessage = messages[messages.length - 2];
        trackBotMessage(userMessage.id, newMessage.content);
      }
    }
  }, [isLoading, messages]);
  return {
    ...props,
    trackFeedback
  };
}, "useMonitorVercelAI");
var react_default = browser_default;
export {
  react_default as default,
  useChatMonitor,
  useMonitorVercelAI
};
