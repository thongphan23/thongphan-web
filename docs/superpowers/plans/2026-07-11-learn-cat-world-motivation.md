# Learn Cat World Motivation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a premium adult Cat World identity, deterministic rewards, wardrobe customization, achievements, missions, and celebrations without contaminating mastery or lesson focus.

**Architecture:** Store an immutable Reward Ledger as the source of truth, project Cat Level/traits/inventory from qualified learning events, and render appearance from a versioned layered-asset manifest. Cosmetics never enter evaluator, mastery, entitlement, or course-unlock logic.

**Tech Stack:** React 19, TypeScript, Cloudflare D1/R2/KV, ImageGen raster assets, Vitest, Playwright visual tests.

## Global Constraints

- Use only Cat World language from `/Users/rio/Projects/learn-conan-school/CONTEXT.md`.
- No random reward roll, duplicate unique item, shop, currency purchase, feeding, health, or neglect state.
- Five traits are projections of learned skill families, not combat stats and not wearable bonuses.
- Every visible asset has rights/provenance, stable ID, dimensions, layer slot, anchor, fallback, and reduced-motion behavior.

---

### Task 1: Lock the Cat art bible and asset manifest

**Files:** Create `docs/design/CAT_WORLD_ART_BIBLE.md`, `content/cat-world/assets.v1.json`, `src/contracts/cat-assets.ts`, manifest tests; create assets under `public/assets/cat-world/v1/`.

- [ ] Generate and approve base cats, expressions, poses, wearables, environment objects, badges, league emblems, region plates, course sets, and celebration tiers against the selected visual target.
- [ ] Deliver V1 baseline: 8 fur colors, 6 patterns, 6 poses, 8 expressions, 36 wearables, 12 environment objects, 12 badges, 5 league emblems, 5 region plates, 3 course sets, 3 celebration tiers.
- [ ] Normalize transparent canvas, anchor points, palette, crop, and compressed sizes; reject clipped or visually inconsistent layers.
- [ ] Test every outfit combination for missing references and initial Cat payload <=450KB.
- [ ] Commit: `feat(cat-world): add versioned visual asset system`.

### Task 2: Implement Cat profile creation and traits

**Files:** Create `worker/src/modules/motivation/cat-profile.ts`, `traits.ts`, routes/tests; create `src/features/cat/creation/*`, `src/features/cat/CatRenderer.tsx`.

- [ ] Test one Cat profile per learner, stable name validation, appearance persistence, base-asset fallback, and trait projection from mastery evidence.
- [ ] Build a short cat-creation step after placement, with no personality quiz unrelated to learning.
- [ ] Render five traits with text and accessible descriptions, never color only.
- [ ] Commit: `feat(cat-world): add learner Cat Companion`.

### Task 3: Implement Reward Ledger and Cat Level

**Files:** Create `worker/src/modules/motivation/reward-ledger.ts`, `cat-level.ts`, tests; create `src/features/rewards/*`.

- [ ] Test Dấu Chân values, qualified-source allowlist, level formula `100 + 25 * (current_level - 1)`, replay safety, and concurrent duplicate completion.
- [ ] Grant rewards only from server-owned source events and stable reward definitions.
- [ ] Return the original grant result for duplicate idempotency keys.
- [ ] Keep animation after persistence and allow immediate navigation.
- [ ] Commit: `feat(cat-world): add deterministic reward ledger`.

### Task 4: Implement Tủ đồ and appearance

**Files:** Create `worker/src/modules/motivation/inventory.ts`, routes/tests; create `src/features/cat/WardrobeRoute.tsx`, `WardrobeGrid.tsx`, `AppearancePreview.tsx`.

- [ ] Test ownership, slot exclusivity, compatible layers, equip/unequip, unique grants, missing assets, and private appearance defaults.
- [ ] Build swatches and icon controls with tooltips; do not use text pills where a familiar visual control exists.
- [ ] Persist a complete appearance snapshot with optimistic UI rollback on server rejection.
- [ ] Commit: `feat(cat-world): add wardrobe and appearance editor`.

### Task 5: Implement achievements, missions, and celebrations

**Files:** Create `worker/src/modules/motivation/achievements.ts`, `quests.ts`, tests; create `src/features/today/QuestStrip.tsx`, `src/features/completion/*`.

- [ ] Limit Today to at most three meaningful missions; opening the app and repeated easy lessons never qualify.
- [ ] Test achievement one-time grant, weekly reset, timezone boundary, and mission replacement.
- [ ] Implement lesson, hard-lesson/stage, and course completion tiers; each shows one reward focus and one primary CTA.
- [ ] Commit: `feat(cat-world): add missions achievements and celebrations`.

### Task 6: Cat World gate

- [ ] Run inventory/reward concurrency tests, complete asset-manifest audit, and visual matrix at mobile/tablet sizes.
- [ ] Confirm mastery and entitlement tests pass unchanged when all cosmetics are equipped.
- [ ] Score Cat World delight at least 12/15 without lowering lesson focus or accessibility scores.
- [ ] Update `docs/STATUS.md` and asset provenance report.

