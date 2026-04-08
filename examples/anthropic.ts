import Anthropic from "@anthropic-ai/sdk"

import { monitorAnthropic } from "../src/anthropic"

const anthropic = monitorAnthropic(
  new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
)

async function streaming() {
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 256,
    metadata: {
      user_id: "user_123",
    },
    tags: ["example", "stream"],
    userId: "user_123",
    userProps: {
      name: "John Doe",
    },
    thinking: {
      type: "disabled",
    },
    messages: [
      {
        role: "user",
        content: "Write one sentence about Lunary tracing.",
      },
    ],
  })

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      process.stdout.write(event.delta.text)
    }
  }

  process.stdout.write("\n")
}

async function nonStreaming() {
  const result = await anthropic.messages.parse({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 256,
    metadata: {
      user_id: "user_123",
    },
    tags: ["example", "non-stream"],
    userId: "user_123",
    userProps: {
      name: "John Doe",
    },
    messages: [
      {
        role: "user",
        content:
          "Return JSON with `translation`, `from`, and `to` fields for translating 'bonjour' from French to English.",
      },
    ],
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            translation: { type: "string" },
            from: { type: "string" },
            to: { type: "string" },
          },
          required: ["translation", "from", "to"],
        },
      },
    },
  })

  console.log(JSON.stringify(result.parsed_output || result.content, null, 2))
}

await streaming()
await nonStreaming()
