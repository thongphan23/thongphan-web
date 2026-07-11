# Cinema Chapters Journey Spine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Ship the first complete Cinema Chapters slice: a shared, typed next-step system plus contextual Chat and Diagnostic recommendations that keep visitors inside the canonical thongphan.com journey.

**Architecture:** A pure `lib/site-journey.ts` registry owns route intent and prompt recommendations. One server-compatible `ChapterHandoff` renders the registry in dark or paper contexts. Chat and Diagnostic consume the pure model without changing the existing API, scoring, static-export, or route-mode contracts.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS Modules, `next/font`, Lucide React, Node test runner through `tsx`.

## Global Constraints

- Source of truth: `docs/superpowers/specs/2026-07-12-thongphan-cinema-chapters-journey-design.md`.
- Preserve all existing route URLs and the released Unified Cinema route modes.
- Preserve the four user-owned untracked files under `public/conanmaker/assets/`; never stage, modify, rename, or delete them.
- Do not add a backend, account system, analytics vendor, component library, animation library, or generated proof.
- Internal recommendation links must be canonical static-export routes.
- Each page has one primary recommendation and no more than two contextual alternatives.
- Every task starts RED, ends GREEN, and commits only its own tracked files.

---

### Task 1: Add the pure route-intent and recommendation registry

**Files:**
- Create: `lib/site-journey.ts`
- Create: `scripts/site-journey.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `JourneyKey`, `JourneyAction`, `JourneyHandoff`, `getJourneyHandoff(key)`, `getRecommendationsForPrompt(prompt)`.
- Internal route inventory: `/`, `/about`, `/diagnostic`, `/library`, `/library/read`, `/assets`, `/challenges`, `/chat`, `/learn`, `/conanmaker/`.

- [x] **Step 1: Write the failing registry contract**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getJourneyHandoff,
  getRecommendationsForPrompt,
  journeyHandoffs,
} from '../lib/site-journey'

test('every handoff has one primary and no duplicate destinations', () => {
  for (const handoff of Object.values(journeyHandoffs)) {
    const actions = [handoff.primary, ...handoff.secondary]
    assert.ok(actions.length >= 2 && actions.length <= 3)
    assert.equal(new Set(actions.map((action) => action.href)).size, actions.length)
    for (const action of actions) {
      assert.ok(action.label.trim().length > 3)
      assert.ok(action.reason.trim().length > 12)
      assert.match(action.href, /^(?:\/|https:\/\/)/)
    }
  }
})

test('prompt intent selects a reasoned canonical route', () => {
  assert.equal(getRecommendationsForPrompt('Tui chưa biết bắt đầu từ đâu')[0].href, '/diagnostic')
  assert.equal(getRecommendationsForPrompt('Tui muốn xây Brain2 từ ghi chú')[0].href, '/challenges/brain2-21-ngay')
  assert.equal(getRecommendationsForPrompt('Tui muốn đóng gói một sản phẩm nhỏ')[0].href, '/assets')
  assert.equal(getRecommendationsForPrompt('Tui cần học AI có lộ trình')[0].href, '/learn')
  assert.equal(getRecommendationsForPrompt('Tui cần cộng đồng cùng làm')[0].href, '/conanmaker/')
})

test('known keys return stable handoffs', () => {
  assert.equal(getJourneyHandoff('about').primary.href, '/diagnostic')
  assert.equal(getJourneyHandoff('reader').primary.href, '/assets')
})
```

- [x] **Step 2: Run the focused test and verify RED**

Run: `npx tsx --test scripts/site-journey.test.ts`

Expected: FAIL because `lib/site-journey.ts` does not exist.

- [x] **Step 3: Implement the pure registry**

Create the exported types exactly as follows:

```ts
export type JourneyKey =
  | 'home' | 'about' | 'diagnostic' | 'library' | 'reader'
  | 'assets' | 'asset-detail' | 'challenges' | 'challenge-detail'
  | 'blog' | 'blog-detail' | 'chat'

export type JourneyAction = {
  href: string
  label: string
  reason: string
  eyebrow: string
  external?: boolean
}

export type JourneyHandoff = {
  chapter: string
  title: string
  description: string
  primary: JourneyAction
  secondary: JourneyAction[]
}
```

Define `journeyHandoffs` as `satisfies Record<JourneyKey, JourneyHandoff>`. Use these exact primary routes: home → `/diagnostic`, about → `/diagnostic`, diagnostic → `/library`, library → `/diagnostic`, reader → `/assets`, assets → `/diagnostic`, asset-detail → `/challenges`, challenges → `/challenges/brain2-21-ngay`, challenge-detail → `/conanmaker/`, blog → `/library`, blog-detail → `/diagnostic`, chat → `/diagnostic`. Every secondary array contains one or two unique routes from the inventory.

Implement prompt priority in this order: community/conan → `/conanmaker/`; course/learn/học → `/learn`; asset/product/offer/tài sản/sản phẩm → `/assets`; Brain2/note/ghi chú → `/challenges/brain2-21-ngay`; content/proof/bài viết → `/library`; default → `/diagnostic`. Return the matching primary plus two non-duplicate fallback actions.

