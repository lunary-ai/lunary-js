import { Event, cJSON } from "./types"

/**
 * Checks if the env variable exists in either Node or Deno.
 * @param {string} variable name
 * @returns {string | undefined}
 */
export const checkEnv = (variable: string): string | undefined => {
  if (typeof process !== "undefined" && process.env?.[variable]) {
    return process.env[variable]
  }

  // @ts-ignore
  if (typeof Deno !== "undefined" && Deno.env?.get(variable)) {
    // @ts-ignore
    return Deno.env.get(variable)
  }

  return undefined
}

// TODO: implement this
export const formatLog = (event: Event) => {
  return JSON.stringify(event, null, 2)
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

export const cleanError = (error: any) => {
  if (typeof error === "string")
    return {
      message: error,
    }
  else if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    }
  } else {
    error = new Error("Unknown error")
    return {
      message: error.message,
      stack: error.stack,
    }
  }
}

export const cleanExtra = (extra: object) => {
  return Object.fromEntries(Object.entries(extra).filter(([_, v]) => v != null))
}

// Replace {{variable}} with the value of the variable using regex
export const compileTemplate = (content: string, variables) => {
  const regex = /{{(.*?)}}/g
  return content.replace(regex, (_, g1) => variables[g1] || "")
}

// JavaScript program to get the function argument' names dynamically
// Works with both normal and arrow functions
// Inspired from : https://www.geeksforgeeks.org/how-to-get-the-javascript-function-parameter-names-values-dynamically/
function getArgumentNames(func) {
  // String representation of the function code
  let str = func.toString()

  // Remove comments of the form /* ... */
  // Removing comments of the form //
  // Remove body of the function { ... }
  // removing '=>' if func is arrow function
  str = str
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/(.)*/g, "")
    .replace(/{[\s\S]*}/, "")
    .replace(/=>/g, "")
    .trim()

  // Start parameter names after first '('
  const start = str.indexOf("(") + 1
  // End parameter names is just before last ')'
  const end = str.length - 1

  const result = str
    .substring(start, end)
    .split(",")
    .map((el) => el.trim())

  const params = []

  result.forEach((element) => {
    // Removing any default value
    element = element.replace(/=[\s\S]*/g, "").trim()
    if (element.length > 0) params.push(element)
  })

  return params
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

// Doesn't use the Crypto API (in some Edge environments, it's not available)
// and also doesn't fully rely on Math.random() (which is not cryptographically secure)
// https://stackoverflow.com/a/8809472
export const generateUUID = () => {
  let d = new Date().getTime(),
    d2 =
      (typeof performance !== "undefined" &&
        performance.now &&
        performance.now() * 1000) ||
      0
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    let r = Math.random() * 16
    if (d > 0) {
      r = (d + r) % 16 | 0
      d = Math.floor(d / 16)
    } else {
      r = (d2 + r) % 16 | 0
      d2 = Math.floor(d2 / 16)
    }
    return (c == "x" ? r : (r & 0x7) | 0x8).toString(16)
  })
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Forks a stream in two
// https://stackoverflow.com/questions/63543455/how-to-multicast-an-async-iterable

export const teeAsync = (iterable) => {
  const AsyncIteratorProto = Object.getPrototypeOf(
    Object.getPrototypeOf(async function* () {}.prototype)
  )

  const iterator = iterable[Symbol.asyncIterator]()
  const buffers = [[], []]

  function makeIterator(buffer, i) {
    const iter = Object.assign(Object.create(AsyncIteratorProto), {
      next() {
        if (!buffer) return Promise.resolve({ done: true, value: undefined })
        if (buffer.length) return buffer.shift()
        const res = iterator.next()
        if (buffers[i ^ 1]) buffers[i ^ 1].push(res)
        return res
      },
      async return() {
        if (buffer) {
          buffer = buffers[i] = null
          if (!buffers[i ^ 1]) await iterator.return()
        }
        return { done: true, value: undefined }
      },
      [Symbol.asyncIterator]() {
        return this
      },
    })

    // Copy over any additional properties from the original iterable
    return Object.assign(iter, {
      controller: iterable.controller,
      // Copy any other important properties you need to preserve
    })
  }

  return buffers.map(makeIterator)
}
