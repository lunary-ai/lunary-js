import { AsyncContext } from "./index"

const context = new AsyncContext("dsoi")

export function log() {
  const currentId = context.get()
  if (currentId === undefined)
    throw new Error("must be inside a run call stack")
  console.log(`[${currentId}]`, ...arguments)
}

export function run<T>(id: string, cb: () => T) {
  context.run(id, cb)
}