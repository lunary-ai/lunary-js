/*
 * Example of an app that uses Threads, Agents, Tools and Templates.
 */

import OpenAI from "openai"
import lunary from "../src/index"
import { monitorOpenAI } from "../src/openai"

lunary.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const webSearchTool = lunary.wrapTool(async (query) => {
  // run some search function...
  return "<example search results>"
})

// An agent is a collection of LLM calls, tools, etc.
async function SupportAgent(user, topic, question) {
  // Usually you would use a tool to augment your assistant's context
  const searchResults = await webSearchTool(question)

  const template = await lunary.renderTemplate("support-help", {
    name: user.name,
    topic,
    question,
    searchResults,
  })

  const res = await openai.chat.completions.create(template)

  return res.choices[0].message.content
}

const agent = lunary.wrapAgent(SupportAgent)

// Threads/messages can also be tracked on the frontend
async function handleUserMessage(user, topic, question) {
  // open new thread (or resume existing one)
  const thread = lunary.openThread({
    tags: ["support"],
    userId: user.id,
    userProps: {
      name: user.name,
      email: user.email,
    },
  })

  // track user message
  const questionId = thread.trackMessage({
    role: "user",
    content: question,
  })

  const res = await agent(user, topic, question).setParent(questionId)

  // track assistant response
  const responseId = thread.trackMessage({
    role: "assistant",
    content: res,
  })

  // // sleep
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // thread.trackMessage({
  //   role: "user",
  //   content: "Thanks! Let me try that.",
  // })

  // you can also track feedback

  lunary.trackFeedback(responseId, { thumbs: "down" })
}

const user = {
  id: "demo-user-4",
  name: "Test User 2",
  email: "test.user2@example.org",
}

await handleUserMessage(
  user,
  "billing",
  "Hi, I would like to cancel my subscription."
)
