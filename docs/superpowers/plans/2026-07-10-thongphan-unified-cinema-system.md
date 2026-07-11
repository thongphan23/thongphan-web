# Thông Phan Unified Cinema System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

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
- Create: `scripts/read-release-safety.test.mjs`
- Create: `scripts/reading-rights-audit.mjs`
- Create: `docs/reading-rights-report-2026-07-10.md`
- Modify: `package.json`
- Modify in Read source: `/Users/rio/Projects/thongphan-read/index.html`
- Create in Read source: `/Users/rio/Projects/thongphan-read/public/robots.txt`
- Create in Read source: `/Users/rio/Projects/thongphan-read/public/_headers` (Workers Static Assets header rules)
- Preserve: `public/conanmaker/**`

**Interfaces:**
- Rights report lists all 13 slugs and one of the five approved `rightsStatus` values with source evidence.
- Read preview returns `noindex, nofollow` in markup, robots, and response headers until retirement.

- [x] **Step 1: Capture rollback evidence and current checksums**

Run `git status --short`, `git rev-parse HEAD`, `shasum -a 256 public/conanmaker/index.html public/conanmaker/assets/index-fF5i7DFq.js public/conanmaker/assets/index-DPgHELtg.css`, and save output under `/tmp/thongphan-unified-cinema-rollback-20260710/`. Expected: current commit and referenced Conan fingerprint are captured; user-owned untracked files remain visible and untouched.

- [x] **Step 2: Write the failing Slice 0 safety contract**

Assert exactly 13 rights rows, approved enum values, fail-closed default publication, Read meta robots, disallow-all robots file, and an `_headers` rule that yields `X-Robots-Tag: noindex, nofollow`. Run the focused test and confirm RED because the report/safety files are absent. Do not add a cross-slice RED test to `npm test`; every committed slice must be GREEN.

- [x] **Step 3: Audit all 13 reading rights and media truthfully**

Generate `docs/reading-rights-report-2026-07-10.md` from the Read source data. Every row contains slug, author, original URL, translation/body status, media count, local/hotlinked media, rights evidence, public mode, and remediation. Unknown or ordinary copyrighted sources default to `source-link-only`; no optimistic inference is allowed. Run `node scripts/reading-rights-audit.mjs`; expected: 13 unique rows and zero invalid enum values.

- [x] **Step 4: Put the old Read runtime behind noindex**

Add `<meta name="robots" content="noindex, nofollow">`, a disallow-all `robots.txt`, and `_headers` with `X-Robots-Tag: noindex, nofollow`. Cloudflare Workers Static Assets officially supports `_headers`; keep `wrangler.jsonc` asset-only and verify the rule is copied into `dist`. Run the focused safety test GREEN, build Read, deploy with `npm run deploy`, then use `curl -I https://read.thongphan.com/` and `curl -fsSL https://read.thongphan.com/` to confirm header + meta.

- [x] **Step 5: Commit safety contracts**

Commit only a GREEN main-repo safety test/report/package change as `test: lock reading release safety`. Record the independent Read safety deploy in its `docs/STATUS.md` because that directory is not a Git worktree.

### Task 1: Build shared brand tokens, route modes, fonts, and universal chrome

**Files:**
- Create: `styles/brand-tokens.css`
- Create: `lib/site-route-mode.ts`
- Create: `components/site-chrome/site-navigation.ts`
- Create: `components/site-chrome/SiteHeader.tsx`
- Create: `components/site-chrome/MobileMenu.tsx`
- Create: `components/site-chrome/SiteFooter.tsx`
- Create: `scripts/site-route-mode.test.ts`
- Replace: `components/site-chrome/SiteChrome.tsx`
- Replace: `components/site-chrome/SiteChrome.module.css`
- Modify: `app/layout.tsx`
- Modify: `styles/globals.css`
- Retire after all consumers pass: `app/layout.module.css`
- Add dependency: `lucide-react`

