# Watcher Agent Example

End-to-end reference implementation that combines LangChain JS' ReAct agent with Lunary observability. The example reproduces the shape of the customer snippet you shared, including `createReactAgent`, `ChatPromptTemplate`, and `lunary.wrapAgent`.

## Prerequisites

- Node.js 18+ (LangChain and Lunary both rely on native fetch).
- An OpenAI API key with access to `gpt-4o-mini` or another chat model.
- A Lunary workspace public key (`LUNARY_PUBLIC_KEY`).

## Setup

1. Install dependencies:
   ```bash
   cd lunary-js/examples/watcher-agent
   npm install
   ```
2. Copy the environment template and fill in your secrets:
   ```bash
   cp .env.example .env
   ```
   Update `OPENAI_API_KEY` and `LUNARY_PUBLIC_KEY`. Optionally override `OPENAI_MODEL` if you would like to use a different model id.
3. Run the demo:
   ```bash
   npm run start
   ```

The script will execute two watcher queries concurrently, invoke the LangChain ReAct agent, and stream the final structured response to stdout. Every step is traced automatically in Lunary (agent run, LLM calls, tool usage) thanks to the `LunaryHandler` and `lunary.wrapAgent` instrumentation.

## Customising the Example

- `src/index.ts` contains in-memory demo data inside `database.signals` and `queries`. Adjust or extend these records to mirror your production schema.
- Update `nodedSystemPrompt` to experiment with different supervisory logic.
- `getWatcherTools` shows how to expose a LangChain tool that fetches the latest rows from your datastore and ties them to a specific watcher query.

## Debugging Tips

- To change log verbosity, set `LUNARY_VERBOSE=true` before running the script.
- To run a single watcher, replace the `Promise.all` block with a direct call to `await watcherAgent(queries[0])`.
- If the agent errors, Lunary will capture the exception stack trace and the tool call arguments so you can reproduce the failure inside the dashboard.

## References

- Lunary JavaScript integration docs – instrumentation patterns for `wrapAgent` and LangChain callbacks.
- LangChain.js LangGraph docs – details on `createReactAgent` and tool calling behaviour.
