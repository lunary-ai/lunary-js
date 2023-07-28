import "dotenv/config"

import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

// import { context } from "./context.ts"
import { BaseTracer, Run } from "langchain/callbacks"
import { AsyncContext } from "./context/index.js"
import { ChatOpenAI } from "langchain/chat_models/openai"

const context = new AsyncContext("context1")
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
    console.log(context.get()) // undefined
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

const callbackHandler = new ConsoleCallbackHandler()

const chat = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  callbacks: [callbackHandler],
})

async function translate(query: string) {
  await context.run("123", async () => {
    console.log(context.get()) // 123
    console.trace("Outside callback handler")
    const res = await chat.call([
      new SystemChatMessage(
        "You are a translator agent that uses as much slang as possible."
      ),
      new HumanChatMessage(
        `Translate this sentence from English to French: "${query}"`
      ),
    ])
    return res.text
  })
}

translate("What's up")