**Interfaces:**
- `type SiteRouteMode = 'standalone' | 'cinema-dark' | 'evidence-dossier' | 'editorial-light' | 'legacy' | 'default'`.
- `routeModeForPath(pathname)` uses exact matching before prefix matching. `isUnifiedRouteEnabled(pathname)` initially returns true only for `/`; each later slice enables its own route family in the same commit that makes that family GREEN. After Task 5 passes, the map becomes the default for all in-scope Next routes.
- `SiteChrome` exposes one main landmark, a complete primary menu, a homepage-only chapter nav, and one footer.

- [x] **Step 1: TDD the route matcher**

Write table tests for every specified exact/prefix route plus unknown paths. Run `npx tsx --test scripts/site-route-mode.test.ts`; expected RED because the module is absent. Implement the smallest pure matcher and rerun; expected GREEN.

- [x] **Step 2: Add semantic tokens and route-scoped typography**

Define only the approved ink, paper, lacquer, line, focus, spacing, and motion primitives. Replace root font declarations with Be Vietnam Pro plus non-preloaded Cormorant and Newsreader variables. Do not globally flip old route consumers until their feature-map flag is active.

- [x] **Step 3: Replace dual chrome with the universal shell**

Implement the five-link primary nav, route-themed header, one accessible mobile dialog, one footer, and homepage chapter nav. Write and watch a focused mobile-menu source/behavior contract fail before implementation; it covers focus trap, Escape, body lock, 44px targets, and focus restoration. Preserve the old shell behind `isUnifiedRouteEnabled` for all routes except `/`. Use Lucide icons for menu/close/arrows only. Remove the CSS logo mark and default Garden atmosphere only from the unified shell.

- [x] **Step 4: Verify foundation**

Run `npm test`, `npx tsc --noEmit`, and `npm run build`. Browser-check menu keyboard behavior on `/`, `/library`, and `/diagnostic` at desktop/mobile. Expected: one `main`, complete nav, correct theme, zero console errors.

- [x] **Step 5: Commit foundation**

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

- [x] **Step 1: Write validation tests before migration**

Test 13 unique slugs, approved enum values, required source/credit fields, deterministic topic/intent/duration adapters, checksum stability, local-only media URLs, no full sections for source-link-only/blocked packages, and no hotlinks. Add parity assertions for title, author, source URL, section count, and block count against the old source without exposing those bodies in generated public data. Expected RED before packages and generator exist.

- [x] **Step 2: Implement one-package migration and prove the schema**

Migrate Steve Jobs first from Read into the normalized package. Apply the rights report literally. Run the focused generator test and inspect the generated TypeScript to ensure full body stays server/static data and is absent when not rights-cleared.

- [x] **Step 3: Migrate the remaining 12 packages**

Use the migration script for structured data; do not hand-copy 13,000 lines into a client source file. Create all 13 packages in fail-closed summary/source-link mode because the current audit found zero full-text-cleared records. Localize only media that passes source/license rules. Add checksums and credit/source records. Run the validator after each batch of three packages.

- [x] **Step 4: Integrate generation into dev/build/test**

Add `generate-readings` before Next dev/build and include the generator tests in `npm test`. Run two consecutive generations and assert `git diff --exit-code lib/readings-data.generated.ts` on the second run.

- [x] **Step 5: Commit content ingestion**

Commit as `feat: ingest validated reading packages` with the rights report and permitted localized assets.

### Task 3: Build the Unified Library in three route-gated slices

The original Task 3 is split so no route receives the new shell before its content surface is migrated and verified. Static segments take precedence over `app/library/[slug]`, but the living-note generator must permanently reserve the slug `read`.

**Shared interfaces:**
- One normalized `LibraryEntrySummary` adapter unifies reading summaries, blog summaries, and living-note summaries without flattening any body schema.
- Discovery URL state is exactly `q`, `type`, `topic`, `duration`, and `intent`.
- Local storage keys are `tp:library:saved:v1` and `tp:library:completed:v1`.
- Build metadata is deterministic; never use the current build time as `lastModified`.
- `source-link-only` records are indexable summaries, never presented as full translations.

#### Task 3A: Library hub, discovery, and SEO foundation

