# VID Video-First Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make completed videos fast to publish to Bunny, reliably playable, scientifically browsable, and continuously loadable without duplicate results or hero text clipping.

**Architecture:** Preserve Bunny Stream as media owner and D1 as catalog owner. Replace page-number catalog reads with a versioned opaque keyset cursor, expose that contract through the existing Worker/client boundary, and render it through one reusable infinite-feed component. Keep M0 publish independent from future transcript enrichment.

**Tech Stack:** TypeScript, React 19, Next.js 16 static export, Cloudflare Worker/D1, Bunny Stream/TUS, Node test runner, CSS Modules.

## Global Constraints

- Bunny Stream owns video files, transcoding and playback; D1 owns catalog metadata.
- Upload goes directly from the local machine to Bunny through resumable TUS.
- M0 publish must not depend on transcript or AI enrichment.
- Public feeds must return only `published` videos whose media status is `ready`.
- No viewer account, server-side profile or personalization is introduced.
- Infinite loading ends when the catalog ends and never cycles existing videos.
- Visible text and media must use real catalog assets; no artificial stand-ins.
- Existing source disclosure, local progress and watch-later behavior must remain compatible.

---

### Task 1: Fix featured-video clipping with a regression contract

**Files:**
- Create: `workers/vid/migrations/0002_vid_presentation.sql`
- Modify: `lib/vid/contracts.ts`
- Modify: `workers/vid/catalog.ts`
- Modify: `components/vid/Vid.module.css`
- Modify: `components/vid/HomeView.tsx`
- Modify: `scripts/vid-contract.test.ts`
- Modify: `scripts/vid-ui-contract.test.mjs`
- Modify: `scripts/qa-vid.mjs`

**Interfaces:**
- Consumes: existing `HomeView` featured `section` and `PublicVideo.title`.
- Produces: public `thumbnailFocalX`/`thumbnailFocalY` percentages, `data-vid-featured-copy` and `data-vid-featured-media` QA anchors, and a responsive hero whose copy is never clipped.

- [ ] **Step 1: Write the failing structural regression test**

```js
test('featured copy remains in normal flow and only media is cropped', async () => {
  const [view, css] = await Promise.all([
    readFile('components/vid/HomeView.tsx', 'utf8'),
    readFile('components/vid/Vid.module.css', 'utf8'),
  ])
  assert.match(view, /data-vid-featured-copy/)
  assert.match(view, /data-vid-featured-media/)
  assert.doesNotMatch(css, /\.featured\s*\{[^}]*max-height:/s)
  assert.match(css, /\.featuredImage\s*\{[^}]*overflow:\s*hidden/s)
  assert.match(css, /\.featured h1\s*\{[^}]*line-height:\s*1\.0[5-9]/s)
})
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `node --test scripts/vid-ui-contract.test.mjs`  
Expected: FAIL because the QA anchors and safe line-height are absent and `.featured` still has `max-height`.

- [ ] **Step 3: Put copy in a non-clipping flow and isolate media cropping**

Add `thumbnail_focal_x INTEGER NOT NULL DEFAULT 50 CHECK (thumbnail_focal_x BETWEEN 0 AND 100)` and `thumbnail_focal_y INTEGER NOT NULL DEFAULT 24 CHECK (thumbnail_focal_y BETWEEN 0 AND 100)` through migration `0002`. Extend `VideoDraftInput` with numeric `thumbnailFocalX`/`thumbnailFocalY`, default missing values to `50/24`, map them to `PublicVideo`, and set real-image position through CSS custom properties; do not infer face position in the browser.

```tsx
<span className={styles.featuredImage} data-vid-featured-media aria-hidden="true" style={{ '--focal-x': `${featured.thumbnailFocalX}%`, '--focal-y': `${featured.thumbnailFocalY}%` } as React.CSSProperties}>
  <Image src={featured.thumbnailUrl} alt="" fill unoptimized priority sizes="(max-width: 780px) 100vw, 56vw" />
</span>
<div data-vid-featured-copy>
  <p>SUẤT CHIẾU NỔI BẬT</p>
  <h1 id="featured-title">{featured.title}</h1>
  <span>{featured.sourceCreator} · {featured.topics[0]}</span>
  <VidLink href={`/watch?v=${encodeURIComponent(featured.slug)}`}><Play fill="currentColor" aria-hidden="true" /> Xem ngay</VidLink>
