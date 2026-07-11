# Cinema Chapters Production Release Report

Date: 2026-07-12

## Artifact

- Source commit: `5f684d132b3d9fb77f08aa27e890f98cb1868fe8`
- Preview deployment: `2b34c806-3e46-4a64-bdb6-500ca46470a6`
- Preview URL: `https://2b34c806.thongphan-com.pages.dev`
- Production deployment: `f6370989-798d-49a4-9ff7-f4716f12bb78`
- Production origin: `https://f6370989.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Rollback deployment: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`

## Release gate

- `npm ci`: passed.
- `npm test`: 109/109 passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: 61/61 static pages generated.
- `npm run test:release`: 10/10 passed.
- `npm audit --omit=dev`: zero production vulnerabilities.
- `git diff --check`: passed.

## Learn release boundary

- Learn is absent from primary navigation, sitemap, diagnostic recommendations,
  and contextual journey recommendations.
- `/learn`, `/learn/free`, `/learn/diagnostic`, and course detail paths return
  HTTP 404 with `noindex, nofollow` at the Cloudflare function boundary.
- Source remains available behind `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=true` for a
  later release after the learner PWA and domain pass their own gate.

## Production smoke

- Core journey: 6/6 desktop/mobile checks passed for About, Chat, and Diagnostic.
- Subpage journey: 20/20 desktop/mobile checks passed across Library, readings,
  living notes, Assets, Challenges, and Blog.
- Homepage, Crown & Citadel, and Conan Maker returned HTTP 200 without relevant
  console/network errors or horizontal overflow.
- All nine unique internal handoff destinations returned HTTP 200.
- Mobile menu focus trap, Escape close, and focus restoration passed.
- All checked Learn paths returned real HTTP 404 and `noindex`.
- Public and production-origin homepage SHA-256 both equal
  `c96f8c17ccc1e46fde4ae5c77063c5c052691a264c7b81c35a0fa784abc1a987`.

## Verdict

PASS. Cinema Chapters is live on `https://thongphan.com`; the previous production
deployment remains the complete rollback artifact.
