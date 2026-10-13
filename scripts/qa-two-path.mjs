// Visual and behavioural QA for the two-path rebuild.
// Serves the static export in out/, drives local Chrome through every route and viewport,
// and writes screenshots plus report.json to qa/two-path/.
// Usage: npm run build && node scripts/qa-two-path.mjs
import http from 'node:http'
import { createReadStream } from 'node:fs'
import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../', import.meta.url))
const outDir = path.join(root, 'out')
const qaDir = path.resolve(root, process.env.QA_OUTPUT_DIR ?? 'qa/two-path')

// QA_ROUTES=/,/conan and QA_VIEWPORTS=1440x900 narrow a run while iterating on a fix.
const only = (value) => (value ? new Set(value.split(',')) : null)
const routeFilter = only(process.env.QA_ROUTES)
const viewportFilter = only(process.env.QA_VIEWPORTS)
const routes = ['/', '/tensai', '/conan', '/about', '/library', '/blog', '/diagnostic']
  .filter((route) => !routeFilter || routeFilter.has(route))
// Pages this rebuild owns end to end; older pages only get the shared chrome checked for contrast.
const rebuiltRoutes = new Set(['/', '/tensai', '/conan', '/about'])
const viewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  // Safari's small viewport on a 390pt iPhone, with both browser bars showing.
  { width: 390, height: 664 },
  { width: 320, height: 568 },
].filter((viewport) => !viewportFilter || viewportFilter.has(`${viewport.width}x${viewport.height}`))
const doorCheckViewports = new Set(['1440x900', '390x844'])

const DOOR_NAV = 'nav[aria-label="Chọn con đường của bạn"]'
const TOUCH_TARGETS = 'header a, header button, [data-path-door], main a[href*="utm_campaign=two-path"]'
const MIN_TARGET = 44
// Hides the text being measured so the screenshot shows only what sits behind it.
const HIDE_TEXT_CSS = `[data-qa-hide], [data-qa-hide] * {
  color: transparent !important;
  -webkit-text-fill-color: transparent !important;
  text-shadow: none !important;
  transition: none !important;
}`

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function resolveFile(urlPath) {
  const base = path.join(outDir, decodeURIComponent(urlPath))
  if (!base.startsWith(outDir)) return null
  for (const candidate of [base, `${base}.html`, path.join(base, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate
    } catch {
      // try the next candidate
    }
  }
  return null
}

function startServer() {
  const server = http.createServer(async (req, res) => {
    const file = await resolveFile(new URL(req.url, 'http://qa.local').pathname)
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
      return
    }
    res.writeHead(200, { 'content-type': contentTypes[path.extname(file)] ?? 'application/octet-stream' })
    createReadStream(file).pipe(res)
  })
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)))
}

const slug = (route) => (route === '/' ? 'home' : route.slice(1).replace(/\//g, '-'))
const sizeKey = ({ width, height }) => `${width}x${height}`

function watchErrors(page, origin) {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('response', (response) => {
    if (response.url().startsWith(origin) && response.status() >= 400) {
      errors.push(`http ${response.status()}: ${response.url().slice(origin.length)}`)
    }
  })
  return errors
}

const nextFrames = (page) =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

async function settle(page, url) {
  await page.goto(url, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts?.ready)
  await page.waitForTimeout(900)
}

// The site sets scroll-behavior: smooth, so every programmatic scroll here is instant.
// Scroll the whole page so lazy images load and reveal animations finish, then return to the top.
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(window.innerHeight * 0.6)) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await wait(220)
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    await wait(1000)
    window.scrollTo({ top: 0, behavior: 'instant' })
  })
  await page.waitForTimeout(700)
}

async function doorsInFirstView(page) {
  return page.evaluate((selector) => {
    return [...document.querySelectorAll(`${selector} [data-path-door]`)].map((door) => {
      const rect = door.getBoundingClientRect()
      return {
        path: door.dataset.pathDoor,
        top: Math.round(rect.top),
        bottom: Math.round(rect.bottom),
        inView: rect.top >= 0 && rect.bottom <= window.innerHeight,
      }
    })
  }, DOOR_NAV)
}

