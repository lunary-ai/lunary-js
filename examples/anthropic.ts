import Anthropic from "@anthropic-ai/sdk"
import { monitorAnthropic } from "../src/anthropic"

const client = monitorAnthropic(new Anthropic())
// const client = new Anthropic()

async function basic() {
  const message = await client.messages.create({
    max_tokens: 1024,
    system: "Speak like a pirate",
    userId: "123",
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

async function imageExample() {
  // Simple base64 encoded 1x1 pixel transparent PNG
  const base64Image =
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII="

  const message = await client.messages.create({
    max_tokens: 1024,
    model: "claude-3-opus-20240229",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: "What do you see in this image?",
          },
        ],
      },
    ],
  })

  console.log("Image example response:", message.content[0].text)
}

// console.log("testing basic reporting")
// await basic()

console.log("testing image example")
await imageExample()

// console.log("testing streaming reporting")
// await streaming()
