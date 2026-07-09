# Thông Phan Evidence Cinema Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Knowledge Garden homepage with the approved Evidence Cinema experience while preserving all non-homepage routes and making the static `/conanmaker` route reproducible.

**Architecture:** Keep the Next.js App Router and static export. A route-aware `SiteChrome` owns the homepage and subpage chrome variants; a server-rendered `HomeCinema` composes the six acts, while two small client islands own the mobile menu and three-question mirror. Typed content and pure routing logic live outside React so they can be tested without a browser. Existing GSAP remains optional progressive enhancement; the page is fully visible and usable without it.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, `next/font`, native HTML/CSS/IntersectionObserver/View Transitions, existing GSAP 3, Node test runner through `tsx`, Browser/IAB for rendered QA.

## Global Constraints

- Use the approved visual target at `docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`.
- Use exactly Cormorant Garamond and Be Vietnam Pro on the homepage.
- Use `#070706`, `#12100F`, `#E8DFCF`, `#A69E92`, `#B3231B`, and `#E04B43`; no gold, green, blue, garden, island, cloud, orb, glass-card, or bento-grid motif.
- The hero must show the real `/images/homepage/thong-stage-anchor.jpg`; do not generate a stand-in.
- Only sourced proof is rendered. If a third proof cannot be sourced, render two.
- Do not add a new dependency, state manager, animation library, CMS, backend, or hero video.
- Essential content must render before JavaScript and remain visible if GSAP or View Transitions are unavailable.
- The mobile menu must trap focus, close on Escape, restore trigger focus, and provide 44px targets.
- The mirror stores no personal data. Question 2 selects the result; question 1 personalizes the explanation; question 3 selects the destination.
- Preserve the current user-owned untracked `public/_redirects` and `public/conanmaker/` files before modifying or committing any static route input.
- Do not deploy production in this plan. Produce a reproducible, verified local release candidate and a cache-safe deployment contract.

## Scope

- Homepage information architecture, copy, visual system, responsive behavior, motion and interaction.
- Route-aware homepage/subpage header and footer.
- Three-question mirror with deterministic result and link.
- Real two-item proof rail with truthful source notes.
- Static Conan Maker route reconciliation and fingerprinted-asset integrity checks.
- Automated tests, static build, Browser/IAB behavior QA, screenshot fidelity QA and design QA report.

## Non-goals

- Redesigning `/conanmaker`, pricing, refund terms, blog/library/detail pages, or backend APIs.
- Adding analytics transport before an approved analytics provider exists; emit typed browser events only.
- Inventing testimonials, metrics, verification badges, or claims.
- Committing obsolete static Conan Maker assets that are not referenced by the captured live page.

## Acceptance Criteria

- `npm test` and `npm run build` exit 0.
- `/` implements all six acts, the selected first-viewport composition, one semantic `h1`, working anchor navigation, mirror, proof links, path selection and Conan handoff.
- `/blog` and other subpages retain the existing functional chrome.
- `/conanmaker/` is present in `out/`, and every local `/conanmaker/assets/*` reference in built HTML exists.
- Desktop 1440×1024, laptop 1280×720, tablet 834×1194, mobile 390×844 and 375×812 have no horizontal overflow or clipped primary action.
- Mobile menu and mirror complete by keyboard; reduced-motion mode exposes final states without blur/scrub/parallax.
- `design-qa.md` exists at the repo root with `final result: passed`.
- The latest implementation screenshot and approved mock have both been inspected through `view_image`; remaining differences are only documented, intentional deviations.

---

### Task 0: Reconcile the live static Conan Maker source before homepage edits

**Files:**
- Preserve: `public/_redirects`
- Preserve and reconcile: `public/conanmaker/index.html`
- Preserve and reconcile: `public/conanmaker/assets/*`
- Create: `scripts/static-route-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current live `https://thongphan.com/conanmaker/` HTML and the existing untracked local bundle.
- Produces: a committed local static route whose referenced asset paths are complete; test `static Conan Maker bundle references only present local assets`.

