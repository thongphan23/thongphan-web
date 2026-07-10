# Thông Phan Unified Cinema System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved Unified Cinema system across every in-scope `thongphan.com` route, merge the Read catalog into `/library`, refine the homepage, verify the complete experience, and promote the coherent result to production.

**Architecture:** Keep Next.js 16 App Router and static export. A typed route-mode map drives one universal `SiteChrome` and three presentation modes: Cinema Dark, Evidence Dossier, and Editorial Light. Content stays build-time generated; 13 reading packages are validated into a server-only catalog, while search, reader controls, dialogs, and filters are small client islands. Existing routes migrate behind an explicit feature map so unfinished surfaces never inherit half-migrated global styling.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, CSS Modules, `next/font`, native browser APIs, `lucide-react` (the only approved new visual dependency), Node test runner through `tsx`, Cloudflare Pages static hosting, in-app Browser for rendered QA, ImageGen for the physical stamp/decorative raster assets only.

## Global Constraints

- Source of truth: `docs/superpowers/specs/2026-07-10-thongphan-unified-cinema-system-design.md` and its selected Film Archive Editorial reference.
- Preserve the user-owned untracked Conan Maker files. Never add, remove, rename, format, or overwrite them.
- `/conanmaker/*` remains standalone. `/classic`, `/concept`, and `/co-che-tep-moi.html` remain legacy/noindex and stay out of navigation.
- Do not fabricate a person, testimonial, event, metric, proof, or rights claim. ImageGen may produce paper, film, texture, or stamp raster assets only.
- Do not publish a full translated reading unless `rightsStatus` is `public-domain`, `permission-confirmed`, or `licensed` with evidence in the package.
- Do not add a backend, account system, analytics vendor, CMS, proxy runtime, second frontend, WebGL, hero video, or another component/animation library.
- Use real icons from `lucide-react`; no emoji, hand-drawn SVG, CSS art, pseudo-element brand mark, fake seal, graph, radar, orb, or decorative dashboard.
- Root preloads only Be Vietnam Pro. Cormorant Garamond and Newsreader use `preload: false` and are requested only where their route mode applies.
- Each slice must pass focused tests, TypeScript, production build, Browser QA, and a preview checkpoint before the next shared migration step.
- Production promotion happens only after the complete in-scope route batch is coherent and rollback evidence exists.

## Acceptance Criteria

- All in-scope Next routes use the correct route mode, shared header/footer, lacquer focus state, and approved palette; no Garden/green/gold/electric-blue primary UI remains.
- `/library` has the selected Film Archive Editorial first viewport, three content lanes, four URL-backed filters, correct canonical metadata, and real 404s.
- All 13 reading packages are versioned and validated. Only rights-cleared packages render full bodies; source-link-only packages remain useful catalog/reader records without copied full text.
- Reader has static body, TOC, progress, focus mode, optional ready audio, bookmark, completion, source disclosure, and related reading; it does not bundle all article bodies into client JS.
- Homepage CTA does not collide with the filmstrip at target viewports. ACT 03 is 3-up and within one desktop viewport. Reel ships only if six sourced derivatives pass the manifest gate; otherwise the accepted static contact sheet remains.
- `390×844`, `834×1194`, `1280×800`, `1440×900`, and `1490×1060` have no horizontal overflow, clipped primary actions, broken images, or relevant console errors.
- Keyboard journeys, reduced motion, JSON-LD, sitemap/robots, bundle/font/image budgets, Cloudflare 404 behavior, production smoke, and visual side-by-side comparisons pass.

---

### Task 0: Lock release safety, rights gates, and current route contracts

**Files:**
- Create: `scripts/unified-cinema-contract.test.mjs`
- Create: `scripts/reading-rights-audit.mjs`
- Create: `docs/reading-rights-report-2026-07-10.md`
- Modify: `package.json`
- Modify in Read source: `/Users/rio/Projects/thongphan-read/index.html`
- Create in Read source: `/Users/rio/Projects/thongphan-read/public/robots.txt`
- Create in Read source: `/Users/rio/Projects/thongphan-read/public/_headers`
- Preserve: `public/conanmaker/**`

**Interfaces:**
- `routeModeForPath(pathname): SiteRouteMode` is specified by tests before implementation.
- Rights report lists all 13 slugs and one of the five approved `rightsStatus` values with source evidence.
- Read preview returns `noindex, nofollow` in markup, robots, and response headers until retirement.

