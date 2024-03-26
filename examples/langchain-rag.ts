import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { HNSWLib } from "@langchain/community/vectorstores/hnswlib"
import { formatDocumentsAsString } from "langchain/util/document"
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables"
import { StringOutputParser } from "@langchain/core/output_parsers"

import { LunaryHandler, getLangChainTemplate } from "../src/langchain"

const handler = new LunaryHandler()

const model = new ChatOpenAI({})

const vectorStore = await HNSWLib.fromTexts(
  ["mitochondria is the powerhouse of the cell"],
  [{ id: 1 }],
  new OpenAIEmbeddings()
)
const retriever = vectorStore.asRetriever()

const prompt = await getLangChainTemplate("context-prompt")

const chain = RunnableSequence.from([
  {
    context: retriever.pipe(formatDocumentsAsString),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  new StringOutputParser(),
])

const result = await chain.invoke("What is the powerhouse of the cell?", {
  callbacks: [handler],
})

console.log(result)
