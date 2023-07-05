// Basic agent monitoring example
import "https://deno.land/std@0.192.0/dotenv/load.ts"

import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

import { AgentMonitor } from "../lib/index.js"

const monitor = new AgentMonitor({
  name: "translator",
  log: true,
})

const MonitoredChat = monitor.extendModel(ChatOpenAI)

// By wrapping the executor, we can track all input, outputs and errors
// And tools and logs will be tied to the correct agent
const translate = monitor.wrapExecutor(async (query) => {
  const chat = new MonitoredChat({
    temperature: 1,
    modelName: "gpt-3.5-turbo",
    tags: ["test-tag"],
  })

  monitor.log("Logging from inside the agent")

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

translate("Hello, it's a nice day isn't it?").then((res) => {
  console.log(res) // "Bonjour, comment allez-vous?"
})
