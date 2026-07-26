# thongphan.com — Unified Cinema status

Last updated: 2026-07-27

## Thongphan Read Foundation v2 — Release 0 audit — 2026-07-26

- R0.1 design is corrected and split into local remediation and owner-gated production cutover. R0.1A Tasks 1–4 are complete in local source; Tasks 5–8 remain pending. R0.1B production cutover has not started.
- R0.1A remains source/local verification and a separate implementation PR only. R0.1B requires another owner prompt after both documentation and implementation PRs are merged into clean GitHub default `main`. R0.H1 public-history remediation is separate, destructive and nonblocking after credential rotation plus current-tree controls pass.
- Latest R0.1A verification after Task 4 passes: full suite `273/273`, root and Worker TypeScript, lint, current-tree secret-integrity scan with zero findings, and static build `82/82` with `/chat` retained as a static route.
- Both retired capability dry-runs pass without bindings: `/api/embed` emits `1.23 KiB / gzip 0.60 KiB`, and `/api/chat` emits `1.21 KiB / gzip 0.59 KiB`; Wrangler reports `No bindings found.` for each.
- The owner inventory check records Candidate A as `invalid` and Candidate B as `legacy_orphaned_not_present_in_active_inventory`; only these status classifications are retained.
- Production is unchanged by R0.1A Tasks 1–4: no deploy, route mutation, D1 write or migration, email send, credential mutation, or Git-history rewrite occurred. R0.1B remains a separately owner-gated production action.
- R0 technical audit is complete against canonical runtime repo `/Users/rio/thongphan-com`, branch `main`, HEAD `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`. The legacy `/Users/rio/Projects/thongphan-read` directory is migration provenance only; no legacy runtime was restored.
- Verified current stack: Next.js 16.2.10 App Router, React 19.2.5, TypeScript 6.0.3, npm, static export to Cloudflare Pages plus dedicated Workers. Public Read remains canonical under `/library*`; `/read` is absent and returns a noindex 404.
- Baseline passes: TypeScript, Worker TypeScript, lint, full 242/242 suite, 82-route build, release gate (build 6/6, SEO 4/4, bundle 3/3, Brain2 143/143), Read safety 3/3 and seven Wrangler Worker dry-runs. Live sitemap crawl returns 55/55 HTTP 200.
- R0 identified owner gates before R1: reader identity/entitlement, preview-production data isolation, privacy/retention, email delivery and 210 legacy queue rows, analytics, CI/dependency scanning, and P0 ownership/security for the existing unauthenticated `/api/embed` mutation route. `npm audit` has no fresh verdict because both npm audit endpoints failed after a clean temporary install.
- Full evidence: `docs/discovery/R0-AUDIT-REPORT.md`. `CURRENT-SYSTEM-AUDIT.md`, the SAD and Data/Event Architecture now distinguish verified current state from target architecture.
- No app feature, framework, route, Worker, schema, migration or production Cloudflare setting changed. No deploy was run. R0 remains at owner approval gate and PRD-R1 must not start until that approval is explicit.

## Brain2 kickoff-video restoration — production release — 2026-07-16

- Restored the original kickoff video to `/brain2/21-ngay` from the verified
  legacy source: YouTube ID `ubsOey-hDyg`, label
  `Buổi Kick-off Brain2 Challenge · Tháng 5/2026` and the real YouTube
  thumbnail. Both the editorial text action and poster open the canonical video
  in a separate tab with safe external-link attributes.
- Added a responsive Cinema screening-room section between the transformation
  and roadmap chapters. Browser QA passes at 1440×900 and 390×844: the thumbnail
  loads at natural size, mobile stacks to one column, horizontal overflow is
  zero and the focusable link has an explicit accessible name.
- Regression-first evidence passes: focused hub contract 7/7, full suite
  242/242, Brain2 release suite 143/143, lint, TypeScript and the 82-route static
  build. The generated artifact contains the exact video URL, label and
  thumbnail; live YouTube and thumbnail probes both return HTTP 200.
- Preview `e36e4d04-58b9-4be4-bb5d-745c86ead1a9` and production
  `350ecbc7-9eec-4661-8451-2b129577b97c` serve source `12880bc`. The production
  origin, apex and `www` return byte-identical Brain2 hub HTML and all include
  the exact kickoff URL, label and thumbnail. Core route smoke, the permanent
  `/challenges` redirect, disabled Learn 404 and exclusion of the four unrelated
  Conan Maker assets pass on all three surfaces. Previous production `3bc101dc`
  remains the rollback point.
- Detailed evidence:
  `docs/releases/BRAIN2_KICKOFF_VIDEO_PRODUCTION_RELEASE_REPORT-2026-07-16.md`.

## Homepage polish regression — production release — 2026-07-14

- Repaired the homepage Hero safe area, Vietnamese display-name wrapping,
  portrait focal crop, six-frame evidence reel, full-height mobile menu and the
  above-the-fold reveal baseline without touching the separate Learn workstream.
- Root causes were reproduced and regression-locked on 1440×900, 1280×720,
  1024×768, 390×844 and 320×568. Browser-rendered static-artifact QA confirms
  complete accents/hairline/face, working reel pause, working mobile menu focus and
  Escape restoration, zero overflow and zero P0/P1/P2 visual finding.
- `npm test` (242/242), lint, TypeScript, 82-route build, release gate, six-pair
  Learn exposure matrix and `git diff --check` all pass. Clean preview `0d49e550`
  and production `3bc101dc` serve source `b2aa9d9`; origin, apex and `www` homepage
  hashes match and the full route smoke passes.
