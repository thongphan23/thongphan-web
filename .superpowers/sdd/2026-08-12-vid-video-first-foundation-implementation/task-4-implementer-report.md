# Task 4 implementer report — safe batch Bunny publishing

## Verdict

PASS for Task 4 — implementation commits:

- `405319424c59e9fa48aa56c146dca579ba01af5f` — initial implementation;
- `b0485f00291629257914a3d14ec98354b2525cec` — review-round safety fixes;
- `253698ef875e33f4d617d94e71e1ccccd7da67fb` — review-round 2 direct-upload
  and staging-race fixes.
- `8bdad0c0d0eac8f84b8c675fdb6b57bacefdc07f` — review-round 3 free-space
  preflight fix.

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
- Manifest and direct single-upload signing origin is exactly
  `https://vid.thongphan.com`; arbitrary HTTPS origins, paths, queries,
  fragments and credentials are rejected before any secret or network
  dependency can run.
- Whole-manifest preflight records each source device/inode/size/mtime. At use,
  `runVidUpload` opens one video at a time with `O_RDONLY | O_NOFOLLOW`, checks
  it against that identity, and copies exactly the opened `fstat` size from the
  bound descriptor into a process-private 0700 directory and 0600 file. It
  rejects short, growing or identity-changing sources and verifies the staged
  size before any secret or network access. A pre-open replacement fails
  closed; a post-open path swap cannot redirect the descriptor bytes. Dry-run
  performs no staging, and batch no longer performs a redundant second stage.
- The explicit operator ceiling is 50 GiB per video. Manifest preflight and
  direct upload both reject larger files before opening a staging target, while
  the exact-byte copy bound prevents a growing or sparse oversized source from
  consuming unbounded temporary disk.
- Before the first source byte is copied, staging measures the filesystem of the
  actual newly-created private staging directory with `statfs`. It requires the
  descriptor-bound expected size plus a deterministic 512 MiB safety reserve
  for filesystem metadata and cleanup, rejects unsafe/inexact arithmetic, and
  fails closed with a sanitized operator-facing error if capacity is unavailable.
  The free-space reader is dependency-injected; its low-space regression proves
  zero source reads, secret reads, admin fetches and TUS calls.
- The content digest is computed during descriptor-bound staging and provides
  both the existing idempotency key and an explicit stable TUS resume
  fingerprint. The random temporary path therefore does not break
  `FileUrlStorage` resume identity.
- Secure stage cleanup is always attempted after runtime success or failure.
  Cleanup failure prevents a success result; a simultaneous upload and cleanup
  failure becomes the sanitized explicit reason
  `Secure video staging cleanup failed after upload failure`.
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

Review-round 2 RED isolated four direct-path gaps before implementation:
arbitrary direct origins reached the fetch dependency; a sparse file above the
operator ceiling was accepted; direct upload passed the original pathname to
TUS; and cleanup failure was ignored. A second RED proved the whole-manifest
preflight identity was not being carried to per-video use (`secretReads` became
1 after replacing the regular file), and a cleanup-reporting RED returned the
generic `Upload failed` instead of the sanitized combined cleanup failure.

Review-round 3 RED proved a valid sub-50-GiB source could proceed despite an
injected staging volume reporting only 2 KiB free: the test failed with `Missing
expected rejection.` before the preflight existed. The final regression supplies
the free-space function directly and asserts the sanitized rejection while all
copy, secret, admin-fetch and TUS counters remain zero.

## GREEN evidence

| Command | Result |
| --- | --- |
| `node --import tsx --test scripts/vid-upload.test.ts scripts/vid-upload-batch.test.ts scripts/vid-worker.test.ts` | PASS, 43/43 |
| `node --import tsx --test scripts/vid-upload.test.ts scripts/vid-upload-batch.test.ts` | PASS, final rerun 31/31 |
| `npm run vid:upload-batch -- /private/tmp/vid-task4-manifest.json --dry-run` | PASS, output `{"published":[],"uploaded":[],"failed":[]}`; two absolute `/private/tmp` items validated with zero staging/network/secret work |
| `npx tsc --noEmit --incremental false` | PASS |
| `npm run typecheck:vid-worker` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS, 88/88 static pages |
| `npm run test:secret-integrity` | PASS |
| `npm test` | PARTIAL, canonical command includes and passes all 18 Task 4 batch tests and all 13 direct upload tests; total 546/552 pass. Five unrelated environment failures are sandbox-denied Chromium Mach port / Wrangler localhost binds, and one Task 6 release-gate source contract still expects `/320/`; Task 6 owns that contract. |

## Protected concurrent changes

The previously protected focal compatibility hunks were first preserved and
committed independently as `4dd0b4d`. Only after the parent explicitly reopened
those files were they changed in the review fix, with tests for both legacy
default compatibility and new-Worker 17/83 preservation. No live Bunny request,
deployment, or other network mutation was made.

The round-2 commit contains only the five Task 4 code/test files. The generated
`tsconfig.tsbuildinfo` verification hunk was restored before commit. No live
Bunny request, deploy, or production mutation was performed.