**Files:**
- Create: `lib/library-discovery.ts`, `lib/structured-data.ts`
- Create: `components/library/LibraryDiscovery.tsx`, `components/library/LibraryDiscovery.module.css`
- Create: `components/editorial/EditorialMasthead.tsx`, `components/editorial/EditorialHero.tsx`, `components/editorial/Editorial.module.css`
- Replace: `app/library/page.tsx`, `app/library/page.module.css`
- Delete after replacement: `app/library/LibraryFiltersClient.tsx`
- Create: `app/sitemap.ts`, `app/robots.ts`
- Modify: `lib/site-route-mode.ts`, `scripts/site-route-mode.test.ts`
- Modify: `scripts/generate-library-data.mjs`, `scripts/generate-library-data.test.mjs`
- Create: `scripts/library-discovery.test.ts`, `scripts/editorial-contract.test.mjs`
- Modify: `package.json`

- [x] **Step 1: TDD the adapter and exact URL contract**

Test all three summary types, exact params, deterministic duration/topic/intent adapters, query matching, clear/serialize behavior, and rejection of living-note slug `read`. Keep `useSearchParams()` below `<Suspense>` for static export.

- [x] **Step 2: Recreate the approved first viewport**

Match the selected `1487×1058` Film Archive reference: black masthead, warm paper, exact headline `Một thư viện để đọc sâu, nghĩ rõ và làm ra thứ có giá trị.`, concise support copy, Steve Jobs featured record, the two primary lanes, a thin real film raster, and the Blog lane immediately after. The CTA is exactly `/library/read/steve-jobs-2005-stanford-commencement-address`. Do not use Garden/graph/fake metrics/CSS art/generated people. Because current reading media is uncleared, keep the featured record typography-first rather than inventing a portrait.

- [x] **Step 3: Add library-owned discovery and SEO**

Pass summary-only data to the client. Use native controls and router replacement while preserving focus. Add canonical `/library`, safe `CollectionPage`/`ItemList`, deterministic sitemap/robots for routes that already exist, and no unapproved OG image. Enable the unified shell for exact `/library` only.

- [x] **Step 4: Verify and commit 3A**

Run focused tests, `npm test`, TypeScript, build, HTML/structured-data scans, and Browser QA at desktop/mobile. Compare the implementation and selected reference at the same viewport. Commit as `feat: build Film Archive library hub` only after review is clean.

#### Task 3B: Reading index, static reader, and truthful toolbar

**Files:**
- Create: `app/library/read/page.tsx`, `app/library/read/page.module.css`
- Create: `app/library/read/[slug]/page.tsx`, `app/library/read/[slug]/page.module.css`
- Create editorial primitives: `ArticleHeader`, `ArticleMeta`, `ArticleBody`, `ArticleTOC`, `EditorialFigure`, `EditorialCallout`, `SourceDisclosure`, `ReadNext`, `CompletionReward`
- Create: `components/library/ReadingToolbar.tsx`, `components/library/ReadingToolbar.module.css`
- Create: `lib/reader-state.ts`; modify `lib/readings.ts`
- Create: `scripts/reader-state.test.ts`; extend `scripts/editorial-contract.test.mjs`
- Modify: `app/sitemap.ts`, `lib/site-route-mode.ts`, `scripts/site-route-mode.test.ts`, `package.json`

- [x] **Step 1: TDD static routing, reader state, and structured data**

Cover all 13 static params, `dynamicParams = false`, real `notFound()`, canonical/JSON-LD, source disclosure, bookmark/completion storage, focus/progress/audio states, and client bundle boundaries.

- [x] **Step 2: Build the truthful summary reader**

For the current 13 `source-link-only` packages, render only editorial summary/context, rights/source disclosure, related summaries, and the source CTA. Do not render translation bodies, images, audio, fake progress, or fake completion. Article JSON-LD omits `articleBody` and points to the source through `isBasedOn`. Full-reader controls exist only for a future package whose `publicationMode` is truly `full`.

- [x] **Step 3: Activate and verify reading routes**

Enable exact `/library/read` and prefix `/library/read/`; keep `/library/<living-note>` legacy. Update sitemap with non-blocked summaries, run focused/full tests, TypeScript, build, output/body-bundle scans, keyboard/mobile Browser QA, and preview-level 404 verification later. Commit as `feat: add truthful Film Archive reader` after clean review.

