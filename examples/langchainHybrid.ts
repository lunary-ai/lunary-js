import { SystemMessage, HumanMessage } from "langchain/schema"
import { ChatOpenAI } from "langchain/chat_models/openai"
import monitor from "../src/index"

const Chat = monitor.langchain(ChatOpenAI)

const chat = new Chat({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
})

const translate = monitor.wrapAgent(async function Translator(
  query: string,
  language: string
) {
  const res = await chat.call([
    new SystemMessage(
      "You are a translator agent that uses as much slang as possible."
    ),
    new HumanMessage(`Translate this sentence to ${language}: "${query}"`),
  ])
  return res.content
})

const megaAgent = monitor.wrapAgent(async function MegaAgent(query: string) {
  // translate
  console.log("Translating1")
  const translated = await translate(query, "french")

  console.log("Translating2")
  const reTranslated = await translate(translated, "taiwanese mandarin")

  // chat
  console.log("Chatting")
  const res = await chat.call([
    new SystemMessage(
      "You are a chat agent that uses as much slang and youngsters expressions as possible."
    ),
    new HumanMessage(reTranslated),
  ])

  return res.content
})

megaAgent("Hello friend").then(console.log)
