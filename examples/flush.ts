import OpenAI from "openai"
import { monitorOpenAI } from "../src/openai"
import lunary from "../src"

const openai = monitorOpenAI(new OpenAI())

const chatCompletion = await openai.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Generate a random string of 10 letters",
    },
  ],
  metadata: {
    flushed: true,
  },
  model: "gpt-4-turbo-preview",
})

console.log(chatCompletion.choices[0].message.content)

await lunary.flush() // the chat completion output should be shown on the dashboard
process.exit(0)
