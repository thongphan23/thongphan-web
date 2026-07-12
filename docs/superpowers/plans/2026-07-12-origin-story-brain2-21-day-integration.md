# Origin Story + 21 ngày Brain2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a truthful five-act Thông Phan origin story and consolidate the complete 21-day Brain2 challenge into `thongphan.com`, with Week 1 public, Weeks 2–3 protected outside the public repository, safe email continuity, and the insecure legacy runtime fully retired.

**Architecture:** The public Next.js static export owns the homepage bridge, `/about`, the challenge hub, 21 metadata shells and days 01–07. A manual migration pipeline parses the legacy `DAY_CONTENT` object into typed rich-text packages, writes public packages to the repo and protected packages to a private directory outside it. A dedicated Cloudflare Worker on the more-specific `/brain2/21-ngay/api/*` route validates a signed session, rate-limits through D1 and reads immutable day 08–21 packages from a dedicated private KV namespace; a separately versioned email campaign may never select the 210 legacy queue rows.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, Node test runner + `tsx`, `parse5`, Cloudflare Workers/Wrangler 4, D1, dedicated Workers KV, existing Unified Cinema/GSAP motion system, Playwright/Chrome for rendered QA.

**Design source:** `docs/superpowers/specs/2026-07-12-origin-story-brain2-21-day-integration-design.md`

## Global Constraints

- Canonical hub is exactly `/brain2/21-ngay`; lessons are `/brain2/21-ngay/ngay-01` through `ngay-21`.
- Only the 21-day program is in scope. Private Brain2 chat, vault, embeddings, import and `/Users/rio/brain2-app` are excluded.
- Week 1 is public. Real content for days 08–21 may not enter the public Git index, CI artifact, `.next`, `out`, source maps or Wrangler bundle.
- The public repo may track protected metadata/checksums only.
- Do not reuse exposed passcode `0203`; production access code has at least 128 bits of entropy.
- Protected responses must bypass `thongphan-com-router`, set `Cache-Control: private, no-store, max-age=0`, `Vary: Cookie`, `X-Robots-Tag: noindex, nofollow`, and fail closed.
- Use a new KV namespace bound only to `thongphan-brain2-access-api`; never use the shared Pages `KV` binding.
- The 210 audited legacy email rows remain unsent and classified `legacy-v0`; the sender selects only `brain2-2026-v1`.
- Source of truth for syllabus and lesson timing is the actual `DAY_CONTENT` object, not `index.html` roadmap cards.
- Remove the false global `15 phút/ngày` promise. Render honest per-day estimates from the migrated lesson.
- No AI-generated visual may impersonate a real historical event. Historical imagery requires owned/archive permission or renders as a sourced typographic artifact.
- Story facts render only through the typed evidence manifest. The approved debt wording is a first-person account, not audited financial data.
- Keep the six existing homepage chapter IDs; the origin bridge stays inside ACT 03.
- Use `tui` for Thông and `bạn` for the visitor in public website copy.
- Preserve reduced-motion, keyboard, 44px targets, focus restoration, one H1/main, face-safe crops and zero horizontal overflow.
- No new animation framework, LMS, SSO, payment flow, streak economy or leaderboard.
- Never log or screenshot email addresses, access codes, cookies, protected lesson phrases, reflection bodies or raw IPs.
- Do not activate R2 or any new paid service.

---

## File Structure

### Story and proof

- `content/proof/origin-story-evidence.json` — five acts, claim IDs, source classification, public citations and approved asset metadata.
- `lib/origin-story-evidence.ts` — validates the manifest and returns a public DTO without local paths or hashes.
- `components/origin-story/OriginStory.tsx` — five-act server composition.
- `components/origin-story/OriginStoryTrackedLink.tsx` — minimal analytics client boundary.
- `components/origin-story/OriginStory.module.css` — alternating Cinema/paper acts and mobile recomposition.
- `components/home-cinema/HomeOriginBridge.tsx` — compact ACT 03 causal bridge.
- `public/images/about/origin/*` — only approved derivatives with source records.

### Brain2 public content and UI

- `content/brain2/manifest.json` — safe metadata for all 21 days and protected checksums.
- `content/brain2/public/ngay-01.json` … `ngay-07.json` — complete public packages only.
- `lib/brain2/lesson-contract.ts` — shared schema/types/validator.
- `lib/brain2/lessons.ts` — public selectors and canonical route helpers.
- `lib/brain2/structured-data.ts` — Course, ItemList and LearningResource builders.
- `lib/brain2/progress.ts` — versioned anonymous local progress functions.
- `components/brain2/*` — roadmap, lesson document, rich-text renderer, prompt copy, typed analytics, progress and access gate.
- `app/brain2/21-ngay/page.tsx` — canonical hub.
- `app/brain2/21-ngay/[day]/page.tsx` — 21 static shells, seven with public body.

### Migration and protection

- `scripts/migrate-brain2-lessons.mjs` — TypeScript-AST extraction plus `parse5` normalization.
- `scripts/validate-brain2-lessons.mjs` — schema, URL, stale-language and public/private boundary validation.
- `scripts/publish-brain2-private.mjs` — uploads private packages by file, verifies round-trip checksum and never prints content.
- `scripts/scan-brain2-private-leaks.mjs` — in-memory fingerprint scan of Git/build/bundles.
- `scripts/snapshot-brain2-legacy.mjs` — creates a private source/reflection/deployment evidence archive outside the repo.
- `workers/brain2-access/*` — dedicated auth/content Worker.
- `wrangler.brain2-access.jsonc` — specific routes, D1 and dedicated KV only.
- `workers/migrations/0002_brain2_access_and_email_campaign.sql` — rate ledger and queue campaign version.

### Release operations

- `ops/brain2-legacy-redirect/_worker.js` — redirect-only Advanced Mode Pages artifact.
- `ops/brain2-legacy-redirect/README.md` — deploy, smoke and rollback commands.
- `docs/BRAIN2_21_DAY_MIGRATION_REPORT.md` — counts/checksums/normalizations without protected copy.
- `docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md` — test/deployment/decommission evidence.

---

### Task 1: Establish the isolated execution baseline and release guardrails

**Files:**
- Modify: `docs/STATUS.md`
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `scripts/brain2-release-boundary.test.mjs`

**Interfaces:**
- Consumes: approved design spec and current 115-test baseline.
- Produces: always-on public-repo boundary test and the dependency needed by the migration parser.

- [ ] **Step 1: Create an isolated worktree and verify baseline**

Use `superpowers:using-git-worktrees` and create `.worktrees/origin-brain2-integration` from `main`. Run:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:release
npm run test:read-release-safety
git diff --check
```

Expected: `115/115`, TypeScript pass, `61/61` static pages, release `10/10`, Read safety `3/3`, and no whitespace errors. Record any baseline-owned dirty files without staging them.

- [ ] **Step 2: Write the failing repository-boundary test**

Create `scripts/brain2-release-boundary.test.mjs` with these exact assertions:

```js
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n')

