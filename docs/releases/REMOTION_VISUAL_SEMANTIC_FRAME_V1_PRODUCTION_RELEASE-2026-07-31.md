# Remotion Visual Semantic Frame v1 — Production Release

**Date:** 2026-07-31  
**Review route:** `https://thongphan.com/review/remotion-muc-dich-doi-song`  
**Discovery policy:** `noindex, nofollow, nocache`

## Scope

Publish three new versions of the authoritative 59.652-second Vietnamese voice
after replacing black-box visual ranking with a transparent Visual Semantic
Frame and a canonical 24-archetype relation grammar.

- website branch: `agent/remotion-visual-semantic-frame-v1-20260731`;
- website implementation commit: `cd8870d864207baeaec0c7fd25cbbedaf2a63958`;
- plugin branch: `agent/director-core-v2`;
- plugin release commit: `66372f592a4c7766681a617c5cc24cc82f6c22a2`;
- active plugin cache: `0.2.6-rc.1+codex.20260730174548`;
- production deployment: `e3d341de-c2e6-437d-853c-643d5a0d2113`;
- rollback deployment: `e8f8731d-a019-40cc-99a9-9081184928f5`.

No public navigation, TPR Worker, KV, D1, secret, custom-domain route or
production content outside the bounded review route changed.

## Decision Model

Contrast is one option, not the default visual language. The plugin now models
24 relation archetypes: direct referent, attribute/state, visible action,
cause/effect, sequence/progression, state transition, comparison/contrast,
hierarchy/priority, part/whole, quantity/scale, trend/change, spatial relation,
dependency/condition, problem/solution, means/goal/outcome, choice/tradeoff,
cycle/feedback, accumulation/compounding, threshold/tipping point,
uncertainty/risk, instruction/procedure, negation/absence/loss,
value/consequence and inner/outer orientation.

Every candidate is scored with visible criteria and evidence references:

| Priority | Tier | Points | Selection rule |
|---:|---|---:|---|
| 1 | Meaning | 55 | direct keyword, literal entailment and silent comprehension are hard gates |
| 2 | Context | 20 | voice context is a hard gate; viewer-lived relevance ranks next |
| 3 | Flow | 15 | continuity, pacing, energy and affect/vibe |
| 4 | Craft | 10 | aesthetics and cinematic execution |

Selection is lexicographic by tier. A high total, Taste score or cinematic
assessment cannot override a failed Meaning or Context gate. The success claim
uses the directly visible act of receiving a trophy as the canonical positive
example.

## Three Variants

- **Direct visual proof:** changes film when needed to maximize literal,
  immediately readable evidence.
- **Soul-centered continuity:** favors narrative continuity around Soul while
  retaining all hard meaning gates.
- **Office-human familiarity:** favors recognizable office and working-life
  situations; it still uses the Soul trophy scene where that is the clearest
  available referent for success.

The run contains 72 observed candidates, 24 selected claim decisions and 57
timeline shots. There are 37 unique source files across the round. Existing
footage can be reused across different runs, but no source file repeats inside
one of these videos.

## Evidence Packet

Local source of truth:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-visual-semantic-frame-v1-20260731`

Published bounded packet:

`/review/remotion-muc-dich-doi-song/media/evidence/workflow-evidence-index.json`

The packet includes audio intake, approved transcript, claim timeline,
three-variant design, rejected new searches, source reuse policy, semantic
frames, prototypes, proof atoms, all scorecards, selected/rejected decisions,
sealed graphs, risk reports, locked edit plans, render receipts and the
owner-review packet.

## Media Integrity

| Variant | Master SHA-256 | Web SHA-256 |
|---|---|---|
| Direct visual proof | `b73ca8cfa0ffc1509547cf36b46015a96ed02956b1dabe1beef8c9076bdc489c` | `7898dca8a9c0134defffef9563ec43c0fc4d726da1f80345a2926912556fee69` |
| Soul centered | `727e1998ee0857e6d508c117cc2066693bd2232ba8c449571a631432fbf83711` | `a2d45561ff702f99ebef624e2ee366e5f50fc27b534d5933c3793211aeae7fc6` |
| Office human | `416a0d3e01a98628c3fe35f6e0f1e12ba2c65fa56549ec6ce6dfcc1ecb5c6f54` | `e7831149d882a88245cdc052ebdd36e81ff5e15f145841e5c3064de1d80587bf` |

The 1920x1080 masters and 1280x720 web derivatives are H.264/AAC and
59.712 seconds. Render QA passes source bounds, continuous timeline, black
frames, one-line subtitles, source reuse and contact-sheet inspection. Master
audio is approximately -15.1 LUFS with -5.4 dBFS peak.

## Verification

- plugin full regression: 767/767 passed;
- plugin package/source/cache parity: passed;
- focused review-page contract: 4/4 passed;
- full website suite: 248/248 passed;
- TypeScript and ESLint: passed;
- static production build: 84/84 routes;
- production desktop 1440x1000 and mobile 390x844 browser QA: all three videos
  loaded, advanced playback and reported 59.712 seconds; zero overflow and zero
  console errors;
- all three production MP4 routes: HTTP 200 `video/mp4`;
- evidence index: HTTP 200;
- `/tpr`: HTTP 401 with `private, no-store` and `x-robots-tag: noindex`.

## Rollback

Redeploy complete production deployment
`e8f8731d-a019-40cc-99a9-9081184928f5`. Do not roll back HTML without its
matching media and evidence packet.