</div>
```

```css
.featured {
  position: relative;
  min-height: clamp(360px, 46vh, 560px);
  display: grid;
  align-items: end;
  overflow: visible;
}
.featuredImage { position: absolute; inset: 0 0 0 44%; overflow: hidden; border-radius: inherit; }
.featuredImage img { object-position: var(--focal-x, 50%) var(--focal-y, 24%); }
.featured h1 { line-height: 1.08; padding-block: .08em; }
```

- [ ] **Step 4: Extend visual QA with long Vietnamese fixture assertions**

Add a fixture title exactly equal to `Kỹ thuật prompting Claude để hiểu đúng vấn đề và hành động có hệ thống`, then make `qa-vid.mjs` assert at 390, 768, 1024, 1280 and 1440 px that the heading range is contained by the featured copy box and the CTA rectangle does not intersect the heading rectangle.

- [ ] **Step 5: Run focused and visual checks**

Run: `node --import tsx --test scripts/vid-contract.test.ts && node --test scripts/vid-ui-contract.test.mjs && npm run build && npm run qa:vid`  
Expected: structural test PASS; build PASS; five viewport checks show no clipped Vietnamese glyph, overlap or hidden CTA.

- [ ] **Step 6: Commit**

```bash
git add workers/vid/migrations/0002_vid_presentation.sql lib/vid/contracts.ts workers/vid/catalog.ts components/vid/HomeView.tsx components/vid/Vid.module.css scripts/vid-contract.test.ts scripts/vid-ui-contract.test.mjs scripts/qa-vid.mjs
git commit -m "fix(vid): protect featured Vietnamese copy"
```

---

### Task 2: Replace page pagination with a stable cursor feed

**Files:**
- Create: `lib/vid/feed-cursor.ts`
- Modify: `lib/vid/contracts.ts`
- Modify: `workers/vid/catalog.ts`
- Modify: `workers/vid/index.ts`
- Modify: `scripts/vid-contract.test.ts`
- Modify: `scripts/vid-worker.test.ts`

**Interfaces:**
- Produces: `CatalogCursor`, `CatalogSlice`, `encodeCatalogCursor()`, `decodeCatalogCursor()`, `listPublicVideoFeed()`.
- Cursor payload: `{ v: 'vid-feed-v1'; f: string; b: 0 | 1; r: number | null; p: string; s: string }`.
- Public response: `{ items: PublicVideo[]; nextCursor: string | null; hasMore: boolean; policyVersion: 'vid-feed-v1' }`.

- [ ] **Step 1: Write failing cursor codec tests**

```ts
test('catalog cursor is opaque, filter-bound and round-trips', () => {
  const input = { v: 'vid-feed-v1', f: 'topic=ai&q=', b: 1, r: null, p: '2026-08-12T00:00:00.000Z', s: 'video-b' } as const
  const encoded = encodeCatalogCursor(input)
  assert.equal(encoded.includes('video-b'), false)
  assert.deepEqual(decodeCatalogCursor(encoded, 'topic=ai&q='), input)
  assert.throws(() => decodeCatalogCursor(encoded, 'topic=content&q='), /cursor_filter_mismatch/)
})
```

- [ ] **Step 2: Run the codec test and confirm RED**

Run: `node --import tsx --test scripts/vid-contract.test.ts`  
Expected: FAIL because the cursor types/functions do not exist.

- [ ] **Step 3: Implement the versioned codec**

```ts
export const VID_FEED_POLICY = 'vid-feed-v1' as const
export type CatalogCursor = {
  v: typeof VID_FEED_POLICY
  f: string
  b: 0 | 1
  r: number | null
  p: string
  s: string
}
export function encodeCatalogCursor(value: CatalogCursor): string
export function decodeCatalogCursor(value: string, fingerprint: string): CatalogCursor
export function catalogFingerprint(filters: { query?: string; topic?: string }): string
```

Use UTF-8 JSON encoded with base64url, reject payloads over 1 KiB, reject unknown keys/version, and compare `f` to the normalized filter fingerprint.

- [ ] **Step 4: Write failing Worker tests for stable no-duplicate slices**

```ts
test('cursor feed returns one extra row and advances without duplicates', async () => {
  const first = await requestFeed('/api/videos?limit=2')
  assert.deepEqual(first.items.map((item) => item.slug), ['featured-a', 'recent-b'])
  assert.equal(first.hasMore, true)
  const second = await requestFeed(`/api/videos?limit=2&cursor=${encodeURIComponent(first.nextCursor!)}`)
  assert.deepEqual(second.items.map((item) => item.slug), ['recent-c'])
  assert.equal(second.hasMore, false)
  assert.equal(new Set([...first.items, ...second.items].map((item) => item.slug)).size, 3)
})
```

- [ ] **Step 5: Implement keyset query and public API contract**

```ts
export async function listPublicVideoFeed(
  env: VidEnv,
  input: { limit: number; cursor?: string; query?: string; topic?: string },
): Promise<CatalogSlice>
```

Fetch `limit + 1`, order by `featured_rank IS NULL`, `featured_rank`, `published_at DESC`, `slug ASC`, apply the decoded keyset predicate, trim the extra row, and encode the last returned row. Keep the existing public-ready clauses and maximum limit 48.

- [ ] **Step 6: Run contract and Worker tests**

Run: `node --import tsx --test scripts/vid-contract.test.ts scripts/vid-worker.test.ts`  
Expected: PASS for cursor validation, filters, invalid/expired cursor response, stable ordering, end state and public DTO secrecy.

- [ ] **Step 7: Commit**

```bash
git add lib/vid/feed-cursor.ts lib/vid/contracts.ts workers/vid/catalog.ts workers/vid/index.ts scripts/vid-contract.test.ts scripts/vid-worker.test.ts
git commit -m "feat(vid): add stable cursor catalog feed"
```

---

### Task 3: Build the reusable continuous-loading client

**Files:**
- Create: `components/vid/InfiniteVideoFeed.tsx`
- Create: `components/vid/useInfiniteVideoFeed.ts`
- Create: `components/vid/VirtualVideoGrid.tsx`
- Modify: `lib/vid/api-client.ts`
- Modify: `components/vid/HomeView.tsx`
- Modify: `components/vid/CatalogView.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-api-client.test.ts`
- Modify: `scripts/vid-ui-contract.test.mjs`

**Interfaces:**
- Consumes: `listVideos({ cursor, limit, query, topic }, { signal }) => Promise<CatalogSlice>`.
- Produces: `useInfiniteVideoFeed(filters)` with `{ items, status, hasMore, loadMore, retry }`.
- Produces: `VirtualVideoGrid` that renders only visible responsive rows while retaining the full ordered item list in state.

- [ ] **Step 1: Write failing API client tests**

```ts
test('listVideos sends opaque cursor and parses catalog slice', async () => {
  const result = await listVideos({ limit: 24, cursor: 'opaque', topic: 'ai' }, { fetcher })
  assert.equal(seenUrl, '/api/videos?limit=24&cursor=opaque&topic=ai')
  assert.equal(result.policyVersion, 'vid-feed-v1')
  assert.equal(result.hasMore, true)
})
```

- [ ] **Step 2: Run client tests and confirm RED**

Run: `node --import tsx --test scripts/vid-api-client.test.ts`  
Expected: FAIL because the client still uses page/pageSize.

- [ ] **Step 3: Update the client contract**

```ts
type CatalogQuery = { cursor?: string; limit?: number; query?: string; topic?: string }
export async function listVideos(query: CatalogQuery = {}, options: ClientOptions = {}): Promise<CatalogSlice>
```

- [ ] **Step 4: Write the hook with stale-request cancellation and dedupe**

```ts
export type FeedFilters = { query?: string; topic?: string; limit?: number }
export function useInfiniteVideoFeed(filters: FeedFilters): {
  items: PublicVideo[]
  status: 'loading' | 'ready' | 'loading-more' | 'error' | 'exhausted'
  hasMore: boolean
  loadMore(): void
  retry(): void
}
```

Reset on a stable filter key, abort the prior controller, allow only one in-flight request, and merge by slug while preserving response order.

- [ ] **Step 5: Implement accessible observer plus explicit fallback**

`InfiniteVideoFeed` renders `VideoGrid`, an observer sentinel with `rootMargin: '800px 0px'`, an `aria-live="polite"` status, and a real `button` labelled `Tải thêm video`. The button remains keyboard-reachable even when observer auto-loading is available.

- [ ] **Step 6: Virtualize long responsive grids without losing scroll position**

```tsx
export type VirtualVideoGridProps = VideoGridProps & {
  overscanRows?: number
  virtualizationThreshold?: number
}
export default function VirtualVideoGrid({ overscanRows = 3, virtualizationThreshold = 48, ...props }: VirtualVideoGridProps): React.ReactElement
```

Use one `ResizeObserver` on the grid/container, derive the active column count from the same 580/940/1180 breakpoints, measure the first rendered row, compute visible start/end rows from `window.scrollY`, and render top/bottom spacer blocks with omitted row heights. Below 48 items, render the existing `VideoGrid` directly. Preserve stable card keys by slug and include a test-only `data-visible-row-range` attribute.

- [ ] **Step 7: Replace fixed 48-item reads**

Use the reusable feed in `HomeView` for “Chiếu tiếp” and in topic/results/all catalog views. Featured and curated lanes may use the first slice, but they must not remove items from cursor identity; the UI dedupe layer hides a featured duplicate without corrupting `nextCursor`.

- [ ] **Step 8: Add UI contract assertions**

Assert one observer sentinel, one fallback button, one `AbortController`, slug dedupe, explicit exhausted state, responsive row virtualization after 48 items and no `<video>` element inside feed cards.

- [ ] **Step 9: Run focused tests and build**

Run: `node --import tsx --test scripts/vid-api-client.test.ts && node --test scripts/vid-ui-contract.test.mjs && npm run build`  
Expected: PASS; static export includes existing VID routes.

- [ ] **Step 10: Commit**

```bash
git add components/vid/InfiniteVideoFeed.tsx components/vid/useInfiniteVideoFeed.ts components/vid/VirtualVideoGrid.tsx components/vid/HomeView.tsx components/vid/CatalogView.tsx components/vid/Vid.module.css lib/vid/api-client.ts scripts/vid-api-client.test.ts scripts/vid-ui-contract.test.mjs
git commit -m "feat(vid): add continuous accessible discovery feed"
```

---

### Task 4: Harden M0 publishing and batch upload usability

**Files:**
- Create: `lib/vid/upload-manifest.ts`
- Create: `scripts/vid-upload-batch.ts`
- Create: `scripts/vid-upload-batch.test.ts`
- Modify: `scripts/vid-upload.ts`
- Modify: `scripts/vid-upload-cli.ts`
- Modify: `scripts/vid-upload.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `VidUploadManifest`, `validateUploadManifest()`, `runVidUploadBatch()`.
- Batch result: `{ published: string[]; uploaded: string[]; failed: Array<{ slug: string; reason: string }> }`.
- Each manifest item accepts `thumbnailFocalX` and `thumbnailFocalY` in the inclusive range 0–100; omitted values use the validated `50/24` defaults.

