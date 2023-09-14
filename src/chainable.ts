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
  const { target, next } = this

  const context = {
    userId,
    userProps,
  }

  return ctx.user.callAsync(context, async () => {
    return next(target) // || target.func(...target.args)
  })
}

/**
 * Inject a previous run ID into the context
 * For example, to tie back to frontend events
 * @param {string} runId - Previous run ID
 */
async function setParent<T extends WrappableFn>(
  runId: string
): Promise<ReturnType<T>> {
  const { target, next } = this

  return ctx.runId.callAsync(runId, async () => {
    return next(target)
  })
}

export default {
  identify,
  setParent,
}
