import OpenAI from "openai"
import lunary from "../src/index"
import { monitorOpenAI } from "../src/openai"

lunary.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const template = await lunary.renderTemplate("support-help", {
  name: "John",
  topic: "billing",
  question: "I got charged twice for my last payment",
})

const res = await openai.chat.completions
  .create(template)
  .identify("demo-user-1", {
    name: "John Doe",
    email: "john.doe@example.org",
  })

console.log(res.choices[0].message.content)
