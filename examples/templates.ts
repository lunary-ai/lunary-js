import OpenAI from "openai"
import lunary from "../src/index"
import { monitorOpenAI } from "../src/openai"

lunary.init({
  verbose: true,
})

const openai = monitorOpenAI(new OpenAI())

// @ts-ignore
const template = await lunary.renderTemplate({
  question: "What is the meaning of life?",
})

const res = await openai.chat.completions.create({
  ...template,
  tags: ["third"],
})

console.log(res.choices[0].message.content)
