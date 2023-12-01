"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkQLHFAYNHcjs = require('./chunk-QLHFAYNH.cjs');

// src/browser.ts
var FrontendLLMonitor = class extends _chunkQLHFAYNHcjs.llmonitor_default {
  static {
    _chunkQLHFAYNHcjs.__name.call(void 0, this, "FrontendLLMonitor");
  }
  
  
  /**
   * Identifies a user with a unique ID and properties.
   * @param {string} userId - The unique identifier for the user.
   * @param {cJSON} [userProps] - Custom properties to associate with the user.
   */
  identify(userId, userProps) {
    this.userId = userId;
    this.userProps = userProps;
  }
  /**
   * Extends the trackEvent method to include userId and userProps.
   * @param {RunType} type - The type of the run.
   * @param {EventName} event - The name of the event.
   * @param {Partial<RunEvent>} data - The data associated with the event.
   */
  trackEvent(type, event, data) {
    super.trackEvent(type, event, {
      ...data,
      userId: this.userId,
      userProps: this.userProps
    });
  }
};
var llmonitor = new FrontendLLMonitor();
var browser_default = llmonitor;



exports.browser_default = browser_default;
