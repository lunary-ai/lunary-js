import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

// This extends the openai object with the monitor
const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

async function streaming(input) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    temperature: 0,
    stream: true,
    tags: ["translate"],
    user: "user123",
    seed: 123,
    userProps: {
      name: "John Doe",
    },

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

  return
}

async function nonStreaming(input) {
  const res = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    temperature: 0,
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

  return res.choices[0].message.content
}

await streaming("bonjour")
// await nonStreaming("bonjour")
