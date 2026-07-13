import assert from 'node:assert/strict'
import test from 'node:test'
import { onRequest } from '../functions/learn/[[path]]'

function context(runtimeFlag?: string) {
  let nextCalls = 0
  return {
    value: {
      env: runtimeFlag === undefined ? {} : { LEARN_PUBLIC_ENABLED: runtimeFlag },
      next: async () => {
        nextCalls += 1
        return new Response('static Learn asset', { status: 200 })
      },
    },
    nextCalls: () => nextCalls,
  }
}

test('Pages Learn handler falls through to static assets only when runtime binding is exactly true', async () => {
  const enabled = context('true')
  const response = await onRequest(enabled.value)

  assert.equal(response.status, 200)
  assert.equal(await response.text(), 'static Learn asset')
  assert.equal(enabled.nextCalls(), 1)
})

for (const [name, runtimeFlag] of [
  ['missing', undefined],
  ['false', 'false'],
] as const) {
  test(`Pages Learn handler returns the disabled noindex 404 when runtime binding is ${name}`, async () => {
    const disabled = context(runtimeFlag)
    const response = await onRequest(disabled.value)

    assert.equal(response.status, 404)
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.match(response.headers.get('content-type') ?? '', /text\/html/)
    assert.match(await response.text(), /Chương học này chưa lên sóng/)
    assert.equal(disabled.nextCalls(), 0)
  })
}
