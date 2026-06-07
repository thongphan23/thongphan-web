# Deployment Record — Cinematic Knowledge OS

> Date: 2026-05-20 14:47 +07  
> Status: deployed to production  
> Production domain: https://thongphan.com  
> Production deployment: https://bc0e671e.thongphan-com.pages.dev

## 1. Brain2 Context Used

- `01-Atomic/Strategies/strategy-brand-statement-thongphan-ai-assets-cashflow.md`
- `01-Atomic/Strategies/strategy-brand-positioning-thongphan-2026.md`
- `01-Atomic/Projects/project-personal-brand.md`
- `Conan/conan-platform-architecture.md`
- `01-Atomic/Insights/business-insight-conan-strategic-focus-depth-over-breadth.md`
- `01-Atomic/Insights/business-insight-ai-native-expertise-business-market-gap.md`
- `01-Atomic/Reflections/reflection-visual-first-communication-beyond-language.md`
- `01-Atomic/Libraries/library-proof-of-work-evidence-collection.md`

Voice workflow read:

- `/Users/rio/.openclaw/skills/social/thongphan-post/author-dna.md`
- `/Users/rio/.openclaw/skills/social/thongphan-post/SKILL.md`
- `/Users/rio/.openclaw/skills/social/thongphan-post/structures/pastor.md`

Approved local docs read:

- `docs/thongphan-com-v2/08-approved-build-prd.md`
- `docs/thongphan-com-v2/09-deployment-record-2026-05-19.md`

## 2. External Research Pattern Sources

- Apple Vision Pro: https://www.apple.com/apple-vision-pro/
- Apple AirPods Pro: https://www.apple.com/airpods-pro/
- Stripe Press: https://press.stripe.com/
- Stripe 3D Books analysis: https://www.webgpu.com/showcase/3d-books-by-stripe-press/
- Lore / darkroom.engineering analysis: https://www.webgpu.com/showcase/lore-webgl-darkroom-engineering/
- GSAP ScrollTrigger docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/
- Lenis docs / repo: https://github.com/darkroomengineering/lenis
- MDN CSS scroll-driven animations: https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations
- React Three Fiber Canvas fallback docs: https://r3f.docs.pmnd.rs/api/canvas

Applied patterns:

- Pinned cinematic sections.
- Scrubbed timeline.
- Scroll-driven transformation from chaos to Brain2.
- 2.5D DOM/SVG knowledge graph instead of generic WebGL.
- Proof collage with captions.
- Diagnostic as scan/control panel.
- Mobile fallback and `prefers-reduced-motion`.

## 3. Open Design Workbench

Project: `open-design-landing`

New artifact:

- `thongphan-cinematic-knowledge-os-homepage.html`

Reference artifact:

- `thongphan-v2-atelier-zero-homepage.html`

Note: a small `codex-create-test.html` file was created only to verify the Open Design artifact endpoint after the first large manifest write returned 400.

## 4. Production Changes

Homepage:

- Rebuilt as `Cinematic Knowledge OS` journey:
  - Chaos.
  - Signal.
  - Brain2 Core.
  - Transformation.
  - Proof.
  - Diagnostic.
  - Conan Trial.
- First viewport now leads with: `Từ hỗn loạn AI đến hệ thống tạo tài sản và dòng tiền.`
- Hero keeps the approved brand statement and primary CTA to `/diagnostic`.
- Added high-tech light editorial system: exposed grid, scan lines, node graph, kinetic proof tiles, control-panel diagnostic, Conan Trial portal.
- Used GSAP + ScrollTrigger for desktop scrub/pin choreography.
- Used DOM/SVG 2.5D visuals instead of WebGL to protect mobile performance.
- Added `prefers-reduced-motion` fallback that disables pinned ScrollTrigger and token animation.

Route sync:

- `/diagnostic`: light scan/grid layer, hover micro-interactions, mobile overflow fix.
- `/challenges` and `/challenges/brain2-21-ngay`: light control-panel rhythm, numeric markers instead of emoji icons.
- `/about`: proof/timeline sections now share the same scan/grid language.
- `/chat`: subtle Brain2 console frame.
- `/blog`: light grid/scan treatment and text-based category markers.

Dependencies:

- Added `gsap` for ScrollTrigger animation.

## 5. Build

Command:

```bash
npm run build
```

Result: pass.

Wrangler:

- `wrangler --version`: `4.81.1`
- Cloudflare docs checked for `wrangler pages deploy`.

## 6. Local Browser QA

Base URL: `http://127.0.0.1:3000`

Routes checked on desktop `1440x1000` and mobile `390x844`:

- `/`
- `/diagnostic`
- `/challenges/brain2-21-ngay`
- `/about`
- `/chat`
- `/blog`

Results:

- No console errors.
- No horizontal overflow.
- Diagnostic 5-question interaction returns `Level 3 — Expertise System Builder`.
- Diagnostic result contains `Kích hoạt 21 ngày Brain2` and `Vào Conan Trial`.
- `prefers-reduced-motion` verified: no pinned stage, token animation disabled.
- Short homepage scroll video recorded.

Artifacts:

- Screenshots/report: `/tmp/thongphan-cinematic-local-qa-1779262858872`
- Video: `/tmp/thongphan-cinematic-local-qa-1779262858872/eb4a468d62c5be887f5f81648ff97866.webm`

## 7. Cloudflare Deployment

Command:

```bash
wrangler pages deploy out --project-name thongphan-com --branch main --commit-dirty=true
```

Result:

- Deployment ID: `bc0e671e-1274-4499-9cfa-0889801a0ec0`
- Deployment URL: `https://bc0e671e.thongphan-com.pages.dev`
- Branch: `main`
- Environment: `Production`

HTTP verification:

- `https://bc0e671e.thongphan-com.pages.dev`: 200
- `https://thongphan.com`: 200

## 8. Live Browser QA

Base URL: `https://thongphan.com`

Routes checked on desktop `1440x1000` and mobile `390x844`:

- `/`
- `/diagnostic`
- `/challenges/brain2-21-ngay`
- `/about`
- `/chat`
- `/blog`

Results:

- HTTP 200 on all checked routes.
- No console errors.
- No horizontal overflow.
- Homepage H1: `Từ hỗn loạn AI đến hệ thống tạo tài sản và dòng tiền.`
- Homepage primary CTA href: `/diagnostic`.
- Diagnostic 5-question interaction returns `Level 3 — Expertise System Builder`.
- Diagnostic result contains `Kích hoạt 21 ngày Brain2` and `Vào Conan Trial`.
- `prefers-reduced-motion` verified on live domain.

Artifacts:

- Screenshots/report: `/tmp/thongphan-cinematic-live-qa-1779263191533`

## 9. API Sanity QA

Signup API:

```bash
POST https://thongphan.com/api/signup
{}
```

Result:

- HTTP `400`
- Body: `{"error":"challenge_slug is required"}`

Chat API:

```bash
POST https://thongphan.com/api/chat
{"message":"Test ngan: Brain2 la gi?"}
```

Result:

- SSE stream returned response chunks successfully.

## 10. Notes

- Static export remains intact.
- Existing Worker routes for signup/chat remain in place.
- No WebGL/Three.js was added because the Brain2 graph could be expressed meaningfully with DOM/SVG and this avoids mobile lag risk.
- Local `npm install` reports 2 existing audit findings (`1 moderate`, `1 high`). They were not introduced or addressed in this sprint because `npm audit fix` could create unrelated churn.

## 11. Post-Audit Layout Fix

Reason:

- User reported visible layout issues after first production deployment: text clipping, display glitches, and overflow risk.

Fixes:

- Removed GSAP `ScrollTrigger` pinning from homepage stage cards. The previous `pinSpacing: false` setup could create unstable scene spacing and clipped typography at scroll positions.
- Changed reveal behavior so critical content is visible by default. This prevents blank sections or delayed text appearing over nearby sections when IntersectionObserver timing is late.
- Converted desktop scene motion to lighter scrub-only animation with CSS sticky stage cards.
- Reduced homepage scene heading scale and tightened scene spacing to avoid viewport clipping.
- Removed horizontal transforms from chaos list rows and allowed meta text to wrap safely.
- Made mobile navigation non-sticky so it no longer covers or traps content during scroll.
- Fixed `/blog` mobile filters to wrap instead of creating horizontal overflow, and disabled excerpt line clamp on mobile.