#### Task 3C: Living notes and Blog index in the shared Editorial system

**Files:**
- Modify: `app/library/[slug]/page.tsx`
- Replace: `app/library/[slug]/LibraryArticle.tsx`, `app/library/[slug]/page.module.css`
- Replace: `app/blog/page.tsx`, `app/blog/page.module.css`
- Modify as needed: `app/blog/BlogFiltersClient.tsx`
- Extend: `components/editorial/Editorial.module.css`, `scripts/editorial-contract.test.mjs`
- Modify: `lib/site-route-mode.ts`, `scripts/site-route-mode.test.ts`

- [x] **Step 1: TDD living-note and Blog-index contracts**

Lock all existing canonical URLs, 14 living-note static params, real note 404, Markdown/body preservation, typed relations/backlinks, Blog search/filter behavior, one main/h1, and absence of Garden/graph/icon-box motifs.

- [x] **Step 2: Migrate the two remaining editorial surfaces**

Render notes with shared article header, metadata, TOC, body, typed relation lists, source disclosure, and ReadNext. Render `/blog` as the `Bài của Thông` lane in the same paper/serif/rule system while retaining real cover assets and search/filter behavior. Do not edit or enable `/blog/[slug]/**`; that direct-entry surface remains Task 5.

- [x] **Step 3: Activate, verify, and commit 3C**

Enable all `/library/*` only now, plus exact `/blog`. Run focused/full tests, TypeScript, build, direct-entry/404 scans, target-viewport Browser QA, and cross-route visual consistency review. Commit as `feat: unify living library editorial surfaces` after clean review.

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

- [x] **Step 1: Generate and QA the physical stamp asset**

Use ImageGen for distressed ink texture only, composite the exact Vietnamese wording if necessary, export RGBA at least `1024×1024`, verify spelling at render size, and remove every CSS brightness/saturate filter. Run image dimension/alpha/budget tests.

- [x] **Step 2: Inventory real proof photos and create derivatives**

Search approved local source assets first. Create face-safe 16:9 and 3:2 derivatives without altering people/evidence. The manifest blocks release when fewer than three ACT 03 proof assets pass. Fewer than six valid reel assets is a valid static fallback: integrity tests stay GREEN and `canRunReel` returns false.

- [x] **Step 3: Implement the reel with the specified gate**

Write focused RED tests for hover/focus pause, duplicate `aria-hidden`, touch/reduced-motion static behavior, and `canRunReel`. If and only if six assets pass, ship the 30–45s loop, hover/focus pause, lazy loading, touch static mode, and reduced-motion static mode. If the gate is below six, retain the approved static contact sheet and record the accepted fallback without faking evidence.

- [x] **Step 4: Compact hero and ACT 03**

Anchor hero copy above the reel with `bottom`, accept per-image focal points, and render ACT 03 within the exact desktop dimensions. Add RED geometry/source contracts for CTA-versus-film placement and 3-up dimensions, then add manual rail controls and evidence detail dialog/drawer with focus trap, Escape, and focus restore.

- [x] **Step 5: Verify homepage**

Run manifest, content, cinematic, build-budget, TypeScript, and production-build tests. In Browser measure CTA/reel separation and ACT 03 section/card dimensions at all specified viewports; test keyboard/touch/reduced motion and visually inspect face crops.

- [x] **Step 6: Commit homepage refinement**

Commit as `feat: refine Cinema proof experience`.

### Task 5: Migrate direct-entry and product routes to the same visual system