- [x] **Step 4: Add the test to `npm test` and verify GREEN**

Add `scripts/site-journey.test.ts` to the existing `node --import tsx --test` list.

Run: `npx tsx --test scripts/site-journey.test.ts && npm test`

Expected: focused tests pass and the full suite remains green.

- [x] **Step 5: Commit the pure model**

```bash
git add lib/site-journey.ts scripts/site-journey.test.ts package.json
git commit -m "feat: add Cinema journey registry"
```

### Task 2: Build the shared chapter handoff and repair unified mono typography

**Files:**
- Create: `components/journey/ChapterHandoff.tsx`
- Create: `components/journey/ChapterHandoff.module.css`
- Create: `scripts/chapter-handoff-contract.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `styles/brand-tokens.css`
- Modify: `package.json`

**Interfaces:**
- Consumes: `JourneyHandoff`, `getJourneyHandoff` from Task 1.
- Produces: `<ChapterHandoff journeyKey tone="dark|paper" />`.

- [x] **Step 1: Write the failing source contract**

Assert that the component imports `next/link`, renders the action reason before the label, branches internal/external links, exposes `data-tone`, and has CSS rules for 44px targets, lacquer focus, asymmetric layout, and reduced motion. Assert `app/layout.tsx` loads `IBM_Plex_Mono` with `preload: false`, root body includes its variable, and unified shell maps `--font-mono` to it.

- [x] **Step 2: Run the contract and verify RED**

Run: `node --test scripts/chapter-handoff-contract.test.mjs`

Expected: FAIL because the component and unified mono variable are absent.

- [x] **Step 3: Implement the component**

Use this public signature:

```tsx
type ChapterHandoffProps = {
  journeyKey: JourneyKey
  tone: 'dark' | 'paper'
  className?: string
}

