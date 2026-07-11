# Learn Platform Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace bundled prototype state with versioned contracts, Cloudflare-native authoritative storage, shared identity, immutable content publishing, and resumable lesson sessions.

**Architecture:** Restructure the Learn repository into a learner app, shared contracts/domain modules, and a modular Worker API without creating a second package manager or framework. D1 owns transactional state, KV caches published projections, R2 stores immutable assets and archives, and an outbox isolates analytics from completion.

**Tech Stack:** React 19, Vite, TypeScript, Cloudflare Workers/D1/KV/R2/Queues, Vitest, Workers Vitest pool, Testing Library.

## Global Constraints

- Keep the existing Vite app runnable throughout migration.
- Use schema-first decoders at every HTTP and lesson-package boundary.
- Session cookies are `HttpOnly`, `Secure`, `SameSite=Lax`, scoped to `.thongphan.com`; local development uses an explicit bearer-token adapter.
- Reuse the existing MailChannels delivery path for one-time email codes; do not add an auth SaaS.
- D1 migrations are append-only and reversible by forward repair; never edit an applied migration.
- Completion and reward writes must be atomic; outbox delivery is asynchronous.

---

### Task 1: Establish the repository quality harness

**Files:** Modify `/Users/rio/Projects/learn-conan-school/package.json`, `tsconfig.json`, `vite.config.ts`; create `vitest.config.ts`, `playwright.config.ts`, `tests/setup.ts`, `scripts/check-bundle-budget.mjs`.

- [ ] Add `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `test:a11y`, `build`, and aggregate `quality` scripts.
- [ ] Add a failing smoke test that imports the app root and asserts no authoring route or copy is bundled.
- [ ] Configure coverage for domain, evaluator, sync, reward, and entitlement modules; set statements/branches/functions/lines to 85/80/85/85.
- [ ] Run `npm run quality`; expected failure is only the not-yet-created app root contract.
- [ ] Commit: `test(learn): establish production quality harness`.

### Task 2: Create versioned contracts and deterministic validation

**Files:** Create `src/contracts/http.ts`, `src/contracts/content.ts`, `src/contracts/events.ts`, `src/contracts/errors.ts`, `src/contracts/__tests__/content.test.ts`, `content/fixtures/valid-lesson-v2.json`, `content/fixtures/invalid-dead-state.json`.

- [ ] Write tests for required package fields, 12-15 screens, immutable version ID, completion graph reachability, evaluator fixture parity, a11y metadata, and stable reward IDs.
- [ ] Implement narrow TypeScript decoders with structured error paths; do not accept unknown interaction versions silently.
- [ ] Define the event envelope with `event_id`, `event_name`, `occurred_at`, `actor_id`, `anonymous_id`, `trace_id`, `source`, `schema_version`, and typed payload.
- [ ] Run `npm test -- src/contracts`; expected `PASS` with valid fixture accepted and invalid graph rejected.
- [ ] Commit: `feat(learn): define versioned learning contracts`.

### Task 3: Add D1 schema and domain repositories

**Files:** Create `worker/migrations/0001_learning_core.sql`, `worker/src/env.ts`, `worker/src/db.ts`, `worker/src/repositories/*.ts`, `worker/test/migrations.test.ts`, `wrangler.learn.toml`.

- [ ] Model identity reference, consent, catalog, access, learning, motivation, competition, operations, idempotency, and outbox tables from the approved bounded contexts.
- [ ] Add unique constraints for published version IDs, source-event rewards, unique inventory grants, webhook IDs, session sync versions, and entitlement scope.
- [ ] Add indexes for Today projection, course map, due review, reward ledger, leaderboard week, and outbox status.
- [ ] Apply migration to a temporary local D1 database twice; first pass succeeds, second pass is harmless.
- [ ] Run repository integration tests against local D1; expected transaction rollback on duplicate reward and stale sync version.
- [ ] Commit: `feat(learn-api): add authoritative D1 learning model`.

### Task 4: Implement shared identity and consent

**Files:** Create `worker/src/modules/identity/routes.ts`, `service.ts`, `email-code.ts`, `session.ts`, `worker/test/identity.test.ts`; create `src/features/auth/*`, `src/api/client.ts`.

- [ ] Test one-time code issue, expiry, retry limit, replay rejection, session rotation, logout, and separate learning/personalization/marketing/AI consent values.
- [ ] Reuse MailChannels through a `VerificationMailer` interface; local mode writes the code to test output only when `ENVIRONMENT=local`.
- [ ] Create a cross-subdomain session and a local bearer-token adapter with identical user/consent claims.
- [ ] Add onboarding account screens without Cat World decoration inside form fields.
- [ ] Run identity integration tests and browser onboarding test; expected completion under 90 seconds with keyboard only.
- [ ] Commit: `feat(learn): add shared identity and consent`.

### Task 5: Implement immutable catalog publish and rollback

**Files:** Create `worker/src/modules/catalog/*`, `worker/src/modules/admin/*`, `worker/test/publish.test.ts`; modify `/Users/rio/plugins/learn-lesson-forge/scripts/lesson_forge.mjs`; create `/Users/rio/plugins/learn-lesson-forge/assets/lesson-brief-v2.example.json`.

- [ ] Upgrade Lesson Forge from four prototype interactions to a 12-15 screen package while retaining deterministic evaluators and fixtures.
- [ ] Test `draft -> validate -> approve -> publish`, publish immutability, idempotent republish, rollback pointer changes, and active-session version stability.
- [ ] Store package assets in R2, metadata in D1, and only the active catalog projection in KV.
- [ ] Require admin role, approval actor, content hash, and audit record for publish/rollback.
- [ ] Run the Forge validator and publish integration test; expected package hash remains unchanged after publish.
- [ ] Commit: `feat(lesson-forge): publish immutable lesson packages`.

### Task 6: Implement lesson session start, autosave, resume, and outbox

**Files:** Create `worker/src/modules/learning/session-service.ts`, `routes.ts`, `completion-transaction.ts`, `worker/src/modules/operations/outbox.ts`, tests; create `src/features/lesson/session-sync.ts`, `src/storage/offline-queue.ts`.

- [ ] Test session start, idempotent start, ordered autosave, stale `sync_version`, offline replay, duplicate completion, and analytics outage.
- [ ] Return authoritative state plus mergeable client input snapshot on version conflict.
- [ ] Validate required state-graph nodes server-side before completion.
- [ ] Write completion, evidence, mastery update, review schedule, reward, course progress, and outbox in one D1 batch/transaction boundary.
- [ ] Run `npm run test:integration`; expected duplicate completion returns the original result and no second ledger entry.
- [ ] Commit: `feat(learn-api): add resumable idempotent lesson sessions`.

### Task 7: Foundation gate

- [ ] Run `npm run quality` and `npm run test:integration` from the Learn repository.
- [ ] Run migration dry-run against a fresh local D1 database and restore the fixture snapshot.
- [ ] Update `docs/STATUS.md`, add API examples to `docs/API_CONTRACT.md`, and record any changed decision under `docs/adr/`.
- [ ] Pass when prototype local state is no longer authoritative and the free-course catalog/session path works with the Worker offline.