- [ ] **Step 1: Write failing manifest and continue-on-error tests**

```ts
test('batch validates all rows before upload and continues independent failures', async () => {
  const result = await runVidUploadBatch(manifest, { runUpload })
  assert.deepEqual(result.published, ['video-a', 'video-c'])
  assert.deepEqual(result.failed, [{ slug: 'video-b', reason: 'Bunny processing failed' }])
  assert.equal(maxConcurrentUploads, 1)
})
```

- [ ] **Step 2: Run tests and confirm RED**

Run: `node --import tsx --test scripts/vid-upload-batch.test.ts`  
Expected: FAIL because manifest/batch functions do not exist.

- [ ] **Step 3: Implement strict JSON manifest validation**

```ts
export type VidUploadManifest = { version: 1; videos: VidUploadOptions[] }
export function validateUploadManifest(value: unknown): VidUploadManifest
```

Reject unknown root/item keys, duplicate slugs, non-absolute paths, more than 100 entries, and invalid M0 metadata before contacting Bunny.

- [ ] **Step 4: Implement sequential resumable batch execution**

```ts
export async function runVidUploadBatch(
  manifest: VidUploadManifest,
  dependencies: { runUpload: typeof runVidUpload },
): Promise<BatchUploadResult>
```

Use the existing per-video idempotency and TUS resume store. Never retry a rights/metadata validation failure. Return a non-zero CLI exit when `failed.length > 0` while retaining the structured summary.

