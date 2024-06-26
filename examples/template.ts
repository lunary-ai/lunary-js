import OpenAI from "openai"
import lunary from "../src/index"
import { monitorOpenAI } from "../src/openai"

lunary.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

const template = await lunary.renderTemplate("support-agent", {
  name: "Jane Doe",
  topic: "account",
  question: "I have forgotten my password.",
})

const res = await openai.chat.completions.create(template)

console.log(res.choices[0].message.content)
