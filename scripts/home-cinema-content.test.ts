import assert from 'node:assert/strict'
import test from 'node:test'

async function loadContentModule() {
  try {
    return await import('../components/home-cinema/home-cinema-content')
  } catch {
    assert.fail('resolveMirrorResult is not implemented')
  }
}

test('question two selects the result category', async () => {
  const { resolveMirrorResult } = await loadContentModule()

  assert.equal(resolveMirrorResult({ experience: 'under-3', stuck: 'proof', start: 'content' }).category, 'proof')
  assert.equal(resolveMirrorResult({ experience: '3-5', stuck: 'asset', start: 'asset' }).category, 'asset')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'community', start: 'community' }).category, 'community')
})

test('question three selects the next route', async () => {
  const { resolveMirrorResult } = await loadContentModule()

  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'content' }).href, '/library')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'asset' }).href, '/diagnostic')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'community' }).href, '/conanmaker')
})

test('question one personalizes the explanation without changing the category', async () => {
  const { resolveMirrorResult } = await loadContentModule()
  const short = resolveMirrorResult({ experience: 'under-3', stuck: 'asset', start: 'asset' })
  const long = resolveMirrorResult({ experience: 'over-5', stuck: 'asset', start: 'asset' })

  assert.equal(short.category, long.category)
  assert.notEqual(short.explanation, long.explanation)
})
