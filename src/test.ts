import "dotenv/config"

import { SystemMessage, HumanMessage } from "langchain/schema"

import { BaseTracer, Run } from "langchain/callbacks"
import { ChatOpenAI } from "langchain/chat_models/openai"
import context from "./context"
import monitor from "./index"

// class ConsoleCallbackHandler extends BaseTracer {
//   name = "consoleCallbackHandler"

//   persistRun(_run: Run) {
//     return Promise.resolve()
//   }

//   log() {
//     console.log("LOG")
//   }

//   onChainStart(run: Run) {
//     console.log(run)
//   }

//   onChainEnd(run: Run) {
//     console.log(run)
//   }

//   onChainError(run: Run) {
//     console.log(run)
//   }

//   onLLMStart(run: Run) {
//     console.trace("Inside callback handler")
//     console.log(context.get()) // undefined
//     console.log("llm start\n")
//   }

//   onLLMEnd(run: Run) {
//     // console.log(context.get(), context)
//     console.log("llm end\n")
//   }

//   onLLMError(run: Run) {
//     console.log(run)
//   }

//   onToolStart(run: Run) {
//     console.log("tool start", console.log(this))
//   }

//   onToolEnd(run: Run) {
//     console.log(run)
//   }

//   onToolError(run: Run) {
//     console.log(run)
//   }

//   onRetrieverStart(run: Run) {
//     console.log(run)
//   }

//   onRetrieverEnd(run: Run) {
//     console.log(run)
//   }

//   onRetrieverError(run: Run) {
//     console.log(run)
//   }

//   onAgentAction(run: Run) {
//     console.log("agent action")
//   }
// }

const Chat = monitor.langchain(ChatOpenAI)

const chat = new Chat({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  // callbacks: [new ConsoleCallbackHandler()],
})

const translate = monitor.wrapAgent(async function Translator(query: string) {
  const res = await chat.call([
    new SystemMessage(
      "You are a translator agent that uses as much slang as possible."
    ),
    new HumanMessage(
      `Translate this sentence from English to French: "${query}"`
    ),
  ])
  return res.content
})

translate("What's up")
translate("Hello friend")
