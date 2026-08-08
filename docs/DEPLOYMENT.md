# thongphan.com Deployment Contract

## Source of truth

- Application source: this repository.
- Frontend build command: `npm run build`.
- Cloudflare Pages output: `out/`, as declared by `pages_build_output_dir = "out"` in `wrangler.toml`.
- Static Conan Maker route source: `public/conanmaker/`.
- Static Crown & Citadel route source: `public/game/`, built from the `crown-and-citadel` repository with `npm run build:site`.
- Canonical redirect source: `public/_redirects`.
- Custom-domain router source: `workers/thongphan-router.mjs`, deployed with
  `wrangler.router.toml`.

Do not patch the generated production output or upload a manual homepage build that is absent from this repository.

The game bundle is versioned as one immutable release unit. Build it in its source repository, replace the complete `public/game/` directory, and update `public/game/release.json` with the exact source commit. Never mix HTML from one game build with JS, CSS or PNG files from another.

## Current site production release

- Public URL: `https://thongphan.com`
- Release: Content Workflow 7 Days completion patch
- Pages source commit: `5cc5cc83739754139a33275431ef69474141d2df`
- Preview deployment: `e981f028-9ef6-431c-bfea-608a86fb77aa`
- Preview URL: `https://e981f028.thongphan-com.pages.dev`
- Production deployment: `40603e1e-45ee-40c2-87bd-1974aaab64e2`
- Production origin: `https://40603e1e.thongphan-com.pages.dev`
- Pre-release rollback deployment: `8c0f6b38-0475-4aed-8eea-017b300d4fa6`
- Release verification: 486/486 functional contracts, TypeScript, lint, 91-page
  static export and the full release gate passed. The complete browser workflow
  passed locally, on preview and on apex at four viewports; origin, apex and `www`
  returned 30/30 route checks and converged to the same verified artifact.
- Full evidence: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`.

## Experience Hub release baseline

- Public URL: `https://thongphan.com`
- Pages source commit: `b2aa9d9`
- Preview deployment: `0d49e550-1f79-4afa-9f41-5a675fc59723`
- Preview URL: `https://0d49e550.thongphan-com.pages.dev`
- Production deployment: `3bc101dc-4c23-4c3b-9b4b-5afe46a6e2d8`
- Production origin: `https://3bc101dc.thongphan-com.pages.dev`
- Pre-release rollback deployment: `faa9aeae-e548-4757-8ec8-44b412055866`
- Router source commit: `19e8dab`
- Router production version: `dfaaca5d-7019-4f1d-9959-e607f519248b`
- Router rollback version: `d6a877e3-2bee-40ab-ab41-ade7dfe0db4b`
- Homepage HTML SHA-256: `26bafb1b2834849f46bb1bcadb87a83dbe27e2dce959b5a7431077175ecf2fcf`
- Experience HTML SHA-256: `5ed23c3d39d7e4b6e66d265434a745d3f68aa6bfb06bf4406797190ab7af6a32`
- Release verification: 242 functional contracts, TypeScript, 82-route export,
  full release gate, six-case Learn matrix, responsive visual QA, preview QA and
  production smoke all pass.
- Full evidence:
  `docs/releases/HOMEPAGE_POLISH_PRODUCTION_RELEASE_REPORT-2026-07-14.md` and
  `docs/releases/EXPERIENCE_HUB_PRODUCTION_RELEASE_REPORT.md`.

`read.thongphan.com` is retired. Worker `thongphan-read` was deleted only after the main production smoke passed. The subdomain now returns HTTP 530 and no redirect; never recreate it as a 301/302 migration layer.

## Pending Learn public release candidate

- Local routes: `/learn`, `/learn/free`, `/learn/diagnostic` and
  `/learn/courses/{ai-foundation,prompt-thinking,evaluate-verify}`.
- Static export: 82/82 pages in both release modes; 238/238 functional contracts;
  TypeScript passed.
- Production dependency audit: zero finding.
- Browser evidence: `docs/qa/screenshots/learn-*.png` at 1440x900, 390x844
  and 320x568 with no eager-image failure or horizontal overflow.
- Public Learn must not be promoted until the learner PWA has an approved
  deployment and `learn.thongphan.com` resolves. The build defaults to that domain
  in production and accepts `NEXT_PUBLIC_LEARN_APP_URL` for an approved target.
- Prompt Thinking and Evaluate & Verify remain non-purchasable until immutable
  content packages and active offers exist in Learning Core.
- Public navigation, sitemap and journey recommendations exclude Learn while the
  release flag is off. Cloudflare returns HTTP 404 with `noindex, nofollow` for all
  `/learn` paths.

### Learn release flags

Learn has two independent, fail-closed release controls. Both compare their value to
the exact string `true`; neither flag substitutes for the other:

- `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=true` is a build-time flag. It includes the Learn
  pages, card and navigation in the static export.
