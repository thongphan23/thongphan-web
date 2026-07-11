# Unified Cinema release QA

Date: 2026-07-11

Candidate branch: `feat/unified-cinema-system`

Release commit: `17b82c3`
Verdict: **PASSED — production verified; Read retired**

## Automated evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Functional contracts | PASS | `npm test`: 84 passed, 0 failed |
| TypeScript | PASS | `npx tsc --noEmit`: exit 0 |
| Static export | PASS | Next/Webpack generated 54/54 pages |
| Homepage build | PASS | 4 passed, 0 failed |
| SEO/export | PASS | 3 passed, 0 failed |
| Bundle/image budgets | PASS | 2 passed, 0 failed |
| Diff hygiene | PASS | `git diff --check`: exit 0 |
| Legacy safety | PASS | noindex metadata/headers and sitemap/robots exclusions |
| Static game preservation | PASS | `/game/` plus 65 runtime PNGs retained; index checksum unchanged |

## Rendered Browser QA

The selected in-app Browser was used; Playwright CLI was not installed or invoked.

| Surface | Desktop | Tablet | Mobile | Result |
| --- | --- | --- | --- | --- |
| Homepage, hero and ACT 03 | `1490×1060`, `1440×900`, `1280×800`, `1280×720` | `834×1194` | `390×844`, `320×568` | PASS |
| About and diagnostic | representative matrix | representative matrix | representative matrix | PASS |
| Library hub, living note and reading | representative matrix | representative matrix | representative matrix | PASS |
| Blog index/detail | representative matrix | representative matrix | representative matrix | PASS |
| Assets, challenge and chat | representative matrix | representative matrix | representative matrix | PASS |
| Custom/global 404 | direct unknown and nested unknown reading | responsive | responsive | PASS |
| Conan Maker and Crown & Citadel | direct production routes | responsive audit | responsive audit | PASS |

Preview matrix: 48 route/viewport checks. Production matrix: 16 desktop route-family checks plus five mobile checks. All had one `h1`, one `main` where applicable, no horizontal overflow, no broken images, and no relevant console warning/error.

Interaction evidence:

- Mobile menu opens as a dialog, locks scroll, closes with Escape, and restores focus to `Mở mục lục`.
- Evidence dossier opens as a dialog, closes with Escape, and restores focus to the originating proof card.
- Diagnostic completes all five questions and returns `Tầng 3, Brain2 Base` for the test fixture.
- Library query `Brain2` plus `Ghi chú sống` serializes as `?q=Brain2&type=note` and returns six matching records.
- Source-link reader exposes its real Stanford source and local bookmark state without pretending to be a full translation.
- Chat accepts a non-sensitive test question and returns its safe fallback without a console error.
- Reduced-motion behavior is locked by source contracts and CSS media rules; no essential content depends on motion.

## Visual comparison

- Reference: `docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`
- Combined reference/preview comparison: `/tmp/unified-cinema-reference-vs-preview-80cd058.png`
- Final production desktop: `/tmp/unified-cinema-production-17b82c3-1490x1060.png`
- Final production mobile: `/tmp/unified-cinema-production-17b82c3-390x844.png`
- Final short-laptop preview: `/tmp/unified-cinema-preview-17b82c3-1280x720.png`
- ACT 03 desktop: `/tmp/unified-cinema-act03-desktop.png`

Two P1 issues were found and fixed before final promotion: the desktop headline overlapped the display name, and nested unknown reading routes emitted a React hydration mismatch. The final short-laptop pass then compacted the display name and copy stack, leaving about `42px` between the name and headline and `16px` between copy and film rail at `1280×720`.

ACT 03 measures about `888.8px` inside a `1060px` viewport and renders all three proof cards without requiring another wheel step.

## Deployment, smoke and rollback

- Verified preview ID: `a34fada0-02d7-4f1b-841e-a57bceeeb707`
- Preview URL: `https://a34fada0.thongphan-com.pages.dev`
- Production ID: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`
- Production origin: `https://802dbe32.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Source: `17b82c3`
- Production `index.html` SHA-256: `63411f0c1b29e8c84a153905f5f7a87d88879b8f9cae50597c3808fb544040df`
- Known-good pre-release rollback ID: `cde8137c-c82d-4f36-9f67-d849da739902`

The public domain and Pages origin serve byte-identical homepage HTML. Browser reloads used a release query only to bypass the QA browser's cached previous immutable stylesheet; network `curl` confirmed the canonical URL already served the current artifact.

## Read retirement

After the main production smoke passed, Worker `thongphan-read` was deleted. Before deletion the runtime returned HTTP 200 with `X-Robots-Tag: noindex, nofollow`; after deletion three direct checks returned HTTP 530 with no redirect. The source project remains local as provenance.