- Detailed evidence:
  `docs/releases/HOMEPAGE_POLISH_PRODUCTION_RELEASE_REPORT-2026-07-14.md` and
  `design-qa.md`.

## Current phase

**Homepage polish and Experience Hub Foundation are live on canonical production.** `/experiences` is
the public practice hub and `/challenges` is a preserved 301 compatibility route.
Pages production `3bc101dc` serves source `b2aa9d9`; custom-domain router version
`dfaaca5d` preserves Pages redirects on apex and `www`. The prior Pages deployment
`faa9aeae` and router version `d6a877e3` remain independent rollback points.

**Origin Story + 21 ngày Brain2 remains live on canonical production.** The public
hub, 21 lesson shells, seven complete public lessons, anonymous progress/access UI,
the dedicated protected-content Worker, its private release gate, the inert email v2
release candidate, the five-act `/about` origin film, the compact homepage bridge,
canonical cross-site journey and fail-closed legacy-retirement artifacts are locally
complete. Task 14 release QA, canonical Task 15 production cutover and legacy Pages
retirement are complete. The consolidation includes only the legacy 21-day challenge;
the private Brain2 vault, chat and standalone app remain explicitly excluded. Motion
Atmosphere remains complete and live.

Task 15 provisioned the isolated KV, D1 migration, two Keychain/Worker secrets, all
14 protected packages, access Worker `524eacb7`, signup Worker `e0b86041`, preview
`8452a6ae` and canonical Pages production `a0554edc`. Public, protected and signup
production smoke passes. `brain2.thongphan.com` is redirect-only through dedicated
Worker `thongphan-brain2-legacy-redirect` version `41583ee4`; the response fingerprint
`worker-v1` proves Pages is not serving the domain. The complete `brain2-platform`
Pages project, its `REFLECTIONS`/Brevo bindings and all 64 audited deployments are
gone. Post-delete verification made 128 requests across all 64 immutable URLs and
their cache-busted variants: all were unreachable with zero legacy body hits. Email
remains undeployed because the available Brevo credential returns 401.

## Experience Hub Foundation — production release — 2026-07-14

- Preview `b7a31c73` and production `faa9aeae` serve the exact verified artifact;
  public and immutable-origin homepage/Experience hashes match.
- The local full-site browser matrix passes 70/70 responsive/motion cases and 9/9
  interactions. Experience Hub passes 5/5 with 21 segmented screenshots on local,
  preview and production runs.
- Core public routes return 200. `/challenges` redirects 301 to `/experiences` on
  Pages, apex and `www`. Disabled Learn paths return real noindex 404 responses and
  no Learn anchor appears in Experience.
- Production smoke found the old custom router flattened upstream redirects by
  following them. Regression-first commit `19e8dab` moved the router into this
  repository and changed only redirect handling; 240/240 tests and the production
  smoke pass. The dedicated Brain2 API still bypasses the global router.
- Detailed evidence:
  `docs/releases/EXPERIENCE_HUB_PRODUCTION_RELEASE_REPORT.md`.

## Experience Hub Foundation — implementation history — 2026-07-13

- `/experiences` is the canonical public hub for currently usable diagnostic,
  challenge and release-enabled Learn experiences.
- `/challenges` is redirect-only; sitemap, journey and pinned navigation use the
  canonical Experience route.
- The registry is versioned, fail-closed for Learn and exposes no unavailable Tool,
  Account, subscription or credit destination.
- Desktop, mobile, reduced-motion, keyboard, link, SEO, build and source contracts
  pass. Task 5 uses 21/21 authoritative segmented-viewport PNGs; Chromium full-page
  capture is retired due the documented headless compositor blocker. Evidence is
  recorded in `docs/qa/EXPERIENCE_HUB_FOUNDATION_REPORT.md`.
