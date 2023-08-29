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

export default {
  identify,
}
