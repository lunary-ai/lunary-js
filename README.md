<div align="center">

<img src="https://lunary.ai/logo.png" style='border-radius: 12px;' width="50"/> 
<h1>Lunary JS SDK</h1>

**📈 JavaScript monitoring for AI apps and agent**

[website](https://lunary.ai) - [docs](https://lunary.ai/docs/js/) - [demo](https://app.lunary.ai/demo) - [![npm version](https://badge.fury.io/js/lunary.svg)](https://badge.fury.io/js/lunary)

---

</div>

Use it with any LLM model and custom agents (not limited to OpenAI).

This is a typed JS library compatible with Node.js, Deno, Vercel Edge functions and Cloudflare Workers.

It is compatible with Langchain JS, AutoGPT and other libraries.

To get started, get a project ID by registering [here](https://lunary.ai).

## 🛠️ Installation

```bash
npm install lunary
```

## 🚀 Basic Usage with OpenAI

```javascript
import { monitorOpenAI } from "lunary/openai"

// This extends the openai object with the monitor
const openai = monitorOpenAI(new OpenAI())

// Use OpenAI as usual
const result = await openai.chat.completions.create({
  messages: [
    {
      role: "user",
      content: "Hello!",
    },
  ],
})

console.log(result.choices[0])
```

## 🤖 Anthropic Integration

`monitorAnthropic()` wraps Anthropic's official TypeScript SDK without changing the way you call Anthropic. It supports `messages.create(...)`, raw streaming via `messages.create({ stream: true })`, `messages.parse(...)`, `messages.stream(...)`, and the beta helper surface such as `beta.messages.stream(...)` and `beta.messages.toolRunner(...)`.

```javascript
import Anthropic from "@anthropic-ai/sdk"
import { monitorAnthropic } from "lunary/anthropic"

const anthropic = monitorAnthropic(
  new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
)

const parsed = await anthropic.messages.parse({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 256,
  messages: [{ role: "user", content: "Return JSON with an answer field for 2 + 2." }],
  output_config: {
    format: {
      type: "json_schema",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          answer: { type: "number" },
        },
        required: ["answer"],
      },
    },
  },
})

const stream = anthropic.messages.stream({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 256,
  messages: [{ role: "user", content: "Stream one sentence about Lunary." }],
})

const finalMessage = await stream.finalMessage()
```

Anthropic validates the provider-side `metadata` object. Use Anthropic-supported fields such as `user_id` there, and use Lunary's `tags`, `userId`, and `userProps` for observability context.

## 📖 Documentation

Full docs are available [here](https://lunary.ai/docs/js).
