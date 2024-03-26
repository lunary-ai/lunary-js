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

## 📖 Documentation

Full docs are available [here](https://lunary.ai/docs/js).