test('protected Brain2 lessons cannot enter the public repository', () => {
  const forbidden = tracked.filter((path) =>
    /^content\/brain2\/(?:private|protected)\//.test(path) ||
    /^content\/brain2\/public\/ngay-(?:0[8-9]|1\d|2[01])\.json$/.test(path),
  )
  assert.deepEqual(forbidden, [])
})

test('gitignore rejects private Brain2 source and secret variants', async () => {
  const gitignore = await readFile('.gitignore', 'utf8')
  for (const pattern of ['.dev.vars*', '.env*', 'brain2-private/', 'private-content/', '*.brain2-private.json']) {
    assert.ok(gitignore.includes(pattern), pattern)
  }
})
```

- [ ] **Step 3: Run the test RED**

Run: `node --test scripts/brain2-release-boundary.test.mjs`

Expected: FAIL because the new ignore patterns do not exist.

- [ ] **Step 4: Add parser dependency and harden ignores**

Run `npm install --save-dev parse5`. Add to `.gitignore`:

```gitignore
.dev.vars*
.env*
brain2-private/
private-content/
*.brain2-private.json
```

Add `scripts/brain2-release-boundary.test.mjs` to the main `npm test` command. Do not replace the existing test list.

- [ ] **Step 5: Run GREEN and update status**

Run:

```bash
node --test scripts/brain2-release-boundary.test.mjs
npm test
```

Expected: boundary `2/2`; full suite increases from 115 and passes. Update `docs/STATUS.md` to implementation phase with the R2→dedicated-KV and legacy-email quarantine audit amendments.

- [ ] **Step 6: Commit**

```bash
git add .gitignore package.json package-lock.json scripts/brain2-release-boundary.test.mjs docs/STATUS.md
git commit -m "test: lock Brain2 release boundaries"
```

---

### Task 2: Extract and normalize all 21 authoritative legacy lessons

**Files:**
- Create: `lib/brain2/lesson-contract.ts`
- Create: `scripts/migrate-brain2-lessons.mjs`
- Create: `scripts/validate-brain2-lessons.mjs`
- Create: `scripts/fixtures/brain2-legacy-script.js`
- Create: `scripts/brain2-migration.test.mjs`
- Create privately at runtime: `$BRAIN2_PRIVATE_CONTENT_DIR/v1/ngay-08.json` … `ngay-21.json`
- Create: `content/brain2/manifest.json`
- Create: `content/brain2/public/ngay-01.json` … `ngay-07.json`
- Create: `docs/BRAIN2_21_DAY_MIGRATION_REPORT.md`

**Interfaces:**
- Consumes: `BRAIN2_LEGACY_ROOT` defaulting to `/Users/rio/brain2-landing`, `BRAIN2_PRIVATE_CONTENT_DIR` outside repo.
- Produces: `Brain2LessonMeta`, `Brain2LessonPackage`, `Brain2LessonBlock`, public packages, protected private packages and a safe 21-entry manifest.

- [ ] **Step 1: Define the exact lesson contract and failing tests**

Use this public type surface in `lib/brain2/lesson-contract.ts`:

```ts
export type Brain2LessonAccess = 'public' | 'conan-maker'
export type RichTextNode =
  | { type: 'text'; value: string }
  | { type: 'strong' | 'em' | 'code'; children: RichTextNode[] }
  | { type: 'link'; href: string; children: RichTextNode[] }
  | { type: 'break' }

export type Brain2LessonBlock =
  | { id: string; kind: 'prose'; heading?: string; children: RichTextNode[] }
  | { id: string; kind: 'list'; ordered: boolean; items: RichTextNode[][] }
  | { id: string; kind: 'callout'; tone: 'principle' | 'tip' | 'warning' | 'example'; title?: string; children: RichTextNode[] }
  | { id: string; kind: 'prompt'; label: string; text: string }
  | { id: string; kind: 'resources'; title: string; items: Array<{ title: string; href: string; note?: string }> }
  | { id: string; kind: 'deliverable'; title: string; children: RichTextNode[] }

export interface Brain2LessonMeta {
  schemaVersion: 1
  day: number
  slug: string
  week: 1 | 2 | 3
  access: Brain2LessonAccess
  title: string
  promise: string
  objective: string
  estimatedMinutes: { min: number; max: number }
  preview: string
  sourceFragmentSha256: string
  contentSha256: string
  migratedAt: string
  editorialState: 'reviewed'
}

export interface Brain2LessonPackage {
  meta: Brain2LessonMeta
  reason: string
  blocks: Brain2LessonBlock[]
  deliverable: { title: string; body: RichTextNode[] }
  checklist: Array<{ id: string; label: string }>
}
```

`sourceFragmentSha256` hashes the exact UTF-8 `title + "\n" + content` source
fragment. `contentSha256` hashes stable-key-order JSON of only
`{ reason, blocks, deliverable, checklist }`; it excludes metadata, timestamps and the
checksum field itself so public generation and Worker verification use the same
non-recursive algorithm.

`scripts/brain2-migration.test.mjs` must always assert fixture extraction. When
`BRAIN2_LEGACY_ROOT` is explicitly supplied, it additionally requires actual-source
21/21 extraction, exact day order, day 09 title from the actual lesson rather than the
roadmap, seven public/14 protected outputs, no event attributes/buttons/unsafe
protocols, 41 prompt actions retained as prompt blocks, and no protected body in
`manifest.json`. Absence of an explicitly supplied real source is not silently treated
as release parity.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/brain2-migration.test.mjs`

Expected: FAIL because extractor/validator are missing.

- [ ] **Step 3: Implement AST extraction without executing legacy JavaScript**

In `migrate-brain2-lessons.mjs`, use the installed TypeScript compiler API to parse `script.js`, locate the `DAY_CONTENT` variable declaration, and accept only:

```js
ObjectLiteralExpression → numeric PropertyAssignment → ObjectLiteralExpression
title → StringLiteral
content → NoSubstitutionTemplateLiteral
```

Reject substitutions, calls, computed keys, duplicate days or anything other than exactly 21 entries. Do not `eval`, use `vm`, import or execute `script.js`.

- [ ] **Step 4: Normalize HTML into typed blocks**

Use `parse5.parseFragment`. Treat `div` and `span` only as legacy containers and
unwrap them while preserving document order. Preserve the semantics of `p`, `strong`,
`em`, `code`, `ul`, `ol`, `li`, `a`, `br`, `pre`, `h2` and `h3`.

Before stripping attributes, statically pair each of the 41 copy buttons with the
literal element ID referenced by the narrow pattern
`document.getElementById('<id>').textContent`; reject any other button program. Create
one `prompt` block from the target's text and the button's readable label, then remove
the legacy button. Never execute the handler. An unpaired `pre` becomes a selectable
working-document prompt with the explicit fallback label `Mẫu làm việc`.

Convert safe `https:` anchors into resource/link nodes. Drop every `style`, `id`,
`class`, `onclick`, `onmouseover` and `onmouseout` after extraction, and reject scripts,
forms, inputs, images, iframes, duplicate prompt targets and unsafe URLs. React renders
nodes directly; no lesson uses `dangerouslySetInnerHTML`.

- [ ] **Step 5: Apply explicit editorial normalization**

The migration must:

