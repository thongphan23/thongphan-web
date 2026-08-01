# Remotion Camera Stability R4 - Production Release

Date: 2026-08-01

## Outcome

Round 4 removes synthetic camera pans from the three vertical owner-review
videos. The crop is now static by default. Camera movement is permitted only
when a reviewer approves a concrete editorial intent and every keyframe tracks
the same semantic carrier.

Owner review URL: `https://thongphan.com/review`

Detailed route:
`https://thongphan.com/review/remotion-muc-dich-doi-song`

## Reproduced Root Cause

Round 3 contained generated crop movement in 24 of 51 shots:

- 15 shots already passed semantic retention with one static crop;
- 9 shots contained detector identity switches or source sub-shot changes.

The previous pipeline sampled three moments, independently selected the largest
face or saliency region, and converted any center span above the threshold into
a multi-point crop path. Remotion then interpolated those positions on every
frame. QA checked focus retention and maximum step size, but did not prove that
the movement had an editorial purpose, followed one subject or started from a
valid composition. Detector noise therefore became an artificial pan.

## Permanent Repair

The plugin now applies these fail-closed rules:

1. Search densely for the best static crop first.
2. Select a passing static crop before any moving candidate.
3. Require reviewed `camera_motion_intent` for movement.
4. Require `same_carrier_crosses_frame` and one unchanged
   `semantic_carrier_id` across all mandatory focus atoms.
5. Treat saliency and face-detector variance as observation evidence, never as
   camera direction.
6. Ignore unreviewed crop paths in the Remotion renderer.
7. Fail Round 4 QA when generated camera travel is nonzero.
8. Inspect START, MID and END rendered pixels for every shot.

## Implementation Identity

- Plugin repository: `thongphan23/thong-phan-remotion`.
- Plugin branch: `agent/director-core-v2`.
- Plugin commit: `786dc52d113ed60a5e70b42f6b1adad4de7a2711`.
- Active plugin version: `0.2.10-rc.1+codex.20260801211939`.
- Website repository: `thongphan23/thongphan-web`.
- Website branch: `agent/remotion-visual-semantic-frame-v1-20260731`.
- Website implementation commit:
  `260a6799d574fcb9648a53d3f8b939f6ad0d0b69`.

## Round 4 Evidence

- Videos: `Soul`, `Forrest Gump`, `A Beautiful Mind`.
- Duration: 59.712 seconds each.
- Master format: 1080x1920.
- Web format: H.264/AAC, 720x1280, fast-start.
- Shot gate: 51/51.
- Generated moving crop: 0/51.
- START/MID/END manual camera-stability pass: 51/51.
- Minimum semantic-carrier retention: 82.63%.
- Mean semantic-carrier retention: 98.35%.
- Self-evaluation: 98.0/100.

Master SHA-256:

- `Soul`:
  `33f781f04490ee82814579e555293f16857187030c0bd77bba78526bd587b4ab`.
- `Forrest Gump`:
  `6fe09d50c4ca42aa500866c146ee6508e0d020618b51e1dc58adfb672d302cef`.
- `A Beautiful Mind`:
  `33206149fa9e244e4bb826aaa76e55f746f8e17ad0d9a359702569698edf903d`.

The three previously documented semantic/source-content risks remain separate:
one dark abstract `Soul` shot, one motion-blurred `Soul` firetruck midpoint and
one distant Forrest swimmer. They do not reintroduce synthetic crop motion.

## Verification

Plugin:

- vertical framing focused tests: 10/10 passed;
- feedback interpreter focused tests: 8/8 passed;
- adjacent narrative regression: 99/99 passed;
- full regression: 809/809 passed;
- active plugin installed and enabled;
- Remotion TypeScript: passed.

Website:

- focused review-page tests: 4/4 passed;
- full regression: 248/248 passed;
- focused ESLint: passed with zero warnings;
- TypeScript: passed;
- static production build: passed;
- media probe: 3/3 Round 4 videos are H.264 720x1280 and 59.712 seconds;
- local browser QA: 24/24 combinations across desktop/mobile;
- Cloudflare preview QA: 24/24 combinations across desktop/mobile;
- production browser QA: 24/24 combinations across desktop/mobile;
- playback advanced, no horizontal overflow and no console errors;
- `/review` redirects to the detailed route;
- `/tpr` returns HTTP 401.

## Deployment And Rollback

- Preview deployment: `8be98965-d38f-4d2f-b45d-5990976e36aa`.
- Preview URL: `https://8be98965.thongphan-com.pages.dev`.
- Production deployment: `f3346e78-a820-4e72-a789-165c83043800`.
- Production URL: `https://f3346e78.thongphan-com.pages.dev`.
- Canonical URL:
  `https://thongphan.com/review/remotion-muc-dich-doi-song`.
- Previous production/rollback deployment:
  `8282b418-c7cf-4daf-b657-bae2c1480c46`.
- Previous source: `6f1420e`.

Rollback is a complete redeploy of that prior Cloudflare Pages artifact, not a
partial replacement of HTML or media.

## Taste Evidence Boundary

The owner feedback and exact reproduced metrics are preserved in the published
evidence capsule. These legacy test variants use an older Edit Plan that lacks
the revision field required by the current feedback service, so no fake Taste
event was written. The interpreter contract is upgraded for subsequent standard
runs; verified promotion still requires exact run, round, film, shot/trim,
revision, graph hash and post-fix outcome binding.
