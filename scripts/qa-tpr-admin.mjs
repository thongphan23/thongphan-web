import { mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = process.argv[2]
const snapshotPath = process.argv[3]
const outputDir = process.argv[4]
if (!baseUrl || !snapshotPath || !outputDir) {
  throw new Error('Usage: node scripts/qa-tpr-admin.mjs <base-url> <snapshot.json> <output-dir>')
}

const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'))
await mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })
const cases = [
  { name: 'desktop', viewport: { width: 1440, height: 900 } },
  { name: 'mobile', viewport: { width: 390, height: 844 } },
]
const results = []

for (const item of cases) {
  const context = await browser.newContext({ viewport: item.viewport })
  const page = await context.newPage()
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.route('**/tpr/api/snapshot', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(snapshot),
  }))
  await page.goto(`${baseUrl}/tpr`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('heading', { name: 'Tổng quan hệ thống' }).waitFor()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
  await page.screenshot({ path: path.join(outputDir, `${item.name}-overview.png`), fullPage: true })
  await page.getByRole('button', { name: 'Rủi ro' }).click()
  await page.getByRole('heading', { name: 'Rủi ro' }).waitFor()
  await page.screenshot({ path: path.join(outputDir, `${item.name}-risks.png`), fullPage: true })
  results.push({ name: item.name, overflow, consoleErrors, title: await page.title() })
  await context.close()
}

await browser.close()
console.log(JSON.stringify({ status: results.every((item) => !item.overflow && item.consoleErrors.length === 0) ? 'pass' : 'fail', results }, null, 2))
