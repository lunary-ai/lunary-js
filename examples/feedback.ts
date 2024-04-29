import OpenAI from "openai"
import lunary from "../src/index"
import { monitorOpenAI } from "../src/openai"

lunary.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const thread = lunary.openThread({
  // id: "some-test-lunary-jhoishjgsjggosejktps-gushggseogkespksisejg",
  tags: ["third"],
  userId: "user123",
})

const msgText = "Hello, this is a test message."

const msgId = thread.trackMessage({
  role: "user",
  content: msgText,
})

console.log("Message id:", msgId)

const MyAgent = lunary.wrapAgent(async function MyAgent(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 1,
    messages: [
      {
        role: "user",
        content: text,
      },
    ],
  })

  return res.choices[0].message.content
})

const output = await MyAgent(msgText).setParent(msgId)
console.log("Output:", output)

const resId = thread.trackMessage({
  role: "assistant",
  content: output,
})

lunary.trackFeedback(resId, {
  thumbs: "down",
})

lunary.trackFeedback(resId, {
  comment: "Bad response.",
})

await sleep(1000)

console.log("Feedback sent. Trying to retrieve it.")

const feedback = await lunary.getFeedback(resId)

console.log("----------------")
console.log(feedback)
