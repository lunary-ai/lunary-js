export declare const nativeThen: <TResult1 = any, TResult2 = never>(onfulfilled?: (value: any) => TResult1 | PromiseLike<TResult1>, onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>) => Promise<TResult1 | TResult2>;
export declare function then<T>(this: Promise<T>, onFul?: Parameters<typeof nativeThen>[0], onRej?: Parameters<typeof nativeThen>[1]): Promise<T>;
