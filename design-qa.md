# Evidence Cinema Design QA

## Comparison target

- Source visual truth: `/Users/rio/thongphan-com/.worktrees/evidence-cinema-homepage/docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`
- Browser-rendered implementation: `http://127.0.0.1:4174/`
- Latest implementation screenshot: `/tmp/thongphan-evidence-cinema-qa/production-1490x1060-final.png`
- Combined comparison: `/tmp/thongphan-evidence-cinema-qa/comparison-final.png`
- Focused downstream comparison: `/tmp/thongphan-evidence-cinema-qa/sections-contact-sheet.png`
- Viewport and state: 1490×1060, homepage hero at rest after entrance motion.
- Browser: Codex in-app Browser (IAB), production static export served locally with clean-URL support.

The source and implementation were compared at the source image's native 1490×1060 dimensions. Focused section captures were required because the reference only defines the first viewport while the written spec defines the downstream acts.

## Final findings

No actionable P0, P1 or P2 mismatch remains.

### Required fidelity surfaces

- Fonts and typography: Cormorant Garamond reproduces the two-line editorial name and downstream display hierarchy; Be Vietnam Pro owns UI/body copy. Weight, line-height and wrapping remain readable at 1440×1024, 1280×720, 834×1194, 390×844 and 375×812.
- Spacing and layout rhythm: the name, promise, CTA and film rail align closely to the selected composition. Open editorial bands replace repeated card grids. The short-laptop and tablet fixes keep CTA and microcopy clear of the rail.
- Colors and tokens: ink black, warm paper and lacquer red match the approved palette. No garden green, gold luxury gradient, glass card or blue glow remains in the homepage layer.
- Image quality and asset fidelity: every visible person is the real Thông Phan. Desktop/mobile hero sources are 102 KB/39 KB; all rendered images completed without a broken-image state in the production pass.
- Copy and content: above-the-fold visible copy matches the approved wording. The mock's invented verification language, Hoa Sơn composite and unsupported community proof are not shipped.
- States and interactions: production mobile menu opens with focus on Đóng, traps focus, closes on Escape and restores focus to Mục lục. The mirror completed with `over-5 / asset / asset`, returned `Cần đóng gói tài sản đầu tiên` and linked to `/diagnostic`. The proof rail moved from 0 to 867 px with ArrowRight.
- Accessibility: one semantic `h1`, visible focus states, 44 px minimum controls, labelled fieldsets/radios, descriptive alt text, keyboard proof rail, reduced-motion source path and no horizontal overflow.
- Console and runtime: no relevant console errors or warnings in desktop, mobile, subpage or production passes.

## Comparison history

### Pass 1 — blocked

- P1 layout: desktop navigation was pushed to the right and added a redundant desktop wordmark absent from the selected composition.
- P1 image treatment: the real stage portrait was too small and the bright stage screen dominated the right field.
- P2 spacing: promise, CTA and film rail sat about 60 px lower than the source.

Fixes: desktop wordmark hidden, navigation realigned left, portrait crop enlarged and edge-faded, hero copy moved upward, film rail height tied to viewport height.

Post-fix evidence: `/tmp/thongphan-evidence-cinema-qa/implementation-1490x1060-pass3b.png`.

### Pass 2 — blocked

- P1 responsiveness: at 1280×720 the film rail covered the primary CTA.
- P2 responsiveness: at 834×1194 the rail touched the CTA and hid proof microcopy.
- P2 accessibility: the focusable proof rail did not respond to ArrowLeft/ArrowRight in Browser/IAB.

Fixes: added short-height laptop spacing, increased tablet hero space, and introduced explicit keyboard scrolling with reduced-motion-aware behavior.

Post-fix evidence: `/tmp/thongphan-evidence-cinema-qa/production-laptop-1280x720-final.png`, `/tmp/thongphan-evidence-cinema-qa/production-tablet-834x1194-final.png`, and Browser evidence showing the proof rail move from 0 to 867 px.

### Pass 3 — passed

- Native-size hero composition preserves the selected name scale, portrait tension, lacquer CTA and film/contact-sheet invitation.
- Production static capture has no development badge, broken image, framework overlay, horizontal overflow or console warning.
- Per-section captures show a coherent mirror, evidence rail, warm-paper method sequence, editorial path list and Conan handoff.

## Intentional deviations

- The implementation ships two real proof frames rather than the mock's three invented frames.
- The evidence stamp uses only `LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT`; it removes fake third-party “verified” language.
- The real stage background is preserved instead of generating a synthetic cutout, so its crop is less seamless than the ImageGen mock but remains truthful.
- The mock's decorative signature flourish and CTA arrow are omitted because they were not required by the approved content contract and no matching icon/brand asset exists in the repository.

## Residual test gap

The in-app Browser runtime did not expose media-query emulation. Reduced motion is covered by source contracts, the `matchMedia('(prefers-reduced-motion: reduce)')` runtime branch and the CSS media query, but not by a Browser screenshot with the operating-system preference toggled.

final result: passed
