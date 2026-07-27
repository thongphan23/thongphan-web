import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const PRODUCTION_D1_ID = '7cffb7f5-c48b-49c2-b215-9611abd734a5'
const productionWorkerNames = [
  'thongphan-com',
  'thongphan-signup-api',
  'thongphan-chat-api',
  'brain2-embedder',
]

test('preview Worker config is isolated and cannot claim a production route', async () => {
  const config = await readFile(new URL('../wrangler.reader-loop-preview.toml', import.meta.url), 'utf8')

  assert.match(config, /^name = "[^"]*(?:preview|reader-loop)[^"]*"/m)
  assert.match(config, /^workers_dev = true$/m)
  assert.match(config, /^preview_urls = true$/m)
  assert.doesNotMatch(config, /\[\[routes\]\]|routes\s*=/)
  assert.doesNotMatch(config, /\[\[kv_namespaces\]\]|\[\[r2_buckets\]\]|\[\[queues\./)
  assert.doesNotMatch(config, new RegExp(PRODUCTION_D1_ID, 'i'))

  for (const name of productionWorkerNames) {
    assert.doesNotMatch(config, new RegExp(`^name = "${name}"$`, 'm'))
  }
})

test('preview D1 schema is new and contains no production-domain tables', async () => {
  const migration = await readFile(new URL('../workers/reader-loop-preview-migrations/0001_reader_loop_v0.sql', import.meta.url), 'utf8')

  for (const table of [
    'anonymous_readers',
    'reader_questions',
    'recommendation_decisions',
    'reading_sessions',
    'reading_evidence_summaries',
    'manual_completions',
    'reflections',
    'next_action_decisions',
  ]) {
    assert.match(migration, new RegExp(`CREATE TABLE ${table}\\b`, 'i'))
  }

  assert.doesNotMatch(migration, /challenge_signups|email_queue|email_logs|brain2_access_failures/i)
})

test('preview Worker CORS only trusts the dedicated Pages project and local QA', async () => {
  const worker = await readFile(new URL('../workers/reader-loop-preview.ts', import.meta.url), 'utf8')

  assert.match(worker, /thongphan-reader-loop-preview\\\.pages\\\.dev/)
  assert.match(worker, /127\\\.0\\\.0\\\.1\|localhost/)
  assert.doesNotMatch(worker, /\[a-z0-9-\]\+\(\?:\\\.\[a-z0-9-\]\+\)\*\\\.pages\\\.dev/)
})

test('preview caller controls use a secret digest and scheduled expiry', async () => {
  const [config, worker, privacy] = await Promise.all([
    readFile(new URL('../wrangler.reader-loop-preview.toml', import.meta.url), 'utf8'),
    readFile(new URL('../workers/reader-loop-preview.ts', import.meta.url), 'utf8'),
    readFile(new URL('../lib/reader-loop/privacy.ts', import.meta.url), 'utf8'),
  ])

  assert.match(config, /^\[triggers\]$/m)
  assert.match(config, /^crons = \["0 3 \* \* \*"\]$/m)
  assert.match(worker, /CALLER_HASH_SECRET/)
  assert.match(worker, /headers\.get\('CF-Connecting-IP'\)/)
  assert.match(worker, /scheduled\(/)
  assert.match(privacy, /HMAC/)
  assert.match(privacy, /SHA-256/)
  assert.doesNotMatch(worker, /headers\.get\('(X-Forwarded-For|X-Real-IP)'\)/i)
})
