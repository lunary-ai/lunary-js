import {
  browser_default
} from "./chunk-ZRFACYGL.js";
import {
  __name
} from "./chunk-NILRUNLS.js";

// src/react.ts
import { useEffect, useState } from "react";
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
var react_default = browser_default;
export {
  react_default as default,
  useChatMonitor
};
