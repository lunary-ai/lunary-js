import OpenAI from "openai"
import { monitorOpenAI } from "../src/openai"
import lunary from "../src"

const openai = new OpenAI()

monitorOpenAI(openai)

const chatCompletion = await openai.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Generate a random string of 10 letters",
    },
  ],
  model: "gpt-4-turbo-preview",
})

await lunary.flush() // the chat completion output should be shown on the dashboard
process.exit(0)
