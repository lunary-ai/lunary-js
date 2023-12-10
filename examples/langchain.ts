import { LunaryHandler } from "langchain/callbacks/handlers/lunary"
import { initializeAgentExecutorWithOptions } from "langchain/agents"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { Calculator } from "langchain/tools/calculator"

const tools = [new Calculator()]
const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo", temperature: 0 })

const executor = await initializeAgentExecutorWithOptions(tools, chat, {
  agentType: "openai-functions",
})

// Adding the handler to the `run` method will automatically add it to LLM runs
const result = await executor.run(
  "What is the approximate result of 78 to the power of 5?",
  {
    callbacks: [new LunaryHandler()],
    metadata: { agentName: "SuperCalculator" }, // Give a name to your agent to track it in the dashboard
  }
)

console.log(result)
