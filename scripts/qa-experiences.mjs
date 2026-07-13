import { mkdir, rm, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3022'
const output = process.env.QA_OUTPUT_DIR ?? '/tmp/thongphan-experience-hub-qa'
const cases = [
  { name: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'mobile', width: 390, height: 844, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'mobile-320', width: 320, height: 568, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce', javascriptEnabled: true },
  { name: 'desktop-no-js', width: 1440, height: 900, reducedMotion: 'no-preference', javascriptEnabled: false },
]

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
let expectedContentSignature

try {
  for (const item of cases) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      reducedMotion: item.reducedMotion,
      javaScriptEnabled: item.javascriptEnabled,
    })
    const page = await context.newPage()
    const errors = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    const response = await page.goto(`${base}/experiences.html`, { waitUntil: 'networkidle' })
    if (item.javascriptEnabled) {
      await page.evaluate(async () => {
        await document.fonts?.ready
        window.scrollTo(0, document.body.scrollHeight)
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        window.scrollTo(0, 0)
      })
    } else {
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
        window.scrollTo(0, 0)
      })
    }

    const state = await page.evaluate(() => {
      const header = document.querySelector('header[data-header-scrolled]')?.getBoundingClientRect()
      const title = document.querySelector('h1')?.getBoundingClientRect()
      const experienceCards = [...document.querySelectorAll('[data-experience-id]')]
      const atmosphere = document.querySelector('[data-page-visible]')
      const normalizeText = (value) => value?.replace(/\s+/g, ' ').trim() ?? ''
      const overlap = header && title
        ? Math.max(0, Math.min(header.bottom, title.bottom) - Math.max(header.top, title.top))
        : 0
      return {
        h1Count: document.querySelectorAll('h1').length,
        cardCount: experienceCards.length,
        contentSignature: {
          h1: normalizeText(document.querySelector('h1')?.textContent),
          cards: experienceCards.map((card) => normalizeText(card.textContent)),
        },
        atmosphere: atmosphere ? {
          ambient: atmosphere.getAttribute('data-ambient'),
          motionActive: atmosphere.getAttribute('data-motion-active'),
          pageVisible: atmosphere.getAttribute('data-page-visible'),
        } : null,
        hiddenExperienceCards: experienceCards.filter((card) => {
          const style = getComputedStyle(card)
          const rect = card.getBoundingClientRect()
          return style.display === 'none'
            || style.visibility === 'hidden'
            || Number(style.opacity) < 0.99
            || rect.width === 0
            || rect.height === 0
        }).map((card) => card.getAttribute('data-experience-id')),
        unreadyExperienceContent: experienceCards.flatMap((card) =>
          [...card.querySelectorAll('*')].filter((element) => {
            const hasDirectText = [...element.childNodes].some(
              (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            )
            const isMedia = element.matches('img, picture, video, svg, canvas')
            if (!hasDirectText && !isMedia) return false
            const style = getComputedStyle(element)
            const rect = element.getBoundingClientRect()
            return style.display === 'none'
              || style.visibility === 'hidden'
              || Number(style.opacity) < 0.99
              || rect.width === 0
              || rect.height === 0
          }).map((element) => ({
            card: card.getAttribute('data-experience-id'),
            tag: element.tagName,
            text: normalizeText(element.textContent).slice(0, 80),
          })),
        ),
        overflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
        headerTitleOverlap: overlap,
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }
    })

    if (response?.status() !== 200) throw new Error(`${item.name}: HTTP ${response?.status()}`)
    if (state.h1Count !== 1) throw new Error(`${item.name}: expected one H1`)
    if (state.cardCount < 2) throw new Error(`${item.name}: expected at least two real experiences`)
    if (state.hiddenExperienceCards.length) throw new Error(`${item.name}: hidden experience cards ${state.hiddenExperienceCards.join(', ')}`)
    if (state.unreadyExperienceContent.length) throw new Error(`${item.name}: unready experience content ${JSON.stringify(state.unreadyExperienceContent)}`)
    if (state.overflow > 1) throw new Error(`${item.name}: horizontal overflow ${state.overflow}px`)
    if (state.brokenImages) throw new Error(`${item.name}: ${state.brokenImages} broken images`)
    if (state.headerTitleOverlap > 0) throw new Error(`${item.name}: header overlaps title`)
    if (item.reducedMotion === 'reduce' && !state.reduced) throw new Error(`${item.name}: reduced motion did not apply`)
    if (errors.length) throw new Error(`${item.name}: ${errors.join(' | ')}`)

    if (!expectedContentSignature) expectedContentSignature = state.contentSignature
    if (JSON.stringify(state.contentSignature) !== JSON.stringify(expectedContentSignature)) {
      throw new Error(`${item.name}: content signature differs from desktop`)
    }

    if (item.javascriptEnabled) {
      if (state.atmosphere?.ambient !== 'restrained') throw new Error(`${item.name}: unexpected atmosphere profile`)
      if (state.atmosphere?.pageVisible !== 'true') throw new Error(`${item.name}: atmosphere is not page-visible`)
      const expectedMotionActive = item.reducedMotion === 'reduce' ? 'false' : 'true'
      if (state.atmosphere?.motionActive !== expectedMotionActive) {
        throw new Error(`${item.name}: expected motion active ${expectedMotionActive}`)
      }
    }

    if (item.name === 'desktop') {
      await page.screenshot({ path: `${output}/desktop-motion-viewport.png` })
    }

    await page.screenshot({ path: `${output}/${item.name}.png`, fullPage: true, animations: 'disabled' })
    results.push({ ...item, ...state, errors })
    await context.close()
  }

  const keyboard = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await keyboard.goto(`${base}/experiences.html`, { waitUntil: 'networkidle' })
  await keyboard.keyboard.press('Tab')
  const firstFocus = await keyboard.evaluate(() => ({
    tag: document.activeElement?.tagName,
    outline: getComputedStyle(document.activeElement).outlineStyle,
  }))
  if (!firstFocus.tag || firstFocus.outline === 'none') throw new Error('keyboard: first focus is not visible')
  await keyboard.close()
} finally {
  await browser.close()
}

await writeFile(`${output}/report.json`, `${JSON.stringify(results, null, 2)}\n`)
console.log(`Experience QA passed ${results.length}/${cases.length}: ${output}`)