- [ ] **Step 1: Capture and preserve the current inputs**

Run:

```bash
stamp=$(date +%Y%m%d-%H%M%S)
mkdir -p "/tmp/thongphan-com-$stamp"
cp -R public/_redirects public/conanmaker "/tmp/thongphan-com-$stamp/"
curl -fsSL https://thongphan.com/conanmaker/ -o "/tmp/thongphan-com-$stamp/live-conanmaker.html"
```

Expected: backup directory contains the two local inputs and the current live HTML. No repo file changes.

- [ ] **Step 2: Write the failing static-route integrity test**

Create `scripts/static-route-contract.test.mjs`:

```js
import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('static Conan Maker bundle references only present local assets', async () => {
  const html = await readFile(new URL('public/conanmaker/index.html', root), 'utf8')
  const refs = [...html.matchAll(/(?:src|href)="(\/conanmaker\/assets\/[^"]+)"/g)].map(([, ref]) => ref)
  assert.ok(refs.length >= 2, 'expected fingerprinted JS and CSS references')
  for (const ref of refs) {
    await access(new URL(`public${ref}`, root))
  }
})

test('static redirects preserve the canonical trailing slash', async () => {
  const redirects = await readFile(new URL('public/_redirects', root), 'utf8')
  assert.match(redirects, /^\/conanmaker \/conanmaker\/ 301$/m)
})
```

Modify `package.json` test script to:

```json
"test": "tsx --test scripts/generate-library-data.test.mjs scripts/homepage-cinematic-contract.test.mjs scripts/static-route-contract.test.mjs scripts/home-cinema-content.test.ts"
```

- [ ] **Step 3: Run the static route test and verify RED if live and local inputs differ**

Run: `npx tsx --test scripts/static-route-contract.test.mjs`

Expected: either the captured local bundle passes unchanged, or FAIL names a missing referenced asset. A passing test is acceptable only after confirming the live HTML references the same fingerprinted names as local with `diff -u`.

- [ ] **Step 4: Import only the current live HTML and referenced fingerprinted assets**

Parse `live-conanmaker.html`, download only its local `/conanmaker/assets/*` JS/CSS/image files, keep old unreferenced user files in the backup, and ensure the committed `index.html` points at new immutable filenames. Never replace bytes under an existing fingerprint.

- [ ] **Step 5: Verify GREEN and commit the source reconciliation**

Run:

```bash
npx tsx --test scripts/static-route-contract.test.mjs
git add package.json scripts/static-route-contract.test.mjs public/_redirects public/conanmaker/index.html public/conanmaker/assets
git commit -m "chore: make Conan Maker static route reproducible"
```

Expected: 2 tests pass; `git status --short` contains no loss of the backed-up user inputs.

### Task 1: Lock the Evidence Cinema contract with failing tests

**Files:**
- Modify: `scripts/homepage-cinematic-contract.test.mjs`
- Create: `scripts/home-cinema-content.test.ts`
- Create later in GREEN: `components/home-cinema/home-cinema-content.ts`

**Interfaces:**
- Produces: `resolveMirrorResult(answers: MirrorAnswers): MirrorResult`, `proofItems`, `pathItems`, and source-level visual/accessibility contracts.

- [ ] **Step 1: Replace the old garden contract with the approved homepage contract**

The contract must read `app/page.tsx`, `app/layout.tsx`, `components/home-cinema/HomeCinema.tsx`, `components/home-cinema/HomeCinema.module.css`, `components/site-chrome/SiteChrome.tsx`, and `styles/globals.css`; assert the exact hero promise, CTA, six act IDs, approved asset paths, mobile menu semantics, reduced-motion query, and palette; ban `Knowledge Garden`, `garden`, `Brain2`, `ACV`, hero `<video>`, unsupported numeric proof, and the old `data-theme="premium-garden"`.

