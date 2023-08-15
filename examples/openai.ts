import "dotenv/config"
import { Configuration, OpenAIApi } from "openai"
import monitor from "../src/index"

// monitor.load({
//   log: true,
// })

monitor(OpenAIApi, { tags: ["dev"] })

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

async function main() {
  openai
    .createChatCompletion({
      model: "gpt-3.5-turbo",
      temperature: 0.9,
      messages: [
        { role: "system", content: "You are an helpful assistant" },
        { role: "user", content: "Hello friend" },
      ],
    })
    .identify("user-123")
    .then((res) => console.log("SUCCESS HAPPENED", res.data.choices[0].message))
    .catch((err) => console.log("An ERROR happened", err))

  // console.log(`GOT RESPONSE: ${chatCompletion}`)
  // console.log(chatCompletion.data.choices[0].message)
}

main()