export default function ChapterHandoff({ journeyKey, tone, className = '' }: ChapterHandoffProps) {
  const handoff = getJourneyHandoff(journeyKey)
  const actions = [handoff.primary, ...handoff.secondary]
  return (
    <section className={`${styles.handoff} ${className}`} data-tone={tone} aria-labelledby={`handoff-${journeyKey}`}>
      <header className={styles.intro}>
        <p>{handoff.chapter}</p>
        <h2 id={`handoff-${journeyKey}`}>{handoff.title}</h2>
        <span>{handoff.description}</span>
      </header>
      <div className={styles.actions}>
        {actions.map((action, index) => (
          <article key={action.href} data-primary={index === 0}>
            <p>{action.eyebrow}</p>
            <span>{action.reason}</span>
            {action.external ? (
              <a href={action.href} target="_blank" rel="noopener noreferrer">{action.label}</a>
            ) : (
              <Link href={action.href}>{action.label}</Link>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
```

The CSS uses a 0.82fr/1.18fr grid at desktop; the primary action spans the full first row of the action grid; mobile collapses to one column. No decorative gradient or generic equal three-card dashboard.

- [x] **Step 4: Load IBM Plex Mono and semantic oxblood**

Add `IBM_Plex_Mono({ subsets: ['latin', 'vietnamese'], weight: ['500', '600'], variable: '--font-ibm-plex-mono', preload: false })`. Add its variable to the root body class. Set unified `--font-mono: var(--font-ibm-plex-mono), ui-monospace, monospace` and add `--brand-oxblood: #7b2d1c`; replace the hard-coded unified oxblood value with the token.

- [x] **Step 5: Run focused and full verification**

Run: `node --test scripts/chapter-handoff-contract.test.mjs && npm test && npx tsc --noEmit`

Expected: all pass.

- [x] **Step 6: Commit the shared visual primitive**

```bash
git add components/journey app/layout.tsx components/site-chrome/SiteChrome.module.css styles/brand-tokens.css scripts/chapter-handoff-contract.test.mjs package.json
git commit -m "feat: add shared chapter handoff"
```

### Task 3: Turn Chat into a contextual route director

**Files:**
- Modify: `app/chat/chat-model.ts`
- Modify: `app/chat/ChatClient.tsx`
- Modify: `app/chat/page.module.css`
- Create: `scripts/chat-journey.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `JourneyAction[]` from `getRecommendationsForPrompt`.
- Produces: `ChatTurn` with `content` and `recommendations`.

- [x] **Step 1: Write the failing chat model tests**

Test that `createLocalChatTurn('Tui muốn tạo sản phẩm nhỏ')` returns non-empty content, primary `/assets`, two unique alternatives, and no external route. Preserve the existing `splitSseEvents` assertion.

- [x] **Step 2: Verify RED**

Run: `npx tsx --test scripts/chat-journey.test.ts`

Expected: FAIL because `createLocalChatTurn` is absent.

- [x] **Step 3: Add structured chat turns without changing the API payload**

Define:

```ts
export type ChatTurn = {
  content: string
  recommendations: JourneyAction[]
}

export function createLocalChatTurn(message: string): ChatTurn {
  return {
    content: getMockResponse(message),
    recommendations: getRecommendationsForPrompt(message),
  }
}
```

Keep `JSON.stringify({ message: text })` unchanged. Store recommendations on assistant messages after local streaming completes, after remote streaming completes, and after network failure. Render a `nav` labelled `Ba bước có thể đi tiếp` below the assistant copy; each card shows reason then link label.

- [x] **Step 4: Style route recommendations and loading states**

Use paper/oxblood framing, stagger-free CSS reveal, 44px links, visible focus, and one-column mobile layout. Under reduced motion, disable smooth autoscroll and all recommendation transitions.

- [x] **Step 5: Verify Chat**

Run: `npx tsx --test scripts/chat-journey.test.ts scripts/subpage-cinema-contract.test.mjs && npm test && npx tsc --noEmit`

Expected: all pass and existing API/source contracts remain intact.

- [x] **Step 6: Commit Chat**

```bash
git add app/chat scripts/chat-journey.test.ts package.json
git commit -m "feat: direct chat into useful next steps"
```

### Task 4: Upgrade Diagnostic results into a reasoned dossier

**Files:**
- Modify: `app/diagnostic/diagnostic-model.ts`
- Modify: `app/diagnostic/DiagnosticClient.tsx`
- Modify: `app/diagnostic/page.module.css`
- Create: `scripts/diagnostic-journey.test.ts`
- Modify: `package.json`

**Interfaces:**
- Each `DiagnosticLevel` exposes exactly three `JourneyAction` recommendations.
- No diagnostic result links directly to `https://com.conan.school`.

- [x] **Step 1: Write the failing model contract**

Assert the existing boundaries `[0, 9, 13, 17, 19]`, exactly three unique recommendations per level, a non-empty reason on every action, and local `/conanmaker/` for levels 4 and 5.

- [x] **Step 2: Verify RED**

Run: `npx tsx --test scripts/diagnostic-journey.test.ts`

Expected: FAIL because levels expose the old `ctas` shape and external Conan URLs.

- [x] **Step 3: Replace `ctas` with reasoned recommendations**

Change `DiagnosticLevel.ctas` to `DiagnosticLevel.recommendations: [JourneyAction, JourneyAction, JourneyAction]`. Preserve all existing questions, scores, names, diagnoses, blockage text, and next-step text. Level 1 leads to `/blog/ai-khong-cuop-viec-ban`; level 2 to `/blog/40-bai-viral-tui-hoc-duoc-gi`; level 3 to `/challenges/brain2-21-ngay`; levels 4 and 5 to `/conanmaker/`.

- [x] **Step 4: Render the recommendation dossier**

Replace the two-button row with an ordered recommendation list. Each item renders its index, eyebrow, reason, and label; the first item carries `data-primary="true"`. Keep the reset button and `aria-live` result behavior.

- [x] **Step 5: Verify Diagnostic**

Run: `npx tsx --test scripts/diagnostic-journey.test.ts scripts/subpage-cinema-contract.test.mjs && npm test && npx tsc --noEmit`

Expected: all pass.

- [x] **Step 6: Commit Diagnostic**

```bash
git add app/diagnostic scripts/diagnostic-journey.test.ts package.json
git commit -m "feat: make diagnostic results actionable"
```

### Task 5: Prove the shared handoff on About and close the slice

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/about/page.module.css`
- Modify: `scripts/chapter-handoff-contract.test.mjs`
- Modify: `docs/STATUS.md`
- Modify: `docs/superpowers/plans/2026-07-12-cinema-chapters-journey-spine.md`

**Interfaces:**
- About ends with `<ChapterHandoff journeyKey="about" tone="dark" />`.
- Existing sourced proof manifest remains the only source of public metrics.

- [x] **Step 1: Extend the failing source contract**

Assert About imports and renders the shared handoff after its proof/story content and no longer duplicates the old generic two-link close.

- [x] **Step 2: Verify RED**

Run: `node --test scripts/chapter-handoff-contract.test.mjs`

Expected: FAIL because About still owns its old CTA section.

- [x] **Step 3: Integrate the dark handoff**

Remove the old closing CTA section and its dead CSS. Add the shared handoff without changing sourced proof content, portrait crop, or dossier chapters.

- [x] **Step 4: Run release verification**

Run:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:release
git diff --check
git status --short
```

Expected: every command exits 0; only intended tracked files plus the four preserved Conan files are present.

- [x] **Step 5: Browser QA the slice**

At `1440x900`, `1280x720`, `390x844`, and `320x568`, verify `/about`, `/chat`, and `/diagnostic`: no overflow, no clipped primary link, one clear primary action, visible focus, useful recommendation reasons, correct local routes, and reduced-motion behavior. Save evidence outside the repo under `/tmp/thongphan-cinema-chapters-qa/`.

- [x] **Step 6: Update status and plan evidence**

Record exact test totals, build page count, QA viewports, intentional deviations, and the next planned slice: Library/Reader plus remaining subpage handoffs.

- [x] **Step 7: Commit release evidence**

```bash
git add app/about docs/STATUS.md docs/superpowers/plans/2026-07-12-cinema-chapters-journey-spine.md scripts/chapter-handoff-contract.test.mjs
git commit -m "docs: record Cinema journey spine verification"
```
