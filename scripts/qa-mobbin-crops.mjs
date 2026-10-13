// Section crops of the two-path pages for the side-by-side Mobbin sheet in qa/two-path/mobbin/.
// Mobbin images are not downloaded; qa/two-path/mobbin/index.html links each reference instead.
// Usage: npm run build && node scripts/qa-mobbin-crops.mjs
import http from 'node:http'
import { createReadStream } from 'node:fs'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = fileURLToPath(new URL('../', import.meta.url))
const outDir = path.join(root, 'out')
const dest = path.join(root, 'qa/two-path/mobbin/ours')

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
}

// [file prefix, route, section selector (null = first view), viewport widths]
const shots = [
  ['switch', '/', 'header', [1440]],
  ['home-hero', '/', null, [1440, 390]],
  ['home-letter', '/', 'section[aria-labelledby="founder-letter-title"]', [1440, 390]],
  ['home-fieldnotes', '/', 'section[aria-labelledby="field-notes-title"]', [1440]],
  ['home-closing', '/', 'section[aria-labelledby="home-closing-title"]', [1440]],
  ['tensai-hero', '/tensai', null, [1440, 390]],
  ['conan-hero', '/conan', null, [1440, 390]],
  ['conan-gallery', '/conan', 'section[aria-labelledby="conan-gallery"]', [1440]],
  ['conan-mentors', '/conan', 'section[aria-labelledby="conan-mentors"]', [1440]],
]

async function resolveFile(urlPath) {
  const base = path.join(outDir, decodeURIComponent(urlPath))
  for (const candidate of [`${base}.html`, base, path.join(base, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate
    } catch {}
  }
  return null
}

const server = http.createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, 'http://local').pathname)
  if (!file) {
    res.writeHead(404)
    res.end()
    return
  }
  res.writeHead(200, { 'content-type': contentTypes[path.extname(file)] ?? 'application/octet-stream' })
  createReadStream(file).pipe(res)
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const origin = `http://127.0.0.1:${server.address().port}`

await mkdir(dest, { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
try {
  for (const [name, route, selector, widths] of shots) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { width, height: width > 500 ? 900 : 844 } })
      await page.goto(origin + route, { waitUntil: 'networkidle' })
      // Scroll through once so lazy images below the fold have loaded.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo({ top: y, behavior: 'instant' })
          await new Promise((resolve) => setTimeout(resolve, 60))
        }
        window.scrollTo({ top: 0, behavior: 'instant' })
      })
      const file = path.join(dest, `${name}-${width}.jpg`)
      // Heroes are compared as the first view, since the home doors overhang the hero section.
      if (!selector) {
        await page.screenshot({ path: file, type: 'jpeg', quality: 72, animations: 'disabled' })
        await page.close()
        continue
      }
      // The fixed header would otherwise be stamped over tall element captures.
      if (selector !== 'header') await page.addStyleTag({ content: 'header { visibility: hidden !important; }' })
      const section = page.locator(selector).first()
      await section.scrollIntoViewIfNeeded()
      await page.evaluate(
        (sel) =>
          Promise.all(
            [...document.querySelectorAll(`${sel} img`)].map((img) =>
              img.complete ? null : new Promise((resolve) => { img.onload = img.onerror = resolve }),
            ),
          ),
        selector,
      )
      await page.waitForTimeout(300)
      await section.screenshot({ path: file, type: 'jpeg', quality: 72, animations: 'disabled' })
      await page.close()
    }
  }
} finally {
  await browser.close()
  server.close()
}
console.log(`Mobbin crops written to ${path.relative(root, dest)}`)
