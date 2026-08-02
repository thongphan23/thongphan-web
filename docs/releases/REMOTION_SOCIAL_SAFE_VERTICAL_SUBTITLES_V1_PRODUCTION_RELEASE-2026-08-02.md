# Remotion Social-Safe Vertical Subtitles v1 - Production Release

Date: 2026-08-02
Status: `PRODUCTION_QA_PASS_PENDING_OWNER_TASTE_REVIEW`

## Release

- Public review URL:
  `https://thongphan.com/review/remotion-muc-dich-doi-song`.
- Website branch: `agent/remotion-visual-semantic-frame-v1-20260731`.
- Implementation commit: `3a69754`.
- Preview deployment: `bd39b653-6e44-40cc-ab05-3470647a1d2c`.
- Production deployment: `65df0c98-81ae-4115-96a5-816769edd411`.
- Previous production rollback: `75057013-e504-42cf-ace0-324b9c10149a`.

## Change

Round 7 adds three new web videos and opens them by default. Their picture
selection, trim, carrier and crop are inherited from Round 6. Only subtitle
timing, line reflow, paper width and platform-safe placement changed.

The 1080x1920 master uses the intersection `x=120..900`, `y=270..1260`, with
the caption centered at `x=510`, `y=1180`. Every caption is one line on one
torn-paper slip. A caption-carrier conflict must be repaired through crop or
source selection, not by moving text into platform controls.

## Production evidence

- 3 masters at 1080x1920, H.264/AAC, 59.712 seconds.
- 90/90 encoded subtitle observations PASS.
- 270/270 TikTok, Instagram Reels and YouTube Shorts containment checks PASS.
- Apple Vision OCR minimum similarity: 1.00.
- 9 platform-overlay contact sheets.
- 3 web derivatives under 25 MiB with matching posters and faststart.

Master hashes:

- Soul: `93e9548ad79cef65876e65b8535a9820cd338dfdb3fcaf7fef63c7e6733682f5`.
- Forrest Gump: `642d23c0a6ec3ed4867006086eced9f1b84b9ed85452a1c03c974bd577f437ef`.
- A Beautiful Mind: `1d5f420eb93c2d9280ef84e1c4d3c01a892246617e4857bf62fca5cb6583246b`.

## Verification

- Review-page contracts: 4/4 passed.
- Website full suite: 248/248 passed.
- TypeScript, ESLint and production build: PASS.
- Local browser QA: 2 viewports, 42 media combinations PASS.
- Preview browser QA: 2 viewports, 42 media combinations PASS.
- Production browser QA: 2 viewports, 42 media combinations PASS.
- Production route returns HTTP 200, noindex metadata and all three Round 7
  videos advance during playback.

## Evidence paths

- `public/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-7/OWNER-REVIEW-PACKET.md`.
- `public/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-7/SELF-EVALUATION.md`.
- `public/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-7/encoded_caption_evidence.json`.
- `public/review/remotion-muc-dich-doi-song/media/evidence/vertical-framing-v1/round-7/<film>/platform-overlays/`.

## Taste boundary

No aesthetic Taste preference is promoted automatically. Owner feedback must
bind to Round 7, a film, subtitle ID, frame and exact master hash.
