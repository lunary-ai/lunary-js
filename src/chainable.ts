import ctx from "./context"
import { WrappableFn, cJSON } from "./types"

/**
 * Identify the user (optional)
 * @param {string} userId - User ID
 * @param {cJSON} userProps - User properties object
 */
async function identify<T extends WrappableFn>(
  userId: string,
  userProps?: cJSON
): Promise<ReturnType<T>> {
  const toExecute = this

  // Update context or whatever else is needed here
  const currentContext = ctx.tryUse()

  const context = {
    parentRunId: currentContext?.parentRunId,
    userId,
    userProps,
  }

  return await ctx.callAsync(context, async () => {
    return toExecute
  })
}

export default {
  identify,
}
