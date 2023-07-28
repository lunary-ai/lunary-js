import type { AsyncContext } from "./index";
/**
 * Stores all AsyncContext data, and tracks whether any snapshots have been
 * taken of the current data.
 */
export declare class Mapping {
    #private;
    constructor(data: Map<AsyncContext<unknown>, unknown> | null);
    has<T>(key: AsyncContext<T>): boolean;
    get<T>(key: AsyncContext<T>): T | undefined;
    /**
     * Like the standard Map.p.set, except that we will allocate a new Mapping
     * instance if this instance is frozen.
     */
    set<T>(key: AsyncContext<T>, value: T): Mapping;
    /**
     * Like the standard Map.p.delete, except that we will allocate a new Mapping
     * instance if this instance is frozen.
     */
    delete<T>(key: AsyncContext<T>): Mapping;
    /**
     * Prevents further modifications to this Mapping.
     */
    freeze(): void;
    isFrozen(): boolean;
}
