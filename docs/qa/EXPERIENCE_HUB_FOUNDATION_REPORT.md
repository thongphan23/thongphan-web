# Experience Hub Foundation QA Report

Date: 2026-07-13

Verdict: local release candidate passed

Verified source HEAD: `9607acf25e84bf64f3a1dbf9941e8ce92200363d`

## Scope

- Canonical `/experiences` hub
- Permanent `/challenges` compatibility redirect
- Versioned published-experience registry
- Release-aware Learn card
- Journey, pinned navigation, sitemap and route-mode integration
- No Learn runtime or contract modification

## Automated verification

- `npm run lint`: passed with zero warnings or errors
- `npm test`: 221/221 passed
- `npx tsc --noEmit`: passed with zero diagnostics
- `npm run build`: passed; 82/82 static pages generated
- `npm run test:build`: 6/6 passed
- `npm run test:seo`: 4/4 passed
- `npm run test:bundle`: 3/3 passed
- `npm audit --omit=dev`: zero production vulnerability
- `git diff --check`: passed
- Static export: `out/experiences.html` present and `out/challenges.html` absent

## Learn release-state verification

- `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=false npm run build`: passed; 82/82 static
  pages generated and `AI Foundation cho người đi làm` had zero matches in
  `out/experiences.html`.
- `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=true npm run build`: passed; 82/82 static
  pages generated and `AI Foundation cho người đi làm` had two matches in
  `out/experiences.html` (rendered content plus React payload).
- Learn repository HEAD before and after:
  `bb57a093ee7d6b2591a9627b1fb981efbf518d0b`.
- The complete pre-existing dirty status of
  `/Users/rio/Projects/learn-conan-school` was identical before and after these
  read-only observations; this task made no Learn repository change.

## Rendered verification

Task 5 is the authoritative rendered verification for this release candidate:

- Five cases passed: 1440x900, 390x844, 320x568, 1440x900 reduced motion and
  1440x900 JavaScript disabled.
- Evidence uses four ordinary viewport segments per case (`top`, `card-1`,
  `card-2`, `handoff`) plus one active-motion desktop viewport: 21/21 PNGs passed
  original-resolution inspection.
- Keyboard visible focus passed with a solid 3px outline.
- Horizontal overflow, broken images and header/title overlap were all zero.
- Evidence: `/tmp/thongphan-experience-hub-qa`.
- `report.json` SHA-256:
  `88c017cfda66023254cd0657fffb80f11311b58f3360acce13a3a91a080fbf84`.

Chromium `fullPage: true` capture is retired for this route and is not claimed as
release evidence. The headless compositor blocker, two failed capture-only
mitigations and stop boundary are documented in
`docs/qa/STUCK_REPORT_EXPERIENCE_FULLPAGE_CAPTURE_2026-07-13.md`.

## Boundary verification

- `/Users/rio/Projects/learn-conan-school` was not modified.
- Brain2 day 01-07 public / day 08-21 Conan access remained unchanged.
- Tools, Account, subscription and credit links were not exposed.
- Production deployment was not performed by this plan.

This verdict is local only. Production release remains a separate explicitly
authorized action that must select the Learn flag, deploy the exact verified
commit and record canonical smoke evidence.
