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

async function TranslatorAgent(input) {
  const res = await openai.chat.completions.create({
    model: "gpt-4-1106-preview",
    temperature: 0,
    tags: ["test-tag"],
    user: "user123",
    seed: 123,
    userProps: {
      name: "John",
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
        content: `Hello, translate ${input} from english to french`,
      },
    ],
  })

  // for await (const part of stream) {
  //   process.stdout.write(part.choices[0]?.delta?.content || "")
  // }

  console.log(res.choices[0].message)

  return res.choices[0].message.content
}

const translate = monitor.wrapAgent(TranslatorAgent)

// Identify the user directly at the agent level
const res = await translate(`Hello, what's your name?`).identify("user123")

console.log(res)
