# Content Workflow 7 Days Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not dispatch subagents unless anh Thông explicitly requests delegation.

**Goal:** Build, verify and publish the free self-guided Content Workflow Learning Studio at `https://thongphan.com/challenge/content-workflow-7days`.

**Architecture:** Keep the complete public experience inside the existing static-export Next.js app. Store the versioned workbook only in browser `localStorage`, keep validation/export as pure TypeScript, and render seven static lesson routes through one focused client workbench. Reuse the current Experience Registry, route modes, site chrome and Cloudflare Pages release path without adding a dependency, API, database or account boundary.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS Modules, Lucide React, Node test runner, Playwright, Cloudflare Pages static export.

## Global Constraints

- The approved design is `docs/superpowers/specs/2026-08-07-content-workflow-7days-design.md`.
- The exact root route is `/challenge/content-workflow-7days`; lesson routes are `/day-01` through `/day-07` below it.
- The experience is free, immediately accessible and requires no account.
- Workbook content and completion state never leave the learner's browser in v1.
- Do not add D1, KV, R2, Worker, API, authentication, payment, email, community submission or in-product AI generation.
- Do not add npm dependencies; reuse React, CSS, Lucide and browser-native APIs.
- All seven days stay open; progress recommends but never locks a route.
- Completion comes from deterministic artifact validation, never scroll depth or time-on-page.
- Case content is labeled `Case mô phỏng`; it is never presented as a real testimonial or customer result.
- Use Vietnamese for learner-facing copy; keep approved artifact names and required technical names in English.
- Do not touch the canonical dirty worktree or unrelated TPR/Conan Maker artifacts.
- Do not write production UI until anh Thông accepts all required Image Gen concept states.
- Production promotion is authorized by the original request, but only after preview QA and rollback capture pass.

---

## File Map

**Create**

- `app/challenge/content-workflow-7days/page.tsx`: public hub, metadata and readiness entry.
- `app/challenge/content-workflow-7days/page.module.css`: hub presentation matching the accepted concept.
- `app/challenge/content-workflow-7days/[day]/page.tsx`: seven static lesson routes and per-day metadata.
- `app/challenge/content-workflow-7days/[day]/page.module.css`: lesson shell layout when route-local rules are needed.
- `components/content-workflow/ChallengeHubClient.tsx`: readiness, resume and reset behavior on the hub.
- `components/content-workflow/ChallengeWorkbench.tsx`: client lesson/workbook orchestration.
- `components/content-workflow/ContentWorkflow.module.css`: accepted visual system, controls and responsive workbench.
- `lib/content-workflow/content.ts`: typed seven-day curriculum, simulated case, templates and approved public copy.
- `lib/content-workflow/model.ts`: state types, empty state, validation, progress and prompt assembly.
- `lib/content-workflow/storage.ts`: versioned, fail-closed local persistence.
- `lib/content-workflow/export.ts`: safe Markdown export and filename generation.
- `scripts/content-workflow-model.test.ts`: domain, validation and prompt tests.
- `scripts/content-workflow-storage.test.ts`: parser, storage and failure tests.
- `scripts/content-workflow-route-contract.test.mjs`: source/static route, metadata and privacy contracts.
- `scripts/qa-content-workflow.mjs`: rendered desktop/mobile workflow QA and screenshot capture.
- `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`: local/preview/production evidence and fidelity ledger.
- `public/images/challenges/content-workflow-7days-*.webp`: only final generated raster assets accepted by anh Thông and actually consumed by the UI.

**Modify**

- `lib/experiences.ts`: add the public challenge to the registry.
- `lib/site-route-mode.ts`: map the root and lesson prefix to `evidence-dossier`.
- `lib/site-journey.ts`: give the completed challenge a context-specific handoff.
- `app/sitemap.ts`: add root plus seven public lesson routes.
- `scripts/experience-registry.test.ts`: lock the new registry entry and availability.
- `scripts/site-route-mode.test.ts`: lock route mode for hub and lessons.
- `scripts/site-journey.test.ts`: lock the challenge handoff.
- `package.json`: register focused tests and rendered QA only; add no dependency.
- `docs/STATUS.md`: record implementation, QA and deployment state.

---

### Task 1: Generate and approve the visual contract

**Files:**

- Create: project concept images under `docs/visual/content-workflow-7days/` after generation.
- Modify: `docs/superpowers/specs/2026-08-07-content-workflow-7days-design.md` only to record accepted concept paths and exact visual decisions.

**Interfaces:**

