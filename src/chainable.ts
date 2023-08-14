import ctx from "./context"
import { WrappableFn, cJSON } from "./types"

/**
 * Identify the user (optional)
 * @param {string} userId - User ID
 * @param {cJSON} userProps - User properties object
 */
function identify<T extends WrappableFn>(
  originalPromise: Promise<ReturnType<T>>,
  userId: string,
  userProps?: cJSON
): Promise<ReturnType<T>> {
  // Capture the current context
  const currentContext = ctx.tryUse()

  const context = {
    // conserve parent runId
    parentRunId: currentContext?.parentRunId,
    // use the provided userId and userProps
    userId,
    userProps,
  }

  return ctx.callAsync(context, async () => {
    // Wait for the original promise to resolve/reject
    return await originalPromise
  })
}

export default {
  identify,
}
