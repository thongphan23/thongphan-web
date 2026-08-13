import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { access, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'
import { chromium } from 'playwright'

const root = resolve(import.meta.dirname, '..')
const out = join(root, 'out')
const output = process.env.VID_QA_OUTPUT ?? '/private/tmp/thongphan-vid-qa'

await access(join(out, 'vid.html'))
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
}

const shellMap = new Map([
  ['/', '/vid.html'], ['/watch', '/vid/watch.html'], ['/results', '/vid/results.html'],
  ['/topic', '/vid/topic.html'], ['/playlist', '/vid/playlist.html'], ['/library', '/vid/library.html'],
])

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://local')
    const requested = shellMap.get(url.pathname) ?? url.pathname
    const candidate = normalize(join(out, requested))
    if (!candidate.startsWith(`${out}/`)) throw new Error('unsafe path')
    const body = await readFile(candidate)
    response.writeHead(200, { 'Content-Type': mime[extname(candidate)] ?? 'application/octet-stream' })
    response.end(body)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('not found')
  }
})

await new Promise((resolveServer) => server.listen(0, '127.0.0.1', resolveServer))
const address = server.address()
if (!address || typeof address === 'string') throw new Error('QA server failed')
const base = `http://vid.thongphan.com:${address.port}`

const images = [
  '/images/homepage/proof/thong-stage-3x2-v1.webp',
  '/images/homepage/proof/thong-author-book-3x2-v1.webp',
  '/images/homepage/thong-library-author.jpg',
  '/images/blog/cover-ai-khong-cuop-viec-ban.png',
  '/images/blog/cover-brain2-obsidian.png',
  '/images/challenges/brain2-21-day-editorial-slate-v1.webp',
]

const videos = images.map((image, index) => ({
  slug: `video-thu-${index + 1}`,
  title: index === 0 ? 'Nguyên tắc ứng phó với trật tự thế giới đang thay đổi - Theo Ray Dalio (Principles for Dealing with the Changing World Order by Ray Dalio)' : index === 1 ? 'Tại sao người giỏi vẫn có thể bị mắc kẹt khi biến chuyên môn thành một hệ thống sống trong thời đại AI?' : [
    'Tư duy hệ thống cho người làm nghề', 'Xây một bộ não thứ hai không bắt đầu từ công cụ', 'Chọn lọc tri thức giữa thời đại dư thừa',
    'AI không cướp việc bạn — sự trì hoãn mới có thể', 'Từ ghi chú rời rạc đến tài sản có người dùng', '21 ngày xây Brain2 từ ca thật',
  ][index],
  description: 'Một video chuyên sâu được tuyển chọn để giúp người xem hiểu bản chất, nhìn thấy ứng dụng và có bước tiếp theo rõ ràng.',
  sourceTitle: index === 0 ? 'Principles for Dealing with the Changing World Order by Ray Dalio' : `Original Video ${index + 1}`,
  sourceCreator: index === 0 ? 'Principles by Ray Dalio' : index % 2 ? 'The Knowledge Project' : 'Original Creator',
  sourceCreatorUrl: 'https://www.youtube.com/@creator',
  sourceVideoUrl: `https://www.youtube.com/watch?v=source${index + 1}`,
  translationLabel: 'Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn',
  topics: [index < 3 ? 'tu-duy' : 'ai'],
  tags: ['chuyên môn', index < 3 ? 'hệ thống' : 'AI'],
  playlists: ['nen-tang-ai'],
  durationSeconds: 605 + index * 71,
  thumbnailUrl: `${base}${image}`,
  previewUrl: `${base}${image}`,
  playerUrl: `https://player.mediadelivery.net/embed/123/00000000-0000-4000-8000-00000000000${index}`,
  featuredRank: index === 0 ? 1 : null,
  publishedAt: new Date(Date.UTC(2026, 7, 12 - index)).toISOString(),
}))