**Files:**
- Replace styling/markup as needed: `app/about/page.tsx`, `app/about/page.module.css`
- Create: `content/proof/about-proof.json`
- Create: `lib/about-proof.ts`
- Modify: `app/diagnostic/page.tsx`, `app/diagnostic/DiagnosticClient.tsx`, `app/diagnostic/page.module.css`
- Create: `app/diagnostic/diagnostic-model.ts`
- Modify: `app/assets/page.tsx`, `app/assets/page.module.css`, `app/assets/[slug]/page.tsx`, `app/assets/[slug]/page.module.css`
- Modify: `app/challenges/page.tsx`, `app/challenges/page.module.css`, `app/challenges/[slug]/page.tsx`, `app/challenges/[slug]/page.module.css`
- Create: `lib/challenges.ts`
- Modify: `app/chat/page.tsx`, `app/chat/page.module.css`
- Create: `app/chat/ChatClient.tsx`
- Create: `app/chat/chat-model.ts`
- Create: `components/dossier/DossierHeader.tsx`
- Create: `components/dossier/DossierFolio.tsx`
- Create: `components/dossier/Dossier.module.css`
- Create: `scripts/subpage-cinema-contract.test.mjs`
- Modify: `app/blog/[slug]/page.tsx`, `app/blog/[slug]/BlogArticle.tsx`, `app/blog/[slug]/page.module.css`

**Interfaces:**
- Business logic, question order, result mapping, prices, offers, challenge steps, and chat API contract remain unchanged.
- All pages use the shared mode tokens and one outer main landmark.

- [x] **Step 1: Add failing route-by-route visual/semantic contracts**

Lock one h1/main, banned Garden/CSS-art motifs/imports, palette, primary CTA count, and required functionality for each route. Expected RED before migration.

- [x] **Step 2: Migrate `/about`, `/diagnostic`, and direct-entry blog surfaces**

Build the Cinema origin story, Dossier diagnostic shell, and shared Editorial blog detail shell while preserving content/logic/canonical URLs. Source every public About metric through `about-proof.json`; omit unsupported claims. Extract and unit-test the diagnostic model with its existing five questions and score thresholds `0/9/13/17/19`. Remove rotated 3D console, radar, halo, and nested main. Enable `/about`, `/diagnostic`, and `/blog*` in the route feature map only after their focused tests pass. Browser-test diagnostic completion, blog 404, and CTA.

- [x] **Step 3: Migrate `/assets/*`, `/challenges/*`, and `/chat`**

Apply physical dossier/calendar/evidence-desk composition with shared primitives and Lucide controls. Preserve catalog/product data, challenge activation, chat submission, empty/loading/error states, and all current links. Centralize duplicated challenge data, remove nested interactive controls, and split Chat into a metadata-capable server wrapper plus client runtime. Enable `/assets*`, `/challenges*`, and `/chat` only in the commit where their focused contracts pass; then switch the feature map to the final in-scope default.

- [x] **Step 4: Remove old shared Garden system only after all consumers pass**

Delete `GardenSignature`, `BrandGlyph`, old atmosphere/logo CSS, and dead green/gold variables/imports. Confirm `rg` finds no banned visual dependency on migrated public routes; legacy routes may retain isolated CSS but cannot load it globally.

- [x] **Step 5: Verify and commit route migration**

Run all tests/build, then Browser QA every index/detail route at desktop/mobile including form/chat behavior. Commit as `feat: unify Cinema subpage experience`.

### Task 6: Upgrade the Thông Phan Read publishing plugin contract

**Files:**
- Modify: `/Users/rio/plugins/thong-phan-read/references/editorial-image-pack.md`
- Modify: `/Users/rio/plugins/thong-phan-read/scripts/update_read_link.py`
- Modify: `/Users/rio/plugins/thong-phan-read/skills/article-image-pack/SKILL.md`
- Modify: `/Users/rio/plugins/thong-phan-read/skills/publish-translated-articles/SKILL.md`
- Sync the active marketplace/cache package after source validation
- Add/update plugin contract tests according to the plugin's own validator

**Interfaces:**
- Published canonical is exactly `https://thongphan.com/library/read/<slug>`.
- Generated package target is `/Users/rio/thongphan-com/content/readings/<slug>/article.json` with localized media folders.
- No command deploys the old Vite Read runtime after main release.

- [x] **Step 1: Write a failing canonical/output-path contract in the source plugin**

Search every hardcoded old domain/path, then add validator assertions for the main canonical and package output. Run the source validator and confirm RED.

- [x] **Step 2: Update the smallest coherent plugin flow**

