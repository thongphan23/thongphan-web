# Learn Lesson Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the focused 12-15 screen lesson runtime, eight accessible interaction types, mastery/review evidence, and the complete free AI Foundation vertical slice.

**Architecture:** Render lesson packages through a state-machine-driven player. Keep evaluators pure and versioned, store serializable interaction state per screen, autosave after meaningful transitions, and lazy-load interaction renderers. Cat World is limited to progress and completion moments during lesson mode.

**Tech Stack:** React 19, TypeScript, Vite, native pointer/keyboard APIs, Vitest, Testing Library, Playwright, Axe.

## Global Constraints

- One screen equals one viewport and one primary learner action; no vertical scrolling in lesson mode.
- Wrong answers preserve input, reveal a progressive hint ladder, and never expose the final answer prematurely.
- Every interaction has correct/wrong/partial fixtures, keyboard path, screen-reader alternative, reduced-motion state, and resume tests.
- The visual implementation must follow the selected Product Design image exactly, with real Cat World raster assets and the approved icon library.
- Initial app shell stays within 220KB gzip; interaction renderers are route/chunk lazy-loaded.

---

### Task 1: Decompose the prototype into app and lesson boundaries

**Files:** Replace `src/main.tsx`; create `src/app/App.tsx`, `src/app/router.tsx`, `src/app/AppShell.tsx`, `src/features/lesson/LessonRoute.tsx`, `src/features/lesson/LessonPlayer.tsx`, `src/features/lesson/lesson-machine.ts`, tests.

- [ ] Write a state-machine test covering load, attempt, evaluate, feedback, retry, advance, resume, completion, and exit confirmation.
- [ ] Move bundled mock data into typed dev fixtures and remove old wuxia asset imports/copy.
- [ ] Make lesson mode a dedicated route with stable viewport sizing and safe-area handling.
- [ ] Run focused tests and build; expected no behavior depends on component-local global counters.
- [ ] Commit: `refactor(learn): establish lesson player state machine`.

### Task 2: Implement eight P0 interaction evaluators

**Files:** Create `src/features/interactions/{choice,match,blank,order,compare,diagnose,drag-build,compose}/`, `src/domain/evaluation/*`, fixture tests.

- [ ] Write pure evaluator tests before each renderer, including malformed state and partial credit.
- [ ] Implement choice, tap-to-match, chip blank, tap-to-order, side-by-side compare, diagnose-highlight, tap/drag build, and constrained compose.
- [ ] Provide tap alternatives for every drag action and semantic list/form structures.
- [ ] Run all fixture contracts through both Forge and runtime evaluators; expected identical results.
- [ ] Commit once per interaction pair: evaluator plus renderer plus tests.

### Task 3: Implement the default 14-screen lesson grammar

**Files:** Create `src/domain/lesson/lesson-grammar.ts`, `src/domain/lesson/validate-state-graph.ts`, `content/ai-foundation/course-01/level-01/*.json`, tests.

- [ ] Encode hook, prediction, initial attempt, feedback, concept reveal, guided decomposition, scaffold build, compare, diagnose, reduced-help retry, workplace transfer, two independent checks, and artifact seed.
- [ ] Reject packages with unreachable screens, cyclic dead states, missing independent checks, or fewer than 12/more than 15 instructional screens.
- [ ] Author four lessons plus one review and one final-challenge package for AI Foundation Chặng 1.
- [ ] Run solvability and state-graph simulations across every branch; expected every required path reaches completion.
- [ ] Commit: `feat(content): add AI Foundation first learning stage`.

### Task 4: Implement feedback ladder and Mèo Dẫn Đường fallback

**Files:** Create `src/features/lesson/FeedbackPanel.tsx`, `src/domain/feedback/resolve-feedback.ts`, `src/features/coach/CoachPrompt.tsx`, tests.

- [ ] Test feedback order: diagnosis, conceptual cue, structural hint, worked micro-example, retry; never final answer before the authored threshold.
- [ ] Keep feedback map deterministic when AI is unavailable.
- [ ] Reserve coach calls for explicit learner request and send only current objective, screen, prior attempts, and consent-safe context.
- [ ] Run contract tests with timeout/error/invalid-schema responses; expected authored fallback always remains usable.
- [ ] Commit: `feat(learn): add progressive teaching feedback`.

### Task 5: Implement evidence, mastery, review, and artifact seed

**Files:** Create `src/domain/mastery/*`, `worker/src/modules/learning/mastery-service.ts`, `worker/src/modules/practice/*`, `worker/src/modules/artifacts/*`, tests.

- [ ] Test evidence weighting for correctness, independence, transfer, retention, and stability.
- [ ] Mark mastered only when score is at least 75 and confidence at least 0.65.
- [ ] Schedule due review without duplicate items; lower scaffolding than the source lesson.
- [ ] Save artifact attempt/final/rubric/evidence versions privately by default.
- [ ] Commit: `feat(learn): add mastery review and artifact evidence`.

### Task 6: Implement selected visual target and completion hierarchy

**Files:** Create `src/styles/tokens.css`, `src/features/lesson/*.module.css`, `src/features/completion/*`, `public/assets/cat-world/lesson/*`, visual tests.

- [ ] Use ImageGen outputs for Cat assets; do not recreate them with CSS/SVG/emoji.
- [ ] Implement compact normal completion and high-impact course/milestone completion with one primary CTA and no metrics inventory.
- [ ] Add `prefers-reduced-motion` alternatives and independent sound/motion controls.
- [ ] Compare reference and implementation at identical `390x844` viewport, fix visible differences, and repeat until visual rubric passes.
- [ ] Commit: `feat(learn-ui): implement focused Cat World lesson experience`.

### Task 7: Lesson engine gate

- [ ] Run fixture, state-machine, resume, keyboard, Axe, and visual tests at 320/360/390/412 widths.
- [ ] Verify every lesson screen has `scrollHeight === clientHeight` and no clipped primary action.
- [ ] Pilot the first stage with scripted fresh-user sessions; no facilitator instruction is allowed.
- [ ] Update `docs/STATUS.md` and content QA report. Pass only with no dead state, score drift, overflow, or severity-1/2 accessibility issue.

