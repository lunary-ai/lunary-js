import type { Mapping } from "./mapping";
import type { AsyncContext } from "./index";
/**
 * FrozenRevert holds a frozen Mapping that will be simply restored when the
 * revert is run.
 *
 * This is used when we already know that the mapping is frozen, so that
 * reverting will not attempt to mutate the Mapping (and allocate a new
 * mapping) as a Revert would.
 */
export declare class FrozenRevert {
    #private;
    constructor(mapping: Mapping);
    /**
     * The Storage container will call restore when it wants to revert its
     * current Mapping to the state at the start of the fork.
     *
     * For FrozenRevert, that's as simple as returning the known-frozen Mapping,
     * because we know it can't have been modified.
     */
    restore(_current: Mapping): Mapping;
}
/**
 * Revert holds the information on how to undo a modification to our Mappings,
 * and will attempt to modify the current state when we attempt to restore it
 * to its prior state.
 *
 * This is used when we know that the Mapping is unfrozen at start, because
 * it's possible that no one will snapshot this Mapping before we restore. In
 * that case, we can simply modify the Mapping without cloning. If someone did
 * snapshot it, then modifying will clone the current state and we restore the
 * clone to the prior state.
 */
export declare class Revert<T> {
    #private;
    constructor(mapping: Mapping, key: AsyncContext<T>);
    /**
     * The Storage container will call restore when it wants to revert its
     * current Mapping to the state at the start of the fork.
     *
     * For Revert, we mutate the known-unfrozen-at-start mapping (which may
     * reallocate if anyone has since taken a snapshot) in the hopes that we
     * won't need to reallocate.
     */
    restore(current: Mapping): Mapping;
}
