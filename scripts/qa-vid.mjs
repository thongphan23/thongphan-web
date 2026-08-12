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
  title: index === 1 ? 'Tại sao người giỏi vẫn có thể bị mắc kẹt khi biến chuyên môn thành một hệ thống sống trong thời đại AI?' : [
    'Tư duy hệ thống cho người làm nghề', 'Xây một bộ não thứ hai không bắt đầu từ công cụ', 'Chọn lọc tri thức giữa thời đại dư thừa',
    'AI không cướp việc bạn — sự trì hoãn mới có thể', 'Từ ghi chú rời rạc đến tài sản có người dùng', '21 ngày xây Brain2 từ ca thật',
  ][index],
  description: 'Một video chuyên sâu được tuyển chọn để giúp người xem hiểu bản chất, nhìn thấy ứng dụng và có bước tiếp theo rõ ràng.',
  sourceTitle: `Original Video ${index + 1}`,
  sourceCreator: index % 2 ? 'The Knowledge Project' : 'Original Creator',
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

function apiPayload(url) {
  if (url.pathname === '/api/topics') return { items: [{ slug: 'tu-duy', label: 'Tư duy', video_count: 3 }, { slug: 'ai', label: 'AI', video_count: 3 }] }
  if (url.pathname === '/api/videos') {
    const query = (url.searchParams.get('q') ?? '').toLocaleLowerCase('vi')
    const topic = url.searchParams.get('topic')
    const items = videos.filter((video) => (!query || `${video.title} ${video.description}`.toLocaleLowerCase('vi').includes(query)) && (!topic || video.topics.includes(topic)))
    return { items, page: 1, pageSize: 48, total: items.length }
  }
  if (url.pathname.startsWith('/api/videos/')) return videos.find(({ slug }) => slug === decodeURIComponent(url.pathname.split('/').at(-1) ?? '')) ?? { error: 'not_found' }
  if (url.pathname.startsWith('/api/playlists/')) return { slug: 'nen-tang-ai', title: 'Nền tảng AI', description: 'Một lộ trình video có thứ tự.', items: videos }
  return { error: 'not_found' }
}

async function installRoutes(page, { apiError = false } = {}) {
  await page.route(`${base}/api/**`, async (route) => {
    if (apiError) return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"unavailable"}' })
    const payload = apiPayload(new URL(route.request().url()))
    return route.fulfill({ status: 'error' in payload ? 404 : 200, contentType: 'application/json', body: JSON.stringify(payload) })
  })
  await page.route('https://assets.mediadelivery.net/playerjs/playerjs-latest.min.js', (route) => route.fulfill({
    status: 200,
    contentType: 'text/javascript',
    body: 'window.playerjs={Player:class{constructor(){this.h={}}on(e,f){this.h[e]=f;if(e==="ready")setTimeout(f,0)}off(e){delete this.h[e]}setCurrentTime(){}}}',
  }))
  await page.route('https://player.mediadelivery.net/**', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<!doctype html><html><body style="margin:0;background:#000;color:#ddd;display:grid;place-items:center;height:100vh;font:14px sans-serif">Bunny Stream Player · QA</body></html>',
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

const browser = await chromium.launch({ headless: true, args: ['--host-resolver-rules=MAP vid.thongphan.com 127.0.0.1'] })
const results = []
try {
  for (const viewport of [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'desktop-1280', width: 1280, height: 720 },
    { name: 'tablet-1024', width: 1024, height: 768 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-320', width: 320, height: 568 },
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
    assert.ok(state.cards >= 5, `${viewport.name}: catalog cards missing`)
    if (viewport.width <= 780) assert.equal(state.bottomNav, 'grid', `${viewport.name}: mobile navigation missing`)
    assert.deepEqual(errors, [], `${viewport.name}: console errors`)
    const screenshot = join(output, `${viewport.name}-home.png`)
    await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' })
    results.push({ ...viewport, page: 'home', screenshot, ...state })
    await context.close()
  }

  const interaction = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await interaction.addInitScript(() => localStorage.clear())
  const page = await interaction.newPage()
  await installRoutes(page)
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.locator('input[name="search_query"]').fill('Tư duy')
  await Promise.all([page.waitForURL(/\/results/), page.locator('form[role="search"]').press('Enter')])
  await page.locator('h1', { hasText: 'Tư duy' }).waitFor()
  await page.goto(`${base}/watch?v=video-thu-1&list=nen-tang-ai`, { waitUntil: 'networkidle' })
  await page.locator('iframe[title]').waitFor()
  await page.locator('summary').click()
  assert.equal(await page.locator('details').getAttribute('open'), '')
  await page.locator('iframe[title]').scrollIntoViewIfNeeded()
  const playerHit = await page.locator('iframe[title]').evaluate((frame) => {
    const rect = frame.getBoundingClientRect()
    const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    return { direct: hit === frame, hit: hit ? `${hit.tagName}.${hit.className}` : null, frame: { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height } }
  })
  assert.equal(playerHit.direct, true, `watch: player pointer is blocked ${JSON.stringify(playerHit)}`)
  await page.screenshot({ path: join(output, 'desktop-watch.png'), fullPage: true, animations: 'disabled' })
  await interaction.close()

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

  await writeFile(join(output, 'report.json'), `${JSON.stringify({ verdict: 'PASS', base, results }, null, 2)}\n`)
  console.log(`VID_VISUAL_QA=PASS output=${output}`)
} finally {
  await browser.close()
  await new Promise((resolveClose) => server.close(resolveClose))
}