async function inspectLayout(page) {
  return page.evaluate(({ targets, minTarget }) => {
    const visible = (element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    }
    const describe = (element) => {
      const label = element.getAttribute('aria-label')
      const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 48)
      return `${element.tagName.toLowerCase()}${label ? `[aria-label="${label}"]` : ''} "${text}"`
    }
    const round = (value) => Math.round(value * 10) / 10

    return {
      overflowX: document.documentElement.scrollWidth - window.innerWidth,
      h1Count: document.querySelectorAll('h1').length,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      smallTargets: [...document.querySelectorAll(targets)]
        .filter(visible)
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(({ rect }) => rect.width < minTarget || rect.height < minTarget)
        .map(({ element, rect }) => ({ target: describe(element), width: round(rect.width), height: round(rect.height) })),
      // A door's product name ("Conan School") must read as one line, never stacked word by word.
      wrappedDoorLabels: [...document.querySelectorAll('[data-path-door] [class*="doorProduct"]')]
        .filter(visible)
        .filter((element) => {
          const range = document.createRange()
          range.selectNodeContents(element)
          return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size > 1
        })
        .map(describe),
    }
  }, { targets: TOUCH_TARGETS, minTarget: MIN_TARGET })
}

// Tag every element that owns visible text in the header switch, the first (h1) section,
// the doors and the product CTAs. Each element is measured once, in the first group that owns it.
// The first section is only measured on rebuilt pages.
async function collectTextLeaves(page, includeHero) {
  return page.evaluate((includeHero) => {
    const groups = [
      ['switch', 'header nav[aria-label="Hai con đường"] a'],
      ...(includeHero ? [['hero', 'main section:has(h1)']] : []),
      ['door', '[data-path-door]'],
      ['cta', 'main a[href*="utm_campaign=two-path"]'],
    ]
    const visible = (element) => {
      const rect = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
    }
    const leaves = []
    for (const [group, selector] of groups) {
      for (const scope of document.querySelectorAll(selector)) {
        if (!visible(scope)) continue
        for (const element of [scope, ...scope.querySelectorAll('*')]) {
          const ownsText = [...element.childNodes].some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim(),
          )
          if (!ownsText || element.closest('svg') || element.hasAttribute('data-qa-leaf') || !visible(element)) continue
          const id = `leaf-${leaves.length}`
          element.setAttribute('data-qa-leaf', id)
          leaves.push({
            id,
            group,
            // Only the site header counts; pages also use <header> inside main for their own sections.
            inHeader: Boolean(element.closest('header')) && !element.closest('main'),
            productLink: Boolean(element.closest('a[href*="utm_campaign=two-path"], header nav a')),
            text: element.textContent.trim().replace(/\s+/g, ' ').slice(0, 60),
          })
        }
      }
    }
    return leaves
  }, includeHero)
}

// Hide one text leaf and report its glyph rectangles, colour and effective opacity.
async function hideLeaf(page, id) {
  return page.evaluate((leafId) => {
    const element = document.querySelector(`[data-qa-leaf="${leafId}"]`)
    const style = getComputedStyle(element)
    // Computed colours may be color(srgb …) from color-mix; a 1px canvas normalises every syntax to RGBA.
    const swatch = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    swatch.fillStyle = style.color
    swatch.fillRect(0, 0, 1, 1)
    const color = [...swatch.getImageData(0, 0, 1, 1).data]
    let opacity = 1
    for (let node = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
    const rects = []
    for (const node of element.childNodes) {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue
      const range = document.createRange()
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        const left = Math.max(0, rect.left)
        const top = Math.max(0, rect.top)
        const right = Math.min(window.innerWidth, rect.right)
        const bottom = Math.min(window.innerHeight, rect.bottom)
        if (right - left >= 1 && bottom - top >= 1) rects.push({ left, top, right, bottom })
      }
    }
    element.setAttribute('data-qa-hide', '')
    const weight = Number(style.fontWeight) || 400
    const size = parseFloat(style.fontSize)
    return {
      rects,
      color: [color[0], color[1], color[2], (color[3] / 255) * opacity],
      fontSize: size,
      fontWeight: weight,
      large: size >= 24 || (size >= 18.66 && weight >= 700),
    }
  }, id)
}

