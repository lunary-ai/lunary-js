import "dotenv/config"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage } from "langchain/schema"
import monitor from "../src/index"

// monitor.load({ log: true })

monitor(ChatOpenAI)

const chat = new ChatOpenAI({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
  tags: ["test-tag"],
})

async function main(query: string) {
  const res = await chat.call([
    new SystemMessage("You are a translator agent."),
    new HumanMessage(
      `Translate this sentence from English to French. ${query}`
    ),
  ])

  console.log(res.content)
}

main("Hello friend")