- derive canonical titles from each actual `DAY_CONTENT` lesson;
- map the verified syllabus in the design audit, including day 09 `Brain2 → viết bài viral` and day 15 `Đo sức khỏe Brain2`;
- parse each source range into per-day `estimatedMinutes: { min, max }` (from 20–30
  through 60–90), render the range verbatim and reject any value outside 10–120;
- remove live workshop, Zoom, Zalo urgency, Gemini Brain2-chat CTA, Antigravity-only paths, passcode, reflection wall, `sachmoi.net`, local machine paths and unverified note/share/member figures;
- normalize `mày`/`anh em` public instructions to `bạn` while leaving quoted source titles unchanged;
- document every removed/changed class of material in the migration report without printing protected copy.

- [ ] **Step 6: Enforce private target outside repo**

Resolve `BRAIN2_PRIVATE_CONTENT_DIR` with `realpath`. Reject if it is inside the repository, `.next`, `out` or `/tmp`. Write days 08–21 only there. Write days 01–07 and the body-free manifest to tracked content paths.

- [ ] **Step 7: Run migration and validators**

Run:

```bash
BRAIN2_LEGACY_ROOT=/Users/rio/brain2-landing \
BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 \
node scripts/migrate-brain2-lessons.mjs --write

BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 \
node scripts/validate-brain2-lessons.mjs

BRAIN2_LEGACY_ROOT=/Users/rio/brain2-landing \
node --import tsx --test scripts/brain2-migration.test.mjs
```

Expected: 21/21 found; public 7; protected 14; 41 prompt actions retained; 65 external source links inventoried; no stale banned string; tests pass. `git status` must show only manifest + seven public packages, never private packages.

- [ ] **Step 8: Commit**

```bash
git add lib/brain2 scripts/migrate-brain2-lessons.mjs scripts/validate-brain2-lessons.mjs scripts/fixtures/brain2-legacy-script.js scripts/brain2-migration.test.mjs content/brain2 docs/BRAIN2_21_DAY_MIGRATION_REPORT.md package.json
git commit -m "feat: migrate canonical Brain2 lessons"
```

---

### Task 3: Generate safe public lesson data and route contracts

**Files:**
- Create: `scripts/generate-brain2-data.mjs`
- Create: `scripts/generate-brain2-data.test.mjs`
- Create: `lib/brain2/brain2-data.generated.ts`
- Create: `lib/brain2/lessons.ts`
- Create: `lib/brain2/structured-data.ts`
- Modify: `package.json`
- Modify: `lib/site-route-mode.ts`
- Modify: `components/site-chrome/motion-profile.ts`
- Modify: `scripts/site-route-mode.test.ts`
- Modify: `scripts/motion-atmosphere-contract.test.ts`

**Interfaces:**
- Consumes: body-free manifest plus seven public packages.
- Produces: `getBrain2LessonMeta`, `getPublicBrain2Lesson`, `getBrain2LessonParams`, `brain2LessonHref`, `buildBrain2CourseStructuredData`, `buildBrain2LessonStructuredData`, route-mode contracts.

- [ ] **Step 1: Write failing generator and route tests**

Assert:

```ts
getBrain2LessonParams().length === 21
getPublicBrain2Lesson('ngay-01')?.blocks.length > 0
getPublicBrain2Lesson('ngay-08') === null
getBrain2LessonMeta('ngay-21')?.access === 'conan-maker'
brain2LessonHref(9) === '/brain2/21-ngay/ngay-09'
buildBrain2CourseStructuredData().hasPart.length === 21
buildBrain2LessonStructuredData('ngay-08').isAccessibleForFree === false
```

Route mode expectations:

```ts
routeModeForPath('/brain2/21-ngay') === 'evidence-dossier'
routeModeForPath('/brain2/21-ngay/ngay-01') === 'editorial-light'
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/generate-brain2-data.test.mjs scripts/site-route-mode.test.ts scripts/motion-atmosphere-contract.test.ts`

Expected: missing generator/selectors and wrong route modes.

- [ ] **Step 3: Implement generator and selectors**

The generated file may contain all metadata and only the seven public packages. Export exact functions:

```ts
export function getBrain2LessonMeta(slug: string): Brain2LessonMeta | null
export function getPublicBrain2Lesson(slug: string): Brain2LessonPackage | null
export function getBrain2LessonParams(): Array<{ day: string }>
export function brain2LessonHref(day: number): string
```

Validate every content checksum again before code generation.

Build structured data only from the safe generated data. The hub emits one `Course`
with a 21-item `ItemList`; every public lesson emits `LearningResource` plus
previous/next canonical URLs. Protected shells emit no lesson body or prompt in JSON-LD.

- [ ] **Step 4: Add build hooks and route intensity**

Add `generate-brain2` before `next dev` and `next build`. Exact `/brain2/21-ngay` is dossier-dark; its lesson prefix is editorial-light. Reader-detail ambience remains none/minimal.

- [ ] **Step 5: Run GREEN and commit**

```bash
npm run generate-brain2
node --import tsx --test scripts/generate-brain2-data.test.mjs scripts/site-route-mode.test.ts scripts/motion-atmosphere-contract.test.ts
git add package.json scripts/generate-brain2-data.mjs scripts/generate-brain2-data.test.mjs lib/brain2 lib/site-route-mode.ts components/site-chrome/motion-profile.ts scripts/site-route-mode.test.ts scripts/motion-atmosphere-contract.test.ts
git commit -m "feat: generate public Brain2 lesson data"
```

---

### Task 4: Build the canonical hub and public lesson reader

**Files:**
- Create: `app/brain2/21-ngay/page.tsx`
- Create: `app/brain2/21-ngay/page.module.css`
- Create: `app/brain2/21-ngay/[day]/page.tsx`
- Create: `app/brain2/21-ngay/[day]/page.module.css`
- Create: `components/brain2/Brain2Roadmap.tsx`
- Create: `components/brain2/Brain2LessonDocument.tsx`
- Create: `components/brain2/Brain2RichText.tsx`
- Create: `components/brain2/Brain2PromptCopy.tsx`
- Create: `components/brain2/Brain2Analytics.tsx`
- Create: `components/brain2/Brain2ProtectedLesson.tsx` as a metadata-only locked shell.
- Create: `components/brain2/Brain2.module.css`
- Create: `scripts/brain2-route-contract.test.ts`
- Modify: `scripts/static-route-contract.test.mjs`

**Interfaces:**
- Consumes: safe generated metadata/packages.
- Produces: hub, 21 static route shells, rich-text renderer, copyable prompts and the exact anonymous event union.

- [ ] **Step 1: Write the failing route contract**

