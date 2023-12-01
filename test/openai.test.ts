import { expect, test, describe, beforeEach, afterEach } from "bun:test"

import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"
import OpenAI from "openai"

import { WritableStreamBuffer } from "stream-buffers" // You might need a package like this to capture stdout

describe("openai", () => {
  let stdoutBuffer: WritableStreamBuffer

  beforeEach(() => {
    // Initialize the buffer before each test
    stdoutBuffer = new WritableStreamBuffer()
    // Redirect process.stdout.write to write to the buffer instead
    process.stdout.write = stdoutBuffer.write.bind(stdoutBuffer)
    monitor.init({
      verbose: true,
    })
  })

  afterEach(() => {
    // Reset process.stdout.write after each test
    // process.stdout.write = process.stdout.constructor.prototype.write
  })

  const openai = monitorOpenAI(
    new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  )

  // ... other tests ...

  test("TranslatorAgent monitoring", async () => {
    // Call the function that you want to test
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0,
      // stream: true,
      // tags: ["translate"],
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
          content: `Hello, translate 'Bonjour' from french to english`,
        },
      ],
    })

    // Get the output from the buffer
    const verboseOutput = stdoutBuffer.getContentsAsString("utf8")

    console.log(verboseOutput)

    // Check if the verbose output contains expected tracking information
    // expect(verboseOutput).toContain("Tracking data for TranslatorAgent")
    expect(verboseOutput).toContain(`"userId": "user123"`)
  })
})
