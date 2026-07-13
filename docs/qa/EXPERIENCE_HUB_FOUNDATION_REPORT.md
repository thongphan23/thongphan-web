# Experience Hub Foundation QA Report

Date: 2026-07-13

Verdict: local release candidate passed

Verified implementation HEAD: `35c1131f638c0623ebe8c43238e5ca2b088ba16c`

## Scope

- Canonical `/experiences` hub
- Permanent `/challenges` compatibility redirect
- Versioned published-experience registry
- Release-aware Learn card
- Independent Learn build flag and fail-closed Pages runtime binding
- Journey, pinned navigation, sitemap and route-mode integration
- Hardened rendered-QA deletion, image-readiness and visibility contracts
- Scoped Experience Hub paper-muted contrast token
- No change to `/Users/rio/Projects/learn-conan-school`

## Automated verification

- `npm run lint`: passed with zero warnings or errors
- `npm test`: 230/230 passed
- `npx tsc --noEmit`: passed with zero diagnostics
- `npm run build`: passed; 82/82 static pages generated
- `npm run test:build`: 6/6 passed
- `npm run test:seo`: 4/4 passed
- `npm run test:bundle`: 3/3 passed
- `npm run test:learn-pages-preview`: passed with Wrangler 4.110.0
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
- Direct Pages handler tests passed for runtime binding true, false and missing.
  Exact `LEARN_PUBLIC_ENABLED=true` falls through with `context.next()`; false or
  missing returns the disabled HTTP 404 with `X-Robots-Tag: noindex, nofollow`.
- A real local `wrangler pages dev out --binding LEARN_PUBLIC_ENABLED=...` smoke
  proved `/learn` and `/learn/free` return 200 for runtime true and 404 for runtime
  false/missing. Build and runtime flags remain separate and fail closed.
- Learn repository HEAD before and after:
  `bb57a093ee7d6b2591a9627b1fb981efbf518d0b`.
- The complete pre-existing dirty status of
  `/Users/rio/Projects/learn-conan-school` was identical before and after these
  read-only observations. Both status snapshots contain 66 lines and have SHA-256
  `52838139e59ce53b896c9f2ff52bd5c9beabcd5ed6b4803f9f82b7dcd02c0987`;
  this task made no Learn repository change.

## Rendered verification

Task 5 is the authoritative rendered verification for this release candidate:

- Five cases passed: 1440x900, 390x844, 320x568, 1440x900 reduced motion and
  1440x900 JavaScript disabled.
- Evidence uses four ordinary viewport segments per case (`top`, `card-1`,
  `card-2`, `handoff`) plus one active-motion desktop viewport: 21/21 PNGs passed
  original-resolution inspection.
- Keyboard visible focus passed with a solid 3px outline.
- Horizontal overflow, broken images and header/title overlap were all zero.
- Every image completed loading, decoded and had non-zero natural dimensions.
- Visibility uses ancestor-aware `element.checkVisibility({ checkOpacity: true,
  checkVisibilityCSS: true })` plus non-zero client geometry. The rendered
  ancestor-opacity-zero regression probe was correctly rejected.
- All 21 PNGs were manually inspected at original resolution with no black tile,
  clipped subject or hidden content.
- Evidence: `/private/var/folders/n_/1vb9l4ls49bg1vcm3jpfjx_40000gn/T/thongphan-experience-hub-qa`.
- `report.json` SHA-256:
  `f97a327d010ecd84234b5c30aa3982796ed767fdc8fd08a28e9893fee12977b0`.

The recursive cleanup target is resolved before `rm` and is restricted to the
dedicated canonical `os.tmpdir()` directory or its descendants. Tests reject the
temporary root, home, repository, outside paths, traversal and symlink escapes.

Experience Hub caption and muted card copy use scoped `#625b52`; contrast assertions
measure 5.83:1 against `#f3efe6` and 5.03:1 against `#e8decf`, both above 4.5:1.

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
