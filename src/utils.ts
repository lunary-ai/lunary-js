// @ts-nocheck

import { Event } from "./types"

/*
 * Checks if the variable is exists in both Node and Deno.
 * @param {string} variable
 * @returns {string | undefined}
 */
export const checkEnv = (variable) => {
  if (typeof process !== "undefined" && process.env?.[variable]) {
    return process.env[variable]
  }

  if (typeof Deno !== "undefined" && Deno.env?.get(variable)) {
    return Deno.env.get(variable)
  }

  return undefined
}

// TODO: implement this
export const formatLog = (event: Event) => {
  console.log(JSON.stringify(event, null, 2))
}

export const debounce = (func, timeout = 500) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, timeout)
  }
}

export const LANGCHAIN_ARGS_TO_REPORT = [
  "temperature",
  "modelName",
  "streaming",
  "tags",
  "streaming",
]

export const cleanError = (error: any) => {
  if (typeof error === "string")
    return {
      message: error,
    }

  return {
    message: error.message,
    stack: error.stack,
  }
}

export const getArgumentNames = (func: Function): string[] => {
  const funcString = func.toString().replace(/[\r\n\s]+/g, " ")
  const result = funcString
    .slice(funcString.indexOf("(") + 1, funcString.indexOf(")"))
    .match(/([^\s,]+)/g)
  if (result === null) return []
  else return result
}

export const getFunctionInput = (func: Function, args: any) => {
  const argNames = getArgumentNames(func)

  // If there is only one argument, use its value as input
  // Otherwise, build an object with the argument names as keys
  const input =
    argNames.length === 1
      ? args[0]
      : argNames.reduce((obj, argName, index) => {
          obj[argName] = args[index]
          return obj
        }, {} as { [key: string]: any })

  return input
}
