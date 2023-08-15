import { WrappableFn, cJSON } from "./types";
/**
 * Identify the user (optional)
 * @param {string} userId - User ID
 * @param {cJSON} userProps - User properties object
 */
declare function identify<T extends WrappableFn>(userId: string, userProps?: cJSON): Promise<ReturnType<T>>;
declare const _default: {
    identify: typeof identify;
};
export default _default;
