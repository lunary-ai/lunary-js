"use strict";
// @ts-nocheck
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageAdapter = exports.getDefaultAppId = void 0;
const getDefaultAppId = () => {
    var _a, _b;
    if (typeof process !== "undefined" && ((_a = process.env) === null || _a === void 0 ? void 0 : _a.LLMONITOR_APP_ID)) {
        return process.env.LLMONITOR_APP_ID;
    }
    if (typeof Deno !== "undefined" && ((_b = Deno.env) === null || _b === void 0 ? void 0 : _b.get("LLMONITOR_APP_ID"))) {
        return Deno.env.get("LLMONITOR_APP_ID");
    }
    return undefined;
};
exports.getDefaultAppId = getDefaultAppId;
const messageAdapter = (variable) => {
    let message;
    let chat;
    if (typeof variable === "string") {
        message = variable;
        chat = undefined;
    }
    else if (Array.isArray(variable)) {
        const last = variable[variable.length - 1];
        message = last.text || last.content;
        chat = message;
    }
    else if (typeof variable === "object") {
        message = variable.text || variable.content;
        chat = message;
    }
    return { message, chat };
};
exports.messageAdapter = messageAdapter;
