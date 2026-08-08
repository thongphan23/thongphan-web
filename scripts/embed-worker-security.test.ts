import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import embedWorker from '../workers/embed-vault'
import {
  createDisabledEndpointWorker,
  type DisabledEndpointEvent,
} from '../workers/security/disabled-endpoint'

const EMBED_URL = 'https://thongphan.com/api/embed'
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
  readonly proxy: object
  readonly propertyAccesses: number
  readonly aiCalls: number
  readonly vectorWrites: number
}

function createEnvironmentProbe(): EnvironmentProbe {
  let propertyAccesses = 0
  let aiCalls = 0
  let vectorWrites = 0

  const proxy = new Proxy(Object.create(null) as object, {
    get(_target, property) {
      propertyAccesses += 1
      if (property === 'AI') aiCalls += 1
      if (property === 'BRAIN2_INDEX') vectorWrites += 1
      throw new Error(`unexpected environment access: ${String(property)}`)
    },
  })

  return {
    proxy,
    get propertyAccesses() {
      return propertyAccesses
    },
    get aiCalls() {
      return aiCalls
    },
    get vectorWrites() {
      return vectorWrites
    },
  }
}

async function invokeWorker(
  worker: { readonly fetch?: unknown },
  request: Request,
  environment: object,
): Promise<Response> {
  const fetchHandler = worker.fetch
  if (typeof fetchHandler !== 'function') {
    assert.fail('expected Worker fetch handler')
  }
  const result: unknown = await Reflect.apply(fetchHandler, worker, [request, environment])
  assert.ok(result instanceof Response)
  return result
}

function invoke(request: Request, environment: object): Promise<Response> {
  return invokeWorker(embedWorker, request, environment)
}

async function assertDisabled(response: Response): Promise<void> {
  assert.equal(response.status, 410)
  for (const [name, expected] of Object.entries(DISABLED_HEADERS)) {
    assert.equal(response.headers.get(name), expected, `header ${name}`)
  }
  assert.deepEqual(await response.json(), PROBLEM_BODY)
}

function syntheticPost(headers: HeadersInit = {}): Request {
  return new Request(EMBED_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      filePath: 'synthetic-security-fixture.md',
      content: 'Synthetic vector payload that is long enough to reach the legacy AI binding.',
    }),
  })
}

function assertExactEmbedConfig(config: string): void {
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

  assert.deepEqual(names, ['brain2-embedder'])
  assert.equal(routes.length, 1)
  assert.deepEqual(patterns, ['thongphan.com/api/embed'])
  assert.deepEqual(zones, ['thongphan.com'])
  assert.deepEqual(workersDev, ['false'])
  assert.deepEqual(previewUrls, ['false'])
  assert.doesNotMatch(
    config,
    /^\s*(?:\[ai\]|\[vars\]|\[\[vectorize\]\]|\[\[d1_databases\]\]|\[\[kv_namespaces\]\]|\[\[r2_buckets\]\]|\[\[services\]\]|\[\[queues\.(?:producers|consumers)\]\]|\[\[analytics_engine_datasets\]\]|\[\[ratelimits\]\])/m,
  )
  assert.doesNotMatch(config, /^\s*[A-Z][A-Z0-9_]*(?:SECRET|TOKEN|KEY)[A-Z0-9_]*\s*=/m)
}

test('embed tombstone returns 410 without trusting identity or touching bindings', async (t) => {
  await t.test('anonymous synthetic vector POST cannot reach a binding', async () => {
    const environment = createEnvironmentProbe()
    await assertDisabled(await invoke(syntheticPost(), environment.proxy))
    assert.equal(environment.propertyAccesses, 0)
    assert.equal(environment.aiCalls, 0)
    assert.equal(environment.vectorWrites, 0)
  })

  await t.test('fabricated Cloudflare Access identity cannot reactivate ingestion', async () => {
    const environment = createEnvironmentProbe()
    const request = syntheticPost({
      'CF-Access-Client-Id': 'fabricated-client-id.access',
      'CF-Access-Client-Secret': 'synthetic-public-test-value',
    })
    await assertDisabled(await invoke(request, environment.proxy))
    assert.equal(environment.propertyAccesses, 0)
    assert.equal(environment.aiCalls, 0)
    assert.equal(environment.vectorWrites, 0)
  })
})

test('embed tombstone never reads an oversized streamed body', async () => {
  const environment = createEnvironmentProbe()
  let bodyReads = 0
  const chunk = new Uint8Array(1024 * 1024)
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      bodyReads += 1
      if (bodyReads > 8) {
        controller.close()
        return
      }
      controller.enqueue(chunk)
    },
  }, { highWaterMark: 0 })
  const init: RequestInit & { duplex: 'half' } = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': String(chunk.byteLength * 8),
    },
    body,
    duplex: 'half',
  }

  await assertDisabled(await invoke(new Request(EMBED_URL, init), environment.proxy))
  assert.equal(bodyReads, 0)
  assert.equal(environment.propertyAccesses, 0)
  assert.equal(environment.aiCalls, 0)
  assert.equal(environment.vectorWrites, 0)
})

test('embed tombstone returns the same disabled contract for GET and OPTIONS', async () => {
  for (const method of ['GET', 'OPTIONS']) {
    const environment = createEnvironmentProbe()
    await assertDisabled(await invoke(new Request(EMBED_URL, { method }), environment.proxy))
    assert.equal(environment.propertyAccesses, 0)
    assert.equal(environment.aiCalls, 0)
    assert.equal(environment.vectorWrites, 0)
  }
})

test('disabled endpoint logger receives only the fixed security event', async () => {
  const events: DisabledEndpointEvent[] = []
  const environment = createEnvironmentProbe()
  const worker = createDisabledEndpointWorker('/api/embed', (event) => events.push(event))
  const request = new Request(`${EMBED_URL}?ignored=synthetic`, {
    method: 'PATCH',
    headers: {
      'CF-Ray': 'synthetic-request-id',
      Authorization: 'Bearer synthetic-public-test-value',
      Cookie: 'synthetic-cookie=test',
    },
  })

  await assertDisabled(await invokeWorker(worker, request, environment.proxy))
  assert.deepEqual(events, [{
    event: 'disabled_endpoint_hit',
    endpoint: '/api/embed',
    method: 'PATCH',
    status: 410,
    request_id: 'synthetic-request-id',
    ai_calls: 0,
    vector_reads: 0,
    vector_writes: 0,
  }])
  assert.equal(environment.propertyAccesses, 0)
})

test('embed Worker config has exactly one binding-free apex route', () => {
  const config = readFileSync(new URL('../wrangler.embed.toml', import.meta.url), 'utf8')
  assertExactEmbedConfig(config)

  assert.throws(
    () => assertExactEmbedConfig(`${config}\n[[routes]]\npattern = "www.thongphan.com/api/embed"\nzone_name = "thongphan.com"\n`),
    /Expected values to be strictly equal|Expected values to be strictly deep-equal/,
  )
  assert.throws(
    () => assertExactEmbedConfig(`${config}\n[[kv_namespaces]]\nbinding = "ACCIDENTAL"\nid = "synthetic"\n`),
    /input was expected to not match/i,
  )
})
