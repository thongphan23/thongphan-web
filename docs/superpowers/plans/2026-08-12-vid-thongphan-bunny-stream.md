# vid.thongphan.com Bunny Stream Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây `vid.thongphan.com` thành thư viện video công khai quen thuộc như YouTube, nhận file MP4 hoàn chỉnh qua Codex, lưu/phát bằng Bunny Stream và giữ đúng nhận diện Thông Phan Cinema.

**Architecture:** Next.js static export cung cấp sáu shell dưới `/vid`; một Cloudflare Worker riêng ánh xạ subdomain, phục vụ API và đọc/ghi catalog D1. Bunny Stream là nguồn sự thật media. Công cụ local ký request quản trị, nhận TUS presign rồi upload thẳng lên Bunny nên video không đi qua Pages, Worker hay Git.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Cloudflare Workers + D1, Bunny Stream API/TUS/Player, `tus-js-client`, Node test runner, Playwright Chromium QA.

## Global Constraints

- Chỉ nhận MP4 hoàn chỉnh; không dịch, lồng tiếng, dựng hoặc chỉnh video.
- Chỉ anh Thông/Codex có quyền quản trị; không có trang admin công khai.
- R1 không có tài khoản người xem, bình luận, thích hoặc theo dõi.
- Source creator, source URL, translation label và owner-reviewed rights status bắt buộc trước publish.
- Video, Bunny secret, admin secret và private rights note không được vào Git, static output, browser bundle hoặc log.
- `learn.thongphan.com`, Brain2, TPR và Conan Maker ngoài phạm vi.
- Public API chỉ trả record `published` có Bunny media `ready`.
- Canonical public dùng `https://vid.thongphan.com`; `/vid/*` chỉ là source shell nội bộ.
- Motion không phủ player; reduced motion tắt beam, preview autoplay, parallax và shimmer.
- Mọi task dùng TDD, commit riêng và cập nhật `docs/STATUS.md` sau meaningful work.

---

## File map

- `lib/vid/contracts.ts`: DTO, enum, validation, public projection.
- `lib/vid/discovery.ts`: tìm kiếm và related deterministic.
- `lib/vid/local-library.ts`: versioned local progress/watch-later.
- `lib/vid/api-client.ts`: same-origin API client.
- `workers/vid/{index,http,catalog,auth,bunny,types}.ts`: Worker runtime.
- `workers/vid/migrations/0001_vid_catalog.sql`: isolated D1 schema.
- `scripts/vid-{upload,upload-cli,keychain}.ts`: Codex operator.
- `app/vid/**`: six static entry routes.
- `components/vid/**`: standalone screening-room UI.
- `scripts/vid-*.test.*`, `scripts/qa-vid.mjs`: contracts and rendered QA.

### Task 1: Catalog contract and isolated schema

**Files:**
- Create: `lib/vid/contracts.ts`
- Create: `workers/vid/types.ts`
- Create: `workers/vid/migrations/0001_vid_catalog.sql`
- Create: `scripts/vid-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `VideoStatus`, `RightsStatus`, `VideoRecord`, `PublicVideo`, `CatalogPage`, `validateDraftInput()`, `toPublicVideo()`.
- Consumes: none.

- [x] **Step 1: Write the failing contract tests**

Test exact status enum, HTTPS source URLs, string ceilings, mandatory rights state,
`published + ready` projection and removal of private/internal keys.

```ts
assert.throws(() => validateDraftInput({ ...valid, sourceVideoUrl: 'http://x.test' }))
assert.equal(toPublicVideo({ ...record, status: 'processing' }), null)
assert.equal('rightsNote' in toPublicVideo(published)!, false)
```

- [x] **Step 2: Verify RED**

Run: `node --import tsx --test scripts/vid-contract.test.ts`  
Expected: FAIL because `lib/vid/contracts.ts` is absent.

- [x] **Step 3: Implement the exact typed contract**

Reject unknown admin keys. Public DTO contains only slug, title/description,
source disclosure, translation label, duration, player/thumbnail/preview URLs,
topics/tags, publishedAt and featuredRank.

- [x] **Step 4: Implement schema**

Create `vid_videos`, `vid_topics`, `vid_video_topics`, `vid_playlists`,
`vid_playlist_videos`, `vid_admin_nonces` and indexes. Enforce unique slug,
Bunny ID and idempotency key. Keep it outside existing R0 migration directory.

- [x] **Step 5: Verify GREEN and commit**

```bash
node --import tsx --test scripts/vid-contract.test.ts
git add package.json lib/vid/contracts.ts workers/vid/types.ts workers/vid/migrations/0001_vid_catalog.sql scripts/vid-contract.test.ts
git commit -m "feat(vid): define catalog contract"
```

### Task 2: Discovery and anonymous local library

**Files:**
- Create: `lib/vid/discovery.ts`
- Create: `lib/vid/local-library.ts`
- Create: `scripts/vid-discovery.test.ts`
- Create: `scripts/vid-local-library.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `PublicVideo`.
- Produces: `normalizeVietnamese()`, `filterVideos()`, `rankRelated()`, `readLocalLibrary()`, `recordProgress()`, `toggleWatchLater()`.

