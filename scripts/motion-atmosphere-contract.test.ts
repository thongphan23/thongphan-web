import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { motionProfileForPath } from '../components/site-chrome/motion-profile'

const root = new URL('../', import.meta.url)

async function readProjectFile(path: string) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
}

test('motion profiles keep reading calm and dark cinema alive', () => {
  assert.deepEqual(motionProfileForPath('/', 'cinema-dark'), {
    ambient: 'full',
    pointer: 'full',
    scroll: 'full',
  })
  assert.deepEqual(motionProfileForPath('/library', 'editorial-light'), {
    ambient: 'restrained',
    pointer: 'interactive',
    scroll: 'medium',
  })
  assert.deepEqual(
    motionProfileForPath(
      '/library/read/steve-jobs-2005-stanford-commencement-address',
      'editorial-light',
    ),
    { ambient: 'none', pointer: 'interactive', scroll: 'minimal' },
  )
  assert.deepEqual(motionProfileForPath('/blog/ai-khong-cuop-viec-ban', 'editorial-light'), {
    ambient: 'none',
    pointer: 'interactive',
    scroll: 'minimal',
  })
})

test('motion atmosphere has one guarded pointer runtime with teardown', async () => {
  const [source, css] = await Promise.all([
    readProjectFile('components/site-chrome/MotionAtmosphere.tsx'),
    readProjectFile('components/site-chrome/SiteChrome.module.css'),
  ])

  assert.match(source, /matchMedia\('\(prefers-reduced-motion:\s*reduce\)'\)/)
  assert.match(source, /matchMedia\('\(hover:\s*hover\) and \(pointer:\s*fine\)'\)/)
  assert.match(source, /requestAnimationFrame/)
  assert.match(source, /visibilitychange/)
  assert.match(source, /removeEventListener\('pointermove'/)
  assert.match(source, /aria-hidden="true"/)
  assert.match(source, /data-page-visible/)
  assert.match(
    css,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.motionAtmosphere > span:first-child[\s\S]*?animation:\s*none !important/,
  )
  assert.match(
    css,
    /\.motionAtmosphere\[data-ambient='none'\] > span:first-child[\s\S]*?animation:\s*none !important/,
  )
})

test('approved actions and surfaces opt into bounded hover and focus physics', async () => {
  const [home, proof, handoff, library, about, css] = await Promise.all([
    readProjectFile('components/home-cinema/HomeCinema.tsx'),
    readProjectFile('components/home-cinema/ProofContactSheet.tsx'),
    readProjectFile('components/journey/ChapterHandoff.tsx'),
    readProjectFile('app/library/page.tsx'),
    readProjectFile('app/about/page.tsx'),
    readProjectFile('components/site-chrome/SiteChrome.module.css'),
  ])

  assert.match(home, /data-motion-action/)
  assert.match(home, /data-motion-surface/)
  assert.match(proof, /data-motion-surface/)
  assert.match(handoff, /data-motion-action/)
  assert.match(handoff, /data-motion-surface/)
  assert.match(library, /data-motion-action/)
  assert.match(library, /data-motion-surface/)
  assert.match(about, /data-motion-action/)
  assert.match(about, /data-motion-surface/)
  assert.match(css, /\[data-motion-action\]:focus-visible/)
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /\[data-motion-surface\]:hover img\s*\{[\s\S]*?scale\(1\.02\)/)
})

test('GSAP scroll choreography is lazy, bounded, varied and reversible', async () => {
  const [scrollSource, homeSource, librarySource, aboutSource, handoffSource] = await Promise.all([
    readProjectFile('components/ScrollAnimations.tsx'),
    readProjectFile('components/home-cinema/HomeCinema.tsx'),
    readProjectFile('app/library/page.tsx'),
    readProjectFile('app/about/page.tsx'),
    readProjectFile('components/journey/ChapterHandoff.tsx'),
  ])

  assert.match(scrollSource, /import\('gsap'\)/)
  assert.match(scrollSource, /import\('gsap\/ScrollTrigger'\)/)
  assert.match(scrollSource, /ScrollTrigger\.create/)
  assert.match(scrollSource, /context\.revert\(\)/)
  assert.match(scrollSource, /trigger\.kill\(\)/)
  assert.match(scrollSource, /Math\.min\(18,/)
  assert.match(homeSource, /data-motion-parallax/)
  assert.match(homeSource, /data-motion-reveal="mask"/)
  assert.match(homeSource, /data-motion-reveal="drift"/)
  assert.match(librarySource, /data-motion-reveal=/)
  assert.match(aboutSource, /data-motion-reveal=/)
  assert.match(handoffSource, /data-motion-reveal=/)
})
