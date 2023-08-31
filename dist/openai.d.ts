import { WrapExtras, WrappedFn, WrappedReturn } from './types.js';
import OpenAI from 'openai';
import { APIPromise } from 'openai/core';
import OpenAIStreaming from 'openai/streaming';

type WrappedOldOpenAi<T> = Omit<T, "createChatCompletion"> & {
    createChatCompletion: WrappedFn<T["createChatCompletion"]>;
};
type CreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => U;
type WrapCreateFunction<T, U> = (body: T, options?: OpenAI.RequestOptions) => WrappedReturn<CreateFunction<T, U>>;
type WrapCreate<T> = {
    chat: {
        completions: {
            create: WrapCreateFunction<OpenAI.Chat.CompletionCreateParamsNonStreaming, APIPromise<OpenAI.Chat.ChatCompletion>> & WrapCreateFunction<OpenAI.Chat.CompletionCreateParamsStreaming, APIPromise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>>> & WrapCreateFunction<OpenAI.Chat.CompletionCreateParams, APIPromise<OpenAIStreaming.Stream<OpenAI.Chat.ChatCompletionChunk>> | APIPromise<OpenAI.Chat.ChatCompletion>>;
        };
    };
};
type WrappedOpenAi<T> = Omit<T, "chat"> & WrapCreate<T>;
declare function openAIv3<T extends any>(openai: T, params?: WrapExtras): WrappedOldOpenAi<T>;
declare function monitorOpenAI<T extends any>(openai: T, params?: WrapExtras): WrappedOpenAi<T>;

export { monitorOpenAI, openAIv3 };
