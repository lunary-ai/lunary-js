"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkF32KE5VIcjs = require('./chunk-F32KE5VI.cjs');


var _chunkQLHFAYNHcjs = require('./chunk-QLHFAYNH.cjs');

// src/react.ts
var _react = require('react');
function useChatMonitor() {
  const [thread, setThread] = _react.useState.call(void 0, );
  const restart = /* @__PURE__ */ _chunkQLHFAYNHcjs.__name.call(void 0, () => {
    const newThread = _chunkF32KE5VIcjs.browser_default.startThread();
    setThread(newThread);
    return newThread;
  }, "restart");
  const resumeThread = /* @__PURE__ */ _chunkQLHFAYNHcjs.__name.call(void 0, (id) => {
    const newThread = _chunkF32KE5VIcjs.browser_default.resumeThread(id);
    setThread(newThread);
    return newThread;
  }, "resumeThread");
  _react.useEffect.call(void 0, () => {
    restart();
  }, []);
  return {
    restart,
    // Deprecated TODO: remove
    restartThread: restart,
    resumeThread,
    trackUserMessage: _optionalChain([thread, 'optionalAccess', _ => _.trackUserMessage]),
    trackBotMessage: _optionalChain([thread, 'optionalAccess', _2 => _2.trackBotMessage]),
    trackFeedback: _chunkF32KE5VIcjs.browser_default.trackFeedback,
    identify: _chunkF32KE5VIcjs.browser_default.identify
  };
}
_chunkQLHFAYNHcjs.__name.call(void 0, useChatMonitor, "useChatMonitor");
var useMonitorVercelAI = /* @__PURE__ */ _chunkQLHFAYNHcjs.__name.call(void 0, (props) => {
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
    trackFeedback,
    resumeThread,
    restartThread,
    identify
  };
}, "useMonitorVercelAI");
var react_default = _chunkF32KE5VIcjs.browser_default;




exports.default = react_default; exports.useChatMonitor = useChatMonitor; exports.useMonitorVercelAI = useMonitorVercelAI;
