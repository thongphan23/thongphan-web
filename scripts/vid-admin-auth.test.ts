import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import test from 'node:test'
import { verifyAdminRequest } from '../workers/vid/auth'
import type { VidEnv } from '../workers/vid/types'

class NonceDatabase {
  readonly seen = new Set<string>()
  prepare() {
    return {
      bind: (nonce: string) => ({
        run: async () => {
          if (this.seen.has(nonce)) return { success: true, meta: { changes: 0 } }
          this.seen.add(nonce)
          return { success: true, meta: { changes: 1 } }
        },
      }),
    }
  }
}

function env(database = new NonceDatabase()): VidEnv {
  return {
    VID_DB: database as unknown as VidEnv['VID_DB'],
    PAGES_ORIGIN: 'https://pages.example.com',
    BUNNY_LIBRARY_ID: '123',
    BUNNY_CDN_HOST: 'media.example.com',
    VID_ADMIN_HMAC_SECRET: 'unit-test-admin-secret-32-characters',
  }
}

function signedRequest(body: string, timestamp: number, nonce = 'nonce-1234567890', path = '/api/admin/uploads') {
  const idempotencyKey = 'upload-test-01'
  const canonical = [
    'POST',
    path,
    String(timestamp),
    nonce,
    idempotencyKey,
    createHash('sha256').update(body).digest('hex'),
  ].join('\n')
  const signature = createHmac('sha256', 'unit-test-admin-secret-32-characters').update(canonical).digest('hex')
  return new Request(`https://vid.thongphan.com${path}`, {
    method: 'POST',
    headers: {
      'X-Vid-Timestamp': String(timestamp),
      'X-Vid-Nonce': nonce,
      'X-Vid-Idempotency-Key': idempotencyKey,
      'X-Vid-Signature': signature,
    },
    body,
  })
}

test('accepts one exact signed request and rejects nonce replay', async () => {
  const database = new NonceDatabase()
  const current = 1_786_500_000
  const body = '{"title":"Video"}'
  const request = signedRequest(body, current)
  assert.equal(await verifyAdminRequest(request, body, env(database), current), true)
  assert.equal(await verifyAdminRequest(request, body, env(database), current), false)
})

test('rejects body tamper, stale time, wrong path and malformed signature', async () => {
  const current = 1_786_500_000
  assert.equal(await verifyAdminRequest(signedRequest('{}', current), '{"changed":true}', env(), current), false)
  assert.equal(await verifyAdminRequest(signedRequest('{}', current - 301), '{}', env(), current), false)

  const wrongPath = signedRequest('{}', current, 'nonce-abcdefghij', '/api/admin/other')
  assert.equal(await verifyAdminRequest(wrongPath, '{}', env(), current), true)
  const forwarded = new Request('https://vid.thongphan.com/api/admin/uploads', wrongPath)
  assert.equal(await verifyAdminRequest(forwarded, '{}', env(), current), false)

  const malformed = signedRequest('{}', current, 'nonce-malformed-1')
  malformed.headers.set('X-Vid-Signature', 'not-hex')
  assert.equal(await verifyAdminRequest(malformed, '{}', env(), current), false)
})

test('fails closed when the admin secret is absent', async () => {
  const current = 1_786_500_000
  const request = signedRequest('{}', current)
  const missing = { ...env(), VID_ADMIN_HMAC_SECRET: undefined }
  assert.equal(await verifyAdminRequest(request, '{}', missing, current), false)
})
