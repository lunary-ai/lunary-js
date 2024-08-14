import Anthropic from "@anthropic-ai/sdk"
// import assert from "node:assert"

import monitorAnthrophic, { wrapAgent } from "../src/anthropic"

const client = new Anthropic()

monitorAnthrophic(client)

async function non_streaming() {
  const result = await client.messages.create({
    messages: [
      {
        role: "user",
        content: "Hey Claude!?",
      },
    ],
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
  })
  // console.dir(result)
}

async function streaming() {
  const stream = client.messages
    .stream({
      messages: [
        {
          role: "user",
          content: `Hey Claude!`,
        },
      ],
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
    })
    // Once a content block is fully streamed, this event will fire
    .on("contentBlock", (content) => {})
    // Once a message is fully streamed, this event will fire
    .on("message", (message) => {})

  for await (const event of stream) {
    // console.log("event", event)
  }

  const message = await stream.finalMessage()
  // console.log("finalMessage", message)
}

async function raw_streaming() {
  const stream = await client.messages.create({
    model: "claude-3-opus-20240229",
    stream: true,
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: "Hey Claude!",
      },
    ],
  })

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      // process.stdout.write(event.delta.text)
    }
  }
  // process.stdout.write("\n")
}

async function tool_calls() {
  const userMessage: Anthropic.MessageParam = {
    role: "user",
    content: "What is the weather in SF?",
  }
  const tools: Anthropic.Tool[] = [
    {
      name: "get_weather",
      description: "Get the weather for a specific location",
      input_schema: {
        type: "object",
        properties: { location: { type: "string" } },
      },
    },
  ]

  const message = await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [userMessage],
    tools,
  })
  // console.log("Initial response:")
  // console.dir(message, { depth: 4 })

  // assert(message.stop_reason === "tool_use")

  const tool = message.content.find(
    (content): content is Anthropic.ToolUseBlock => content.type === "tool_use"
  )
  // assert(tool)

  const result = await client.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [
      userMessage,
      { role: message.role, content: message.content },
      {
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: tool?.id || "",
            content: [{ type: "text", text: "The weather is 73f" }],
          },
        ],
      },
    ],
    tools,
  })
  // console.log("\nFinal response")
  // console.dir(result, { depth: 4 })
}

async function tool_streaming() {
  const stream = client.messages
    .stream({
      messages: [
        {
          role: "user",
          content: `What is the weather in SF?`,
        },
      ],
      tools: [
        {
          name: "get_weather",
          description: "Get the weather at a specific location",
          input_schema: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g. San Francisco, CA",
              },
              unit: {
                type: "string",
                enum: ["celsius", "fahrenheit"],
                description: "Unit for the output",
              },
            },
            required: ["location"],
          },
        },
      ],
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
    })
    // When a JSON content block delta is encountered this
    // event will be fired with the delta and the currently accumulated object
    .on("inputJson", (delta, snapshot) => {
      // console.log(`delta: ${delta}`);
      // console.log(`snapshot: ${(snapshot)}`);
      // console.log();
    })

  await stream.done()
}

async function TranslatorAgent(
  query: string
): Promise<Anthropic.Messages.Message> {
  const result = await client.messages.create({
    system: "You are a translator agent that hides jokes in each translation.",
    messages: [
      {
        role: "user",
        content: `Translate this sentence from English to French: ${query}`,
      },
    ],
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
  })

  return result
}

async function agent() {
  // By wrapping the executor, we automatically track all input, outputs and errors
  // And tools and logs will be tied to the correct agent
  const translate = wrapAgent(TranslatorAgent)

  const res = await translate("White house").identify("user123", {
    email: "john@example.org",
  })
  // .label(["test-tag"])

  console.log(res.content)
}

// await non_streaming();
// await streaming()
// await raw_streaming()
// await tool_calls()
// await tool_streaming()
await agent()