Validation:

- `npm run build`: pass.
- Local layout audit: pass on `/`, `/diagnostic`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, `/blog` at desktop `1440x1000` and mobile `390x844`.
- Local audit result: no document horizontal overflow, no element overflow, no text overflow, no console errors.
- Diagnostic local flow: 5 answers produce result with `21 ngày Brain2` and `Conan Trial` CTAs.
- `prefers-reduced-motion`: verified, stage cards are `position: relative`, reveal opacity is `1`.
- Lighthouse mobile local sanity: performance `90`, FCP `1.4s`, LCP `3.6s`, TBT `10ms`, CLS `0`, Speed Index `1.7s`.

Local artifacts:

- Layout screenshots/report: `/tmp/thongphan-layout-audit-clean-1779264329154`
- Diagnostic flow screenshot: `/tmp/thongphan-diagnostic-flow.png`
- Lighthouse JSON: `/tmp/thongphan-lighthouse-mobile.json`

Cloudflare deployment:

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-dirty=true
```

Result:

- Wrangler: `4.81.1`
- Deployment URL: `https://bfe39140.thongphan-com.pages.dev`
- Branch: `main`
- Environment: `Production`

Live verification:

- `https://bfe39140.thongphan-com.pages.dev`: 200
- `https://thongphan.com`: 200
- `https://thongphan.com/diagnostic`: 200
- `https://thongphan.com/blog`: 200
- Live layout audit: pass on all checked routes at desktop `1440x1000` and mobile `390x844`.
- Live audit result: no document horizontal overflow, no element overflow, no text overflow, no console errors.
- Live diagnostic flow: 5 answers produce result with `21 ngày Brain2` and `Conan Trial` CTAs.
- Live signup API sanity: `POST /api/signup {}` returns HTTP `400` with `{"error":"challenge_slug is required"}`.
- Live chat API sanity: `POST /api/chat` returns SSE response chunks successfully.

Live artifacts:

- Layout screenshots/report: `/tmp/thongphan-live-layout-audit-1779264772601`
- Diagnostic flow screenshot: `/tmp/thongphan-live-diagnostic-flow.png`

## 12. Second Font and Layout Re-Audit

Timestamp: `2026-05-20 16:24:23 +07`

Reason:

- User reported remaining font, line-break, text overflow, and display issues after the first layout fix.

Fixes:

- Corrected global font-token application so the site no longer falls back to browser default fonts.
- Added `next/font` self-hosted fonts for `Be Vietnam Pro`, `Inter`, `Lora`, and `JetBrains Mono`.
- Moved global design tokens onto `html` and backed font aliases with explicit font-family stacks.
- Added missing spacing tokens: `--space-7`, `--space-14`, and `--space-18`.
- Tightened homepage typography and proof collage dimensions to avoid Vietnamese text overflow at narrow widths.
- Converted `/blog` mobile category filters from clipped horizontal chips into a two-column mobile grid.
- Kept blog cover images in full aspect ratio with `object-fit: contain` to avoid cropped text in thumbnails.

Validation:

- `npm run build`: pass.
- Local layout audit: pass on `/`, `/diagnostic`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, `/blog` at `360`, `390`, `414`, `768`, and `1366` widths.
- Local audit result: `problemCount: 0`.
- Local audit checks: no console errors, no document horizontal overflow, no element overflow, no text clipping, no Times font fallback, no replacement characters.
- Diagnostic local flow: 5 answers produce result with `21 ngày Brain2` and `Conan Trial` CTAs.
- `prefers-reduced-motion`: verified with no horizontal overflow and no Times fallback.

Local artifacts:

- Screenshots/report: `/tmp/thongphan-visual-polish-final5-local-1779268792992`
- Diagnostic flow screenshot: `/tmp/thongphan-visual-polish-final5-local-1779268792992/390-diagnostic-result.png`

Cloudflare deployment:

```bash
npx wrangler pages deploy out --project-name thongphan-com
```

Result:

- Wrangler: `4.81.1`
- Deployment URL: `https://3a4da26a.thongphan-com.pages.dev`
- Uploaded files: `156` uploaded, `27` already uploaded.
- Functions bundle uploaded successfully.

