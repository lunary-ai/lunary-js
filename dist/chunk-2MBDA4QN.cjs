"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkLZBAGBH5cjs = require('./chunk-LZBAGBH5.cjs');

// src/browser.ts
var FrontendLunary = class extends _chunkLZBAGBH5cjs.lunary_default {
  static {
    _chunkLZBAGBH5cjs.__name.call(void 0, this, "FrontendLunary");
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
var lunary = new FrontendLunary();
var browser_default = lunary;



exports.browser_default = browser_default;
