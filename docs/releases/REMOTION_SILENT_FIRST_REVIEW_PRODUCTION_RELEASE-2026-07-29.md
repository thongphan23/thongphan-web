# Remotion Silent-First Review — Production Release

**Date:** 2026-07-29  
**Review route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Publish three newly edited versions of the same 59.712-second Vietnamese voice
for owner comparison. This round implements the owner's silent-first rule:
film footage must communicate through visible action, reaction, emotion or
consequence even when the original film dialogue is inaudible.

- release branch: `agent/remotion-review-page-20260729`;
- source commit: `4c2f6432c144627e850f047cade539ae78514fe3`;
- preview deployment: `3708a0de-cbb2-429a-9ed5-3a6fa2cd5db6`;
- production deployment: `73e64feb-a789-431a-a6f4-af9a5fdb44b2`;
- previous production: `ec61e270-6915-4ac4-9439-88bbba30dedb` at source
  `4bcef1f257e77088c80bb6dca0c6a5794fd0cf23`.

The isolated worktree `/Users/rio/thongphan-com-remotion-review` was used. The
dirty canonical worktree `/Users/rio/thongphan-com` was not modified.

## Editorial changes

- **Soul:** removes the repeated stage motif, uses 25 distinct sources for 25
  shots and externalizes internal disconnection, recognition and release.
- **Walter Mitty:** follows a one-direction continuity chain from office to
  mountain stillness, journey and a final return that shows consequence. It
  uses 25 distinct sources for 25 shots.
- **Whiplash:** replaces dialogue-dependent exchanges with instruments,
  movement, collision, pressure, exhaustion and visible reaction. It uses 22
  distinct sources across 25 shots without non-contiguous source re-entry.
- All versions keep one-line subtitles inside the torn-paper strip and use the
  supplied voice plus background music. Film-source audio is fully muted.

The complete run evidence is stored at:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-silent-first-v2-20260729`

Its final handoff manifest contains 51 artifacts and passes fresh verification.

## Web media

All derivatives are H.264/AAC, 1280x720, 30 fps, 59.712 seconds and have the
MP4 `moov` atom before `mdat` for progressive playback.

| Variant | Bytes | SHA-256 |
| --- | ---: | --- |
| Soul | 13,573,332 | `650115b442ca1fdbe79e64ac72b35221da4d4e9d880efd903058a7ed5b964dfe` |
| Walter Mitty | 17,115,262 | `98dcd356fc74b303a652be53a9ce135355297e93d41cc7f5c7210f399d6e38f2` |
| Whiplash | 11,222,653 | `1d6f3c5f7df68dfa845c96c6bd6174ecd9200dec8506969bdb3c8ea3fa592985` |

## Verification

### Video and evidence QA

- 1920x1080 masters, H.264, 30 fps and 59.712 seconds: pass.
- One final audio stream at -15 LUFS: pass.
- Internal black frame of 300 ms or longer: none.
- Freeze of 2.5 seconds or longer: none.
- 25 shots per version: pass.
- Exact trim reuse and non-contiguous source re-entry: zero.
- One-line subtitle and torn-paper containment: pass.
- Silent-preview audio streams: zero.
- Final handoff manifest: 51/51 artifacts verified.

### Repository QA

- Focused review-page contract: 3/3 passed.
- Adjacent route/chrome regression: 17/17 passed.
- Full repository suite: 242/242 passed.
- ESLint: passed.
- TypeScript: passed.
- Static export: passed with 83 routes.
- `git diff --check`: passed.

### Production QA

Playwright verified the apex route at 1440x1000 and 390x844:

- all three tabs select the expected media source;
- all three videos report 59.712 seconds and playback advances;
- horizontal overflow is zero;
- console and page errors are zero;
- page-level robots metadata is `noindex, nofollow, nocache`;
- desktop and mobile screenshots show no incoherent overlap.

The immutable origin, apex and `www` route return HTTP 200 with the new
`SILENT-FIRST V2` marker. All three immutable-origin MP4 paths return HTTP 200
with `content-type: video/mp4`.

## Rollback

Redeploy complete production deployment
`ec61e270-6915-4ac4-9439-88bbba30dedb` at source `4bcef1f`. Do not roll back
only the HTML while leaving mismatched review media. No Worker, KV, D1,
migration, custom domain or public navigation changed in this release.
