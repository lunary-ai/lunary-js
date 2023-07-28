import { Event } from "./types";
export declare const checkEnv: (variable: any) => any;
export declare const formatLog: (event: Event) => void;
export declare const debounce: (func: any, timeout?: number) => (...args: any[]) => void;
export declare const LANGCHAIN_ARGS_TO_REPORT: string[];
export declare const cleanError: (error: any) => {
    message: string;
    stack?: undefined;
} | {
    message: any;
    stack: any;
};
export declare const getArgumentNames: (func: Function) => string[];
export declare const getFunctionInput: (func: Function, args: any) => any;
