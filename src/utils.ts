// @ts-nocheck

import { LLMInput, LLMOutput } from "./types"

export const getDefaultAppId = () => {
  if (typeof process !== "undefined" && process.env?.LLMONITOR_APP_ID) {
    return process.env.LLMONITOR_APP_ID
  }

  if (typeof Deno !== "undefined" && Deno.env?.get("LLMONITOR_APP_ID")) {
    return Deno.env.get("LLMONITOR_APP_ID")
  }

  return undefined
}

export const messageAdapter = (variable: LLMInput | LLMOutput) => {
  let message
  let chat

  if (typeof variable === "string") {
    message = variable
    chat = undefined
  } else if (Array.isArray(variable)) {
    const last = variable[variable.length - 1]
    message = last.text || last.content
    chat = message
  } else if (typeof variable === "object") {
    message = variable.text || variable.content
    chat = message
  }

  return { message, chat }
}

