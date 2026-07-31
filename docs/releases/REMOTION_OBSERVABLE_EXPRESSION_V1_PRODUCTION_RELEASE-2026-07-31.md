# Remotion Observable Expression v1 - Production Release

Date: 2026-07-31

## Outcome

The review route now compares three one-film videos built from the same supplied
Vietnamese voice. Shot selection begins with an explicit concept-to-observable
contract instead of mood or aggregate semantic resemblance.

## Production Set

| Variant | Film | Shots | Unique sources | Expression claims | Continuity |
| --- | --- | ---: | ---: | ---: | --- |
| Soul | Soul | 19 | 19 | 8/8 | PASS |
| Forrest Gump | Forrest Gump | 14 | 14 | 8/8 | PASS |
| A Beautiful Mind | A Beautiful Mind | 18 | 18 | 8/8 | PASS |

All masters are 1920x1080 H.264/AAC at 30 fps and 59.712 seconds. Integrated
audio loudness is -15.1 LUFS. The web derivatives are 720p, fast-start enabled
and remain below the Cloudflare Pages 25 MiB asset ceiling.

## Closed Failure

The previous Click variant allowed a family/crowd shot to participate in the
`mục đích bên trong` claim because low-social evidence from another shot was
pooled across the sequence. The new gate requires solitary-reflection cues to
co-occur in one shot and applies crowd/active-social prohibitions to every shot
in that candidate. The exact old pattern now fails with:

```text
OBSERVABLE_SIGNATURE_NOT_COLOCATED
FORBIDDEN_FEATURE_PRESENT_ALL_SHOTS
```

Click was not forced into the new comparison. Film casting found only one
distinct observed source that met the inward-reflection contract, so the film
failed whole-video coverage and `A Beautiful Mind` replaced it.

## Evidence

- Run: `/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-observable-expression-v1-20260731`
- Workflow index: `audit/workflow/00-WORKFLOW-EVIDENCE-INDEX.md`
- Manifest: `audit/workflow/workflow-evidence-manifest.json` (30 entries, all checksums from disk)
- Render QA: `content/render_qa_report.json`
- False-high rejection: `audit/old_click_inner_false_high_rejection.json`
- Plugin implementation: `cfb4a8d2574749b9c8d2a10a2f87da55181c7cf1`
- Plugin production proof: `160c27b`

## Verification

```text
Plugin full regression: 858 passed
Plugin source/cache parity: PASS
Remotion TypeScript: PASS
Render QA: 3/3 PASS
Review route focused tests: 4/4 PASS
Website full tests: 248/248 PASS
Website TypeScript: PASS
Website ESLint: PASS
Website build: 84 routes PASS
Browser QA: desktop + mobile, 3/3 playback each, PASS
Production browser QA: desktop + mobile, 3/3 playback each, PASS
```

## Release Boundary

- `/review/remotion-muc-dich-doi-song` remains `noindex` and private by discovery.
- `/tpr` remains protected and is not changed by this release.
- Website source commit: `6f51b0b60dc2db98af3ab51957afc718c1a4061e`.
- Cloudflare Pages deployment: `d14adb0a`.
- Production review URL: `https://thongphan.com/review/remotion-muc-dich-doi-song`.
- All three apex MP4 routes return complete video files. The first Forrest probe
  briefly saw a propagation 404; a fresh origin/apex verification returned the
  complete 13,746,370-byte MP4 with the correct `ftypisom` header.
- `/tpr` still returns HTTP 401 without a valid session.