Assert one H1/main, canonical hub, 21 static params, days 01–07 full public body, day 08 uses `Brain2ProtectedLesson`, no `dangerouslySetInnerHTML`, no `15 phút/ngày`, no chat/vault claims, previous/next canonical links, day-07/day-21 contextual handoffs, hub Course/ItemList JSON-LD, public LearningResource JSON-LD and protected-day `robots: { index: false, follow: true }`.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/brain2-route-contract.test.ts scripts/static-route-contract.test.mjs`

Expected: routes/components missing.

- [ ] **Step 3: Implement the hub**

The hub contains:

- promise `21 ngày để biến những gì bạn đã sống thành một hệ thống có thể dùng lại`;
- honest note `Mỗi ngày một đầu ra; thời lượng thay đổi theo độ sâu của bài`;
- three-week map sourced only from actual lesson metadata;
- explicit public/Conan Maker labels in text;
- before/after and a CTA into day 01;
- existing signup form only after Task 8 makes its promise truthful.

Render the safe `Course` and `ItemList` through the existing `JsonLd` component. Mount
`Brain2Analytics` to dispatch `brain2_hub_viewed` once per page view with no visitor
identifier.

- [ ] **Step 4: Implement public reader and rich text**

Render `RichTextNode` recursively with React elements. `link` nodes use secure external anchors or internal `Link`; all other node types are exhaustive and unknown nodes throw during generation, not runtime. Prompt copy controls retain selectable text, announce `Đã sao chép` via `aria-live`, and dispatch only `brain2_prompt_copied` with `{ day, blockId }`.

- [ ] **Step 5: Implement 21 static shells**

Use `generateStaticParams`, `dynamicParams = false`, `notFound()` for invalid slug and safe metadata. Public days render `Brain2LessonDocument`; protected days render title/objective/preview plus the protected client shell, never a body import. Dispatch `brain2_lesson_opened` with day/access only. Day 07 ends at the Conan Maker access decision; day 21 ends with reflective completion and a tracked Conan Maker continuation.

The analytics component exposes only this union:

```ts
export type Brain2Event =
  | { name: 'brain2_hub_viewed' }
  | { name: 'brain2_lesson_opened'; detail: { day: number; access: Brain2LessonAccess } }
  | { name: 'brain2_access_gate_viewed'; detail: { day: number } }
  | { name: 'brain2_access_granted'; detail: { day: number } }
  | { name: 'brain2_access_failed'; detail: { day: number; category: 'invalid' | 'rate-limited' | 'unavailable' } }
  | { name: 'brain2_prompt_copied'; detail: { day: number; blockId: string } }
  | { name: 'brain2_lesson_completed'; detail: { day: number } }
  | { name: 'brain2_conan_handoff_clicked'; detail: { placement: 'day-07' | 'day-21' | 'hub' } }
