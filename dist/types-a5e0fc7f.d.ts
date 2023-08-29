type cJSON = string | number | boolean | {
    [x: string]: cJSON;
} | Array<cJSON>;
interface LLMonitorOptions {
    appId?: string;
    apiUrl?: string;
    log?: boolean;
    name?: string;
}
type TokenUsage = {
    completion: number;
    prompt: number;
};
type WrapExtras = {
    name?: string;
    extra?: cJSON;
    tags?: string[];
    userId?: string;
    userProps?: cJSON;
};
type WrapParams<T extends WrappableFn> = {
    inputParser?: (...args: Parameters<T>) => cJSON;
    extraParser?: (...args: Parameters<T>) => cJSON;
    nameParser?: (...args: Parameters<T>) => string;
    outputParser?: (result: Awaited<ReturnType<T>>) => cJSON;
    tokensUsageParser?: (result: Awaited<ReturnType<T>>) => Promise<TokenUsage>;
    enableWaitUntil?: (...args: Parameters<T>) => boolean;
    waitUntil?: (result: Awaited<ReturnType<T>>, onComplete: (any: any) => any, onError: (any: any) => any) => ReturnType<T>;
} & WrapExtras;
type WrappableFn = (...args: any[]) => any;
type Identify<T extends WrappableFn> = (userId: string, userProps?: cJSON) => ReturnType<T>;
type WrappedReturn<T extends WrappableFn> = ReturnType<T> & {
    identify: Identify<T>;
};
type WrappedFn<T extends WrappableFn> = (...args: Parameters<T>) => WrappedReturn<T>;

export { LLMonitorOptions as L, WrappableFn as W, WrapParams as a, WrappedFn as b, WrapExtras as c, WrappedReturn as d };
