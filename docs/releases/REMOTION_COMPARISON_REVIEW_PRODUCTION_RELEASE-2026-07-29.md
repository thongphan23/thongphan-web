# Remotion Comparison Review — Production Release

**Date:** 2026-07-29  
**Public route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Publish one owner-review surface for three final Remotion variants without
releasing unrelated Thongphan Read work. The isolated branch started from the
exact production source rather than current `main`:

- previous production source: `12880bc9f4ca7fdb2fa0e0397693118cfaa2862e`;
- release branch: `agent/remotion-review-page-20260729`;
- release source: `4bcef1f257e77088c80bb6dca0c6a5794fd0cf23`;
- previous production deployment: `350ecbc7-9eec-4661-8451-2b129577b97c`.

The canonical dirty worktree at `/Users/rio/thongphan-com` was not modified,
cleaned, stashed, reset or used for deployment.

## Delivery design

- One active `<video>` element prevents three clips from competing for
  bandwidth.
- Native controls, `playsInline`, `preload="metadata"`, posters and stable 16:9
  geometry work on desktop and mobile.
- Web derivatives use H.264/AAC, 1280x720, 30 fps, `faststart`, two-second
  keyframes and a 59.712-second duration.
- Cloudflare Pages limits each site asset to 25 MiB. Each derivative is below
  14 MiB. Pages currently returns HTTP 200 rather than spec-compliant 206 for
  Range requests, so the short derivatives and one-player loading policy are
  deliberate mitigations. Authority:
  `https://developers.cloudflare.com/pages/platform/limits/` and
  `https://developers.cloudflare.com/pages/configuration/serving-pages/`.

| Variant | Bytes | SHA-256 |
| --- | ---: | --- |
| Soul | 13,555,498 | `aaa7a015686370ff1d80072d8fc6fb71cb169755a0c9b79514dfd9e3188cf04a` |
| Walter Mitty | 13,770,458 | `db28fcc22021845e1cc0761ba47db91a59fb5bac00ec75142537e48f316efa42` |
| Whiplash | 14,425,277 | `fc49e39aaf6dfd57ec9421f1fe6b10814cb46b56c8e92bce957d87aab9e16463` |

The 1080p masters remain in the Remotion run store and were not replaced.

## Verification

### Automated

- Focused review-page contract: 3/3 passed.
- Adjacent site-route and chrome contract: 15/15 passed.
- Full repository suite: 242/242 passed.
- Full ESLint: passed with zero warnings.
- TypeScript: passed.
- Static export: passed, 83 generated routes including the review route.
- `git diff --check`: passed before the source commit.

### Browser

Playwright CLI verified the local Pages-compatible server, immutable preview and
production apex at 1440x1000 and 390x844:

- three tabs fit without overflow;
- switching changes the actual media source;
- all three media elements reach `readyState=4` and report 59.712 seconds;
- playback advances `currentTime` on every variant;
- production Whiplash reports 1280x720 and advances to 1.56 seconds;
- zero console errors; remaining warnings are pre-existing Next preload warnings.

### Network and parity

- Preview: `4302784c-f655-43cb-8383-220fcfa10c61`.
- Production: `ec61e270-6915-4ac4-9439-88bbba30dedb`.
- Production source: `4bcef1f`.
- Origin, apex and `www` review HTML SHA-256:
  `79bb4b9175c9f8fea8bbdd1a9898c29532643d64ff017eaffada6e61e3218cf5`.
- Route response includes both `x-robots-tag: noindex` and the page-level robots
  meta element.
- Soul, Walter Mitty and Whiplash MP4 paths all return HTTP 200 and
  `content-type: video/mp4` on the apex. Whiplash returned one transient 404
  immediately after promotion, then passed on origin, apex and `www` after
  propagation using a cache-busted probe.

## Rollback

Redeploy the complete previous production deployment `350ecbc7` / source
`12880bc`. Do not remove only the review HTML while leaving unmatched media
assets. The review route is additive and `noindex`; no Worker, D1, KV, custom
domain, migration or active application feature changed.
