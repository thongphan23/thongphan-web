# Cinema Chapters Preview Release Report

Date: 2026-07-12

## Artifact

- Source commit: `29bcb9d2d212753065e3c8838875be694718d66e`
- Cloudflare deployment: `601a9129-8e2e-4736-a0e9-35049a911f6f`
- Preview URL: `https://601a9129.thongphan-com.pages.dev`
- Branch alias: `https://preview-29bcb9d.thongphan-com.pages.dev`
- Previous production deployment: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`
- Previous production source: `17b82c3`

## Release gate

- `npm ci`: passed.
- `npm test`: 106/106 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: 61/61 static pages generated.
- `npm run test:release`: 9/9 passed.
- `git diff --check`: passed.

## Preview smoke

- Core journey: 6/6 desktop/mobile checks passed for About, Chat, and Diagnostic.
- Subpage journey: 20/20 desktop/mobile checks passed across Library, readings,
  living notes, Assets, Challenges, and Blog.
- Homepage, Learn, Learn Free, Crown & Citadel, and Conan Maker returned HTTP 200
  without relevant console/network errors or horizontal overflow.
- All nine unique internal handoff destinations returned HTTP 200.
- Mobile menu focus trap, Escape close, and trigger-focus restoration passed.
- Reduced-motion handoff transitions collapse to effectively zero duration.
- Preview evidence: `/tmp/thongphan-cinema-chapters-qa/preview-core-report.json`
  and `/tmp/thongphan-cinema-chapters-qa/preview-subpages-report.json`.

## Production decision

Production was not promoted. `learn.thongphan.com` does not resolve in DNS, while
the approved release contract requires the independent learner PWA to be deployed
before publishing the public Learn entry points. The current production deployment
therefore remains the rollback-safe baseline.

Production can proceed only after one explicit product decision:

1. complete and deploy the learner PWA, then promote this complete artifact; or
2. temporarily remove/hide the public Learn entry points, rebuild, preview, and
   promote the Cinema Chapters-only artifact.