- [ ] **Step 1: Capture rollback evidence and current checksums**

Run `git status --short`, `git rev-parse HEAD`, `shasum -a 256 public/conanmaker/index.html public/conanmaker/assets/index-fF5i7DFq.js public/conanmaker/assets/index-DPgHELtg.css`, and save output under `/tmp/thongphan-unified-cinema-rollback-20260710/`. Expected: current commit and referenced Conan fingerprint are captured; user-owned untracked files remain visible and untouched.

- [ ] **Step 2: Write the failing system contract**

Assert the exact path-to-mode table, shared primary navigation, no nested `<main>` on diagnostic/chat, banned Garden imports on migrated routes, legacy noindex, library/read routes, sitemap/robots presence, rights enum, and the exact four filter labels/URL params. Add the test to `npm test` and run it. Expected: RED because the route map, reading routes, shared tokens, and metadata files do not exist.

- [ ] **Step 3: Audit all 13 reading rights and media truthfully**

Generate `docs/reading-rights-report-2026-07-10.md` from the Read source data. Every row contains slug, author, original URL, translation/body status, media count, local/hotlinked media, rights evidence, public mode, and remediation. Unknown or ordinary copyrighted sources default to `source-link-only`; no optimistic inference is allowed. Run `node scripts/reading-rights-audit.mjs`; expected: 13 unique rows and zero invalid enum values.

- [ ] **Step 4: Put the old Read runtime behind noindex**

Add `<meta name="robots" content="noindex, nofollow">`, a disallow-all `robots.txt`, and `_headers` with `X-Robots-Tag: noindex, nofollow`. Build Read and verify the generated `dist` contains all three controls. Deploy the temporary safety release only after local verification, then use `curl -I` and `curl` to confirm header + meta.

- [ ] **Step 5: Commit safety contracts**

Commit only main-repo tests/report/package changes as `test: lock unified Cinema release contracts`. Record the independent Read safety deploy in its `docs/STATUS.md` because that directory is not a Git worktree.

### Task 1: Build shared brand tokens, route modes, fonts, and universal chrome

**Files:**
- Create: `styles/brand-tokens.css`
- Create: `lib/site-route-mode.ts`
- Create: `scripts/site-route-mode.test.ts`
- Replace: `components/site-chrome/SiteChrome.tsx`
- Replace: `components/site-chrome/SiteChrome.module.css`
- Modify: `app/layout.tsx`
- Modify: `styles/globals.css`
- Retire after all consumers pass: `app/layout.module.css`
- Add dependency: `lucide-react`

**Interfaces:**
- `type SiteRouteMode = 'standalone' | 'cinema-dark' | 'evidence-dossier' | 'editorial-light' | 'legacy' | 'default'`.
- `routeModeForPath(pathname)` uses exact matching before prefix matching.
- `SiteChrome` exposes one main landmark, a complete primary menu, a homepage-only chapter nav, and one footer.

- [ ] **Step 1: TDD the route matcher**

Write table tests for every specified exact/prefix route plus unknown paths. Run `npx tsx --test scripts/site-route-mode.test.ts`; expected RED because the module is absent. Implement the smallest pure matcher and rerun; expected GREEN.

- [ ] **Step 2: Add semantic tokens and route-scoped typography**

Define only the approved ink, paper, lacquer, line, focus, spacing, and motion primitives. Replace root font declarations with Be Vietnam Pro plus non-preloaded Cormorant and Newsreader variables. Do not globally flip old route consumers until their feature-map flag is active.

- [ ] **Step 3: Replace dual chrome with the universal shell**

Implement the five-link primary nav, route-themed header, one accessible mobile dialog, one footer, and homepage chapter nav. Preserve focus trap, Escape, body lock, and focus restoration. Use Lucide icons for menu/close/arrows only. Remove the CSS logo mark and default Garden atmosphere.

- [ ] **Step 4: Verify foundation**

Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Browser-check menu keyboard behavior on `/`, `/library`, and `/diagnostic` at desktop/mobile. Expected: one `main`, complete nav, correct theme, zero console errors.

- [ ] **Step 5: Commit foundation**

Commit as `feat: establish unified Cinema foundation` without staging any Conan Maker untracked file.