Core assertions:

```js
for (const required of [
  'Biến chuyên môn thật thành tài sản có người muốn dùng.',
  'Từ trải nghiệm thật đến cộng đồng trả phí',
  'Khám phá lộ trình của bạn',
  'id="story"', 'id="proof"', 'id="method"', 'id="paths"', 'id="conan"',
  'thong-stage-anchor.jpg', 'thong-library-author.jpg',
]) assert.match(home, escaped(required))

for (const banned of ['Knowledge Garden', 'premium-garden', 'Brain2', 'ACV Framework', '<video']) {
  assert.doesNotMatch(combinedHomepageSource, escaped(banned))
}

assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
assert.match(css, /--cinema-ink:\s*#070706/i)
assert.match(chrome, /aria-expanded/)
assert.match(chrome, /Escape/)
```

- [ ] **Step 2: Write mirror behavior tests before the implementation exists**

Create `scripts/home-cinema-content.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveMirrorResult } from '../components/home-cinema/home-cinema-content'

test('question two selects the result category', () => {
  assert.equal(resolveMirrorResult({ experience: 'under-3', stuck: 'proof', start: 'content' }).category, 'proof')
  assert.equal(resolveMirrorResult({ experience: '3-5', stuck: 'asset', start: 'asset' }).category, 'asset')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'community', start: 'community' }).category, 'community')
})

test('question three selects the next route', () => {
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'content' }).href, '/library')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'asset' }).href, '/diagnostic')
  assert.equal(resolveMirrorResult({ experience: 'over-5', stuck: 'proof', start: 'community' }).href, '/conanmaker')
})

test('question one personalizes the explanation without changing the category', () => {
  const short = resolveMirrorResult({ experience: 'under-3', stuck: 'asset', start: 'asset' })
  const long = resolveMirrorResult({ experience: 'over-5', stuck: 'asset', start: 'asset' })
  assert.equal(short.category, long.category)
  assert.notEqual(short.explanation, long.explanation)
})
```

- [ ] **Step 3: Run and verify RED**

Run: `npx tsx --test scripts/home-cinema-content.test.ts scripts/homepage-cinematic-contract.test.mjs`

Expected: FAIL because the new modules, selected copy and cinema CSS do not exist.

### Task 2: Implement typed content, truthful proof and mirror logic

**Files:**
- Create: `components/home-cinema/home-cinema-content.ts`
- Create: `components/home-cinema/HomeMirror.tsx`
- Create: `components/home-cinema/HomeMirror.module.css`
- Test: `scripts/home-cinema-content.test.ts`

**Interfaces:**
- Produces: `MirrorAnswers`, `MirrorResult`, `resolveMirrorResult`, `proofItems`, `methodSteps`, `pathItems`, `questions`.
- `HomeMirror` emits `CustomEvent('homepage_mirror_completed', { detail: { resultCategory } })` only after all three answers exist.

- [ ] **Step 1: Implement the minimal pure result resolver**

Use literal unions for `experience`, `stuck`, and `start`; three result records with titles `Cần làm rõ bằng chứng`, `Cần đóng gói tài sản đầu tiên`, and `Sẵn sàng thiết kế offer/cộng đồng`; and destination map `{ content: '/library', asset: '/diagnostic', community: '/conanmaker' }`. The experience map must alter only the explanatory sentence.

- [ ] **Step 2: Run the mirror tests and verify GREEN**

Run: `npx tsx --test scripts/home-cinema-content.test.ts`

Expected: 3 tests pass.

- [ ] **Step 3: Build the progressively enhanced mirror**

Render three `fieldset`/`legend` groups with native radio inputs and visible labels. Do not persist state. Before completion, show a normal `/diagnostic` link so the no-JS path remains useful. On completion, render the resolved title, explanation and destination link in an `aria-live="polite"` result region.

- [ ] **Step 4: Commit the independently testable mirror slice**