- Consumes: approved visual thesis `Content Operations Fieldbook` and existing thongphan.com route chrome.
- Produces: four accepted reference images plus a design inventory used by Tasks 4–6.

- [x] **Step 1: Generate the complete public hub desktop concept**

Use built-in Image Gen with a `ui-mockup` brief at a readable desktop aspect. Lock exact hero copy, readiness section, seven-day output map, one CTA and no invented proof, metrics, pricing, email form, hero kicker or badge.

- [x] **Step 2: Generate the lesson workbench desktop concept**

Show the real three-region anatomy: seven-day rail, lesson canvas and artifact desk. Use realistic Vietnamese field labels from Day 4. Keep all form controls code-native in implementation.

- [x] **Step 3: Generate the lesson workbench mobile concept**

Show 390 px behavior as one ordered column: progress, Học, Xem, Làm, Kiểm. Include focus/error/saved affordances without a sticky footer covering the form.

- [x] **Step 4: Generate the Day 7 completion concept**

Show Starter Kit assembly, six-of-eight completion rule, Markdown export and 14-day continuation as a real success state, not confetti/gamification.

- [x] **Step 5: Inspect and obtain anh Thông's visual approval**

Use `view_image` on every concept. Reject unreadable, generic or off-contract images. Show the accepted set to anh Thông and stop before UI implementation until he explicitly approves it.

- [x] **Step 6: Commit the accepted concept contract**

Run:

```bash
git add docs/visual/content-workflow-7days docs/superpowers/specs/2026-08-07-content-workflow-7days-design.md
git diff --cached --check
git commit -m "design: approve content workflow visual contract"
```

Expected: exactly the accepted concepts and spec path update are committed.

---

### Task 2: Build the curriculum and deterministic domain model with TDD

**Files:**

- Create: `lib/content-workflow/content.ts`
- Create: `lib/content-workflow/model.ts`
- Create: `scripts/content-workflow-model.test.ts`
- Modify: `package.json`

**Interfaces:**

- Produces:
  - `CONTENT_WORKFLOW_DAYS: readonly ContentWorkflowDay[]`
  - `createEmptyChallengeState(): ChallengeStateV1`
  - `validateDay(day: ChallengeDay, state: ChallengeStateV1): DayValidation`
  - `nextChallengeDay(state: ChallengeStateV1): ChallengeDay`
  - `assembleWorkflowPrompt(state: ChallengeStateV1): string`
  - `canCompleteChallenge(state: ChallengeStateV1): boolean`

- [x] **Step 1: Write the failing domain tests**

Cover exact seven slugs, one threshold concept/artifact/gate per day, simulated-case labels, immutable empty state, fail-closed day values, no route locks, each day's minimum gate, six-of-eight final rule and deterministic prompt assembly.

Representative contract:

```ts
assert.deepEqual(CONTENT_WORKFLOW_DAYS.map(({ slug }) => slug), [
  'day-01', 'day-02', 'day-03', 'day-04', 'day-05', 'day-06', 'day-07',
])
assert.equal(validateDay(2, state).valid, false)
assert.match(assembleWorkflowPrompt(readyState), /BRIEF → 3 GÓC KHAI THÁC → OUTLINE/)
assert.equal(canCompleteChallenge(stateWithFiveArtifacts), false)
```

- [x] **Step 2: Run the focused test and verify red**

Run:

```bash
node --import tsx --test scripts/content-workflow-model.test.ts
```

Expected: FAIL because the content/model modules do not exist.

- [x] **Step 3: Implement the smallest complete model**

Use explicit unions and bounded arrays. The core shape must start with:

```ts
export type ChallengeDay = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type ChallengeStateV1 = {
  schemaVersion: 1
  updatedAt: string
  currentDay: ChallengeDay
  completedDays: ChallengeDay[]
  readiness: Record<ReadinessKey, boolean>
  artifacts: ChallengeArtifacts
}
```

Keep validation pure. Do not read browser globals from `model.ts`. Assemble the Master Prompt only from typed artifact fields and preserve user edits separately after initial generation.

- [x] **Step 4: Run the focused test and verify green**

Run the focused test. Expected: all model/content cases pass with zero failure.

- [x] **Step 5: Register the focused test and commit**

Add the new model test to the existing `npm test` command without changing unrelated order.

```bash
git add lib/content-workflow/content.ts lib/content-workflow/model.ts scripts/content-workflow-model.test.ts package.json
git diff --cached --check
git commit -m "feat: add content workflow curriculum model"
```

---

### Task 3: Add fail-closed local persistence and Markdown export with TDD

**Files:**

