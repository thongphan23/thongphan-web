# Learn Competition And Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add spaced review, meaningful return loops, private artifacts, and an opt-in weekly league that rewards qualified learning without encouraging farming.

**Architecture:** Review scheduling consumes mastery evidence; competition consumes qualified Reward Ledger entries. Both use derived projections that can be rebuilt from authoritative records. Leaderboard failure never blocks learning, completion, or rewards.

**Tech Stack:** TypeScript domain modules, Cloudflare Workers/D1/Queues/KV, React 19, Vitest simulations, Playwright.

## Global Constraints

- No global public ranking, open messaging, follower graph, or real-time multiplayer.
- Leaderboard is pseudonymous and opt-in, with an immediate leave action.
- Replaying easy completed content has a daily diminishing cap and cannot inflate mastery.
- Review timing adapts to correctness, latency, help, retention, and stability, not Cat Level.
- Artifacts remain private unless the learner explicitly shares them.

---

### Task 1: Implement adaptive review scheduler

**Files:** Create `worker/src/modules/practice/scheduler.ts`, `queue.ts`, simulation/tests; create `src/features/practice/*`.

- [ ] Test interval expansion for fast independent success and contraction for slow/wrong/helped attempts.
- [ ] Prevent duplicate due items and notification spam; preserve source skill and evidence version.
- [ ] Build a focused review session with lower scaffolding than source lessons and a clear completion state.
- [ ] Simulate 90 days for representative learner profiles; expected bounded queue and monotonic stability for retained skills.
- [ ] Commit: `feat(learn): add adaptive spaced review`.

### Task 2: Implement Today recommendation projection

**Files:** Create `worker/src/modules/today/projection.ts`, tests; create `src/features/today/*`.

- [ ] Rank one primary action from due review, current lesson, independent check, artifact continuation, and new course start.
- [ ] Explain recommendation with a stable reason code; limit supporting missions to three.
- [ ] Test empty, new, returning, overdue, paid-locked, and completed-path states.
- [ ] Commit: `feat(learn): add focused Today recommendations`.

### Task 3: Complete artifact versioning and privacy

**Files:** Create `worker/src/modules/artifacts/*`, `src/features/artifacts/*`, tests.

- [ ] Test attempt/final/rubric/evidence lineage, owner-only reads, explicit share token, revoke, and R2 upload limits.
- [ ] Render artifact editing as a work surface, not social content; keep private as the default.
- [ ] Commit: `feat(learn): add private versioned work artifacts`.

### Task 4: Implement seasons, leagues, and anti-farming

**Files:** Create `worker/src/modules/competition/{season,league,projection,anti-farming}.ts`, tests; create `src/features/leaderboard/*`.

- [ ] Test weekly boundaries in Asia/Ho_Chi_Minh, deterministic league assignment, opt-in/out, promotion, demotion, ties, late events, and projection rebuild.
- [ ] Count only qualified weekly Dấu Chân; cap repeated easy sources and reject duplicate/replayed source events.
- [ ] Use pseudonyms and Cat avatar preview; no private artifact or PII is exposed.
- [ ] Serve last verified snapshot when projection worker is unavailable.
- [ ] Commit: `feat(cat-world): add opt-in weekly leagues`.

### Task 5: Analytics reconciliation and retention gate

**Files:** Create `worker/src/modules/analytics/*`, `docs/analytics/LEARN_EVENT_DICTIONARY.md`, reconciliation tests and dashboard queries.

- [ ] Reconcile source records, Reward Ledger, outbox, leaderboard projection, and dashboard counts by event ID.
- [ ] Build required acquisition, learning, content, reward, and league dashboard queries without PII.
- [ ] Alert on duplicate grants, outbox lag, completion mismatch, webhook failure, and projection drift.
- [ ] Pass when review queues remain healthy, leaderboard can be rebuilt, and Cat World engagement does not reduce mastery/artifact completion in pilot analysis.

