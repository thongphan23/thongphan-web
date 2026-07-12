import assert from 'node:assert/strict'
import test from 'node:test'

import * as validator from './validate-brain2-lessons.mjs'

const {
  assertCanonicalExternalLinkInventory,
  checkRetainedExternalLinks,
  collectExternalLinkInventory,
} = validator

const legacySource = (hrefs) => {
  const anchors = hrefs.map((href, index) => `<a href="${href}">Resource ${index + 1}</a>`).join('')
  return `const DAY_CONTENT = {
${Array.from({ length: 21 }, (_, index) => {
    const day = index + 1
    return `  ${day}: { title: 'Synthetic lesson ${day}', content: \`${day === 1 ? anchors : 'Body'}\` },`
  }).join('\n')}
}`
}

const response = ({ status = 200, url, redirected = false, privateBody = 'PRIVATE SENTINEL' }) => ({
  ok: status >= 200 && status < 300,
  status,
  url,
  redirected,
  body: null,
  text: async () => privateBody,
})

test('exports the external-link inventory and checker contracts', () => {
  assert.equal(typeof collectExternalLinkInventory, 'function')
  assert.equal(typeof assertCanonicalExternalLinkInventory, 'function')
  assert.equal(typeof checkRetainedExternalLinks, 'function')
})

test('collects source URL occurrences and classifies retained links as an exact multiset', () => {
  const kept = 'https://kept.example/guide'
  const omitted = 'http://legacy.example/removed'
  const inventory = collectExternalLinkInventory(
    legacySource([kept, omitted, kept]),
    [kept, kept],
    { sourceName: 'synthetic-links.js' },
  )

  assert.deepEqual(inventory, {
    sourceUrls: [kept, omitted, kept],
    retainedUrls: [kept, kept],
    omittedUrls: [omitted],
  })
})

test('rejects retained links that are non-HTTPS or absent from the source inventory', () => {
  const source = legacySource(['https://kept.example/guide'])
  assert.throws(
    () => collectExternalLinkInventory(source, ['http://kept.example/guide']),
    /retained|HTTPS/i,
  )
  assert.throws(
    () => collectExternalLinkInventory(source, ['https://missing.example/guide']),
    /retained|source inventory/i,
  )
})

test('enforces the canonical 65 source, 60 retained and five omitted contract', () => {
  const retainedUrls = Array.from({ length: 60 }, (_, index) => `https://kept-${index + 1}.example/guide`)
  const omittedUrls = Array.from({ length: 5 }, (_, index) => `http://omitted-${index + 1}.example/old`)
  const inventory = collectExternalLinkInventory(
    legacySource([...retainedUrls, ...omittedUrls]),
    retainedUrls,
  )

  assert.doesNotThrow(() => assertCanonicalExternalLinkInventory(inventory))
  assert.throws(
    () => assertCanonicalExternalLinkInventory({ ...inventory, sourceUrls: inventory.sourceUrls.slice(1) }),
    /65|source/i,
  )
})

test('accepts an HTTPS redirect after one successful HEAD request', async () => {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url, options })
    return response({
      url: 'https://final.example/guide',
      redirected: true,
      privateBody: 'PRIVATE LESSON CONTENT MUST NEVER BE READ',
    })
  }

  const report = await checkRetainedExternalLinks(['https://start.example/guide'], {
    fetchImpl,
    concurrency: 2,
    timeoutMs: 50,
  })

  assert.equal(report.occurrences, 1)
  assert.equal(report.unique, 1)
  assert.equal(report.results[0].ok, true)
  assert.equal(report.results[0].method, 'HEAD')
  assert.equal(report.results[0].finalUrl, 'https://final.example/guide')
  assert.equal(report.results[0].redirected, true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].options.method, 'HEAD')
  assert.equal(calls[0].options.redirect, 'follow')
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE LESSON CONTENT/)
})

test('falls back from a rejected HEAD response to GET without reading the body', async () => {
  const methods = []
  let bodyRead = false
  const fetchImpl = async (url, options) => {
    methods.push(options.method)
    if (options.method === 'HEAD') return response({ status: 405, url })
    return {
      ...response({ status: 200, url }),
      text: async () => {
        bodyRead = true
        return 'PRIVATE SENTINEL'
      },
    }
  }

  const report = await checkRetainedExternalLinks(['https://fallback.example/guide'], {
    fetchImpl,
    concurrency: 1,
    timeoutMs: 50,
  })

  assert.deepEqual(methods, ['HEAD', 'GET'])
  assert.equal(report.results[0].ok, true)
  assert.equal(report.results[0].method, 'GET')
  assert.equal(bodyRead, false)
})

test('deduplicates network work and never exceeds the configured concurrency', async () => {
  const urls = [
    'https://one.example',
    'https://two.example',
    'https://one.example',
    'https://three.example',
    'https://four.example',
  ]
  let active = 0
  let maximumActive = 0
  let calls = 0
  const fetchImpl = async (url) => {
    calls += 1
    active += 1
    maximumActive = Math.max(maximumActive, active)
    await new Promise((resolve) => setTimeout(resolve, 5))
    active -= 1
    return response({ url })
  }

  const report = await checkRetainedExternalLinks(urls, {
    fetchImpl,
    concurrency: 2,
    timeoutMs: 100,
  })

  assert.equal(report.occurrences, 5)
  assert.equal(report.unique, 4)
  assert.equal(report.results.length, 4)
  assert.equal(calls, 4)
  assert.ok(maximumActive <= 2)
})

test('times out both attempts and returns a body-free failure record', async () => {
  const methods = []
  const fetchImpl = async (_url, options) => {
    methods.push(options.method)
    return new Promise((_resolve, reject) => {
      options.signal.addEventListener('abort', () => {
        const error = new Error('PRIVATE timeout details')
        error.name = 'AbortError'
        reject(error)
      }, { once: true })
    })
  }

  const report = await checkRetainedExternalLinks(['https://timeout.example/guide'], {
    fetchImpl,
    concurrency: 1,
    timeoutMs: 5,
  })

  assert.deepEqual(methods, ['HEAD', 'GET'])
  assert.deepEqual(report.results[0], {
    url: 'https://timeout.example/guide',
    ok: false,
    method: 'GET',
    status: null,
    finalUrl: null,
    redirected: false,
    error: 'timeout',
  })
  assert.doesNotMatch(JSON.stringify(report), /PRIVATE timeout details/)
})

test('rejects a successful redirect that downgrades the final URL to HTTP', async () => {
  const report = await checkRetainedExternalLinks(['https://start.example/guide'], {
    fetchImpl: async () => response({
      url: 'http://downgraded.example/guide',
      redirected: true,
    }),
    concurrency: 1,
    timeoutMs: 50,
  })

  assert.equal(report.results[0].ok, false)
  assert.equal(report.results[0].error, 'redirect-downgrade')
})
