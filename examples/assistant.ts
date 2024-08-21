import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.init({ verbose: true })

const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

const assistant = await openai.beta.assistants.create({
  model: "gpt-4-turbo",
  instructions:
    "You are a weather bot. Use the provided functions to answer questions.",
  tools: [
    {
      type: "function",
      function: {
        name: "getCurrentTemperature",
        description: "Get the current temperature for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
            unit: {
              type: "string",
              enum: ["Celsius", "Fahrenheit"],
              description:
                "The temperature unit to use. Infer this from the user's location.",
            },
          },
          required: ["location", "unit"],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "getRainProbability",
        description: "Get the probability of rain for a specific location",
        parameters: {
          type: "object",
          properties: {
            location: {
              type: "string",
              description: "The city and state, e.g., San Francisco, CA",
            },
          },
          required: ["location"],
        },
      },
    },
  ],
});

const thread = await openai.beta.threads.create()

async function assistantsAPI(input) {
  await openai.beta.threads.messages.create(thread.id, {
    role: "user", content: input
  })

  // const run = openai.beta.threads.runs
  //   .createAndStream(thread.id, {
  //     assistant_id: assistant.id
  //   })
  //   .on("event", (ev) => console.log(ev.event, ev.data))
  //   .on("end", async () => {
  //     await openai.beta.threads.del(thread.id);
  //     await openai.beta.assistants.del(assistant.id);
  //   })

  const stream = await openai.beta.threads.runs.create(
    thread.id, { assistant_id: assistant.id, stream: true }
  );

  for await (const event of stream) {
    console.log(event);
  }
}

await assistantsAPI("What's the weather in San Francisco today and the likelihood it'll rain?");

console.log("* assistant:", assistant.id);
console.log("* thread:", thread.id);
