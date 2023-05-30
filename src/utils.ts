// @ts-nocheck

import { Event, LLMInput, LLMOutput } from "./types"

export const checkEnv = (variable) => {
  if (typeof process !== "undefined" && process.env?.[variable]) {
    return process.env[variable]
  }

  if (typeof Deno !== "undefined" && Deno.env?.get(variable)) {
    return Deno.env.get(variable)
  }

  return undefined
}

// TODO: use colors for different event types
export const formatLog = (event: Event) => {
  const { type, message, extra, model } = event

  return `[LLMonitor: ${type}] ${model ? `(${model})` : ""} ${message || ""} ${
    extra ? "\n" + JSON.stringify(extra, null, 2) : ""
  } `
}

// TODO: better support for langchain JS
export const messageAdapter = (variable: LLMInput | LLMOutput) => {
  let message
  let history

  if (typeof variable === "string") {
    message = variable
    history = undefined
  } else if (Array.isArray(variable)) {
    const last = variable[variable.length - 1]
    message = last.text || last.content
    history = variable
  } else if (typeof variable === "object") {
    message = variable.text || variable.content
    history = [variable]
  }

  return { message, history }
}

export const debounce = (func, timeout = 50) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}
