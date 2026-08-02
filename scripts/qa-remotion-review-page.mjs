import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const baseUrl = process.env.REVIEW_BASE_URL ?? 'http://127.0.0.1:4187'
const route = process.env.REVIEW_ROUTE ?? '/review/remotion-muc-dich-doi-song.html'
const outputDir = new URL('../artifacts/remotion-vertical-framing-review/', import.meta.url)
const cases = [
  { id: 'desktop', width: 1440, height: 1000 },
  { id: 'mobile', width: 390, height: 844 },
]
const rounds = [
  { label: 'Vòng 1', id: 'r1' },
  { label: 'Vòng 2', id: 'r2' },
  { label: 'Vòng 3', id: 'r3' },
  { label: 'Vòng 4', id: 'r4' },
  { label: 'Vòng 5', id: 'r5' },
  { label: 'Vòng 6', id: 'r6' },
  { label: 'Vòng 7', id: 'r7' },
]
const films = [
  { label: '01 · Soul', id: 'soul' },
  { label: '02 · Forrest Gump', id: 'forrest-gump' },
  { label: '03 · A Beautiful Mind', id: 'a-beautiful-mind' },
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
    assert.equal(response?.status(), 200)
    await page.getByRole('heading', { name: /Hai mươi mốt bản dựng dọc/ }).waitFor()

    const combinations = []
    for (const round of rounds) {
      await page.getByRole('button', { name: new RegExp(`^${round.label}`) }).click()
      for (const film of films) {
        await page.getByRole('button', { name: film.label, exact: true }).click()
        const video = page.locator('video')
        const expectedFile = `vertical-${round.id}-${film.id}-web.mp4`
        await page.waitForFunction(
          () => {
            const currentVideo = document.querySelector('video')
            return Boolean(currentVideo && Number.isFinite(currentVideo.duration) && currentVideo.duration > 0)
          },
        )
        const media = await video.evaluate((element) => ({
          currentSrc: element.currentSrc,
          duration: element.duration,
          readyState: element.readyState,
        }))
        assert.match(media.currentSrc, new RegExp(expectedFile))
        assert.ok(media.duration > 59 && media.duration < 61, `${expectedFile} duration=${media.duration}`)
        assert.ok(media.readyState >= 1, `${expectedFile} did not load metadata`)
        combinations.push({ round: round.id, film: film.id, ...media })
      }
      await page.screenshot({
        path: fileURLToPath(new URL(`${testCase.id}-${round.id}.png`, outputDir)),
        fullPage: true,
      })
    }

    await page.getByRole('button', { name: /^Vòng 7/ }).click()
    await page.getByRole('button', { name: '01 · Soul', exact: true }).click()
    const activeVideo = page.locator('video')
    await activeVideo.evaluate(async (element) => {
      await element.play()
    })
    await page.waitForTimeout(700)
    const playbackTime = await activeVideo.evaluate((element) => {
      element.pause()
      return element.currentTime
    })
    assert.ok(playbackTime > 0, 'final video did not advance during playback smoke')

    const layout = await page.evaluate(() => {
      const player = document.querySelector('video')?.getBoundingClientRect()
      return {
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        playerWidth: player?.width ?? 0,
        playerHeight: player?.height ?? 0,
      }
    })
    assert.ok(layout.documentWidth <= layout.viewportWidth + 1, 'horizontal overflow detected')
    assert.ok(Math.abs(layout.playerWidth / layout.playerHeight - 9 / 16) < 0.02, 'player is not 9:16')
    assert.deepEqual(consoleErrors, [])

    results.push({ case: testCase, combinations, playbackTime, layout, consoleErrors })
    await context.close()
  }
} finally {
  await browser.close()
}

await writeFile(
  new URL('qa-results.json', outputDir),
  `${JSON.stringify({ status: 'PASS', results }, null, 2)}\n`,
)
console.log(`PASS: ${results.length} viewports, ${results.length * 21} media combinations`)
