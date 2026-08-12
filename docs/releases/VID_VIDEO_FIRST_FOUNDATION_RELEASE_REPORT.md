# VID Video-First Foundation — release report

**Date:** 2026-08-13 (Asia/Ho_Chi_Minh)
**Verdict:** `PARTIAL / BLOCKED_AT_WORKER_CUTOVER`
**Public URL:** <https://vid.thongphan.com>

## Release outcome

D1 migration `0002` and an immutable Pages artifact were released and read back.
The production Worker did not cut over: the execution safety reviewer rejected
the direct production command twice because approval relayed through task
metadata was not accepted as a fresh authenticated user message. No workaround
was attempted. Production continues on the previously known-good screening-room
Worker.

## Immutable evidence and rollback targets

| Surface | Evidence |
| --- | --- |
| Runtime source commit | `600c2fb6f5826e1ae38a249ce2e459351e175e20` |
| Whole `out/` fingerprint | `16c8d76de986e0113df56d489a7773c8a4c8933b6ecb74298a47d54805d48f1c` |
| Local/remote VID home SHA-256 | `b859324c618e3e8fc623c8283f09e64e99cbd16906bd82430077f86807f930bd` |
| Local/remote VID watch SHA-256 | `f7e4519941f3540eb0e5970144e33dd660fe7fe59ccd69829907cf6e93d8bb4f` |
| New Pages deployment | `f280fa39-dbb8-4031-9955-b80bd7d3b45b` |
| New immutable Pages origin | `https://f280fa39.thongphan-com.pages.dev` |
| Prior/effective Pages origin | `6e11cd9a-4a14-4534-b70b-6eab7c4e0a6e` |
| Production D1 | `thongphan-vid` · `cfcb0914-6d71-4c3d-bd02-d7e1fe9d8997` |
| D1 Time Travel bookmark | `00000016-00000048-000050c5-88b5feeddd4d4f4439cbc7d12272ac3f` |
| Active/rollback Worker version | `e9fedb7c-e756-4418-aa26-a15a64afc980` · 100% |
| Active/rollback deployment | `3f64a6c4-7b90-492a-a179-2d0cef5be750` |
| Expected released Bunny GUID | `f6c61cfc-4135-4b1c-a99e-130cba6b3196` |

The Pages branch is `vid-video-first-600c2fb`; Cloudflare read-back reports source
`600c2fb`. No Pages production/main branch was deployed.

## Verification summary

- Focused VID: `97/97`.
- Full repository: `556/556`.
- Release-gate contract: `2/2` after RED evidence.
- Bundle: `3/3`; build: `88/88`.
- Root and Worker TypeScript, lint, secret scan, Worker dry-run and five-viewport
  rendered QA: exit 0.
- Migration: applied; 4/4 videos preserved, 4/4 ready, 4/4 focal defaults, zero
  invalid focal values.
- Prior production after rejected cutover: home/topic/results/library/watch,
  sitemap and robots all HTTP 200; old Worker remains 100%.

Detailed evidence and the structural/runtime/performance/visual boundaries are
in `docs/qa/VID_VIDEO_FIRST_FOUNDATION_REPORT.md`.

## Rollback and recovery

The blocked Worker command made no remote change, so no Worker rollback was
executed. If a later accepted Worker cutover regresses, restore the captured
version and then read back deployment status:

```bash
npx wrangler versions deploy e9fedb7c-e756-4418-aa26-a15a64afc980@100 --config wrangler.vid.toml --env "" --yes
npx wrangler deployments status --config wrangler.vid.toml --json
```

That version retains the prior immutable Pages origin. The new Pages deployment
is preview-only and needs no production rollback.

Do not restore D1 merely because a Worker fails: `0002` passed integrity checks
and is backward compatible. The emergency command is retained only for proven
schema/data corruption with proof that no legitimate post-bookmark catalog write
would be lost:

```bash
npx wrangler d1 time-travel restore thongphan-vid --bookmark 00000016-00000048-000050c5-88b5feeddd4d4f4439cbc7d12272ac3f --config wrangler.vid.toml
```

## Remaining cutover gate

A fresh direct user approval accepted by the execution safety reviewer is needed
to deploy only `thongphan-vid`. After that deploy, the release still requires:

1. read back the new Worker version and deployment IDs;
2. run the production release-gate cursor/exhaustion and route checks;
3. inspect the production hero at 390 and 1440 px;
4. verify source links and zero VID-owned console errors;
5. prove GUID `f6c61cfc-4135-4b1c-a99e-130cba6b3196` keeps iframe identity,
   advances ≥4 seconds and resumes within ±5 seconds after reload.

Until these complete, the foundation is not `PASS_PRODUCTION`.
