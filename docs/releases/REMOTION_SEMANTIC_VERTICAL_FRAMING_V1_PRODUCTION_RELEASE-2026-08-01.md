# Remotion Semantic Vertical Framing v1 - Production Release

Date: 2026-08-01

## Outcome

The Thông Phan Remotion workflow now treats a vertical render as a new semantic
composition. It does not crop the finished horizontal master. Each source shot
is observed, assigned a mandatory focus carrier and resolved through multiple
candidate crops before Remotion receives the selected camera path.

The owner-review page publishes nine videos from three iterative rounds. Every
round uses the same authoritative Vietnamese voice and the same three one-film
variants: `Soul`, `Forrest Gump` and `A Beautiful Mind`.

Owner review URL: `https://thongphan.com/review`

Detailed route:
`https://thongphan.com/review/remotion-muc-dich-doi-song`

## Authoritative Input

- Narration mode: `provided_audio`.
- Duration: 59.652 seconds source, 59.712 seconds rendered.
- Audio SHA-256:
  `65e1e34d81beb8710d00b1e77ce8de61643c273272418f5af14055809196057b`.
- No TTS replacement was generated.

## Plugin Implementation

- Repository: `thongphan23/thong-phan-remotion`.
- Branch: `agent/director-core-v2`.
- Commit: `53d87fcb4c6ba576fca0d8f74e2ac2406f3fdbac`.
- Active version: `0.2.9-rc.1+codex.20260801075502`.
- Active state: installed and enabled.
- Full regression: 880 passed.
- Cache parity: pass.

The contract requires:

- real source aspect ratio;
- at least `center_static`, `subject_static` and `proof_track` candidates;
- an `observed_carrier` or `reviewed_carrier` for every mandatory focus atom;
- focus retention of at least 0.82;
- pan speed no greater than 0.18 source widths per second;
- explicit source-center to renderer-position mapping;
- `must_keep`, `proposes`, `selected_for` and `derived_from` graph relations.

## Three Iterations

| Round | Method | Shot gate | Mean focus retention | Verdict |
|---|---|---:|---:|---|
| 1 | Center-crop baseline | 27/51 | 79.6% | NEEDS_IMPROVEMENT |
| 2 | Face/saliency tracking, short-shot hold, subtitle avoidance | 44/51 | 96.6% | NEEDS_IMPROVEMENT |
| 3 | Semantic carrier selection, dead-zone/hold, source replacement | 51/51 | 99.5% | PASS_WITH_RESIDUAL_SOURCE_RISKS |

Round 2 demonstrated that a high geometric retention score can still be a
semantic false-high: the largest face or strongest saliency region is not
necessarily the person, object or action carrying the voice meaning. Round 3
therefore binds the focus signal to the shot's semantic role and returns to
source selection when crop alone cannot recover the carrier.

## Round 3 Pixel Adjudication

- Geometric shot gate: 51/51.
- Semantic carrier pass: 48/51.
- Self-evaluation score: 97.2/100.
- This score is technical system evidence, not owner Taste.

The three remaining source risks are explicit:

1. One dark, abstract `Soul` shot is difficult to read from a frozen midpoint.
2. The `Soul` firetruck shot has strong midpoint motion blur.
3. The swimmer in one `Forrest Gump` shot remains small in the source frame.

The run fixed three reproduced false-highs before release: a shoulder-only work
shot, an awake trim that did not show Joe's face clearly, and a success shot
that omitted the award handoff.

## Review Package

The deployed page contains:

- nine H.264 web videos at 720x1280, each 59.712 seconds and below 10 MiB;
- nine posters;
- three owner-readable self-evaluation reports;
- nine vertical composition plans;
- nine shot contact sheets;
- 153 focus observations across 51 shots;
- the manual focus overrides and Round 3 pixel adjudication;
- the plugin implementation report.

Only one video is loaded at a time. The user can switch independently between
three rounds and three films while keeping a stable 9:16 player.

## Verification

- Focused review-page tests: 4/4 passed.
- Website full regression: 248/248 passed.
- TypeScript: passed.
- Focused ESLint: passed with zero warnings.
- Static build: 84 routes generated.
- Media probe: 9/9 H.264 videos at 720x1280 and 59.712 seconds.
- Local Playwright QA: 18/18 round-film combinations on 1440x1000 and 390x844.
- Production Playwright QA: 18/18 round-film combinations on both viewports.
- Playback advanced on both viewports.
- Horizontal overflow: none.
- Console errors: none.
- `/tpr`: HTTP 401 after release.

## Release Identity

- Website repository: `thongphan23/thongphan-web`.
- Branch: `agent/remotion-visual-semantic-frame-v1-20260731`.
- Implementation commit: `d18bf7596cdb9f67e8ed03d50aa2c173690094bc`.
- Cloudflare Pages deployment: `bc33ea67`.
- Immutable deployment URL: `https://bc33ea67.thongphan-com.pages.dev`.
- Canonical review URL:
  `https://thongphan.com/review/remotion-muc-dich-doi-song`.

## Taste Boundary

System self-evaluation does not update the owner's Taste Model. Owner feedback
must be captured later against the exact round, film, shot/trim, graph hash and
post-fix outcome before it can become verified Taste evidence.
