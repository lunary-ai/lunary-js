"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkLUWBT2SPcjs = require('./chunk-LUWBT2SP.cjs');


var _chunkM3TFISX5cjs = require('./chunk-M3TFISX5.cjs');

// src/react.ts
var _react = require('react');
function useChatMonitor() {
  const [chat, setChat] = _react.useState.call(void 0, );
  const restart = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, () => {
    const newChat = _chunkLUWBT2SPcjs.browser_default.startChat();
    setChat(newChat);
    return newChat;
  }, "restart");
  _react.useEffect.call(void 0, () => {
    restart();
  }, []);
  return {
    restart,
    trackUserMessage: _optionalChain([chat, 'optionalAccess', _ => _.trackUserMessage]),
    trackBotMessage: _optionalChain([chat, 'optionalAccess', _2 => _2.trackBotMessage]),
    trackFeedback: _chunkLUWBT2SPcjs.browser_default.trackFeedback
  };
}
_chunkM3TFISX5cjs.__name.call(void 0, useChatMonitor, "useChatMonitor");
var useMonitorVercelAI = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, (props) => {
  const { messages, isLoading } = props;
  const { restart, trackFeedback, trackUserMessage, trackBotMessage } = useChatMonitor();
  const previousMessages = _react.useRef.call(void 0, messages);
  _react.useEffect.call(void 0, () => {
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
var react_default = _chunkLUWBT2SPcjs.browser_default;




exports.default = react_default; exports.useChatMonitor = useChatMonitor; exports.useMonitorVercelAI = useMonitorVercelAI;
