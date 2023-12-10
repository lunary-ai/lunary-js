import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const thread = monitor.openThread()

const id = thread.trackMessage({
  role: "user",
  content: "Hello",
})

const res = await openai.chat.completions
  .create({
    model: "gpt-3.5-turbo",
    temperature: 1,
    messages: [
      {
        role: "user",
        content: "Hello",
      },
    ],
  })
  .setParent(id)

console.log(res.choices[0].message.content)

await sleep(500)

thread.trackMessage({
  role: "assistant",
  content: res.choices[0].message.content,
  feedback: {
    thumbs: "up",
  },
})

await sleep(500)

thread.trackMessage({
  role: "assistant",
  isRetry: true,
  content: res.choices[0].message.content + " (retry)",
})
