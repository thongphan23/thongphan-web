import assert from 'node:assert/strict'
import test from 'node:test'
import { deriveRotatingCallerHash } from '../lib/reader-loop/privacy'

const secret = 'preview-only-test-secret-with-at-least-32-characters'

test('caller keys are keyed, opaque, stable within a day and rotate across callers or days', async () => {
  const first = await deriveRotatingCallerHash(secret, '203.0.113.7', '2026-07-28T02:00:00.000Z')
  const repeated = await deriveRotatingCallerHash(secret, '203.0.113.7', '2026-07-28T23:59:59.000Z')
  const anotherCaller = await deriveRotatingCallerHash(secret, '203.0.113.8', '2026-07-28T02:00:00.000Z')
  const nextDay = await deriveRotatingCallerHash(secret, '203.0.113.7', '2026-07-29T02:00:00.000Z')

  assert.match(first ?? '', /^[a-f0-9]{64}$/)
  assert.equal(first, repeated)
  assert.notEqual(first, anotherCaller)
  assert.notEqual(first, nextDay)
  assert.doesNotMatch(first ?? '', /203\.0\.113\.7/)
})

test('caller key derivation fails closed without a strong secret or managed client address', async () => {
  assert.equal(await deriveRotatingCallerHash('', '203.0.113.7', '2026-07-28T02:00:00.000Z'), null)
  assert.equal(await deriveRotatingCallerHash('short', '203.0.113.7', '2026-07-28T02:00:00.000Z'), null)
  assert.equal(await deriveRotatingCallerHash(secret, '', '2026-07-28T02:00:00.000Z'), null)
  assert.equal(await deriveRotatingCallerHash(secret, 'bad\naddress', '2026-07-28T02:00:00.000Z'), null)
})
