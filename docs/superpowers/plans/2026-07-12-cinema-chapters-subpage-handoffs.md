# Cinema Chapters Subpage Handoffs Implementation Plan

**Goal:** Carry the approved Cinema Chapters journey language through every high-value route reached from the homepage while preserving light editorial reading surfaces.

**Architecture:** Reuse the typed `site-journey` registry and `ChapterHandoff`; page families only choose the correct journey key and tone. No new design system, animation runtime, backend, or Figma artifact is introduced.

## Constraints

- Preserve canonical URLs, static export, article content, scoring, and source disclosures.
- Keep Library and reader surfaces light for legibility; use `tone="paper"` there.
- Use a regular anchor for standalone `/conanmaker/`; never trigger Next RSC prefetch.
- Do not stage the four user-owned untracked files under `public/conanmaker/assets/`.
- Every implementation group begins with a failing route contract.

## Task 1: Library and reader journey continuity

- [x] Add failing contracts for `/library`, `/library/read`, living-note detail, and reading detail.
- [x] Add paper chapter handoffs using `library` and `reader` journey keys.
- [x] Keep each handoff outside the long-form reading body and avoid duplicate headings.
- [x] Run focused tests, TypeScript, and static build.

## Task 2: Assets and challenges journey continuity

- [x] Add failing contracts for both index and detail routes.
- [x] Add contextual dark chapter handoffs using `assets`, `asset-detail`, `challenges`, and `challenge-detail`.
- [x] Replace the stale external Conan destination with canonical `/conanmaker/`.
- [x] Run focused and full tests.

## Task 3: Blog journey continuity

- [x] Add failing contracts for blog index and detail routes.
- [x] Add paper chapter handoffs using `blog` and `blog-detail`.
- [x] Preserve article reading progress and client interactions.
- [x] Run focused tests and TypeScript.

## Task 4: Whole-system verification

- [x] Build all static routes and run release contracts.
- [x] QA representative index/detail routes at desktop, mobile, and reduced motion.
- [x] Verify links, focus, overflow, H1 count, images, and console output.
- [x] Update `docs/STATUS.md` with pass/fail evidence and commit the completed slice.
