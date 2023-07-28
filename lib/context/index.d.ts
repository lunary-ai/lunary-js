type AnyFunc<T> = (this: T, ...args: any) => any;
export declare class AsyncContext<T> {
    name: string;
    constructor(name: string);
    static wrap<F extends AnyFunc<any>>(fn: F): F;
    run<F extends AnyFunc<null>>(value: T, fn: F, ...args: Parameters<F>): ReturnType<F>;
    get(): T | undefined;
}
export {};
