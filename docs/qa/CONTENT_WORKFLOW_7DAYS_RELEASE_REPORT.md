# Content Workflow 7 Days — Release Report

Last updated: 2026-08-08

## Release identity

- Route: `https://thongphan.com/challenge/content-workflow-7days`
- Source branch: `agent/content-workflow-7days`
- Base commit: `ed985507b04c19cddd60ceb6442d28e65c38d397`
- Release source commit: recorded after the final verified documentation commit.
- Cloudflare project: `thongphan-com`

## Product contract

- Free, immediately accessible and self-guided.
- No account, payment, email gate, API, database or in-product AI generation.
- One versioned browser key: `tp.content-workflow-7days.v1`.
- Seven open lesson routes and eight exportable artifact categories.
- Deterministic structural Quality Gates; no scroll/time completion.
- Workbook content stays in the browser unless the learner explicitly copies or exports it.

## Local implementation evidence

- Focused model, storage, route, registry and route-mode checks: 27/27 pass.
- Journey contract: 4/4 pass.
- Full `npm test`: 269/269 pass.
- `npx tsc --noEmit`: pass.
- `npm run lint`: pass with zero warning.
- `npm run build`: pass; Next generated 91 static pages including the hub and all seven lesson routes.
- Static artifact paths confirmed for `day-01.html` through `day-07.html`.
- `npm run test:release`: pass — build 6/6, SEO 4/4, bundle 3/3 and Brain2 143/143.
- `git diff --check`: pass.

## Visual contract

Accepted references:

1. `docs/visual/content-workflow-7days/hub-desktop-approved.png`
2. `docs/visual/content-workflow-7days/workbench-desktop-approved.png`
3. `docs/visual/content-workflow-7days/workbench-mobile-approved.png`
4. `docs/visual/content-workflow-7days/day-07-completion-approved.png`

Production hero asset:

- `public/images/challenges/content-workflow-7days-fieldbook.webp`
- Native dimensions: 1254×1254.
- Encoded size at implementation checkpoint: 87 KB.
- Source: generated specifically for thongphan.com from the accepted concept.

## Rendered QA and fidelity ledger

Rendered browser evidence, native-dimension comparison and the final mismatch ledger
are recorded after the exact static release artifact is exercised at 1440×900,
1280×800, 390×844 and 320×568.

## Preview and production evidence

The final section records, in order:

1. Previous production deployment ID used as rollback point.
2. Exact source SHA and preview deployment ID/URL.
3. Preview route, browser and workflow smoke results.
4. Production deployment ID and immutable Pages origin.
5. Apex, `www` and origin response checks for the hub, seven lesson routes,
   `/experiences` and `sitemap.xml`.
6. Final fresh-browser workflow evidence through Markdown export and reset.

No preview or production identifier is claimed before the corresponding Cloudflare
command and live read-back have completed.
