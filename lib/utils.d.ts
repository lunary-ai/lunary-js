import { LLMInput, LLMOutput } from "./types";
export declare const checkEnv: (variable: any) => any;
export declare const messageAdapter: (variable: LLMInput | LLMOutput) => {
    message: any;
    history: import("./types").ChatMessage[] | undefined;
};
