import "dotenv/config"
import { Configuration, OpenAIApi } from "openai"
import monitor from "../src/index"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)
monitor(openai)

async function main() {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an helpful assitant" },
      { role: "user", content: "Hello world" },
    ],
  })
  console.log(chatCompletion.data.choices[0].message)
}

main()
