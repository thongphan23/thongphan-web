# Task 5 Report: Rendered Visual, Motion and Accessibility QA

## Status

PASS LOCALLY — segmented viewport evidence replaced the unreliable Chromium
full-page compositor path. No product UI, Learn runtime or deployment file changed.

## Architecture decision

Two authorized full-page capture mitigations had already failed original-resolution
inspection: disabling animations and capture-hiding Motion Atmosphere. Their
reproduction, hashes and stop boundary are preserved in
`docs/qa/STUCK_REPORT_EXPERIENCE_FULLPAGE_CAPTURE_2026-07-13.md`.

`scripts/qa-experiences.mjs` no longer creates an authoritative `fullPage: true`
screenshot. Each of five cases now captures four ordinary viewport segments after
scroll stabilization:

| Case | Viewport | Motion/JS | Segments |
| --- | --- | --- | --- |
| `desktop` | 1440×900 | normal / JS | top, card-1, card-2, handoff |
| `mobile` | 390×844 | normal / JS | top, card-1, card-2, handoff |
| `mobile-320` | 320×568 | normal / JS | top, card-1, card-2, handoff |
| `desktop-reduced` | 1440×900 | reduced / JS | top, card-1, card-2, handoff |
| `desktop-no-js` | 1440×900 | normal / no JS | top, card-1, card-2, handoff |

The twenty segment PNGs plus `desktop-motion-viewport.png` make a 21-screenshot
matrix. `report.json` records selector, target index, scroll position, target rect,
viewport, document height, stabilization method and stable-frame count for every
segment.

Chromium does not invoke `requestAnimationFrame` inside `page.evaluate` when the
browser context has `javaScriptEnabled: false` (isolated probe timed out while the
same synchronous evaluate succeeded). The four JavaScript-enabled cases require two
stable RAF observations. The faithful no-JavaScript case uses two 34 ms frame-duration
scroll probes and records `frame-duration-probe-no-js` rather than claiming RAF ran.

## Objective contracts

All five cases passed:

- HTTP 200, exactly one H1 and exactly two released experience cards;
- identical H1 plus per-card title/body/link signatures;
- every direct-text or media descendant visible, opaque and non-zero-sized;
- zero horizontal overflow, broken images and header/title overlap;
- correct reduced-motion media query and atmosphere state;
- normal and no-JavaScript content parity;
- no console or page errors;
- first keyboard focus is a non-zero anchor with a solid 3px outline.

The pre-stabilization desktop motion viewport independently proves
`ambient=restrained`, `pageVisible=true` and `motionActive=true`. Production content
is never hidden during capture.

## Original-resolution inspection

All 21 PNGs were opened at original resolution. Result: 21/21 clean. Every segment's
named anchor area is present and readable, both card media subjects are complete, and
there are no black compositor tiles. On short mobile viewports, DOM visibility and
content-signature contracts cover the portion of a tall card or handoff beyond the
single viewport raster. The dark area beginning below desktop `card-2` is the
intentional first edge of `ChapterHandoff`, outside the complete card bounding rect,
not raster corruption.

Artifacts:

- `/tmp/thongphan-experience-hub-qa/desktop-motion-viewport.png`
- `/tmp/thongphan-experience-hub-qa/{desktop,mobile,mobile-320,desktop-reduced,desktop-no-js}-{top,card-1,card-2,handoff}.png`
- `/tmp/thongphan-experience-hub-qa/report.json`

## Verification evidence

- `node --check scripts/qa-experiences.mjs`: pass.
- `npx eslint scripts/qa-experiences.mjs --max-warnings=0`: pass.
- Focused Experience/journey/chrome/focus contracts: 25/25 pass.
- `npm run build`: pass; 82/82 static pages generated.
- `npm run qa:experiences`: `Experience QA passed 5/5 with 21 viewport screenshots`.
- `git diff --check`: pass before commit.
- Server lifecycle used an explicit PID and cleanup trap.
- Final `lsof -nP -iTCP:3022 -sTCP:LISTEN`: no listener.

## Boundaries

- No `/Users/rio/Projects/learn-conan-school` change.
- No production component, CSS or route implementation change.
- No deployment or other remote mutation.
- `fullPage` remains retired for this route; a future corrupt ordinary viewport is a
  new stop condition, not authorization for another capture workaround.