- Create: `lib/content-workflow/storage.ts`
- Create: `lib/content-workflow/export.ts`
- Create: `scripts/content-workflow-storage.test.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: `ChallengeStateV1`, `createEmptyChallengeState`.
- Produces:
  - `CONTENT_WORKFLOW_STORAGE_KEY = 'tp.content-workflow-7days.v1'`
  - `parseChallengeState(raw: string | null): ChallengeStateV1`
  - `readChallengeState(storage?: StorageLike): ChallengeStateV1`
  - `writeChallengeState(state: ChallengeStateV1, storage?: StorageLike): boolean`
  - `clearChallengeState(storage?: StorageLike): boolean`
  - `buildStarterKitMarkdown(state: ChallengeStateV1): string`
  - `starterKitFilename(now?: Date): string`

- [x] **Step 1: Write the failing persistence/export tests**

Test malformed JSON, extra top-level keys, wrong schema, invalid timestamp, duplicate/out-of-range completed day, excessive evidence/drafts/plan arrays, wrong field types, storage read/write exceptions, exact-key clearing, HTML-like user text remaining inert Markdown text, full eight-section export and UTC timestamp filenames.

- [x] **Step 2: Run the focused test and verify red**

```bash
node --import tsx --test scripts/content-workflow-storage.test.ts
```

Expected: FAIL because storage/export modules do not exist.

- [x] **Step 3: Implement parser, persistence and export**

Use a small injected interface:

```ts
export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
```

On every parser violation return a new empty state. Bound evidence to 20 rows, drafts to exactly three slots, the 14-day plan to at most 14 rows and individual free-text fields to 20,000 characters. Catch storage and clipboard-adjacent failures without blocking lessons.

- [x] **Step 4: Run focused tests and verify green**

Expected: zero failures and no writes outside the single approved key.

- [x] **Step 5: Register and commit**

```bash
git add lib/content-workflow/storage.ts lib/content-workflow/export.ts scripts/content-workflow-storage.test.ts package.json
git diff --cached --check
git commit -m "feat: persist and export content workflow locally"
```

---

### Task 4: Publish discovery contracts and the challenge hub

**Files:**

- Create: `app/challenge/content-workflow-7days/page.tsx`
- Create: `app/challenge/content-workflow-7days/page.module.css`
- Create: `components/content-workflow/ChallengeHubClient.tsx`
- Create: `components/content-workflow/ContentWorkflow.module.css`
- Create: `scripts/content-workflow-route-contract.test.mjs`
- Modify: `lib/experiences.ts`
- Modify: `lib/site-route-mode.ts`
- Modify: `app/sitemap.ts`
- Modify: `scripts/experience-registry.test.ts`
- Modify: `scripts/site-route-mode.test.ts`
- Modify: `package.json`

**Interfaces:**

- Consumes: curriculum, local state functions and accepted hub concept.
- Produces: indexable hub, readiness interaction, resume link and Experience Hub entry.

- [x] **Step 1: Write failing route/discovery tests**

Lock the exact root canonical, H1, primary CTA, readiness keys, seven route links, public registry contract, sitemap entries, evidence-dossier route mode, no signup/email/pricing text and no client-to-server mutation call.

- [x] **Step 2: Run focused tests and verify red**

```bash
node --import tsx --test scripts/content-workflow-route-contract.test.mjs scripts/experience-registry.test.ts scripts/site-route-mode.test.ts
```

- [x] **Step 3: Implement the server hub and discovery entries**

Add registry item `content-workflow-7days` before gated Learn. Use generated/owned media only if its rights and physical file are present. Add eight sitemap paths with release date `2026-08-08`. Map both root and prefix to `evidence-dossier`.

- [x] **Step 4: Implement readiness/resume client behavior**

Read state after hydration. The CTA writes readiness only when the visitor has changed it, then routes to Day 1 or the recommended next day. A missing readiness item shows a corrective message but does not disable navigation.

- [x] **Step 5: Implement accepted hub visuals**

Match the accepted concept exactly: first viewport, section order, copy, palette, typography, spacing and media treatment. Keep one primary CTA and avoid invented badges/cards.

- [x] **Step 6: Verify focused tests and commit**

```bash
git add app/challenge components/content-workflow lib/experiences.ts lib/site-route-mode.ts app/sitemap.ts scripts/content-workflow-route-contract.test.mjs scripts/experience-registry.test.ts scripts/site-route-mode.test.ts package.json
git diff --cached --check
git commit -m "feat: add content workflow challenge hub"
```

---

### Task 5: Build the seven-day workbench and all artifact interactions

**Files:**

- Create: `app/challenge/content-workflow-7days/[day]/page.tsx`
- Create: `app/challenge/content-workflow-7days/[day]/page.module.css`
- Create: `components/content-workflow/ChallengeWorkbench.tsx`
- Modify: `components/content-workflow/ContentWorkflow.module.css`
- Modify: `scripts/content-workflow-route-contract.test.mjs`

**Interfaces:**

- Consumes: `ContentWorkflowDay`, model validation, storage and export helpers.
- Produces: fully interactive Day 1–7 workbench with local state and accessible feedback.

- [x] **Step 1: Expand failing route and privacy contracts**

Assert seven static params, unique metadata/canonical, one H1, no `dangerouslySetInnerHTML`, no `fetch`/XHR/beacon in workbench, real labels/errors, 44 px control contract, reduced-motion CSS and one export/reset path.

- [x] **Step 2: Run focused tests and verify red**

Expected: lesson route/component assertions fail.

- [x] **Step 3: Implement route generation and lesson shell**

`generateStaticParams()` returns exact slugs. Unknown slugs call `notFound()`. Metadata uses the day's approved title and question without duplicating the hub description.

- [x] **Step 4: Implement client state orchestration**

Hydrate once, record the current day, debounce autosave, render a saved timestamp, preserve use when storage fails and keep all days navigable. Use controlled inputs and immutable updates.

- [x] **Step 5: Implement Days 1–4 artifacts**

Render only the fields defined by the curriculum. Evidence rows support add/remove within 3–20 rows. Errors link to the field. Quality Gate focuses an error summary and never overwrites user text.

- [x] **Step 6: Implement Day 5 prompt assembly**

Generate once from Days 1–4 when the saved prompt is empty. Preserve manual edits after that point. Copy uses `navigator.clipboard.writeText` with selection/manual-copy fallback and a restrained live status.

- [x] **Step 7: Implement Day 6 three-run review**

Keep exactly three draft slots. Each slot stores draft, checklist booleans, bounded score and revision note. Completion requires two structurally reviewed drafts; copy must not claim market quality.

- [x] **Step 8: Implement Day 7 packaging**

Render artifact coverage, publish/share state, signal note, One-Pager and 14-day plan. Export a Blob download with the generated Markdown filename. Reset uses a semantic dialog, clears exactly one storage key and returns to the empty hub state.

- [x] **Step 9: Apply accepted desktop/mobile/completion visuals**

Preserve the accepted rail/canvas/artifact-desk container model. Mobile must follow `Học → Xem → Làm → Kiểm` and keep input widths within 320 px.

- [x] **Step 10: Verify focused tests and commit**

```bash
node --import tsx --test scripts/content-workflow-model.test.ts scripts/content-workflow-storage.test.ts scripts/content-workflow-route-contract.test.mjs
git add app/challenge/content-workflow-7days components/content-workflow scripts/content-workflow-route-contract.test.mjs
git diff --cached --check
git commit -m "feat: add seven-day content workflow workbench"
```

---

### Task 6: Integrate journey, documentation and full release gates

**Files:**

- Modify: `lib/site-journey.ts`
- Modify: `scripts/site-journey.test.ts`
- Create: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`
- Modify: `docs/STATUS.md`

