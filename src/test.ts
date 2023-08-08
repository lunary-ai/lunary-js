import "dotenv/config"
// Basic agent monitoring example
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"
import { llmonitor } from "src"

const Chat = llmonitor.langchain(ChatOpenAI)

const chat = new Chat({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
  tags: ["test-tag"],
})

const TranslatorAgent = async (query) => {
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
const translate = llmonitor.wrapAgent(TranslatorAgent)

translate("Hello, how are you?").then((res) => {
  console.log(res) // "Bonjour, comment allez-vous?"
})
