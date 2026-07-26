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

  assert.match(config, /pattern\s*=\s*["']thongphan\.com\/api\/chat["']/)
  assert.match(config, /workers_dev\s*=\s*false/)
  assert.match(config, /preview_urls\s*=\s*false/)
  assert.match(config, /\[observability\][\s\S]*enabled\s*=\s*true[\s\S]*head_sampling_rate\s*=\s*0\.1/)
  assert.doesNotMatch(config, /\bnodejs_compat\b/)
  assert.doesNotMatch(config, /^\s*\[ai\]\s*$/m)
  assert.doesNotMatch(config, /^\s*\[\[vectorize\]\]\s*$/m)
})
