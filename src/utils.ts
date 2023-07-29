import { ChatMessage, Event } from "./types"

/*
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

// Langchain Helpers
// Input can be either a single message, an array of message, or an array of array of messages (batch requests)

export const parseLangchainMessages = (
  input: any | any[] | any[][]
): ChatMessage | ChatMessage[] | ChatMessage[][] => {
  const parseRole = (id: string[]) => {
    const roleHint = id[id.length - 1]

    if (roleHint.includes("Human")) return "user"
    if (roleHint.includes("System")) return "system"
    if (roleHint.includes("AI")) return "ai"
    if (roleHint.includes("Function")) return "function"
  }

  const parseMessage = (raw) => {
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