### Task 2: Ingest 13 reading packages with deterministic validation

**Files:**
- Create: `content/readings/<slug>/article.json` for all 13 slugs
- Create: `content/readings/<slug>/rights.json` for fail-closed text publication evidence
- Create: `content/readings/<slug>/image-pack.json` for source, license, derivative, and checksum evidence
- Create: `public/images/readings/<slug>/*` for localized, rights-allowed media
- Create: `public/audio/readings/<slug>/*` only for existing ready audio
- Create: `scripts/migrate-readings.mjs`
- Create: `scripts/generate-readings-data.mjs`
- Create: `scripts/validate-reading-rights.mjs`
- Create: `scripts/materialize-reading-assets.mjs`
- Create: `scripts/generate-readings-data.test.mjs`
- Create: `lib/readings.ts`
- Generate: `lib/readings-data.generated.ts`
- Modify: `package.json`

**Interfaces:**
- `ReadingRightsStatus`, `ReadingBlock`, `ReadingImage`, `ReadingAudio`, `ReadingArticle`, and `ReadingSummary` are exported from `lib/readings.ts`.
- `getAllReadingSummaries()`, `getPublicReadings()`, `getReadingBySlug(slug)`, and `getReadingSlugs()` never expose a blocked package or a forbidden full body.
- Packages include content/media checksums and exact canonical `/library/read/<slug>`. `rights.json` defaults to summary/source-link mode and can only move to full text when translation, public-web, and commercial-context rights all pass.

- [ ] **Step 1: Write validation tests before migration**

Test 13 unique slugs, approved enum values, required source/credit fields, deterministic topic/intent/duration adapters, checksum stability, local-only media URLs, no full sections for source-link-only/blocked packages, and no hotlinks. Add parity assertions for title, author, source URL, section count, and block count against the old source without exposing those bodies in generated public data. Expected RED before packages and generator exist.

- [ ] **Step 2: Implement one-package migration and prove the schema**

Migrate Steve Jobs first from Read into the normalized package. Apply the rights report literally. Run the focused generator test and inspect the generated TypeScript to ensure full body stays server/static data and is absent when not rights-cleared.

- [ ] **Step 3: Migrate the remaining 12 packages**

Use the migration script for structured data; do not hand-copy 13,000 lines into a client source file. Create all 13 packages in fail-closed summary/source-link mode because the current audit found zero full-text-cleared records. Localize only media that passes source/license rules. Add checksums and credit/source records. Run the validator after each batch of three packages.

- [ ] **Step 4: Integrate generation into dev/build/test**

Add `generate-readings` before Next dev/build and include the generator tests in `npm test`. Run two consecutive generations and assert `git diff --exit-code lib/readings-data.generated.ts` on the second run.

- [ ] **Step 5: Commit content ingestion**

Commit as `feat: ingest validated reading packages` with the rights report and permitted localized assets.

### Task 3: Build the Unified Library hub, discovery, and long-form reader

**Files:**
- Replace: `app/library/page.tsx`
- Replace: `app/library/page.module.css`
- Replace: `app/library/LibraryFiltersClient.tsx`
- Create: `components/library/LibraryDiscovery.tsx`
- Create: `components/library/LibraryDiscovery.module.css`
- Create: `components/editorial/EditorialMasthead.tsx`
- Create: `components/editorial/ArticleHeader.tsx`
- Create: `components/editorial/ArticleMeta.tsx`
- Create: `components/editorial/ArticleBody.tsx`
- Create: `components/editorial/ArticleTOC.tsx`
- Create: `components/editorial/EditorialFigure.tsx`
- Create: `components/editorial/SourceDisclosure.tsx`
- Create: `components/editorial/ReadNext.tsx`
- Create: `components/editorial/Editorial.module.css`
- Create: `components/library/ReadingToolbar.tsx`
- Create: `components/library/ReadingToolbar.module.css`
- Create: `app/library/read/page.tsx`
- Create: `app/library/read/page.module.css`
- Create: `app/library/read/[slug]/page.tsx`
- Create: `app/library/read/[slug]/page.module.css`
- Modify: `app/library/[slug]/page.tsx`
- Modify: `app/library/[slug]/LibraryArticle.tsx`
- Modify: `app/library/[slug]/page.module.css`
- Modify: `app/blog/page.tsx`, `app/blog/page.module.css`
- Modify: `app/blog/[slug]/page.tsx`, `app/blog/[slug]/BlogArticle.tsx`, `app/blog/[slug]/BlogPostClient.tsx`, `app/blog/[slug]/page.module.css`
- Create: `scripts/library-discovery.test.ts`
- Create: `scripts/editorial-contract.test.mjs`

