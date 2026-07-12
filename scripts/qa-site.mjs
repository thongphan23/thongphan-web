import { chromium } from 'playwright'
import fs from 'fs/promises'
import path from 'path'

const base = 'http://localhost:3021'
const routes = [
  '/',
  '/about',
  '/diagnostic',
  '/chat',
  '/blog',
  '/blog/ai-khong-cuop-viec-ban',
  '/library',
  '/library/ban-do-bat-dau-neu-anh-em-dang-so-ai',
  '/assets',
  '/assets/ai-starter-van-phong',
  '/challenges',
  '/brain2/21-ngay',
  '/classic',
  '/concept',
]

const viewports = [
  { name: 'desktop', width: 1440, height: 1200 },
  { name: 'mobile', width: 390, height: 1200 },
]

const outDir = path.resolve('artifacts/qa')
await fs.mkdir(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []

for (const viewport of viewports) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: 'reduce' })
  for (const route of routes) {
    const page = await context.newPage()
    const consoleErrors = []
    const consoleWarnings = []
    const pageErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(`${msg.type()}: ${msg.text()}`)
      if (msg.type() === 'warning') consoleWarnings.push(`${msg.type()}: ${msg.text()}`)
    })
    page.on('pageerror', (error) => pageErrors.push(error.message))

    const url = base + route
    let status = 0
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      status = response?.status() || 0
      await page.waitForTimeout(2200)
      const metrics = await page.evaluate(() => {
        const doc = document.documentElement
        const body = document.body
        const h1 = document.querySelector('h1')?.textContent?.trim() || ''
        const nav = document.querySelector('nav')
        const main = document.querySelector('main')
        return {
          title: document.title,
          h1,
          nav: !!nav,
          main: !!main,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
          bodyHeight: body.scrollHeight,
          hiddenTextCount: Array.from(document.querySelectorAll('p, h1, h2, h3, a, button')).filter((el) => {
            const style = window.getComputedStyle(el)
            const rect = el.getBoundingClientRect()
            return rect.width > 0 && rect.height > 0 && (style.visibility === 'hidden' || style.opacity === '0')
          }).length,
        }
      })
      const overflow = metrics.scrollWidth - metrics.clientWidth
      const shouldShot = ['/', '/about', '/assets', '/diagnostic', '/chat'].includes(route)
      let screenshot = ''
      if (shouldShot) {
        const safe = route === '/' ? 'home' : route.replaceAll('/', '_').replace(/^_/, '')
        screenshot = path.join(outDir, `${safe}-${viewport.name}.png`)
        await page.screenshot({ path: screenshot, fullPage: true })
      }
      results.push({ route, viewport: viewport.name, status, overflow, screenshot, consoleErrors, consoleWarnings, pageErrors, ...metrics })
    } catch (error) {
      results.push({ route, viewport: viewport.name, status, error: error.message, consoleErrors, consoleWarnings, pageErrors })
    } finally {
      await page.close()
    }
  }
  await context.close()
}
await browser.close()

await fs.writeFile(path.join(outDir, 'qa-report.json'), JSON.stringify(results, null, 2))

const failures = results.filter((r) => r.error || r.status >= 400 || r.status === 0 || Math.max(0, r.overflow || 0) > 3 || (r.consoleErrors?.length || 0) || (r.pageErrors?.length || 0) || !r.h1 || !r.main)
console.log(JSON.stringify({ total: results.length, failures, screenshots: results.filter(r => r.screenshot).map(r => r.screenshot) }, null, 2))
if (failures.length) process.exit(1)
