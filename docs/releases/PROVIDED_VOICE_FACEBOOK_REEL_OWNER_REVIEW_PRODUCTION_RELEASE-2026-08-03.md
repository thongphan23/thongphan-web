# Provided-voice Facebook Reel Owner Review - Production Release

Date: 2026-08-03  
Status: `PRODUCTION_VERIFIED`  
Owner review URL: `https://thongphan.com/review/cua-ban-la-gi`

## Scope

Create a complete vertical video from the voice in Facebook Reel
`1021610327525093`, preserve the supplied audio as authoritative, select one
film capable of carrying the full emotional argument, render, verify and
publish an owner-review packet.

## Output

- Master: `1080x1920`, H.264/AAC, 30 fps, `88.213333` seconds.
- Master SHA-256:
  `3ca0371abe5a5f87811b7290e395a206fdae7af3c2cdf64dead8fb1f7f7d9070`.
- Web media: `720x1280`, H.264/AAC, `88.213` seconds, 14.59 MB.
- Web media SHA-256:
  `0c98901b5318783d11539ef9f6c031e2439f6922719c85ca507dceca2e7b2b58`.
- Film lock: `Coco`.
- Editorial structure: 26 shots, 13 unique source clips, zero overlapping trims.
- Captions: 45 segments, one line, maximum 30 characters, zero overlap.
- Generated camera motion: zero; every shot uses a reviewed static crop.

## Evidence Chain

The public-by-discovery review route exposes:

- `owner-review-packet.md`
- `final-video-qa.json`
- `production-shot-plan.json`
- `source-casting-board.json`
- `final-contact-sheet.jpg`

The local run retains the full workflow under:

`/Users/rio/Movies/thong-phan-remotion-runs/cua-ban-la-gi-facebook-reel-20260803`

The run includes approved transcript, word timeline, communication intent,
message architecture, narrative intent, viewer model, creative plan, source
research, source-casting alternatives, pacing design, shot plan, captions,
contact sheets and final QA.

## Verification

### Video

- Remotion TypeScript: `PASS`.
- Timeline continuity and source-duration parity: `PASS`.
- Duplicate or overlapping source trims: `0`.
- Black interval longer than 250 ms: `0`.
- Silence interval below -45 dB longer than 1.5 seconds: `0`.
- Integrated loudness: `-14.2 LUFS`.
- Fast-start atom order: `moov` before `mdat`.
- Silent pixel review and final contact sheet: `PASS`.

### Website

- Focused route/media tests: `2/2 PASS`.
- Full regression on the production-source branch: `251/251 PASS`.
- TypeScript: `PASS`.
- Focused ESLint: `PASS`.
- Next static build: `86 routes PASS`.
- Local Playwright desktop/mobile: page 200, video `readyState=4`, playback
  advances, no overflow and no console errors.
- Preview and production browser verification: the new route loads, metadata
  reports 88.213 seconds and playback advances on desktop and mobile.
- Production route recovery verification: prior Remotion review and `/voice`
  both return 200; protected `/tpr` retains its 401 boundary.

## Git And Deploy

- Branch: `agent/review-cua-ban-la-gi-prod-safe-20260803`.
- Implementation commit: `7dc5bb5e1ac29c388dee3e670f64462654b49594`.
- Preview deployment: `38f3853e`.
- Production deployment: `31755915`.
- Rollback deployment: `2620db95`.

An initial production upload from `origin/main` was immediately superseded
after smoke tests found that the active Remotion review and voice routes were
not present in that Git baseline. The final branch was therefore created from
the exact prior production-source branch `agent/voice-review-v7-20260802`, then
the new review commit was applied and the complete 86-route output was rebuilt.
Production smoke tests confirm the old routes and the new route coexist.

