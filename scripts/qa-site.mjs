import { createHash, randomBytes } from 'node:crypto'
import { readFile, mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const QA_BASE_URL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3021'
const QA_OUTPUT_DIR = process.env.QA_OUTPUT_DIR ?? '/tmp/thongphan-brain2-release-qa'
const BRAIN2_PRIVATE_CONTENT_DIR = process.env.BRAIN2_PRIVATE_CONTENT_DIR
const BRAIN2_WORKER_BUNDLE = process.env.BRAIN2_WORKER_BUNDLE ?? '/tmp/brain2-worker-dry-run/index.js'
const qaBaseUrl = new URL(QA_BASE_URL)
const base = qaBaseUrl.origin
const outputDir = path.resolve(QA_OUTPUT_DIR)
const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1', '[::1]'])

if (!loopbackHosts.has(qaBaseUrl.hostname)) {
  throw new Error('Release QA with protected fixtures is restricted to a loopback origin')
}
if (!BRAIN2_PRIVATE_CONTENT_DIR) throw new Error('BRAIN2_PRIVATE_CONTENT_DIR is required')

const privateDay08Text = await readFile(path.join(BRAIN2_PRIVATE_CONTENT_DIR, 'v1/ngay-08.json'), 'utf8')
const brain2Manifest = JSON.parse(await readFile(new URL('../content/brain2/manifest.json', import.meta.url), 'utf8'))
const day08StorageKey = brain2Manifest.lessons.find(({ slug }) => slug === 'ngay-08')?.storageKey
if (typeof day08StorageKey !== 'string') throw new Error('Day 08 protected storage key is unavailable')

const workerModule = await import(`${pathToFileURL(path.resolve(BRAIN2_WORKER_BUNDLE)).href}?qa=${Date.now()}`)
if (typeof workerModule.createBrain2AccessWorker !== 'function') {
  throw new Error('Fresh Brain2 access Worker fixture is unavailable')
}

const qaAccessCode = randomBytes(24).toString('base64url')
const qaAccessCodeHash = `sha256:${createHash('sha256').update(qaAccessCode).digest('base64url')}`
const qaSessionSecret = randomBytes(32).toString('base64url')
let reservationId = 0
const qaWorkerEnv = {
  BRAIN2_ACCESS_CODE_HASH: qaAccessCodeHash,
  BRAIN2_SESSION_SECRET: qaSessionSecret,
  DB: {
    prepare(statement) {
      return {
        bind(...values) {
          return {
            async first() {
              if (statement.includes('INSERT INTO brain2_access_failures')) {
                reservationId += 1
                return { reservation_id: reservationId }
              }
              if (statement.includes('DELETE FROM brain2_access_failures')) {
                return { released_id: values[0] }
              }
              return null
            },
          }
        },
      }
    },
  },
  BRAIN2_CONTENT: {
    async get(key) {
      return key === day08StorageKey ? privateDay08Text : null
    },
  },
}
const qaAccessWorker = workerModule.createBrain2AccessWorker({ now: () => 1_800_000_000 })

const routeCases = [
  { name: 'home', path: '/', kind: 'home' },
  { name: 'about', path: '/about', kind: 'about' },
  { name: 'brain2-hub', path: '/brain2/21-ngay', kind: 'hub' },
  { name: 'brain2-day-01', path: '/brain2/21-ngay/ngay-01', kind: 'public-lesson' },
  { name: 'brain2-day-07', path: '/brain2/21-ngay/ngay-07', kind: 'public-week-end' },
  { name: 'brain2-day-08', path: '/brain2/21-ngay/ngay-08', kind: 'protected-lesson' },
  { name: 'brain2-day-21', path: '/brain2/21-ngay/ngay-21', kind: 'protected-lesson' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'short-laptop', width: 1280, height: 720 },
  { name: 'tablet', width: 1024, height: 768 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 568 },
]

const motionModes = [
  { name: 'motion', reducedMotion: 'no-preference' },
  { name: 'reduced', reducedMotion: 'reduce' },
]

await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const matrix = []
const interactionResults = []

function compactError(error) {
  return error instanceof Error ? error.message : String(error)
}

async function createAuthorizedFixtureCookie() {
  const response = await qaAccessWorker.fetch(new Request('https://thongphan.com/brain2/21-ngay/api/access', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'CF-Connecting-IP': '127.0.0.1',
      'Content-Type': 'application/json',
      Origin: 'https://thongphan.com',
    },
    body: JSON.stringify({ code: qaAccessCode }),
  }), qaWorkerEnv)
  const setCookie = response.headers.get('set-cookie')
  if (response.status !== 204 || !setCookie) throw new Error('Actual access Worker could not create a QA session')
  return setCookie.split(';', 1)[0]
}

