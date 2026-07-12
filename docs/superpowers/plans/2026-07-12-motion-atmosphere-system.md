# Motion Atmosphere System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add persistent navigation and a balanced, route-aware system of ambient light, pointer response, hover depth and GSAP scroll motion without reducing readability, accessibility or performance.

**Architecture:** Mount one `MotionAtmosphere` client component inside the unified `SiteChrome`, and drive visual state through route profiles, data attributes and CSS custom properties. Keep header compaction inside `SiteHeader`; keep page-specific motion opt-in through semantic data attributes; extend the existing `ScrollAnimations` owner to reuse GSAP and `ScrollTrigger` for bounded reveal/parallax behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP 3.15 with ScrollTrigger, Node test runner, Playwright/Browser runtime, Cloudflare Pages.

## Global Constraints

- Selected intensity is balanced: visible motion in the first viewport, but no effect may compete with copy or actions.
- No WebGL, canvas, autoplay background video or new animation dependency.
- Dark routes may use projector light; long-form reading bodies may not.
- Pointer response runs only for fine pointers and is throttled with `requestAnimationFrame`.
- Continuous animation may change only transform, opacity, filter intensity and CSS custom properties.
- Pointer tilt is capped at 1 degree; image scale is capped at 1.02; parallax displacement is capped at 18px desktop and zero mobile.
- `prefers-reduced-motion: reduce` disables ambient travel, pointer tracking, parallax, tilt, auto-moving rails and nonessential reveal motion.
- Decorative layers are `pointer-events: none`, assistive-technology hidden and below content/actions.
- Existing hero face crops, fixed-header safe zones, mobile menu behavior, truthful film gate and reading content are preserved.

## File structure

- Create `components/site-chrome/MotionAtmosphere.tsx`: one client owner for pointer capability, visibility pause and CSS coordinate updates.
- Create `components/site-chrome/motion-profile.ts`: pure route-to-motion-profile contract.
- Create `scripts/motion-atmosphere-contract.test.ts`: pure profile and source contracts.
- Modify `components/site-chrome/SiteChrome.tsx`: mount the atmosphere and expose homepage/route attributes.
- Modify `components/site-chrome/SiteHeader.tsx`: expose compact state without changing mobile-menu or chapter-observer ownership.
- Modify `components/site-chrome/SiteChrome.module.css`: persistent header, atmosphere layers, shared interaction physics and route-safe spacing.
- Modify `components/ScrollAnimations.tsx`: GSAP/ScrollTrigger reveal variants and bounded parallax with teardown.
- Modify `components/home-cinema/HomeCinema.tsx`, `components/home-cinema/ProofContactSheet.tsx`, `components/journey/ChapterHandoff.tsx`, `app/library/page.tsx`, and `app/about/page.tsx`: opt in only approved surfaces.
- Modify `scripts/site-chrome-contract.test.ts` and `scripts/homepage-cinematic-contract.test.mjs`: fixed-header and layer-safety regressions.
- Modify `package.json`: add the new motion contract test to `npm test`.
- Modify `docs/STATUS.md`: phase, verification and production evidence.

---

### Task 1: Route profiles and atmosphere capability boundary

**Files:**
- Create: `components/site-chrome/motion-profile.ts`
- Create: `scripts/motion-atmosphere-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `motionProfileForPath(pathname: string, mode: SiteRouteMode): MotionProfile`
- Produces: `MotionProfile = { ambient: 'full' | 'restrained' | 'none'; pointer: 'full' | 'interactive' | 'none'; scroll: 'full' | 'medium' | 'minimal' }`
- Consumes: `SiteRouteMode` from `lib/site-route-mode.ts`

- [ ] **Step 1: Write the failing route-profile contract**

```ts
test('motion profiles keep reading calm and dark cinema alive', () => {
  assert.deepEqual(motionProfileForPath('/', 'cinema-dark'), {
    ambient: 'full', pointer: 'full', scroll: 'full',
  })
  assert.deepEqual(motionProfileForPath('/library', 'editorial-light'), {
    ambient: 'restrained', pointer: 'interactive', scroll: 'medium',
  })
  assert.deepEqual(
    motionProfileForPath('/library/read/steve-jobs-2005-stanford-commencement-address', 'editorial-light'),
    { ambient: 'none', pointer: 'interactive', scroll: 'minimal' },
  )
})
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts`

Expected: FAIL because `motion-profile.ts` does not exist.

- [ ] **Step 3: Implement the pure profile mapping**

```ts
import type { SiteRouteMode } from '@/lib/site-route-mode'

