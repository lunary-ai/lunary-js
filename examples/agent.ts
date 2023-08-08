import "dotenv/config"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"
import monitor, { llmonitor } from "../src"

const chat = new ChatOpenAI({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
  tags: ["test-tag"],
})

llmonitor.identify("123", {
  email: "my-user@example.org",
})
monitor(chat)

const TranslatorAgent = async (query) => {
  console.log(query)
  const res = await chat.call([
    new SystemMessage("You are a translator agent."),
    new HumanMessage(
      `Translate this sentence from English to French. ${query}`
    ),
  ])

  return res.content
}

// By wrapping the executor, we automatically track all input, outputs and errors
// And tools and logs will be tied to the correct agent
const translate = llmonitor.wrapAgent(TranslatorAgent, { name: "translate" })

translate("Hello, what's up").then((res) => {
  console.log(res) // "Bonjour, comment allez-vous?"
})
