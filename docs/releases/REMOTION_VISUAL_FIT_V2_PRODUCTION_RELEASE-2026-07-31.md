# Remotion Visual Fit Calibration v2 Production Release

Date: 2026-07-31

## Release identity

- Website branch: `agent/remotion-visual-semantic-frame-v1-20260731`
- Website source commit: `94bf7ba`
- Cloudflare Pages deployment: `d8910edd`
- Deployment URL: `https://d8910edd.thongphan-com.pages.dev`
- Owner-review URL: `https://thongphan.com/review/remotion-muc-dich-doi-song`
- Production run: `/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-visual-fit-v2-20260731`
- Plugin implementation commit: `2bb2a03dc0717fbb2e826cf1fd372e365f5adc98`

## Product result

The same authoritative 59.652-second Vietnamese voice produced three horizontal,
single-film videos using `Soul`, `Forrest Gump` and `A Beautiful Mind`. Every
claim-film pair was evaluated through three silent rendered candidates before
selection, yielding 72 previews and 24 sealed competitive decisions.

The final edits contain 51 unique source files. No video repeats a source file,
no variant mixes films, and all three use the supplied voice, muted film audio,
the same subtle music bed and one-line word-locked subtitles.

## False-high correction

Pixel review rejected `15169-have-ever-been-on-a-real-shrimp-boat.mp4`. Its name
and inherited metadata implied shrimp-boat work, but its frames only showed a bus
conversation. The final Forrest Gump variant instead uses visible ping-pong
practice for outward goal-directed action and a separate shot of Forrest standing
still and attending to his son for present attention.

Evidence: `/review/remotion-muc-dich-doi-song/media/evidence/false-metadata-rejection.json`.

## Verification

- Remotion TypeScript: passed.
- Visual Fit batch: 24/24 decisions passed; three eligible competitors per claim.
- Render QA: three 1920x1080 H.264/AAC files, 59.712 seconds each.
- Audio: approximately -15.1 LUFS integrated, -5.4 dBFS true peak.
- Source reuse: zero repeated source files within all three variants.
- Black/freeze gates: passed.
- Subtitles: 28 word-locked segments, one line each.
- Website focused ESLint and `git diff --check`: passed.
- Next production build: 84/84 static pages generated.
- Local Playwright: desktop and `390x844` passed with zero console errors.
- Production Playwright: all three players reached `readyState=4`, advanced
  playback and reported `duration=59.712` at 1280x720.
- Production route and evidence files: HTTP 200.

## Owner evidence

- Workflow index: `/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index-visual-fit-v2.md`
- Voice-to-visual mapping: `/review/remotion-muc-dich-doi-song/media/evidence/voice-to-observable-visual-mapping-v2.md`
- Pixel review choices: `/review/remotion-muc-dich-doi-song/media/evidence/pixel-review-choices.json`
- Visual Fit batch report: `/review/remotion-muc-dich-doi-song/media/evidence/visual-fit-v2-batch-report.json`
- Render QA report: `/review/remotion-muc-dich-doi-song/media/evidence/render-qa-report-visual-fit-v2.json`

The release is ready for owner Taste feedback. No claim is made that owner fit is
calibrated yet; the graph correctly leaves owner-fit probability unavailable until
the owner reviews these exact outputs.
