# Learn Cat World Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-ready hybrid learning system across `thongphan.com/learn`, `learn.thongphan.com`, and a shared Cloudflare Learning Core, using the approved Cat World product model without exposing authoring tools to learners.

**Architecture:** Keep the public site and learner PWA as independent deployables. Put versioned contracts and authoritative learning state in the Learn repository, expose them through a modular Cloudflare Worker backed by D1/KV/R2, and let the existing Lesson Forge publish immutable packages through an admin boundary. Deliver in vertical slices so free AI Foundation works end to end before paid access, competition, or AI coaching are enabled.

**Tech Stack:** Next.js 16 and React 19 for `thongphan.com`; React 19, Vite, TypeScript, and a service worker for the learner PWA; Cloudflare Workers, D1, KV, R2, and Queues for Learning Core; Vitest, Workers Vitest pool, Testing Library, Playwright, and Axe for verification.

## Global Constraints

- Product source: `docs/superpowers/specs/2026-07-11-thongphan-learn-cat-world-system-design.md`.
- Domain language: `/Users/rio/Projects/learn-conan-school/CONTEXT.md`.
- Public brand shell: `docs/superpowers/specs/2026-07-10-thongphan-unified-cinema-system-design.md`.
- Learner authoring is forbidden. Lesson Forge remains in `/Users/rio/plugins/learn-lesson-forge`.
- Every lesson has 12-15 instructional screens, one main action per viewport, and a separate completion state.
- Mastery, completion, Dấu Chân, Cat Level, cosmetics, and leaderboard score remain separate values.
- No hearts, pet neglect, gacha, loot boxes, paid advantage, open chat, native app, or 3D in V1.
- Never grant access, mastery, rewards, or inventory directly from client state.
- Preserve unrelated untracked Conan Maker assets in `/Users/rio/thongphan-com/public/conanmaker/`.
- Every slice updates `/Users/rio/Projects/learn-conan-school/docs/STATUS.md` and records durable decisions under `docs/adr/`.

## Delivery Order

- [ ] **Gate 0: Select one of three generated Cat World visual targets.** Do not implement learner UI before the target is selected.
- [ ] **Slice 1: Execute `2026-07-11-learn-platform-foundation.md`.** Pass identity, catalog, publish, session, resume, and idempotency tests.
- [ ] **Slice 2: Execute `2026-07-11-learn-lesson-engine.md`.** Ship a complete free AI Foundation vertical slice with 12-15 screen lessons.
- [ ] **Slice 3: Execute `2026-07-11-learn-cat-world-motivation.md`.** Ship Mèo đồng hành, Tủ đồ, deterministic rewards, achievements, and missions.
- [ ] **Slice 4: Execute `2026-07-11-learn-public-commerce.md`.** Ship public discovery, diagnostic, account handoff, paid access, and refund-safe entitlements.
- [ ] **Slice 5: Execute `2026-07-11-learn-competition-retention.md`.** Ship review scheduling, artifacts, opt-in leagues, anti-farming, and retention projections.
- [ ] **Slice 6: Execute `2026-07-11-learn-release-hardening.md`.** Pass accessibility, performance, privacy, security, load, backup, restore, and production smoke gates.

## Master Acceptance

- [ ] A new learner can discover Learn publicly, complete a diagnostic, create an account, create a cat, start AI Foundation, finish a lesson, receive exactly one reward, resume on another device, and see the correct next task.
- [ ] A returning learner can complete due review, update mastery, equip an owned cosmetic, opt into a weekly league, and never lose progress when analytics or leaderboard workers fail.
- [ ] A paid learner can buy a course once, receive the correct entitlement, retain learning evidence after refund/revocation, and never unlock content from a client-only state change.
- [ ] Content staff can validate, approve, publish, rollback, and audit immutable lesson packages without adding authoring UI to the learner bundle.
- [ ] All target viewports `320x568`, `360x800`, `390x844`, `412x915`, `834x1194`, and `1440x900` pass no-overflow, primary-action, keyboard, and reduced-motion checks.
- [ ] Final rubric is at least 80/100; learning correctness, safety, and privacy are each at least 4/5; no P0 blocker or severity-1/2 accessibility issue remains.

## Master Verification

Run from `/Users/rio/Projects/learn-conan-school`:

```bash
npm run quality
npm run test:integration
npm run test:e2e
npm run test:a11y
npm run test:visual
npm run test:load
```

Run from `/Users/rio/thongphan-com`:

```bash
npm test
npm run build
```

Expected: every command exits `0`, release report includes evidence links, and the production smoke checklist has no unresolved blocker.