- Learn release now requires two aligned exact-`true` controls: build-time
  `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED` and the Pages runtime binding
  `LEARN_PUBLIC_ENABLED`. The local gate builds distinct enabled/disabled artifacts
  and runs all six artifact/runtime pairs. Only the coherent enabled pair passes the
  exact indexable DOM/head contract; the coherent disabled pairs stay real noindex
  404 responses, and both mismatched control pairs are explicitly rejected. An
  atomic worktree lock serializes the matrix before any `out/` access; concurrent and
  unknown-lock runners fail closed, while owner signal cleanup restores the original
  artifact and stops all owned child process groups. Signal handlers are registered
  before lock acquisition, and deterministic post-`mkdir` SIGINT/SIGTERM contracts
  prove exit codes 130/143, owned-empty-lock removal and zero build/temp/process leak.
  The lifecycle protocol, acceptance criteria and interactive RED/failure trace are
  recorded in the
  [Learn preview lifecycle amendment](superpowers/plans/2026-07-13-thongphan-experience-hub-foundation.md#amendment-learn-preview-lifecycle-hardening-2026-07-13).
- QA output deletion is restricted to the dedicated `os.tmpdir()` evidence directory
  or a validated descendant, including symlink-escape protection. Rendered checks now
  await and decode every image and use ancestor-aware `checkVisibility` plus real
  client geometry. A zero-opacity ancestor regression fixture fails as intended.
- Experience Hub muted/caption copy uses scoped `#625b52`, measuring 5.83:1 on
  `#f3efe6` and 5.03:1 on `#e8decf`.
- The separate Learn repository/runtime and the live Brain2 access boundary were not
  changed by this website task. Its task-start 66-line dirty-state snapshot remained
  exact through the matrix work; during final verification, a concurrent Learn thread
  added only ` M docs/DEBUG_LOG.md`, producing a 67-line status with SHA-256
  `552944d50c8af924b5f895d02cbe0629fa0fb0befc9f6bb75f8998e56597b836`
  while HEAD remained `bb57a093ee7d6b2591a9627b1fb981efbf518d0b`.
- Production deployment was explicitly authorized and completed on 2026-07-14.

## Experience + Commerce Ecosystem — approved written design — 2026-07-13

- Brain2 content-restoration spec and visual target remain awaiting written and visual approval;
  the approved Experience + Commerce ecosystem document does not approve that separate work.
- Experience Hub Task 5 now passes locally with segmented viewport evidence.
  Chromium `fullPage` evidence is permanently retired for this route after two
  failed capture-only mitigations; no third workaround or production change was
  attempted. The replacement matrix passes 5/5 cases and original-resolution
  inspection passes 21/21 PNGs: four ordinary viewport segments per case plus one
  active-motion desktop viewport. H1/card title/body/link signatures match across
  desktop, mobile, 320px, reduced-motion and no-JavaScript; visibility, media,
  overflow, overlap, console and keyboard-focus contracts pass. The architecture
  boundary is recorded in
  `docs/qa/STUCK_REPORT_EXPERIENCE_FULLPAGE_CAPTURE_2026-07-13.md`; final evidence
  is in `.superpowers/sdd/task-5-report.md`.
- Experience Hub Task 4 connects the canonical `/experiences` route to the shared
  journey and pinned navigation. The retired `challenges` journey key/handoff is
  removed while `challenge-detail` remains; primary navigation exposes four internal
  destinations with Learn disabled and five when released. Assets, 21 ngày Brain2 and
  Conan Maker remain secondary mobile/footer destinations, with 44px minimum mobile
  targets. Focused contracts pass 27/27, the full suite passes 221/221, TypeScript and
  scoped ESLint pass. No Tools/Account, Learn runtime or Brain2 access change was made.
- Experience Hub Task 3 now makes `/experiences` the sole canonical practice index:
  the former `/challenges` page/data wrapper is removed, Cloudflare compatibility is
  a permanent `301`, sitemap and route mode use `/experiences`, and an executable-source
  guard rejects stale `/challenges` destinations. Focused contracts pass 14/14, the
  full suite passes 220/220, static export passes 82/82, SEO passes 4/4 and bundle
  budgets pass 3/3. The asset-detail handoff moved to `/experiences` as the minimum
  Task 4 overlap required to make the stale-link contract truthful; navigation and
  the retained legacy journey key/handoff remain for Task 4.
- Anh Thông approved an independent product ecosystem rather than a Conan-only funnel:
  Learn subscription revenue, usage-based tool credit revenue and Conan Maker as a
  separate premium transformation environment.
- The approved commercial baseline is one shared identity, Learn at an experimental
  VND 179,000/month, monthly member credits and separately purchasable credits. Exact
  credit units and packs remain blocked on measured tool unit economics.
- Five product spaces are defined: public `thongphan.com`, Experience Hub,
  `learn.thongphan.com`, Tools and `Không gian của tôi`.
- Deep interactive articles, diagnostic, 3/7/21-day challenges and tool trials share an
  Experience Engine contract and produce versioned user-owned `Tác phẩm`.
- The north-star metric is weekly users who produce a meaningful result, not pageviews.
- Learn is being actively developed in another Codex thread. This worktree owns only
  the ecosystem design document and must not edit the Learn repo, schema, migrations,
  Workers, lesson packages or runtime. Future cross-repo implementation requires a
  fresh HEAD/STATUS checkpoint and versioned owner/producer/consumer contract matrix.
- Written design approved by anh Thông:
  `docs/superpowers/specs/2026-07-13-thongphan-experience-commerce-ecosystem-design.md`.
- The program is split into independently releasable plans. The first detailed plan
  changes only the public site: versioned Experience Registry, canonical
  `/experiences` hub, permanent `/challenges` redirect, journey/navigation integration
  and rendered QA:
  `docs/superpowers/plans/2026-07-13-thongphan-experience-hub-foundation.md`.
- The Experience Hub foundation slice is now locally verified through Tasks 1-6 and
  the final review hardening at implementation commit `7c4956a6ac69b84101391345782011f3627f5f06`.
  Learn repository/runtime, subscription, credit, Tools and shared-account
  implementation remain outside this plan.

## Origin Story + 21 ngày Brain2 — approved design and implementation audit — 2026-07-12

- Approved story arc: difference → success → collapse → rebuilding → system. The HSTL
  consequence is a first-person account: the event left more than VND 2 billion of
  debt and, ten years later, it still had not been fully repaid. Do not rewrite that
  as a completed “ten-year recovery” or treat it as audited financial data.
- Homepage receives a compact origin bridge inside the existing proof chapter; `/about`
  carries the full five-act narrative and ends at the 21-day practice.
- Canonical challenge routes are `/brain2/21-ngay` and
  `/brain2/21-ngay/ngay-01` through `ngay-21`.
- Week 1 is public. Weeks 2–3 stay Conan Maker-only behind a server-validated access
  session. The public GitHub repo and static output may contain no protected lesson.
- Because the legacy subdomain has been public, retirement uses a permanent redirect
  only after canonical content, signup, access and production parity pass.
- The production audit found R2 disabled, a global router that rewrites cache headers,
  210 overdue legacy email rows and 64 content-serving legacy Pages deployments across
  three API pages. The
  approved implementation therefore uses a dedicated private KV namespace instead of
  R2 plus a more-specific access Worker, quarantines all old queue rows as `legacy-v0`
  so the new sender selects only `brain2-2026-v1`, and removes old immutable
  deployments only after the redirect-only replacement passes.
- Pages preview shares production D1/KV bindings, so release-preview QA is read-only;
  real signup/access mutations run only on the apex after production deployment and
  before legacy retirement. Redirect retirement must also remove the legacy
  `REFLECTIONS` and Brevo secret bindings explicitly.
- Written design:
  `docs/superpowers/specs/2026-07-12-origin-story-brain2-21-day-integration-design.md`.
- Implementation plan:
  `docs/superpowers/plans/2026-07-12-origin-story-brain2-21-day-integration.md`.
- Implementation started with an always-on repository-boundary test, hardened private
  source ignores and the migration parser dependency. Feature slices continue through
  TDD before rendered QA, production smoke and release evidence.
- Canonical lesson migration now passes the Task 2B boundary: 21/21 lessons normalized,
  seven public packages tracked, 14 protected packages written only to the validated
  outside-repository directory, 41 copy-derived prompts and 65 source external links
  inventoried. The offline validator and real-source migration suite pass; route,
  Worker, email and release work remain in later slices.
- Task 2B review hardening removes protected package fields from tracked metadata,
  derives them only during private migration, rejects descendant symlinks and every
  unexpected package-directory entry, and preserves heading word boundaries while
  filtering dynamic claims and counting only retained external HTTPS links.
- The public-data generator now revalidates every tracked public checksum before
  emitting a deterministic module with metadata for 21 days and bodies for days
  01–07 only. Route theming is locked to a dark evidence hub and calm paper-light
  lesson pages.
- The canonical hub and all 21 static lesson shells now build locally. Days 01–07
  render the complete typed working documents; days 08–21 emit metadata-only locked
  shells with `noindex, follow`. The locked client chunk is 5,091 bytes and contains
  no public or protected lesson body. Stale pricing/access claims discovered during
  rendered QA were removed at the migration layer; retained external links are now 60.
- Task 4 verification: focused route/static contracts 12/12, full suite 129/129,
  TypeScript pass and static build 83/83. Desktop/mobile browser checks show no
  horizontal overflow; the hub hero is three lines at 1440px and four at 390px.
- Anonymous progress, resume and protected access UI are now complete in commit
  `3a03f00`. Protected packages are checked against an exact browser-safe schema,
  canonical metadata and SHA-256 body checksum before rendering; stale requests are
  invalidated with generation guards and `AbortController`.
- The access dialog portals to `body`, covers the viewport, locks both document
  scrollers, traps/restores focus and sends only `{ code }`. A failed server logout
  keeps the lesson visible and reports the failure; only a confirmed DELETE clears
  content. The complete 21/21 state no longer offers a contradictory resume action.
- Task 5 verification: focused 27/27, full 149/149, TypeScript pass, static build
  83/83, npm audit zero vulnerabilities, final rendered QA at 1440×900 and 390×844,
  and re-review with 0 Critical/0 Important. The hub/lesson route chunks measure
  2,967/7,919 bytes gzip and the sensitive-string scan reports zero hits.
- The dedicated `thongphan-brain2-access-api` Worker is now a locally verified release
  candidate. It owns only the exact apex/www challenge API paths, uses a signed
  path-scoped session, reserves each of five rolling attempts atomically in D1 before
  evaluating a code, and validates immutable KV packages against exact public metadata,
  schema, byte ceiling and SHA-256 body checksum. All responses are private/no-store;
  local development/preview hostnames and shared KV reuse are disabled.
- Task 6 verification: focused 13/13, full 162/162, TypeScript pass, static build
  83/83, npm audit zero vulnerabilities and Wrangler 4.110.0 dry-run at 10.46 KiB
  gzip. A 12-token scan compared 12,792 private fingerprints across 1,733 tracked/build
  files and found zero hits. Independent review ended at 0 Critical/0 Important/0
  Minor after TDD fixes for chunked-body buffering, mixed-candidate concurrency and
  D1 release failure. The tracked KV ID remains a deliberate non-deployable placeholder;
  no remote resource, migration, secret or Worker was changed in this slice.
- The private release gate now validates all 14 outside-repository packages, refuses
  reused release prefixes, uploads only by file path, reads every KV value back as raw
  bytes and compares both byte equality and SHA-256. Live publish also requires the
  supplied namespace ID to match the provisioned `BRAIN2_CONTENT` binding; the tracked
  placeholder cannot be used accidentally.
- The companion scanner compares protected display-unit fingerprints against tracked
  and non-ignored files, `.next/static`, `out`, source maps and the Worker bundle. It
  also supports in-memory exact scans for the future raw access/session secrets from
  Keychain without printing them. Task 7 verification: focused 9/9, full 171/171,
  TypeScript pass, real-package dry-run 14/14 and a real scan of 1,746 files against
  6,882 normalized fingerprints with zero hits/symlinks. Independent review ended at
  0 Critical/0 Important/0 Minor. No KV or other remote state was touched; Task 15
  must rerun with `--require-keychain-secrets` after provisioning.
- Email campaign v2 is now locally complete and inert. Existing rows remain
  `legacy-v0`; migration triggers block their update/delete, while signup creates only
  `brain2-2026-v1` rows in one D1 batch. Day 1 schedules after two minutes and days
  02–21 at 09:00 Asia/Ho_Chi_Minh. All 21 emails contain only public manifest metadata,
  the canonical lesson link and a signed non-PII unsubscribe URL.
- Signup now bounds streamed request bodies, normalizes addresses, rate-limits opaque
  IP/email keys through two Worker bindings and returns a stable no-store JSON shape
  for duplicates, abuse and D1/binding outages. The Brevo sender claims atomically,
  scopes every outcome to its exact attempt, uses the queue UUID as idempotency key,
  times out provider calls before the lease and never exposes a public send trigger.
- Task 8 verification: focused 13/13, full 184/184, frontend and dedicated Worker
  TypeScript passes, static build
  83/83, npm audit zero vulnerabilities and private leak scan 1,749 files/6,882
  fingerprints/zero hits. Wrangler dry-runs pass at 10.12 KiB gzip for signup and
  11.53 KiB gzip for email; the email config still has `crons = []`. SQLite behavior
  tests cover live third-attempt cleanup and stale-owner races. Rendered QA at
  1440×900, 390×844, 320×568 and reduced-motion reports zero overflow, broken images
  or console errors; keyboard, validation, retained-field failure and synthetic
  success states pass. Production D1 was audited read-only at 10 signups (one
  case-insensitive duplicate group) and 210 pending/zero sent legacy queue rows; no
  remote state or provider call was changed in this slice. Brevo credential health,
  secret provisioning and cron activation remain Task 15 release gates. Independent
  final review ended at 0 Critical/0 Important/0 Minor.
- The typed origin-story evidence layer is now locally complete. Five ordered acts are
  built only from reviewed press, personal-account, owned-archive and system-record
  claims; canonical act titles are allowlisted, unknown fields fail closed, generated
  history is rejected and the public DTO has a second private-data postcondition.
- The related public article/note chain now separates press evidence from first-person
  consequence, uses the approved three-week Brain2 rhythm and no longer repeats the
  unsupported changing counts that previously leaked through author cards and related
  metadata. The former numeric viral cover is replaced by a text-free Cinema editorial
  asset with tracked rights, dimensions and hash.
- Task 9 verification: focused origin/editorial contracts 11/11, full 192/192,
  TypeScript pass, static build 83/83, npm audit zero vulnerabilities and private scan
  1,756 files/6,882 fingerprints/zero hits. Rendered QA passed 22/22 desktop/mobile
  reduced-motion cases across eleven changed article/note routes with complete body
  copy, one H1 and zero overflow, broken images, audited stale strings or relevant
  console errors. Independent final review ended at 0 Critical/0 Important. A proposed
  Kênh14 date-label minor was rejected after the live page confirmed `21/05/2015`.
- `/about` is now a five-act evidence film rather than a metric-card biography. It
  consumes only the reviewed public origin DTO, distinguishes press evidence from
  first-person consequence, preserves one disclosure for the ImageGen metaphor and
  ends with the canonical 21-day Brain2 action plus the public proof ledger.
- Task 10 verification: focused origin/SEO/motion/handoff contracts 31/31, full suite
  196/196, TypeScript pass and static build 83/83. Rendered QA passed seven desktop,
  short-laptop, tablet, mobile, reduced-motion and no-JavaScript cases with zero
  overflow, broken images or crop distortion; primary analytics fires once and the
  proof action emits nothing. Review found and TDD-fixed a dark-heading contrast
  regression: the final export measures 17.56:1 at desktop/mobile. The in-page anchor
  clears the pinned header by 8.5–15.4px, repeated stage imagery was reduced, and the
  final independent review ended at 0 Critical/0 Important/0 Minor.
- Task 11 commit `eb13a7a` adds one compact, sourced origin bridge inside ACT 03. It
  renders the first-person consequence once, labels it explicitly as personal account
  rather than audited data and emits only `origin_story_opened`. A production-bundle
  runtime check found that client-exported event constants had become `undefined` in
  server consumers; the event contract now lives in a server-safe module.
- ACT 03 QA passed at `1440×900`, `1280×720`, `1024×768`, `390×844`, `320×568` and
  reduced motion with zero overlap, horizontal overflow, broken image, console error
  or duplicate event. A failing `1440×900` height case produced a proof-only compact
  breakpoint; the hero is not shrunk. Keyboard focus, evidence modal Escape and the
  canonical mobile navigation action pass.
- Task 12 commit `f2de474` makes `/brain2/21-ngay` the sole internal challenge detail,
  deletes the duplicate `/challenges/[slug]` implementation, adds permanent redirects
  for `/brain2` and the former detail URL, lists only the hub and seven public lessons
  in the sitemap, and removes the unsupported fixed 15-minute promise. The route-graph
  guard now scans non-test executable `.mjs` sources, which caught and fixed a stale QA
  route during independent review.
- Task 13 commit `5e5a0b2` creates the redirect-only legacy artifact and a private
  snapshot at `/Users/rio/Private/thongphan-brain2-legacy-2026-07-12`. The snapshot
  contains exactly the closed eight-file source allowlist, sanitized live evidence and
  all 64 production deployment IDs from three REST pages (`25/25/14`). Every directory
  is mode `700`, every file is mode `600`, 11/11 manifest artifacts match byte count
  and SHA-256, the audited deployment ID is present and no private reflection content
  was printed.
- Tasks 11–13 verification: full suite 199/199, TypeScript pass, static build 82/82,
  legacy-retirement tests 10/10 and `git diff --check` pass. Independent re-review
  ended at 0 Critical/0 Important/0 Minor. These slices performed no remote mutation.
- Task 14 local release QA passes: full suite 211/211, authoritative Brain2 release
  suite 145/145, frontend/Worker TypeScript, ESLint, 82/82 static build, build 6/6,
  SEO 4/4, bundle 3/3, Read safety 3/3, production dependency audit and diff hygiene.
  Source/artifact parity locks exact metadata plus checksums across all 21 packages.
- Link QA inventories all 65 source occurrences, retains 60 HTTPS occurrences across
  40 unique live targets and passes all 40 network checks; five unsafe/stale source
  occurrences remain deliberately omitted. Hub and lesson route deltas are
  5,055 and 13,004 bytes gzip. The former 1.1 MB article PNG is a verified 68 KB WebP.
- Rendered QA passes 70/70 viewport/motion cases and 9/9 interactions through the
  actual built access Worker for unauthorized, tampered and authorized states. It found and
  fixed two real standalone Conan Maker prefetch 404s; homepage and `/about` now use
  canonical document anchors. Screenshot and JSON evidence lives under
  `/tmp/thongphan-brain2-release-qa` and contains no authorized protected lesson.
- The hardened private scanner covers server source maps, rejects stale Worker bundles
  and exposes an explicit strict mode requiring two Keychain secrets. Its Task 14
  diagnostic reports 2,689 files, 6,882 fingerprints, zero hits and zero symlinks.
  The expected remaining
  Task 15 prerequisites are the dedicated KV ID and the two not-yet-provisioned
  Keychain secrets; email remains inert pending a valid Brevo credential.
- Detailed local/production checklist:
  `docs/BRAIN2_21_DAY_PRODUCTION_RELEASE_REPORT.md`.

## Motion Atmosphere production release — 2026-07-12

- Unified navigation is fixed on desktop/mobile. It compacts after `24px` of scroll;
  the homepage chapter bar remains directly below it and active-section tracking is
  preserved.
- Homepage hash navigation now reserves `8.5rem` desktop and `4.75rem` mobile, so a
  pinned header cannot cover the destination. This was found in Browser QA, reproduced
  at `#proof`, locked with a failing contract and verified after the fix.
- One route-aware atmosphere runtime owns requestAnimationFrame-throttled pointer
  coordinates, fine/coarse pointer detection, page-visibility pause and dynamic
  reduced-motion teardown. Dark Cinema is full, indexes restrained and reader detail
  is `ambient: none` with its keyframes stopped rather than merely hidden.
- Approved CTAs, evidence cards, path rows, library lanes and chapter handoffs opt in
  to lacquer light sweep, bounded depth and maximum `1.02` media scale. Article prose,
  forms and reading bodies remain outside the effect boundary.
- Existing GSAP is lazy-loaded only outside reduced-motion mode. Mask, fade and drift
  reveals replace the uniform bottom-up entrance; approved homepage media uses at most
  `18px` shallow parallax and all ScrollTriggers/contexts are torn down.
- In-app Browser verified page identity, meaningful DOM, console health, screenshots,
  homepage chapter interaction and the Library/reader journey. Responsive matrix used
  local Playwright because the in-app Browser viewport is fixed and exposes no viewport
  resize method.
- Responsive QA covered `/`, `/library`, the Steve Jobs full reader, `/about` and
  `/diagnostic` across 14 desktop/mobile/reduced-motion cases including `1440x900`,
  `1280x720`, `390x844` and `320x568`: fixed header at top/mid-page, zero hero
  nav/title or CTA/film collisions, zero horizontal overflow, zero broken loaded
  images and zero relevant console warning/error.
- Interaction QA: pointer CSS coordinates update; CTA sweep remains hit-testable;
  keyboard focus is a visible 3px solid outline and Enter reaches `/diagnostic`;
  mobile menu focuses Close, locks body scroll, closes with Escape and restores focus;
  simulated page visibility pauses ambient animation. Reduced-motion and coarse
  pointer modes both disable pointer response; reader ambient animation is `none`.
- Fresh verification: `npm test` 115/115, `npx tsc --noEmit`, static build 61/61,
  release contracts 10/10, Read safety 3/3 and `git diff --check` passed.
- Production deployment `579969f1-1d7d-4bf0-ad75-554d4837cb88` is live from source
  commit `85b4ad3` on branch `main` at both `https://579969f1.thongphan-com.pages.dev`
  and `https://thongphan.com`.
- Production smoke passed 10 route/viewport/motion cases across the Pages origin and
  public domain: homepage desktop/mobile, Library desktop, reader mobile and homepage
  reduced-motion. Every case returned HTTP 200 with a fixed/compacting header, zero
  hero collisions, zero horizontal overflow, zero broken loaded images and zero
  relevant console errors. Library reports restrained ambience; reader and reduced
  motion report no ambient animation. Keyboard focus remains a visible 3px solid
  outline and Enter reaches `/diagnostic`.
- Evidence: `/tmp/thongphan-motion-atmosphere-qa/report.json`,
  `/tmp/thongphan-motion-atmosphere-qa/home-hover-1280x720.png`,
  `/tmp/thongphan-motion-home-390x844.png`,
  `/tmp/thongphan-motion-library-1440x900.png` and
  `/tmp/thongphan-motion-steve-jobs-2005-stanford-commencement-address-390x844.png`.
  Production evidence: `/tmp/thongphan-motion-atmosphere-qa/production-report.json`
  and `/tmp/thongphan-motion-atmosphere-qa/production-home-85b4ad3-1280x720.png`.

**Hero vertical-layer rescue is complete and live.** Production measurements on
2026-07-12 found that the chapter menu ended at `128px` while the display name began
at `105px`, producing a repeatable `23px` collision on desktop. The decorative frame
also rendered above the CTA and evidence rail, and the proof microcopy crossed the
film rail by `6.9px` at `1440x900`. The corrected vertical safe zones and layer order
are live from source commit `71b4042`. Read content remains restored; Learn remains
fail-closed until its independent PWA is ready.

### Hero vertical-layer rescue verification

- Added a regression contract for the desktop chapter-nav safe zone and explicit
  decorative/content/film layer ordering; verified red before the CSS fix and green
  afterward.
- Local rendered QA passed at `1440x900`, `1440x768`, `1366x768`, `1280x720`,
  `1280x650`, `1024x768`, `834x1194`, `390x844` and `320x568`: zero nav/title,
  CTA/film and microcopy/film intersections; zero horizontal overflow; the CTA is
  the active hit target; no console warning/error.
- Reduced-motion was enabled across the rendered matrix. Visual captures:
  `/tmp/thongphan-hero-after-1440x900.png`,
  `/tmp/thongphan-hero-after-1280x720.png` and
  `/tmp/thongphan-hero-after-390x844.png`.
- Fresh local verification: `npm test` 110/110, `npx tsc --noEmit`, static build
  61/61 pages, release contracts 10/10 and Read safety 3/3 passed.
- Production deployment `3f29ba89-b4b8-4597-badf-b374b7d3b78c` is live on branch
  `main`. Both its Pages origin and `https://thongphan.com` passed desktop, short
  laptop and mobile smoke with zero intersections/overflow/console errors. The CTA
  has a visible 3px focus outline and keyboard activation reaches `/diagnostic`.
- Production screenshot: `/tmp/thongphan-prod-hero-71b4042-1280x720.png`.

## Production rescue — 2026-07-12

- Reproduced the hero display-name/promise collision at `834x1194` and `1440x900`.
- Confirmed the migration source still contains 13 translated articles, 2,650 body
  blocks and 65 editorial image records.
- Root cause: `scripts/migrate-readings.mjs` forced `publicationMode: summary`,
  omitted `sections`, marked every image pending and explicitly copied zero assets.
- Rescue acceptance: no text collision at supported breakpoints; face-safe hero and
  proof imagery; 13/13 articles render their complete translated body; 5/5 editorial
  images per article render without destructive crop; original source remains visible.
- Local rescue verification: `npm test` 109/109, `npx tsc --noEmit`, static build
  61/61 pages, Read safety 3/3 and release contracts 10/10 passed.
- Browser QA at `1440x900`, `834x1194`, `390x844` and `320x568` reports zero
  title/promise collision, zero stamp/promise collision, zero horizontal overflow
  and zero broken homepage images. Reduced-motion mobile smoke also passed.
- All 13 reading routes were opened at `390x844`; all 65 editorial images loaded
  with non-zero natural dimensions, `object-fit: contain`, zero horizontal overflow
  and no console warning/error. Steve Jobs was additionally inspected desktop/mobile
  at the article header, lead portrait, body, table of contents and inline imagery.
- Browser evidence: `/tmp/thongphan-rescue-qa.json`, `/tmp/read-all-final.json`,
  `/tmp/home-mobile-final-rescue.png`, and `/tmp/read-steve-actual-body-*.png`.
- Production deployment `103d290f-9545-4e28-bca5-44e23062be4d` is live from
  source commit `0800037` at `https://thongphan.com` (production branch `main`).
- Production Browser/Playwright smoke passed at desktop and mobile: zero hero
  collisions/overflow/broken first-view images; 13/13 readers expose complete body;
  65/65 lazy editorial images loaded after viewport activation with non-zero natural
  dimensions and `object-fit: contain`. Evidence: `/tmp/prod-rescue-final-0800037.json`,
  `/tmp/prod-lazy-images-0800037.json`, and `/tmp/prod-home-*-0800037.png`.

## Cinema Chapters journey system - production release

- Added one typed route-intent registry for 12 journey contexts and a shared,
  asymmetric chapter handoff that works on both dark cinema and light editorial
  surfaces.
- About now closes with three reasoned next steps instead of a repeated generic CTA.
- Chat now returns three contextual routes after local, remote, and network-fallback
  answers without changing the existing API payload.
- Diagnostic keeps the five approved questions and score boundaries, then turns each
  result into three reasoned actions. Advanced outcomes lead to the local Conan Maker.
- Standalone `/conanmaker/` links use normal anchors instead of Next prefetch, which
  removes the invalid `__next._tree.txt` request while preserving the canonical
  trailing slash.
- Unified routes now use IBM Plex Mono for operational labels, a semantic oxblood
  token, and a physical brand-stamp browser icon.
- Library now starts from three concrete visitor states: clarify the blockage,
  turn expertise into an output, or begin a 21-day practice rhythm.
- Library, world readings, living notes, reading detail, Assets, Challenges, and
  Blog index/detail routes now close with contextual chapter handoffs. Reading
  surfaces stay paper-light; action surfaces stay cinema-dark.
- The stale external Conan link on asset detail now resolves to the verified local
  `/conanmaker/` bridge.

### Cinema Chapters verification

- `npm test`: 109/109 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: 61/61 static pages generated.
- `npm run test:release`: 10/10 passed.
- Browser QA passed at `1440x900`, `390x844`, and `320x568`: one H1 per page,
  no horizontal overflow, correct canonical destinations, no relevant console errors,
  and reduced-motion transitions collapse to effectively zero duration.
- Browser DOM and interaction checks were run in the in-app Browser. Final visual
  screenshots used the local Playwright fallback because the in-app screenshot API
  returned the top of the document after a programmatic scroll.
- Local evidence: `/tmp/thongphan-cinema-chapters-qa/report.json` and
  `/tmp/thongphan-cinema-chapters-qa/*.png`.
- Expanded subpage QA covered 10 representative index/detail routes at desktop
  and mobile (20 checks): zero overflow, zero console/network error, 44px minimum
  targets, reduced motion, and no self-link on the world-reading index.
- All nine unique internal handoff destinations returned HTTP 200. Keyboard focus
  is retained with a visible 2px solid focus ring.
- Final preview `2b34c806-3e46-4a64-bdb6-500ca46470a6` and production
  `f6370989-798d-49a4-9ff7-f4716f12bb78` passed the same journey smoke matrix.
- `/learn`, `/learn/free`, `/learn/diagnostic`, and course paths return real HTTP
  404 responses with `noindex, nofollow` until the Learn release flag is enabled.
- Production report: `docs/releases/CINEMA_CHAPTERS_PRODUCTION_RELEASE_REPORT.md`.

## Production release

- Source commit: `5f684d132b3d9fb77f08aa27e890f98cb1868fe8`
- Preview: `https://2b34c806.thongphan-com.pages.dev`
- Production deployment: `f6370989-798d-49a4-9ff7-f4716f12bb78`
- Production origin: `https://f6370989.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Rollback artifact retained: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`

## Learn public integration - local release candidate

- Added `/learn`, `/learn/free`, `/learn/diagnostic` and three static course detail
  routes under `/learn/courses/*`.
- Learn source remains ready behind `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=true`.
- Until its PWA is ready, navigation exposes four verified destinations: Câu chuyện,
  Thư viện, Chẩn đoán and Conan Maker. Tài sản remains available in the footer.
- Public Learn inherits Unified Cinema while using the approved original Cat World
  assets as product objects; it does not copy the learner app shell into a sales page.
- AI Foundation is truthfully free. Prompt Thinking and Evaluate & Verify are shown
  as locked paid courses that are not purchasable until content and offers exist.
- The placement flow has eight one-screen work challenges, anonymous session resume,
  deterministic scoring, confidence and a parameterized handoff to the learner app.
- Development handoff resolves to `http://127.0.0.1:5174`; production static builds
  resolve to `https://learn.thongphan.com` or an explicit
  `NEXT_PUBLIC_LEARN_APP_URL`.
- Browser QA passed at `1440x900`, `390x844` and `320x568`: no horizontal overflow,
  no broken eager image, all heroes reveal the next section, mobile menu exposes
  Học as item 03, and the complete 8/8 diagnostic returns 90% confidence.
- Local evidence: `docs/qa/screenshots/learn-*.png`.

### Learn verification

- `npm test`: 238/238 passed on the current branch-wide suite.
- `npx tsc --noEmit`: passed.
- Both enabled and disabled `npm run build` artifacts generate 82/82 static pages;
  runtime exposure is verified separately by the six-pair Wrangler matrix.
- `npm audit --omit=dev`: zero production vulnerability after upgrading Next to
  16.2.10 and overriding PostCSS to 8.5.10.
- Production paths are intentionally fail-closed because `learn.thongphan.com` and
  its Cloudflare resources have not passed an explicit release decision.

## Verification evidence

- Functional contracts: `84/84` passed.
- TypeScript: `npx tsc --noEmit` passed.
- Static export: `54/54` pages generated.
- Release contracts: homepage `4/4`, SEO `3/3`, bundle/image budgets `2/2` passed.
- Browser QA: 48 responsive preview checks at `1440×900`, `1280×800`, `834×1194`, and `320×568`; 16 production route-family checks at `1490×1060`; five production mobile checks at `390×844`; no horizontal overflow, broken images, or relevant console warnings/errors.
- Interactions: mobile menu focus/Escape/restore, evidence dialog focus/Escape/restore, five-question diagnostic, URL-backed library search/filter, reader bookmark, source disclosure, chat fallback, custom 404, Conan Maker, and Crown & Citadel all passed.
- Homepage: hero overlap is resolved at desktop and `1280×720`; ACT 03 is `888.8px` high and fits inside a `1060px` desktop viewport.
- Production HTML SHA-256: `63411f0c1b29e8c84a153905f5f7a87d88879b8f9cae50597c3808fb544040df`.
- Crown & Citadel `out/game/index.html` remains unchanged at `4f5b2fe76da3cb642f46c0897b03c5fd5d51f32a8a5ef6df2f647444f1c63032`.

## Read migration

- The active `thong-phan-read` plugin is version `0.1.0+codex.20260711000000`; source/cache manifests match and 6/6 plugin contracts pass.
- A fresh Codex invocation generated the canonical `https://thongphan.com/library/read/fresh-invocation-example` and main-repo package target.
- Worker `thongphan-read` was deleted after production smoke. Three direct checks now return HTTP `530`; the old content is gone and no `301/302` exists.
- Source data remains under `/Users/rio/Projects/thongphan-read` as migration provenance.

## Accepted boundary

The homepage reel now uses six unique approved local derivatives with verified
source hashes, rights status, captions and focal points. It animates only when the
release manifest satisfies that complete contract; otherwise the truthful static
fallback remains in place. No historical evidence was fabricated.
