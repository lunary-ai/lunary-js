# LLMonitor JS SDK

LLMonitor is an open-source logging and analytics platform for LLM-powered apps.

You can use it with any LLM models, not limited to OpenAI.

This is the JS isomorphic library compatible with Node.js, Deno and the browser.

It is compatible with Langchain JS, AutoGPT and all the other libraries.

## Installation

```bash
npm install llmonitor
```

## Simple usage with Langchain.js

```ts
import { ChatOpenAI } from "langchain/chat_models/openai"
import Monitor from "LLMonitor"

const monitor = new Monitor({
  appId: "your-app-id"
})

const MonitoredChat = monitor.extendModel(ChatOpenAI)

const chat = new MonitoredChat({
  temperature: 0.2,
  modelName: "gpt-3.5-turbo",
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
  name: "translator", // name of your agent visible on the dashboard
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

## Definitions

Agent: Runs multiple LLM calls and tools until it finds a solution to a given query
Sub-agent: Agent called from another agent
Tool: Gives external functionalities to agents (ie: web scraper, google search, calculator, etc.)

## Todo
- [ ] Find way to tie ToolMonitor to AgentMonitor via the wrapExecutor so we don’t have to exchange monitor objects
- [ ] Proper documentation
- [ ] Add ModelMonitor for tracking custom models w/o Langchain
- [ ] Support/test langchain agent executors
- [ ] Support/test langchain tools via openai functions
- [ ] Cleaner logging when { log: true }
- [ ] Allow sub agents runs 
- [ ] Think how to re-implement convo tracking
- [x] batch/debounce requests
- [x] fix event sent right after another one have the exact same timestamp
- [x] add a wrapper method to directly wrap calls
- [x] basic langchain-js support