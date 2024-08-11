import { WrapExtras } from './types.cjs';
import { Anthropic } from '@anthropic-ai/sdk';

declare function monitorAnthrophic<T extends Anthropic>(client: T, extras?: WrapExtras): T;

export { monitorAnthrophic as default, monitorAnthrophic };
