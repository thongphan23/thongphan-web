import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import chatWorker from '../workers/api/chat'

const CHAT_URL = 'https://thongphan.com/api/chat'
const PROBLEM_BODY = {
  type: 'about:blank',
  title: 'Endpoint disabled',
  status: 410,
} as const
const DISABLED_HEADERS = {
  'cache-control': 'private, no-store, max-age=0',
  'content-type': 'application/problem+json; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-tp-endpoint-state': 'disabled',
} as const

function assertExactChatConfig(config: string): void {
  const routes = [...config.matchAll(/^\s*\[\[routes\]\]\s*$/gm)]
  const patterns = [...config.matchAll(/^\s*pattern\s*=\s*["']([^"']+)["']\s*$/gm)]
    .map((match) => match[1])
  const zones = [...config.matchAll(/^\s*zone_name\s*=\s*["']([^"']+)["']\s*$/gm)]
    .map((match) => match[1])
  const names = [...config.matchAll(/^\s*name\s*=\s*["']([^"']+)["']\s*$/gm)]
    .map((match) => match[1])
  const workersDev = [...config.matchAll(/^\s*workers_dev\s*=\s*(\S+)\s*$/gm)]
    .map((match) => match[1])
  const previewUrls = [...config.matchAll(/^\s*preview_urls\s*=\s*(\S+)\s*$/gm)]
    .map((match) => match[1])

  assert.deepEqual(names, ['thongphan-chat-api'])
  assert.equal(routes.length, 1)
  assert.deepEqual(patterns, ['thongphan.com/api/chat'])
  assert.deepEqual(zones, ['thongphan.com'])
  assert.deepEqual(workersDev, ['false'])
  assert.deepEqual(previewUrls, ['false'])
  assert.doesNotMatch(config, /\bnodejs_compat\b/)
  assert.doesNotMatch(
    config,
    /^\s*(?:\[ai\]|\[vars\]|\[\[vectorize\]\]|\[\[d1_databases\]\]|\[\[kv_namespaces\]\]|\[\[r2_buckets\]\]|\[\[services\]\]|\[\[queues\.(?:producers|consumers)\]\]|\[\[analytics_engine_datasets\]\]|\[\[ratelimits\]\])/m,
  )
  assert.doesNotMatch(config, /^\s*[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|KEY)[A-Z0-9_]*\s*=/m)
}

interface EnvironmentProbe {
  readonly bindings: object
  readonly aiCalls: number
  readonly vectorReads: number
}

function createEnvironmentProbe(): EnvironmentProbe {
  let aiCalls = 0
  let vectorReads = 0

  const bindings = {
    AI: {
      run(model: string) {
        aiCalls += 1
        if (model.includes('bge-base')) return Promise.resolve({ data: [[0.1, 0.2, 0.3]] })

        const encoder = new TextEncoder()
        return Promise.resolve(new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(encoder.encode('data: {"response":"synthetic"}\n\n'))
            controller.close()
          },
        }))
      },
    },
    BRAIN2_INDEX: {
      query() {
        vectorReads += 1
        return Promise.resolve({ matches: [] })
      },
    },
  }

  return {
    bindings,
    get aiCalls() {
      return aiCalls
    },
    get vectorReads() {
      return vectorReads
    },
  }
}

async function invokeWorker(request: Request, environment: object): Promise<Response> {
  const fetchHandler: unknown = chatWorker.fetch
  if (typeof fetchHandler !== 'function') assert.fail('expected Worker fetch handler')
  const result: unknown = await Reflect.apply(fetchHandler, chatWorker, [request, environment])
  assert.ok(result instanceof Response)
  return result
}

function syntheticPost(): Request {
  return new Request(CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Synthetic anonymous security request' }),
  })
}

async function assertDisabled(response: Response): Promise<void> {
  assert.equal(response.status, 410)
  for (const [name, expected] of Object.entries(DISABLED_HEADERS)) {
    assert.equal(response.headers.get(name), expected, `header ${name}`)
  }
  assert.deepEqual(await response.json(), PROBLEM_BODY)
}

test('chat tombstone returns the same 410 contract for anonymous POST, GET, and OPTIONS', async () => {
  const environment = createEnvironmentProbe()
  const responses = await Promise.all([
    invokeWorker(syntheticPost(), environment.bindings),
    invokeWorker(new Request(CHAT_URL, { method: 'GET' }), environment.bindings),
    invokeWorker(new Request(CHAT_URL, { method: 'OPTIONS' }), environment.bindings),
  ])

  await Promise.all(responses.map(assertDisabled))
  assert.equal(environment.aiCalls, 0)
  assert.equal(environment.vectorReads, 0)
})

test('25 concurrent anonymous chat requests cannot consume AI or Vectorize budget', async () => {
  const environment = createEnvironmentProbe()
  const responses = await Promise.all(
    Array.from({ length: 25 }, () => invokeWorker(syntheticPost(), environment.bindings)),
  )

  await Promise.all(responses.map(assertDisabled))
  assert.equal(environment.aiCalls, 0)
  assert.equal(environment.vectorReads, 0)
})

test('chat Worker config exposes only the exact apex tombstone with sampled observability', () => {
  const config = readFileSync(new URL('../wrangler.chat.toml', import.meta.url), 'utf8')

  assertExactChatConfig(config)
  assert.match(config, /\[observability\][\s\S]*enabled\s*=\s*true[\s\S]*head_sampling_rate\s*=\s*0\.1/)

  assert.throws(
    () => assertExactChatConfig(`${config}\n[[routes]]\npattern = "thongphan.com/api/chat*"\nzone_name = "thongphan.com"\n`),
    /Expected values to be strictly equal|Expected values to be strictly deep-equal/,
  )
  assert.throws(
    () => assertExactChatConfig(`${config}\n[[services]]\nbinding = "ACCIDENTAL"\nservice = "synthetic"\n`),
    /input was expected to not match/i,
  )
})
