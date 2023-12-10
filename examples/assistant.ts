import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

// This extends the openai object with the monitor
const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

const assistant = await openai.beta.assistants.create({
  instructions:
    "You are a personal math tutor. When asked a math question, write and run code to answer the question.",
  model: "gpt-4-1106-preview",
  tools: [{ type: "code_interpreter" }],
})

console.log(assistant)

const thread = await openai.beta.threads.create({
  messages: [
    {
      role: "user",
      content: "Hello!",
    },
    {
      role: "user",
      content: "How can I help?",
    },
  ],
})

const message = await openai.beta.threads.messages.create(thread.id, {
  role: "user",
  content: "What is 2 + 2?",
})

console.log(thread)

const run = await openai.beta.threads.runs.create(thread.id, {
  assistant_id: assistant.id,
})

console.log(run)

const messages = await openai.beta.threads.messages.list(thread.id)

console.log(messages)
