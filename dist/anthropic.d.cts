import Anthropic from '@anthropic-ai/sdk';
import { WrapExtras, Template, WrappedReturn, cJSON } from './types.cjs';

type AnthropicRequestOptions = Parameters<Anthropic["messages"]["create"]>[1];
type AnthropicCreateFunction<T, U> = (body: T, options?: AnthropicRequestOptions) => U;
type NewParams = {
    tags?: string[];
    userId?: string;
    userProps?: cJSON;
    metadata?: cJSON;
    templateId?: string;
};
type WrapCreateFunction<T, U> = (body: (T & NewParams) | Template | (Template & T), options?: AnthropicRequestOptions) => WrappedReturn<AnthropicCreateFunction<T, U>>;
type WrapCreate<T> = {
    messages: {
        create: WrapCreateFunction<any, any>;
    };
} & T;
type WrappedAnthropic<T> = Omit<T, "messages"> & WrapCreate<T>;
type AnthropicLike = {
    messages?: {
        create?: (...args: any[]) => any;
    };
    beta?: {
        messages?: {
            create?: (...args: any[]) => any;
        };
    };
};
declare function monitorAnthropic<T extends AnthropicLike>(anthropic: T, params?: WrapExtras): WrappedAnthropic<T>;

export { monitorAnthropic };
