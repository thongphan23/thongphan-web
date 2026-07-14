# Homepage polish — design QA

Date: 2026-07-14

## Source of truth

- Approved visual: `docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`
- Current implementation: `/tmp/thongphan-hero-polish-20260714/local-1440x900.png`
- Side-by-side comparison: `/tmp/thongphan-hero-polish-20260714/comparison-reference-vs-local.png`
- Additional responsive evidence:
  `/tmp/thongphan-hero-polish-20260714/local-390x844.png` and
  `/tmp/thongphan-hero-polish-20260714/local-320x568.png`

## Viewports and state

- Desktop: 1440×900, homepage at scroll position 0, film reel running.
- Laptop/tablet measurements: 1280×720 and 1024×768.
- Mobile: 390×844 and 320×568, homepage at scroll position 0.
- Menu interaction: 390×844, dialog opened by keyboard-equivalent click, close
  button receives focus, Escape closes and restores focus to the trigger.
- Motion interaction: pause control changes the reel from `running` to `paused`
  and updates its accessible name; reduced-motion behavior is locked by the
  release contract.

## Comparison history

1. Before: the display name could collide with the pinned header, the portrait
   started behind the chrome, the mobile word could break mid-word, and the
   fallback contact sheet contained a poor face crop.
2. First repair: introduced explicit chrome/copy safe zones, two unbroken display
   words, responsive portrait focal points and six traceable reel frames.
3. Desktop comparison found the proof microcopy too close to the reel at
   1440×900. A failing regression contract was added, then the short-height hero
   typography and spacing were compacted.
4. Final comparison: display-name accents and both word lines are complete,
   portrait hairline and face are retained, CTA and proof line stay clear, and
   the reel begins below the content without overlap.

## Interaction and console evidence

- Static production artifact hydrated successfully.
- Reel pause/resume control: passed.
- Mobile menu open, initial focus, Escape close and focus restoration: passed.
- Browser console: no relevant errors or warnings in desktop and mobile checks.
- Horizontal overflow: none at 1440, 1024, 390 and 320 CSS pixels.

## Severity review

- P0 blockers: 0.
- P1 major visual or interaction defects: 0.
- P2 polish defects in the approved scope: 0.

## Final result

passed
