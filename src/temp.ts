import "dotenv/config"
import { OpenAI } from "langchain";
import { ChatOpenAI } from "langchain/chat_models/openai"
import { Configuration, OpenAIApi } from "openai"
import monitor from "src"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// const openai = monitor.openai(OpenAIApi)


// const chatCompletion = await openai.createChatCompletion({
//   model: "gpt-3.5-turbo",
//   temperature: 0.9,
//   messages: [{ role: "user", content: "Hello world" }],
// })

// console.log(chatCompletion.data.choices[0].message);


const MonitoredOpenAiApi = monitor.openai(OpenAIApi)
const monitoredOpenAi = new MonitoredOpenAiApi(configuration)



const chatCompletion = await monitoredOpenAi.createChatCompletion({
  model: "gpt-3.5-turbo",
  temperature: 0.9,
  messages: [{ role: "user", content: "Hello world" }],
})

console.log(chatCompletion.data.choices[0].message);


