import OpenAI from "openai"
import { monitorOpenAI } from "../src/openai"
import lunary from "../src"

const openai = new OpenAI()

monitorOpenAI(openai)

console.log(lunary.queue)
const chatCompletion = await openai.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Generate a random string of 10 letters",
    },
  ],
  model: "gpt-4-turbo-preview",
})

console.log(lunary.queue)
await lunary.flush()
process.exit(0)

// console.log(chatCompletion.choices[0])
