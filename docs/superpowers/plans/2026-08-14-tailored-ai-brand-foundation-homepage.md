# Tailored AI Brand Foundation and Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old umbrella promise with the approved tailored-AI-workforce positioning and ship a compact, legible Executive AI Atelier homepage without changing public URLs or touching Learn runtime.

**Architecture:** Versioned brand and offer contracts live in repository documents and typed content registries. The Next.js static homepage consumes those registries through server components; shared chrome consumes the same navigation and message contract. Motion remains progressive enhancement, while source-backed images are controlled by an explicit manifest with focal metadata.

**Tech Stack:** Next.js 16 App Router and static export, React 19, TypeScript 6, CSS Modules, `next/font`, GSAP already in the repository, Node test runner through `tsx`, Playwright visual QA.

## Global Constraints

- Source of truth: `docs/superpowers/specs/2026-08-14-thongphan-tailored-ai-workforce-brand-system-design.md`.
- Execute in a new isolated worktree created from `origin/main`; do not implement on `feature/vid-thongphan-stream` and do not push its unrelated VID history.
- Preserve `/`, `/about`, `/diagnostic`, `/library`, `/library/read/*`, `/assets`, `/experiences`, `/blog`, `/brain2/21-ngay`, `/conanmaker/`, Vid and Learn URLs.
- Do not modify any `app/learn/**`, Learn Worker, Learn Pages config, Learn data, or Learn release file.
- Do not invent client outcomes, prices, staff count, revenue, logos, badges, certifications, operating status or case-study results.
- Keep the existing THÔNG PHAN wordmark and TP monogram in R1. Supporting marks may be added only as secondary devices.
- Homepage Hero must fit at 1366x768 and 390x844; headline has at most two visual lines and the primary CTA remains visible.
- Only real, rights-cleared photos may be presented as evidence. Generated art is atmosphere, never proof.
- All motion must preserve no-JavaScript reading, disable under reduced motion and avoid layout-affecting animation.
- Every task begins with a failing test, ends with focused and regression evidence, and commits only its scoped files.

## File and Responsibility Map

| Area | Files | Responsibility |
| --- | --- | --- |
| Brand authority | `docs/domain/CONTENT-MODEL-SPEC.md`, `docs/product/PRODUCT-CHARTER.md`, `docs/product/URD.md`, `docs/01-GLOSSARY.md` | Canonical positioning, offer, audience, qualification and vocabulary |
| Brand runtime | `lib/brand/tailored-ai.ts`, `lib/brand/role-registry.ts` | Typed public copy, method, roles, capability modules and status |
| Tokens | `styles/brand-tokens.css`, `styles/globals.css` | Executive AI Atelier color, type, radius, spacing and motion tokens |
| Shell | `components/site-chrome/*`, `lib/site-route-mode.ts`, `lib/site-journey.ts` | Pinned navigation, route framing and contextual handoff |
| Homepage | `components/home-cinema/HomeCinema.tsx`, `HomeCinema.module.css`, `home-cinema-content.ts` | Static semantic homepage sections and primary conversion path |
| Media | `content/homepage/homepage-proof-assets.json`, `lib/homepage-proof-assets.ts`, `public/images/homepage/*` | Rights, provenance, focal point and derivative dimensions |
| Metadata | `app/page.tsx`, `app/layout.tsx`, `lib/seo.ts` | Positioning metadata and structured data without unsupported claims |
| Verification | `scripts/brand-authority.test.ts`, `scripts/homepage-brand-contract.test.mjs`, `scripts/qa-brand-homepage.mjs` | Copy, boundary, viewport, crop, accessibility and motion gates |

---

### Task 1: Create a clean implementation worktree and freeze the public baseline

