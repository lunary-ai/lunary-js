import { createContext } from "unctx"
import { AsyncLocalStorage } from "node:async_hooks"

const ctx = createContext({
  asyncContext: true,
  AsyncLocalStorage,
})

export default ctx