function apiPayload(url, { invalidEmbed = false } = {}) {
  if (url.pathname === '/api/topics') return { items: [{ slug: 'tu-duy', label: 'Tư duy', video_count: 3 }, { slug: 'ai', label: 'AI', video_count: 3 }] }
  if (url.pathname === '/api/videos') {
    const query = (url.searchParams.get('q') ?? '').toLocaleLowerCase('vi')
    const topic = url.searchParams.get('topic')
    const items = videos.filter((video) => (!query || `${video.title} ${video.description}`.toLocaleLowerCase('vi').includes(query)) && (!topic || video.topics.includes(topic)))
    return { items, nextCursor: null, hasMore: false, policyVersion: 'vid-feed-v1' }
  }
  if (url.pathname.startsWith('/api/videos/')) {
    const video = videos.find(({ slug }) => slug === decodeURIComponent(url.pathname.split('/').at(-1) ?? ''))
    return video ? invalidEmbed ? { ...video, playerUrl: 'https://example.com/not-a-bunny-player' } : video : { error: 'not_found' }
  }
  if (url.pathname.startsWith('/api/playlists/')) return { slug: 'nen-tang-ai', title: 'Nền tảng AI', description: 'Một lộ trình video có thứ tự.', items: videos }
  return { error: 'not_found' }
}

function providerProtocolFixture() {
  return `<!doctype html><html><body style="margin:0;background:#000;color:#ddd;display:grid;place-items:center;height:100vh;font:14px sans-serif">Player.js protocol fixture
    <script src="https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js"></script>
    <script>
      const stats = { ready: false, listenerAdds: 0, seekValues: [], lastTime: null }
      const report = () => parent.postMessage({ context: 'vid-qa-provider-stats', stats: { ...stats } }, '*')
      addEventListener('message', (event) => {
        let message = event.data
        if (typeof message === 'string') try { message = JSON.parse(message) } catch { return }
        if (message?.context !== 'player.js') return
        if (message.method === 'addEventListener') stats.listenerAdds += 1
        if (message.method === 'setCurrentTime') stats.seekValues.push(message.value)
        report()
      })
      const adapter = new playerjs.MockAdapter()
      const emit = adapter.receiver.emit.bind(adapter.receiver)
      adapter.receiver.emit = (event, value) => {
        if (event === 'timeupdate') stats.lastTime = value?.seconds ?? null
        report()
        return emit(event, value)
      }
      window.__vidQaEmit = (event, value) => adapter.receiver.emit(event, value)
      window.__vidQaStartPlayback = () => adapter.receiver.methods.play.call(adapter.receiver)
      window.__vidQaPausePlayback = () => adapter.receiver.methods.pause.call(adapter.receiver)
      stats.ready = true
      adapter.ready()
      report()
    </script>
  </body></html>`
}

async function installRoutes(page, { apiError = false, invalidEmbed = false, scriptError = false } = {}) {
  await page.route(`${base}/api/**`, async (route) => {
    if (apiError) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' })
    const payload = apiPayload(new URL(route.request().url()), { invalidEmbed })
    return route.fulfill({ status: 'error' in payload ? 404 : 200, contentType: 'application/json', body: JSON.stringify(payload) })
  })
  await page.route('https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js', (route) => {
    if (scriptError) return route.abort('failed')
    return route.continue()
  })
  await page.route('https://player.mediadelivery.net/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: providerProtocolFixture(),
  }))
}

async function inspect(page, name) {
  const state = await page.evaluate(() => {
    const header = document.querySelector('header')?.getBoundingClientRect()
    const mainContent = document.querySelector('main')?.firstElementChild?.getBoundingClientRect()
    const visibleControls = [...document.querySelectorAll('button, a')].filter((element) => {
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden'
    })
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      headerMainOverlap: header && mainContent ? Math.max(0, header.bottom - mainContent.top) : 0,
      geometry: { header: header ? { top: header.top, bottom: header.bottom, height: header.height } : null, mainContent: mainContent ? { top: mainContent.top, bottom: mainContent.bottom } : null },
      brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
      tinyControls: visibleControls.filter((element) => {
        const rect = element.getBoundingClientRect()
        return rect.height < 44 || rect.width < 44
      }).map((element) => (element.textContent ?? element.getAttribute('aria-label') ?? element.tagName).trim().slice(0, 50)),
      cards: document.querySelectorAll('article').length,
      bottomNav: document.querySelector('nav[aria-label="Điều hướng video trên di động"]') ? getComputedStyle(document.querySelector('nav[aria-label="Điều hướng video trên di động"]')).display : null,
    }
  })
  assert.ok(state.overflow <= 1, `${name}: horizontal overflow ${state.overflow}`)
  assert.equal(state.headerMainOverlap, 0, `${name}: pinned header overlaps main ${JSON.stringify(state.geometry)}`)
  assert.equal(state.brokenImages, 0, `${name}: broken images`)
  assert.deepEqual(state.tinyControls, [], `${name}: undersized controls ${state.tinyControls.join(', ')}`)
  return state
}

