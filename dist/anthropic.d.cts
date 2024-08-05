import { WrapExtras } from './types.cjs';

declare function monitorAnthrophic<T extends any>(client: T, extras?: WrapExtras): T;

export { monitorAnthrophic as default, monitorAnthrophic };