Run:

```bash
npx tsx --test scripts/home-cinema-content.test.ts
git add components/home-cinema/home-cinema-content.ts components/home-cinema/HomeMirror.tsx components/home-cinema/HomeMirror.module.css scripts/home-cinema-content.test.ts
git commit -m "feat: add Evidence Cinema mirror journey"
```

### Task 3: Implement route-aware cinema and subpage chrome

**Files:**
- Create: `components/site-chrome/SiteChrome.tsx`
- Create: `components/site-chrome/SiteChrome.module.css`
- Modify: `app/layout.tsx`
- Modify: `app/layout.module.css`
- Test: `scripts/homepage-cinematic-contract.test.mjs`

**Interfaces:**
- `SiteChrome({ children }: { children: React.ReactNode })` consumes `usePathname()` and renders either homepage chrome or the preserved existing chrome.
- `CinemaHeader` links to `#story`, `#proof`, `#method`, and `/conanmaker`.

- [ ] **Step 1: Add chrome assertions and verify RED**

Assert that the source includes `usePathname`, `Mục lục`, `aria-modal="true"`, `role="dialog"`, `Escape`, trigger focus restoration, and a 44px minimum control height. Run the focused contract and confirm failure before code.

- [ ] **Step 2: Move the existing subpage nav/footer markup into `SiteChrome` unchanged**

Keep current subpage links, labels and external destinations. Route `/` to `CinemaHeader` + reduced editorial footer; route every other pathname to the preserved functional header/footer.

- [ ] **Step 3: Implement native focus management**

When the mobile sheet opens, remember the trigger, focus the first link, trap Tab/Shift+Tab inside the sheet, close on Escape, close on link activation, and restore trigger focus. Lock only document body overflow while open and restore it in cleanup.

- [ ] **Step 4: Run contract and TypeScript build checks**

Run: `npx tsx --test scripts/homepage-cinematic-contract.test.mjs && npx tsc --noEmit`

Expected: chrome assertions pass; TypeScript exits 0.

- [ ] **Step 5: Commit chrome**

```bash
git add app/layout.tsx app/layout.module.css components/site-chrome scripts/homepage-cinematic-contract.test.mjs
git commit -m "feat: add route-aware cinema site chrome"
```

### Task 4: Implement the six-act Evidence Cinema homepage

**Files:**
- Replace: `app/page.tsx`
- Replace: `app/page.module.css` with a thin import boundary or remove it if unused
- Create: `components/home-cinema/HomeCinema.tsx`
- Create: `components/home-cinema/HomeCinema.module.css`
- Modify: `styles/globals.css`
- Modify: `app/layout.tsx` for Cormorant Garamond and Be Vietnam Pro only on the homepage variable set
- Test: `scripts/homepage-cinematic-contract.test.mjs`

**Interfaces:**
- `HomeCinema()` composes `Hero`, `Mirror`, `ProofRail`, `MethodSequence`, `PathList`, and `ConanHandoff` as server-rendered markup, embedding only `HomeMirror` as a client island.
- Sections expose IDs `story`, `proof`, `method`, `paths`, and `conan` and scoped motion markers `data-cinema-reveal`, `data-focus-pull`, and `data-evidence-stamp`.

- [ ] **Step 1: Implement the first viewport from the approved mock**

Use semantic `h1` for the promise and an `aria-hidden` `THÔNG PHAN` display name. Use `next/image` with `priority`, accurate intrinsic dimensions, and responsive `sizes`. Preserve the left 45–50% copy / right 50–55% portrait tension, lacquer CTA, evidence stamp and first proof-frame preview. No hero video and no invented label above the promise.

- [ ] **Step 2: Implement acts 2–6 using open editorial bands and rails**

Render the mirror, two real proof items, linear method sequence, three editorial path rows and compact Conan handoff. Proof captions must state what each existing image literally supports; no public metric, third-party verification language or fake Hoa Sơn visual.

