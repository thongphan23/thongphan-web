# Remotion Film Source Model v2 — Production Release

**Date:** 2026-07-30  
**Review route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Publish three new versions of the authoritative 59.712-second Vietnamese voice
for owner comparison after upgrading film choice from an informal editorial
decision into a persistent, evidence-backed Film Source Model.

- release branch: `agent/remotion-review-page-20260729`;
- production source commit and deployment identity are recorded after publish;
- previous production deployment: `73e64feb-a789-431a-a6f4-af9a5fdb44b2` at
  source `4c2f6432c144627e850f047cade539ae78514fe3`.

The isolated worktree `/Users/rio/thongphan-com-remotion-review` was used. The
canonical worktree `/Users/rio/thongphan-com` was not modified.

## Model upgrade

The source decision now records and gates:

- viewer familiarity for Vietnamese urban office workers aged 25-35;
- semantic and emotional beat coverage;
- silent visual readability without film dialogue;
- narrative arc, character arc and consequence coverage;
- source-pool density and exact visual-observation references;
- selected and rejected film profiles;
- a minimum five-video distance before a film may be reused.

The persistent Film Source Vault keeps six historical films, three newly
selected films and three rejected candidates. The next run can query these
profiles instead of repeating the same research.

## Editorial variants

- **The Devil Wears Prada:** 24 unique shots. Closest to the viewer's work life;
  uses career acceleration, visible status and relationship cost on Andy's arc.
- **The Truman Show:** 21 unique shots. Uses imposed purpose, surveillance,
  realization, resistance and aftermath as one directional character arc.
- **Inside Out:** 23 unique shots. Externalizes memory, reward, pressure,
  imbalance, joy and sadness as visible objects and actions, closest to the
  conceptual clarity previously observed in `Soul`.

All variants use the supplied voice, the same low music bed and 28 one-line
Vietnamese subtitle segments. Source-film audio is muted.

## Evidence packet

The run source of truth is:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-film-source-model-v1-20260729`

The review route publishes a bounded evidence packet under:

`/review/remotion-muc-dich-doi-song/media/evidence/run-evidence-index.json`

It exposes voice/transcript, viewer and intent models, meaning beats, owner
feedback, candidate decisions, selected/rejected profiles, observation review,
casting boards, rhythm plans, locked edit plans and final QA receipts.

## Web media

All derivatives are H.264/AAC, 1280x720, 59.712 seconds, below the Cloudflare
Pages 25 MiB per-file limit and use `faststart` progressive playback.

| Variant | SHA-256 |
| --- | --- |
| The Devil Wears Prada | `2859c7c881731082c19c485609b6ae95565351a0cd7c73a92b4dd03f66307120` |
| The Truman Show | `acb767ceb392cdaf2d8e24cd63b03ef3b5177e7419a54cd7f42a4c708eb9d817` |
| Inside Out | `a6fb115eb707b5f027281bd233e50b8854cc9393e6a89a5005e5350bbbf5449b` |

## Verification

### System and video QA

- Film Source Model focused tests: 46/46 passed.
- Full plugin regression: 795/795 passed.
- Full Visual B-roll Engine regression: 75/75 passed.
- Remotion TypeScript: passed.
- Masters: 1920x1080 H.264/AAC, 59.712 seconds.
- Audio: -15.0 LUFS integrated, -5.2 dBFS true peak.
- Black segment of 0.3 seconds or longer: none.
- Freeze of 2.5 seconds or longer: none.
- Exact source reuse inside a variant: zero.
- One-line torn-paper subtitle containment: passed by frame review.

### Repository and production QA

- Focused review-page contract: 4/4 passed.
- Adjacent route and chrome regression: 21/21 passed.
- Full repository suite: 242/242 passed.
- ESLint and TypeScript: passed.
- Static export: passed with 83 routes.
- Local browser QA at 1440x1000 and 390x844: all three videos report 59.712
  seconds, playback advances, horizontal overflow is zero and console errors
  are zero. Production-origin checks are recorded after deployment.

## Rollback

Redeploy complete production deployment
`73e64feb-a789-431a-a6f4-af9a5fdb44b2` at source
`4c2f6432c144627e850f047cade539ae78514fe3`. Do not roll back only HTML while
leaving mismatched media. No Worker, KV, D1, migration, custom domain or public
navigation changes in this release.
