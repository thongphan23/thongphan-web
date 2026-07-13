# Task 2 Report — Canonical Experience Hub and Accessible Cards

## Status

PASS. The canonical `/experiences` route, registry-driven cards, source contract, and package test entry are implemented. The Learn card remains controlled by `learnPublicEnabled` through `getPublishedExperiences({ includeLearn: learnPublicEnabled })`.

Commit: `cd46575` (`feat: add canonical experience hub`).

## Implementation

- Added a static `/experiences` page with canonical metadata, one semantic `h1` from `DossierHeader`, an `h2` section heading, and `h2` card titles.
- Added `ExperienceCard({ experience, index })` with stable `data-experience-id`, registry-controlled image fit and position, duration/access/output copy, and exactly one canonical `Link` action.
- Added responsive paper-surface styling. The hero uses `object-fit: contain`; every current registry card is also `fit: 'contain'`, so faces and subjects are not destructively cropped.
- Added the Experience Hub source contract to the main `npm test` script immediately after the registry contract.
- Resolved the plan conflict reported during TypeScript verification: `journeyKey="experiences"` was required by Task 2 but absent from `JourneyKey`. With coordinator approval, the minimum Task 4 contract was moved forward: the new key and exact final `journeyHandoffs.experiences` copy were added without changing `challenges`, `asset-detail`, or existing actions/routes.
- Renamed the Task 1 compile-time type assertion to `_PublishedExperiencesStayReadonly` so the exact scoped ESLint command required by this brief passes; behavior is unchanged.

## TDD Evidence

### RED — Experience Hub

Command:

```bash
node --import tsx --test scripts/experience-hub-contract.test.ts
```

Result: exit 1, 0/2 passed. Both tests failed with the expected `ENOENT` for `app/experiences/page.tsx`.

### RED — Experiences journey handoff

Command:

```bash
node --import tsx --test scripts/site-journey.test.ts
```

Result: exit 1, 3/4 passed. `known keys return stable handoffs` failed because `getJourneyHandoff('experiences')` returned `undefined`.

### GREEN — Focused verification

Command:

```bash
node --import tsx --test scripts/experience-registry.test.ts scripts/experience-hub-contract.test.ts scripts/site-journey.test.ts
npx tsc --noEmit
npx eslint app/experiences components/experience lib/experiences.ts lib/site-journey.ts scripts/experience-*.test.ts scripts/site-journey.test.ts --max-warnings=0
```

Result: exit 0; 10/10 tests passed; TypeScript passed; scoped ESLint passed with zero warnings/errors.

## Full Verification

```bash
npm test
```

Result: exit 0; 217/217 tests passed, 0 failed, 0 skipped.

```bash
git diff --check
```

Result: exit 0.

## Files

- `app/experiences/page.tsx`
- `app/experiences/page.module.css`
- `components/experience/ExperienceCard.tsx`
- `components/experience/ExperienceCard.module.css`
- `scripts/experience-hub-contract.test.ts`
- `package.json`
- `lib/site-journey.ts` — approved minimum plan-conflict resolution
- `scripts/site-journey.test.ts` — regression contract for that resolution
- `scripts/experience-registry.test.ts` — lint-only type alias rename

## Self-review

- Heading order is semantic: one page `h1`, then the index and each independently titled card use `h2`; no heading level is skipped.
- All imagery comes from tracked raster paths and `next/image`; there is no handmade SVG, emoji, Lucide illustration, or CSS art.
- Hero and all currently published experience media use `contain`, preserving faces/subjects. Registry `objectPosition` remains attached to each card image.
- Cards expose exactly one `Link`, a minimum 48px action height, descriptive image alt text, native definition-list semantics, and stable test hooks.
- Learn remains fail-closed when `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED` is not `true`; the page does not bypass or duplicate release-gate logic.
- No redirect, navigation, Learn repository, or Task 3/4 route work was added beyond the explicitly approved handoff contract needed to compile Task 2.

## Concerns

- No implementation blocker remains.
- `.superpowers/sdd/task-1-report.md` was already modified before Task 2 and is intentionally excluded from this task's commit.

## Important review remediation — contained media motion

The independent read-only review found that the shared motion selector scales every image inside a hovered `data-motion-surface`. Because Experience Card media uses `overflow: hidden`, that shared scale could clip the edges of registry images configured with `fit: 'contain'`.

The card keeps `data-motion-surface`, so its surface lift and atmosphere/light response remain active. A higher-specificity, card-scoped override now keeps only `contain` media untransformed on hover and `focus-within`. The shared image motion remains available to future `cover` media.

### TDD evidence

RED command:

```bash
node --import tsx --test scripts/experience-hub-contract.test.ts
```

Observed before the CSS override: exit 1; 2/3 tests passed. The new source regression assertion failed because the required scoped hover/focus selector and `transform: none` declaration were absent.

GREEN command:

```bash
node --import tsx --test scripts/experience-hub-contract.test.ts
```

Observed after the CSS override: exit 0; 3/3 tests passed.

### Fresh focused verification

```bash
node --import tsx --test scripts/experience-registry.test.ts scripts/experience-hub-contract.test.ts scripts/site-journey.test.ts
npx tsc --noEmit
npx eslint app/experiences components/experience lib/experiences.ts lib/site-journey.ts scripts/experience-*.test.ts scripts/site-journey.test.ts --max-warnings=0
git diff --check
```

Result: exit 0; 11/11 focused tests passed; TypeScript passed; scoped ESLint passed with zero warnings/errors; `git diff --check` passed.