**Interfaces:**
- One normalized `LibraryEntrySummary` adapter unifies readings, blog posts, and living notes for discovery without flattening their body schemas.
- URL state is exactly `q`, `type`, `topic`, `duration`, and `intent`.
- Local storage keys are `tp:library:saved:v1` and `tp:library:completed:v1`.
- `dynamicParams = false` and `generateStaticParams()` cover every public reading slug.

- [ ] **Step 1: TDD the normalized discovery adapter**

Test the three content types, exact four filter groups, three intent labels, deterministic duration buckets, topic normalization, query matching, URL serialization, and clear behavior. Expected RED before adapter/client changes.

- [ ] **Step 2: Implement the selected first viewport**

Recreate the approved Film Archive Editorial proportions: black masthead, archival paper, exact headline, concise support copy, featured Steve Jobs record, two primary lanes, thin real film raster, then the Blog lane immediately below. Use actual catalog counts/content only; no fake metrics or graph.

- [ ] **Step 3: Implement URL-backed discovery**

Use native inputs/buttons and `useSearchParams`/router replacement. Search/filter updates the URL, preserves keyboard focus, and clears all five params. Do not render internal labels such as Catalog, Status, Growing, or Section.

- [ ] **Step 4: Implement static reader and client toolbar**

Build metadata, JSON-LD, source disclosure, TOC, article blocks/figures, related readings, and source-link-only state on the server. Keep only progress, focus, ready audio, bookmark, and completion in the client toolbar. Focus mode must not hide source attribution or essential controls irreversibly.

- [ ] **Step 5: Bring living notes and blog into the shared editorial system**

Preserve all existing canonical URLs and content generation. Replace decorative graph with typed relation lists. Keep note/blog reading functionality while eliminating Garden styling and duplicate article-shell CSS.

- [ ] **Step 6: Verify library slice**

Run focused tests, `npm test`, `npx tsc --noEmit`, and `npm run build`. Check generated HTML per reading, absence of all-body client bundle, real local 404, metadata/canonical/JSON-LD, filter URL round trip, toolbar keyboard flow, localStorage keys, and target viewports in Browser.

- [ ] **Step 7: Commit library slice**

Commit as `feat: unite the Film Archive library`.

### Task 4: Refine homepage assets, reel, hero, and ACT 03

**Files:**
- Create: `content/homepage/homepage-proof-assets.json`
- Create: `lib/homepage-proof-assets.ts`
- Create: `scripts/homepage-proof-assets.test.ts`
- Create: `components/home-cinema/HomeFilmReel.tsx`
- Create: `components/home-cinema/ProofContactSheet.tsx`
- Create: `public/images/homepage/evidence-cinema-stamp-v4.png`
- Create when source gate passes: `public/images/homepage/reel/*-16x9-v1.webp`
- Create when source gate passes: `public/images/homepage/proof/*-3x2-v1.webp`
- Modify: `components/home-cinema/HomeCinema.tsx`
- Modify: `components/home-cinema/HomeCinema.module.css`
- Modify: `components/home-cinema/home-cinema-content.ts`
- Modify: `components/home-cinema/ProofImage.tsx`
- Modify: `components/ScrollAnimations.tsx`
- Replace after migration: `components/home-cinema/ProofRail.tsx`
- Modify: `scripts/homepage-cinematic-contract.test.mjs`
- Modify: `scripts/homepage-build-contract.test.mjs`

**Interfaces:**
- Manifest records `id`, `kind`, source/right, SHA-256, derivative path, width/height, focal point, alt, caption, and proof statement.
- `HomeFilmReel` duplicates the visual track with the duplicate `aria-hidden` and disables autoplay for touch/reduced motion.
- `ProofContactSheet` is 3-up desktop, 2-plus tablet, 1.1-up mobile, and opens an accessible evidence dialog/drawer.

- [ ] **Step 1: Generate and QA the physical stamp asset**

