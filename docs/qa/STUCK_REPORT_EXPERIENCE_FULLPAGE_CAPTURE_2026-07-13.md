# Stuck Report: Experience Hub full-page capture

Date: 2026-07-13

Route: `/experiences`

Boundary: local headless Chromium screenshot evidence only

## Verdict

`fullPage: true` is retired as authoritative visual evidence for the Experience
Hub route. The page's DOM, content and normal viewport captures do not prove a
production defect; the unresolved failure is inside Chromium's nondeterministic
full-page compositor path.

No third full-page workaround is authorized or attempted. Task 5 now uses four
faithful normal-viewport segments per QA case: `top`, `card-1`, `card-2` and
`handoff`.

## Reproduction

1. Build the static export and serve `out` on `127.0.0.1:3022`.
2. Open `/experiences.html` in headless Chromium at the Task 5 desktop viewport.
3. Capture the complete document with `page.screenshot({ fullPage: true })`.
4. Repeat for normal and reduced motion, then inspect every PNG at original
   resolution rather than trusting the harness exit code or a scaled preview.

The page consistently reports one H1, two released cards, identical title/body/link
signatures, visible non-zero descendants, zero horizontal overflow, zero broken
images and zero header/title overlap. Normal viewport, no-JavaScript and several
reduced captures are complete. Some full-page captures nevertheless contain large
black raster tiles.

## Failed mitigation rounds

### Round 1: disable animations during full-page capture

- Existing implementation: commit `d880b38`.
- Three consecutive normal-motion full-page captures were complete and
  byte-identical.
- SHA-256:
  `15128c54f4127986920c10542c70621c1820e5d07e66c074403b1d089af3cd53`.
- The subsequent five-case run still produced black tiles in the
  reduced-motion full-page image while DOM contracts passed.
- Conclusion: `animations: 'disabled'` does not make this compositor path
  authoritative.

### Round 2: hide Motion Atmosphere for capture only

- This was an isolated diagnostic experiment; production CSS and page state were
  not changed.
- Three normal-motion captures were complete and byte-identical.
- Normal SHA-256:
  `f66c4f4b598a5938b65106a360af80d047f34389e1278377d67ee73664796221`.
- Three reduced-motion captures were byte-identical to each other but all contained
  the same black tiles.
- Reduced SHA-256:
  `09f2ad1b4397be76557dbc43d2d731d32e67362a81f6e3ca56004a0b7ba46362`.
- Conclusion: the fixed blurred atmosphere is not a sufficient root cause, and
  capture-hiding production content is not an acceptable evidence architecture.

## Root boundary

The proven failure boundary is QA raster composition: headless Chromium can return a
corrupt `fullPage` bitmap even when layout, visibility, media readiness, content
parity and ordinary viewport captures are correct. There is no demonstrated product
DOM, content, layout or accessibility defect behind these black tiles.

## Decision and guardrail

- Remove authoritative full-page screenshots from `scripts/qa-experiences.mjs`.
- Never hide production content for evidence capture.
- Preserve one unstabilized `desktop-motion-viewport.png` to prove the real
  atmosphere profile is present and active.
- Use normal viewport screenshots after scrolling each named target into view and
  observing two stable animation frames.
- Keep DOM, content parity, media, overflow, overlap, reduced-motion, no-JavaScript
  and keyboard-focus contracts authoritative alongside the segmented images.
- If an ordinary viewport screenshot is corrupt, stop and report it. Do not add
  another raster workaround.

## Segmented rescue outcome

The replacement architecture passed locally on 2026-07-13: five cases, twenty
authoritative segment screenshots and one pre-stabilization active-motion viewport.
Original-resolution inspection found 21/21 clean images with each segment anchor
visible, no black tiles and no clipped media subjects. DOM visibility and matching
content signatures cover content below a single short mobile viewport. This successful
replacement does not reverse the decision above: full-page capture remains retired
for this route.
