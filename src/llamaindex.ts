import * as llamaindex from "llamaindex"
import lunary from "."
import { BaseEmbedding, BaseSynthesizer, LLM, BaseRetriever } from "llamaindex"
import monitor from "./index"

class LLamaIndexInstrumentation {
  private isLLM(llm: any): llm is LLM {
    return (
      llm &&
      (llm as LLM).complete !== undefined &&
      (llm as LLM).chat !== undefined
    )
  }

  private isEmbedding(embedding: any): embedding is BaseEmbedding {
    return (
      embedding instanceof BaseEmbedding &&
      embedding.getQueryEmbedding !== undefined
    )
  }

  private isSynthesizer(synthesizer: any): synthesizer is BaseSynthesizer {
    return (
      synthesizer && (synthesizer as BaseSynthesizer).synthesize !== undefined
    )
  }

  private isRetriever(retriever: any): retriever is BaseRetriever {
    return retriever && (retriever as BaseRetriever).retrieve !== undefined
  }

  patch(moduleExports: typeof llamaindex & { patched?: boolean }) {
    if (moduleExports.patched) {
      return moduleExports
    }

    // const customLLMInstrumentation = new CustomLLMInstrumentation(
    //   this._config,
    //   this.tracer,
    // );

    // this._wrap(
    //   moduleExports.RetrieverQueryEngine.prototype,
    //   "query",
    //   genericWrapper("query", this.tracer)
    // )

    for (const key in moduleExports) {
      const cls = (moduleExports as any)[key]
      if (this.isLLM(cls.prototype)) {
        console.log(`Patching ${cls.name} LLM class`)
        const method = cls.prototype.chat

        // cls.prototype.chat = monitor.wrapModel(method, {
        //   nameParser: (request) => request.model,
        //   inputParser: (request) => request.messages.map(parseOpenaiMessage),
        //   extraParser: (request) => {
        //     const rawExtra = {
        //       temperature: request.temperature,
        //       maxTokens: request.max_tokens,
        //       frequencyPenalty: request.frequency_penalty,
        //       presencePenalty: request.presence_penalty,
        //       stop: request.stop,
        //       functionCall: request.function_call,
        //     }
        //     return cleanExtra(rawExtra)
        //   },
        //   outputParser: ({ data }) => parseOpenaiMessage(data.choices[0]),
        //   tokensUsageParser: async ({ data }) => ({
        //     completion: data.usage?.completion_tokens,
        //     prompt: data.usage?.prompt_tokens,
        //   }),
        //   ...params,
        // })

        cls.prototype.chat = async function (...args: any[]) {
          console.log(`====================================`)
          console.log(`chat called with args`, args)
          const res = await method.call(this, ...args)
          console.log(`chat result`, res)
          console.log(`====================================`)
          return res
        }

        cls.prototype.streamChat = function (...args: any[]) {
          console.log(`streamChat called with args`, args)
          return method.call(this, ...args)
        }
        // this._wrap(
        //   cls.prototype,
        //   "complete",
        //   customLLMInstrumentation.completionWrapper({ className: cls.name })
        // )
        // this._wrap(
        //   cls.prototype,
        //   "chat",
        //   customLLMInstrumentation.chatWrapper({ className: cls.name })
        // )
      } else if (this.isEmbedding(cls.prototype)) {
        console.log(`Patching ${cls.name} Embedding class`)
        const method = cls.prototype.getQueryEmbedding
        cls.prototype.getQueryEmbedding = async function (...args: any[]) {
          console.log(`====================================`)
          console.log(`getQueryEmbedding called with args`, args)
          const res = await method.call(this, ...args)
          console.log(`getQueryEmbedding result`, res)
          console.log(`====================================`)
          return res
        }
      } else if (this.isSynthesizer(cls.prototype)) {
        console.log(`Patching ${cls.name} Synthesizer class`)
        const method = cls.prototype.synthesize
        // cls.prototype.synthesize = async function (...args: any[]) {
        //   console.log(`====================================`)
        //   console.log(`synthesize called with args`, args)
        //   const res = await method.call(this, ...args)
        //   console.log(`synthesize result`, res)
        //   console.log(`====================================`)
        //   return res
        // }
        // this._wrap(
        //   cls.prototype,
        //   "synthesize",
        //   genericWrapper("synthesize", this.tracer)
        // )
      } else if (this.isRetriever(cls.prototype)) {
        console.log(`Patching ${cls.name} Retriever class`)
        const method = cls.prototype.retrieve
        // cls.prototype.retrieve = async function (...args: any[]) {
        //   console.log(`====================================`)
        //   console.log(`retrieve called with args`, args)
        //   const res = await method.call(this, ...args)
        //   console.log(`retrieve result`, res)
        //   console.log(`====================================`)
        //   return res
        // }
        // this._wrap(
        //   cls.prototype,
        //   "retrieve",
        //   genericWrapper("retrieve", this.tracer)
        // )
      }
    }

    // moduleExports.patched = true

    return moduleExports
  }
}

function monitorLlamaIndex() {
  const llmaIndexInstrumentation = new LLamaIndexInstrumentation()
  llmaIndexInstrumentation.patch(llamaindex)
}

export { monitorLlamaIndex }
