import { ChatOpenAI } from "@langchain/openai"
import { LunaryHandler } from "../src/langchain"

const handler = new LunaryHandler()

const chatModel = new ChatOpenAI({
  modelName: "gpt-4-turbo-preview",
})

const res = await chatModel.invoke("What is 1+1?", {
  callbacks: [handler],
  metadata: {
    thisIsA: "metadata",
    name: "gptizer",
    userId: "user123",
  },
})

console.log(res.content)
