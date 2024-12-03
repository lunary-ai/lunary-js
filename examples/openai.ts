import OpenAI from "openai"

import { monitorOpenAI } from "../src/openai"

// This extends the openai object with the monitor
const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

async function streaming(input) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    stream: true,
    user: "user123",
    seed: 123,
    userProps: {
      name: "John Doe",
    },
    metadata: {
      test: "hello",
      isTest: true,
      testAmount: 123,
    },
    messages: [
      {
        role: "user",
        content: input,
      },
    ],
  })

  for await (const part of stream) {
    process.stdout.write(part.choices[0]?.delta?.content || "")
  }

  return
}

async function nonStreaming(input) {
  const res = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    temperature: 0,
    tags: ["translate"],
    user: "user123",
    seed: 123,
    userProps: {
      name: "John Doe",
    },
    tools: [
      {
        type: "function",
        function: {
          name: "translate",
          parameters: {
            type: "object",
            properties: {
              text: { type: "string" },
              from: { type: "string" },
              to: { type: "string" },
            },
          },
        },
      },
    ],
    messages: [
      {
        role: "user",
        content: `Hello, translate ${input} from french to english`,
      },
    ],
  })

  return res.choices[0].message.content
}

async function audioInput() {
  // Fetch an audio file and convert it to a base64 string
  const url =
    "https://openaiassets.blob.core.windows.net/$web/API/docs/audio/alloy.wav"
  const audioResponse = await fetch(url)
  const buffer = await audioResponse.arrayBuffer()
  const base64str = Buffer.from(buffer).toString("base64")

  const response = await openai.chat.completions.create({
    model: "gpt-4o-audio-preview",
    modalities: ["text", "audio"],
    audio: { voice: "alloy", format: "wav" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What is in this recording?" },
          {
            type: "input_audio",
            input_audio: { data: base64str, format: "wav" },
          },
        ],
      },
    ],
  })

  console.log(response.choices[0])
}

async function audioOutput() {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-audio-preview",
    modalities: ["text", "audio"],
    audio: { voice: "alloy", format: "wav" },
    messages: [
      {
        role: "user",
        content: "Is a golden retriever a good family dog?",
      },
    ],
  })

  // Inspect returned data
  console.log(response.choices[0])
}

await audioInput()
// await audioOutput()

// await streaming("Hello my name is Stuart and I live in New York City")
// await nonStreaming("bonjour")
