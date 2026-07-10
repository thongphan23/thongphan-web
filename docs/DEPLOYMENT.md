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

## Required release gate

Run from the repository root:

```bash
npm ci
npm test
npx tsc --noEmit
npm run build
npm run test:build
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
7. The release artifact must retain `out/game/index.html`, all 65 generated runtime PNGs, `/game/`-scoped JS/CSS references and the `/game` → `/game/` redirect.

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
- `/diagnostic`, `/library`, `/about` and `/conanmaker/` resolve;
- `/game/` loads the title screen, all runtime assets resolve below `/game/assets/`, and `/game` redirects canonically;
- homepage mobile menu opens, traps focus, closes on Escape and restores focus;
- the three-question mirror returns a result and correct destination;
- the proof rail scrolls with ArrowLeft/ArrowRight;
- browser console has no relevant errors or warnings;
- desktop and mobile have no horizontal overflow.

## Rollback

Rollback means redeploying the complete previous Cloudflare Pages artifact or previous known-good commit. Do not restore only HTML while keeping a mismatched collection of mutable assets.

## Authorization boundary

Building and verifying a release candidate does not authorize a production deployment. Production publish, custom-domain change, cache purge or Cloudflare configuration change requires an explicit user request.
