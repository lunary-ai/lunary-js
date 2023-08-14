import "dotenv/config"
import { Configuration, OpenAIApi } from "openai"
import monitor from "../src/index"

monitor.load({
  log: true,
})

monitor(OpenAIApi, { tags: ["dev"], userId: "test-user" })

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

async function main() {
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.9,
    messages: [
      { role: "system", content: "You are an helpful assistant" },
      { role: "user", content: "Hello friend" },
    ],
  })
  // .identify("user-123")
  console.log(chatCompletion.data.choices[0].message)
}

main()