Use ImageGen for distressed ink texture only, composite the exact Vietnamese wording if necessary, export RGBA at least `1024×1024`, verify spelling at render size, and remove every CSS brightness/saturate filter. Run image dimension/alpha/budget tests.

- [ ] **Step 2: Inventory real proof photos and create derivatives**

Search approved local source assets first. Create face-safe 16:9 and 3:2 derivatives without altering people/evidence. The manifest test must fail if fewer than six reel or three proof assets meet source, rights, checksum, aspect, focal point, and size budgets.

- [ ] **Step 3: Implement the reel with the specified gate**

If and only if six assets pass, ship the 30–45s loop, hover/focus pause, lazy loading, touch static mode, and reduced-motion static mode. If the gate fails, retain the approved static contact sheet and record the blocker without faking the missing evidence.

- [ ] **Step 4: Compact hero and ACT 03**

Anchor hero copy above the reel with `bottom`, accept per-image focal points, and render ACT 03 within the exact desktop dimensions. Add manual rail controls and evidence detail dialog/drawer with focus trap, Escape, and focus restore.

- [ ] **Step 5: Verify homepage**

Run manifest, content, cinematic, build-budget, TypeScript, and production-build tests. In Browser measure CTA/reel separation and ACT 03 section/card dimensions at all specified viewports; test keyboard/touch/reduced motion and visually inspect face crops.

- [ ] **Step 6: Commit homepage refinement**

Commit as `feat: refine Cinema proof experience`.

### Task 5: Migrate direct-entry and product routes to the same visual system

**Files:**
- Replace styling/markup as needed: `app/about/page.tsx`, `app/about/page.module.css`
- Modify: `app/diagnostic/page.tsx`, `app/diagnostic/DiagnosticClient.tsx`, `app/diagnostic/page.module.css`
- Modify: `app/assets/page.tsx`, `app/assets/page.module.css`, `app/assets/[slug]/page.tsx`, `app/assets/[slug]/page.module.css`
- Modify: `app/challenges/page.tsx`, `app/challenges/page.module.css`, `app/challenges/[slug]/page.tsx`, `app/challenges/[slug]/page.module.css`
- Modify: `app/chat/page.tsx`, `app/chat/page.module.css`
- Create: `components/dossier/DossierHeader.tsx`
- Create: `components/dossier/DossierFolio.tsx`
- Create: `components/dossier/Dossier.module.css`
- Create: `scripts/subpage-cinema-contract.test.mjs`

**Interfaces:**
- Business logic, question order, result mapping, prices, offers, challenge steps, and chat API contract remain unchanged.
- All pages use the shared mode tokens and one outer main landmark.

- [ ] **Step 1: Add failing route-by-route visual/semantic contracts**

Lock one h1/main, banned Garden/CSS-art motifs/imports, palette, primary CTA count, and required functionality for each route. Expected RED before migration.

- [ ] **Step 2: Migrate `/about`, `/diagnostic`, and direct-entry blog surfaces**

Build the Cinema origin story and Dossier diagnostic shell while preserving content/logic. Remove rotated 3D console, radar, halo, and nested main. Browser-test diagnostic completion and CTA.

- [ ] **Step 3: Migrate `/assets/*`, `/challenges/*`, and `/chat`**

Apply physical dossier/calendar/evidence-desk composition with shared primitives and Lucide controls. Preserve catalog/product data, challenge activation, chat submission, empty/loading/error states, and all current links.

- [ ] **Step 4: Remove old shared Garden system only after all consumers pass**

Delete `GardenSignature`, `BrandGlyph`, old atmosphere/logo CSS, and dead green/gold variables/imports. Confirm `rg` finds no banned visual dependency on migrated public routes; legacy routes may retain isolated CSS but cannot load it globally.

- [ ] **Step 5: Verify and commit route migration**

Run all tests/build, then Browser QA every index/detail route at desktop/mobile including form/chat behavior. Commit as `feat: unify Cinema subpage experience`.

### Task 6: Upgrade the Thông Phan Read publishing plugin contract

**Files:**
- Modify under `/Users/rio/plugins/thong-phan-read`: router/skills/scripts/validators/README/AGENTS files that still encode `read.thongphan.com/doc/`
- Sync the active marketplace/cache package after source validation
- Add/update plugin contract tests according to the plugin's own validator

