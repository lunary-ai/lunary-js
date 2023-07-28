import { FrozenRevert, Revert } from "./fork";
import type { AsyncContext } from "./index";
/**
 * Storage is the (internal to the language) storage container of all
 * AsyncContext data.
 *
 * None of the methods here are exposed to users, they're only exposed to the AsyncContext class.
 */
export declare class Storage {
    #private;
    /**
     * Get retrieves the current value assigned to the AsyncContext.
     */
    static get<T>(key: AsyncContext<T>): T | undefined;
    /**
     * Set assigns a new value to the AsyncContext, returning a revert that can
     * undo the modification at a later time.
     */
    static set<T>(key: AsyncContext<T>, value: T): FrozenRevert | Revert<T>;
    /**
     * Restore will, well, restore the global storage state to state at the time
     * the revert was created.
     */
    static restore<T>(revert: FrozenRevert | Revert<T>): void;
    /**
     * Snapshot freezes the current storage state, and returns a new revert which
     * can restore the global storage state to the state at the time of the
     * snapshot.
     */
    static snapshot(): FrozenRevert;
    /**
     * Switch swaps the global storage state to the state at the time of a
     * snapshot, completely replacing the current state (and making it impossible
     * for the current state to be modified until the snapshot is reverted).
     */
    static switch(snapshot: FrozenRevert): FrozenRevert;
}