- `LEARN_PUBLIC_ENABLED=true` is a Cloudflare Pages runtime binding. It allows the
  `/learn/*` Pages Function to call `context.next()` and serve those static assets.
  When the binding is missing or any value other than `true`, the Function returns the
  disabled HTTP 404 with `noindex, nofollow`.

A public release must build with the first flag and configure the second binding on
the same Pages environment. Verify the local contract with
`npm run test:learn-pages-preview`. The command creates distinct Learn-disabled and
Learn-enabled artifacts, previews each artifact with runtime `true`, `false` and a
missing binding, and rejects both incoherent build/runtime combinations. The enabled
pair must return indexable HTTP 200 documents with exact canonical, title and H1
contracts for `/learn` and `/learn/free`; the disabled pair must return the fail-closed
HTTP 404 with `noindex, nofollow`. Discovery links are checked as real DOM anchors,
not text that happens to exist in a React payload. The command restores the caller's
pre-existing `out/` directory after the matrix completes.

The matrix acquires the worktree-level `.learn-pages-preview.lock` directory
atomically before inspecting or moving `out/`. A concurrent invocation fails without
reading or changing the owner workspace. Signal handlers are armed before lock
acquisition; `SIGINT` and `SIGTERM`, including immediately after atomic ownership,
stop owned build and Wrangler process groups, restore the original `out/` tree and
remove only the owned lock with conventional exit codes 130 and 143.

The lock is fail-closed: an unknown existing lock is never removed automatically. If
a process is interrupted by `SIGKILL` or a machine failure, inspect
`.learn-pages-preview.lock/owner.json` and verify that its PID is inactive. When
`workspace/original-out` exists, restore that directory before removing the stale
lock; when `hadOriginalOut` is false, remove the generated `out/` instead. If owner
state or snapshot state is ambiguous, stop and investigate rather than deleting the
lock.

## Cinema Chapters release history

- Source commit: `29bcb9d2d212753065e3c8838875be694718d66e`.
- Preview deployment: `601a9129-8e2e-4736-a0e9-35049a911f6f`.
- Preview URL: `https://601a9129.thongphan-com.pages.dev`.
- Branch alias: `https://preview-29bcb9d.thongphan-com.pages.dev`.
- Previous production deployment retained for rollback:
  `802dbe32-6d0a-4b9f-8c9e-d874a5275e24`.
- This first preview exposed the unavailable Learn dependency. The final release
  fail-closes Learn and was promoted through preview `2b34c806` to production
  `f6370989`.
- Verification reports: `docs/releases/CINEMA_CHAPTERS_PREVIEW_RELEASE_REPORT.md`
  and `docs/releases/CINEMA_CHAPTERS_PRODUCTION_RELEASE_REPORT.md`.

## Current Crown & Citadel release

- Production URL: `https://thongphan.com/game`
- Website release commit: `9fbe8293180c73bd958d057bf2c97a6154c6b1b4`
- Game source commit: `4b3730fa3c70de86848ed3caf503ab5e4debfb7c`
- Cloudflare Pages production deployment: `cde8137c-c82d-4f36-9f67-d849da739902`
- Previous rollback deployment: `9d4a1172-1a9d-4c23-b622-088a41d110b7`
- Preview deployment: `83022506-856e-467a-b17f-9bf7261cced8`
- Production verification on 2026-07-11: 69/69 game files returned HTTP 200; release manifest and fingerprinted CSS/JS matched the verified artifact; homepage, diagnostic, library, about and Conan Maker returned HTTP 200; Playwright completed policy change, food trade, road/house construction, first-turn resolution and schema 2 save/restore with no application or generated-asset errors.

The Pages origin and the custom `thongphan.com` router both preserve `/game` →
`/game/` as a 301 and load assets from `/game/assets/`.

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

Serve the exact release artifact with clean-URL support and verify these checks in
every release mode:

- `/` renders one semantic `h1` and no framework overlay;
- `/diagnostic`, `/library`, `/about` and `/conanmaker/` resolve;
- `/game/` loads the title screen, all runtime assets resolve below `/game/assets/`, and `/game` redirects canonically;
- homepage mobile menu opens, traps focus, closes on Escape and restores focus;
- the three-question mirror returns a result and correct destination;
- the proof rail scrolls with ArrowLeft/ArrowRight;
- browser console has no relevant errors or warnings;
- desktop and mobile have no horizontal overflow.

Then verify the selected Learn state:

- Learn disabled: both controls are false/missing, `/learn/*` returns HTTP 404 with
  `noindex, nofollow`, and public discovery has no Learn anchors.
- Learn enabled: both controls are exact `true`; `/learn`, `/learn/diagnostic`,
  `/learn/free` and the three course routes resolve from the same enabled artifact,
  while `/learn` and `/learn/free` satisfy the exact indexable DOM/head contract.
- In both cases, run `npm run test:learn-pages-preview` and reject the release if the
  build-time and runtime controls are not aligned.

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
