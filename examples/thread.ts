import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const thread = monitor.openThread({
  id: "some-test-lunary-jhoishjgsjggosejktps-gushggseogkespksisejg",
  tags: ["third"],
})

thread.trackMessage({
  role: "assistant",
  content: "message 1",
})

thread.trackMessage({
  role: "system",
  content: "message 2",
})

thread.trackMessage({
  role: "system",
  content: "message 3 Third ",
})

thread.trackMessage({
  role: "assistant",
  content: "message 4",
})

thread.trackMessage({
  role: "user",
  content: "message 5",
})

// thread.trackMessage({
//   role: "user",
//   content: "this is a user message",
// })

// const id = thread.trackMessage({
//   role: "user",
//   content: "Please help me",
// })

// const res = await openai.chat.completions
//   .create({
//     model: "gpt-3.5-turbo",
//     temperature: 1,
//     messages: [
//       {
//         role: "user",
//         content: "Hello",
//       },
//     ],
//   })
//   .setParent(id)

// console.log(res.choices[0].message.content)

// await sleep(500)

// thread.trackMessage({
//   role: "assistant",
//   content: "Yes, sure.",
//   // feedback: {
//   //   thumbs: "up",
//   // },
// })

// await sleep(500)

// thread.trackMessage({
//   role: "assistant",
//   isRetry: true,
//   content: res.choices[0].message.content + " (retry)",
// })
