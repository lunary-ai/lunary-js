import "dotenv/config"
//@ts-ignore
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

console.log(process.env)
import { ChatOpenAI } from "langchain/chat_models/openai"
import { BaseTracer, Run } from "langchain/callbacks"

/// test console.trace
const kContextIdFunctionPrefix = "__context_id__"
const kContextIdRegex = new RegExp(`${kContextIdFunctionPrefix}([0-9]+)`)
let contextIdOffset = 0

function runWithContextId(target, ...args) {
  const contextId = ++contextIdOffset
  let proxy
  eval(
    `proxy = async function ${kContextIdFunctionPrefix}${contextId}(target, ...args){ return await target.call(this, ...args); }`
  )
  return proxy.call(this, target, ...args)
}

function getContextId() {
  const stack = new Error().stack.split("\n")
  for (const frame of stack) {
    const match = frame.match(kContextIdRegex)
    if (!match) {
      continue
    }

    const id = parseInt(match[1])
    if (isNaN(id)) {
      console.warn(
        `Context id regex matched, but failed to parse context id from ${match[1]}`
      )
      continue
    }

    return id
  }

  console.log(new Error().stack)
  throw new Error(
    "getContextId() called without providing a context (runWithContextId(...))"
  )
}
// end test

class ConsoleCallbackHandler extends BaseTracer {
  name = "consoleCallbackHandler"

  persistRun(_run: Run) {
    return Promise.resolve()
  }

  log() {
    console.log("LOG")
  }

  onChainStart(run: Run) {
    console.log(run)
  }

  onChainEnd(run: Run) {
    console.log(run)
  }

  onChainError(run: Run) {
    console.log(run)
  }

  onLLMStart(run: Run) {
    console.trace("Inside callback handler")
    // console.log(context.get()) // undefined

    // following doesn't work indeed
    // console.log("CONTEXT ID FROM HACK inside callback: " + getContextId()) // 123
    console.log("llm start\n")
  }

  onLLMEnd(run: Run) {
    // console.log(context.get(), context)
    console.log("llm end\n")
  }

  onLLMError(run: Run) {
    console.log(run)
  }

  onToolStart(run: Run) {
    console.log("tool start", console.log(this))
  }

  onToolEnd(run: Run) {
    console.log(run)
  }

  onToolError(run: Run) {
    console.log(run)
  }

  onRetrieverStart(run: Run) {
    console.log(run)
  }

  onRetrieverEnd(run: Run) {
    console.log(run)
  }

  onRetrieverError(run: Run) {
    console.log(run)
  }

  onAgentAction(run: Run) {
    console.log("agent action")
  }
}

const getCallbackHandler = () => {
  const contextId = getContextId()
  console.log("CONTEXT ID FROM TRACE getCallbackHandler: " + contextId) // 123
  return new ConsoleCallbackHandler(contextId as any)
}

async function translate(query: string) {
  console.log("CONTEXT ID FROM TRACE inside translate: " + getContextId()) // 123

  const chat = new ChatOpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
    callbacks: [getCallbackHandler()],
  })

  const res = await chat.call([
    new HumanChatMessage(
      `Translate this sentence from English to French: "${query}"`
    ),
  ])

  console.log(res)
}

runWithContextId(translate, "What's up")
