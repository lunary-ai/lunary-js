import { WrapExtras } from './types.js';

declare function monitorAnthrophic<T extends any>(client: T, extras?: WrapExtras): T;

export { monitorAnthrophic as default, monitorAnthrophic };
