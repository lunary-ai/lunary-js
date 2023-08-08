import { Event, cJSON } from "./types";
import { ChatCompletionRequestMessage } from "openai";
/**
 * Checks if the env variable exists in either Node or Deno.
 * @param {string} variable name
 * @returns {string | undefined}
 */
export declare const checkEnv: (variable: string) => string | undefined;
export declare const formatLog: (event: Event) => void;
export declare const debounce: (func: any, timeout?: number) => (...args: any[]) => void;
export declare const cleanError: (error: any) => {
    message: string;
    stack?: undefined;
} | {
    message: any;
    stack: any;
};
export declare const cleanExtra: (extra: object) => {
    [k: string]: any;
};
export declare const getArgumentNames: (func: Function) => string[];
export declare const getFunctionInput: (func: Function, args: any) => any;
export declare const parseLangchainMessages: (input: any | any[] | any[][]) => cJSON;
export declare const parseOpenaiMessage: (message?: ChatCompletionRequestMessage) => {
    role: string;
    text: string;
    function_call: cJSON;
};
export declare const getInstanceParentClass: (obj: any) => any;
