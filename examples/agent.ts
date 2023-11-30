// Langchain custom agent example

import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"

import monitor from "../src"

const chat = new ChatOpenAI({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
  tags: ["test-tag"],
})

async function TranslatorAgent(query: string): Promise<string> {
  const res = await chat.call([
    new SystemMessage(
      "You are a translator agent that hides jokes in each translation."
    ),
    new HumanMessage(
      `Translate this sentence from English to French: ${query}`
    ),
  ])

  return res.content
}

// By wrapping the executor, we automatically track all input, outputs and errors
// And tools and logs will be tied to the correct agent
const translate = monitor.wrapAgent(TranslatorAgent)

const res = await translate("White house").identify("user123", {
  email: "john@example.org",
})
// .label(["test-tag"])

console.log(res)