- [ ] **Step 3: Implement the visual token system and responsive modes**

Define the exact cinema custom properties. Desktop follows the selected mock; tablet removes overlap and pinning; mobile uses a controlled portrait field, two-line name lockup, single-column sections and native horizontal proof scroll snap. All primary actions are at least 44px and body copy at least 0.94rem on mobile.

- [ ] **Step 4: Add asset failure fallback and analytics event emission**

Use a small image wrapper only where needed to mark a failed image and reveal the neutral paper fallback. For CTA/proof/path/handoff events, call `window.dispatchEvent(new CustomEvent(name, { detail }))` without adding a provider or recording free text.

- [ ] **Step 5: Run contract, mirror and TypeScript checks**

Run:

```bash
npx tsx --test scripts/homepage-cinematic-contract.test.mjs scripts/home-cinema-content.test.ts
npx tsc --noEmit
```

Expected: all focused tests pass and TypeScript exits 0.

- [ ] **Step 6: Commit the page slice**

```bash
git add app/page.tsx app/page.module.css app/layout.tsx styles/globals.css components/home-cinema
git commit -m "feat: build Evidence Cinema homepage"
```

### Task 5: Scope motion as progressive enhancement

**Files:**
- Modify: `components/ScrollAnimations.tsx`
- Modify: `components/home-cinema/HomeCinema.module.css`
- Test: `scripts/homepage-cinematic-contract.test.mjs`

**Interfaces:**
- GSAP initializes only when cinema data attributes exist.
- Reduced motion skips all animation setup and leaves final visible states.

- [ ] **Step 1: Add failing motion-scope assertions**

Assert `matchMedia('(prefers-reduced-motion: reduce)')`, scoped selector checks, cleanup, and no cursor follower/pointer listener. Run focused test and verify RED.

- [ ] **Step 2: Replace global pointer effects with scoped reveal setup**

Use one `gsap.context`, one `IntersectionObserver` for reveal/focus/stamp markers, animate only `opacity`, `transform`, and bounded media `filter`, and disconnect/revert in cleanup. If reduced motion matches, return without changing visibility.

- [ ] **Step 3: Run tests and verify GREEN**

Run: `npm test`

Expected: every Node/TS test passes with 0 failures.

- [ ] **Step 4: Commit motion**

```bash
git add components/ScrollAnimations.tsx components/home-cinema/HomeCinema.module.css scripts/homepage-cinematic-contract.test.mjs
git commit -m "feat: add accessible Evidence Cinema motion"
```

### Task 6: Build, asset integrity and performance guardrails

**Files:**
- Modify: `scripts/static-route-contract.test.mjs`
- Create: `scripts/homepage-build-contract.test.mjs`
- Modify: `package.json`
- Modify: `next.config.js` only if headers/export settings require a documented change

**Interfaces:**
- Build contract consumes `out/index.html`, `out/_next/static/*`, and `out/conanmaker/index.html` after `npm run build`.

- [ ] **Step 1: Write the post-build contract before implementing its helpers**

Assert that `out/index.html` exists, contains the hero promise, has no `<video>`, contains exactly one `<h1`, and every local `src`/`href` beginning `/_next/` or `/conanmaker/assets/` resolves inside `out/`. Assert the largest homepage-priority raster is no more than 350KB; record a mobile derivative exception only if Next static export cannot create one.

- [ ] **Step 2: Run test before build and verify RED**

Run: `npx tsx --test scripts/homepage-build-contract.test.mjs`

Expected: FAIL because the current `out/` is absent or stale.

- [ ] **Step 3: Build and run all contracts**

Run:

```bash
npm test
npm run build
npx tsx --test scripts/homepage-build-contract.test.mjs
du -h out/_next/static/chunks/*.js | sort -h | tail
```

Expected: all tests and build exit 0; every asset reference resolves. If the hero source exceeds budget, produce a new fingerprinted optimized source file and update the content path rather than replacing the existing bytes.

