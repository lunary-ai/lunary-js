import {
  expect,
  test,
  describe,
  beforeEach,
  afterEach,
  afterAll,
  spyOn,
} from "bun:test"

import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"
import OpenAI from "openai"

monitor.init({
  verbose: true,
})

const expectLogsContains = (spy, str: string) => {
  expect(spy).toHaveBeenCalledWith(expect.stringContaining(str))
}

describe("openai", () => {
  // let stdoutBuffer: WritableStreamBuffer
  let spy

  beforeEach(() => {
    spy = spyOn(console, "log").mockImplementation()
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  test("Basic OpenAI", async () => {
    const openai = monitorOpenAI(
      new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    )

    const result = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
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
          content: `Hello, translate 'Bonjour' from french to english`,
        },
      ],
    })

    expect(result.model).toContain("gpt-3.5-turbo")

    // @ts-ignore
    // Make sure the response structure is correct
    expect(result.choices[0].message?.tool_calls[0]?.function.name).toBe(
      "translate"
    )

    expectLogsContains(spy, `\"event\": \"start\"`)

    expectLogsContains(spy, `\"name\": \"John Doe\"`)

    expectLogsContains(spy, `\"event\": \"end\"`)

    expectLogsContains(
      spy,
      `\"text\": \"Hello, translate 'Bonjour' from french to english\"`
    )

    // Make sure it reports the tool calls
    expectLogsContains(spy, `\"arguments\": \"{`)
  })
})
