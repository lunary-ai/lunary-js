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

// Langchain Helpers
// Input can be either a single message, an array of message, or an array of array of messages (batch requests)

export const parseLangchainMessages = (input: any | any[] | any[][]): cJSON => {
  const parseRole = (id: string[]) => {
    const roleHint = id[id.length - 1]

    if (roleHint.includes("Human")) return "user"
    if (roleHint.includes("System")) return "system"
    if (roleHint.includes("AI")) return "ai"
    if (roleHint.includes("Function")) return "function"
  }

  const parseMessage = (raw: any) => {
    if (typeof raw === "string") return raw
    // sometimes the message is nested in a "message" property
    if (raw.message) return parseMessage(raw.message)

    const message = JSON.parse(JSON.stringify(raw))

    try {
      // "id" contains an array describing the constructor, with last item actual schema type
      const role = parseRole(message.id)

      const obj = message.kwargs
      const text = message.text ?? obj.content
      const kwargs = obj.additionalKwargs

      return {
        role,
        text,
        ...kwargs,
      }
    } catch (e) {
      // if parsing fails, return the original message
      return message.text ?? message
    }
  }

  if (Array.isArray(input)) {
    return input.length === 1
      ? parseLangchainMessages(input[0])
      : input.map(parseMessage)
  }
  return parseMessage(input)
}

export const parseOpenaiMessage = (message) => {
  if (!message) return undefined

  // Is name (of the function gpt wanted to call) actually useful to report?
  const { role, content, name, function_call } = message

  return {
    role: role.replace("assistant", "ai"),
    text: content,
    function_call: function_call as cJSON,
  }
}

export const getInstanceParentClass = (obj: any) =>
  Object.getPrototypeOf(obj.constructor)

// https://stackoverflow.com/questions/63543455/how-to-multicast-an-async-iterable

const AsyncIteratorProto = Object.getPrototypeOf(
  Object.getPrototypeOf(async function* () {}.prototype)
)

export const teeAsync = (iterable) => {
  const iterator = iterable[Symbol.asyncIterator]()
  const buffers = [[], []]
  function makeIterator(buffer, i) {
    return Object.assign(Object.create(AsyncIteratorProto), {
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
    })
  }
  return buffers.map(makeIterator)
}
