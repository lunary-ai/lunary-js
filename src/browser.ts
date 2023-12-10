/*
 * This is the entry point for the browser
 */

import Lunary from "./lunary"

import { EventName, RunEvent, RunType, cJSON } from "./types"

class FrontendLunary extends Lunary {
  private userId?: string
  private userProps?: cJSON

  /**
   * Identifies a user with a unique ID and properties.
   * @param {string} userId - The unique identifier for the user.
   * @param {cJSON} [userProps] - Custom properties to associate with the user.
   */
  identify(userId: string, userProps?: cJSON) {
    this.userId = userId
    this.userProps = userProps
  }

  /**
   * Extends the trackEvent method to include userId and userProps.
   * @param {RunType} type - The type of the run.
   * @param {EventName} event - The name of the event.
   * @param {Partial<RunEvent>} data - The data associated with the event.
   */
  trackEvent(type: RunType, event: EventName, data: Partial<RunEvent>): void {
    super.trackEvent(type, event, {
      ...data,
      userId: this.userId,
      userProps: this.userProps,
    })
  }
}

const lunary = new FrontendLunary()

export default lunary