export type MotionProfile = {
  ambient: 'full' | 'restrained' | 'none'
  pointer: 'full' | 'interactive' | 'none'
  scroll: 'full' | 'medium' | 'minimal'
}

export function motionProfileForPath(pathname: string, mode: SiteRouteMode): MotionProfile {
  if (pathname.startsWith('/library/read/') || pathname.startsWith('/blog/')) {
    return { ambient: 'none', pointer: 'interactive', scroll: 'minimal' }
  }
  if (pathname === '/') return { ambient: 'full', pointer: 'full', scroll: 'full' }
  if (mode === 'editorial-light') {
    return { ambient: 'restrained', pointer: 'interactive', scroll: 'medium' }
  }
  return { ambient: 'restrained', pointer: 'interactive', scroll: 'medium' }
}
```

- [ ] **Step 4: Add the test file to the `npm test` command and run it**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts`

Expected: all profile assertions PASS.

- [ ] **Step 5: Commit the profile boundary**

```bash
git add components/site-chrome/motion-profile.ts scripts/motion-atmosphere-contract.test.ts package.json
git commit -m "test: define route motion profiles"
```

### Task 2: Persistent header with safe layout reservation

**Files:**
- Modify: `components/site-chrome/SiteHeader.tsx`
- Modify: `components/site-chrome/SiteChrome.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `scripts/site-chrome-contract.test.ts`

**Interfaces:**
- Produces: `data-header-scrolled="true|false"` on `.cinemaHeader`
- Produces: `data-homepage="true|false"` on `.siteShell`
- Preserves: chapter `IntersectionObserver`, mobile focus trap, Escape and focus restoration

- [ ] **Step 1: Add failing source contracts for fixed positioning and safe offsets**

```ts
assert.match(header, /data-header-scrolled=\{scrolled\}/)
assert.match(header, /window\.addEventListener\('scroll',[\s\S]*?passive:\s*true/)
assert.match(chrome, /data-homepage=\{pathname === '\/'\}/)
assert.match(chromeCss, /\.cinemaHeader\s*\{[\s\S]*?position:\s*fixed/)
assert.match(chromeCss, /\.siteShell\[data-homepage='false'\][\s\S]*?\.cinemaMain\s*\{[\s\S]*?padding-top:/)
```

- [ ] **Step 2: Run the focused contract and verify it fails**

Run: `node --import tsx --test scripts/site-chrome-contract.test.ts`

Expected: FAIL on absent header state and desktop fixed-header CSS.

- [ ] **Step 3: Add requestAnimationFrame-throttled compact state to `SiteHeader`**

```tsx
const [scrolled, setScrolled] = useState(false)

useEffect(() => {
  let frame = 0
  const update = () => {
    frame = 0
    setScrolled(window.scrollY > 24)
  }
  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(update)
  }
  update()
  window.addEventListener('scroll', schedule, { passive: true })
  return () => {
    window.removeEventListener('scroll', schedule)
    if (frame) window.cancelAnimationFrame(frame)
  }
}, [])

return <header className={styles.cinemaHeader} data-route-mode={mode} data-header-scrolled={scrolled}>
```

- [ ] **Step 4: Expose homepage state from `SiteChrome`**

```tsx
<div
  className={`${styles.siteShell} ${isUnified ? '' : legacyFontClassName}`}
  data-route-mode={mode}
  data-site-shell={isUnified ? 'unified' : 'legacy'}
  data-homepage={pathname === '/'}
>
```

- [ ] **Step 5: Make the header fixed and reserve route-specific space**

```css
.cinemaHeader {
  backdrop-filter: blur(16px) saturate(1.08);
  background: rgba(7, 7, 6, 0.68);
  position: fixed;
  transition: background-color 220ms var(--brand-motion-ease), box-shadow 220ms var(--brand-motion-ease);
}

.cinemaHeader[data-header-scrolled='true'] {
  background: rgba(7, 7, 6, 0.94);
  box-shadow: 0 1px rgba(224, 75, 67, 0.25), 0 18px 44px rgba(0, 0, 0, 0.22);
}

.siteShell[data-site-shell='unified'][data-homepage='false'] .cinemaMain {
  padding-top: 82px;
}

.siteShell[data-route-mode='editorial-light'][data-homepage='false'] .cinemaMain {
  padding-top: 96px;
}
```

Add mobile overrides to reserve exactly `64px`; keep the homepage at `0` because its verified hero safe zone already clears the two-row fixed header.

- [ ] **Step 6: Run focused contracts and a static build**

Run: `node --import tsx --test scripts/site-chrome-contract.test.ts scripts/homepage-cinematic-contract.test.mjs && npm run build`

Expected: contracts PASS and 61 static pages generate.

- [ ] **Step 7: Commit persistent navigation**

```bash
git add components/site-chrome/SiteHeader.tsx components/site-chrome/SiteChrome.tsx components/site-chrome/SiteChrome.module.css scripts/site-chrome-contract.test.ts
git commit -m "feat: pin unified cinema navigation"
```

### Task 3: Shared ambient and pointer-light runtime

**Files:**
- Create: `components/site-chrome/MotionAtmosphere.tsx`
- Modify: `components/site-chrome/SiteChrome.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `scripts/motion-atmosphere-contract.test.ts`

**Interfaces:**
- Consumes: `pathname`, `mode`, `motionProfileForPath`
- Produces: `data-ambient`, `data-pointer`, `data-scroll-motion`, `data-motion-active`, `data-page-visible`
- Produces CSS variables: `--pointer-x`, `--pointer-y`

- [ ] **Step 1: Add failing contracts for capability guards and cleanup**

```ts
assert.match(source, /matchMedia\('\(prefers-reduced-motion:\s*reduce\)'\)/)
assert.match(source, /matchMedia\('\(hover:\s*hover\) and \(pointer:\s*fine\)'\)/)
assert.match(source, /requestAnimationFrame/)
assert.match(source, /visibilitychange/)
assert.match(source, /removeEventListener\('pointermove'/)
assert.match(source, /aria-hidden="true"/)
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts`

Expected: FAIL because `MotionAtmosphere.tsx` is absent.

- [ ] **Step 3: Implement the single pointer/visibility owner**

```tsx
'use client'

type Props = {
  pathname: string
  mode: SiteRouteMode
}

export default function MotionAtmosphere({ pathname, mode }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const profile = motionProfileForPath(pathname, mode)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    let frame = 0
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    const paint = () => {
      frame = 0
      root.style.setProperty('--pointer-x', `${x}px`)
      root.style.setProperty('--pointer-y', `${y}px`)
    }
    const move = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (!frame) frame = window.requestAnimationFrame(paint)
    }
    const sync = () => {
      const active = !reduced.matches && fine.matches && profile.pointer !== 'none'
      root.dataset.motionActive = String(active)
      window[active ? 'addEventListener' : 'removeEventListener']('pointermove', move, { passive: true })
    }
    const visibility = () => { root.dataset.pageVisible = String(!document.hidden) }
    sync()
    visibility()
    reduced.addEventListener('change', sync)
    fine.addEventListener('change', sync)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('pointermove', move)
      reduced.removeEventListener('change', sync)
      fine.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', visibility)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [profile.pointer])

  return <div ref={rootRef} className={styles.motionAtmosphere} data-ambient={profile.ambient} data-pointer={profile.pointer} data-scroll-motion={profile.scroll} aria-hidden="true"><span /><span /><span /></div>
}
```

Implement listener attachment with an explicit boolean guard so repeated media-query changes never duplicate the listener.

- [ ] **Step 4: Mount once inside unified `SiteChrome`**

```tsx
{isUnified ? <MotionAtmosphere pathname={pathname} mode={mode} /> : null}
```

Place it before `SiteHeader`; keep `.cinemaMain`, header, dialogs and footer above it through the documented layer contract.

- [ ] **Step 5: Add restrained projector-beam, bloom and grain CSS**

```css
.motionAtmosphere {
  inset: 0;
  overflow: clip;
  pointer-events: none;
  position: fixed;
  z-index: 0;
}

.motionAtmosphere[data-ambient='full'] > :first-child {
  animation: projectorSweep 20s ease-in-out infinite alternate;
  background: linear-gradient(112deg, transparent 35%, rgba(232, 223, 207, 0.07) 48%, rgba(224, 75, 67, 0.045) 54%, transparent 68%);
  filter: blur(24px);
}

.motionAtmosphere[data-motion-active='true']::after {
  background: radial-gradient(420px circle at var(--pointer-x) var(--pointer-y), rgba(224, 75, 67, 0.09), transparent 68%);
}
```

Set `animation-play-state: paused` when `data-page-visible='false'`. Set animation to `none` for `data-ambient='none'`, coarse pointers and reduced motion.

- [ ] **Step 6: Run the focused contract, typecheck and bundle gate**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts && npx tsc --noEmit && npm run test:bundle`

Expected: all commands exit 0; no new dependency appears.

- [ ] **Step 7: Commit the shared atmosphere**

```bash
git add components/site-chrome/MotionAtmosphere.tsx components/site-chrome/SiteChrome.tsx components/site-chrome/SiteChrome.module.css scripts/motion-atmosphere-contract.test.ts
git commit -m "feat: add balanced cinema atmosphere"
```

### Task 4: Opt-in hover and focus physics

**Files:**
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `components/home-cinema/HomeCinema.tsx`
- Modify: `components/home-cinema/ProofContactSheet.tsx`
- Modify: `components/journey/ChapterHandoff.tsx`
- Modify: `app/library/page.tsx`
- Modify: `app/about/page.tsx`
- Modify: `scripts/motion-atmosphere-contract.test.ts`

**Interfaces:**
- Consumes: `data-motion-surface`, `data-motion-action`
- Preserves: native link/button semantics and focus rings

- [ ] **Step 1: Add failing opt-in and accessibility contracts**

```ts
for (const source of [home, proof, handoff, library, about]) {
  assert.match(source, /data-motion-(?:surface|action)/)
}
assert.match(css, /\[data-motion-action\]:focus-visible/)
assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/)
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
assert.doesNotMatch(css, /scale\((?:1\.0[3-9]|1\.[1-9])/)
```

- [ ] **Step 2: Run the focused contract and verify missing opt-ins fail**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts`

Expected: FAIL for source files without semantic attributes.

- [ ] **Step 3: Mark only approved actions and surfaces**

Apply `data-motion-action` to homepage primary CTA, library primary CTA, chapter-handoff links and About inline CTA. Apply `data-motion-surface` to proof cards, homepage path rows, library featured/archive items/current-state articles and About portrait/proof cards. Do not mark article prose, forms or reading-body containers.

Example:

```tsx
<Link href={entry.href} className={styles.laneItem} data-motion-surface>
```

- [ ] **Step 4: Implement shared light sweep and bounded depth**

```css
[data-motion-action],
[data-motion-surface] {
  isolation: isolate;
  position: relative;
}

[data-motion-action]::after {
  background: linear-gradient(105deg, transparent 28%, rgba(255,255,255,0.2) 48%, transparent 68%);
  content: '';
  inset: 0;
  pointer-events: none;
  position: absolute;
  transform: translateX(-120%);
  transition: transform 420ms var(--brand-motion-ease);
}

@media (hover: hover) and (pointer: fine) {
  [data-motion-action]:hover::after,
  [data-motion-action]:focus-visible::after { transform: translateX(120%); }
  [data-motion-surface]:hover { transform: translateY(-3px); }
  [data-motion-surface]:hover img { transform: scale(1.02); }
}
```

Keep existing component-specific transforms where they are more specific; compose instead of overriding focus styles.

- [ ] **Step 5: Add reduced-motion and touch fallbacks**

```css
@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  [data-motion-action]::after { display: none; }
  [data-motion-surface], [data-motion-surface] img { transform: none !important; transition-duration: 0.01ms !important; }
}
```

- [ ] **Step 6: Run contracts and focused page tests**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts scripts/homepage-cinematic-contract.test.mjs scripts/chapter-handoff-contract.test.mjs scripts/library-hub-contract.test.mjs`

Expected: all tests PASS; no selector removes the existing focus outline.

- [ ] **Step 7: Commit interaction physics**

```bash
git add components/site-chrome/SiteChrome.module.css components/home-cinema/HomeCinema.tsx components/home-cinema/ProofContactSheet.tsx components/journey/ChapterHandoff.tsx app/library/page.tsx app/about/page.tsx scripts/motion-atmosphere-contract.test.ts
git commit -m "feat: add opt-in cinema interaction physics"
```

### Task 5: GSAP reveal variants and shallow parallax

**Files:**
- Modify: `components/ScrollAnimations.tsx`
- Modify: `components/home-cinema/HomeCinema.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `scripts/motion-atmosphere-contract.test.ts`

**Interfaces:**
- Consumes: `data-motion-reveal="mask|fade|drift"`, `data-motion-parallax`, `data-scroll-motion`
- Produces: GSAP contexts and ScrollTriggers scoped to the current document and killed on cleanup

- [ ] **Step 1: Add failing GSAP, variant and teardown contracts**

```ts
assert.match(scrollSource, /import\('gsap'\)/)
assert.match(scrollSource, /import\('gsap\/ScrollTrigger'\)/)
assert.match(scrollSource, /ScrollTrigger\.create/)
assert.match(scrollSource, /context\.revert\(\)/)
assert.match(scrollSource, /trigger\.kill\(\)/)
assert.match(homeSource, /data-motion-parallax/)
```

- [ ] **Step 2: Run the focused contract and verify it fails**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts`

Expected: FAIL because the current Web Animations owner has no GSAP/ScrollTrigger path.

- [ ] **Step 3: Extend `ScrollAnimations` with lazy GSAP initialization**

```tsx
const [{ gsap }, { ScrollTrigger }] = await Promise.all([
  import('gsap'),
  import('gsap/ScrollTrigger'),
])
gsap.registerPlugin(ScrollTrigger)
const context = gsap.context(() => {
  document.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach((target) => {
    const variant = target.dataset.motionReveal
    const from = variant === 'drift'
      ? { opacity: 0, x: 28 }
      : variant === 'mask'
        ? { opacity: 0, clipPath: 'inset(0 0 100% 0)' }
        : { opacity: 0.25 }
    gsap.fromTo(target, from, {
      opacity: 1, x: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.72,
      ease: 'power3.out', scrollTrigger: { trigger: target, start: 'top 88%', once: true },
    })
  })
})
```

Store explicit parallax triggers and clean up with both `context.revert()` and `trigger.kill()`. If reduced motion matches, skip imports and force final visible styles.

- [ ] **Step 4: Add bounded parallax only to approved hero/evidence media**

```tsx
<div className={styles.heroPhoto} data-motion-parallax data-parallax-max="18">
```

Use `gsap.to(target, { y: 18, ease: 'none', scrollTrigger: { scrub: 0.6, ... } })`; do not change width, height, object-position or crop properties.

- [ ] **Step 5: Assign varied reveal attributes**

Use `mask` for major headings, `fade` for proof/evidence blocks and `drift` for selected path/handoff groups. Keep route profile `minimal` limited to media and headings; do not animate reading paragraphs.

- [ ] **Step 6: Run focused tests, typecheck and build**

Run: `node --import tsx --test scripts/motion-atmosphere-contract.test.ts scripts/homepage-cinematic-contract.test.mjs && npx tsc --noEmit && npm run build`

Expected: tests and typecheck exit 0; 61 pages generate; reduced-motion branch does not import or initialize GSAP.

- [ ] **Step 7: Commit scroll choreography**

```bash
git add components/ScrollAnimations.tsx components/home-cinema/HomeCinema.tsx components/site-chrome/SiteChrome.module.css scripts/motion-atmosphere-contract.test.ts
git commit -m "feat: choreograph cinema scroll motion"
```

### Task 6: Full verification, production release and documentation

**Files:**
- Modify: `docs/STATUS.md`
- Create: `/tmp/thongphan-motion-atmosphere-qa/*.png` and `/tmp/thongphan-motion-atmosphere-qa/report.json` outside the repo

**Interfaces:**
- Consumes: completed tasks 1–5
- Produces: deployment ID, custom-domain smoke evidence and final pass/fail status

- [ ] **Step 1: Run fresh local verification**

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:release
npm run test:read-release-safety
git diff --check
```

Expected: zero failures; 61 static pages; release 10/10; Read safety 3/3.

- [ ] **Step 2: Run Browser-first rendered QA**

The flow under test is: homepage loads → fixed header remains available while scrolling → active chapter changes → ambient/pointer/hover effects respond → CTA opens diagnostic; library opens → motion is restrained → reading detail opens with a calm body; reduced-motion disables nonessential movement.

Check these routes at `1440x900`, `1280x720`, `390x844`, and `320x568`:

- `/`
- `/library`
- `/library/read/steve-jobs-2005-stanford-commencement-address`
- `/about`
- `/diagnostic`

Measure header visibility at top/middle/footer, header/content separation, horizontal overflow, hero text/menu/film intersections, face bounding boxes, focus outlines, pointer hit targets and console warnings/errors.

- [ ] **Step 3: Verify motion capability branches**

- Fine pointer: pointer variables change and interactive light is visible.
- Coarse pointer: no pointer listener behavior or tilt.
- Reduced motion: ambient animation name is `none`, transforms remain final, rail does not auto-run and navigation still works.
- Hidden page: atmosphere exposes `data-page-visible='false'` and ambient play state pauses.

- [ ] **Step 4: Record local evidence in `docs/STATUS.md` and commit**

```bash
git add docs/STATUS.md
git commit -m "docs: record motion atmosphere verification"
```

- [ ] **Step 5: Deploy the verified static export to the production branch**

First verify current Wrangler syntax from official Cloudflare documentation and `npx wrangler --version`. Then run:

```bash
SOURCE_COMMIT=$(git rev-parse --short HEAD)
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash "$SOURCE_COMMIT" --commit-message "feat: release motion atmosphere" --commit-dirty=true
```

Expected: Wrangler reports a new Pages deployment URL and `pages deployment list` reports `Production`, branch `main`, and the source commit.

- [ ] **Step 6: Smoke the Pages origin and custom domain**

Repeat the desktop-short, mobile and reduced-motion target flows on both the deployment origin and `https://thongphan.com`. Require zero collisions/overflow/relevant console errors and keyboard activation of the primary CTA.

- [ ] **Step 7: Record the deployment and push source**

Update `docs/STATUS.md` with deployment ID, source commit, URLs and production smoke evidence, commit the status update, then run:

```bash
git push origin main:master
```

Expected: remote `master` resolves to the final documentation commit and production remains on the verified implementation source commit.

## Plan self-review

- Spec coverage: persistent navigation, route intensity, ambient light, pointer capability, hover/focus physics, GSAP choreography, reduced motion, progressive enhancement, performance limits and deployment evidence each map to a task.
- Placeholder scan: no `TBD`, `TODO`, “implement later”, unresolved function name or unspecified test command remains.
- Type consistency: `MotionProfile`, `motionProfileForPath`, `data-ambient`, `data-pointer`, `data-scroll-motion`, `data-motion-action`, `data-motion-surface`, `data-motion-reveal` and `data-motion-parallax` are defined once and used consistently.
- Scope boundary: no copy redesign, WebGL, cursor replacement, fabricated proof, Learn release or reading-body animation is included.