- [ ] **Step 4: Commit guardrails**

```bash
git add package.json scripts/homepage-build-contract.test.mjs scripts/static-route-contract.test.mjs next.config.js public/images/homepage
git commit -m "test: guard homepage build and static assets"
```

### Task 7: Browser/IAB interaction and responsive QA

**Files:**
- Create during final QA: `design-qa.md`
- Temporary screenshots: store outside the repo under `/tmp/thongphan-evidence-cinema-qa/`

**Interfaces:**
- Flow under test: `/` loads → cinema hero renders → anchors/mirror/menu/proof/path/handoff respond → destination/state is correct with no console error.

- [ ] **Step 1: Start the local production build**

Run: `npm run build && npm run start -- -H 127.0.0.1 -p 4173`

Expected: server listens on `http://127.0.0.1:4173` and remains running.

- [ ] **Step 2: Verify page identity, console health and primary flow in Browser/IAB**

Check URL/title, meaningful DOM, no framework overlay, no relevant error/warning, and screenshot evidence. Complete the mirror with keyboard, verify its result and CTA. Open/close mobile menu with keyboard, Escape and focus restoration. Open a proof source and verify destination.

- [ ] **Step 3: Verify all required viewports**

Capture 1440×1024, 1280×720, 834×1194, 390×844 and 375×812. For each, confirm no horizontal overflow, no clipped promise/CTA, correct portrait crop, readable proof rail and visible focus state. Verify `prefers-reduced-motion: reduce` separately.

- [ ] **Step 4: Compare the approved mock and implementation through `view_image`**

Inspect both images at native dimensions. Maintain a fidelity ledger covering at least: name/promise hierarchy, portrait crop, lacquer CTA, palette, film rail, typography, open editorial container model, responsive collapse, motion and above-the-fold copy. Fix every P0/P1/P2 mismatch and recapture.

- [ ] **Step 5: Write and pass `design-qa.md`**

The report must include source target, rendered screenshots, five-or-more comparison points, above-the-fold copy diff, interaction evidence, responsive evidence, remaining intentional deviations and the terminal line `final result: passed`.

### Task 8: Documentation, final verification and release handoff

**Files:**
- Modify: `docs/superpowers/specs/2026-07-10-thongphan-evidence-cinema-homepage-design.md`
- Modify: `docs/superpowers/plans/2026-07-10-thongphan-evidence-cinema-homepage.md`
- Create: `docs/DEPLOYMENT.md` if no deployment source-of-truth exists
- Verify: `design-qa.md`

**Interfaces:**
- Produces a local release candidate and a deployment contract that forbids overwriting immutable asset URLs.

- [ ] **Step 1: Mark the spec approved/implemented and document the deploy contract**

Record: build command, output directory, Conan Maker static-route ownership, fingerprint rule, asset integrity command, and rollback source. State clearly that production deployment remains a separate explicit action.

- [ ] **Step 2: Run fresh full verification**

Run:

```bash
npm test
npx tsc --noEmit
npm run build
npx tsx --test scripts/homepage-build-contract.test.mjs
git diff --check
git status --short
```

Expected: all commands exit 0; only intended tracked changes and any explicitly preserved user-owned obsolete static files remain.

- [ ] **Step 3: Re-read spec and plan, close every checkbox with evidence**

Verify line-by-line: six acts, truthful proof, route-aware chrome, mirror mapping, motion fallback, responsive targets, asset budget, static route integrity, Browser flow and passed design QA.

- [ ] **Step 4: Commit documentation and QA artifacts**

```bash
git add docs design-qa.md
git commit -m "docs: record Evidence Cinema release candidate"
```

- [ ] **Step 5: Finish the development branch**

Use `superpowers:finishing-a-development-branch`, rerun the full verification suite, and present the exact local integration state. Do not push or deploy unless the user explicitly requests it.