async function installAccessWorkerFixture(page, { session = 'none' } = {}) {
  let sessionCookie = session === 'authorized'
    ? await createAuthorizedFixtureCookie()
    : session === 'tampered'
      ? '__Secure-tp_b2_session=tampered.fixture'
      : ''

  await page.route('**/brain2/21-ngay/api/**', async (requestRoute) => {
    const playwrightRequest = requestRoute.request()
    const localUrl = new URL(playwrightRequest.url())
    const headers = new Headers(playwrightRequest.headers())
    headers.set('Origin', 'https://thongphan.com')
    headers.set('CF-Connecting-IP', '127.0.0.1')
    if (sessionCookie) headers.set('Cookie', sessionCookie)
    else headers.delete('Cookie')

    const method = playwrightRequest.method()
    const postData = playwrightRequest.postDataBuffer()
    const workerResponse = await qaAccessWorker.fetch(new Request(
      `https://thongphan.com${localUrl.pathname}${localUrl.search}`,
      {
        method,
        headers,
        body: method === 'GET' || method === 'HEAD' ? undefined : postData ?? undefined,
      },
    ), qaWorkerEnv)
    const setCookie = workerResponse.headers.get('set-cookie')
    if (setCookie) sessionCookie = setCookie.split(';', 1)[0]
    const bytes = Buffer.from(await workerResponse.arrayBuffer())
    await requestRoute.fulfill({
      status: workerResponse.status,
      headers: Object.fromEntries(workerResponse.headers),
      body: bytes.length ? bytes : undefined,
    })
  })
}

async function attachDiagnostics(page) {
  const diagnostics = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedRequests: [],
    responseErrors: [],
  }
  page.on('console', (message) => {
    if (message.type() === 'error') diagnostics.consoleErrors.push(message.text())
    if (message.type() === 'warning') diagnostics.consoleWarnings.push(message.text())
  })
  page.on('pageerror', (error) => diagnostics.pageErrors.push(error.message))
  page.on('requestfailed', (request) => {
    if (request.method() !== 'HEAD') diagnostics.failedRequests.push(`${request.method()} ${request.url()}`)
  })
  page.on('response', (response) => {
    const url = new URL(response.url())
    const expectedUnauthorized = url.pathname.startsWith('/brain2/21-ngay/api/') && response.status() === 401
    if (url.origin === base && response.status() >= 400 && !expectedUnauthorized) {
      diagnostics.responseErrors.push(`${response.status()} ${url.pathname}`)
    }
  })
  return diagnostics
}

async function addClsObserver(context) {
  await context.addInitScript(() => {
    window.__tpReleaseCls = 0
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            window.__tpReleaseCls += entry.value
          }
        }
      })
      observer.observe({ type: 'layout-shift', buffered: true })
    }
  })
}

async function settlePage(page) {
  await page.evaluate(async () => {
    const twoFrames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await document.fonts?.ready
    const total = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const steps = Math.min(14, Math.max(1, Math.ceil(total / Math.max(innerHeight * 0.8, 1))))
    for (let index = 1; index <= steps; index += 1) {
      window.scrollTo(0, Math.min(total, (total * index) / steps))
      await twoFrames()
    }
    for (const image of [...document.images].filter((candidate) => !candidate.complete)) {
      image.scrollIntoView({ block: 'center', inline: 'center' })
      await twoFrames()
      await Promise.race([
        image.decode?.().catch(() => {}),
        new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true })
          image.addEventListener('error', resolve, { once: true })
        }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])
    }
    await Promise.race([
      Promise.all([...document.images].map((image) => image.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true })
            image.addEventListener('error', resolve, { once: true })
          }))),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ])
    for (const element of document.querySelectorAll('*')) {
      if (element.scrollWidth > element.clientWidth) element.scrollLeft = 0
    }
    window.scrollTo(0, 0)
    await twoFrames()
  })
}

