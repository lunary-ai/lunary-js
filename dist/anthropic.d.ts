import { WrapExtras, WrappedFn } from './types.js';
import { Anthropic } from '@anthropic-ai/sdk';

declare function monitorAnthrophic<T extends Anthropic>(client: T, extras?: WrapExtras): T;
declare function wrapAgent(fn: any, extras?: {}): WrappedFn<any>;
declare function wrapTool(fn: any, extras?: {}): WrappedFn<any>;

export { monitorAnthrophic as default, monitorAnthrophic, wrapAgent, wrapTool };
