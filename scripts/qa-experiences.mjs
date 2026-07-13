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
const segments = [
  { name: 'top', selector: 'h1', index: 0, position: 'top' },
  { name: 'card-1', selector: '[data-experience-id]', index: 0, position: 'start' },
  { name: 'card-2', selector: '[data-experience-id]', index: 1, position: 'start' },
  { name: 'handoff', selector: '[aria-labelledby="handoff-experiences"]', index: 0, position: 'bottom' },
]

async function waitForFonts(page) {
  await page.evaluate(async () => {
    await document.fonts?.ready
  })
}

async function prepareAllContent(page, javascriptEnabled) {
  if (!javascriptEnabled) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight)
      window.scrollTo(0, 0)
    })
    return
  }

  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    window.scrollTo(0, 0)
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
}

async function settleOnSegment(page, segment, javascriptEnabled) {
  const targetState = await page.evaluate(({ selector, index, position }) => {
    const target = document.querySelectorAll(selector)[index]
    if (!target) throw new Error(`missing segment target ${selector}[${index}]`)

    const headerHeight = document.querySelector('header[data-header-scrolled]')?.getBoundingClientRect().height ?? 0
    const targetTop = target.getBoundingClientRect().top + window.scrollY
    if (position === 'top') {
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else if (position === 'bottom') {
      target.scrollIntoView({ block: 'end', behavior: 'instant' })
    } else {
      window.scrollTo({ top: Math.max(0, targetTop - headerHeight - 16), behavior: 'instant' })
    }

    return {
      selector,
      index,
      position,
      initialScrollY: window.scrollY,
    }
  }, segment)

  let stability
  if (javascriptEnabled) {
    stability = await page.evaluate(async () => {
      let previousScrollY = Number.NaN
      let stableFrames = 0
      let rafCount = 0
      while (stableFrames < 2 && rafCount < 12) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        rafCount += 1
        if (Number.isFinite(previousScrollY) && Math.abs(window.scrollY - previousScrollY) < 0.5) {
          stableFrames += 1
        } else {
          stableFrames = 0
        }
        previousScrollY = window.scrollY
      }
      return { stableFrames, rafCount, scrollY: window.scrollY }
    })
    if (stability.stableFrames < 2) {
      throw new Error(`segment scroll did not settle for ${segment.selector}[${segment.index}]`)
    }
  } else {
    // Chromium exposes requestAnimationFrame in evaluate() when page JavaScript is
    // disabled but never invokes it. Two frame-duration probes preserve a truthful
    // no-JS context while still proving the scroll position is stable before capture.
    let previousScrollY = targetState.initialScrollY
    for (let frame = 0; frame < 2; frame += 1) {
      await page.waitForTimeout(34)
      const currentScrollY = await page.evaluate(() => window.scrollY)
      if (Math.abs(currentScrollY - previousScrollY) >= 0.5) {
        throw new Error(`no-JS segment scroll did not settle for ${segment.selector}[${segment.index}]`)
      }
      previousScrollY = currentScrollY
    }
    stability = { stableFrames: 2, rafCount: 0, scrollY: previousScrollY }
  }

  const geometry = await page.evaluate(({ selector, index }) => {
    const target = document.querySelectorAll(selector)[index]
    if (!target) throw new Error(`missing segment target ${selector}[${index}] after settle`)
    const rect = target.getBoundingClientRect()
    return {
      target: {
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      },
      viewport: { width: window.innerWidth, height: window.innerHeight },
      documentHeight: document.documentElement.scrollHeight,
    }
  }, segment)

  return {
    ...targetState,
    scrollY: stability.scrollY,
    stableFrames: stability.stableFrames,
    rafCount: stability.rafCount,
    settleMethod: javascriptEnabled ? 'request-animation-frame' : 'frame-duration-probe-no-js',
    ...geometry,
  }
}

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
let expectedContentSignature
let keyboardResult

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
    await waitForFonts(page)

    if (response?.status() !== 200) throw new Error(`${item.name}: HTTP ${response?.status()}`)

    const initialAtmosphere = await page.evaluate(() => {
      const atmosphere = document.querySelector('[data-page-visible]')
      return atmosphere ? {
        ambient: atmosphere.getAttribute('data-ambient'),
        motionActive: atmosphere.getAttribute('data-motion-active'),
        pageVisible: atmosphere.getAttribute('data-page-visible'),
      } : null
    })

    if (item.javascriptEnabled) {
      if (initialAtmosphere?.ambient !== 'restrained') throw new Error(`${item.name}: unexpected atmosphere profile`)
      if (initialAtmosphere?.pageVisible !== 'true') throw new Error(`${item.name}: atmosphere is not page-visible`)
      const expectedMotionActive = item.reducedMotion === 'reduce' ? 'false' : 'true'
      if (initialAtmosphere?.motionActive !== expectedMotionActive) {
        throw new Error(`${item.name}: expected motion active ${expectedMotionActive}`)
      }
    }

    if (item.name === 'desktop') {
      await page.screenshot({ path: `${output}/desktop-motion-viewport.png` })
    }

    await prepareAllContent(page, item.javascriptEnabled)

    const state = await page.evaluate(() => {
      const header = document.querySelector('header[data-header-scrolled]')?.getBoundingClientRect()
      const title = document.querySelector('h1')?.getBoundingClientRect()
      const experienceCards = [...document.querySelectorAll('[data-experience-id]')]
      const normalizeText = (value) => value?.replace(/\s+/g, ' ').trim() ?? ''
      const overlap = header && title
        ? Math.max(0, Math.min(header.bottom, title.bottom) - Math.max(header.top, title.top))
        : 0
      return {
        h1Count: document.querySelectorAll('h1').length,
        cardCount: experienceCards.length,
        contentSignature: {
          h1: normalizeText(document.querySelector('h1')?.textContent),
          cards: experienceCards.map((card) => ({
            title: normalizeText(card.querySelector('h2')?.textContent),
            body: normalizeText(card.querySelector('p')?.textContent),
            link: normalizeText(card.querySelector('a')?.textContent),
          })),
        },
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

    if (state.h1Count !== 1) throw new Error(`${item.name}: expected one H1`)
    if (state.cardCount !== 2) throw new Error(`${item.name}: expected exactly two released experiences`)
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

    const segmentEvidence = []
    for (const segment of segments) {
      const metadata = await settleOnSegment(page, segment, item.javascriptEnabled)
      const file = `${item.name}-${segment.name}.png`
      await page.screenshot({ path: `${output}/${file}`, animations: 'disabled' })
      segmentEvidence.push({ name: segment.name, file, ...metadata })
    }

    results.push({ ...item, ...state, atmosphere: initialAtmosphere, errors, segments: segmentEvidence })
    await context.close()
  }

  const keyboard = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await keyboard.goto(`${base}/experiences.html`, { waitUntil: 'networkidle' })
  await keyboard.keyboard.press('Tab')
  keyboardResult = await keyboard.evaluate(() => {
    const active = document.activeElement
    if (!active) return null
    const style = getComputedStyle(active)
    const rect = active.getBoundingClientRect()
    return {
      tag: active.tagName,
      href: active.getAttribute('href'),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      rect: { width: rect.width, height: rect.height },
    }
  })
  if (!keyboardResult?.tag
    || keyboardResult.outlineStyle === 'none'
    || Number.parseFloat(keyboardResult.outlineWidth) <= 0
    || keyboardResult.rect.width <= 0
    || keyboardResult.rect.height <= 0) {
    throw new Error('keyboard: first focus is not visibly outlined')
  }
  await keyboard.close()
} finally {
  await browser.close()
}

const report = {
  evidenceMode: 'segmented-viewport',
  authoritativeFullPageCapture: false,
  screenshotCount: results.reduce((count, result) => count + result.segments.length, 0) + 1,
  contentSignature: expectedContentSignature,
  keyboard: keyboardResult,
  cases: results,
}
await writeFile(`${output}/report.json`, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Experience QA passed ${results.length}/${cases.length} with ${report.screenshotCount} viewport screenshots: ${output}`)
