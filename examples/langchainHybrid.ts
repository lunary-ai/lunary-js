import { SystemMessage, HumanMessage } from "langchain/schema"
import { ChatOpenAI } from "langchain/chat_models/openai"
import monitor from "../src/index"

const Chat = monitor.langchain(ChatOpenAI)

const chat = new Chat({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
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

const megaAgent = monitor.wrapAgent(async function MegaAgent(query: string) {
  // translate
  const translated = await translate(query)

  // chat
  const res = await chat.call([
    new SystemMessage(
      "You are a french chat agent that uses as much slang and youngsters expressions as possible."
    ),
    new HumanMessage(translated),
  ])

  return res.content
})

// translate("What's up").then(console.log)
megaAgent("Hello friend").then(console.log)