- [x] **Step 1: Write failing discovery tests**

Cover `đ`/`d`, title-before-description scoring, deterministic ties, topic/tag/
creator matching and related order: playlist overlap, topic, tag, newest.

- [x] **Step 2: Write failing local-state tests**

Cover corrupt JSON, unknown version, duplicates, 100 progress items, 200 saved
slugs, under-10-second exclusion, 95%-complete exclusion and write failure.

- [x] **Step 3: Verify RED**

Run: `node --import tsx --test scripts/vid-discovery.test.ts scripts/vid-local-library.test.ts`  
Expected: FAIL on missing modules.

- [x] **Step 4: Implement pure immutable modules**

Accept `Storage` as an argument and avoid browser globals at import. Persist only
under `thongphan.vid.library.v1`; malformed records return an empty safe state.

- [x] **Step 5: Verify GREEN and commit**

```bash
node --import tsx --test scripts/vid-discovery.test.ts scripts/vid-local-library.test.ts
git add package.json lib/vid/discovery.ts lib/vid/local-library.ts scripts/vid-discovery.test.ts scripts/vid-local-library.test.ts
git commit -m "feat(vid): add discovery and local library"
```

### Task 3: Public catalog and static routing Worker

**Files:**
- Create: `workers/vid/http.ts`
- Create: `workers/vid/catalog.ts`
- Create: `workers/vid/index.ts`
- Create: `wrangler.vid.toml`
- Create: `tsconfig.vid-worker.json`
- Create: `scripts/vid-worker.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1 contract and D1 schema.
- Produces: public catalog endpoints, health endpoint and static shell proxy.

- [x] **Step 1: Write failing Worker tests**

Assert `/`, `/watch`, `/results`, `/topic`, `/playlist`, `/library` map to their
`/vid/*.html` Pages shell while `/_next/*` remains unchanged. Assert pagination
`1..48`, no draft leak, cache headers, same-origin CORS and unknown-slug 404.

- [x] **Step 2: Verify RED**

Run: `node --import tsx --test scripts/vid-worker.test.ts`  
Expected: FAIL on missing Worker.

- [x] **Step 3: Implement bounded API**

Add `GET /api/videos`, `/api/videos/:slug`, `/api/topics`,
`/api/playlists/:slug`, `/api/health`. Use prepared statements and the exact
`published + ready` predicate; invalid D1 rows are omitted and metadata-logged.

- [x] **Step 4: Implement safe Pages proxy and config**

Validate HTTPS `PAGES_ORIGIN`, prevent same-host loops, preserve upstream status/
redirect/cache. `wrangler.vid.toml` owns only `vid.thongphan.com/*`, `VID_DB`,
`PAGES_ORIGIN`, `BUNNY_LIBRARY_ID`, `BUNNY_CDN_HOST`.

- [x] **Step 5: Verify typecheck/tests and commit**

```bash
node --import tsx --test scripts/vid-worker.test.ts
npm run typecheck:vid-worker
git add package.json tsconfig.vid-worker.json wrangler.vid.toml workers/vid scripts/vid-worker.test.ts
git commit -m "feat(vid): serve catalog through dedicated worker"
```

### Task 4: Replay-safe admin auth and Bunny lifecycle

**Files:**
- Create: `workers/vid/auth.ts`
- Create: `workers/vid/bunny.ts`
- Create: `scripts/vid-admin-auth.test.ts`
- Create: `scripts/vid-bunny.test.ts`
- Modify: `workers/vid/index.ts`
- Modify: `workers/vid/catalog.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: validated draft and D1 catalog.
- Produces: `verifyAdminRequest()`, `createBunnyVideo()`, `buildTusAuthorization()`, `verifyBunnyWebhook()`.

- [x] **Step 1: Write failing auth tests**

Sign `METHOD`, path/query, timestamp, nonce, idempotency key and SHA-256 body on
separate lines. Reject ±301 seconds, reused nonce, wrong body/path/method, missing
secret and malformed/non-constant-length signatures.

- [x] **Step 2: Write failing Bunny tests**

Stub fetch. Verify Create Video request, documented TUS SHA-256 presign, raw-body
webhook HMAC and Bunny status mapping to uploading/processing/ready/failed.

- [x] **Step 3: Verify RED**

Run: `node --import tsx --test scripts/vid-admin-auth.test.ts scripts/vid-bunny.test.ts`  
Expected: FAIL on missing modules.

- [x] **Step 4: Implement admin routes**

Add `POST /api/admin/uploads`, `GET /api/admin/videos/:id/status`,
`POST /api/admin/videos/:id/publish`, archive, and `/api/webhooks/bunny`.
Publish requires source, rights and ready; duplicate idempotency returns the same
operation; no response exposes a provider/admin secret.

- [x] **Step 5: Verify and commit**

```bash
node --import tsx --test scripts/vid-admin-auth.test.ts scripts/vid-bunny.test.ts scripts/vid-worker.test.ts
npm run typecheck:vid-worker
git add package.json workers/vid scripts/vid-admin-auth.test.ts scripts/vid-bunny.test.ts
git commit -m "feat(vid): secure Bunny upload lifecycle"
```

### Task 5: Codex-operated resumable upload command

**Files:**
- Create: `scripts/vid-keychain.ts`
- Create: `scripts/vid-upload.ts`
- Create: `scripts/vid-upload-cli.ts`
- Create: `scripts/vid-upload.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: Task 4 admin API.
- Produces: `runVidUpload(options, deps)`, `vid:upload`, `vid:status`, `vid:publish`.

- [x] **Step 1: Install a verified exact TUS client**

Run `npm view tus-js-client version`, then `npm install tus-js-client@<returned-version> --save-exact`.

- [x] **Step 2: Write failing CLI tests**

Inject filesystem, Keychain, clock, fetch and TUS. Cover missing/non-MP4/empty
file, relative path, symlink, HTTP source, missing rights, dry-run, redacted output,
idempotency reuse, interrupted resume, poll timeout and publish-before-ready.

- [x] **Step 3: Verify RED**

Run: `node --import tsx --test scripts/vid-upload.test.ts`  
Expected: FAIL on absent CLI modules.

- [x] **Step 4: Implement secure command**

Read Keychain service `thongphan-vid-admin`, account `hmac-secret`; never accept
secret in argv. Persist only TUS resume data under owner-only
`~/.cache/thongphan-vid/uploads`. Description and rights note come from absolute,
non-symlink files to avoid shell history.

- [x] **Step 5: Verify and commit**

```bash
node --import tsx --test scripts/vid-upload.test.ts
git add package.json package-lock.json scripts/vid-keychain.ts scripts/vid-upload.ts scripts/vid-upload-cli.ts scripts/vid-upload.test.ts
git commit -m "feat(vid): add resumable Codex upload command"
```

### Task 6: Standalone Vid shell and static entry routes

**Files:**
- Create: `app/vid/layout.tsx`
- Create: `app/vid/page.tsx`
- Create: `app/vid/{watch,results,topic,playlist,library}/page.tsx`
- Create: `components/vid/VidApp.tsx`
- Create: `components/vid/VidShell.tsx`
- Create: `components/vid/Vid.module.css`
- Create: `scripts/vid-route-contract.test.mjs`
- Modify: `lib/site-route-mode.ts`
- Modify: `components/site-chrome/SiteChrome.tsx`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 3 API paths.
- Produces: six static entrypoints and the shared Vid shell.

- [x] **Step 1: Write failing route/shell tests**

Require every route, an explicit `video-platform` route mode, SiteChrome bypass,
exact `initialView` values and absence of fake login/like/comment/subscribe UI.

- [x] **Step 2: Verify RED**

Run: `node --test scripts/vid-route-contract.test.mjs`  
Expected: FAIL because routes/components are absent.

- [x] **Step 3: Implement the standalone boundary**

Make `video-platform` exact/prefix matching take precedence. SiteChrome returns
the route children directly for this mode, so Vid never receives two headers,
two mains or the general footer.

- [x] **Step 4: Implement the responsive shell**

Create skip link, pinned header, search, collapsible desktop sidebar and mobile
bottom navigation with direct Lucide imports. CSS defines ink/paper/lacquer,
44 px controls, fixed-safe offsets, visible focus and 320 px overflow guard.

- [x] **Step 5: Verify static build and commit**

```bash
node --test scripts/vid-route-contract.test.mjs
npm run build
git add package.json lib/site-route-mode.ts components/site-chrome/SiteChrome.tsx app/vid components/vid scripts/vid-route-contract.test.mjs
git commit -m "feat(vid): add standalone screening room shell"
```

### Task 7: Home, search, topic, playlist and local-library views

**Files:**
- Create: `lib/vid/api-client.ts`
- Create: `components/vid/VideoCard.tsx`
- Create: `components/vid/VideoGrid.tsx`
- Create: `components/vid/HomeView.tsx`
- Create: `components/vid/CatalogView.tsx`
- Create: `components/vid/LocalLibraryView.tsx`
- Modify: `components/vid/VidApp.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-route-contract.test.mjs`

**Interfaces:**
- Consumes: `PublicVideo`, API, discovery and local-library modules.
- Produces: all discovery/list views and delayed card preview.

- [x] **Step 1: Extend failing source contracts**

Require exact empty/loading/error states, abortable fetch, pagination, thumbnail
fallback, two-line titles, duration/source/progress, 650 ms preview delay and a
reduced-motion block.

- [x] **Step 2: Verify RED**

Run: `node --test scripts/vid-route-contract.test.mjs`  
Expected: FAIL on absent components/contracts.

- [x] **Step 3: Implement data lifecycle**

Use an 8-second AbortController timeout and explicit loading/ready/empty/error.
Ignore stale response completion after view/query changes. Production code must
not import QA fixtures.

- [x] **Step 4: Implement cards, grids and views**

Start silent preview only after 650 ms stable hover/focus; stop on leave, blur or
hidden tab. Home order is chips, compact featured, newest, optional continue,
playlist lanes, latest. Search/topic/playlist preserve URL query; library is local.

- [x] **Step 5: Verify and commit**

```bash
node --import tsx --test scripts/vid-contract.test.ts scripts/vid-discovery.test.ts scripts/vid-local-library.test.ts
node --test scripts/vid-route-contract.test.mjs
npm run build
git add lib/vid/api-client.ts components/vid scripts/vid-route-contract.test.mjs
git commit -m "feat(vid): build video discovery experience"
```

### Task 8: Bunny watch experience and source disclosure

**Files:**
- Create: `components/vid/BunnyPlayer.tsx`
- Create: `components/vid/WatchView.tsx`
- Modify: `components/vid/VidApp.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-route-contract.test.mjs`

**Interfaces:**
- Consumes: single-video API, `rankRelated()`, `recordProgress()`.
- Produces: working watch page and Player.js event bridge.

- [x] **Step 1: Write failing watch contracts**

Require iframe title, allowFullScreen, minimal `allow`, Bunny Player 2 URL,
creator/source link, translation label, expand description, watch-later, share,
copy timestamp, related reasons, playlist next/previous and retry.

- [x] **Step 2: Verify RED**

Run: `node --test scripts/vid-route-contract.test.mjs`  
Expected: FAIL on missing watch modules.

- [x] **Step 3: Implement player bridge**

Load Bunny Player.js once. Subscribe to ready/timeupdate/pause/ended/error,
throttle persistence to five seconds, flush on pause/pagehide and complete at
95%. No motion element may overlap or intercept the iframe.

- [x] **Step 4: Implement content/actions**

Fetch video and bounded related data concurrently. Use Web Share with clipboard
fallback; source opens HTTPS with `noopener noreferrer`; timestamp uses last
player time; invalid/unpublished slug renders a truthful not-found state.

- [x] **Step 5: Verify and commit**

```bash
node --import tsx --test scripts/vid-discovery.test.ts scripts/vid-local-library.test.ts
node --test scripts/vid-route-contract.test.mjs
npm run build
git add components/vid/BunnyPlayer.tsx components/vid/WatchView.tsx components/vid/VidApp.tsx components/vid/Vid.module.css scripts/vid-route-contract.test.mjs
git commit -m "feat(vid): add Bunny watch experience"
```

### Task 9: Ecosystem links, dynamic SEO and video sitemap

**Files:**
- Modify: `components/site-chrome/site-navigation.ts`
- Modify: `components/site-chrome/SiteFooter.tsx`
- Modify: `lib/site-journey.ts` only for a truthful contextual handoff
- Modify: `workers/vid/index.ts`
- Modify: `workers/vid/catalog.ts`
- Create: `scripts/vid-seo.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: published catalog and static shells.
- Produces: secondary Video entry, per-watch metadata/VideoObject and sitemap.

- [x] **Step 1: Write failing SEO/navigation tests**

Require Vid in secondary navigation/footer, not as a fifth primary item. Escape
all D1 strings in title/meta/JSON-LD. Require canonical, thumbnail, uploadDate,
ISO duration and embed URL. Drafts never enter sitemap.

- [x] **Step 2: Verify RED**

Run: `node --import tsx --test scripts/vid-seo.test.ts`  
Expected: FAIL before SEO/navigation implementation.

- [x] **Step 3: Implement safe head transformation**

For `/watch?v=<slug>`, fetch the static shell and use HTMLRewriter to replace
title, description, canonical and OG, then inject escaped VideoObject JSON-LD.
Unknown/unpublished slugs receive noindex metadata.

- [x] **Step 4: Implement sitemap and links**

Serve bounded cached XML from published+ready records. Add
`https://vid.thongphan.com` to secondary/footer; add only semantically valid
Library/Experience handoffs, never a blanket Conan CTA.

- [x] **Step 5: Verify and commit**

```bash
node --import tsx --test scripts/vid-seo.test.ts scripts/vid-worker.test.ts
npm test
npm run build
git add package.json components/site-chrome/site-navigation.ts components/site-chrome/SiteFooter.tsx lib/site-journey.ts workers/vid/index.ts workers/vid/catalog.ts scripts/vid-seo.test.ts
git commit -m "feat(vid): connect video discovery and SEO"
```

### Task 10: Visual QA, security and local release gate

**Files:**
- Create: `scripts/qa-vid.mjs`
- Create: `scripts/vid-release-gate.mjs`
- Create: `docs/qa/VID_SCREENING_ROOM_REPORT.md`
- Modify: `package.json`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Consumes: complete Worker/frontend/operator.
- Produces: `qa:vid`, `test:vid-release`, PASS_LOCAL/PARTIAL/BLOCKED evidence.

- [x] **Step 1: Build isolated realistic QA fixtures**

Intercept API inside QA only, using tracked real repo images with 16:9 slots.
Include long Vietnamese titles, face-sensitive image, no results, API error,
image failure and playlist. Assert no fixture import in production source/output.

- [x] **Step 2: Implement visual matrix**

Measure home/search/watch/playlist/library at 1440×900, 1280×720, 1024×768,
390×844 and 320×568. Fail on overlap, clipping, horizontal overflow, pinned-bar
occlusion, unsafe crop, sub-44 px controls, player pointer blockage or console error.

- [x] **Step 3: Implement interaction/accessibility matrix**

Exercise keyboard/focus, search, sidebar, watch-later, description, share fallback,
mobile bottom nav, reduced motion, hidden-tab preview stop and API/image recovery.

- [x] **Step 4: Implement and run release gate**

Gate focused/full tests, lint, TypeScript, Vid Worker typecheck, build, bundle,
diff check, secret scans, Wrangler dry-run and visual QA. Live Bunny/D1/subdomain
checks report NOT RUN until provisioned.

```bash
npm run test:vid-release
```

- [x] **Step 5: Report exact evidence and commit**

```bash
git add package.json scripts/qa-vid.mjs scripts/vid-release-gate.mjs docs/qa/VID_SCREENING_ROOM_REPORT.md docs/STATUS.md
git commit -m "test(vid): lock screening room release gate"
```

Expected local verdict is `PASS_LOCAL`; overall remains `PARTIAL` until real
Bunny library, D1 and custom domain are verified.

### Task 11: Preview and production provisioning

**Files:**
- Create: `docs/releases/VID_SCREENING_ROOM_RELEASE_REPORT.md` only after live evidence.
- Modify: `docs/STATUS.md`

**Interfaces:**
- Consumes: locally sealed artifact plus verified Bunny/Cloudflare authority.
- Produces: live `vid.thongphan.com` or truthful PARTIAL handoff.

- [x] **Step 1: Discover authority without printing values**

Check only presence of required Keychain services, Wrangler auth, Bunny library
and Cloudflare bindings. Missing authority stops external mutation and becomes an
explicit owner action; it is never silently substituted.

- [x] **Step 2: Provision preview**

Create preview D1, apply only `workers/vid/migrations`, set Worker secrets/vars,
deploy preview route and upload one owner-approved real MP4. Verify Bunny
processing → ready → published and no private field in public API.

- [x] **Step 3: Run preview smoke**

Verify upload resume, webhook auth, source disclosure, home/search/watch, mobile,
reduced motion, canonical, VideoObject, sitemap, cache and artifact fingerprints.

- [x] **Step 4: Cut production only after preview PASS**

Apply production migration, set secrets, deploy the exact Worker artifact, attach
`vid.thongphan.com/*`, publish the approved first video and verify DNS/TLS, API,
Bunny playback, route hashes and rollback version.

- [x] **Step 5: Record live evidence and commit**

Report immutable Worker version, D1 ID, Pages source SHA, public Bunny GUID,
fingerprints, smoke results and rollback IDs. If credentials/domain/approved video
are absent, mark `PARTIAL` and do not create a fake production release claim.

```bash
git add docs/STATUS.md docs/releases/VID_SCREENING_ROOM_RELEASE_REPORT.md
git commit -m "docs(vid): record screening room release evidence"
```

---

## Self-review

- **Spec coverage:** Tasks 1–5 cover data, security, Bunny and Codex upload;
  Tasks 6–9 cover every public journey, source disclosure, SEO and ecosystem;
  Tasks 10–11 cover visual/accessibility/security and truthful release.
- **Boundary coverage:** no task edits Learn; Vid migration, config and route are
  isolated; QA fixtures never enter production catalog.
- **Type consistency:** `PublicVideo`, status enums, API paths and local-state
  names are defined once and consumed unchanged.
- **Placeholder scan:** no unfinished implementation placeholder is accepted;
  missing external credentials remain an explicit release gate.
