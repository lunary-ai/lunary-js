import { LLMInput, LLMOutput } from "./types";
export declare const getDefaultAppId: () => any;
export declare const messageAdapter: (variable: LLMInput | LLMOutput) => {
    message: any;
    chat: any;
};
