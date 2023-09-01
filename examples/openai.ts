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

async function TranslatorAgent(input) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0613",
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
  })

  return res.choices[0].message.content
}

const translate = monitor.wrapAgent(TranslatorAgent)

const res = await translate("Hello, what's your name").identify("user123")

console.log(res)
