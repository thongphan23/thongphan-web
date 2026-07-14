# Homepage polish — production release report

Date: 2026-07-14

## Goal

Restore the homepage's visible craft at every supported viewport: preserve the
Vietnamese display-name accents, keep the portrait's head and face intact, stop
hero/header/reel collisions, replace the weak fallback contact sheet with a
truthful moving evidence reel, and retain accessible navigation and motion.

## Scope

- Hero chrome and copy safe zones at desktop, short laptop, tablet and mobile.
- Unbroken two-line `THÔNG PHAN` display treatment.
- Responsive portrait focal point and face-safe crop.
- Six-frame evidence reel built only from existing approved and traceable assets.
- Full-height mobile menu, safer reveal baseline and stronger rendered QA gates.
- Lint isolation for generated linked worktrees.

## Non-goals

- No Learn route, product, offer or learner application change.
- No Brain2 private vault/chat access change.
- No new third-party service, paid dependency or generated historical evidence.
- No redesign of the accepted Evidence Cinema visual direction.

## Acceptance criteria

- Display name clears pinned chrome and each word stays on one line.
- Portrait may touch the chrome edge but never loses the hairline or face.
- Hero CTA, proof microcopy and evidence reel do not overlap.
- Reel contains at least six unique, locally verified and rights-approved frames.
- Reel pause/resume and mobile menu keyboard lifecycle work on the built artifact.
- Desktop, tablet, mobile and reduced-motion contracts pass with no P0/P1/P2 issue.
- Full functional, TypeScript, build, release and Learn exposure matrices pass.
- Preview and production serve the verified source; prior production remains a
  documented rollback point.

## Verification before deployment

- `npm test`: passed (242 tests, 0 failures).
- `npm run lint`: passed with zero warnings after excluding generated `.worktrees`.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; 82/82 static pages generated.
- `npm run test:release`: passed.
- `npm run test:learn-pages-preview`: passed; two artifacts, six runtime pairs,
  incoherent build/runtime combinations rejected.
- `git diff --check`: passed.
- Browser-rendered static artifact: reel pause/resume, mobile menu open/focus,
  Escape close/focus restoration, no overflow and no relevant console issue passed.
- Design QA: `design-qa.md` — passed with zero P0, P1 or P2 finding.

## Deployment record

- Pre-release production deployment / rollback:
  `faa9aeae-e548-4757-8ec8-44b412055866`.
- Preview deployment: pending.
- Production deployment: pending.
- Public URL: `https://thongphan.com`.

## Result

Release candidate passed locally. Cloudflare preview and production promotion are
pending the release commit and final smoke verification.