**Interfaces:**
- Published canonical is exactly `https://thongphan.com/library/read/<slug>`.
- Generated package target is `/Users/rio/thongphan-com/content/readings/<slug>/article.json` with localized media folders.
- No command deploys the old Vite Read runtime after main release.

- [ ] **Step 1: Write a failing canonical/output-path contract in the source plugin**

Search every hardcoded old domain/path, then add validator assertions for the main canonical and package output. Run the source validator and confirm RED.

- [ ] **Step 2: Update the smallest coherent plugin flow**

Change routing, package creation, validation, deployment handoff, backlink target, and docs. Preserve Google Sheet as operational input and the existing writeback/readback gate. Do not claim Sheet write success if credentials still return 403.

- [ ] **Step 3: Validate, sync active cache, and fresh-invoke**

Run the plugin validator, sync marketplace/cache using the established local packaging flow, start a fresh invocation, and verify one dry package points into the main repo with the new canonical. Record exact active version and evidence.

- [ ] **Step 4: Commit plugin source separately if it is a Git worktree; otherwise record an explicit file-level handoff**

### Task 7: Full QA, bundle audit, preview, production promotion, and Read retirement

**Files:**
- Modify: `scripts/qa-site.mjs`
- Create: `scripts/seo-contract.test.mjs`
- Create: `scripts/bundle-budget.test.mjs`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create or modify legacy route metadata for noindex
- Update: `design-qa.md`
- Update: `docs/DEPLOYMENT.md`
- Create: `docs/superpowers/qa/2026-07-10-thongphan-unified-cinema-system.md`

**Interfaces:**
- QA matrix covers the five approved viewport sizes, all public route families, keyboard journeys, reduced motion, structured data, image failures, console, overflow, and bundle budgets.
- Production release has a captured previous deployment identifier and a verified rollback command.

- [ ] **Step 1: Make route/SEO/budget tests reproducible**

Test sitemap URLs, robots/legacy exclusions, canonical/OG/JSON-LD, Cloudflare 404 output, per-route JS/CSS sizes, first-view font requests, and image budgets. Run against `out/` after production build.

- [ ] **Step 2: Run the complete local release gate**

Run `npm test`, `npx tsc --noEmit`, `npm run build`, `npm run test:build`, SEO/bundle tests, `git diff --check`, and the full Browser matrix. Any failure returns to the owning slice; do not waive acceptance silently.

- [ ] **Step 3: Perform visual comparison, not screenshot-only QA**

At `1490×1060`, combine the selected reference and implementation screenshot in one comparison input, inspect typography, spacing, rules, image crops, paper/ink/lacquer proportions, fix visible mismatches, and repeat until documented pass. Repeat focused comparisons for homepage hero and ACT 03.

- [ ] **Step 4: Deploy a Cloudflare Pages preview and smoke it**

Deploy `out/` to `thongphan-com` preview with the release commit hash. Verify every route family, unknown reading 404, menu, library filters, reader controls, diagnostic, chat failure/success handling, Conan static route, cache-fingerprinted assets, and no broken images/console errors.

- [ ] **Step 5: Promote the coherent release to production**

Deploy the exact verified output to branch `main`, smoke `https://thongphan.com`, record deployment URL/hash, and compare the served asset fingerprints with the preview.

- [ ] **Step 6: Retire Read without redirects**

Only after main production passes, remove the `read.thongphan.com` custom domain/Worker route and verify the subdomain no longer serves the old content. Do not add 301/302. Preserve source data locally as migration provenance.

- [ ] **Step 7: Close documentation and commit**

Set `design-qa.md` final result to `passed`, update deployment/QA evidence and spec implementation status, commit as `docs: record Unified Cinema production verification`, and confirm `git status --short` contains only the four untouched user-owned Conan files.

## Self-review Checklist

- [ ] Every requirement in spec sections 6–22 maps to at least one task and verification step.
- [ ] Every new behavior starts with a failing automated contract or pure-function test.
- [ ] No step contains a placeholder, fabricated asset, or permission assumption.
- [ ] Rights, source truth, legacy exclusions, standalone Conan, and rollback boundaries are explicit.
- [ ] Plan preserves static export, build-time content, progressive enhancement, and route-specific performance budgets.
- [ ] Final release includes production evidence rather than a local-only completion claim.