async function assertFeaturedCopyLayout(page, name) {
  const geometry = await page.evaluate(() => {
    const copy = document.querySelector('[data-vid-featured-copy]')
    const heading = document.querySelector('#featured-title')
    const cta = copy?.querySelector('a')
    if (!(copy instanceof HTMLElement) || !(heading instanceof HTMLElement) || !(cta instanceof HTMLElement)) {
      throw new Error('featured QA anchors are missing')
    }
    const copyRect = copy.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(heading)
    const headingRects = [...range.getClientRects()].map(({ top, right, bottom, left, width, height }) => ({ top, right, bottom, left, width, height }))
    const ctaRect = cta.getBoundingClientRect()
    const lineHeight = Number.parseFloat(getComputedStyle(heading).lineHeight)
    return {
      copy: copyRect.toJSON(),
      heading: heading.getBoundingClientRect().toJSON(),
      headingText: heading.textContent?.trim(),
      lineHeight,
      headingRects,
      cta: ctaRect.toJSON(),
    }
  })
  assert.equal(geometry.headingText, 'Trật tự thế giới đang thay đổi', `${name}: featured poster uses an unedited long title`)
  assert.ok(geometry.headingRects.length > 0, `${name}: featured heading has no rendered glyph range`)
  assert.ok(geometry.headingRects.length <= 2, `${name}: featured heading exceeds two lines ${JSON.stringify(geometry)}`)
  assert.ok(geometry.copy.height <= (name === 'mobile-390' ? 210 : 310), `${name}: featured copy is too tall ${JSON.stringify(geometry.copy)}`)
  for (const rect of geometry.headingRects) {
    assert.ok(
      rect.left >= geometry.copy.left - 1 && rect.right <= geometry.copy.right + 1 && rect.top >= geometry.copy.top - 1 && rect.bottom <= geometry.copy.bottom + 1,
      `${name}: featured Vietnamese glyph range is clipped ${JSON.stringify({ rect, copy: geometry.copy })}`,
    )
    const overlapsCta = rect.left < geometry.cta.right && rect.right > geometry.cta.left && rect.top < geometry.cta.bottom && rect.bottom > geometry.cta.top
    assert.equal(overlapsCta, false, `${name}: featured CTA overlaps heading ${JSON.stringify({ rect, cta: geometry.cta })}`)
  }
  return geometry
}

