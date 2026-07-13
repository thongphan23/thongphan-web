import { realpathSync } from 'node:fs'
import { realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'

export const qaOutputRoot = resolve(realpathSync(tmpdir()), 'thongphan-experience-hub-qa')

function isInside(root, candidate) {
  const pathFromRoot = relative(root, candidate)
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..' && !isAbsolute(pathFromRoot))
}

async function resolveThroughExistingAncestor(candidate) {
  let current = candidate
  const missingSegments = []

  while (true) {
    try {
      const existing = await realpath(current)
      return resolve(existing, ...missingSegments.reverse())
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
      const parent = dirname(current)
      if (parent === current) throw error
      missingSegments.push(basename(current))
      current = parent
    }
  }
}

export async function resolveQaOutputDir(input = qaOutputRoot) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('QA output path must be a non-empty absolute path')
  }
  if (!isAbsolute(input)) throw new Error('QA output path must be absolute')
  if (input.split(/[\\/]+/).includes('..')) throw new Error('QA output path may not contain traversal segments')

  const candidate = resolve(input)
  const [canonicalRoot, canonicalCandidate] = await Promise.all([
    resolveThroughExistingAncestor(qaOutputRoot),
    resolveThroughExistingAncestor(candidate),
  ])
  if (canonicalRoot !== qaOutputRoot) {
    throw new Error('Dedicated QA output root may not be a symlink')
  }
  if (!isInside(canonicalRoot, canonicalCandidate)) {
    throw new Error('QA output symlink resolves outside the dedicated directory')
  }

  return canonicalCandidate
}

export async function waitForImages(page) {
  await page.evaluate(async () => {
    const images = [...document.images]
    const failures = []

    await Promise.all(images.map(async (image, index) => {
      if (!image.complete) {
        await Promise.race([
          new Promise((resolveImage) => {
            image.addEventListener('load', resolveImage, { once: true })
            image.addEventListener('error', resolveImage, { once: true })
          }),
          new Promise((resolveTimeout) => setTimeout(resolveTimeout, 10_000)),
        ])
      }

      if (!image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        failures.push(`${index}:${image.currentSrc || image.src || '(missing src)'}:incomplete-or-zero-dimension`)
        return
      }

      try {
        await image.decode()
      } catch {
        failures.push(`${index}:${image.currentSrc || image.src}:decode-failed`)
      }
    }))

    if (failures.length) throw new Error(`image readiness failed: ${failures.join(' | ')}`)
  })
}

export async function inspectExperiencePage(page) {
  return page.evaluate(() => {
    const header = document.querySelector('header[data-header-scrolled]')?.getBoundingClientRect()
    const title = document.querySelector('h1')?.getBoundingClientRect()
    const experienceCards = [...document.querySelectorAll('[data-experience-id]')]
    const normalizeText = (value) => value?.replace(/\s+/g, ' ').trim() ?? ''
    const overlap = header && title
      ? Math.max(0, Math.min(header.bottom, title.bottom) - Math.max(header.top, title.top))
      : 0
    const isMeaningfullyVisible = (element) => {
      const rect = element.getBoundingClientRect()
      return element.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })
        && element.getClientRects().length > 0
        && rect.width > 0
        && rect.height > 0
    }

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
      hiddenExperienceCards: experienceCards
        .filter((card) => !isMeaningfullyVisible(card))
        .map((card) => card.getAttribute('data-experience-id')),
      unreadyExperienceContent: experienceCards.flatMap((card) =>
        [...card.querySelectorAll('*')].filter((element) => {
          const hasDirectText = [...element.childNodes].some(
            (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
          )
          const isMedia = element.matches('img, picture, video, svg, canvas')
          return (hasDirectText || isMedia) && !isMeaningfullyVisible(element)
        }).map((element) => ({
          card: card.getAttribute('data-experience-id'),
          tag: element.tagName,
          text: normalizeText(element.textContent).slice(0, 80),
        })),
      ),
      overflow: document.documentElement.scrollWidth - innerWidth,
      brokenImages: [...document.images].filter((image) =>
        !image.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0,
      ).length,
      headerTitleOverlap: overlap,
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })
}
