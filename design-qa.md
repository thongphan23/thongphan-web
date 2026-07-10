# Evidence Cinema Fidelity v2 — Design QA

## Comparison target

- Source visual truth: `/Users/rio/thongphan-com/docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`
- Implemented production build screenshot: `/tmp/thongphan-evidence-cinema-rework/42-final-build-v6-desktop.png`
- Final full-view comparison: `/tmp/thongphan-evidence-cinema-rework/45-final-reference-vs-build-v6.png`
- Focused hero-copy comparison: `/tmp/thongphan-evidence-cinema-rework/46-final-focus-hero-copy.png`
- Focused film-strip comparison: `/tmp/thongphan-evidence-cinema-rework/47-final-focus-film-strip.png`
- Viewport: browser override `1490 × 1060`; implementation content width `1475`; normalized to the source's native `1487 × 1058` for side-by-side comparison.
- State: `/` initial hero after fonts, images and entrance motion settled; no form input or hover state.

## Findings

No actionable P0, P1 or P2 mismatch remains in the final comparison.

- Fonts and typography: Cormorant Garamond recreates the high-contrast editorial name and act headings; Be Vietnam Pro carries navigation, headline and UI copy. The hero headline is explicitly locked to the source's two-line wrap. Weight, scale, line height and letter spacing preserve the source hierarchy at desktop, tablet and mobile.
- Spacing and layout rhythm: navigation baseline, display name, headline, lead, CTA, microcopy and the three-frame rail follow the source's vertical sequence. The film rail begins below the CTA stack without collision. The transparent seal now matches the source's optical diameter and position.
- Colors and visual tokens: near-black ink, warm paper and lacquer red map directly to the source. The final build contains no garden gold, green, blue, glass-card or glow treatment in the homepage layer.
- Image quality and asset fidelity: the hero, mobile crop, film texture, seal, signature, arrow, outer frame and Conan portrait are separate fingerprinted raster assets. The seal and signature have real alpha and no rectangular backdrop. Hero images are sharp at their rendered sizes; all image requests resolve.
- Copy and content: the source headline, lead and CTA remain intact. The seal avoids the mock's unverifiable `EVIDENCE VERIFIED` claim. Frame 03 is truthfully labelled `NGƯỜI XÂY HỆ`, because the repository contains no real Conan community photograph.
- Icons and controls: the CTA uses a dedicated arrow asset; mobile navigation uses semantic buttons and links. Focus rings remain visible.
- Responsiveness and accessibility: no horizontal overflow at `390 × 844`, `834 × 1194`, `1280 × 720` or `1490 × 1060`. The mobile menu opens as a modal, locks scrolling, closes with Escape and restores focus. Reduced-motion CSS, semantic headings, form labels, image alt text and keyboard proof-rail controls are present.

## Comparison history

### Pass 0 — blocked

- Evidence: `/tmp/thongphan-evidence-cinema-rework/03-reference-vs-production.png`
- P1: deployed hero was visibly smaller, greyer and flatter than the selected mock.
- P1: the hero lacked the source's real three-frame film construction and analog outer frame.
- P2: title scale, copy wrapping, navigation line, seal, signature and CTA icon did not match.
- Fix: rebuilt the first viewport from measured layers and generated dedicated hero, film, seal, signature and arrow assets.

### Pass 1 — blocked

- Evidence: `/tmp/thongphan-evidence-cinema-rework/08-reference-vs-v2-pass2.png`
- P1: the v2 hero plate still lacked the source's body width and left-arm mass.
- P2: the headline wrapped after the wrong word; the analog perimeter was missing.
- P2: short-laptop and tablet layouts allowed microcopy to touch or enter the film rail.
- Fix: generated the wider v3 hero plate, added the explicit headline break and outer-frame raster, set short-laptop hero height to `980px`, and set tablet hero height to `1100px` with a `72vw` copy width.
- Post-fix evidence: `/tmp/thongphan-evidence-cinema-rework/16-laptop-1280x720-fixed.jpg` and `/tmp/thongphan-evidence-cinema-rework/25-tablet-fixed-834x1194.jpg`.

### Pass 2 — blocked

- Evidence: `/tmp/thongphan-evidence-cinema-rework/36-focus-hero-copy.png`
- P2: black raster backdrops remained visible around the seal and signature.
- P2: the lower Conan portrait used a `384 × 472` source enlarged beyond its comfortable display size.
- Fix: replaced the seal and signature with true-alpha v3 PNG assets and replaced the Conan portrait with a dedicated `1536 × 2048` portrait plate.

### Pass 3 — passed

- Evidence: `/tmp/thongphan-evidence-cinema-rework/45-final-reference-vs-build-v6.png`, `/tmp/thongphan-evidence-cinema-rework/46-final-focus-hero-copy.png`, `/tmp/thongphan-evidence-cinema-rework/47-final-focus-film-strip.png`.
- All earlier P1/P2 findings are resolved. No new P0/P1/P2 issue is visible.

## Browser and interaction evidence

- Desktop build screenshot: `/tmp/thongphan-evidence-cinema-rework/42-final-build-v6-desktop.png`
- Mobile build screenshot: `/tmp/thongphan-evidence-cinema-rework/43-final-build-v6-mobile.png`
- Tablet build screenshot: `/tmp/thongphan-evidence-cinema-rework/44-final-build-v6-tablet.png`
- Primary interactions tested: mobile menu open/close/Escape/focus restore; all three mirror questions and deterministic result; proof rail ArrowRight; homepage anchors; diagnostic destination; Conan Maker trailing-slash route.
- Runtime console: no relevant warnings or errors in final production-build desktop/mobile checks.
- Broken images: none.
- Static build contract: all referenced assets exist; hero/decorative assets and homepage-only JavaScript pass their budgets.

## Production verification

- Production URL: `https://thongphan.com/`
- Cloudflare deployment: `https://33f2615c.thongphan-com.pages.dev`
- Deployed source commit: `278c18d`
- Production captures: `/tmp/thongphan-evidence-cinema-rework/48-production-desktop.png`, `/tmp/thongphan-evidence-cinema-rework/49-production-mobile.png`, `/tmp/thongphan-evidence-cinema-rework/50-production-tablet.png`
- Live route checks: `/`, `/diagnostic`, `/library`, `/about` and `/conanmaker/` returned successfully with no broken image or relevant console warning/error.
- Live responsive checks: no horizontal overflow at `1490 × 1060`, `1280 × 720`, `834 × 1194` or `390 × 844`; the short-laptop CTA stack clears the film rail by about `20px`.
- Live interaction check: the primary CTA reaches `/diagnostic`; the mobile menu opens, closes with Escape and restores focus to `Mục lục`.

## Follow-up polish

- P3 accepted deviation: the three proof frames use available real repository photographs rather than synthesizing the mock's exact scenes. This preserves the approved real-proof/no-invented-evidence rule while retaining the source's composition, density and film treatment.

## Final result

passed
