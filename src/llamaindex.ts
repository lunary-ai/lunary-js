import lunary from "./index"
import { LLMEndEvent, LLMStartEvent, Settings } from "llamaindex"
import { extractText } from "llamaindex/llm/utils"

export const monitorLlamaIndex = () => {
  lunary.init({
    appId: process.env.LUNARY_APP_ID,
    apiUrl: process.env.LUNARY_API_URL,
  })

  Settings.callbackManager.on("llm-start", async (event: LLMStartEvent) => {
    const { messages, id } = event.detail.payload

    const contents = messages.map((message) => extractText(message.content))

    await lunary.trackEvent("llm", "start", {
      runId: id,
      input: contents,
      runtime: "llamaindex",
    })
  })

  Settings.callbackManager.on("llm-end", async (event: LLMEndEvent) => {
    const { response, id } = event.detail.payload

    await lunary.trackEvent("llm", "end", {
      runId: id,
      output: response.message.content,
      runtime: "llamaindex",
    })
  })
}
