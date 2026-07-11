# thongphan.com Deployment Contract

## Source of truth

- Application source: this repository.
- Frontend build command: `npm run build`.
- Cloudflare Pages output: `out/`, as declared by `pages_build_output_dir = "out"` in `wrangler.toml`.
- Static Conan Maker route source: `public/conanmaker/`.
- Static Crown & Citadel route source: `public/game/`, built from the `crown-and-citadel` repository with `npm run build:site`.
- Canonical redirect source: `public/_redirects`.

Do not patch the generated production output or upload a manual homepage build that is absent from this repository.

The game bundle is versioned as one immutable release unit. Build it in its source repository, replace the complete `public/game/` directory, and update `public/game/release.json` with the exact source commit. Never mix HTML from one game build with JS, CSS or PNG files from another.

## Current Unified Cinema release

- Public URL: `https://thongphan.com`
- Source commit: `17b82c3`
- Preview deployment: `a34fada0-02d7-4f1b-841e-a57bceeeb707`
- Preview URL: `https://a34fada0.thongphan-com.pages.dev`
- Production deployment: `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`
- Production origin: `https://802dbe32.thongphan-com.pages.dev`
- Pre-release rollback deployment: `cde8137c-c82d-4f36-9f67-d849da739902`
- Homepage HTML SHA-256: `63411f0c1b29e8c84a153905f5f7a87d88879b8f9cae50597c3808fb544040df`
- Release verification: 84 functional contracts, TypeScript, 54-page export, release budgets, preview Browser QA and production Browser smoke all pass.

`read.thongphan.com` is retired. Worker `thongphan-read` was deleted only after the main production smoke passed. The subdomain now returns HTTP 530 and no redirect; never recreate it as a 301/302 migration layer.

## Pending Learn public release candidate

- Local routes: `/learn`, `/learn/free`, `/learn/diagnostic` and
  `/learn/courses/{ai-foundation,prompt-thinking,evaluate-verify}`.
- Static export: 60/60 pages; 88/88 functional contracts; TypeScript passed.
- Production dependency audit: zero finding.
- Browser evidence: `docs/qa/screenshots/learn-*.png` at 1440x900, 390x844
  and 320x568 with no eager-image failure or horizontal overflow.
- Public Learn must not be promoted until the learner PWA has an approved
  deployment and `learn.thongphan.com` resolves. The build defaults to that domain
  in production and accepts `NEXT_PUBLIC_LEARN_APP_URL` for an approved target.
- Prompt Thinking and Evaluate & Verify remain non-purchasable until immutable
  content packages and active offers exist in Learning Core.

## Cinema Chapters preview candidate

- Source commit: `29bcb9d2d212753065e3c8838875be694718d66e`.
- Preview deployment: `601a9129-8e2e-4736-a0e9-35049a911f6f`.
- Preview URL: `https://601a9129.thongphan-com.pages.dev`.
- Branch alias: `https://preview-29bcb9d.thongphan-com.pages.dev`.
- Previous production deployment retained for rollback:
  `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`.
- Production was not promoted because `learn.thongphan.com` does not resolve and
  the learner PWA has not passed its approved deployment gate.
- Verification report:
  `docs/releases/CINEMA_CHAPTERS_PREVIEW_RELEASE_REPORT.md`.

## Current Crown & Citadel release

- Production URL: `https://thongphan.com/game`
- Website release commit: `9fbe8293180c73bd958d057bf2c97a6154c6b1b4`
- Game source commit: `4b3730fa3c70de86848ed3caf503ab5e4debfb7c`
- Cloudflare Pages production deployment: `cde8137c-c82d-4f36-9f67-d849da739902`
- Previous rollback deployment: `9d4a1172-1a9d-4c23-b622-088a41d110b7`
- Preview deployment: `83022506-856e-467a-b17f-9bf7261cced8`
- Production verification on 2026-07-11: 69/69 game files returned HTTP 200; release manifest and fingerprinted CSS/JS matched the verified artifact; homepage, diagnostic, library, about and Conan Maker returned HTTP 200; Playwright completed policy change, food trade, road/house construction, first-turn resolution and schema 2 save/restore with no application or generated-asset errors.

The Pages origin applies `/game` → `/game/` as a 301. The custom `thongphan.com` router currently serves the same game index directly at `/game` with HTTP 200; both public forms are valid and load assets from `/game/assets/`.

## Required release gate

Run from the repository root:

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:release
git diff --check
```

All commands must exit 0 before a deployment artifact is handed to Cloudflare Pages.

## Asset and cache rules

1. HTML may change at the same route; fingerprinted JS, CSS, font and image bytes may not change under an existing immutable URL.
2. Every modified immutable asset gets a new filename. Never overwrite a previous hash.
3. Deploy the complete `out/` directory atomically. Do not upload selected files over an older release.
4. `scripts/static-route-contract.test.mjs` locks the captured `/conanmaker/` JS/CSS fingerprints and checks local references.
5. `scripts/homepage-build-contract.test.mjs` checks the built homepage, local asset references, hero budgets and homepage-only JavaScript budget.
6. The release artifact must retain `out/conanmaker/index.html`, its referenced assets and the canonical trailing-slash redirect.
7. `public/_headers` must ship immutable caching for fingerprinted Next assets and fail-closed noindex headers for the three legacy surfaces.
8. The release artifact must retain `out/game/index.html`, all 65 generated runtime PNGs, `/game/`-scoped JS/CSS references and the `/game` → `/game/` redirect.

## Current performance budgets

- Desktop hero plate: at most 180 KB; current source is about 92 KB.
- Mobile hero plate: at most 180 KB; current source is about 81 KB.
- Outer film frame: at most 350 KB; current source is about 286 KB.
- Each remaining hero decoration stays below 80 KB; the current film texture, stamp, signature and arrow all pass.
- Homepage-only interaction JavaScript: at most 35 KB gzip; current build is about 8.3 KB gzip.
- No hero video.

## Pre-deploy smoke checks

Serve `out/` with clean-URL support and verify:

- `/` renders one semantic `h1` and no framework overlay;
- `/diagnostic`, `/learn`, `/learn/diagnostic`, `/learn/free`, `/library`, `/about`
  and `/conanmaker/` resolve;
- `/game/` loads the title screen, all runtime assets resolve below `/game/assets/`, and `/game` redirects canonically;
- homepage mobile menu opens, traps focus, closes on Escape and restores focus;
- the three-question mirror returns a result and correct destination;
- the proof rail scrolls with ArrowLeft/ArrowRight;
- browser console has no relevant errors or warnings;
- desktop and mobile have no horizontal overflow.

## Preview and production promotion

Capture the current production deployment before uploading anything:

```bash
npx wrangler pages deployment list --project-name thongphan-com
```

Deploy the verified `out/` directory to a preview branch named after the release commit:

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch preview-<commit> --commit-hash <commit>
```

Run the complete Browser smoke matrix against the returned preview URL. Promote the exact same source commit and rebuilt artifact only after preview passes:

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash <commit>
```

Record the preview URL, production URL, source commit, deployment identifiers and served asset fingerprints in the release QA report.

## Rollback

Rollback means redeploying the complete previous Cloudflare Pages artifact or previous known-good commit. Do not restore only HTML while keeping a mismatched collection of mutable assets.

The release report must contain the previous deployment identifier before production promotion. If it cannot be captured, production promotion is blocked.

## Authorization boundary

Building and verifying a release candidate does not authorize a production deployment. Production publish, custom-domain change, cache purge or Cloudflare configuration change requires an explicit user request.
