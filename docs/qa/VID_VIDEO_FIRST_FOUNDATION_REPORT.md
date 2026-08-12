# VID Video-First Foundation — QA report

**Date:** 2026-08-13 (Asia/Ho_Chi_Minh)
**Source commit:** `600c2fb6f5826e1ae38a249ce2e459351e175e20`
**Verdict:** `PARTIAL / BLOCKED_AT_WORKER_CUTOVER`

The foundation is structurally and locally verified. D1 migration and the new
immutable Pages artifact are live, but the new Worker was not allowed to take
production traffic. Therefore this report does not convert local protocol QA or
the prior screening-room runtime into a claim that the foundation is live.

## Structural verification

| Check | Fresh result |
| --- | --- |
| Release-gate TDD | RED `1/2`, then GREEN `2/2` |
| Focused VID suite | `97/97` pass |
| Canonical full suite | `556/556` pass; zero fail/cancel/skip/todo |
| Root TypeScript | exit 0 with `--incremental false` |
| VID Worker TypeScript | exit 0 |
| ESLint | exit 0, `--max-warnings=0` |
| Next.js build | `88/88` static pages |
| Bundle budget | `3/3` pass |
| Current-tree/local-env secret scan | exit 0, zero reported findings |
| Worker dry-run | exit 0; 38.34 KiB raw / 10.07 KiB gzip; D1 and new Pages origin resolved |
| Composite release gate | `VID_RELEASE_LOCAL=PASS_LOCAL`; external remained not verified |

The gate explicitly requires migration/focal contracts, stable cursor ordering,
the reusable infinite feed, sequential batch upload, stable Player.js lifecycle,
secret scan, Worker dry-run and a post-cutover production mode. The stale 320 px
assertion was replaced by the intended Task 1 thresholds: 390, 768, 1024, 1280
and 1440 px. Production cursor verification is bounded at 48 one-item slices,
requires no duplicate slug, proves the first three slices when the catalog is
large enough, and always continues until `hasMore=false`.

## Migration and data integrity

- Pre-apply aggregate: 4 videos; 4 `published/ready`; latest update unchanged at
  `2026-08-12T22:05:00+07:00`.
- `0002_vid_presentation.sql` applied successfully to `thongphan-vid`.
- Postflight ledger: no migration remains to apply.
- `thumbnail_focal_x INTEGER NOT NULL DEFAULT 50` and
  `thumbnail_focal_y INTEGER NOT NULL DEFAULT 24` exist.
- Postflight aggregate: 4 videos preserved; 4 `published/ready`; 4 rows backfilled
  to `50/24`; zero out-of-range focal values.
- Time Travel bookmark:
  `00000016-00000048-000050c5-88b5feeddd4d4f4439cbc7d12272ac3f`.

## Rendered local QA and visual judgment

`npm run qa:vid` returned `VID_VISUAL_QA=PASS`. The long Vietnamese title
“Kỹ thuật prompting Claude để hiểu đúng vấn đề và hành động có hệ thống” was
rendered at 1440×900, 1280×720, 1024×768, 768×1024 and 390×844. Automated
geometry found no clipped glyph range, heading/CTA collision, horizontal
overflow, broken image, undersized visible control or VID-owned console error.

The five full-page screenshots were also inspected visually. The hero copy is
complete, the face remains visible and the CTA remains distinct across the five
layouts. Desktop/tablet keep the editorial split; 768/390 stack media above
copy. No blocking visual defect was observed. This is a release-specific visual
judgment, not a claim that machine geometry proves taste.

## Runtime playback boundary

Local browser QA loaded official Bunny-hosted Player.js and used its real iframe
`postMessage` protocol. It proved stable iframe identity through `Xem sau`, one
initial seek, stable listener count, provider time advancement beyond four
seconds, exact final checkpoints and reload resume behavior.

This remains protocol evidence. Real production playback for released GUID
`f6c61cfc-4135-4b1c-a99e-130cba6b3196` was not rerun against the new foundation
because the Worker cutover was blocked. D1 read-back confirms that GUID is a
published/ready catalog item, but catalog state alone is not playback evidence.

## Production health and performance observations

After both rejected Worker deploy attempts, the prior Worker version remained at
100% traffic. Read-only route probes returned HTTP 200 for home, topic, results,
library, watch, sitemap and robots. Single-request observed wall times were about
0.12–0.39 seconds and are health observations only; no controlled load test,
percentile latency or Core Web Vitals measurement was performed.

The current public API still returns the legacy page-shaped response. That is
positive proof that the new cursor Worker did not cut over, not a foundation
PASS. Three production cursor slices, long-scroll exhaustion, new 390/1440
production hero geometry, iframe identity, ≥4-second real playback and ±5-second
reload resume remain blocked together at the Worker cutover boundary.

## Limitations

- New Worker version/deployment IDs do not exist because the execution safety
  reviewer rejected the scoped production command twice.
- No Bunny upload or media mutation was required or performed.
- The new Pages artifact is an immutable preview and does not change apex main
  or Learn. It becomes the VID static origin only after the new Worker deploy.
