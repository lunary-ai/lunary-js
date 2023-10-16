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
    model: "gpt-4",
    temperature: 0,
    tags: ["test-tag"],
    user: "user123",
    userProps: {
      name: "John",
    },
    messages: [
      {
        role: "system",
        content:
          "You are a translator agent that hides jokes in each translation.",
      },
      {
        role: "user",
        content: `Translate this sentence from English to French: ${input}`,
      },
    ],
    // stream: true,
    functions: [
      {
        name: "get_current_weather",
        description: "Get the current weather.",
        parameters: {
          type: "object",
          properties: {
            format: {
              type: "string",
              enum: ["celsius", "fahrenheit"],
              description: "The temperature unit to use.",
            },
          },
          required: ["format"],
        },
      },
    ],
  })

  // for await (const part of stream) {
  //   process.stdout.write(part.choices[0]?.delta?.content || "")
  // }

  return res.choices[0].message.content
}

const translate = monitor.wrapAgent(TranslatorAgent)

// Identify the user directly at the agent level
const res = await translate(`Hello, what's your name?`).identify("user123")

console.log(res)
