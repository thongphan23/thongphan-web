import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const engine = read('components/motion/engine.ts')
const kernel = read('components/motion/MotionKernel.tsx')
const motionCss = read('styles/motion.css')
const layout = read('app/layout.tsx')
const pkg = JSON.parse(read('package.json'))

test('the motion engine is loaded on demand and never under reduced motion', () => {
  assert.match(kernel, /import\('\.\/engine'\)/)
  assert.doesNotMatch(kernel, /^import .*from '\.\/engine'/m)
  assert.match(kernel, /prefers-reduced-motion: reduce/)
  assert.match(kernel, /querySelector<HTMLElement>\('\[data-motion-stage\]'\)/)
  // Pre-paint opt-in with a timed fallback, so content is never stuck hidden.
  assert.match(layout, /prefers-reduced-motion: reduce/)
  assert.match(layout, /data-motion-ready/)
})

test('pointer-only effects stay behind the fine-pointer query', () => {
  assert.match(engine, /FINE_POINTER = '\(hover: hover\) and \(pointer: fine\)'/)
  assert.match(engine, /if \(finePointer\) extra\.push\(magnetic\(root\), tilt\(root\), depth\(root\), hoverReveal\(root\)\)/)
  assert.match(engine, /if \(finePointer\) startCursor\(\)/)
})

test('the engine exposes the scroll and hover vocabulary the pages use', () => {
  for (const hook of [
    '[data-split]',
    '[data-scrub-words]',
    '[data-img-reveal]',
    '[data-reveal-media]',
    '[data-scroll-out]',
    '[data-hscroll]',
    '[data-marquee]',
    '[data-velocity-skew]',
    '[data-hover-reveal]',
    '[data-hover-float]',
    '[data-count]',
    '[data-draw-line]',
  ]) {
    assert.ok(engine.includes(hook), hook)
  }
  // Horizontal pinning only on wide screens; phones keep native swipe.
  assert.match(engine, /DESKTOP = '\(min-width: 900px\)'/)
})

test('the CSS intro runs only with motion on and reduced motion off', () => {
  assert.match(motionCss, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*html\.motion \.intro-word > span/)
  assert.match(motionCss, /animation-delay: calc\([^)]*var\(--i, 0\)/)
  assert.match(motionCss, /\.intro-word\s*\{[^}]*overflow: clip/)
})

test('motion dependencies are pinned to audited exact versions', () => {
  assert.equal(pkg.dependencies.gsap, '3.15.0')
  assert.equal(pkg.dependencies.lenis, '1.3.26')
})
