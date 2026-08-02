# Remotion Full-Bleed Vertical Composition v3 Production Release

Date: 2026-08-02
Status: `PRODUCTION_LIVE_PENDING_OWNER_TASTE_REVIEW`

## Owner finding

Round 5 still contained shots that carried the original horizontal image into
the portrait output instead of cropping the voice-relevant region. This was a
real QA false-high: semantic observations could pass while the final pixel
composition remained visually horizontal.

## Root cause

1. The planner could widen a crop through `context_window` or
   `contain_context` to preserve source context.
2. The renderer supported a reduced horizontal evidence band over a blurred
   background.
3. Pixel QA measured carrier presence and scale but did not require the final
   source layer to fill the portrait canvas.
4. Generic saliency could stand in for a reviewed semantic carrier.
5. Independently rounded start and duration values could create a one-frame
   black gap between adjacent timeline items.

## Permanent repair

- `cover_static` is the only final-delivery frame mode.
- Context-window and contain rescue fail closed in planning and pixel QA.
- The renderer has one full-canvas `object-fit: cover` video layer.
- Moving carriers require stable portrait holds with reviewed observations, or
  source replacement when no valid portrait composition exists.
- Saliency is not semantic evidence without observation identity, provider,
  reviewer and content hash.
- Adjacent Remotion items share the same quantized frame boundary.

## Production evidence

| Film | Items | Encoded observations | Render SHA-256 |
|---|---:|---:|---|
| Soul | 28 | 84 | `ee4ae6dd6c7b545971a1f3b5b8a6b26b67321515d6004062b7656d375daadcec` |
| Forrest Gump | 31 | 93 | `96759550809c69df37c136b6deb828b077c3c3d76f2f6c2c0bec7fd092db2a81` |
| A Beautiful Mind | 33 | 99 | `a9cdbe2202a1f668d43b8df4ae40c6bef624e2d16e42a4951f1e3b8036e1fc6b` |

All 92 items are full-bleed static portrait compositions. All 276 encoded
START/MID/END observations pass carrier integrity, rendered scale, subtitle
overlap and locked-plan checks. No context-window framing, moving crop or frame
gap remains.

## Verification

- Plugin focused vertical suite: `36 passed`.
- Plugin full regression: `910 passed in 97.93s`.
- SQLite concurrent writer stress: `10/10` repeated runs passed.
- Plugin manifest and all 20 skills validate.
- Active plugin: `0.2.11-rc.1+codex.20260802043817`.
- Plugin implementation commit: `781ed07`.
- Plugin release commit: `ab89fee`.
- Website focused tests: `4/4`.
- Website full tests: `248/248`.
- TypeScript, ESLint and 84-route production build: passed.
- Browser QA: `2` viewports, `36` media combinations on local, preview and
  production environments.
- HTTP checks: review redirect `302`, canonical page `200`, three MP4 files
  `200 video/mp4`, evidence packet `200`, protected `/tpr` `401` with
  `private, no-store` and `noindex`.

## Release and rollback

- Review URL: `https://thongphan.com/review/remotion-muc-dich-doi-song`.
- Website implementation commit: `0331695`.
- Production deployment: `75057013`.
- Immutable deployment URL: `https://75057013.thongphan-com.pages.dev`.
- Rollback deployment: `b4ce9d16`.

Owner review of these exact published media hashes is still required before
the result can alter Taste weights.
