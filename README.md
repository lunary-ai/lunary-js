# LLMonitor JS SDK

LLMonitor is an open-source logging and analytics platform for LLM-powered apps.

You can use it with any LLM models, not limited to GPT.

This is the JS isomorphic library compatible with Node.js, Deno and the browser.

It is compatible with Langchain JS, AutoGPT and all the other libraries.

## Installation

```bash
npm install llmonitor
```

## Usage with Langchain.js

```ts
import { ChatOpenAI } from "langchain/chat_models/openai"
import LLMonitor from "LLMonitor"

/** Takes the same parameters as LLMonitor **/
const monitor = new LLMonitor({
  appId: "your-app-id"
})

const MonitoredChat = monitor.extendModel(ChatOpenAI)

const chat = new MonitoredChat({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
  tags: ["test-tag"],
})

const res = await chat.call([
  new HumanChatMessage(`Tell me a joke`),
])
```

## Custom Agent Usage

```ts
// Basic agent monitoring example
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanChatMessage, SystemChatMessage } from "langchain/schema"

import { AgentMonitor } from "LLMonitor"

/** Takes the same parameters as LLMonitor **/
const monitor = new AgentMonitor({
  name: "translator",
  log: true,
})

const MonitoredChat = monitor.extendModel(ChatOpenAI)

// By wrapping the executor, we can track all input, outputs and errors
// And tools and logs will be tied to the correct agent
const translate = monitor.wrapExecutor(async (query) => {
  const chat = new MonitoredChat({
    temperature: 0.2,
    modelName: "gpt-3.5-turbo",
    tags: ["test-tag"],
  })

  const res = await chat.call([
    new SystemChatMessage("You are a translator agent."),
    new HumanChatMessage(
      `Translate this sentence from English to French. ${query}`
    ),
  ])

  return res.text
})

translate("Hello, how are you?").then((res) => {
  console.log(res) // "Bonjour, comment allez-vous?"
})
```

## Todo
- [ ] Think how to re-implement convo tracking
- [ ] Add ModelMonitor for tracking models without langchain
- [ ] Support langchain agents
- [ ] Support langchain tools via functions
- [ ] Proper documentation
- [x] batch/debounce requests
- [x] fix event sent right after another one have the exact same timestamp
- [x] add a wrapper method to directly wrap calls
- [x] langchain-js support