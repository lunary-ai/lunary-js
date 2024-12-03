import Anthropic from '@anthropic-ai/sdk';
import { WrapExtras } from './types.cjs';
import { Stream } from '@anthropic-ai/sdk/streaming.mjs';
import { MessageStream } from '@anthropic-ai/sdk/lib/MessageStream.mjs';

type CustomProps = {
    userId?: string;
    userProps?: Record<string, any>;
    tags?: string[];
    metadata?: Record<string, any>;
    templateId?: string;
};
type BaseCreateParams = Anthropic.MessageCreateParamsNonStreaming;
type BaseStreamParams = Anthropic.MessageCreateParamsStreaming;
type BaseOptions = Anthropic.RequestOptions;
type WrappedAnthropic<T> = Omit<T, "messages"> & {
    messages: {
        create: {
            (params: BaseCreateParams & CustomProps, options?: BaseOptions): Anthropic.Message;
            (params: BaseStreamParams & CustomProps, options?: BaseOptions): Stream<Anthropic.MessageStreamEvent>;
        };
        stream: (params: Anthropic.MessageStreamParams & CustomProps, options?: BaseOptions) => MessageStream;
    };
};
declare function monitorAnthropic<T extends Anthropic>(anthropic: T, params?: WrapExtras): WrappedAnthropic<T>;

export { monitorAnthropic };
