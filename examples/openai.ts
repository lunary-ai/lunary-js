import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

// This extends the openai object with the monitor
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const monitored = monitorOpenAI(openai)

async function TranslatorAgent(input) {
  const stream = await monitored.chat.completions.create({
    model: "gpt-4-1106-preview",
    temperature: 0,
    stream: true,
    tags: ["translate"],
    user: "user123",
    seed: 123,
    userProps: {
      name: "John Doe",
    },
    tools: [
      {
        type: "function",
        function: {
          name: "translate",
          parameters: {
            type: "object",
            properties: {
              text: { type: "string" },
              from: { type: "string" },
              to: { type: "string" },
            },
          },
        },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Hello, translate ${input} from french to english`,
      },
    ],
  })

  for await (const part of stream) {
    process.stdout.write(part.choices[0]?.delta?.content || "")
  }

  // console.log(stream.choices[0].message)

  return //res.choices[0].message.content
}

const translate = monitor.wrapAgent(TranslatorAgent)

// Identify the user directly at the agent level
const res = await translate(`Glad to hear that.`).identify("user123")

console.log(res)
