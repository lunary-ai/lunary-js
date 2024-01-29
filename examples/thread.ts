import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const thread = monitor.openThread({
  // id: "some-test-lunary-jhoishjgsjggosejktps-gushggseogkespksisejg",
  tags: ["third"],
  userId: "user123",
})

thread.trackMessage({
  role: "user",
  content: "this is a user message",
})

thread.trackMessage({
  role: "system",
  content: "message 2",
})

const id = thread.trackMessage({
  role: "user",
  content: "Please help me",
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

await sleep(500)

thread.trackMessage({
  role: "assistant",
  content: "Yes, sure.",
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