**Files:**
- Create: `docs/baselines/2026-08-14-public-route-copy-inventory.md`
- Create: `scripts/brand-route-baseline.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: current route list, sitemap, metadata and rendered public links.
- Produces: immutable route/canonical inventory and executable protected-boundary assertions.

- [ ] **Step 1: Create the isolated branch**

Run from `/Users/rio/thongphan-com`:

```bash
git fetch origin
git worktree add .worktrees/tailored-ai-brand -b feature/tailored-ai-brand origin/main
```

Expected: a clean worktree on `feature/tailored-ai-brand`. If an identically named worktree exists, inspect it and reuse only when clean and based on the intended commit; never delete it blindly.

- [ ] **Step 2: Write the failing route baseline test**

The test reads `app/sitemap.ts`, `public/_redirects`, `lib/site-route-mode.ts`, `app/robots.ts` and asserts this stable inventory:

```js
const protectedRoutes = [
  '/', '/about', '/diagnostic', '/library', '/library/read',
  '/assets', '/experiences', '/blog', '/brain2/21-ngay',
  '/chat', '/conanmaker/',
]

for (const route of protectedRoutes) assert.ok(inventory.has(route), route)
assert.doesNotMatch(redirects, /read\.thongphan\.com|\/library\/read/i)
assert.doesNotMatch(changedFiles, /^(?:app|lib|workers)\/learn\//m)
```

Also fail if the plan implementation diff changes a canonical content path or adds `/read` as a public route.

- [ ] **Step 3: Run RED**

Run: `node --test scripts/brand-route-baseline.test.mjs`

Expected: FAIL because the baseline inventory document is absent.

- [ ] **Step 4: Record the baseline**

Inventory every current public route, title, description, primary CTA, target, canonical and old-positioning phrase. Mark each row `replace`, `reframe`, `preserve-body`, or `protected`. Include explicit protected entries for Learn runtime, Vid platform runtime, Brain2 protected lessons and Conan Maker internals.

- [ ] **Step 5: Add the focused script and verify GREEN**

Add `test:brand-baseline` to `package.json`:

```json
"test:brand-baseline": "node --test scripts/brand-route-baseline.test.mjs"
```

Run: `npm run test:brand-baseline && git diff --check`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/baselines/2026-08-14-public-route-copy-inventory.md scripts/brand-route-baseline.test.mjs package.json
git commit -m "test: freeze brand migration route baseline"
```

### Task 2: Amend the authority documents and publish typed brand contracts

**Files:**
- Modify: `docs/domain/CONTENT-MODEL-SPEC.md`
- Modify: `docs/product/PRODUCT-CHARTER.md`
- Modify: `docs/product/URD.md`
- Modify: `docs/01-GLOSSARY.md`
- Create: `lib/brand/tailored-ai.ts`
- Create: `lib/brand/role-registry.ts`
- Create: `scripts/brand-authority.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `tailoredAiBrand`, `marketingAiOffer`, `tailoredAiMethod`, `roleRegistry`, `capabilityModules`.
- Consumed later by Homepage, Diagnostic, offer page, proof and subpage handoffs.

- [ ] **Step 1: Write the failing authority contract**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { capabilityModules, marketingAiOffer, tailoredAiBrand } from '../lib/brand/tailored-ai'
import { roleRegistry } from '../lib/brand/role-registry'

test('one umbrella promise and one truthful first offer are canonical', () => {
  assert.equal(tailoredAiBrand.audience, 'CEO và chủ doanh nghiệp')
  assert.equal(tailoredAiBrand.tagline, 'Sếp đặt chuẩn. Đội AI thực thi.')
  assert.equal(marketingAiOffer.status, 'ready_for_bespoke_engagement')
  assert.equal(marketingAiOffer.pricing, null)
  assert.equal(marketingAiOffer.primaryCta.href, '/diagnostic')
  assert.deepEqual(capabilityModules.map((item) => item.id), [
    'viral-content-ai', 'video-dubbing-ai', 'seo-content-ai', 'enterprise-brain2',
  ])
  assert.equal(new Set(roleRegistry.map((role) => role.id)).size, roleRegistry.length)
})
```

Add source scans banning the old umbrella headline, `thay thế toàn bộ nhân sự`, `tự động 100%`, invented price and invented ROI from the brand registry.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/brand-authority.test.ts`

Expected: FAIL because `lib/brand/*` does not exist.

- [ ] **Step 3: Amend authority documents**

Add a versioned Creator Model for `workspace_id = thongphan`, an Offer Model for `marketing-ai-tailored`, explicit fit/non-fit, F-P-I-A evidence groups, Sales Ready human-review rule and the method `TUYỂN ĐÚNG → DẠY ĐÚNG → GIAO ĐÚNG → ĐO ĐÚNG`. Mark previous Read-specific material as product context rather than the umbrella identity; do not delete history.

Add glossary entries for `Nhân viên AI may đo`, `Role Registry`, `Capability Module`, `Candidate Role`, `Assessment Decision` and `Booking Invitation`.

- [ ] **Step 4: Implement the runtime registry**

Use these public types:

```ts
export type PublicReadiness =
  | 'operational'
  | 'ready_for_bespoke_engagement'
  | 'prototype'
  | 'planned'

export type CapabilityModuleId =
  | 'viral-content-ai'
  | 'video-dubbing-ai'
  | 'seo-content-ai'
  | 'enterprise-brain2'

export type TailoredAiRole = {
  id: string
  label: string
  department: 'executive' | 'marketing' | 'sales' | 'operations'
  purpose: string
  output: string
  knowledge: readonly string[]
  standard: readonly string[]
  authority: readonly string[]
  evaluation: readonly string[]
  status: PublicReadiness
}
```

The Hero copy is exactly the approved wording contract, while the rendered subcopy may use the approved compact variant of no more than 20 words.

- [ ] **Step 5: Verify authority consistency**

Run:

```bash
npx tsx --test scripts/brand-authority.test.ts
npx tsc --noEmit --pretty false
npm run test:secret-integrity
```

Expected: PASS and no secret finding.

- [ ] **Step 6: Commit**

```bash
git add docs/domain/CONTENT-MODEL-SPEC.md docs/product/PRODUCT-CHARTER.md docs/product/URD.md docs/01-GLOSSARY.md lib/brand scripts/brand-authority.test.ts package.json
git commit -m "feat: establish tailored AI brand authority"
```

### Task 3: Establish the Executive AI Atelier token and shell system

**Files:**
- Modify: `styles/brand-tokens.css`
- Modify: `styles/globals.css`
- Modify: `app/layout.tsx`
- Modify: `components/site-chrome/site-navigation.ts`
- Modify: `components/site-chrome/SiteHeader.tsx`
- Modify: `components/site-chrome/SiteFooter.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `components/site-chrome/MobileMenu.tsx`
- Modify: `components/site-chrome/motion-profile.ts`
- Modify: `lib/site-journey.ts`
- Create: `scripts/tailored-ai-shell-contract.test.ts`

**Interfaces:**
- Consumes: `tailoredAiBrand`, `marketingAiOffer`.
- Produces: pinned one-row desktop header, compact mobile menu and shared contextual CTA contract.

- [ ] **Step 1: Write the failing shell contract**

Assert the rendered/source system contains these tokens and navigation labels:

```ts
const requiredTokens = {
  '--atelier-paper': '#f2ecdf',
  '--atelier-ink': '#11100e',
  '--atelier-oxblood': '#7b261f',
  '--atelier-gold': '#a98a56',
  '--atelier-chrome': '#a8adb2',
  '--atelier-signal': '#b7ef45',
}
```

Require desktop links `Phòng Marketing AI`, `Cách may đo`, `Bằng chứng`, `Về Thông`; require CTA `Tuyển nhân viên AI đầu tiên`; ban the current primary labels `Câu chuyện / Thư viện / Trải nghiệm / Chẩn đoán` as a flat top-level list. Assert header `position: fixed`, 44px targets, visible `:focus-visible`, and body padding/safe zone.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/tailored-ai-shell-contract.test.ts`

Expected: FAIL on missing tokens and navigation.

- [ ] **Step 3: Implement tokens and route-aware navigation**

Define semantic tokens rather than raw color duplication. Keep the signal lime restricted to DOM states carrying `data-live-state="true"`; gold may only decorate elements linked to verified evidence. Use current fonts: Be Vietnam Pro for UI/body, Cormorant/Newsreader only for deliberate editorial display, IBM Plex Mono for evidence labels.

Update the navigation registry to:

```ts
export const primaryNavigation = [
  { href: '/marketing-ai', label: 'Phòng Marketing AI' },
  { href: '/#method', label: 'Cách may đo' },
  { href: '/#proof', label: 'Bằng chứng' },
  { href: '/about', label: 'Về Thông' },
] as const

export const primaryAction = {
  href: '/diagnostic',
  label: 'Tuyển nhân viên AI đầu tiên',
} as const
```

The mobile menu retains secondary discovery links to Library, Video, Brain2 and Conan Maker. It must trap focus, close on Escape and restore focus to the trigger.

- [ ] **Step 4: Update journey language**

Replace old `chuyên môn → tài sản` handoffs with contextual `identify role → teach standard → assign authority → inspect evidence` language. Preserve destination URLs and the rule of one primary plus at most two secondary actions.

- [ ] **Step 5: Verify**

Run:

```bash
npx tsx --test scripts/tailored-ai-shell-contract.test.ts scripts/site-journey.test.ts scripts/site-chrome-contract.test.ts scripts/mobile-menu-focus.test.ts
npx tsc --noEmit --pretty false
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add styles app/layout.tsx components/site-chrome lib/site-journey.ts scripts/tailored-ai-shell-contract.test.ts
git commit -m "feat: add Executive AI Atelier shell"
```

### Task 4: Replace the homepage content architecture

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/home-cinema/HomeCinema.tsx`
- Modify: `components/home-cinema/home-cinema-content.ts`
- Modify: `components/home-cinema/homepage-events.ts`
- Modify: `components/home-cinema/HomeCinema.module.css`
- Create: `components/home-cinema/TailoredRoleDossier.tsx`
- Create: `components/home-cinema/TailoredRoleDossier.module.css`
- Create: `components/home-cinema/MarketingAiModules.tsx`
- Create: `scripts/homepage-brand-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: brand registry, role registry, proof manifest.
- Produces: sections `story`, `problem`, `transformation`, `role`, `method`, `roles`, `diagnostic`, `proof`, `about`.

- [ ] **Step 1: Write the failing semantic contract**

Assert exact section IDs, one `<h1>`, one primary Hero CTA to `/diagnostic`, one secondary Hero CTA to `/#role`, and no homepage links to itself. Require phrases `ĐỘI NGŨ NHÂN VIÊN AI MAY ĐO CHO CEO`, `Sở hữu một đội ngũ nhân viên AI làm việc theo đúng tiêu chuẩn của sếp.`, `Sếp đặt chuẩn. Đội AI thực thi.` and the four method verbs.

Assert Hero source order is eyebrow → h1 → compact lead → actions → one proof line; no display-name text competes above the h1. Assert body copy bounds: Hero lead at most 20 words, each transformation at most 24 words, role dossier summaries at most 28 words, each method step at most 22 words.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/homepage-brand-contract.test.mjs`

Expected: FAIL because the current homepage presents the former promise and Act structure.

- [ ] **Step 3: Implement the semantic homepage**

`HomeCinema.tsx` remains a server component. Render the approved information architecture:

```tsx
<section id="story">...</section>
<section id="problem">...</section>
<section id="transformation">...</section>
<section id="role"><TailoredRoleDossier role={...} /></section>
<section id="method">...</section>
<section id="roles"><MarketingAiModules /></section>
<section id="diagnostic">...</section>
<section id="proof">...</section>
<section id="about">...</section>
```

Do not render seven generic equal cards. The role dossier is one expandable semantic document whose tabs/buttons expose Role, Output, Knowledge, Standard, Authority and Eval with native buttons and readable fallback content. The four capability modules are framed as components of one Marketing AI room, not separate products.

- [ ] **Step 4: Compact the first viewport**

At desktop use a two-column editorial composition with copy max-width `min(46rem, 56vw)` and a portrait/system visual that respects focal metadata. At mobile, copy precedes media and the portrait uses a mobile derivative. Never use `overflow: hidden` on text containers. Use `min-height` only where content can grow; use `clamp()` for type with explicit 320px fallbacks.

- [ ] **Step 5: Update metadata and events**

Set homepage title/description to the approved public positioning. Define only these non-PII events:

```ts
export const homepageEvents = {
  primary: 'tailored_ai_diagnostic_started',
  method: 'tailored_ai_method_opened',
  role: 'tailored_ai_role_examined',
  proof: 'tailored_ai_proof_opened',
  offer: 'marketing_ai_offer_opened',
} as const
```

Do not put free text, email, URL, team size or result into browser analytics.

- [ ] **Step 6: Verify focused contracts**

Run:

```bash
node --test scripts/homepage-brand-contract.test.mjs
npx tsx --test scripts/brand-authority.test.ts scripts/home-cinema-content.test.ts
npx tsc --noEmit --pretty false
npm run lint
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx components/home-cinema scripts/homepage-brand-contract.test.mjs package.json
git commit -m "feat: reposition homepage around tailored AI teams"
```

### Task 5: Rebuild homepage media and motion as progressive enhancement

**Files:**
- Modify: `content/homepage/homepage-proof-assets.json`
- Modify: `lib/homepage-proof-assets.ts`
- Modify: `components/home-cinema/ProofImage.tsx`
- Modify: `components/home-cinema/ProofContactSheet.tsx`
- Modify: `components/ScrollAnimations.tsx`
- Modify: `components/site-chrome/MotionAtmosphere.tsx`
- Modify: `components/site-chrome/motion-profile.ts`
- Add only approved derivatives under: `public/images/homepage/`
- Modify: `scripts/homepage-proof-assets.test.ts`
- Create: `scripts/homepage-motion-contract.test.ts`

**Interfaces:**
- Media entry produces `rights`, `source`, `caption`, desktop/mobile derivatives and focal coordinates.
- Motion consumes `data-motion-*` hooks but never changes document semantics.

- [ ] **Step 1: Extend failing manifest tests**

Require:

```ts
type HomepageAsset = {
  id: string
  kind: 'portrait' | 'proof' | 'atmosphere'
  rights: 'owned' | 'licensed' | 'generated'
  source: string
  caption: string
  derivativeUrl: string
  mobileDerivativeUrl?: string
  width: number
  height: number
  focalPoint: { x: number; y: number }
  safeHeadroom: number
  mayRepresentEvidence: boolean
}
```

Reject generated assets with `mayRepresentEvidence: true`, coordinates outside 0–100, missing captions on proof, or portraits without mobile derivative and headroom.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/homepage-proof-assets.test.ts scripts/homepage-motion-contract.test.ts`

Expected: FAIL on missing manifest fields and motion hooks.

- [ ] **Step 3: Audit and materialize derivatives**

For every person image, inspect the original before choosing crop. Produce desktop/mobile WebP derivatives without cutting hairline, forehead or chin. Record actual dimensions and focal point. If no safe derivative exists, use a different approved source or switch to `object-fit: contain`; never fake a crop with CSS.

- [ ] **Step 4: Implement restrained motion**

Implement only transform/opacity effects: a slow atelier light sweep, bounded pointer light on fine pointers, dossier focus/hover, knowledge-line assembly and a real operations-state pulse. Limit concurrent ambient animations to three; pause when document hidden; clean listeners/GSAP contexts; render static end state under reduced motion and coarse pointer.

- [ ] **Step 5: Verify asset and motion contracts**

Run:

```bash
npx tsx --test scripts/homepage-proof-assets.test.ts scripts/homepage-motion-contract.test.ts scripts/motion-atmosphere-contract.test.ts
npm run test:bundle
npm run lint
```

Expected: PASS; bundle budget stays within the current release threshold.

- [ ] **Step 6: Commit**

```bash
git add content/homepage lib/homepage-proof-assets.ts components/home-cinema components/ScrollAnimations.tsx components/site-chrome public/images/homepage scripts
git commit -m "feat: add truthful atelier media and motion"
```

### Task 6: Run comprehension, accessibility and viewport release gates

**Files:**
- Create: `scripts/qa-brand-homepage.mjs`
- Create: `docs/qa/TAILORED_AI_HOMEPAGE_REPORT.md`
- Modify: `package.json`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Produces: machine-readable screenshots/measurements and a human comprehension record.

- [ ] **Step 1: Write the failing QA assertions**

At `1440x900`, `1366x768`, `1280x720`, `1024x768`, `768x1024`, `390x844`, `320x568`, assert:

```js
assert.equal(metrics.horizontalOverflow, 0)
assert.equal(metrics.overlappingTextPairs.length, 0)
assert.equal(metrics.hiddenInteractiveElements.length, 0)
assert.ok(metrics.hero.primaryCta.bottom <= viewport.height)
assert.ok(metrics.hero.headingLines <= 2)
assert.equal(metrics.destructivePortraitCrops.length, 0)
```

Also test keyboard navigation, mobile dialog focus, reduced motion, no-JavaScript content/CTA visibility, missing-image fallback and no console errors.

- [ ] **Step 2: Run QA and observe RED before layout correction**

Run: `node scripts/qa-brand-homepage.mjs`

Expected: initial FAIL produces exact viewport/selector evidence rather than screenshots only.

- [ ] **Step 3: Correct only measured layout defects**

Fix root causes in token, layout or crop metadata. Do not shrink all type globally to make a single viewport pass. After two identical failures, stop and create `docs/STUCK_REPORT-<date>-tailored-ai-homepage-qa.md`.

- [ ] **Step 4: Conduct the five-person comprehension check**

Show the first viewport for ten seconds to at least five people near the ICP. Record anonymized answers to: `Trang này giúp ai?`, `Thông xây thứ gì?`, `Khác chatbot/prompt ở đâu?`. Pass only when at least four answer all three correctly. Do not invent respondents or answers; if this human step is unavailable, mark release PARTIAL and ask the owner to run it.

- [ ] **Step 5: Run the complete local gate**

```bash
npm run test:brand-baseline
npx tsx --test scripts/brand-authority.test.ts scripts/tailored-ai-shell-contract.test.ts
node --test scripts/homepage-brand-contract.test.mjs
npm test
npx tsc --noEmit --pretty false
npm run lint
npm run build
npm run test:seo
npm run test:bundle
npm run test:secret-integrity
node scripts/qa-brand-homepage.mjs
git diff --check
```

Expected: all automated gates PASS. Record exact counts, viewport results and limitations in the QA report.

- [ ] **Step 6: Preview only; do not cut production yet**

Deploy an immutable Cloudflare Pages preview from the verified `out/` only after checking remote/project identity. Compare SHA-256 for homepage HTML and critical assets between local and preview. Obtain owner desktop/mobile visual approval. This plan ends at approved preview; production cutover belongs to the final release plan.

- [ ] **Step 7: Commit status and evidence**

```bash
git add scripts/qa-brand-homepage.mjs docs/qa/TAILORED_AI_HOMEPAGE_REPORT.md docs/STATUS.md package.json
git commit -m "test: verify tailored AI homepage release candidate"
```

## Self-Review Gate

- [ ] Every new runtime export has a focused test and no unused parallel representation.
- [ ] Search for placeholders: `rg -n "TODO|TBD|lorem|placeholder|coming soon|giá từ|ROI" app components lib content docs`.
- [ ] Search for stale umbrella copy and classify every hit against the baseline inventory.
- [ ] Confirm `git diff origin/main...HEAD -- app/learn lib/learn-release.ts` is empty.
- [ ] Confirm typed IDs in brand, roles, events and links are consistent.
- [ ] Confirm no generated asset is presented as proof.
- [ ] Confirm no production mutation occurred in this plan.