**Interfaces:**

- Consumes: complete challenge and existing site journey.
- Produces: one context-correct post-challenge handoff and traceable repository evidence.

- [x] **Step 1: Write the failing journey contract**

Add `content-workflow-challenge` as a distinct `JourneyKey`. Its primary action is the 14-day continuation inside the challenge, and Conan Maker is secondary with reason tied to the next business workflow. Do not reuse the generic Brain2 challenge handoff.

- [x] **Step 2: Implement the journey and update status**

Keep exactly one primary destination and no duplicates. Record file/test/build state without claiming production before deployment.

- [x] **Step 3: Run the focused and full gates**

```bash
node --import tsx --test scripts/content-workflow-model.test.ts scripts/content-workflow-storage.test.ts scripts/content-workflow-route-contract.test.mjs scripts/experience-registry.test.ts scripts/site-route-mode.test.ts scripts/site-journey.test.ts
npm test
npx tsc --noEmit
npm run lint
npm run build
npm run test:release
git diff --check
```

Expected: every command exits 0; static output includes root plus seven lesson HTML files.

- [x] **Step 4: Commit the integrated release candidate**

```bash
git add lib/site-journey.ts scripts/site-journey.test.ts docs/STATUS.md docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md
git diff --cached --check
git commit -m "docs: record content workflow release candidate"
```

