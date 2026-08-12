# VID Watching Path Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Thông/Codex curate meaningful multi-stage watching paths and present them as optional guided journeys alongside free discovery.

**Architecture:** Persist path, stage and item order in typed D1 tables, validate eligibility against approved M2 video models, and expose separate public/admin path APIs. Add a static-export path shell, local-only progress, a path-aware watch next step, and curated home lanes that disappear cleanly when no path is published.

**Tech Stack:** TypeScript, React 19, Next.js 16 static export, Cloudflare Worker/D1, CSS Modules, existing VID local library and cursor feed.

## Global Constraints

- This plan starts after the content-intelligence plan has an approved M2 contract.
- A watching path is an editorial journey with a problem and outcome, not a playlist alias.
- Required path items must be published, Bunny-ready, fresh and M2.
- Paths with fewer than two videos remain draft and never appear publicly.
- Viewers may ignore paths and freely browse the infinite feed.
- Path progress remains local-only; no user profile or behavioral collection is added.
- Public next-step reasons come from approved editorial/model data, not runtime AI.
- Homepage remains fully usable with zero published paths.

---

### Task 1: Add path schema and invariant contracts

**Files:**
- Create: `workers/vid/migrations/0004_vid_watching_paths.sql`
- Create: `lib/vid/path-contracts.ts`
- Create: `scripts/vid-path-migration.test.ts`
- Create: `scripts/vid-path-contract.test.ts`

**Interfaces:**
- Produces tables `vid_paths`, `vid_path_stages`, `vid_path_items`.
- Produces `WatchingPathDraft`, `PublicWatchingPath`, `validateWatchingPathDraft()`.

- [ ] **Step 1: Write failing migration/invariant tests**

```ts
test('path positions are unique and ordered inside each stage', async () => {
  const db = await pathFixture()
  await insertPathItem(db, { stageId: 'stage-1', videoId: 'video-a', position: 0 })
  await assert.rejects(() => insertPathItem(db, { stageId: 'stage-1', videoId: 'video-b', position: 0 }), /UNIQUE/)
})
```

```ts
test('published path requires two eligible videos and a final action', () => {
  assert.throws(() => validateWatchingPathDraft(oneVideoPath), /at least two videos/)
  assert.throws(() => validateWatchingPathDraft({ ...validPath, finalAction: '' }), /finalAction/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-path-migration.test.ts scripts/vid-path-contract.test.ts`  
Expected: FAIL because migration/contracts do not exist.

- [ ] **Step 3: Create normalized schema**

Path fields: slug, title, summary, problem, high-fit, low-fit, expected outcome, cover URL, status, featured rank, total required seconds, final action, created/updated/published timestamps. Stage fields: title, purpose, position. Item fields: video ID, required flag, reason, notice, expected shift, position.

- [ ] **Step 4: Implement validator**

```ts
export function validateWatchingPathDraft(value: unknown): WatchingPathDraft
export function assertPathGraphAcyclic(items: WatchingPathItemDraft[], prerequisiteEdges: VideoRelationship[]): void
```

Reject unknown keys, duplicate video slugs, duplicate positions, empty reason/shift, cycles, more than 12 stages or 60 videos, and required video after a prerequisite-dependent child.

- [ ] **Step 5: Run tests**

Run: `node --import tsx --test scripts/vid-path-migration.test.ts scripts/vid-path-contract.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add workers/vid/migrations/0004_vid_watching_paths.sql lib/vid/path-contracts.ts scripts/vid-path-migration.test.ts scripts/vid-path-contract.test.ts
git commit -m "feat(vid): add watching path contracts"
```

---

### Task 2: Build path repository and signed editorial operations

**Files:**
- Create: `workers/vid/paths.ts`
- Create: `workers/vid/admin-paths.ts`
- Modify: `workers/vid/index.ts`
- Create: `scripts/vid-path-repository.test.ts`
- Create: `scripts/vid-path-admin.test.ts`

**Interfaces:**
- Produces: `savePathDraft()`, `publishPath()`, `archivePath()`, `getPublicPath()`, `listPublicPaths()`.
- Signed routes:
  - `POST /api/admin/paths`
  - `PUT /api/admin/paths/:id`
  - `POST /api/admin/paths/:id/publish`
  - `POST /api/admin/paths/:id/archive`
  - `GET /api/admin/paths/:id/inspect`

