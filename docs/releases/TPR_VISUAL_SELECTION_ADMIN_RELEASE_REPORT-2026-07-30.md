# TPR Visual Selection + Admin Release Report — 2026-07-30

## Outcome

The TPR system now has a mandatory, evidence-backed decision layer between
voice meaning and footage selection. The protected operations surface at
`/tpr` exposes its run state, candidates, decisions, model/graph entities,
Taste evidence, risks and artifacts without exposing local paths or secrets.

## Product contract

- Meaning and immediate comprehension are hard gates; aesthetics ranks only
  candidates that already communicate the voice claim.
- Every claim requires at least three plausible candidates backed by distinct
  sealed observation evidence.
- Caller-provided scores are forbidden. Semantic match, immediate comprehension
  and raw uncalibrated confidence are derived and retained with rejection reasons.
- Plot knowledge, dialogue-only meaning, excessive inference, insufficient
  recognition time, ambiguity and missing causal/contrast structure fail closed.
- Taste may adjust soft ranking by at most `0.05`; it cannot override a hard gate.
- Every selected shot can be traced back through decision, candidate, proof
  binding, observation and voice claim. Feedback records the exact winner/loser
  pair before any conservative Taste promotion.

## Runtime boundaries

- Thong Phan Remotion owns editorial claims, proof requirements, candidate
  evaluation, ranking, decisions and Taste evidence.
- Visual B-roll Engine remains the source of sealed media facts. No VBE
  production code changed in this release.
- Remotion executes the locked selection; it does not invent semantic proof.
- The dashboard reads a sanitized projection uploaded to isolated Cloudflare KV.
  It does not query mutable production databases from the browser.

## Access boundary

- A dedicated Worker owns only `/tpr*` on apex and `www`.
- The fixed owner passcode is stored only as a SHA-256 Worker secret.
- Sessions are HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Strict`, scoped to
  `/tpr` and expire after 12 hours.
- Login requires same-origin JSON, has a 256-byte body ceiling and rate-limits
  failures using an HMAC-pseudonymous IP key. Missing or malformed secrets fail
  closed. Responses are private, no-store and noindex.

## Evidence state

Snapshot SHA-256:

```text
52a5ac733bb41de0795910bc76e6288ce6ce65bff1c4fe69b758dc5b1df75a4a
```

Snapshot summary:

```text
runs=38
graph_entities=575
visual_claims=0
visual_candidates=0
visual_decisions=0
taste_evidence=0
open_risks=8
```

The 38 runs predate Visual Proposition Graph v1. They are explicitly shown as
`NOT EVALUATED`, not PASS. Only future runs that emit sealed v1 evidence may
contribute visual-selection quality or Taste data.

## Risk audit

The canonical register contains 12 risks: 4 mitigated/monitoring and 8 open.
The open set covers false observations, incorrect claim decomposition, weak
source pools, local-match/global-confusion, hidden repetition, Taste overfit,
film scores not derived from shots and audience-recognition mismatch. The
dashboard exposes these states and the engine blocks instead of choosing the
least-bad option when mandatory proof is absent.

## Verification

```text
Thong Phan Remotion focused visual-selection tests: 9 passed
Thong Phan Remotion full v2 regression: 757 passed
Visual B-roll Engine full regression: 75 passed
TPR route and Worker tests: 7 passed
Website full suite: 248 passed
TypeScript: PASS
Scoped ESLint: PASS
Production build: PASS, 83 routes including /tpr
Browser QA 1440x900: PASS
Browser QA 390x844: PASS
```

Desktop evidence:
`/Users/rio/Movies/thong-phan-remotion-admin/qa-20260730-production/desktop-overview.png`

Mobile evidence:
`/Users/rio/Movies/thong-phan-remotion-admin/qa-20260730-production/mobile-overview.png`

Production smoke:

```text
unauthenticated /tpr: 401 + X-Robots-Tag noindex,nofollow,noarchive
wrong access code: 401
correct access code: 204 + signed secure session
authenticated /tpr: 200
authenticated /tpr/api/snapshot: 200 + exact SHA-256 match
tampered session: 401
homepage: 200
library: 200
www unauthenticated /tpr: 401
```

The browser's only console entry during the end-to-end login test is the
intentional initial `401` response for the login document itself. No asset,
script or snapshot request failed after authentication.

## Source and deployment

```text
TPR source commit: ae26192
Website source commit: 9e7e4bc
Pages preview deployment: c33f3a5d-66d6-47f7-8d4f-bb866bf175eb
Pages production deployment: 062db5b2-6fe0-41a0-ae5d-88ed74615f55
TPR Worker version: 235c8833-6343-4bbe-8dd2-1e22d8c4ac9a
Rollback Pages deployment: 7e2412b4-2f13-4de7-bcc0-f71462a10088
```
