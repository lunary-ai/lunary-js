import "dotenv/config"
import { SerpAPI } from "langchain/tools"
import { Calculator } from "langchain/tools/calculator"

import monitor from "../src"

const tools = [
  new SerpAPI(process.env.SERPAPI_API_KEY, {
    location: "Austin,Texas,United States",
    hl: "en",
    gl: "us",
  }),
  new Calculator(),
]

monitor.attach(tools)