async function inspectPage(page, routeCase, viewport, motion) {
  return page.evaluate(({ kind, viewportHeight, viewportWidth, reduced }) => {
    const overlapArea = (left, right) => Math.max(0, Math.min(left.right, right.right) - Math.max(left.left, right.left))
      * Math.max(0, Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top))
    const main = document.querySelector('main')
    const h1 = document.querySelector('h1')
    const header = document.querySelector('header[data-header-scrolled]')
    const images = [...document.images]
    const motionStates = [...document.querySelectorAll('[data-motion-active]')]
      .map((node) => node.getAttribute('data-motion-active'))
    const result = {
      title: document.title,
      mainCount: document.querySelectorAll('main').length,
      h1Count: document.querySelectorAll('h1').length,
      meaningfulText: Boolean(main?.textContent?.trim()),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      brokenImages: images.filter((image) => image.complete && image.naturalWidth === 0).length,
      incompleteImages: images.filter((image) => !image.complete && image.loading !== 'lazy').length,
      deferredLazyImages: images.filter((image) => !image.complete && image.loading === 'lazy').length,
      cls: Number(window.__tpReleaseCls ?? 0),
      headerH1Overlap: header && h1 ? overlapArea(header.getBoundingClientRect(), h1.getBoundingClientRect()) : 0,
      reducedMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
      motionNodeCount: motionStates.length,
      motionActiveCount: motionStates.filter((state) => state === 'true').length,
      route: {},
    }

    if (kind === 'home') {
      const proof = document.querySelector('#proof')
      const bridge = document.querySelector('[data-home-origin-bridge]')
      const proofHeader = proof?.querySelector('header')?.getBoundingClientRect()
      const proofSheet = proof?.querySelector('[aria-label="Ba bằng chứng có thể mở để xem chi tiết"]')?.getBoundingClientRect()
      const debt = 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'
      result.route = {
        sectionCount: document.querySelectorAll('[data-home-section]').length,
        bridgeCount: document.querySelectorAll('[data-home-origin-bridge]').length,
        proofTriggerCount: document.querySelectorAll('[aria-label^="Mở bằng chứng:"]').length,
        debtCount: (bridge?.textContent?.match(new RegExp(debt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length,
        proofHeight: proof?.getBoundingClientRect().height ?? 0,
        proofFitsViewport: viewportWidth < 1024 || (proof?.getBoundingClientRect().height ?? Infinity) <= viewportHeight,
        headerSheetGap: proofHeader && proofSheet ? proofSheet.top - proofHeader.bottom : -1,
      }
    } else if (kind === 'about') {
      const debt = 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'
      const originImages = [...document.querySelectorAll('[data-origin-act] figure img:first-child')]
      const unsafeExternalLinks = [...document.querySelectorAll('[data-origin-act] a[target="_blank"]')]
        .filter((link) => !String(link.getAttribute('rel')).includes('noopener'))
      result.route = {
        actCount: document.querySelectorAll('[data-origin-act]').length,
        consequenceCount: document.querySelectorAll('[data-consequence="true"]').length,
        debtCount: (document.body.innerText.match(new RegExp(debt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) ?? []).length,
        disclosureCount: [...document.querySelectorAll('[data-origin-act] small')].filter((node) => /tạo sinh|ImageGen/i.test(node.textContent ?? '')).length,
        externalLinkCount: document.querySelectorAll('[data-origin-act] a[target="_blank"]').length,
        unsafeExternalLinkCount: unsafeExternalLinks.length,
        distortedImageCount: originImages.filter((image) => {
          const box = image.getBoundingClientRect()
          if (!image.naturalWidth || !image.naturalHeight || !box.width || !box.height) return true
          return Math.abs((box.width / box.height) - (image.naturalWidth / image.naturalHeight)) > 0.03
        }).length,
      }
    } else if (kind === 'hub') {
      const lessonLinks = [...document.querySelectorAll('a[href^="/brain2/21-ngay/ngay-"]')]
        .map((link) => link.getAttribute('href'))
      result.route = {
        roadmapStates: document.querySelectorAll('[data-access]').length,
        publicStates: document.querySelectorAll('[data-access="public"]').length,
        protectedStates: document.querySelectorAll('[data-access="conan-maker"]').length,
        uniqueLessonLinks: new Set(lessonLinks).size,
      }
    } else if (kind === 'public-lesson' || kind === 'public-week-end') {
      const reasonSection = document.querySelector('#why-this-day')?.parentElement
      const lessonBody = reasonSection?.nextElementSibling
      const checklistSection = document.querySelector('#brain2-checklist')?.parentElement
      result.route = {
        articleCount: document.querySelectorAll('article').length,
        blockCount: lessonBody?.children.length ?? 0,
        reasonCount: document.querySelectorAll('#why-this-day').length,
        deliverableCount: document.querySelectorAll('#brain2-deliverable').length,
        checklistCount: document.querySelectorAll('#brain2-checklist').length,
        checklistItemCount: checklistSection?.querySelectorAll('li').length ?? 0,
        promptCount: document.querySelectorAll('pre').length,
        copyButtonCount: [...document.querySelectorAll('button')].filter((button) => button.textContent?.trim() === 'Sao chép').length,
        weekBoundaryCount: [...document.querySelectorAll('p')].filter((node) => node.textContent?.trim() === 'Hết tuần công khai').length,
      }
    } else if (kind === 'protected-lesson') {
      result.route = {
        accessState: document.querySelector('[data-access-state]')?.getAttribute('data-access-state') ?? null,
        privateReasonCount: document.querySelectorAll('#why-this-day').length,
        privateDeliverableCount: document.querySelectorAll('#brain2-deliverable').length,
        privateChecklistCount: document.querySelectorAll('#brain2-checklist').length,
        privatePromptCount: document.querySelectorAll('pre').length,
      }
    }

    result.route.viewportWidth = viewportWidth
    result.route.reduced = reduced
    return result
  }, {
    kind: routeCase.kind,
    viewportHeight: viewport.height,
    viewportWidth: viewport.width,
    reduced: motion.reducedMotion === 'reduce',
  })
}

function failuresFor(result, routeCase, motion) {
  const failures = []
  const metrics = result.metrics
  if (result.status !== 200) failures.push(`HTTP ${result.status}`)
  if (!metrics || metrics.mainCount !== 1 || metrics.h1Count !== 1 || !metrics.meaningfulText) failures.push('page identity')
  if (metrics?.overflowX > 2) failures.push(`overflow ${metrics.overflowX}`)
  if (metrics?.brokenImages || metrics?.incompleteImages || metrics?.deferredLazyImages) failures.push('broken, incomplete or deferred image')
  if (metrics?.headerH1Overlap > 0) failures.push('pinned header overlaps H1')
  if ((metrics?.cls ?? Infinity) > 0.1) failures.push(`CLS ${metrics?.cls}`)
  if (motion.reducedMotion === 'reduce' && (!metrics?.reducedMatches || metrics?.motionActiveCount > 0)) failures.push('reduced motion boundary')
  if (motion.reducedMotion === 'no-preference' && metrics?.reducedMatches) failures.push('motion media mismatch')
  const unexpectedConsoleErrors = routeCase.kind === 'protected-lesson'
    ? result.diagnostics.consoleErrors.filter((message) => !/status of 401 \(Unauthorized\)$/.test(message))
    : result.diagnostics.consoleErrors
  if (unexpectedConsoleErrors.length || result.diagnostics.pageErrors.length || result.diagnostics.failedRequests.length || result.diagnostics.responseErrors.length) failures.push('runtime diagnostics')

  const route = metrics?.route ?? {}
  if (routeCase.kind === 'home' && (route.sectionCount !== 6 || route.bridgeCount !== 1 || route.proofTriggerCount !== 3 || route.debtCount !== 1 || !route.proofFitsViewport || route.headerSheetGap < 0)) failures.push('homepage contract')
  if (routeCase.kind === 'about' && (route.actCount !== 5 || route.consequenceCount !== 1 || route.debtCount !== 1 || route.disclosureCount < 1 || route.externalLinkCount < 3 || route.unsafeExternalLinkCount !== 0 || route.distortedImageCount !== 0)) failures.push('about contract')
  if (routeCase.kind === 'hub' && (route.roadmapStates !== 21 || route.publicStates !== 7 || route.protectedStates !== 14 || route.uniqueLessonLinks !== 21)) failures.push('hub contract')
  if (routeCase.kind === 'public-lesson' && (route.articleCount < 1 || route.blockCount !== 47 || route.reasonCount !== 1 || route.deliverableCount !== 1 || route.checklistCount !== 1 || route.checklistItemCount !== 2 || route.promptCount !== 0)) failures.push('public lesson contract')
  if (routeCase.kind === 'public-week-end' && (route.articleCount < 1 || route.blockCount !== 40 || route.reasonCount !== 1 || route.deliverableCount !== 1 || route.checklistCount !== 1 || route.checklistItemCount !== 2 || route.promptCount !== 1 || route.copyButtonCount !== 1 || route.weekBoundaryCount !== 1)) failures.push('week-end contract')
  if (routeCase.kind === 'protected-lesson' && (route.accessState !== 'unauthorized' || route.privateReasonCount || route.privateDeliverableCount || route.privateChecklistCount || route.privatePromptCount)) failures.push('protected shell contract')
  return failures
}

for (const motion of motionModes) {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      reducedMotion: motion.reducedMotion,
    })
    await addClsObserver(context)

    for (const routeCase of routeCases) {
      const page = await context.newPage()
      const diagnostics = await attachDiagnostics(page)
      await installAccessWorkerFixture(page)
      let status = 0
      let metrics = null
      let error = null
      let screenshot = null
      try {
        const response = await page.goto(`${base}${routeCase.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 })
        status = response?.status() ?? 0
        if (routeCase.kind === 'protected-lesson') {
          await page.locator('[data-access-state="unauthorized"]').waitFor({ state: 'attached', timeout: 10000 })
        }
        await settlePage(page)
        metrics = await inspectPage(page, routeCase, viewport, motion)
        const representative = (viewport.name === 'desktop' && motion.name === 'motion')
          || (viewport.name === 'mobile' && motion.name === 'reduced')
        if (representative) {
          screenshot = path.join(outputDir, `${routeCase.name}-${viewport.name}-${motion.name}.png`)
          await page.screenshot({ path: screenshot, fullPage: true })
        }
      } catch (caught) {
        error = compactError(caught)
        screenshot = path.join(outputDir, `FAIL-${routeCase.name}-${viewport.name}-${motion.name}.png`)
        await page.screenshot({ path: screenshot, fullPage: true }).catch(() => {})
      }
      const result = { route: routeCase.path, kind: routeCase.kind, viewport: viewport.name, motion: motion.name, status, metrics, diagnostics, screenshot, error }
      result.failures = error ? [error] : failuresFor(result, routeCase, motion)
      matrix.push(result)
      await page.close()
    }
    await context.close()
  }
}

async function runInteraction(name, callback) {
  try {
    const evidence = await callback()
    interactionResults.push({ name, pass: true, ...evidence })
  } catch (error) {
    interactionResults.push({ name, pass: false, error: compactError(error) })
  }
}

function requireOne(locator, count, label) {
  if (count !== 1) throw new Error(`${label} expected one element, received ${count}`)
  return locator
}

function assertProtectedHeaders(headers, label) {
  const expected = {
    'cache-control': 'private, no-store, max-age=0',
    pragma: 'no-cache',
    vary: 'Cookie',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
  }
  for (const [name, value] of Object.entries(expected)) {
    if (headers[name] !== value) throw new Error(`${label} has an invalid ${name} header`)
  }
}

await runInteraction('homepage evidence modal keyboard loop', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const page = await context.newPage()
  await installAccessWorkerFixture(page)
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('[aria-label="Ba bằng chứng có thể mở để xem chi tiết"][data-interactive="true"]')
    .waitFor({ state: 'attached', timeout: 10000 })
  const triggers = page.locator('[aria-label^="Mở bằng chứng:"]')
  const triggerCount = await triggers.count()
  if (triggerCount !== 3) throw new Error(`proof triggers expected three, received ${triggerCount}`)
  const trigger = (await triggers.all())[0]
  await trigger.press('Enter')
  const dialog = page.locator('[role="dialog"][aria-modal="true"]')
  await dialog.waitFor({ state: 'visible', timeout: 10000 })
  requireOne(dialog, await dialog.count(), 'proof dialog')
  const focusInside = await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]')))
  const closeButton = dialog.getByRole('button', { name: 'Đóng hồ sơ bằng chứng' })
  const detailLink = dialog.getByRole('link', { name: 'Đi sâu vào dấu vết này' })
  await closeButton.waitFor({ state: 'visible' })
  await page.keyboard.press('Shift+Tab')
  const shiftTabWrapped = await detailLink.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Tab')
  const tabWrapped = await closeButton.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Escape')
  const closed = await dialog.count() === 0
  const focusRestored = await trigger.evaluate((element) => document.activeElement === element)
  const bodyUnlocked = await page.evaluate(() => document.body.style.overflow !== 'hidden')
  await context.close()
  if (!focusInside || !shiftTabWrapped || !tabWrapped || !closed || !focusRestored || !bodyUnlocked) throw new Error('proof modal focus trap or scroll restoration failed')
  return { triggerCount, focusInside, shiftTabWrapped, tabWrapped, closed, focusRestored, bodyUnlocked }
})

await runInteraction('pinned mobile menu traps focus and restores its trigger', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('[aria-label="Ba bằng chứng có thể mở để xem chi tiết"][data-interactive="true"]')
    .waitFor({ state: 'attached', timeout: 10000 })
  const trigger = page.getByRole('button', { name: 'Mở mục lục' })
  await trigger.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'Điều hướng trang web' })
  await dialog.waitFor({ state: 'visible', timeout: 10000 })
  const closeButton = dialog.getByRole('button', { name: 'Đóng menu' })
  const focusable = dialog.locator('a[href], button:not([disabled])')
  const last = focusable.last()
  await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Đóng menu')
  const bodyLocked = await page.evaluate(() => document.body.style.overflow === 'hidden')
  await page.keyboard.press('Shift+Tab')
  const shiftTabWrapped = await last.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Tab')
  const tabWrapped = await closeButton.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Escape')
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const focusRestored = await trigger.evaluate((element) => document.activeElement === element)
  const bodyUnlocked = await page.evaluate(() => document.body.style.overflow !== 'hidden')
  await context.close()
  if (!bodyLocked || !shiftTabWrapped || !tabWrapped || !focusRestored || !bodyUnlocked) throw new Error('mobile menu focus trap or scroll restoration failed')
  return { bodyLocked, shiftTabWrapped, tabWrapped, focusRestored, bodyUnlocked }
})

await runInteraction('public lesson completion persists and updates hub progress', async () => {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } })
  const page = await context.newPage()
  await page.goto(`${base}/brain2/21-ngay/ngay-01`, { waitUntil: 'domcontentloaded' })
  const completion = page.getByRole('button', { name: 'Đánh dấu đã hoàn thành' })
  await completion.waitFor({ state: 'visible', timeout: 10000 })
  requireOne(completion, await completion.count(), 'completion button')
  await completion.press('Enter')
  const completed = page.getByRole('button', { name: 'Đã hoàn thành ngày này' })
  requireOne(completed, await completed.count(), 'completed button')
  await page.reload({ waitUntil: 'domcontentloaded' })
  const persistedCompletion = page.getByRole('button', { name: 'Đã hoàn thành ngày này' })
  await persistedCompletion.waitFor({ state: 'visible', timeout: 10000 })
  requireOne(persistedCompletion, await persistedCompletion.count(), 'persisted completion')
  await page.goto(`${base}/brain2/21-ngay`, { waitUntil: 'domcontentloaded' })
  const progress = page.getByText('1/21 ngày đã hoàn thành', { exact: true })
  requireOne(progress, await progress.count(), 'hub progress')
  await context.close()
  return { completionPersisted: true, hubProgressUpdated: true }
})

await runInteraction('day 07 prompt copy keeps focus and copies exact text', async () => {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base })
  const page = await context.newPage()
  await page.goto(`${base}/brain2/21-ngay/ngay-07`, { waitUntil: 'domcontentloaded' })
  const copyButton = page.getByRole('button', { name: 'Sao chép' })
  requireOne(copyButton, await copyButton.count(), 'copy button')
  const prompt = page.locator('pre')
  requireOne(prompt, await prompt.count(), 'prompt')
  const expected = (await prompt.textContent()) ?? ''
  await copyButton.press('Enter')
  const status = page.getByText('Đã sao chép', { exact: true })
  await status.waitFor({ state: 'visible' })
  const clipboard = await page.evaluate(() => navigator.clipboard.readText())
  const focusKept = await copyButton.evaluate((element) => document.activeElement === element)
  await context.close()
  if (clipboard !== expected || !focusKept) throw new Error('copy result or focus is incorrect')
  return { clipboardMatches: true, focusKept }
})

await runInteraction('protected gate is keyboard safe and returns a generic invalid state', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await installAccessWorkerFixture(page)
  await page.goto(`${base}/brain2/21-ngay/ngay-08`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-access-state="unauthorized"]').waitFor({ state: 'attached' })
  const trigger = page.getByRole('button', { name: 'Mở bằng mã Conan Maker' })
  requireOne(trigger, await trigger.count(), 'access trigger')
  await trigger.press('Enter')
  const input = page.getByLabel('Mã truy cập', { exact: true })
  await input.waitFor({ state: 'visible', timeout: 10000 })
  requireOne(input, await input.count(), 'access input')
  const inputFocused = await input.evaluate((element) => document.activeElement === element)
  const dialog = page.getByRole('dialog', { name: 'Mở phần thực hành chuyên sâu' })
  const closeButton = dialog.getByRole('button', { name: 'Đóng cửa sổ nhập mã' })
  const submitButton = dialog.getByRole('button', { name: 'Xác nhận' })
  await closeButton.focus()
  await page.keyboard.press('Shift+Tab')
  const shiftTabWrapped = await submitButton.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Tab')
  const tabWrapped = await closeButton.evaluate((element) => document.activeElement === element)
  await page.keyboard.press('Escape')
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  const focusRestored = await trigger.evaluate((element) => document.activeElement === element)
  await trigger.press('Enter')
  await input.waitFor({ state: 'visible', timeout: 10000 })
  await input.fill('invalid-fixture')
  await input.press('Enter')
  const genericError = page.getByText('Mã chưa đúng. Vui lòng kiểm tra và thử lại.', { exact: true })
  await genericError.waitFor({ state: 'visible' })
  const dialogStillOpen = await page.locator('[role="dialog"][aria-modal="true"]').count() === 1
  await context.close()
  if (!inputFocused || !shiftTabWrapped || !tabWrapped || !focusRestored || !dialogStillOpen) throw new Error('access gate focus trap or error state failed')
  return { inputFocused, shiftTabWrapped, tabWrapped, focusRestored, dialogStillOpen, genericError: true }
})

await runInteraction('actual access Worker rejects a tampered session with protected headers', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await installAccessWorkerFixture(page, { session: 'tampered' })
  const accessResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/api/access'))
  await page.goto(`${base}/brain2/21-ngay/ngay-08`, { waitUntil: 'domcontentloaded' })
  await page.locator('[data-access-state="unauthorized"]').waitFor({ state: 'attached', timeout: 10000 })
  const accessResponse = await accessResponsePromise
  const headers = await accessResponse.allHeaders()
  assertProtectedHeaders(headers, 'tampered access response')
  const protectedBodyCount = await page.locator('#why-this-day, #brain2-deliverable, #brain2-checklist, pre').count()
  await context.close()
  if (accessResponse.status() !== 401 || protectedBodyCount !== 0) throw new Error('tampered session did not fail closed')
  return { status: accessResponse.status(), protectedHeaders: true, protectedBodyCount }
})

await runInteraction('actual access Worker renders an authorized package with protected headers', async () => {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } })
  const page = await context.newPage()
  await installAccessWorkerFixture(page, { session: 'authorized' })
  const accessResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/api/access'))
  const lessonResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith('/api/lessons/ngay-08'))
  await page.goto(`${base}/brain2/21-ngay/ngay-08`, { waitUntil: 'domcontentloaded' })
  const ready = page.getByText('Quyền Conan Maker đang hoạt động trên trình duyệt này.', { exact: true })
  await ready.waitFor({ state: 'visible', timeout: 10000 })
  const [accessResponse, lessonResponse] = await Promise.all([accessResponsePromise, lessonResponsePromise])
  const [accessHeaders, lessonHeaders] = await Promise.all([accessResponse.allHeaders(), lessonResponse.allHeaders()])
  assertProtectedHeaders(accessHeaders, 'authorized access response')
  assertProtectedHeaders(lessonHeaders, 'authorized lesson response')
  const lockedShellCount = await page.locator('[data-access-state]').count()
  const visiblePrivateSections = await page.locator('#why-this-day, #brain2-deliverable, #brain2-checklist').count()
  const articleCount = await page.locator('article').count()
  await context.close()
  if (accessResponse.status() !== 200 || lessonResponse.status() !== 200 || lockedShellCount !== 0 || visiblePrivateSections !== 3 || articleCount !== 1) {
    throw new Error('authorized Worker package did not render its complete structural contract')
  }
  return { accessStatus: 200, lessonStatus: 200, protectedHeaders: true, visiblePrivateSections, privateContentRecorded: false }
})

for (const routeCase of routeCases.filter(({ kind }) => kind === 'public-lesson' || kind === 'public-week-end')) {
  await runInteraction(`no-JavaScript content remains readable: ${routeCase.path}`, async () => {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      javaScriptEnabled: false,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const response = await page.goto(`${base}${routeCase.path}`, { waitUntil: 'domcontentloaded' })
    const metrics = await page.evaluate(() => {
      const reasonSection = document.querySelector('#why-this-day')?.parentElement
      const lessonBody = reasonSection?.nextElementSibling
      return {
        h1Count: document.querySelectorAll('h1').length,
        articleCount: document.querySelectorAll('article').length,
        blockCount: lessonBody?.children.length ?? 0,
        reasonCount: document.querySelectorAll('#why-this-day').length,
        deliverableCount: document.querySelectorAll('#brain2-deliverable').length,
        checklistCount: document.querySelectorAll('#brain2-checklist').length,
        promptCount: document.querySelectorAll('pre').length,
      }
    })
    await context.close()
    const expectedBlocks = routeCase.kind === 'public-week-end' ? 40 : 47
    const expectedPrompts = routeCase.kind === 'public-week-end' ? 1 : 0
    if (response?.status() !== 200 || metrics.h1Count !== 1 || metrics.articleCount < 1 || metrics.blockCount !== expectedBlocks || metrics.reasonCount !== 1 || metrics.deliverableCount !== 1 || metrics.checklistCount !== 1 || metrics.promptCount !== expectedPrompts) {
      throw new Error('server-rendered public lesson content is incomplete')
    }
    return metrics
  })
}

await browser.close()

const matrixFailures = matrix.filter(({ failures }) => failures.length > 0)
const interactionFailures = interactionResults.filter(({ pass }) => !pass)
const report = {
  generatedAt: new Date().toISOString(),
  base,
  outputDir,
  matrixCases: matrix.length,
  matrixPassed: matrix.length - matrixFailures.length,
  matrix,
  matrixFailures,
  interactions: interactionResults,
  screenshots: matrix.filter(({ screenshot }) => screenshot).map(({ screenshot }) => screenshot),
}
await writeFile(path.join(outputDir, 'qa-report.json'), `${JSON.stringify(report, null, 2)}\n`)

console.log(JSON.stringify({
  matrixCases: report.matrixCases,
  matrixPassed: report.matrixPassed,
  matrixFailed: matrixFailures.length,
  interactionCases: interactionResults.length,
  interactionPassed: interactionResults.length - interactionFailures.length,
  interactionFailed: interactionFailures.length,
  report: path.join(outputDir, 'qa-report.json'),
}, null, 2))

if (matrixFailures.length || interactionFailures.length) process.exitCode = 1
