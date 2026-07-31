import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const baseUrl = process.env.REVIEW_BASE_URL ?? 'http://127.0.0.1:4187'
const route = process.env.REVIEW_ROUTE ?? '/review/remotion-muc-dich-doi-song.html'
const outputDir = new URL('../artifacts/remotion-visual-proposition-review/', import.meta.url)
const cases = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'mobile', width: 390, height: 844 },
]
const variants = [
  { tab: '01 · Soul', source: 'soul-observable-expression-v1-web.mp4' },
  { tab: '02 · Forrest Gump', source: 'forrest-gump-observable-expression-v1-web.mp4' },
  { tab: '03 · A Beautiful Mind', source: 'a-beautiful-mind-observable-expression-v1-web.mp4' },
]

await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []

try {
  for (const testCase of cases) {
    const context = await browser.newContext({
      viewport: { width: testCase.width, height: testCase.height },
    })
    const page = await context.newPage()
    const consoleErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })

    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' })
    if (!response?.ok()) throw new Error(`${testCase.id}: route returned ${response?.status()}`)

    const variantResults = []
    for (const variant of variants) {
      await page.getByRole('button', { name: variant.tab, exact: true }).click()
      const video = page.locator('video')
      await video.evaluate((element) => {
        if (element.readyState < 1) {
          return new Promise((resolve, reject) => {
            element.addEventListener('loadedmetadata', resolve, { once: true })
            element.addEventListener('error', reject, { once: true })
          })
        }
      })
      const metadata = await video.evaluate((element) => ({
        currentSrc: element.currentSrc,
        duration: element.duration,
        poster: element.poster,
        readyState: element.readyState,
      }))
      if (!metadata.currentSrc.includes(variant.source)) {
        throw new Error(`${testCase.id}: ${variant.tab} loaded the wrong source`)
      }
      if (Math.abs(metadata.duration - 59.712) > 0.15) {
        throw new Error(`${testCase.id}: ${variant.tab} duration was ${metadata.duration}`)
      }
      await video.evaluate(async (element) => {
        element.muted = true
        await element.play()
      })
      await page.waitForFunction(() => {
        const element = document.querySelector('video')
        return element instanceof HTMLVideoElement && element.currentTime > 0.15
      })
      await video.evaluate((element) => element.pause())
      variantResults.push({ ...variant, ...metadata, played: true })
    }

    const layout = await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      heading: document.querySelector('h1')?.textContent?.trim(),
    }))
    if (layout.documentWidth > layout.viewportWidth) {
      throw new Error(`${testCase.id}: horizontal overflow ${layout.documentWidth}/${layout.viewportWidth}`)
    }
    if (consoleErrors.length > 0) {
      throw new Error(`${testCase.id}: console errors: ${consoleErrors.join(' | ')}`)
    }

    await page.screenshot({
      path: new URL(`${testCase.id}.png`, outputDir).pathname,
      fullPage: true,
    })
    results.push({ ...testCase, layout, consoleErrors, variants: variantResults, status: 'pass' })
    await context.close()
  }
} finally {
  await browser.close()
}

const report = {
  schema_version: 'thongphan.remotion-review-browser-qa.v1',
  base_url: baseUrl,
  route,
  status: 'pass',
  results,
}
await writeFile(
  new URL('report.json', outputDir),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
)
console.log(JSON.stringify(report, null, 2))
