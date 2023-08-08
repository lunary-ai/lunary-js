import "dotenv/config"

import { Calculator } from "langchain/tools/calculator"

import monitor from "../src"

monitor.attach([Calculator])

const calculator = new Calculator()

console.log(await calculator.call("1+1"))
