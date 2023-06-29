// Basic agent monitoring example

import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

import { extendModel, AgentMonitor } from "../lib/index.js"

const MonitoredChat = extendModel(ChatOpenAI)

// By using AgentMonitor, all sub LLM calls, tools and logs will be linked to the agent.
const monitor = new AgentMonitor({
  name: "translator",
  userId: "test-user",
})

const translate = async (query) => {
  const chat = new MonitoredChat({
    temperature: 0.2,
    modelName: "gpt-3.5-turbo",
    monitor, // Here we use our agent monitor to link all calls made to the agent
    tags: ["test-tag"],
  })

  /* Optional: track tools:
   * const tool = monitor.wrapTool("tool-name", toolFunc)
   * const res = await tool("tool-input")
   */

  const res = await chat.call([
    new SystemChatMessage("You are a translator agent."),
    new HumanChatMessage(
      `Translate this sentence from English to French. ${query}`
    ),
  ])

  return res
}

// By wrapping it, errors, inputs and outputs will be tracked
const trackedAgent = monitor.wrapExecutor(translate)

trackedAgent("Hello, how are you?")
