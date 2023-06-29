import { Event, LLMInput, LLMOutput } from "./types";
export declare const checkEnv: (variable: any) => any;
export declare const formatLog: (event: Event) => string;
export declare const messageAdapter: (variable: LLMInput | LLMOutput) => {
    message: any;
    history: any[] | undefined;
};
export declare const debounce: (func: any, timeout?: number) => (...args: any[]) => void;