- [ ] **Step 1: Write failing eligibility tests**

```ts
test('publish refuses processing, stale, archived and sub-M2 required videos', async () => {
  for (const reason of ['media_not_ready', 'model_not_m2', 'stale', 'archived']) {
    assert.equal((await publishPath(envFor(reason), 'path-1')).blockedReason, reason)
  }
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-path-repository.test.ts scripts/vid-path-admin.test.ts`  
Expected: FAIL because path repository/routes are absent.

- [ ] **Step 3: Implement transaction-safe draft replacement**

```ts
export async function savePathDraft(env: VidEnv, draft: WatchingPathDraft, actor: string, idempotencyKey: string): Promise<{ pathId: string; status: 'draft' | 'needs_review' }>
export async function publishPath(env: VidEnv, pathId: string, actor: string): Promise<{ ok: boolean; blockedReason?: string }>
```

Replace stages/items atomically after validation. Publishing recalculates duration and checks every required video in the same operation.

- [ ] **Step 4: Implement signed admin handlers**

Reuse central HMAC, nonce, body ceiling and idempotency behavior. Inspector returns exact blocked items and reasons but not private rights notes.

- [ ] **Step 5: Add archive propagation**

Archiving a video changes affected published paths to `needs_review` and removes them from public queries without deleting stages/items.

- [ ] **Step 6: Run tests**

