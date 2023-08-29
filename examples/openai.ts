import "dotenv/config"
import OpenAI from "openai"
import monitor from "../src/index"
import { monitorOpenAI } from "../src/openai"

monitor.load({
  log: true,
})

const openai = monitorOpenAI(
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

async function main() {
  const stream = await openai.chat.completions
    .create({
      model: "gpt-3.5-turbo-0613",
      messages: [
        {
          role: "user",
          content: `root
              ├── folder1
              │   ├── file1.txt
              │   └── file2.txt
              └── folder2
                  ├── file3.txt
                      └── subfolder1
                              └── file4.txt`,
        },
      ],
      functions: [
        {
          name: "buildTree",
          description: "build a tree structure",
          parameters: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description: "The name of the node",
              },
              children: {
                type: "array",
                description: "The tree nodes",
                items: {
                  $ref: "#",
                },
              },
              type: {
                type: "string",
                description: "The type of the node",
                enum: ["file", "folder"],
              },
            },
            required: ["name", "children", "type"],
          },
        },
      ],
      stream: true,
    })
    .identify("test")

  for await (const part of stream) {
    // process.stdout.write(part.choices[0]?.delta?.content || "")
    console.log(part.choices[0]?.delta)
  }

  console.log(`Finished first stream.`)

  // const result = await openai.chat.completions.create({
  //   model: "gpt-3.5-turbo-0613",
  //   messages: [
  //     {
  //       role: "user",
  //       content: `Hello, I'm a human.`,
  //     },
  //   ],
  // })

  // console.log(result)
}

main()