---

### Task 7: Rendered fidelity, interaction and accessibility QA

**Files:**

- Create: `scripts/qa-content-workflow.mjs`
- Modify: `package.json`
- Modify: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`
- Modify: UI files only when QA finds a concrete mismatch.

**Interfaces:**

- Consumes: exact `out/` artifact and four accepted concept images.
- Produces: screenshots, workflow evidence and a zero-open-fixable-mismatch fidelity ledger.

- [x] **Step 1: Add the rendered QA runner**

Start a clean-URL static server, launch Playwright Chromium and test 1440×900,
1280×800, 390×844 and 320×568. Capture hub, representative Day 4, Day 7 completion
and mobile workbench screenshots under a dedicated temporary root.

- [x] **Step 2: Exercise the complete core workflow**

Fill readiness, Days 1–5, refresh and verify resume, copy the Master Prompt, fill two
reviewed drafts, assemble Day 7, download Markdown, verify content and then reset.
Assert zero relevant console error, broken image, horizontal overflow or clipped
primary control.

- [x] **Step 3: Inspect accepted concepts and renders together**

Use `view_image` on each accepted concept and its latest render in the same pass.
Record at least: copy, first viewport composition, typography, palette, container
model, asset treatment, responsive behavior, control styling and motion.

- [x] **Step 4: Fix every material mismatch and rerun**

Repeat build/render/inspection until a skilled agency would sign off. No known fixable
visual issue may remain in the final ledger.

- [x] **Step 5: Run accessibility and copy checks**

Verify keyboard-only readiness, lesson navigation, error summary, copy fallback,
dialog focus/escape and reduced motion. Diff above-the-fold visible copy against the
accepted concept list.

- [x] **Step 6: Commit QA automation and fixes**

```bash
git add scripts/qa-content-workflow.mjs package.json docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md app/challenge components/content-workflow public/images/challenges
git diff --cached --check
git commit -m "test: verify content workflow experience"
```

---

### Task 8: Push, preview, production promotion and live verification

**Files:**

- Modify: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`
- Modify: `docs/STATUS.md`

**Interfaces:**

- Consumes: exact verified commit and `out/` artifact.
- Produces: GitHub branch, Cloudflare preview/production IDs, rollback point and live smoke evidence.

- [x] **Step 1: Re-run the final release gate on clean HEAD**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
npm run test:release
git diff --check
```

- [x] **Step 2: Push the exact branch**

```bash
git push origin agent/content-workflow-7days
```

- [x] **Step 3: Capture rollback deployment**

```bash
npx wrangler pages deployment list --project-name thongphan-com
```

Record the current production deployment ID before upload. Stop if it cannot be captured.

- [x] **Step 4: Deploy and test preview**

```bash
challenge_commit=$(git rev-parse HEAD)
npx wrangler pages deploy out --project-name thongphan-com --branch "preview-${challenge_commit}" --commit-hash "${challenge_commit}"
```

Run the full QA runner and HTTP smoke against the returned preview. Confirm the exact
eight routes, `/experiences`, sitemap and disabled Learn boundaries.

- [x] **Step 5: Promote the verified commit to production**

```bash
challenge_commit=$(git rev-parse HEAD)
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash "${challenge_commit}"
```

- [x] **Step 6: Verify canonical production**

Check apex, `www` and Pages origin for root plus seven lesson routes. Verify canonical,
static assets, local-only behavior, Experience Hub discovery, no console errors and
one complete fresh-browser workflow through export.

- [x] **Step 7: Record and push release evidence**

Update the QA report and STATUS with exact source SHA, preview/production IDs, previous
rollback ID, URLs, route fingerprints and pass/fail counts. Re-run document checks,
commit, push and read back the remote branch.

```bash
git add docs/STATUS.md docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md
git diff --cached --check
git commit -m "docs: record content workflow production release"
git push origin agent/content-workflow-7days
```

---

## Plan Self-Review

- Spec coverage: every product, privacy, route, visual, storage, accessibility and release requirement maps to Tasks 1–8.
- Placeholder scan: the plan contains no `TBD`, `TODO`, “similar to” or unspecified implementation step.
- Type consistency: `ChallengeDay`, `ChallengeStateV1`, storage key, route slugs and exported helper names remain identical across tasks.
- Architecture impact: additive static routes and pure local state only; no schema, Worker, provider or account change.
- Ponytail check: no new dependency, backend, import system, PDF renderer, analytics endpoint, form framework or generalized Experience Engine abstraction.