// Composite the text colour over each background pixel and report the contrast distribution.
async function measureContrast(decoder, png, rects, color) {
  return decoder.evaluate(async ({ dataUrl, rects, color }) => {
    const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob())
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const context = canvas.getContext('2d')
    context.drawImage(bitmap, 0, 0)
    const luminance = (r, g, b) => {
      const channel = (value) => {
        const c = value / 255
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }
    const [tr, tg, tb, alpha] = color
    const ratios = []
    for (const rect of rects) {
      const x = Math.floor(rect.left)
      const y = Math.floor(rect.top)
      const width = Math.max(1, Math.min(bitmap.width - x, Math.ceil(rect.right) - x))
      const height = Math.max(1, Math.min(bitmap.height - y, Math.ceil(rect.bottom) - y))
      const { data } = context.getImageData(x, y, width, height)
      for (let index = 0; index < data.length; index += 4) {
        const [br, bg, bb] = [data[index], data[index + 1], data[index + 2]]
        const fg = luminance(alpha * tr + (1 - alpha) * br, alpha * tg + (1 - alpha) * bg, alpha * tb + (1 - alpha) * bb)
        const back = luminance(br, bg, bb)
        ratios.push((Math.max(fg, back) + 0.05) / (Math.min(fg, back) + 0.05))
      }
    }
    if (!ratios.length) return null
    ratios.sort((a, b) => a - b)
    const pick = (fraction) => Math.round(ratios[Math.floor((ratios.length - 1) * fraction)] * 100) / 100
    return { p05: pick(0.05), median: pick(0.5), min: pick(0) }
  }, { dataUrl: `data:image/png;base64,${png.toString('base64')}`, rects, color })
}

async function contrastAudit(page, decoder, includeHero) {
  await page.addStyleTag({ content: HIDE_TEXT_CSS })
  const leaves = await collectTextLeaves(page, includeHero)
  const results = []

  for (const leaf of leaves) {
    // Header text is checked over the first screen; other text is centred in the viewport.
    const placement = await page.evaluate(({ id, inHeader }) => {
      const element = document.querySelector(`[data-qa-leaf="${id}"]`)
      window.scrollTo({ top: 0, behavior: 'instant' })
      const rect = element.getBoundingClientRect()
      if (inHeader || (rect.top >= 0 && rect.bottom <= window.innerHeight)) return 'first-view'
      element.scrollIntoView({ block: 'center', behavior: 'instant' })
      return 'scrolled'
    }, leaf)
    await page.waitForTimeout(placement === 'first-view' ? 150 : 450)

    const sample = await hideLeaf(page, leaf.id)
    await nextFrames(page)
    const png = await page.screenshot({ type: 'png', scale: 'css' })
    await page.evaluate((id) => document.querySelector(`[data-qa-leaf="${id}"]`).removeAttribute('data-qa-hide'), leaf.id)

    const contrast = await measureContrast(decoder, png, sample.rects, sample.color)
    // Product links and switch labels always need 4.5:1; other text follows WCAG AA (3:1 when large).
    const required = leaf.productLink || !sample.large ? 4.5 : 3
    results.push({
      ...leaf,
      placement,
      fontSize: sample.fontSize,
      fontWeight: sample.fontWeight,
      required,
      contrast,
      pass: Boolean(contrast) && contrast.p05 >= required,
    })
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  return results
}

async function auditPage(browser, origin, route, viewport, decoder) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
  const page = await context.newPage()
  const errors = watchErrors(page, origin)
  const name = `${slug(route)}-${sizeKey(viewport)}`

  await settle(page, `${origin}${route}`)
  const doors = route === '/' && doorCheckViewports.has(sizeKey(viewport)) ? await doorsInFirstView(page) : null
  await page.screenshot({ path: path.join(qaDir, 'first', `${name}.jpg`), type: 'jpeg', quality: 72 })

  await scrollThrough(page)
  const layout = await inspectLayout(page)
  await page.screenshot({ path: path.join(qaDir, 'full', `${name}.jpg`), type: 'jpeg', quality: 60, fullPage: true })

  const contrast = await contrastAudit(page, decoder, rebuiltRoutes.has(route))
  await context.close()

  const failures = []
  if (layout.overflowX > 0) failures.push(`horizontal overflow ${layout.overflowX}px`)
  if (layout.h1Count !== 1) failures.push(`${layout.h1Count} h1 elements`)
  for (const image of layout.brokenImages) failures.push(`image not decoded: ${image}`)
  for (const target of layout.smallTargets) failures.push(`touch target ${target.width}×${target.height}: ${target.target}`)
  for (const label of layout.wrappedDoorLabels) failures.push(`door label wraps: ${label}`)
  for (const door of doors ?? []) if (!door.inView) failures.push(`door ${door.path} outside first view (bottom ${door.bottom})`)
  for (const item of contrast) {
    if (!item.pass) failures.push(`contrast ${item.contrast?.p05 ?? 'n/a'} < ${item.required} (${item.group} @${item.placement}): "${item.text}"`)
  }
  for (const error of errors) failures.push(error)

  return { route, viewport: sizeKey(viewport), ...layout, doors, contrast, errors, failures }
}

