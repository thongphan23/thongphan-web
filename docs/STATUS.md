# thongphan.com — Unified Cinema status

Last updated: 2026-07-11

## Current phase

**Production released and verified.** Unified Cinema is live across the in-scope site, the integrated library is canonical at `/library`, and the old `read.thongphan.com` Worker has been retired without a redirect.

## Production release

- Source commit: `17b82c3`
- Preview: `https://a34fada0.thongphan-com.pages.dev`
- Production deployment: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`
- Production origin: `https://802dbe32.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Rollback artifact retained: `cde8137c-c82d-4f36-9f67-d849da739902`

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
