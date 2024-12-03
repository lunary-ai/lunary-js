import Anthropic from "@anthropic-ai/sdk"
import { monitorAnthropic } from "../src/anthropic"

const client = monitorAnthropic(new Anthropic())
// const client = new Anthropic()

async function basic() {
  const message = await client.messages.create({
    max_tokens: 1024,
    system: "Speak like a pirate",
    userId: "123",
    // stream: true,
    // userProps: {
    //   name: "John Doe",
    // },
    messages: [{ role: "user", content: "Hello, Claude" }],
    model: "claude-3-5-sonnet-20241022",
  })

  console.log(message.content[0].text)
}

async function streaming() {
  const stream = client.messages
    .stream({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      // userId: "123",

      tags: ["joke"],
      messages: [
        {
          role: "user",
          content: "say something funny",
        },
      ],
    })
    .on("text", (text) => {
      console.log(text)
    })

  const message = await stream.finalMessage()
  console.log(message)
}

console.log("testing basic reporting")
await basic()

console.log("testing streaming reporting")
await streaming()
