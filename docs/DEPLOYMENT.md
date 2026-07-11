# thongphan.com Deployment Contract

## Source of truth

- Application source: this repository.
- Frontend build command: `npm run build`.
- Cloudflare Pages output: `out/`, as declared by `pages_build_output_dir = "out"` in `wrangler.toml`.
- Static Conan Maker route source: `public/conanmaker/`.
- Canonical redirect source: `public/_redirects`.

Do not patch the generated production output or upload a manual homepage build that is absent from this repository.

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
npx wrangler pages deploy out --project-name thongphan-com --branch preview-<commit>
```

Run the complete Browser smoke matrix against the returned preview URL. Promote the exact same source commit and rebuilt artifact only after preview passes:

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch main
```

Record the preview URL, production URL, source commit, deployment identifiers and served asset fingerprints in the release QA report.

## Rollback

Rollback means redeploying the complete previous Cloudflare Pages artifact or previous known-good commit. Do not restore only HTML while keeping a mismatched collection of mutable assets.

The release report must contain the previous deployment identifier before production promotion. If it cannot be captured, production promotion is blocked.

## Authorization boundary

Building and verifying a release candidate does not authorize a production deployment. Production publish, custom-domain change, cache purge or Cloudflare configuration change requires an explicit user request.
