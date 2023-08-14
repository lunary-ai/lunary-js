import ctx from "./context"
import { WrappableFn, cJSON } from "./types"

/**
 * Identify the user (optional)
 * @param {string} userId - User ID
 * @param {cJSON} userProps - User properties object
 */
function identify<T extends WrappableFn>(userId: string, userProps?: cJSON): T {
  const func = this as T

  const wrappedFn = async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const currentContext = ctx.tryUse()

    const context = {
      // conserve parent runId
      parentRunId: currentContext?.parentRunId,

      // create new runId
      userId,
      userProps,
    }

    // Call function with runId into context
    return ctx.callAsync(context, async () => {
      return func(...args)
    })
  }

  return wrappedFn as T
}

export default {
  identify,
}
