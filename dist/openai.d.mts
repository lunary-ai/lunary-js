import { c as WrapExtras, b as WrappedFn, d as WrappedReturn } from './types-a5e0fc7f.js';
import OpenAI from 'openai';
import OpenAIStreaming from 'openai/streaming';

declare const teeAsync: (iterable: any) => any[];
type WrappedOldOpenAi<T> = Omit<T, "createChatCompletion"> & {
    createChatCompletion: WrappedFn<T["createChatCompletion"]>;
};
type CreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => U;
type WrapCreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => WrappedReturn<CreateFunction<T, U>>;
type WrapCreate<T> = {
    chat: {
        completions: {
            create: WrapCreateFunction<OpenAI.Chat.CompletionCreateParamsNonStreaming, Promise<OpenAI.Chat.ChatCompletion>> & WrapCreateFunction<OpenAI.Chat.CompletionCreateParamsStreaming, Promise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>>> & WrapCreateFunction<OpenAI.Chat.CompletionCreateParams, Promise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>> | Promise<OpenAI.Chat.ChatCompletion>>;
        };
    };
};
type WrappedOpenAi<T> = Omit<T, "chat"> & WrapCreate<T>;
declare function openAIv3<T extends any>(openai: T, params?: WrapExtras): WrappedOldOpenAi<T>;
declare function monitorOpenAI<T extends any>(openai: T, params?: WrapExtras): WrappedOpenAi<T>;

export { monitorOpenAI, openAIv3, teeAsync };
