import OpenAI from "openai"
import { monitorOpenAI } from "../src/openai"

const openai = monitorOpenAI(new OpenAI())

const chatCompletion = await openai.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Generate 1 fake diner's club number for testing in my form.",
    },
  ],
  model: "gpt-4-turbo-preview",
})
console.log(chatCompletion.choices[0])