Run: `node --import tsx --test scripts/vid-path-repository.test.ts scripts/vid-path-admin.test.ts scripts/vid-admin-auth.test.ts`  
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add workers/vid/paths.ts workers/vid/admin-paths.ts workers/vid/index.ts scripts/vid-path-repository.test.ts scripts/vid-path-admin.test.ts
git commit -m "feat(vid): add curated path operations"
```

---

### Task 3: Expose public path API and static route shell

**Files:**
- Create: `app/vid/path/page.tsx`
- Create: `components/vid/PathView.tsx`
- Modify: `workers/vid/index.ts`
- Modify: `lib/vid/api-client.ts`
- Modify: `lib/vid/path-contracts.ts`
- Modify: `scripts/vid-route-contract.test.mjs`
- Modify: `scripts/vid-api-client.test.ts`
- Modify: `scripts/vid-worker.test.ts`

**Interfaces:**
- Public routes: `GET /api/paths`, `GET /api/paths/:slug`, shell `/path?p=:slug`.
- Client: `listPaths()` and `getPath(slug)`.

- [ ] **Step 1: Write failing public route tests**

```ts
test('public path route exposes approved content and exact ordered stages', async () => {
  const response = await request('/api/paths/prompting-foundation')
  assert.equal(response.status, 200)
  assert.deepEqual(body.stages.flatMap((stage) => stage.items.map((item) => item.video.slug)), ['video-a', 'video-b'])
  assert.equal('confidence' in body.stages[0].items[0], false)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-route-contract.test.mjs scripts/vid-api-client.test.ts scripts/vid-worker.test.ts`  
Expected: FAIL because `/path` and path APIs do not exist.

- [ ] **Step 3: Add Worker shell mapping and public queries**

Map `'/path': '/vid/path'`. Public list returns only published paths with at least two currently eligible videos; detail returns ordered stages/items and deterministic reasons.

- [ ] **Step 4: Add strict client parsers**

```ts
export async function listPaths(options?: ClientOptions): Promise<PublicWatchingPathSummary[]>
export async function getPath(slug: string, options?: ClientOptions): Promise<PublicWatchingPath>
```

Reject missing order, invalid video DTO, empty outcome and unknown path state.

- [ ] **Step 5: Build `PathView` states**

Render loading, error/retry, not found, overview, high/low fit, total time, ordered stages, required/optional labels, reason, notice, expected shift and final action. Use existing real thumbnails and `VidLink` to `/watch?v=:slug&path=:pathSlug`.

- [ ] **Step 6: Run tests and build**

Run: `node --import tsx --test scripts/vid-route-contract.test.mjs scripts/vid-api-client.test.ts scripts/vid-worker.test.ts && npm run build`  
Expected: PASS; static export includes `/vid/path`.

- [ ] **Step 7: Commit**

```bash
git add app/vid/path/page.tsx components/vid/PathView.tsx workers/vid/index.ts lib/vid/api-client.ts lib/vid/path-contracts.ts scripts/vid-route-contract.test.mjs scripts/vid-api-client.test.ts scripts/vid-worker.test.ts
git commit -m "feat(vid): add public watching path experience"
```

---

### Task 4: Version and migrate local path progress

**Files:**
- Modify: `lib/vid/local-library.ts`
- Modify: `components/vid/useLocalLibraryState.ts`
- Modify: `scripts/vid-local-library.test.ts`

**Interfaces:**
- Produces local schema version 2 with `pathProgress: Array<{ pathSlug: string; pathVersion: number; completedVideoSlugs: string[]; currentVideoSlug: string | null; updatedAt: string }>`.
- Existing video progress/watch-later data must migrate losslessly.

- [ ] **Step 1: Write failing migration tests**

```ts
test('v1 library migrates video progress and adds empty path progress', () => {
  storage.setItem(KEY, JSON.stringify(v1Library))
  const value = readLocalLibrary(storage)
  assert.deepEqual(value.progress, v1Library.progress)
  assert.deepEqual(value.watchLater, v1Library.watchLater)
  assert.deepEqual(value.pathProgress, [])
  assert.equal(value.version, 2)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-local-library.test.ts`  
Expected: FAIL because version 2/path progress is absent.

- [ ] **Step 3: Implement bounded migration and path operations**

```ts
export function recordPathVideoCompleted(state: LocalLibraryV2, pathSlug: string, pathVersion: number, videoSlug: string, nextVideoSlug: string | null): LocalLibraryV2
export function reconcilePathProgress(state: LocalLibraryV2, path: PublicWatchingPath): LocalLibraryV2
```

Bound paths to 50 and completed slugs per path to 100. If a path version changes, preserve still-present completed video slugs and select the first incomplete required item.

- [ ] **Step 4: Run local storage tests**

Run: `node --import tsx --test scripts/vid-local-library.test.ts`  
Expected: PASS for v1 migration, corrupt storage fallback, quota failure and path-version reconciliation.

- [ ] **Step 5: Commit**

```bash
git add lib/vid/local-library.ts components/vid/useLocalLibraryState.ts scripts/vid-local-library.test.ts
git commit -m "feat(vid): track local watching path progress"
```

---

### Task 5: Make the watch page path-aware with one next step

**Files:**
- Create: `components/vid/PathNextStep.tsx`
- Modify: `components/vid/BunnyPlayer.tsx`
- Modify: `components/vid/WatchView.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-watch-contract.test.mjs`

**Interfaces:**
- Consumes: `path` query parameter, `getPath()`, local path progress.
- Produces: one primary next action and subordinate free-discovery rail.

- [ ] **Step 1: Write failing UI contract**

Assert `WatchView` reads `path`, fetches the path, renders `PathNextStep`, includes an approved reason, marks completion on Bunny `ended`, and keeps related videos after—not before—the primary path action.

- [ ] **Step 2: Run and confirm RED**

Run: `node --test scripts/vid-watch-contract.test.mjs`  
Expected: FAIL because path context is absent.

- [ ] **Step 3: Extend Bunny callback without remounting player**

Add optional `onEnded: () => void` to `BunnyPlayer`; bind it in the same stable Player.js effect. The callback updates local path progress only when current video belongs to the path.

- [ ] **Step 4: Implement `PathNextStep`**

Show path title, stage position, progress, next required video, editor-approved reason and CTA. If path is invalid/removed, show a neutral return-to-discovery link and do not infer a replacement path.

- [ ] **Step 5: Run focused visual/interaction checks**

Run: `node --test scripts/vid-watch-contract.test.mjs && npm run build && npm run qa:vid`  
Expected: PASS; keyboard reaches primary next step before related cards; player iframe identity remains stable.

- [ ] **Step 6: Commit**

```bash
git add components/vid/PathNextStep.tsx components/vid/WatchView.tsx components/vid/BunnyPlayer.tsx components/vid/Vid.module.css scripts/vid-watch-contract.test.mjs
git commit -m "feat(vid): add path-aware next viewing step"
```

---

### Task 6: Present paths and needs on the home page

**Files:**
- Create: `components/vid/PathCard.tsx`
- Create: `components/vid/NeedRail.tsx`
- Modify: `components/vid/HomeView.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-ui-contract.test.mjs`
- Modify: `scripts/qa-vid.mjs`

**Interfaces:**
- Consumes: `listPaths()`, approved need taxonomy and video cursor feed.
- Produces home order: featured, paths if available, needs, new videos, series, continuous discovery.

- [ ] **Step 1: Write failing home composition tests**

```js
test('home keeps free discovery and omits empty path theater', async () => {
  assert.match(source, /<InfiniteVideoFeed/)
  assert.match(source, /paths\.length\s*>\s*0/)
  assert.doesNotMatch(source, /fakePath|samplePath|demoPath/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --test scripts/vid-ui-contract.test.mjs`  
Expected: FAIL because path/need components do not exist.

- [ ] **Step 3: Implement real path cards**

Each card uses the approved cover or first real video thumbnail, path problem, outcome, required time, video count and `Bắt đầu path` CTA. Avoid automatic carousel; use scroll-snap only where keyboard and reduced-motion remain correct.

- [ ] **Step 4: Implement need-led entrances**

Each need links to `/topic?need=:slug` and uses approved label/description/count. Do not claim personalized relevance.

- [ ] **Step 5: Preserve zero-path and sparse-catalog states**

With no paths, home flows directly from featured to needs/new videos/feed. With one video, no empty section heading or false series/path appears.

- [ ] **Step 6: Run five-viewport QA**

Run: `node --test scripts/vid-ui-contract.test.mjs && npm run build && npm run qa:vid`  
Expected: PASS at 390, 768, 1024, 1280, 1440 px; no hero regression, card crop, focus loss or reduced-motion violation.

- [ ] **Step 7: Commit**

```bash
git add components/vid/PathCard.tsx components/vid/NeedRail.tsx components/vid/HomeView.tsx components/vid/Vid.module.css scripts/vid-ui-contract.test.mjs scripts/qa-vid.mjs
git commit -m "feat(vid): present curated paths on home"
```

---

### Task 7: Release-gate paths without enabling personalization

**Files:**
- Modify: `scripts/vid-release-gate.mjs`
- Modify: `scripts/vid-release-gate.test.mjs`
- Modify: `docs/STATUS.md`
- Create: `docs/qa/VID_WATCHING_PATH_REPORT.md`
- Create: `docs/releases/VID_WATCHING_PATH_RELEASE_REPORT.md`

**Interfaces:**
- Consumes: Tasks 1–6.
- Produces: production path evidence, rollback target and explicit confirmation that no viewer profiling was introduced.

- [ ] **Step 1: Extend release gate**

Require `0004` migration checks, path admin/public tests, local migration, path-aware watch contract, zero-path home state, five-viewport QA and source/current Bunny playback regression.

- [ ] **Step 2: Run full verification**

Run focused path tests, full `npm test`, lint, Worker typecheck, build, secret scan, D1 dry-run and `npm run qa:vid`. Record exact counts and failures.

- [ ] **Step 3: Seed one real path only if at least two eligible videos exist**

If production has fewer than two M2 videos, deploy path capability with zero public paths and report this honestly. Do not downgrade M0/M1 video or fabricate a path to satisfy visual QA.

- [ ] **Step 4: Deploy scoped migration, Worker and Pages**

Record D1 backup/export reference, previous Worker version, Pages deployment and rollback commands. Apply migration before code that queries it.

- [ ] **Step 5: Verify production journeys**

Check free discovery, path list/detail if present, path-to-watch query propagation, completion/next step, local resume, infinite feed and Bunny playback advancement. Confirm no profile/event endpoint or personal identifier was added.

- [ ] **Step 6: Write reports and status**

Separate capability PASS from content readiness. “No published path because catalog has fewer than two M2 videos” is a content-state limitation, not a fabricated PASS or product crash.

- [ ] **Step 7: Commit release evidence**

```bash
git add scripts/vid-release-gate.mjs scripts/vid-release-gate.test.mjs docs/STATUS.md docs/qa/VID_WATCHING_PATH_REPORT.md docs/releases/VID_WATCHING_PATH_RELEASE_REPORT.md
git commit -m "docs(vid): record watching path release"
```
