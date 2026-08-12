import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('public video shortcut redirects to the released Vietnamese dub', async () => {
  const { createThongphanRouter } = await import('../workers/thongphan-router.mjs')
  let originCalls = 0
  const router = createThongphanRouter({
    fetchImpl: async () => {
      originCalls += 1
      return new Response('unexpected')
    },
  })

  for (const pathname of ['/video', '/video/']) {
    const response = await router.fetch(new Request(`https://thongphan.com${pathname}`))

    assert.equal(response.status, 302)
    assert.equal(
      response.headers.get('location'),
      'https://vid.thongphan.com/watch?v=ky-thuat-prompting-claude-gauntlet-loop',
    )
  }
  assert.equal(originCalls, 0)
})

test('custom-domain router preserves Pages redirects instead of flattening them to 200', async () => {
  const { createThongphanRouter } = await import('../workers/thongphan-router.mjs')
  let forwardedRequest
  let forwardedInit
  const router = createThongphanRouter({
    fetchImpl: async (request, init) => {
      forwardedRequest = request
      forwardedInit = init
      return new Response(null, {
        status: 301,
        headers: { Location: '/experiences' },
      })
    },
  })

  const response = await router.fetch(new Request('https://thongphan.com/challenges'))

  assert.equal(forwardedRequest, 'https://thongphan-com.pages.dev/challenges')
  assert.equal(forwardedInit.redirect, 'manual')
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/experiences')
  assert.equal(response.headers.get('x-tp-router'), 'pages-origin')
  assert.equal(response.headers.get('cache-control'), 'public, max-age=0, must-revalidate')
})

test('tracked router config owns both canonical custom-domain routes', async () => {
  const config = await readFile(new URL('../wrangler.router.toml', import.meta.url), 'utf8')

  assert.match(config, /^name = "thongphan-com-router"$/m)
  assert.match(config, /^main = "workers\/thongphan-router\.mjs"$/m)
  assert.match(config, /pattern = "thongphan\.com\/\*"/)
  assert.match(config, /pattern = "www\.thongphan\.com\/\*"/)
})