async function focusInfo(page) {
  return page.evaluate((doorNav) => {
    const element = document.activeElement
    if (!element || element === document.body) return null
    const style = getComputedStyle(element)
    return {
      text: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40),
      inHeader: Boolean(element.closest('header')),
      door: element.closest(doorNav) ? element.dataset.pathDoor ?? null : null,
      isMore: element.getAttribute('aria-controls') === 'site-more-menu',
      isMenuTrigger: element.getAttribute('aria-controls') === 'site-mobile-menu',
      inMoreMenu: Boolean(element.closest('#site-more-menu')),
      inDialog: Boolean(element.closest('#site-mobile-menu')),
      focusVisible: element.matches(':focus-visible'),
      indicator: (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== 'none',
    }
  }, DOOR_NAV)
}

async function tabUntil(page, predicate, limit = 40) {
  for (let step = 0; step < limit; step += 1) {
    await page.keyboard.press('Tab')
    const info = await focusInfo(page)
    if (info && predicate(info)) return info
  }
  return null
}

async function keyboardAudit(browser, origin) {
  const failures = []
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await desktop.newPage()
  await settle(page, `${origin}/`)

  const visited = []
  for (let step = 0; step < 40; step += 1) {
    await page.keyboard.press('Tab')
    const info = await focusInfo(page)
    if (info) visited.push(info)
    if (info?.door === 'conan') break
  }
  for (const info of visited.filter((item) => item.inHeader || item.door)) {
    if (!info.focusVisible || !info.indicator) failures.push(`no visible focus on "${info.text}"`)
  }
  for (const door of ['tensai', 'conan']) {
    if (!visited.some((info) => info.door === door)) failures.push(`hero door ${door} not reachable by Tab`)
  }

  await settle(page, `${origin}/`)
  const more = await tabUntil(page, (info) => info.isMore)
  if (!more) failures.push('more menu trigger not reachable by Tab')
  else {
    await page.keyboard.press('Enter')
    const expanded = await page.getAttribute('[aria-controls="site-more-menu"]', 'aria-expanded')
    if (expanded !== 'true') failures.push('Enter does not open the more menu')
    await page.keyboard.press('Tab')
    if (!(await focusInfo(page))?.inMoreMenu) failures.push('Tab after opening does not enter the more menu')
    await page.keyboard.press('Escape')
    await nextFrames(page)
    const afterEscape = await focusInfo(page)
    const collapsed = await page.getAttribute('[aria-controls="site-more-menu"]', 'aria-expanded')
    if (collapsed !== 'false') failures.push('Escape does not close the more menu')
    if (!afterEscape?.isMore) failures.push('Escape does not return focus to the more trigger')
  }
  await desktop.close()

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 })
  const phone = await mobile.newPage()
  await settle(phone, `${origin}/`)
  const trigger = await tabUntil(phone, (info) => info.isMenuTrigger)
  if (!trigger) failures.push('mobile menu trigger not reachable by Tab')
  else {
    await phone.keyboard.press('Enter')
    await nextFrames(phone)
    await phone.waitForTimeout(200)
    if (!(await focusInfo(phone))?.inDialog) failures.push('opening the mobile menu does not move focus inside it')
    for (let step = 0; step < 16; step += 1) {
      await phone.keyboard.press(step % 5 === 4 ? 'Shift+Tab' : 'Tab')
      if (!(await focusInfo(phone))?.inDialog) {
        failures.push('focus escapes the mobile menu')
        break
      }
    }
    await phone.keyboard.press('Escape')
    await nextFrames(phone)
    await phone.waitForTimeout(150)
    if (await phone.$('#site-mobile-menu')) failures.push('Escape does not close the mobile menu')
    if (!(await focusInfo(phone))?.isMenuTrigger) failures.push('closing the mobile menu does not return focus to its trigger')
  }
  await mobile.close()

  return { visited, failures }
}

