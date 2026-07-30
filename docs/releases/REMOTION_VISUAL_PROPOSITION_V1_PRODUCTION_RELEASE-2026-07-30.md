# Remotion Visual Proposition v1 — Production Release

**Date:** 2026-07-30  
**Review route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Publish three new versions of the authoritative 59.652-second Vietnamese voice after adding an evidence-backed Visual Proposition Graph between voice meaning and the locked edit plan.

- branch: `agent/remotion-visual-proposition-review-20260730`;
- video implementation commit: `dfd33081c50672b0f3505342e520334038bf506f`;
- current-production integration commit: `de6d903b4ef2000c13953c707a81e416000b0226`;
- final production deployment: `e8f8731d-a019-40cc-99a9-9081184928f5`;
- rollback deployment: `062db5b2-6fe0-41a0-ae5d-88ed74615f55` at source `9e7e4bc`.

An intermediate deployment `d862e2c2-b940-4c72-83d1-3f89e5599cd4` used the older review baseline. It was immediately superseded before owner handoff after the production-baseline check found that it did not contain the latest protected TPR Control Room. The final deployment merges the review work with source `9e7e4bc`; `/tpr` remains protected and its focused tests pass.

## Editorial variants

- **About Time:** 16 unique shots. Meaning is carried by presence, ordinary life, work and visible consequences for family.
- **Click:** 16 unique shots. Uses the strongest contrast between external achievement, conflict, missed family life and aftermath.
- **Up in the Air:** 16 unique shots. Uses airport and office life for viewer familiarity, with one neutral family anchor and 15 film shots.

Each of the eight claims has three candidate visual propositions. A selected proposition must pass semantic match and immediate silent comprehension before Taste can make a bounded ranking adjustment. Mood-only footage cannot carry the claim. Causal claims require a sequence rather than a single symbolic shot.

## Pacing and media contract

- calm and reflective sections use four-to-six-second shots;
- the pressure section at `38.58-49.96` seconds uses five shorter shots;
- the final consequence section slows to two longer shots;
- source-film audio is muted;
- the supplied voice and the low music bed remain authoritative;
- 28 word-locked Vietnamese subtitle segments each occupy one line;
- no source SHA repeats inside a variant;
- no selected item extends beyond its source trim.

## Evidence packet

The run source of truth is:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-visual-proposition-v1-20260730`

The review route publishes a bounded evidence packet under:

`/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json`

It exposes the approved transcript, claim timeline, source gate, visual observations, all candidates, selected and rejected decisions, sealed proposition graphs, locked edit plans, render QA receipts and owner-review notes.

## Web media

All web derivatives are H.264/AAC, 1280x720, 59.712 seconds, below the Cloudflare Pages 25 MiB limit and place the `moov` atom at byte 36 for progressive playback.

| Variant | SHA-256 |
| --- | --- |
| About Time | `de0aa81a6d002f4484d3e33b45a847669c357a81473fa42738b1419933b82685` |
| Click | `aacfd1260ba5394ba8e6cbc87187cbbd8ddc909ace25426ddfff99f61fc85867` |
| Up in the Air | `81cef20a05b2ec672bd5bc08fce6e3878f406671ef5d2a106f488b42506e04dc` |

The local masters remain 1920x1080 at 30fps. Their render QA reports H.264/AAC, 59.712 seconds, mean volume `-17.8 dB`, peak `-4.9 dB`, no black interval of 250ms or longer and 16 unique sources per variant.

## Verification

- visual-selection and render QA gate: passed for all three variants;
- focused review-page contract: 4/4 passed;
- protected TPR focused regression: 7/7 passed;
- full website suite: 248/248 passed;
- TypeScript and scoped ESLint: passed;
- static production build: 84/84 routes;
- local browser QA at 1440x1000 and 390x844: all three sources load, report 59.712 seconds and advance playback; zero overflow and zero console errors;
- production browser QA repeats the same matrix on `thongphan.com` with all checks passing;
- apex review HTML contains `VISUAL PROPOSITION V1`, `noindex` and the current heading;
- all three apex MP4 routes return HTTP 200 with `video/mp4`;
- `/tpr` still returns the dedicated protected login boundary with HTTP 401, private no-store and `x-robots-tag: noindex`.

## Rollback

Redeploy complete production deployment `062db5b2-6fe0-41a0-ae5d-88ed74615f55`. Do not roll back only HTML while leaving mismatched media. No TPR Worker, KV, D1, migration, secret, custom-domain route or public navigation was changed in this release.