- [ ] **Step 5: Add CLI and package command**

Add `--manifest /absolute/path/manifest.json`, mutually exclusive with single-file flags, and package script `vid:upload-batch` using `node --import tsx scripts/vid-upload-cli.ts --manifest`.

- [ ] **Step 6: Run upload tests and dry-run a two-item fixture**

Run: `node --import tsx --test scripts/vid-upload.test.ts scripts/vid-upload-batch.test.ts`  
Run: `npm run vid:upload -- --manifest /private/tmp/vid-manifest-fixture.json --dry-run`  
Expected: tests PASS; dry-run validates both rows and performs zero network calls.

- [ ] **Step 7: Commit**

```bash
git add lib/vid/upload-manifest.ts scripts/vid-upload-batch.ts scripts/vid-upload-batch.test.ts scripts/vid-upload.ts scripts/vid-upload-cli.ts scripts/vid-upload.test.ts package.json
git commit -m "feat(vid): add safe batch Bunny publishing"
```

---

### Task 5: Lock smooth playback and non-remount behavior

**Files:**
- Modify: `components/vid/BunnyPlayer.tsx`
- Modify: `components/vid/WatchView.tsx`
- Modify: `scripts/vid-watch-contract.test.mjs`
- Modify: `scripts/qa-vid.mjs`