```

- [ ] **Step 6: Style and test**

Dark Cinema hub; warm paper reader; 65–72 character body; 44px controls; single-column mobile; no sticky trap; motion attributes only on opted-in surfaces.

Run:

```bash
node --import tsx --test scripts/brain2-route-contract.test.ts scripts/static-route-contract.test.mjs
npx tsc --noEmit
npm run build
```

Expected: new routes generate; unknown lesson absent; public reader is static; protected body absent.

- [ ] **Step 7: Commit**

```bash
git add app/brain2 components/brain2 scripts/brain2-route-contract.test.ts scripts/static-route-contract.test.mjs
git commit -m "feat: add canonical Brain2 challenge reader"
```

---

### Task 5: Add anonymous progress, resume and protected access UI

**Files:**
- Create: `lib/brain2/progress.ts`
- Create: `components/brain2/Brain2ProgressClient.tsx`
- Modify: `components/brain2/Brain2ProtectedLesson.tsx`
- Create: `components/brain2/Brain2AccessGate.tsx`
- Create: `scripts/brain2-progress.test.ts`
- Modify: `components/brain2/Brain2Roadmap.tsx`
- Modify: `components/brain2/Brain2LessonDocument.tsx`

**Interfaces:**
- Produces: `readBrain2Progress(): Brain2Progress`, `markBrain2LessonComplete(slug: string, completedAt?: Date): Brain2Progress`, `recordBrain2LessonOpened(slug: string): Brain2Progress`, `nextBrain2Lesson(progress: Brain2Progress): string`, access API client at `/brain2/21-ngay/api/*`.

- [ ] **Step 1: Write failing pure progress tests**

Lock storage shape:

```ts
{
  version: 1,
  completed: { 'ngay-01': '2026-07-12T09:00:00.000Z' },
  lastOpened: 'ngay-02'
}
```

Reject unknown slugs, malformed JSON, version mismatch and protected completion before content load. Store no email, code or answer content.

- [ ] **Step 2: Run RED and implement pure functions**

Run: `node --import tsx --test scripts/brain2-progress.test.ts`

Expected RED, then GREEN after `progress.ts` implementation.

- [ ] **Step 3: Implement client interactions**

- Hub shows `Tiếp tục ngày …` only after hydration.
- Lesson completion is a semantic checkbox/button.
- Protected shell first calls `GET /brain2/21-ngay/api/access`.
- Unauthorized shows the code gate.
- Authorized fetches `GET /brain2/21-ngay/api/lessons/ngay-XX`.
- `POST /access` sends at most `{ code }`; the code never enters storage/analytics.
- `DELETE /access` clears the session.
- 401 shows gate, 429 shows `Thử lại sau`, 503 shows a truthful retry state.
- Gate open uses `role="dialog"`, `aria-modal="true"`, an initial focus target, Tab/Shift+Tab containment, Escape close and trigger-focus restoration.
- Gate view, coarse failure and success dispatch only the approved typed events; lesson completion dispatches day only.

- [ ] **Step 4: Verify keyboard and reduced motion locally**

Run focused tests and a local rendered smoke for prompt copy, completion, resume, access-gate focus/Escape/restoration and 390px width.

- [ ] **Step 5: Commit**

```bash
git add lib/brain2/progress.ts components/brain2 scripts/brain2-progress.test.ts
git commit -m "feat: add Brain2 lesson progress and access states"
```

---

### Task 6: Build the dedicated protected-content Worker

**Files:**
- Create: `workers/brain2-access/types.ts`
- Create: `workers/brain2-access/auth.ts`
- Create: `workers/brain2-access/cookie.ts`
- Create: `workers/brain2-access/rate-limit.ts`
- Create: `workers/brain2-access/content.ts`
- Create: `workers/brain2-access/http.ts`
- Create: `workers/brain2-access/index.ts`
- Create: `wrangler.brain2-access.jsonc`
- Create: `workers/migrations/0002_brain2_access_and_email_campaign.sql`
- Create: `scripts/brain2-access-worker.test.ts`

**Interfaces:**
- Routes: `GET|POST|DELETE /brain2/21-ngay/api/access`, `GET /brain2/21-ngay/api/lessons/:slug`.
- Bindings: `DB`, `BRAIN2_CONTENT`, `BRAIN2_ACCESS_CODE_HASH`, `BRAIN2_SESSION_SECRET`.

- [ ] **Step 1: Write failing security tests with D1/KV mocks**

Cover correct/incorrect/malformed hash; missing secrets; wrong method/origin/content type; body over 1KB; five 401 failures then 429; D1 failure 503; valid/expired/wrong-audience/tampered cookie; day 07/22/path traversal 404; missing/tampered KV 503; authorized day 08/21 success; no protected bytes in all failures.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/brain2-access-worker.test.ts`

Expected: Worker modules missing.

- [ ] **Step 3: Implement crypto and cookie contract**

Use Web Crypto HMAC-SHA256 and Cloudflare's documented
`crypto.subtle.timingSafeEqual`. `BRAIN2_ACCESS_CODE_HASH` is exactly
`sha256:<base64url-32-byte-digest>`; malformed prefixes/lengths fail closed. Cookie:

```text
__Secure-tp_b2_session=<payload>.<signature>;
HttpOnly; Secure; SameSite=Lax; Path=/brain2/21-ngay; Max-Age=2592000
```

Payload is only `{ v: 1, aud: 'brain2-21', iat, exp }`. Sign/verify includes the current access-code hash so code rotation invalidates sessions. Do not log tokens or raw headers.

- [ ] **Step 4: Implement D1 rate ledger**

Migration creates a STRICT `brain2_access_failures` table and `(client_key, failed_at)` index. Store only `base64url(first16bytes(HMAC-SHA256(sessionSecret, "rate:v1:" + CF-Connecting-IP)))`; never raw IP/UA. Enforce five failures in rolling ten minutes and fail closed when D1 is unavailable.

- [ ] **Step 5: Implement KV content validation**

Accept only 08–21 through a compile-time slug→key/checksum map generated from the public protected manifest. Fetch immutable KV value, enforce size ceiling, SHA-256, JSON schema and content checksum before returning structured blocks.

Every protected response sets:

```text
Cache-Control: private, no-store, max-age=0
Pragma: no-cache
Vary: Cookie
X-Content-Type-Options: nosniff
X-Robots-Tag: noindex, nofollow
Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
```

- [ ] **Step 6: Configure isolated routes**

`wrangler.brain2-access.jsonc` sets `workers_dev: false`, `preview_urls: false`, D1 binding and the new dedicated KV binding only. Routes are the exact `thongphan.com` and `www.thongphan.com` `/brain2/21-ngay/api/*` patterns, more specific than the global router.

- [ ] **Step 7: Run GREEN and dry-run bundle**

```bash
node --import tsx --test scripts/brain2-access-worker.test.ts
npx wrangler deploy --dry-run --config wrangler.brain2-access.jsonc --outdir /tmp/brain2-worker-dry-run
```

Expected: all security tests pass; bundle contains no secret or real protected content.

- [ ] **Step 8: Commit**

```bash
git add workers/brain2-access workers/migrations/0002_brain2_access_and_email_campaign.sql wrangler.brain2-access.jsonc scripts/brain2-access-worker.test.ts
git commit -m "feat: protect Conan Maker Brain2 lessons"
```

---

### Task 7: Publish protected packages safely and prove zero leakage

**Files:**
- Create: `scripts/publish-brain2-private.mjs`
- Create: `scripts/scan-brain2-private-leaks.mjs`
- Create: `scripts/brain2-private-publish.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: private packages outside repo, manifest checksums, dedicated KV namespace ID supplied at execution.
- Produces: immutable keys `brain2:21:2026-07-12.1:day:08` … `day:21`, round-trip report and release gate.

- [ ] **Step 1: Write failing path, key and canary tests**

Test outside-repo enforcement, `--path` upload command construction, immutable release prefix, 14 unique keys, checksum round-trip, and leak detection of a synthetic canary in Git/out/bundle.

- [ ] **Step 2: Run RED and implement publisher**

The publisher invokes Wrangler with `kv key put KEY --path FILE --remote`, never places content on the command line, never overwrites a key, reads every value back, compares checksum and prints only day/key/status.

- [ ] **Step 3: Implement real-private leak scanner**

Read private packages in memory, create normalized 12-token fingerprints, scan `git ls-files`, `.next/static`, `out`, source maps and Worker dry-run bundle. Report only violating file paths/day counts, never the phrase. Also scan raw code/session secrets sourced from Keychain without printing them.

- [ ] **Step 4: Run GREEN**

```bash
node --test scripts/brain2-private-publish.test.mjs
BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 npm run test:brain2-private-boundary
```

Expected: publisher tests pass; real-private scan reports zero leak.

Add this exact package script:

```json
"test:brain2-private-boundary": "node scripts/scan-brain2-private-leaks.mjs"
```

- [ ] **Step 5: Commit**

```bash
git add scripts/publish-brain2-private.mjs scripts/scan-brain2-private-leaks.mjs scripts/brain2-private-publish.test.mjs package.json
git commit -m "test: enforce Brain2 private content isolation"
```

---

### Task 8: Quarantine legacy email and ship campaign v2 safely

**Files:**
- Modify: `workers/migrations/0002_brain2_access_and_email_campaign.sql`
- Create: `workers/brain2-campaign.ts`
- Modify: `workers/api/signup.ts`
- Modify: `functions/api/signup.ts`
- Modify: `workers/api/email-content.ts`
- Modify: `workers/api/email-drip.ts`
- Create: `wrangler.brain2-email.toml`
- Modify: `components/SignupForm.tsx`
- Modify: `app/brain2/21-ngay/page.tsx`
- Create: `scripts/brain2-email-campaign.test.ts`

**Interfaces:**
- Queue versions: existing/default `legacy-v0`; new `brain2-2026-v1`.
- Sender provider: existing Brevo account via encrypted `BREVO_API_KEY` secret.
- Emails contain public metadata + canonical URL only.

- [ ] **Step 1: Write failing queue quarantine and email tests**

Assert migration adds `campaign_version TEXT NOT NULL DEFAULT 'legacy-v0'`; sender SQL contains `campaign_version = 'brain2-2026-v1'`; all 21 email templates exist; no placeholder phrase; protected bodies/prompts absent; day URL canonical; unsubscribe link present; no unauthenticated `/trigger`; duplicate API error maps from `message` in UI; the canonical hub renders `SignupForm` with `challengeSlug="brain2-21-ngay"` only after the v2 contract exists.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/brain2-email-campaign.test.ts`

Expected: current sender selects all pending rows, only day 4 is real, trigger is public and UI mishandles `message`.

- [ ] **Step 3: Extend schema additively**

Add `campaign_version`, `attempt_count`, `last_attempt_at` and a campaign/status/schedule index without rewriting legacy rows. Verify production read-only counts still show exactly 210 `legacy-v0` pending before any sender deploy.

- [ ] **Step 4: Generate 21 truthful link emails**

Use safe manifest metadata. Day 1–7 link to public lessons. Day 8–21 state Conan Maker access and link to the locked shell; never embed protected content. Replace `15 phút` and placeholder copy with actual per-day estimates/objectives.

- [ ] **Step 5: Harden signup and scheduling**

New signups enqueue only `brain2-2026-v1`. Day 1 schedules within five minutes; days 2–21 schedule at 09:00 Asia/Ho_Chi_Minh with explicit UTC conversion. Signup returns the stable JSON shape `{ success, message, signup_id? }`; the UI uses `message ?? error` on failure. Keep the form filled after network failure. Only now mount the form in the canonical hub.

- [ ] **Step 6: Harden sender**

Build a new versioned sender around the Brevo transactional API with encrypted secret; do not copy the legacy Brevo runtime. Scheduled handler selects only v1, honors unsubscribe, limits batch, increments attempts and redacts PII from logs. Remove public trigger; an authenticated smoke path requires `BRAIN2_EMAIL_ADMIN_SECRET` and is absent from normal navigation. Commit `wrangler.brain2-email.toml` with `[triggers] crons = []` so the first production upload is provably inert.

- [ ] **Step 7: Run GREEN and controlled provider health check**

Run unit tests first. Then check Brevo credential health without sending and without printing secret/account data. Do not enable cron yet.

- [ ] **Step 8: Commit**

```bash
git add workers/migrations workers/brain2-campaign.ts workers/api/signup.ts functions/api/signup.ts workers/api/email-content.ts workers/api/email-drip.ts wrangler.brain2-email.toml components/SignupForm.tsx app/brain2/21-ngay/page.tsx scripts/brain2-email-campaign.test.ts
git commit -m "fix: version Brain2 email campaign safely"
```

---

### Task 9: Add the typed origin-story evidence system

**Files:**
- Create: `content/proof/origin-story-evidence.json`
- Create: `lib/origin-story-evidence.ts`
- Create: `scripts/origin-story-evidence.test.ts`
- Modify: `content/library/proof-stack-thong-phan-2026.md`
- Modify: `content/blog/10-nam-lam-marketing-toi-hoc-duoc-gi.md`
- Modify: `content/blog/ai-khong-cuop-viec-ban.md`
- Modify: `content/blog/xay-brain2-voi-obsidian.md`
- Regenerate: `lib/library-data.generated.ts`
- Regenerate: `lib/blog-data.generated.ts`

**Interfaces:**
- Produces: five ordered acts and public evidence DTO; components cannot hardcode factual claims.

- [ ] **Step 1: Write failing evidence tests**

Assert exactly five ordered acts; every factual sentence references a reviewed/permitted claim; debt phrase appears once; source types are only `personal-account`, `owned-archive`, `public-press`, `system-record`; public DTO strips `/Users/`, hashes and private paths; historical acts reject generated assets; local derivatives verify SHA-256/dimensions/focal point. Scan the three related public blog sources and reject the audited unsupported patterns `CNN Travel`, `VTV3`, `60 triệu/ngày`, `2,847`, `7,200+`, global `15 phút/ngày` and changing share/member counts unless a manifest claim explicitly permits them.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/origin-story-evidence.test.ts`

Expected: manifest/module missing.

- [ ] **Step 3: Build manifest from approved sources**

Act sources:

- HSTL rise: personal account plus public VnExpress/Kênh14/Vietnam News/Conan references.
- HSTL core-product/debt: user-approved personal account; do not claim third-party audit or settlement.
- Content rebuild: 14-month/12k-share Brain2 story plus public library companion.
- Brain2/system: public `brain2-dang-chay-that` companion and release-safe system record.

Do not render unvalidated six-restaurant, CNN/VTV3, staffing, revenue or current-note-count claims.

- [ ] **Step 4: Resolve visuals truthfully**

Use existing owned current speaker derivative for present-day acts. For HSTL acts, use a verified press-source typographic artifact until an owned archive photo with permission is available. Do not download/republish a press photo without rights and do not generate a fake historical scene. The ImageGen challenge slate may appear only as a disclosed editorial metaphor in Act 5. If no new owned derivative is produced, do not create an empty `public/images/about/origin` directory.

- [ ] **Step 5: Extend public proof note and regenerate**

Add a concise origin-source ledger to `proof-stack-thong-phan-2026.md`. Normalize the
three related public blog sources so HSTL uses verified press links plus the approved
personal-account consequence, Brain2 uses no unmanifested changing counts, and the
challenge uses honest variable duration. Preserve each article's thesis and natural
Vietnamese voice. Then run `npm run generate-library` and `npm run generate-blog`.

- [ ] **Step 6: Run GREEN and commit**

```bash
node --import tsx --test scripts/origin-story-evidence.test.ts
npm run generate-library
npm run generate-blog
git add content/proof/origin-story-evidence.json lib/origin-story-evidence.ts scripts/origin-story-evidence.test.ts content/library/proof-stack-thong-phan-2026.md content/blog/10-nam-lam-marketing-toi-hoc-duoc-gi.md content/blog/ai-khong-cuop-viec-ban.md content/blog/xay-brain2-voi-obsidian.md lib/library-data.generated.ts lib/blog-data.generated.ts
git commit -m "feat: add sourced origin story evidence"
```

---

### Task 10: Rebuild `/about` as the five-act origin film

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/about/page.module.css`
- Create: `components/origin-story/OriginStory.tsx`
- Create: `components/origin-story/OriginStoryTrackedLink.tsx`
- Create: `components/origin-story/OriginStory.module.css`
- Modify: `lib/seo.ts`
- Create: `scripts/origin-story-route.test.ts`
- Modify: `scripts/subpage-cinema-contract.test.mjs`
- Modify: `scripts/seo-contract.test.mjs`

**Interfaces:**
- Consumes: public evidence DTO.
- Produces: five narrative acts, AboutPage JSON-LD, Brain2 primary handoff and proof secondary action.

- [ ] **Step 1: Write failing route, fact-bypass and SEO tests**

Require five act IDs, one debt rendering from manifest, primary `/brain2/21-ngay`, secondary `/library/proof-stack-thong-phan-2026`, no three-card biography, no hardcoded `2 tỷ` in page/components, `AboutPage` referencing `${SITE_URL}/about#person`, one H1/main, and only `origin_story_brain2_clicked` on the primary action.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/origin-story-route.test.ts scripts/subpage-cinema-contract.test.mjs scripts/seo-contract.test.mjs`

- [ ] **Step 3: Implement five acts with existing Dossier primitives**

Keep the portrait/principle opener. Render five `DossierFolio` acts from the DTO, embed each source artifact beside the relevant consequence, then end with Brain2. No sticky scroll; use existing `data-motion-*` attributes. `OriginStoryTrackedLink` dispatches `origin_story_brain2_clicked` with no claim text or visitor data.

- [ ] **Step 4: Implement visual rhythm**

Alternate ink and paper, use dates/intertitles and real source labels, preserve focal metadata, recompose to one mobile column and keep body copy readable. The VND 2 billion line has normal story scale, not metric-card scale.

- [ ] **Step 5: Run GREEN, build and commit**

```bash
node --import tsx --test scripts/origin-story-route.test.ts scripts/subpage-cinema-contract.test.mjs scripts/seo-contract.test.mjs
npx tsc --noEmit
npm run build
git add app/about components/origin-story lib/seo.ts scripts/origin-story-route.test.ts scripts/subpage-cinema-contract.test.mjs scripts/seo-contract.test.mjs
git commit -m "feat: tell the five-act Thong Phan origin story"
```

---

### Task 11: Add the compact homepage origin bridge without length regression

**Files:**
- Create: `components/home-cinema/HomeOriginBridge.tsx`
- Modify: `components/home-cinema/HomeCinema.tsx`
- Modify: `components/home-cinema/HomeCinema.module.css`
- Modify: `components/home-cinema/HomeTrackedLink.tsx`
- Modify: `scripts/homepage-cinematic-contract.test.mjs`
- Modify: `scripts/homepage-build-contract.test.mjs`

**Interfaces:**
- Consumes: safe public origin DTO.
- Produces: one compact `/about` bridge inside ACT 03 and `origin_story_opened` analytics.

- [ ] **Step 1: Write the failing compactness contract**

Lock the same six homepage sections and chapter nav. Require the bridge inside `#proof`, exactly one `/about` CTA, the three approved causal lines and only `origin_story_opened` on that CTA. Reject a new `data-home-section`, full-height bridge, new H1 or duplicate fact.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test scripts/homepage-cinematic-contract.test.mjs scripts/homepage-build-contract.test.mjs`

- [ ] **Step 3: Implement in ACT 03 header right column**

Do not add a row below the contact sheet. Use a small sourced artifact label, three lines and tracked action. Maintain current ACT 03 fit at `1280x720` and all existing proof interactions.

- [ ] **Step 4: Run rendered regression**

Measure ACT 03 height, header/contact-sheet collisions and short-laptop viewport at `1440x900`, `1280x720`, `1024x768`, `390x844`, `320x568`.

- [ ] **Step 5: Commit**

```bash
git add components/home-cinema scripts/homepage-cinematic-contract.test.mjs scripts/homepage-build-contract.test.mjs
git commit -m "feat: bridge homepage proof to the origin story"
```

---

### Task 12: Rewire navigation, SEO, redirects and journey links

**Files:**
- Modify: `components/site-chrome/site-navigation.ts`
- Modify: `components/site-chrome/SiteChrome.tsx`
- Modify: `lib/site-journey.ts`
- Modify: `app/sitemap.ts`
- Modify: `public/_redirects`
- Modify: `app/challenges/page.tsx`
- Modify: `lib/challenges.ts`
- Modify: `app/classic/page.tsx`
- Modify: `app/diagnostic/diagnostic-model.ts`
- Modify: `app/library/page.tsx`
- Modify: `content/blog/10-nam-lam-marketing-toi-hoc-duoc-gi.md`
- Modify: `content/blog/ai-khong-cuop-viec-ban.md`
- Modify: `content/blog/xay-brain2-voi-obsidian.md`
- Modify: `content/library/ban-do-xay-brain2-trong-21-ngay.md`
- Delete: `app/challenges/[slug]/page.tsx`
- Delete: `app/challenges/[slug]/page.module.css`
- Regenerate: `lib/blog-data.generated.ts`
- Regenerate: `lib/library-data.generated.ts`
- Modify: `scripts/site-journey.test.ts`
- Modify: `scripts/seo-contract.test.mjs`
- Modify: `scripts/chapter-handoff-contract.test.mjs`

**Interfaces:**
- Produces: one canonical URL graph and no duplicate detail route.

- [ ] **Step 1: Write failing canonical-link contracts**

Require primary/mobile `21 ngày Brain2`, About primary handoff to canonical hub, sitemap hub + days 01–07 only, no protected days, and redirects:

```text
/brain2 /brain2/21-ngay 301
/challenges/brain2-21-ngay /brain2/21-ngay 301
```

Search all tracked non-report sources and fail on the old path. Also reject the global
`15 phút/ngày` promise from `lib/challenges.ts` and the related blog/library CTA copy.

- [ ] **Step 2: Run RED, rewire sources and regenerate**

Update canonical links in source Markdown/TS, generic challenges index and footer/default chrome. Regenerate blog/library. Do not hand-edit generated files.

- [ ] **Step 3: Remove duplicate static detail route**

Delete the old `[slug]` challenge implementation after the redirect and canonical route exist. Keep `/challenges` as a future practice-program index pointing to `/brain2/21-ngay`.

- [ ] **Step 4: Run GREEN and commit**

```bash
npm run generate-blog
npm run generate-library
node --import tsx --test scripts/site-journey.test.ts scripts/seo-contract.test.mjs scripts/chapter-handoff-contract.test.mjs
git add components/site-chrome lib/site-journey.ts app/sitemap.ts public/_redirects app/challenges content lib/blog-data.generated.ts lib/library-data.generated.ts scripts
git commit -m "feat: canonicalize the Brain2 journey"
```

---

### Task 13: Add private legacy snapshot and redirect-only retirement artifact

**Files:**
- Create: `scripts/snapshot-brain2-legacy.mjs`
- Create: `ops/brain2-legacy-redirect/_worker.js`
- Create: `ops/brain2-legacy-redirect/README.md`
- Create: `scripts/brain2-legacy-retirement.test.mjs`

**Interfaces:**
- Snapshot output: private chmod-700 directory outside repo with source hashes, reflection JSON, production HTML and all deployment IDs.
- Redirect target: `https://thongphan.com/brain2/21-ngay`, preserving query string, always 301.

- [ ] **Step 1: Write failing snapshot/redirect tests**

Assert redirect handles root/path/API, preserves query, returns 301 rather than 308, has short initial cache, contains no legacy HTML/passcode/API. Assert snapshot refuses repo paths and records current production deployment `8d400ccd-3357-4c51-9a0f-87bd2648b9ff` plus the full deployment list.

- [ ] **Step 2: Implement private snapshot script**

Write source files, live HTML, reflection response and deployment inventory only to `/Users/rio/Private/thongphan-brain2-legacy-2026-07-12`; chmod directory/files; print only filenames, byte counts and hashes.

- [ ] **Step 3: Implement Advanced Mode redirect artifact**

`_worker.js` copies `source.search` to the canonical URL and returns 301 for every method/path. Using 301 ensures a legacy POST is not preserved as POST at the destination.

- [ ] **Step 4: Run tests and snapshot**

```bash
node --test scripts/brain2-legacy-retirement.test.mjs
node scripts/snapshot-brain2-legacy.mjs --output /Users/rio/Private/thongphan-brain2-legacy-2026-07-12
```

Expected: snapshot hashes match audited source; no private snapshot appears in `git status`.

- [ ] **Step 5: Commit**

```bash
git add scripts/snapshot-brain2-legacy.mjs scripts/brain2-legacy-retirement.test.mjs ops/brain2-legacy-redirect
git commit -m "ops: prepare safe Brain2 legacy retirement"
```

---

### Task 14: Run full local verification and rendered QA

**Files:**
- Modify: `package.json`
- Modify: `scripts/qa-site.mjs`
- Create: `scripts/brain2-release-safety.test.mjs`
- Modify: `scripts/bundle-budget.test.mjs`
- Modify: `docs/STATUS.md`
- Create: `docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md`

**Interfaces:**
- Produces: local release-candidate report and screenshots; no external mutation yet.

- [ ] **Step 1: Add release safety tests**

Assert 21 routes, seven indexed public days, 14 noindex shells, canonical redirects, protected manifest/body separation, Worker routes more specific than global router, `workers_dev=false`, `preview_urls=false`, v1-only email sender, the exact privacy-safe analytics event union, hub route JS ≤65KB gzip, public lesson route JS ≤45KB gzip and legacy-retirement artifact cleanliness.

Add `test:brain2` to `package.json` with every stable feature test created in Tasks
1–13. Append `npm run test:brain2` to `test:release`. The migration test uses only its
synthetic fixture unless `BRAIN2_LEGACY_ROOT` is explicitly supplied; release parity
supplies the real path in Step 2.

```json
"test:brain2": "node --import tsx --test scripts/brain2-release-boundary.test.mjs scripts/brain2-migration.test.mjs scripts/generate-brain2-data.test.mjs scripts/brain2-route-contract.test.ts scripts/brain2-progress.test.ts scripts/brain2-access-worker.test.ts scripts/brain2-private-publish.test.mjs scripts/brain2-email-campaign.test.ts scripts/origin-story-evidence.test.ts scripts/origin-story-route.test.ts scripts/brain2-legacy-retirement.test.mjs scripts/brain2-release-safety.test.mjs",
"test:release": "npm run test:build && npm run test:seo && npm run test:bundle && npm run test:brain2"
```

- [ ] **Step 2: Run all automated gates**

```bash
npm test
npx tsc --noEmit
npm run build
BRAIN2_LEGACY_ROOT=/Users/rio/brain2-landing \
BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 \
npm run test:release
npm run test:read-release-safety
BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 npm run test:brain2-private-boundary
BRAIN2_PRIVATE_CONTENT_DIR=/Users/rio/Private/thongphan-brain2-21 node scripts/validate-brain2-lessons.mjs --check-external-links
git diff --check
```

Expected: every gate passes; static count rises by 22 routes; leak count zero.

- [ ] **Step 3: Browser QA matrix**

Cover `/`, `/about`, hub, day 01, day 07, locked day 08 and day 21 at `1440x900`, `1280x720`, `1024x768`, `390x844`, `320x568`, plus reduced motion. Verify no overflow/collision/broken images/console error; no face crop; ACT 03 viewport fit; keyboard menu/copy/progress/gate; public content remains present with JavaScript disabled; protected 401/authorized/tampered session/no-store using local Worker fixtures; and measured cumulative layout shift stays ≤0.1.

- [ ] **Step 4: Content QA**

Check all 21 metadata against actual `DAY_CONTENT`, all 65 external links, all 41 prompt blocks, day durations, removed stale claims and exact five-act story. Proof captions and citations must be natural Vietnamese.

- [ ] **Step 5: Update reports and commit**

Record pass/fail evidence and remaining external deployment steps in `docs/STATUS.md` and the release report.

```bash
git add package.json scripts/qa-site.mjs scripts/brain2-release-safety.test.mjs scripts/bundle-budget.test.mjs docs/STATUS.md docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md
git commit -m "test: verify origin story and Brain2 release candidate"
```

---

### Task 15: Provision, deploy, smoke and retire legacy production

**Files:**
- Modify after resource provisioning: `wrangler.brain2-access.jsonc`
- Modify after controlled email smoke: `wrangler.brain2-email.toml`
- Modify after evidence: `docs/STATUS.md`
- Modify after evidence: `docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md`

**Interfaces:**
- Produces: dedicated KV release, dedicated auth Worker, email v2 Worker, canonical Pages release, legacy redirect-only deployment, deleted insecure deployments and production report.

- [ ] **Step 1: Create isolated Cloudflare resources and apply migration**

Create a dedicated KV namespace `BRAIN2_PROTECTED_CONTENT`. Patch its actual ID into `wrangler.brain2-access.jsonc`. Apply `0002_brain2_access_and_email_campaign.sql` remotely, then read back schema/counts. Expected: 210 legacy rows remain pending with `campaign_version='legacy-v0'`; zero v1 rows before controlled signup.

- [ ] **Step 2: Rotate secrets without exposing them**

Generate a high-entropy Conan Maker code and 32-byte session secret, store raw values only in macOS Keychain service `thongphan-brain2-access`, set only hash/session secrets on `thongphan-brain2-access-api`, and confirm `0203` is absent from repo/bundles.

- [ ] **Step 3: Upload protected release and deploy auth Worker**

Upload all 14 immutable keys, read back checksums, run the real-private leak scan, deploy with `wrangler deploy --strict`, and smoke:

- unauthorized 401/no body;
- valid controlled code issues cookie;
- day 08/21 return correct checksums;
- tampered cookie fails;
- response contains no `X-TP-Router` and retains private/no-store;
- Worker dev/preview hostname is unavailable.

- [ ] **Step 4: Deploy email v2 without sending legacy rows**

Recover the existing Brevo key from an authorized source such as Keychain/password
manager; the encrypted legacy Pages value cannot be read back and must never be
printed or guessed. Set it as an encrypted Worker secret, deploy the versioned sender
while tracked config has `crons = []`, perform one controlled QA signup/email through
the authenticated admin path, and confirm only a v1 row is selected and unsubscribe
works. Then change tracked config to `[triggers] crons = ["*/5 * * * *"]`, redeploy,
verify the trigger, and re-query D1: all 210 legacy-v0 remain unsent. If the credential
cannot be recovered, leave the sender and cron undeployed and record the external
credential blocker rather than weakening the release boundary.

