# thongphan.com — Unified Cinema status

Last updated: 2026-07-12

## Current phase

**Origin Story + 21 ngày Brain2 is in isolated-worktree implementation.** The first
slice establishes public-repository release guardrails while the approved direction
adds a five-act personal origin story and consolidates only the legacy 21-day Brain2
challenge under `/brain2/21-ngay`. The private Brain2 vault, chat and standalone app
remain explicitly excluded. Motion Atmosphere remains complete and live.

## Origin Story + 21 ngày Brain2 — approved design and implementation audit — 2026-07-12

- Approved story arc: difference → success → collapse → rebuilding → system. The HSTL
  consequence may be stated plainly as more than VND 2 billion of debt and close to
  ten years of recovery, without pity or clickbait treatment.
- Homepage receives a compact origin bridge inside the existing proof chapter; `/about`
  carries the full five-act narrative and ends at the 21-day practice.
- Canonical challenge routes are `/brain2/21-ngay` and
  `/brain2/21-ngay/ngay-01` through `ngay-21`.
- Week 1 is public. Weeks 2–3 stay Conan Maker-only behind a server-validated access
  session. The public GitHub repo and static output may contain no protected lesson.
- Because the legacy subdomain has been public, retirement uses a permanent redirect
  only after canonical content, signup, access and production parity pass.
- The production audit found R2 disabled, a global router that rewrites cache headers,
  210 overdue legacy email rows and 25 content-bearing legacy Pages deployments. The
  approved implementation therefore uses a dedicated private KV namespace instead of
  R2 plus a more-specific access Worker, quarantines all old queue rows as `legacy-v0`
  so the new sender selects only `brain2-2026-v1`, and removes old immutable
  deployments only after the redirect-only replacement passes.
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

- `npm test`: 88/88 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: 60/60 static pages generated, including all Learn routes.
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

The homepage reel remains intentionally static because the release manifest has fewer than six approved, truthfully sourced reel frames. The three-proof contact sheet is the accepted safe fallback; no evidence was fabricated to force autoplay.