**Interfaces:**
- Consumes: `BunnyPlayer({ playerUrl, title, startSeconds, onTimeUpdate })`.
- Produces: stable iframe/player identity for local progress and watch-later state changes.

- [ ] **Step 1: Write failing player lifecycle contract**

```js
test('watch state updates cannot key or remount the Bunny player', async () => {
  const source = await readFile('components/vid/WatchView.tsx', 'utf8')
  assert.doesNotMatch(source, /<BunnyPlayer[^>]*key=/)
  assert.doesNotMatch(source, /playerUrl=.*library|watchLater/)
})
```

Add a browser QA assertion that clicking “Xem sau” while playback is running does not replace the iframe DOM node and `currentTime` continues increasing.

- [ ] **Step 2: Run watch tests and confirm the new browser assertion fails before instrumentation**

Run: `node --test scripts/vid-watch-contract.test.mjs`  
Expected: the new stable-node QA hook is absent.

- [ ] **Step 3: Add a stable player QA anchor and error lifecycle**

Render `data-vid-player={video.slug}` on the stable wrapper, keep Player.js listeners scoped to `playerUrl/startSeconds`, and surface a bounded `playerError` when the embed URL is invalid. Do not bind player lifecycle to watch-later state.

- [ ] **Step 4: Extend production smoke**

For the real public video, assert iframe identity remains the same across watch-later, playback advances at least four seconds, page reload resumes within an allowed five-second tolerance, and no console error is emitted by VID-owned code.

- [ ] **Step 5: Run focused QA**

Run: `node --test scripts/vid-watch-contract.test.mjs && npm run build && npm run qa:vid`  
Expected: PASS locally; production portion is recorded during release Task 6.

- [ ] **Step 6: Commit**

```bash
git add components/vid/BunnyPlayer.tsx components/vid/WatchView.tsx scripts/vid-watch-contract.test.mjs scripts/qa-vid.mjs
git commit -m "test(vid): lock stable Bunny playback lifecycle"
```

---

### Task 6: Release-gate the video-first foundation

**Files:**
- Modify: `scripts/vid-release-gate.mjs`
- Modify: `scripts/vid-release-gate.test.mjs`
- Modify: `docs/STATUS.md`
- Create: `docs/qa/VID_VIDEO_FIRST_FOUNDATION_REPORT.md`
- Create: `docs/releases/VID_VIDEO_FIRST_FOUNDATION_RELEASE_REPORT.md`

**Interfaces:**
- Consumes: Tasks 1–5.
- Produces: explicit PASS/PARTIAL/BLOCKED report, immutable deployment IDs and rollback target.

- [ ] **Step 1: Add release-gate contract assertions**

Require cursor tests, infinite-feed UI contract, batch upload tests, hero long-title QA, Bunny playback advancement, secret scan, Worker dry-run and production route checks.

- [ ] **Step 2: Run focused and full verification**

Run: `node --import tsx --test scripts/vid-*.test.ts scripts/vid-*.test.mjs`  
Run: `npm test`  
Run: `npm run lint`  
Run: `npm run typecheck:vid-worker`  
Run: `npm run build`  
Run: `npm run qa:vid`  
Expected: every command exits 0. Record exact counts; do not reuse historical counts.

- [ ] **Step 3: Run deployment preflight**

Run the repository-approved VID Wrangler dry-run and current-tree secret scan from `scripts/vid-release-gate.mjs`.  
Expected: Worker bindings resolve; no secret or video file appears in Git/build output.

- [ ] **Step 4: Deploy only VID-scoped Worker/Pages artifacts**

Record the previous Worker version and Pages deployment before cutover. Deploy the immutable Pages build, then the VID Worker. Do not deploy apex main site or Learn.

- [ ] **Step 5: Verify production**

Check home, topic, results, cursor API, 3 consecutive cursor slices, watch route, source links, sitemap, robots and real Bunny playback. Exercise 390 and 1440 px hero layouts and long scroll until `hasMore=false` for the current catalog.

- [ ] **Step 6: Write evidence and status**

The QA report must separate structural tests, runtime playback, performance observations and visual judgment. The release report must include deployment IDs, route evidence, rollback version and any remaining limitations.

- [ ] **Step 7: Commit release evidence**

```bash
git add scripts/vid-release-gate.mjs scripts/vid-release-gate.test.mjs docs/STATUS.md docs/qa/VID_VIDEO_FIRST_FOUNDATION_REPORT.md docs/releases/VID_VIDEO_FIRST_FOUNDATION_RELEASE_REPORT.md
git commit -m "docs(vid): record video-first foundation release"
```
