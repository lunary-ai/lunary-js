import "dotenv/config"
import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

async function main() {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
    messages: [
      {
        role: "user",
        content: `Hello, I'm a human.`,
      },
    ],
    stream: true,
  })

  for await (const part of stream) {
    // process.stdout.write(part.choices[0]?.delta?.content || "")
    console.log(part.choices[0]?.delta)
  }
}

main()