async function storageAudit(browser, origin) {
  const failures = []
  const remembered = []

  for (const [route, label] of [['/conan', 'Conan School'], ['/tensai', 'Tensai']]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
    const page = await context.newPage()
    const errors = watchErrors(page, origin)
    await settle(page, `${origin}${route}`)
    await settle(page, `${origin}/`)
    const line = page.getByText(`Lần trước bạn xem ${label}.`)
    const shown = await line.isVisible().catch(() => false)
    const href = await page.locator('a', { hasText: 'Tiếp tục' }).first().getAttribute('href').catch(() => null)
    await page.waitForTimeout(1500)
    const stayed = new URL(page.url()).pathname === '/'
    if (!shown) failures.push(`resume line for ${label} not shown after visiting ${route}`)
    if (href !== route) failures.push(`resume link for ${label} points to ${href}`)
    if (!stayed) failures.push(`homepage redirected to ${page.url()} after visiting ${route}`)
    for (const error of errors) failures.push(`${route} → /: ${error}`)
    remembered.push({ route, label, shown, href, stayed })
    await context.close()
  }

  const blocked = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  await blocked.addInitScript(() => {
    const deny = () => {
      throw new DOMException('Storage is blocked', 'SecurityError')
    }
    Object.defineProperty(window, 'localStorage', { configurable: true, get: deny })
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: deny })
  })
  const page = await blocked.newPage()
  const pageErrors = []
  page.on('pageerror', (error) => pageErrors.push(error.message))
  await settle(page, `${origin}/conan`)
  await settle(page, `${origin}/`)
  const resumeShown = await page.getByText('Lần trước bạn xem').isVisible().catch(() => false)
  const doorsShown = await page.locator(`${DOOR_NAV} [data-path-door]`).count()
  if (pageErrors.length) failures.push(`blocked storage throws: ${pageErrors.join(' | ')}`)
  if (resumeShown) failures.push('resume line shown while storage is blocked')
  if (doorsShown !== 2) failures.push(`blocked storage renders ${doorsShown} hero doors`)
  await blocked.close()

  return { remembered, blocked: { pageErrors, resumeShown, doorsShown }, failures }
}

const server = await startServer()
const origin = `http://127.0.0.1:${server.address().port}`
await mkdir(path.join(qaDir, 'first'), { recursive: true })
await mkdir(path.join(qaDir, 'full'), { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const decoderContext = await browser.newContext()
const decoder = await decoderContext.newPage()

try {
  const pages = []
  for (const route of routes) {
    for (const viewport of viewports) {
      const result = await auditPage(browser, origin, route, viewport, decoder)
      pages.push(result)
      console.log(`${result.failures.length ? 'FAIL' : 'ok  '} ${route} ${result.viewport}`)
      for (const failure of result.failures) console.log(`     - ${failure}`)
    }
  }
  const keyboard = await keyboardAudit(browser, origin)
  console.log(`${keyboard.failures.length ? 'FAIL' : 'ok  '} keyboard`)
  for (const failure of keyboard.failures) console.log(`     - ${failure}`)
  const storage = await storageAudit(browser, origin)
  console.log(`${storage.failures.length ? 'FAIL' : 'ok  '} path memory`)
  for (const failure of storage.failures) console.log(`     - ${failure}`)

  const failureCount = pages.reduce((sum, page) => sum + page.failures.length, 0) + keyboard.failures.length + storage.failures.length
  const report = { generatedAt: new Date().toISOString(), source: 'out/ (static export)', browser: browser.version(), failureCount, pages, keyboard, storage }
  await writeFile(path.join(qaDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)
  console.log(`\n${failureCount} failure(s); report at ${path.relative(root, path.join(qaDir, 'report.json'))}`)
  process.exitCode = failureCount ? 1 : 0
} finally {
  await browser.close()
  server.close()
}