Change routing, package creation, validation, deployment handoff, backlink target, and docs. Preserve Google Sheet as operational input and the existing writeback/readback gate. Do not claim Sheet write success if credentials still return 403.

- [x] **Step 3: Validate, sync active cache, and fresh-invoke**

Run the plugin validator, sync marketplace/cache using the established local packaging flow, start a fresh invocation, and verify one dry package points into the main repo with the new canonical. Record exact active version and evidence.

- [x] **Step 4: Commit plugin source separately if it is a Git worktree; otherwise record an explicit file-level handoff**

### Task 7: Full QA, bundle audit, preview, production promotion, and Read retirement

**Files:**
- Preserve but do not use as release gate: `scripts/qa-site.mjs` (Playwright is not declared and the user's selected verifier is in-app Browser)
- Create: `scripts/seo-contract.test.mjs`
- Create: `scripts/bundle-budget.test.mjs`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Create: `lib/seo.ts`
- Create: `components/seo/JsonLd.tsx`
- Create: `app/not-found.tsx`
- Create: `app/not-found.module.css`
- Create: `public/_headers`
- Create or modify legacy route metadata for noindex
- Update: `design-qa.md`
- Update: `docs/DEPLOYMENT.md`
- Create: `docs/superpowers/qa/2026-07-10-thongphan-unified-cinema-system.md`

**Interfaces:**
- QA matrix covers the five approved viewport sizes, all public route families, keyboard journeys, reduced motion, structured data, image failures, console, overflow, and bundle budgets.
- Production release has a captured previous deployment identifier and a verified rollback command.

- [x] **Step 1: Make route/SEO/budget tests reproducible**

Test sitemap URLs from posts, notes, public readings, assets, and challenges; robots/legacy exclusions; canonical/OG/JSON-LD; Cloudflare 404 output; per-route JS/CSS sizes; first-view font requests; and image budgets. Keep `public/_redirects` limited to the Conan trailing-slash rule and explicitly ban Read redirects. Run against `out/` after production build.

- [x] **Step 2: Run the complete local release gate**

Run `npm test`, `npx tsc --noEmit`, `npm run build`, `npm run test:build`, SEO/bundle tests, `git diff --check`, and the full in-app Browser matrix. Do not install or invoke Playwright CLI. Any failure returns to the owning slice; do not waive acceptance silently.

- [x] **Step 3: Perform visual comparison, not screenshot-only QA**

At `1490×1060`, combine the selected reference and implementation screenshot in one comparison input, inspect typography, spacing, rules, image crops, paper/ink/lacquer proportions, fix visible mismatches, and repeat until documented pass. Repeat focused comparisons for homepage hero and ACT 03.

- [x] **Step 4: Deploy a Cloudflare Pages preview and smoke it**

Deploy `out/` to `thongphan-com` preview with the release commit hash. Verify every route family, unknown reading 404, menu, library filters, reader controls, diagnostic, chat failure/success handling, Conan static route, cache-fingerprinted assets, and no broken images/console errors.

- [x] **Step 5: Promote the coherent release to production**

Deploy the exact verified output to branch `main`, smoke `https://thongphan.com`, record deployment URL/hash, and compare the served asset fingerprints with the preview.

- [x] **Step 6: Retire Read without redirects**

Only after main production passes, remove the `read.thongphan.com` custom domain/Worker route and verify the subdomain no longer serves the old content. Do not add 301/302. Preserve source data locally as migration provenance.

- [x] **Step 7: Close documentation and commit**

Set `design-qa.md` final result to `passed`, update deployment/QA evidence and spec implementation status, commit as `docs: record Unified Cinema production verification`, and confirm `git status --short` contains only the four untouched user-owned Conan files.

## Self-review Checklist

- [x] Every requirement in spec sections 6–22 maps to at least one task and verification step.
- [x] Every new behavior starts with a failing automated contract or pure-function test.
- [x] No step contains a placeholder, fabricated asset, or permission assumption.
- [x] Rights, source truth, legacy exclusions, standalone Conan, and rollback boundaries are explicit.
- [x] Plan preserves static export, build-time content, progressive enhancement, and route-specific performance budgets.
- [x] Final release includes production evidence rather than a local-only completion claim.
