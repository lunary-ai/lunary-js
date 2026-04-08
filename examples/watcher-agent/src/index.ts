import "dotenv/config"

import lunary from "lunary"
import { LunaryHandler } from "lunary/langchain"
import { ChatOpenAI } from "@langchain/openai"
import { createReactAgent } from "@langchain/langgraph/prebuilt"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts"
import { tool } from "@langchain/core/tools"
import { z } from "zod"

// ----- Domain models -------------------------------------------------------

type Severity = "low" | "medium" | "high"

type Signal = {
  id: string
  queryIds: string[]
  summary: string
  details: string
  severity: Severity
  detectedAt: string
  url?: string
  score: number
}

type WatcherQuery = {
  _id: string
  topic: string
  keywords: string[]
  lastSeen: string
  minScore: number
}

type Tenant = {
  _id: string
  email: string
}

type Database = {
  signals: Signal[]
}

// ----- Static demo data ----------------------------------------------------

const tenant: Tenant = {
  _id: "tenant-ops",
  email: "alerts@example.com",
}

const queries: WatcherQuery[] = [
  {
    _id: "watcher-payments",
    topic: "payments latency",
    keywords: ["latency", "error", "retry"],
    lastSeen: "2025-10-30T11:00:00.000Z",
    minScore: 0.4,
  },
  {
    _id: "watcher-signups",
    topic: "signup conversion drop",
    keywords: ["conversion", "funnel", "drop"],
    lastSeen: "2025-10-30T09:30:00.000Z",
    minScore: 0.5,
  },
]

const database: Database = {
  signals: [
    {
      id: "sig-101",
      queryIds: ["watcher-payments"],
      summary: "Spike in gateway retries detected",
      details:
        "Checkout service reports a 35% increase in retry attempts over the last 15 minutes.",
      severity: "high",
      detectedAt: "2025-10-30T11:12:00.000Z",
      url: "https://status.example.com/incidents/101",
      score: 0.78,
    },
    {
      id: "sig-102",
      queryIds: ["watcher-payments", "watcher-signups"],
      summary: "Elevated latency on identity provider",
      details:
        "Identity callback latency rose from 180ms p95 to 410ms p95. Impacting checkout flow.",
      severity: "medium",
      detectedAt: "2025-10-30T10:58:00.000Z",
      score: 0.55,
    },
    {
      id: "sig-201",
      queryIds: ["watcher-signups"],
      summary: "Signup conversion dipped below SLO",
      details:
        "Conversion dropped to 3.8% vs 5.1% baseline in the last hour. Correlated with OAuth latency.",
      severity: "high",
      detectedAt: "2025-10-30T09:45:00.000Z",
      score: 0.72,
    },
  ],
}

const queriesById = new Map(queries.map((query) => [query._id, query]))

// ----- Helpers -------------------------------------------------------------

const nodedSystemPrompt = `
You are WatcherAlert, an SRE copilot tasked with reviewing telemetry signals.
You must:
- Fetch the freshest signals via the available tools before reasoning.
- Cross check the signal timestamps against the watcher\'s lastSeen field.
- Only raise an alert when a new signal is newer than lastSeen and has score >= minScore.
- When alerting, include: signal id, severity, detectedAt in ISO8601, summary, and a short action recommendation.
- If no qualifying signal is found, respond with status "clear" and include reasoning.
Return a JSON object with:
  status: "alert" | "clear"
  updates: array of objects with keys {id, severity, detectedAt, summary, action}
  reasoning: short string explaining the outcome.
`

function ensureEnvironment() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing OPENAI_API_KEY in environment")
  }

  if (!process.env.LUNARY_PUBLIC_KEY) {
    throw new Error("Missing LUNARY_PUBLIC_KEY in environment")
  }
}

function createCallbacks() {
  return [
    new LunaryHandler({
      appId: process.env.LUNARY_PUBLIC_KEY,
    }),
  ]
}

function getWatcherTools(database: Database, tenant: Tenant) {
  return [
    tool({
      name: "fetch_latest_signals",
      description:
        "Retrieve the most recent signals for the provided watcher query id.",
      schema: z
        .object({
          queryId: z
            .string()
            .describe("Identifier of the watcher query we are evaluating."),
          limit: z
            .number()
            .int()
            .min(1)
            .max(5)
            .default(3)
            .describe("Maximum number of signals to inspect."),
        })
        .strip(),
      func: async ({ queryId, limit }) => {
        const watcher = queriesById.get(queryId)
        if (!watcher) {
          return JSON.stringify(
            {
              tenant: tenant._id,
              queryId,
              error: "Unknown watcher query",
            },
            null,
            2
          )
        }

        const matchingSignals = database.signals
          .filter((signal) => signal.queryIds.includes(queryId))
          .filter((signal) => signal.score >= watcher.minScore)
          .sort(
            (a, b) =>
              new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
          )
          .slice(0, limit)

        return JSON.stringify(
          {
            tenant: tenant._id,
            queryId,
            lastSeen: watcher.lastSeen,
            signals: matchingSignals,
          },
          null,
          2
        )
      },
    }),
  ]
}

// ----- Agent implementation ------------------------------------------------

const model = new ChatOpenAI({
  model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  temperature: 0.2,
})

async function WatcherAgent(query: WatcherQuery) {
  const agent = createReactAgent({
    llm: model,
    tools: getWatcherTools(database, tenant),
  }).withConfig({
    callbacks: createCallbacks(),
    metadata: {
      agentName: "watcherAlert",
      query: query._id,
      tenant: tenant._id,
      userId: tenant._id,
      userProps: { email: tenant.email },
    },
    tags: ["watcherAlert"],
  })

  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(nodedSystemPrompt),
    HumanMessagePromptTemplate.fromTemplate(
      [
        "Watcher context:",
        "- queryId: {queryId}",
        "- topic: {topic}",
        "- keywords: {keywords}",
        "- lastSeen: {lastSeen}",
        "- minScore: {minScore}",
        "Call fetch_latest_signals(queryId) before deciding whether to raise an alert.",
      ].join("\n")
    ),
  ])

  const messages = await prompt.formatMessages({
    queryId: query._id,
    topic: query.topic,
    keywords: query.keywords.join(", "),
    lastSeen: query.lastSeen,
    minScore: query.minScore.toFixed(2),
  })

  const result = await agent.invoke(
    {
      messages,
    },
    {
      cache: null,
    }
  )

  return result
}

// ----- Entrypoint ---------------------------------------------------------

async function main() {
  ensureEnvironment()

  lunary.init({
    publicKey: process.env.LUNARY_PUBLIC_KEY!,
  })

  const watcherAgent = lunary.wrapAgent(WatcherAgent, {
    name: "watcherAlert",
  })

  const results = await Promise.all(
    queries.map(async (query) => {
      const output = await watcherAgent(query)
      console.log(`\nWatcher ${query._id} ->`)
      console.dir(output, { depth: null })
      return { queryId: query._id, output }
    })
  )

  return results
}

main().catch((error) => {
  console.error("Watcher agent failed", error)
  process.exitCode = 1
})
