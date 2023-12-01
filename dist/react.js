import {
  browser_default
} from "./chunk-5IUFDKZY.js";
import {
  __name
} from "./chunk-CDCVVLTO.js";

// src/react.ts
import { useEffect, useRef, useState } from "react";
function useChatMonitor() {
  const [thread, setThread] = useState();
  const restart = /* @__PURE__ */ __name(() => {
    const newThread = browser_default.startThread();
    setThread(newThread);
    return newThread;
  }, "restart");
  const resumeThread = /* @__PURE__ */ __name((id) => {
    const newThread = browser_default.resumeThread(id);
    setThread(newThread);
    return newThread;
  }, "resumeThread");
  useEffect(() => {
    restart();
  }, []);
  return {
    restart,
    // Deprecated TODO: remove
    restartThread: restart,
    resumeThread,
    trackUserMessage: thread?.trackUserMessage,
    trackBotMessage: thread?.trackBotMessage,
    trackFeedback: browser_default.trackFeedback,
    identify: browser_default.identify
  };
}
__name(useChatMonitor, "useChatMonitor");
var useMonitorVercelAI = /* @__PURE__ */ __name((props) => {
  const { messages, isLoading } = props;
  const {
    trackFeedback,
    trackUserMessage,
    trackBotMessage,
    resumeThread,
    restartThread,
    identify,
    restart
  } = useChatMonitor();
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
    trackFeedback,
    resumeThread,
    restartThread,
    identify
  };
}, "useMonitorVercelAI");
var react_default = browser_default;
export {
  react_default as default,
  useChatMonitor,
  useMonitorVercelAI
};
