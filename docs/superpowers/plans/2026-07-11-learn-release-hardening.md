# Learn Release Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prove the hybrid Learn system is accessible, secure, recoverable, observable, performant, and supportable before production promotion.

**Architecture:** Treat release evidence as code: deterministic E2E fixtures, automated accessibility and visual checks, load profiles, migration/restore drills, security tests, event reconciliation, and a signed release report. Promote each deployable independently behind rollback-ready routing.

**Tech Stack:** Playwright, Axe, Lighthouse/Web Vitals, Workers Vitest pool, k6 or autocannon-compatible HTTP load scripts, Cloudflare Wrangler, Node scripts.

## Global Constraints

- No production claim without current command output and rendered visual evidence.
- Test with analytics, leaderboard, AI coach, asset, and payment-confirmation failures injected.
- Use only seeded synthetic learners; never export production PII into test artifacts.
- Production rollback must preserve completed lesson versions and learning evidence.

---

### Task 1: Complete accessibility matrix

**Files:** Create `tests/a11y/*.spec.ts`, `docs/qa/ACCESSIBILITY_REPORT.md`.

- [ ] Run keyboard-complete onboarding, lesson, review, wardrobe, checkout, and opt-in/out paths.
- [ ] Run Axe on every core route/state and manual screen-reader checks for interaction alternatives, Cat appearance, reward changes, and errors.
- [ ] Verify 48px touch targets, focus visibility, zoom 200%, reduced motion, independent sound/haptic controls, and non-color status cues.
- [ ] Pass only with no severity-1/2 issue and documented owner/date for lower findings.

### Task 2: Complete responsive and visual fidelity matrix

**Files:** Create `tests/visual/*.spec.ts`, `docs/qa/VISUAL_FIDELITY_REPORT.md`, image snapshots.

- [ ] Compare selected Product Design reference beside implementation at matching viewport/state.
- [ ] Test 320/360/390/412 mobile, 834 tablet, and 1440 desktop for overflow, clipped actions, broken assets, typography, spacing, radii, and state consistency.
- [ ] Use canvas-pixel/image checks for Cat asset presence, crop, and layer alignment; no blank or fallback asset in golden flows.
- [ ] Pass only after two clean comparison rounds on all core first viewports and lesson/completion states.

### Task 3: Meet performance budgets

**Files:** Create `scripts/check-performance.mjs`, `docs/qa/PERFORMANCE_REPORT.md`, Web Vitals instrumentation.

- [ ] Enforce app shell <=220KB gzip, initial Cat assets <=450KB, lesson package/media <=700KB.
- [ ] Measure public LCP <=2.5s, learner INP <=200ms, CLS <=0.1 at p75 lab profile and wire RUM aggregation.
- [ ] Verify first authenticated lesson interactive <=2.5s on a mobile mid-tier profile.
- [ ] Fail CI on budget regression beyond the approved tolerance.

### Task 4: Security and privacy review

**Files:** Create `tests/security/*.test.ts`, `docs/qa/SECURITY_PRIVACY_REPORT.md`, `docs/runbooks/INCIDENT_RESPONSE.md`.

- [ ] Test authentication replay, CSRF, CORS, IDOR, role escalation, rate limits, webhook signature, HMAC replay, entitlement bypass, R2 object access, and audit immutability.
- [ ] Verify consent enforcement, pseudonymous analytics, private artifacts, opt-in leaderboard, data export/delete, and log redaction.
- [ ] Scan dependencies and secrets; remove test codes, local tokens, or private fixtures from bundles and logs.
- [ ] Pass only with no critical/high unresolved issue.

### Task 5: Load, failure, backup, and restore drills

**Files:** Create `tests/load/*.js`, `docs/runbooks/BACKUP_RESTORE.md`, `docs/qa/LOAD_RESTORE_REPORT.md`.

- [ ] Load 1,000-2,000 concurrent learner sessions and 500-2,000 events/s using realistic start/save/complete mixes.
- [ ] Inject Queue/KV/R2/AI/payment/leaderboard failures; learning completion must remain correct or fail safely without duplicate grants.
- [ ] Back up D1/KV/R2 manifests, restore into an isolated environment, rebuild projections, and reconcile counts/checksums.
- [ ] Record RTO/RPO, actual timings, commands, and discrepancies.

### Task 6: Production promotion and final rubric

**Files:** Create `docs/releases/LEARN_V1_RELEASE_REPORT.md`, update deployment/runbooks/status docs.

- [ ] Run both repositories' complete quality suites from clean installs.
- [ ] Deploy Learning Core, then learner PWA, then public Learn; smoke each before moving to the next.
- [ ] Verify DNS, TLS, cookies, CORS, cache, 404/error states, catalog, lesson completion, reward, checkout, and rollback route in production.
- [ ] Score the seven-dimension rubric with linked evidence; require total >=80 and all hard gates.
- [ ] Mark release complete only after support/runbook ownership and rollback evidence are present.

