# Task 4 implementer report — safe batch Bunny publishing

## Verdict

PASS for Task 4 — implementation commits:

- `405319424c59e9fa48aa56c146dca579ba01af5f` — initial implementation;
- `b0485f00291629257914a3d14ec98354b2525cec` — review-round safety fixes.

## Scope delivered

- Strict manifest v1 validator: unknown root/item keys, maximum 100 videos,
  duplicate slugs, absolute non-empty regular non-symlink `.mp4` files, HTTPS
  base URLs, complete M0 metadata and integer focal percentages. Missing focal
  values are normalized to `50/24` before any upload can start.
- Sequential batch executor reuses `runVidUpload`, so the existing content-hash
  idempotency and TUS resume store remain the sole per-video delivery path.
  It performs no batch-level retry, continues independent runtime failures, and
  returns `{ published, uploaded, failed }` with secret-safe reasons.
- Semantics: `published` means media reached ready and the publish endpoint
  completed; `uploaded` means TUS transfer completed with `publish: false`;
  `dry-run` is deliberately neither because it transfers no media.
- CLI supports an absolute JSON `--manifest`, rejects every explicit
  single-video flag when mixed with it, supports global `--dry-run`, prints the
  structured summary, and returns non-zero if the summary has failures.
- Added `vid:upload-batch` command.
- The canonical batch invocation is now
  `npm run vid:upload-batch -- /absolute/path/manifest.json --dry-run`; the
  package script has no incomplete hardcoded `--manifest` argument. The
  non-canonical package `--manifest` form fails with direct guidance.
- Manifest signing origin is exactly `https://vid.thongphan.com`; arbitrary
  HTTPS origins, paths, queries, fragments and credentials are rejected before
  any secret or network dependency can run.
- Whole-manifest preflight records each source device/inode/size/mtime. At use,
  one video at a time is opened with `O_RDONLY | O_NOFOLLOW`, checked against
  that identity, copied from the bound descriptor into a process-private 0700
  directory and 0600 file, rechecked, made read-only, then cleaned in `finally`.
  A pre-open replacement fails closed; a post-open path swap cannot redirect
  the descriptor bytes. Dry-run performs no staging.
- Custom focal metadata now reaches the new Worker draft/catalog path. A legacy
  Worker compatibility retry is allowed only for the exact 50/24 defaults and
  emits an explicit safe log; custom focal values such as 17/83 fail before TUS
  when the Worker has not yet been upgraded, so they are never silently lost.

## RED evidence

`node --import tsx --test scripts/vid-upload-batch.test.ts` initially failed
with `Cannot find module '../lib/vid/upload-manifest'`, before either Task 4
production module existed. The later explicit metadata-conflict regression
initially failed because `--rights-status` was accepted with `--manifest`.

Review-round RED additionally proved five missing boundaries: arbitrary
manifest origins reached upload; source paths were passed directly rather than
staged; a pre-open symlink swap reached the upload double; staged paths were not
sequentially isolated/cleaned; and the hardcoded package `--manifest` form
produced an ambiguous parser error. Focal tests then failed because 17/83 were
stripped, the default-only legacy fallback did not exist, and custom focal
metadata could be silently lost against an older Worker.

## GREEN evidence

| Command | Result |
| --- | --- |
| `node --import tsx --test scripts/vid-upload.test.ts scripts/vid-upload-batch.test.ts scripts/vid-worker.test.ts` | PASS, 34/34 |
| `npm run vid:upload-batch -- /private/tmp/vid-manifest-fixture.json --dry-run` | PASS, output `{"published":[],"uploaded":[],"failed":[]}`; two items validated with zero staging/network/secret work |
| `npx tsc --noEmit` | PASS |
| `npm run typecheck:vid-worker` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS, 88/88 static pages |
| `npm run test:secret-integrity` | PASS |
| `npm test` | PARTIAL, canonical command includes and passes all 16 Task 4 batch tests; total 537/543 pass. Five unrelated environment failures are sandbox-denied Chromium Mach port / Wrangler localhost binds, and one pre-existing Task 6 release-gate source contract still expects `/320/`. |

## Protected concurrent changes

The previously protected focal compatibility hunks were first preserved and
committed independently as `4dd0b4d`. Only after the parent explicitly reopened
those files were they changed in the review fix, with tests for both legacy
default compatibility and new-Worker 17/83 preservation. No live Bunny request,
deployment, or other network mutation was made.