Live verification:

- `https://3a4da26a.thongphan-com.pages.dev`: 200
- `https://thongphan.com`: 200
- Live layout audit: pass on `/`, `/diagnostic`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, `/blog` at `360`, `390`, `768`, and `1366` widths.
- Live audit result: `problemCount: 0`.
- Live audit checks: no console errors, no document horizontal overflow, no element overflow, no text clipping, no Times font fallback, no replacement characters.
- Live diagnostic flow: 5 answers produce result with `21 ngày Brain2` and `Conan Trial` CTAs.
- `prefers-reduced-motion`: verified on live domain.
- Preview `/blog` check: font `Inter`, horizontal overflow `0`.

Live API sanity:

- `POST https://thongphan.com/api/signup {}` returns HTTP `400` with `{"error":"challenge_slug is required"}`.
- `POST https://thongphan.com/api/chat` returns SSE response chunks successfully.

Live artifacts:

- Screenshots/report: `/tmp/thongphan-visual-polish-final-live-1779268967780`
- Diagnostic flow screenshot: `/tmp/thongphan-visual-polish-final-live-1779268967780/390-diagnostic-result.png`

## 13. Vietnamese Copy Cleanup

Timestamp: `2026-05-20 16:58:37 +07`

Reason:

- User reported too much unnecessary English mixed into visible page content.

Fixes:

- Replaced homepage UI labels such as `Scene`, `System scan`, `Proof`, `Noise map`, `Asset pipeline`, `Output`, and `First action` with Vietnamese equivalents.
- Kept strategic/product names where appropriate: `AI`, `Brain2`, `Conan Trial`, `Conan Maker`, `Conan School`, `Obsidian`.
- Rewrote diagnostic result titles from English `Level` labels into Vietnamese `Tầng` labels.
- Replaced visible terms like `prompt`, `tab`, `save`, `workflow`, `tool`, `output`, `note/file`, `Chat`, `website`, and `atomic` where they were not needed.
- Updated `/about`, `/chat`, `/challenges`, `/diagnostic`, `/blog`, blog detail UI, signup success copy, and chat canned responses.
- Localized blog article body headings and examples that used `Pattern`, `Case study`, `Myth`, `Reality`, `Story`, `Statistics`, `Build`, and similar terms.
- Updated `cover-40-bai-viral.png` to replace `Pattern từ kinh nghiệm thật` with `Mẫu từ kinh nghiệm thật`.
- Removed desktop blog card excerpt clipping after longer Vietnamese descriptions.
- Fixed desktop blog article horizontal overflow caused by the floating table of contents.

Validation:

- `npm run build`: pass.
- Local copy/layout audit: pass on `/`, `/diagnostic`, `/challenges`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, `/blog`, and all 4 blog detail pages at `390` and `1366` widths.
- Local audit result: `problemCount: 0`.
- Local audit checks: no unwanted English labels from the cleanup list, no console errors, no document horizontal overflow, no element overflow, no text clipping.

Local artifacts:

- Screenshots/report: `/tmp/thongphan-vietnamese-copy-audit-final-local-1779270846082`

Cloudflare deployment:

```bash
npx wrangler pages deploy out --project-name thongphan-com
```

Result:

- Wrangler: `4.81.1`
- Deployment URL: `https://88637dd4.thongphan-com.pages.dev`
- Uploaded files: `108` uploaded, `75` already uploaded.
- Functions bundle uploaded successfully.

Live verification:

- `https://88637dd4.thongphan-com.pages.dev`: 200
- `https://thongphan.com`: 200
- Live copy/layout audit on custom domain: pass on `/`, `/diagnostic`, `/challenges`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, `/blog`, and all 4 blog detail pages at `390` and `1366` widths.
- Live custom-domain audit result: `problemCount: 0`.
- Live audit checks: no unwanted English labels from the cleanup list, no console errors, no document horizontal overflow, no element overflow, no text clipping.
- Preview deployment audit: `problemCount: 0`, Vietnamese label verified.
- Live chat API sanity: SSE response chunks returned successfully.

Live artifacts:

- Screenshots/report: `/tmp/thongphan-vietnamese-copy-audit-live-clean-1779271340691`
