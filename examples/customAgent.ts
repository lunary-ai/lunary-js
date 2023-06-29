// Basic agent tracking example

import { ChatOpenAI } from "langchain/chat_models/openai"

import { extendModel, AgentMonitor } from "../lib/index.js"

import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

const monitor = new AgentMonitor({
  name: "translator",
  tags: ["some", "tags"],
})

const MonitoredChat = extendModel(ChatOpenAI)

const main = async () => {
  const chat = new MonitoredChat({
    temperature: 0.2,
    modelName: "gpt-3.5-turbo",
    monitor,
    tags: ["test-tag"],
  })

  const res = await chat.call([
    new SystemChatMessage("You are a translator agent."),
    new HumanChatMessage(
      "Translate this sentence from English to French. I love programming."
    ),
  ])

  return res
}

main()
