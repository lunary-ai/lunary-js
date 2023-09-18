"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunk7S3HGTMVcjs = require('./chunk-7S3HGTMV.cjs');


var _chunkM3TFISX5cjs = require('./chunk-M3TFISX5.cjs');

// src/react.ts
var _react = require('react');
function useChatMonitor() {
  const [chat, setChat] = _react.useState.call(void 0, );
  const restart = /* @__PURE__ */ _chunkM3TFISX5cjs.__name.call(void 0, () => {
    const newChat = _chunk7S3HGTMVcjs.browser_default.startChat();
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
    trackFeedback: _chunk7S3HGTMVcjs.browser_default.trackFeedback
  };
}
_chunkM3TFISX5cjs.__name.call(void 0, useChatMonitor, "useChatMonitor");
var react_default = _chunk7S3HGTMVcjs.browser_default;



exports.default = react_default; exports.useChatMonitor = useChatMonitor;