- [ ] **Step 5: Deploy canonical Pages preview and production**

Deploy `out` to a non-production branch of `thongphan-com` and verify Cloudflare's
default `X-Robots-Tag: noindex` preview header. Because preview shares production
D1/KV and is outside the exact access-Worker routes, run only static/read-only route,
SEO, visual and leak QA there—never a real signup or other mutation. Then deploy
branch `main` production and run the full access/signup matrix on
`https://thongphan.com` before retiring legacy. Smoke the Pages origin and apex;
verify canonical redirects, SEO, no protected bytes, and route-specific Worker bypass.

- [ ] **Step 6: Retire the legacy frontend**

Only after canonical production passes, deploy `ops/brain2-legacy-redirect` to Pages
project `brain2-platform`. Verify root, old paths, API paths and query strings all
return 301 to canonical hub and no reflection/passcode/content body. Then explicitly
remove the legacy `REFLECTIONS` KV binding and encrypted Brevo secret bindings from
the Pages project and read back the project configuration before deleting deployments.

- [ ] **Step 7: Remove immutable insecure deployments**

Using the complete three-page private snapshot inventory, delete all 64 old
`brain2-platform` deployments that serve content, including audited deployment
`8d400ccd-3357-4c51-9a0f-87bd2648b9ff`. Keep only the redirect-only deployment.
Do not derive the allowlist from Wrangler's default 25-row first page. Verify every
former immutable URL is no longer publicly reachable.

- [ ] **Step 8: Final production verification and documentation**

Repeat automated production smoke at desktop/mobile/reduced-motion, access/no-store, email-v1-only and redirect/deployment cleanup. Record Pages IDs, Worker versions, KV release prefix, D1 migration result, legacy deletion inventory, screenshots and rollback procedure in `docs/STATUS.md` and release report.

- [ ] **Step 9: Commit, integrate and push production evidence**

```bash
git add wrangler.brain2-access.jsonc wrangler.brain2-email.toml docs/STATUS.md docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md
git commit -m "docs: record origin story and Brain2 production release"
```

Run `superpowers:finishing-a-development-branch`, fast-forward the original `main`
worktree to the reviewed feature branch without staging its pre-existing dirty files,
then run:

```bash
git push origin main:master
```

Expected: remote `master` equals local release-evidence commit; `https://thongphan.com` is canonical; legacy domain is redirect-only; old immutable deployments are gone; no known acceptance criterion remains open.
