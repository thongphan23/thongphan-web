# Remotion Single-film Continuity v1 — Production Release

**Date:** 2026-07-31  
**Review route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Replace the mixed-film experimental variants with three new versions of the
same authoritative 59.712-second Vietnamese voice. Each version locks one film
before shot selection and may use only scenes observed from that film.

- Plugin branch: `agent/director-core-v2`;
- plugin source commit: `37b8aef92471a755c292c6600e142e8558c6c8cc`;
- active plugin cache: `0.2.6-rc.1+codex.20260731075919`;
- plugin package SHA-256:
  `c3f7431d7c0eed7c5098b77421055d72aab7953c553d9319255c5dce0efe3046`;
- website branch: `agent/remotion-visual-semantic-frame-v1-20260731`;
- website media commit: `7d14b7469166c9d9ecbf87b2fe9a751831e96324`;
- website URL-version fix: `e02c28bba21b04d7c6384fc448dac512a93003bd`;
- production deployment: `17cec07a-736a-4d4b-ae4c-e3b0fe2faf31`;
- rollback deployment: `e3d341de-c2e6-437d-853c-643d5a0d2113`.

No public navigation, TPR Worker, KV, D1, secret, custom-domain route or content
outside the bounded review route changed.

## Root Cause And Contract

The Film Source Model selected one whole-video anchor, but the experimental
claim selector could still take a higher-scoring scene from another film. The
old reuse validator checked source files and trim bounds, not film identity.

The additive v2.8 contract now enforces:

1. exactly one canonical `film_id` is locked per variant;
2. every selected shot must match that identity;
3. missing, unknown, mixed and foreign identities fail closed;
4. a film that cannot cover a mandatory claim is rejected as a whole;
5. candidate treatments may change only inside the locked film.

## Three Variants

| Variant | Locked film | Selected shots | Foreign | Missing | QA |
|---|---|---:|---:|---:|---|
| Soul | `FILM-SOUL` | 19 | 0 | 0 | PASS |
| Click | `FILM-CLICK` | 16 | 0 | 0 | PASS |
| Forrest Gump | `FILM-FORREST-GUMP` | 14 | 0 | 0 | PASS |

No source file repeats inside one video. Film dialogue remains muted; the
provided voice is authoritative, subtitles are word-locked and music remains
controlled across all three versions.

## Media Integrity

| Variant | Master SHA-256 | Web SHA-256 |
|---|---|---|
| Soul | `727e1998ee0857e6d508c117cc2066693bd2232ba8c449571a631432fbf83711` | `ebd249c6690d6abcc4c85572eba5facc51baf71046622482a804bc64dcdb1632` |
| Click | `8d099b6faf1b3accf72ba384760fd159e1018020461eba522eff3a9f3d064e76` | `3d1f1de3c2379b999c0618e0bcb6afb4a1dd60a665131b29d4b5a19b270a606c` |
| Forrest Gump | `c57b80eb32a91060c34fcbaea397d2551cbf19eb0d0df6e6ec572501512a1a6a` | `8c91cedb26aec8640228a5172eda1663be57011f53664ba6d69b48583a23ec4c` |

All masters are 1920x1080 H.264/AAC at 30 fps and 59.712 seconds. Render QA
reports approximately -15.1 LUFS and -5.4 dBFS true peak, no black interval
over 250 ms, no freeze over three seconds and no source-duration extension.

## Evidence And Verification

Local source of truth:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-single-film-v2-20260731`

Published evidence index:

`/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json?v=single-film-v2-20260731`

- plugin focused TDD and full regression: 849/849 passed;
- plugin source/cache checksum parity: passed;
- three single-film continuity reports: passed;
- focused review-page contract: 4/4 passed;
- full website suite: 248/248 passed;
- TypeScript, ESLint and static 84-route build: passed;
- local and production browser QA at 1440x1000 and 390x844: all variants load,
  report 59.712 seconds and advance playback; zero horizontal overflow and zero
  console errors;
- all three versioned production MP4 routes: HTTP 200 `video/mp4`;
- versioned evidence index: HTTP 200 `application/json`;
- `/tpr`: HTTP 401 with `private, no-store` and `x-robots-tag: noindex`.

## Rollback

Redeploy complete production deployment
`e3d341de-c2e6-437d-853c-643d5a0d2113`. Do not roll back the HTML without its
matching media and evidence packet.
