# thongphan.com — Unified Cinema status

Last updated: 2026-07-12

## Current phase

**Production baseline remains released and verified.** Unified Cinema is live across
the in-scope site. The new public Learn slice and the first Cinema Chapters journey
slice are complete and verified locally but have not been deployed; the existing
production deployment remains unchanged.

## Cinema Chapters journey spine - local release candidate

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

### Cinema Chapters verification

- `npm test`: 103/103 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: 61/61 static pages generated.
- `npm run test:release`: 9/9 passed.
- Browser QA passed at `1440x900`, `390x844`, and `320x568`: one H1 per page,
  no horizontal overflow, correct canonical destinations, no relevant console errors,
  and reduced-motion transitions collapse to effectively zero duration.
- Browser DOM and interaction checks were run in the in-app Browser. Final visual
  screenshots used the local Playwright fallback because the in-app screenshot API
  returned the top of the document after a programmatic scroll.
- Local evidence: `/tmp/thongphan-cinema-chapters-qa/report.json` and
  `/tmp/thongphan-cinema-chapters-qa/*.png`.
- Production deployment remains intentionally pending.

## Production release

- Source commit: `17b82c3`
- Preview: `https://a34fada0.thongphan-com.pages.dev`
- Production deployment: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`
- Production origin: `https://802dbe32.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Rollback artifact retained: `cde8137c-c82d-4f36-9f67-d849da739902`

## Learn public integration - local release candidate

- Added `/learn`, `/learn/free`, `/learn/diagnostic` and three static course detail
  routes under `/learn/courses/*`.
- Universal navigation now has exactly five primary destinations: Câu chuyện,
  Thư viện, Học, Chẩn đoán and Conan Maker. Tài sản remains available in the footer.
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
- Production deployment is intentionally pending because `learn.thongphan.com` and
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