const browser = await chromium.launch({ headless: true, args: ['--host-resolver-rules=MAP vid.thongphan.com 127.0.0.1'] })
const results = []
let playbackPartial = null
try {
  for (const viewport of [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 720 },
    { name: 'tablet-1024', width: 1024, height: 768 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport })
    await context.addInitScript(() => localStorage.setItem('thongphan.vid.library.v1', JSON.stringify({ version: 1, progress: [{ slug: 'video-thu-2', seconds: 120, duration: 676, updatedAt: Date.now() }], watchLater: ['video-thu-3'] })))
    const page = await context.newPage()
    const errors = []
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    page.on('pageerror', (error) => errors.push(error.message))
    await installRoutes(page)
    const response = await page.goto(base, { waitUntil: 'networkidle' })
    assert.equal(response?.status(), 200, `${viewport.name}: home status`)
    await page.locator('text=Mới tuyển chọn').waitFor()
    const state = await inspect(page, viewport.name)
    const featured = await assertFeaturedCopyLayout(page, viewport.name)
    assert.ok(state.cards >= 5, `${viewport.name}: catalog cards missing`)
    if (viewport.width <= 780) assert.equal(state.bottomNav, 'grid', `${viewport.name}: mobile navigation missing`)
    assert.deepEqual(errors, [], `${viewport.name}: console errors`)
    const screenshot = join(output, `${viewport.name}-home.png`)
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    results.push({ ...viewport, page: 'home', screenshot, ...state, featured })
    await context.close()
  }

  const interaction = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await interaction.addInitScript(() => {
    if (location.hostname !== 'vid.thongphan.com') return
    const key = 'thongphan.vid.library.v1'
    const originalSetItem = Storage.prototype.setItem
    const originalAddEventListener = EventTarget.prototype.addEventListener
    if (!localStorage.getItem(key)) {
      originalSetItem.call(localStorage, key, JSON.stringify({ version: 1, progress: [{ slug: 'video-thu-1', seconds: 12, duration: 120, updatedAt: Date.now() }], watchLater: [] }))
    }
    window.__vidQaStorageWrites = 0
    window.__vidQaProviderStats = null
    window.__vidQaWindowMessageListenerAdds = 0
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (this === window && type === 'message') window.__vidQaWindowMessageListenerAdds += 1
      return originalAddEventListener.call(this, type, listener, options)
    }
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key) window.__vidQaStorageWrites += 1
      return originalSetItem.call(this, storageKey, value)
    }
    addEventListener('message', (event) => {
      if (event.data?.context === 'vid-qa-provider-stats') window.__vidQaProviderStats = event.data.stats
    })
  })
  const page = await interaction.newPage()
  const watchErrors = []
  const playerNetworkFailures = []
  page.on('console', (message) => { if (message.type() === 'error') watchErrors.push(message.text()) })
  page.on('pageerror', (error) => watchErrors.push(error.message))
  page.on('requestfailed', (request) => {
    if (request.url().includes('assets.mediadelivery.net/playerjs')) playerNetworkFailures.push(`${request.url()} ${request.failure()?.errorText ?? 'request_failed'}`)
  })
  page.on('response', (response) => {
    if (response.url().includes('assets.mediadelivery.net/playerjs') && !response.ok()) playerNetworkFailures.push(`${response.url()} HTTP_${response.status()}`)
  })
  await installRoutes(page)
  try {
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.locator('input[name="search_query"]').fill('Tư duy')
    await Promise.all([page.waitForURL(/\/results/), page.locator('form[role="search"]').press('Enter')])
    await page.locator('h1', { hasText: 'Tư duy' }).waitFor()
    const sameViewRequest = page.waitForRequest((request) => {
      const url = new URL(request.url())
      return url.pathname === '/api/videos' && url.searchParams.get('q') === 'AI'
    })
    await page.evaluate(() => window.history.pushState(null, '', '/results?search_query=AI'))
    await page.getByRole('heading', { name: 'Kết quả cho “AI”' }).waitFor()
    await sameViewRequest
    await page.goto(`${base}/watch?v=video-thu-1&list=nen-tang-ai`, { waitUntil: 'networkidle' })
    const playerFrame = page.locator('[data-vid-player="video-thu-1"] iframe[title]')
    await playerFrame.waitFor()
    const initialPlayerFrame = await playerFrame.elementHandle()
    assert.ok(initialPlayerFrame, 'watch: Bunny player iframe is missing')
    await page.waitForFunction(() => window.__vidQaProviderStats?.ready && window.__vidQaProviderStats.listenerAdds >= 4 && window.__vidQaProviderStats.seekValues.length === 1)
    const baselinePlayerStats = await page.evaluate(() => ({ ...structuredClone(window.__vidQaProviderStats), messageListenerAdds: window.__vidQaWindowMessageListenerAdds }))
    const providerFrame = page.frames().find((frame) => frame.url().startsWith('https://player.mediadelivery.net/embed/'))
    assert.ok(providerFrame, 'watch: provider protocol iframe is missing')
    await page.getByRole('button', { name: 'Xem sau', exact: true }).click()
    await providerFrame.evaluate(() => window.__vidQaStartPlayback())
    const timeBeforeToggle = baselinePlayerStats.seekValues[0]
    await page.waitForFunction((minimumTime) => (window.__vidQaProviderStats?.lastTime ?? 0) >= minimumTime, timeBeforeToggle + 4)
    const timeAfterToggle = await page.evaluate(() => window.__vidQaProviderStats.lastTime)
    assert.ok(timeAfterToggle >= timeBeforeToggle + 4, `watch: provider current time did not advance ${JSON.stringify({ timeBeforeToggle, timeAfterToggle })}`)
    assert.equal(
      await page.evaluate((frame) => document.querySelector('[data-vid-player="video-thu-1"] iframe') === frame, initialPlayerFrame),
      true,
      'watch: Bunny player iframe identity changed',
    )
    const stablePlayerStats = await page.evaluate(() => ({ ...structuredClone(window.__vidQaProviderStats), messageListenerAdds: window.__vidQaWindowMessageListenerAdds }))
    assert.equal(stablePlayerStats.messageListenerAdds, baselinePlayerStats.messageListenerAdds, 'watch: Player.js constructor listener changed after progress or toggle')
    assert.equal(stablePlayerStats.listenerAdds, baselinePlayerStats.listenerAdds, 'watch: Player.js listener registration changed after progress or toggle')
    assert.deepEqual(stablePlayerStats.seekValues, baselinePlayerStats.seekValues, 'watch: Player.js sought again after progress or toggle')

    await providerFrame.evaluate(() => window.__vidQaPausePlayback())
    await page.waitForFunction((seconds) => {
      const library = JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}')
      return library.progress?.find((item) => item.slug === 'video-thu-1')?.seconds === seconds
    }, timeAfterToggle)
    const pauseProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}').progress?.find((item) => item.slug === 'video-thu-1')?.seconds)
    assert.equal(pauseProgress, timeAfterToggle, 'watch: pause checkpoint did not persist exact provider time')
    const writesAfterPause = await page.evaluate(() => window.__vidQaStorageWrites)
    await providerFrame.evaluate(() => window.__vidQaEmit('pause'))
    await page.waitForTimeout(100)
    assert.equal(await page.evaluate(() => window.__vidQaStorageWrites), writesAfterPause, 'watch: duplicate final checkpoint wrote local storage again')

    const endedTime = timeAfterToggle + 2
    await providerFrame.evaluate((seconds) => { window.__vidQaEmit('timeupdate', { seconds, duration: 120 }); window.__vidQaEmit('ended') }, endedTime)
    await page.waitForFunction((seconds) => JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}').progress?.find((item) => item.slug === 'video-thu-1')?.seconds === seconds, endedTime)
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}').progress?.find((item) => item.slug === 'video-thu-1')?.seconds), endedTime, 'watch: ended checkpoint did not persist exact provider time')

    const pagehideTime = endedTime + 2
    await providerFrame.evaluate((seconds) => window.__vidQaEmit('timeupdate', { seconds, duration: 120 }), pagehideTime)
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide')))
    await page.waitForFunction((seconds) => JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}').progress?.find((item) => item.slug === 'video-thu-1')?.seconds === seconds, pagehideTime)
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('thongphan.vid.library.v1') ?? '{}').progress?.find((item) => item.slug === 'video-thu-1')?.seconds), pagehideTime, 'watch: pagehide checkpoint did not persist exact provider time')
    const writesAfterPagehide = await page.evaluate(() => window.__vidQaStorageWrites)
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent('pagehide')))
    await page.waitForTimeout(100)
    assert.equal(await page.evaluate(() => window.__vidQaStorageWrites), writesAfterPagehide, 'watch: duplicate final checkpoint wrote local storage again')

    await page.reload({ waitUntil: 'networkidle' })
    await page.locator('[data-vid-player="video-thu-1"] iframe[title]').waitFor()
    await page.waitForFunction(() => window.__vidQaProviderStats?.seekValues.length === 1)
    const resumedAt = await page.evaluate(() => window.__vidQaProviderStats.seekValues[0])
    assert.ok(Math.abs(resumedAt - pagehideTime) <= 5, `watch: reload did not resume close to saved progress ${JSON.stringify({ savedProgress: pagehideTime, resumedAt })}`)
    await page.locator('summary').click()
    assert.equal(await page.locator('details').getAttribute('open'), '')
    await page.locator('[data-vid-player="video-thu-1"] iframe[title]').scrollIntoViewIfNeeded()
    const playerHit = await page.locator('[data-vid-player="video-thu-1"] iframe[title]').evaluate((frame) => {
      const rect = frame.getBoundingClientRect()
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
      return { direct: hit === frame, hit: hit ? `${hit.tagName}.${hit.className}` : null, frame: { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } }
    })
    assert.equal(playerHit.direct, true, `watch: player pointer is blocked ${JSON.stringify(playerHit)}`)
    assert.deepEqual(watchErrors, [], `watch: VID-owned console errors ${watchErrors.join('\n')}`)
    await page.screenshot({ path: join(output, 'desktop-watch.png'), fullPage: true, animations: 'disabled' })
  } catch (error) {
    if (playerNetworkFailures.length === 0) throw error
    playbackPartial = `official Player.js read failed: ${playerNetworkFailures.join('; ')}`
    console.error(`VID_PLAYBACK_QA=PARTIAL reason=${playbackPartial}`)
  }
  await interaction.close()

  const invalidPlayer = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const invalidPlayerPage = await invalidPlayer.newPage()
  await installRoutes(invalidPlayerPage, { invalidEmbed: true })
  await invalidPlayerPage.goto(`${base}/watch?v=video-thu-1`, { waitUntil: 'networkidle' })
  await invalidPlayerPage.getByText('Nguồn phát video không hợp lệ.', { exact: true }).waitFor()
  assert.equal(await invalidPlayerPage.locator('[data-vid-player] iframe').count(), 0, 'watch: invalid embed still renders an iframe')
  await invalidPlayer.close()

  const failedPlayerBrowser = await chromium.launch({ headless: true, args: ['--host-resolver-rules=MAP vid.thongphan.com 127.0.0.1'] })
  const failedPlayer = await failedPlayerBrowser.newContext({ viewport: { width: 390, height: 844 } })
  const failedPlayerPage = await failedPlayer.newPage()
  await installRoutes(failedPlayerPage, { scriptError: true })
  await failedPlayerPage.goto(`${base}/watch?v=video-thu-1`, { waitUntil: 'networkidle' })
  const failedPlayerAlert = failedPlayerPage.getByRole('alert').filter({ hasText: 'Không thể phát video lúc này. Hãy thử lại sau.' })
  await failedPlayerAlert.waitFor()
  assert.doesNotMatch(await failedPlayerAlert.textContent() ?? '', /mediadelivery|playerjs|embed/i, 'watch: player error leaks provider details')
  await failedPlayer.close()
  await failedPlayerBrowser.close()

  const reduced = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const reducedPage = await reduced.newPage()
  await installRoutes(reducedPage)
  await reducedPage.goto(base, { waitUntil: 'networkidle' })
  const beamDisplay = await reducedPage.locator('span').evaluateAll((items) => {
    const beam = items.find((item) => getComputedStyle(item).animationName.toLocaleLowerCase().includes('projector'))
    return beam ? getComputedStyle(beam).display === 'none' : false
  })
  assert.equal(beamDisplay, true, 'reduced motion: projector beam remains visible')
  await reduced.close()

  const errorContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const errorPage = await errorContext.newPage()
  await installRoutes(errorPage, { apiError: true })
  await errorPage.goto(base, { waitUntil: 'networkidle' })
  await errorPage.getByRole('heading', { name: 'Không tải được thư viện' }).waitFor()
  await errorPage.getByRole('button', { name: 'Thử lại' }).waitFor()
  await errorContext.close()

  const keyboard = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const keyboardPage = await keyboard.newPage()
  await installRoutes(keyboardPage)
  await keyboardPage.goto(base, { waitUntil: 'networkidle' })
  await keyboardPage.keyboard.press('Tab')
  const focus = await keyboardPage.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), outline: getComputedStyle(document.activeElement).outlineStyle }))
  assert.equal(focus.text, 'Bỏ qua điều hướng')
  assert.notEqual(focus.outline, 'none')
  await keyboard.close()

  const verdict = playbackPartial ? 'PARTIAL' : 'PASS'
  await writeFile(join(output, 'report.json'), `${JSON.stringify({ verdict, playbackPartial, base, results }, null, 2)}\n`)
  console.log(`VID_VISUAL_QA=${verdict} output=${output}`)
  if (playbackPartial) process.exitCode = 2
} finally {
  await browser.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
