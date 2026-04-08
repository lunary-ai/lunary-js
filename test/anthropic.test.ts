import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test"

import lunary from "../src/index"
import { monitorAnthropic } from "../src/anthropic"

lunary.init({
  publicKey: "test-public-key",
  apiUrl: "http://localhost:3333",
  verbose: false,
})

const buildResponse = () =>
  new Response(JSON.stringify({ results: [] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

const createFakeAPIPromise = (factory) => {
  const promise = Promise.resolve().then(factory)

  return {
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
    withResponse: async () => ({
      data: await promise,
      response: buildResponse(),
      request_id: "req_test",
    }),
    asResponse: async () => buildResponse(),
  }
}

const getRunEvents = (payloads) => payloads.flatMap((payload) => payload.events)

const buildTrackedEventStream = (events) => {
  const controller = new AbortController()
  let nextCalls = 0
  let returnCalls = 0

  return {
    controller,
    get nextCalls() {
      return nextCalls
    },
    get returnCalls() {
      return returnCalls
    },
    [Symbol.asyncIterator]() {
      let index = 0

      return {
        async next() {
          nextCalls += 1

          if (controller.signal.aborted || index >= events.length) {
            return { done: true, value: undefined }
          }

          return { done: false, value: events[index++] }
        },
        async return() {
          returnCalls += 1
          controller.abort()
          return { done: true, value: undefined }
        },
        [Symbol.asyncIterator]() {
          return this
        },
      }
    },
  }
}

describe("anthropic", () => {
  let fetchSpy
  let payloads

  beforeEach(() => {
    payloads = []
    lunary.queue = []
    fetchSpy = spyOn(globalThis, "fetch").mockImplementation(
      async (_input, init) => {
        payloads.push(JSON.parse(String(init?.body || "{}")))
        return buildResponse()
      },
    )
  })

  afterEach(() => {
    lunary.queue = []
    fetchSpy.mockRestore()
  })

  afterAll(() => {
    lunary.queue = []
  })

  test("tracks non-streaming anthropic messages.create", async () => {
    const client = monitorAnthropic({
      messages: {
        create: async (request) => ({
          id: "msg_test",
          model: request.model,
          role: "assistant",
          content: [
            {
              type: "thinking",
              thinking: "I should use the weather tool.",
              signature: "sig_123",
            },
            {
              type: "tool_use",
              id: "toolu_123",
              caller: { type: "direct" },
              name: "get_weather",
              input: { location: "San Francisco" },
            },
            {
              type: "text",
              text: "It is 72F in San Francisco.",
              citations: null,
            },
          ],
          stop_reason: "tool_use",
          stop_sequence: null,
          usage: {
            input_tokens: 12,
            output_tokens: 7,
            cache_creation_input_tokens: 4,
            cache_read_input_tokens: 2,
            inference_geo: "us",
            service_tier: "standard",
            server_tool_use: null,
          },
        }),
      },
    })

    const result = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      system: "You are helpful.",
      temperature: 0.4,
      metadata: { orderId: "ord_123" },
      tags: ["support"],
      userId: "user_123",
      userProps: { plan: "pro" },
      templateId: "tmpl_123",
      tools: [
        {
          name: "get_weather",
          input_schema: { type: "object" },
        },
      ],
      messages: [
        {
          role: "user",
          content: "What is the weather in San Francisco?",
        },
      ],
    })

    expect(result.id).toBe("msg_test")
    await lunary.flush()

    expect(fetchSpy).toHaveBeenCalled()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)

    const [startEvent, endEvent] = events

    expect(startEvent.event).toBe("start")
    expect(startEvent.name).toBe("claude-sonnet-4-5-20250929")
    expect(startEvent.tags).toEqual(["support"])
    expect(startEvent.userId).toBe("user_123")
    expect(startEvent.userProps).toEqual({ plan: "pro" })
    expect(startEvent.templateId).toBe("tmpl_123")
    expect(startEvent.metadata).toEqual({ orderId: "ord_123" })
    expect(startEvent.params.metadata).toEqual({ orderId: "ord_123" })
    expect(startEvent.params.system).toBe("You are helpful.")
    expect(startEvent.params.tools).toEqual([
      {
        name: "get_weather",
        input_schema: { type: "object" },
      },
    ])
    expect(startEvent.input).toEqual([
      {
        role: "system",
        content: "You are helpful.",
      },
      {
        role: "user",
        content: "What is the weather in San Francisco?",
      },
    ])

    expect(endEvent.event).toBe("end")
    expect(endEvent.metadata).toEqual({
      messageId: "msg_test",
      model: "claude-sonnet-4-5-20250929",
      stopReason: "tool_use",
      cacheCreationInputTokens: 4,
      cacheReadInputTokens: 2,
      inferenceGeo: "us",
      serviceTier: "standard",
    })
    expect(endEvent.output.role).toBe("assistant")
    expect(endEvent.output.id).toBe("msg_test")
    expect(endEvent.output.stop_reason).toBe("tool_use")
    expect(endEvent.output.content[0].type).toBe("thinking")
    expect(endEvent.output.content[1].type).toBe("tool_use")
    expect(endEvent.output.content[2].text).toContain("72F")
    expect(endEvent.tokensUsage).toEqual({
      prompt: 12,
      completion: 7,
      promptCached: 6,
    })
  })

  test("tracks streaming anthropic messages.create", async () => {
    const client = monitorAnthropic({
      messages: {
        create: async () => ({
          [Symbol.asyncIterator]: async function* () {
            yield {
              type: "message_start",
              message: {
                id: "msg_stream",
                role: "assistant",
                model: "claude-sonnet-4-5-20250929",
                usage: {
                  input_tokens: 18,
                  output_tokens: 0,
                  cache_creation_input_tokens: 3,
                  cache_read_input_tokens: 1,
                  inference_geo: "us",
                  service_tier: "standard",
                  server_tool_use: null,
                },
              },
            }
            yield {
              type: "content_block_start",
              index: 0,
              content_block: {
                type: "thinking",
                thinking: "",
                signature: "",
              },
            }
            yield {
              type: "content_block_delta",
              index: 0,
              delta: {
                type: "thinking_delta",
                thinking: "Let me think this through.",
              },
            }
            yield {
              type: "content_block_delta",
              index: 0,
              delta: {
                type: "signature_delta",
                signature: "sig_stream",
              },
            }
            yield {
              type: "content_block_start",
              index: 1,
              content_block: {
                type: "server_tool_use",
                id: "srv_123",
                caller: { type: "direct" },
                name: "web_search",
                input: {},
              },
            }
            yield {
              type: "content_block_delta",
              index: 1,
              delta: {
                type: "input_json_delta",
                partial_json: '{"query":"Anthropic"}',
              },
            }
            yield {
              type: "content_block_start",
              index: 2,
              content_block: {
                type: "text",
                text: "",
                citations: null,
              },
            }
            yield {
              type: "content_block_delta",
              index: 2,
              delta: {
                type: "text_delta",
                text: "Anthropic builds Claude.",
              },
            }
            yield {
              type: "message_delta",
              delta: {
                stop_reason: "end_turn",
                stop_sequence: null,
              },
              usage: {
                input_tokens: 18,
                output_tokens: 11,
                cache_creation_input_tokens: 3,
                cache_read_input_tokens: 1,
                server_tool_use: {
                  web_search_requests: 1,
                  web_fetch_requests: 0,
                },
              },
            }
            yield { type: "message_stop" }
          },
        }),
      },
    })

    const stream = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      stream: true,
      messages: [
        {
          role: "user",
          content: "Search for Anthropic and summarize it.",
        },
      ],
    })

    const parts = []
    for await (const part of stream as AsyncIterable<any>) {
      parts.push(part.type)
    }

    expect(parts).toContain("message_start")
    expect(parts).toContain("message_stop")

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)

    const endEvent = events[1]
    expect(endEvent.event).toBe("end")
    expect(endEvent.metadata).toEqual({
      messageId: "msg_stream",
      model: "claude-sonnet-4-5-20250929",
      stopReason: "end_turn",
      cacheCreationInputTokens: 3,
      cacheReadInputTokens: 1,
      inferenceGeo: "us",
      serviceTier: "standard",
    })
    expect(endEvent.output.role).toBe("assistant")
    expect(endEvent.output.content[0]).toEqual({
      type: "thinking",
      thinking: "Let me think this through.",
      signature: "sig_stream",
    })
    expect(endEvent.output.content[1]).toEqual({
      type: "server_tool_use",
      id: "srv_123",
      caller: { type: "direct" },
      name: "web_search",
      input: { query: "Anthropic" },
    })
    expect(endEvent.output.content[2]).toEqual({
      type: "text",
      text: "Anthropic builds Claude.",
    })
    expect(endEvent.tokensUsage).toEqual({
      prompt: 18,
      completion: 11,
      promptCached: 4,
    })
  })

  test("preserves raw stream return semantics when iteration breaks early", async () => {
    const stream = buildTrackedEventStream([
      {
        type: "message_start",
        message: {
          id: "msg_break",
          role: "assistant",
          model: "claude-sonnet-4-5-20250929",
          usage: {
            input_tokens: 5,
            output_tokens: 0,
          },
        },
      },
      {
        type: "content_block_start",
        index: 0,
        content_block: {
          type: "text",
          text: "",
        },
      },
      {
        type: "content_block_delta",
        index: 0,
        delta: {
          type: "text_delta",
          text: "partial",
        },
      },
      {
        type: "message_delta",
        delta: {
          stop_reason: "end_turn",
          stop_sequence: null,
        },
        usage: {
          input_tokens: 5,
          output_tokens: 2,
        },
      },
    ])

    const client = monitorAnthropic({
      messages: {
        create: async () => stream,
      },
    })

    const result = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 64,
      stream: true,
      messages: [{ role: "user", content: "break early" }],
    })

    const seen = []
    for await (const event of result as AsyncIterable<any>) {
      seen.push(event.type)
      if (seen.length === 3) break
    }

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)
    expect(stream.nextCalls).toBe(3)
    expect(stream.returnCalls).toBe(1)
    expect(result.controller.signal.aborted).toBe(true)
    expect(stream.controller.signal.aborted).toBe(true)
    expect(events[1].event).toBe("end")
    expect(events[1].output.content[0]).toEqual({
      type: "text",
      text: "partial",
    })
  })

  test("preserves raw stream abort semantics for controller.abort()", async () => {
    const stream = buildTrackedEventStream([
      {
        type: "message_start",
        message: {
          id: "msg_abort",
          role: "assistant",
          model: "claude-sonnet-4-5-20250929",
          usage: {
            input_tokens: 7,
            output_tokens: 0,
          },
        },
      },
      {
        type: "content_block_start",
        index: 0,
        content_block: {
          type: "text",
          text: "",
        },
      },
      {
        type: "content_block_delta",
        index: 0,
        delta: {
          type: "text_delta",
          text: "aborted",
        },
      },
    ])

    const client = monitorAnthropic({
      messages: {
        create: async () => stream,
      },
    })

    const result = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 64,
      stream: true,
      messages: [{ role: "user", content: "abort stream" }],
    })

    const iterator = (result as AsyncIterable<any>)[Symbol.asyncIterator]()
    await iterator.next()
    await iterator.next()
    result.controller.abort()
    const finalChunk = await iterator.next()

    expect(finalChunk.done).toBe(true)
    expect(result.controller.signal.aborted).toBe(true)

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)
    expect(stream.returnCalls).toBe(0)
    expect(stream.controller.signal.aborted).toBe(true)
    expect(events[1].event).toBe("end")
    expect(events[1].output.content).toEqual([{ type: "text", text: "" }])
  })

  test("tracks anthropic errors", async () => {
    const client = monitorAnthropic({
      messages: {
        create: async () => {
          throw new Error("anthropic request failed")
        },
      },
    })

    try {
      await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 128,
        messages: [{ role: "user", content: "Hello!" }],
      })
      throw new Error("Expected anthropic request to fail")
    } catch (error) {
      expect(error.message).toContain("anthropic request failed")
    }

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)
    expect(events[0].event).toBe("start")
    expect(events[1].event).toBe("error")
    expect(events[1].error.message).toContain("anthropic request failed")
  })

  test("preserves withResponse for anthropic stream helpers", async () => {
    const client = monitorAnthropic({
      messages: {
        create: (request) =>
          createFakeAPIPromise(() => ({
            controller: { signal: { aborted: false } },
            [Symbol.asyncIterator]: async function* () {
              yield {
                type: "message_start",
                message: {
                  id: "msg_helper_stream",
                  role: "assistant",
                  model: request.model,
                  usage: {
                    input_tokens: 6,
                    output_tokens: 0,
                  },
                },
              }
              yield {
                type: "content_block_start",
                index: 0,
                content_block: {
                  type: "text",
                  text: "",
                },
              }
              yield {
                type: "content_block_delta",
                index: 0,
                delta: {
                  type: "text_delta",
                  text: "helper stream output",
                },
              }
              yield {
                type: "message_delta",
                delta: {
                  stop_reason: "end_turn",
                  stop_sequence: null,
                },
                usage: {
                  input_tokens: 6,
                  output_tokens: 3,
                },
              }
              yield { type: "message_stop" }
            },
          })),
        stream(request, options) {
          return {
            collect: async () => {
              const { data, request_id } = await this.create(
                { ...request, stream: true },
                options,
              ).withResponse()
              const parts = []
              for await (const event of data) {
                parts.push(event.type)
              }
              return { parts, request_id }
            },
          }
        },
      },
    })

    const { parts, request_id } = await client.messages
      .stream({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 64,
        messages: [{ role: "user", content: "use helper stream" }],
      })
      .collect()

    expect(request_id).toBe("req_test")
    expect(parts).toEqual([
      "message_start",
      "content_block_start",
      "content_block_delta",
      "message_delta",
      "message_stop",
    ])

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(2)
    expect(events[1].event).toBe("end")
    expect(events[1].output.content[0].text).toBe("helper stream output")
  })

  test("tracks beta anthropic helpers through beta.messages.create", async () => {
    const createCalls = []
    const client = monitorAnthropic({
      beta: {
        messages: {
          create: (request, options) => {
            createCalls.push({ request, options })

            return createFakeAPIPromise(() =>
              request.stream
                ? {
                    controller: { signal: { aborted: false } },
                    [Symbol.asyncIterator]: async function* () {
                      yield {
                        type: "message_start",
                        message: {
                          id: `msg_${createCalls.length}`,
                          role: "assistant",
                          model: request.model,
                          usage: {
                            input_tokens: 10,
                            output_tokens: 0,
                          },
                        },
                      }
                      yield {
                        type: "content_block_start",
                        index: 0,
                        content_block: {
                          type: "text",
                          text: "",
                        },
                      }
                      yield {
                        type: "content_block_delta",
                        index: 0,
                        delta: {
                          type: "text_delta",
                          text: "beta stream output",
                        },
                      }
                      yield {
                        type: "message_delta",
                        delta: {
                          stop_reason: "end_turn",
                          stop_sequence: null,
                        },
                        usage: {
                          input_tokens: 10,
                          output_tokens: 4,
                        },
                      }
                      yield { type: "message_stop" }
                    },
                  }
                : {
                    id: `msg_${createCalls.length}`,
                    role: "assistant",
                    model: request.model,
                    content: [{ type: "text", text: `beta call ${createCalls.length}` }],
                    stop_reason: "end_turn",
                    stop_sequence: null,
                    usage: {
                      input_tokens: 9,
                      output_tokens: 4,
                    },
                  },
            )
          },
          parse(request, options) {
            return this.create(request, {
              ...options,
              headers: {
                ...(options?.headers || {}),
                "anthropic-beta": "structured-outputs-2025-12-15",
              },
            }).then((message) => ({
              ...message,
              parsed_output: { answer: 4 },
            }))
          },
          stream(request, options) {
            return {
              collect: async () => {
                const { data } = await this.create(
                  { ...request, stream: true },
                  {
                    ...options,
                    headers: {
                      ...(options?.headers || {}),
                      "anthropic-beta": "tool-use-2025-01-01",
                    },
                  },
                ).withResponse()
                const parts = []
                for await (const event of data) {
                  parts.push(event.type)
                }
                return parts
              },
            }
          },
          toolRunner(body, options) {
            return {
              runUntilDone: async () => {
                await this.create(body, {
                  ...options,
                  headers: {
                    ...(options?.headers || {}),
                    "x-stainless-helper": "compaction",
                  },
                })
                return this.create(body, options)
              },
            }
          },
        },
      },
      messages: {
        create: async () => ({
          id: "unused",
          role: "assistant",
          model: "claude-sonnet-4-5-20250929",
          content: [{ type: "text", text: "unused" }],
          stop_reason: "end_turn",
          stop_sequence: null,
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
      },
    })

    const parsed = await client.beta.messages.parse({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 64,
      messages: [{ role: "user", content: "beta parse" }],
      betas: ["structured-outputs-2025-12-15"],
      metadata: { user_id: "beta_user" },
    })
    const streamed = await client.beta.messages
      .stream({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 64,
        messages: [{ role: "user", content: "beta stream" }],
        betas: ["tool-use-2025-01-01"],
      })
      .collect()
    const finalToolRunnerResult = await client.beta.messages
      .toolRunner({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 64,
        messages: [{ role: "user", content: "beta tool runner" }],
      })
      .runUntilDone()

    expect(parsed.parsed_output).toEqual({ answer: 4 })
    expect(streamed).toContain("message_stop")
    expect(finalToolRunnerResult.content[0].text).toContain("beta call")
    expect(createCalls).toHaveLength(4)
    expect(createCalls[0].options.headers["anthropic-beta"]).toBe(
      "structured-outputs-2025-12-15",
    )
    expect(createCalls[1].options.headers["anthropic-beta"]).toBe(
      "tool-use-2025-01-01",
    )
    expect(createCalls[2].options.headers["x-stainless-helper"]).toBe(
      "compaction",
    )
    expect(createCalls[0].request.metadata).toEqual({ user_id: "beta_user" })

    await lunary.flush()

    const events = getRunEvents(payloads)
    expect(events).toHaveLength(8)
    expect(events.filter((event) => event.event === "start")).toHaveLength(4)
    expect(events.filter((event) => event.event === "end")).toHaveLength(4)
  })
})
