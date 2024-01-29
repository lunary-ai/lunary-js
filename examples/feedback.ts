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

const msgId = thread.trackMessage({
  role: "user",
  content: "this is a user message",
})

console.log("Message id:", msgId)

const wrapped = lunary.wrapContext(async (query) => {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 1,
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
  })
  return res
})

await wrapped("Hello").setParent(msgId)

const resId = thread.trackMessage({
  role: "assistant",
  content: "Yes, sure.",
})

lunary.trackFeedback(resId, {
  thumbs: "up",
})

lunary.trackFeedback(resId, {
  comment: "Hello this is nice",
})

await sleep(1000)

console.log("Feedback sent. Trying to retrieve it.")

const feedback = await lunary.getFeedback(resId)

console.log("----------------")
console.log(feedback)
