import { WrappableFn, WrappedFn, WrapParams } from './types.js';
import { L as Lunary } from './lunary-Lfs6gfDu.js';

declare class BackendMonitor extends Lunary {
    private wrap;
    private executeWrappedFunction;
    /**
     * TODO: This is not functional yet
     * Wrap anything to inject user or message ID context.
     * @param {Promise} func - Function to wrap
     **/
    wrapContext<T extends WrappableFn>(func: T): WrappedFn<T>;
    /**
     * Wrap an agent's Promise to track it's input, results and any errors.
     * @param {Promise} func - Agent function
     * @param {WrapParams} params - Wrap params
     */
    wrapAgent<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
    /**
     * Wrap an tool's Promise to track it's input, results and any errors.
     * @param {Promise} func - Tool function
     * @param {WrapParams} params - Wrap params
     */
    wrapTool<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
    /**
     * Wrap an model's Promise to track it's input, results and any errors.
     * @param {Promise} func - Model generation function
     * @param {WrapParams} params - Wrap params
     */
    wrapModel<T extends WrappableFn>(func: T, params?: WrapParams<T>): WrappedFn<T>;
}

declare const lunary: BackendMonitor;

export { BackendMonitor as Monitor, lunary as default };
