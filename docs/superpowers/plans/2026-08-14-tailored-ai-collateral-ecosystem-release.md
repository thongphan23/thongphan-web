# Tailored AI Collateral, Ecosystem and Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a coherent, editable brand collateral kit; propagate a small, versioned public-brand contract to Vid, Brain2, Conan and Learn handoff owners; then release the approved website slices with complete parity, rollback and production smoke evidence.

**Architecture:** A single manifest declares collateral variants, dimensions, source assets, rights and copy version. Deterministic templates render exported artifacts from that manifest and are read back before approval. Ecosystem surfaces consume a small brand contract but retain independent runtime and release ownership. Final production cutover uses immutable Pages artifacts and separately scoped Workers, with D1 migrations and rollback evidence handled before traffic mutation.

**Tech Stack:** Next.js/React/CSS for web templates, SVG/HTML or existing repository-friendly rendering for editable collateral, Playwright screenshot/export, Cloudflare Pages/Workers/D1, Node tests, SHA-256 artifact parity checks.

## Global Constraints

- Depends on approved release candidates from the homepage, diagnostic/offer and proof/subpage plans.
- This plan does not redesign or rewrite Learn runtime. It produces a versioned contract/handoff and waits for the Learn workstream's checkpoint.
- Vid changes occur in a separate Vid-owned worktree/release and may alter only public brand shell, metadata and contextual handoff; never playback, catalog, Bunny upload or intelligence behavior here.
- Brain2 changes alter only public framing/chrome/handoff; never protected lesson content, access policy, auth, cookies or private data.
- Conan Maker remains a distinct product/community. The bridge must explain the relationship; it must not imply Conan Maker is the tailored service or that all members receive the service.
- Every exported collateral artifact has an editable source, exact dimensions, copy version, rights record and visual read-back.
- Human approval remains mandatory before public social publishing, campaign email, price/offer promise, logo replacement and production traffic switch.
- Do not install a paid design, analytics, email, calendar or publishing service without a separate owner decision.
- No production command runs from an unclean worktree or from a branch containing unrelated operational identifiers.

## File and Responsibility Map

| Area | Files | Responsibility |
| --- | --- | --- |
| Collateral contract | `content/brand/tailored-ai-collateral.json`, `lib/brand/collateral.ts` | Variant, size, copy, asset, rights and version validation |
| Editable templates | `brand/collateral/*`, `brand/templates/*` | Brand Card, social/OG/case/dossier/result/proposal source files |
| Exports | `public/brand/tailored-ai/*` | Approved web-ready artifacts only |
| Launch copy | `content/brand/launch/*` | Manifesto, pinned post, method/capability pieces, bios and intro email drafts |
| Ecosystem contract | `docs/contracts/TAILORED_AI_PUBLIC_BRAND_CONTRACT.md`, `lib/brand/ecosystem-contract.ts` | Copy/token/CTA/version contract for public surfaces |
| Release | `scripts/tailored-ai-release-gate.mjs`, `docs/releases/*` | Cross-slice verification, preview parity, cutover, smoke and rollback |

---

### Task 1: Define the collateral manifest and artifact rights contract

**Files:**
- Create: `content/brand/tailored-ai-collateral.json`
- Create: `lib/brand/collateral.ts`
- Create: `scripts/tailored-ai-collateral-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `getCollateralVariants()`, `getCollateralVariant(id)`, strict build-time validation.

- [ ] **Step 1: Write the failing manifest contract**

```ts
export type CollateralVariant = {
  id: string
  family: 'brand-card' | 'social' | 'og' | 'article' | 'video' | 'case' | 'dossier' | 'result' | 'proposal'
  width: number
  height: number
  format: 'svg' | 'png' | 'webp' | 'pdf'
  editableSource: string
  exportPath: string
  copyVersion: 'tailored-ai-v2.0'
  assetIds: readonly string[]
  rights: readonly ('owned' | 'licensed' | 'generated')[]
  usage: string
  approved: boolean
}
```

Require unique IDs/paths; positive exact dimensions; source/export extensions consistent; every asset rights entry present; generated assets barred from case/evidence representation; `approved: false` by default.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/tailored-ai-collateral-contract.test.ts`

Expected: FAIL.

- [ ] **Step 3: Populate the required R1 variants**

Include:

```text
Brand Card: 1600x900 and A4 portrait
Social avatar-safe profile/header: Facebook, LinkedIn, YouTube
OG: 1200x630
Article cover: 1600x900
Video cover: 1280x720 and 1080x1920
Case cover: 1600x900 and A4 portrait
Role dossier: A4 portrait
System blueprint: A3 landscape
Assessment result: A4 portrait
Proposal: A4 portrait
```

Use only current verified wordmark/monogram; no new primary logo.

- [ ] **Step 4: Verify and commit**

```bash
npx tsx --test scripts/tailored-ai-collateral-contract.test.ts
npx tsc --noEmit --pretty false
git add content/brand/tailored-ai-collateral.json lib/brand/collateral.ts scripts/tailored-ai-collateral-contract.test.ts package.json
git commit -m "feat: define tailored AI collateral contract"
```

### Task 2: Build the editable Brand Card and social identity kit

**Files:**
- Create: `brand/collateral/brand-card.html`
- Create: `brand/collateral/social-profile-kit.html`
- Create: `brand/collateral/collateral.css`
- Create: `brand/collateral/render-config.json`
- Add approved exports under: `public/brand/tailored-ai/brand-card/`, `public/brand/tailored-ai/social/`
- Create: `scripts/render-tailored-ai-collateral.mjs`
- Create: `scripts/qa-tailored-ai-collateral.mjs`

**Interfaces:**
- Consumes collateral manifest, brand registry and approved assets.
- Produces deterministic PNG/WebP/PDF exports without modifying source copy.

- [ ] **Step 1: Write failing renderer/read-back assertions**

Require render config to cover every approved variant; fail on missing font, asset, overflow, clipped glyph, transparent unexpected background, wrong dimensions and export newer than source mismatch. Use Playwright to inspect actual bounding boxes and exported pixels.

- [ ] **Step 2: Run RED**

Run: `node scripts/qa-tailored-ai-collateral.mjs`

Expected: FAIL because templates/exports do not exist.

- [ ] **Step 3: Implement the Brand Card**

Content hierarchy: category, headline, positioning sentence, method, offer, audience, key difference, tagline, website. Keep it readable in one screen/A4 without shrinking body below the agreed minimum. Use Executive AI Atelier paper/ink/oxblood, gold only as a verified-proof annotation and no AI-purple.

- [ ] **Step 4: Implement social-safe compositions**

Provide avatar-safe and crop-safe zones for each platform. The header must still communicate `Đội ngũ nhân viên AI may đo cho CEO` after center and mobile cropping. Profile bio variants come from the approved one-line/short bio, not a new promise.

- [ ] **Step 5: Render and visually inspect every export**

Use the repository renderer, then open every output at original resolution. Check Vietnamese glyphs, diacritics, line breaks, text clipping, portrait headroom, safe zones and asset rights. Do not mark PASS from file existence alone.

- [ ] **Step 6: Commit sources and only approved exports**

```bash
git add brand/collateral public/brand/tailored-ai/brand-card public/brand/tailored-ai/social scripts/render-tailored-ai-collateral.mjs scripts/qa-tailored-ai-collateral.mjs
git commit -m "feat: add tailored AI identity collateral"
```

### Task 3: Build editorial, video and case-cover templates

**Files:**
- Create: `brand/templates/og-cover.html`
- Create: `brand/templates/article-cover.html`
- Create: `brand/templates/video-cover.html`
- Create: `brand/templates/case-cover.html`
- Create: `brand/templates/template.css`
- Add approved examples under: `public/brand/tailored-ai/templates/`
- Modify: `scripts/render-tailored-ai-collateral.mjs`
- Modify: `scripts/qa-tailored-ai-collateral.mjs`

**Interfaces:**
- Consumes title, eyebrow, status, subject image and optional source label.
- Produces bounded editorial/video/case variants.

- [ ] **Step 1: Add failing template fixtures**

Use long Vietnamese titles with diacritics, a two-word speaker, a no-image variant, a portrait with top focal point, prototype/verified states and the maximum source label. Assert title never exceeds its bounded region and face-safe geometry remains inside crop.

- [ ] **Step 2: Run RED**

Run: `node scripts/qa-tailored-ai-collateral.mjs --family templates`

Expected: FAIL.

- [ ] **Step 3: Implement bounded templates**

Use a maximum of one eyebrow, one title, one secondary line, one state/source label and the wordmark. Clamp title by template-specific line budget and reject overlong input at render time; do not silently hide overflow. Case cover must show evidence state and may not use gold when not `verified_public`.

- [ ] **Step 4: Render/read back and commit**

```bash
node scripts/render-tailored-ai-collateral.mjs --family templates
node scripts/qa-tailored-ai-collateral.mjs --family templates
git add brand/templates public/brand/tailored-ai/templates scripts/render-tailored-ai-collateral.mjs scripts/qa-tailored-ai-collateral.mjs
git commit -m "feat: add tailored AI media templates"
```

### Task 4: Build role dossier, blueprint, assessment result and proposal documents

**Files:**
- Create: `brand/templates/role-dossier.html`
- Create: `brand/templates/system-blueprint.html`
- Create: `brand/templates/assessment-result.html`
- Create: `brand/templates/proposal.html`
- Create: `brand/templates/document.css`
- Add approved examples under: `public/brand/tailored-ai/documents/`
- Modify: `scripts/render-tailored-ai-collateral.mjs`
- Modify: `scripts/qa-tailored-ai-collateral.mjs`

**Interfaces:**
- Consumes structured role/system/public assessment data.
- Produces printable documents with evidence/limitation and human-control sections.

- [ ] **Step 1: Add failing multi-page fixtures**

Test minimal and maximal valid content, page breaks, Vietnamese fonts, tables, long URLs and missing optional evidence. Reject private review fields in assessment exports and reject unapproved prices/outcomes in proposal input.

- [ ] **Step 2: Run RED**

Run: `node scripts/qa-tailored-ai-collateral.mjs --family documents`

Expected: FAIL.

- [ ] **Step 3: Implement document structures**

Role dossier sections: job, output, knowledge, skill, standard, authority, eval, status, limitation. Blueprint: roles, handoffs, human checkpoints, shared knowledge, logs, exception paths. Assessment: candidate role, why, first assignment, human control, limitation, next action. Proposal: situation, scoped role/system, deliverables, client responsibilities, boundaries, evidence plan, commercial terms slot; terms remain empty until owner-approved per engagement.

- [ ] **Step 4: Read back every page**

Inspect rendered PDF/pages as a recipient: no missing page, orphan heading, split row, tiny body, clipped glyph or hidden limitation. Record page count and dimensions.

- [ ] **Step 5: Commit**

```bash
git add brand/templates public/brand/tailored-ai/documents scripts/render-tailored-ai-collateral.mjs scripts/qa-tailored-ai-collateral.mjs
git commit -m "feat: add tailored AI operating documents"
```

### Task 5: Prepare the launch content pack without publishing it

**Files:**
- Create: `content/brand/launch/manifesto.md`
- Create: `content/brand/launch/pinned-positioning-post.md`
- Create: `content/brand/launch/method-01-tuyen-dung.md`
- Create: `content/brand/launch/method-02-day-dung.md`
- Create: `content/brand/launch/method-03-giao-dung.md`
- Create: `content/brand/launch/method-04-do-dung.md`
- Create: `content/brand/launch/capability-viral-content.md`
- Create: `content/brand/launch/capability-video-dubbing.md`
- Create: `content/brand/launch/capability-seo-content.md`
- Create: `content/brand/launch/capability-enterprise-brain2.md`
- Create: `content/brand/launch/diagnostic-invitation.md`
- Create: `content/brand/launch/bios.md`
- Create: `content/brand/launch/intro-email.md`
- Create: `scripts/tailored-ai-launch-content.test.ts`

**Interfaces:**
- Consumes approved brand voice, positioning and evidence states.
- Produces draft-only, source-controlled launch copy.

- [ ] **Step 1: Write failing content guardrails**

Require each file to declare purpose, audience, primary thesis, status `draft_owner_review`, supporting evidence IDs or `none`, claim limitation and CTA. Ban autopublish metadata, fabricated outcomes, absolute replacement promises, unapproved price and claims that all four capability modules are packaged software.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/tailored-ai-launch-content.test.ts`

Expected: FAIL.

- [ ] **Step 3: Draft the content pack**

Use simple Vietnamese work language at the outer layer and technical terms only when explaining the system. Every piece focuses on one idea, one concrete business situation and one next step. Capability pieces state current readiness and boundaries.

- [ ] **Step 4: Voice/taste review**

Read each piece against the approved voice: practical, sharp, systematic, non-boastful and honest. This task creates drafts only. Do not post, send email or schedule content.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/tailored-ai-launch-content.test.ts
git add content/brand/launch scripts/tailored-ai-launch-content.test.ts
git commit -m "content: prepare tailored AI launch pack"
```

### Task 6: Publish a versioned ecosystem brand contract

**Files:**
- Create: `docs/contracts/TAILORED_AI_PUBLIC_BRAND_CONTRACT.md`
- Create: `lib/brand/ecosystem-contract.ts`
- Create: `scripts/tailored-ai-ecosystem-contract.test.ts`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Produces contract version `tailored-ai-public-v2.0` for separate surface owners.

- [ ] **Step 1: Write failing contract tests**

Require canonical category/headline/tagline, token names, wordmark rule, module statuses, CTA vocabulary, public readiness states, relationship statements for Vid/Brain2/Conan/Learn, protected boundaries and change policy.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/tailored-ai-ecosystem-contract.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement the small contract**

```ts
export const tailoredAiEcosystemContract = {
  version: 'tailored-ai-public-v2.0',
  category: 'Đội ngũ nhân viên AI may đo cho CEO',
  tagline: 'Sếp đặt chuẩn. Đội AI thực thi.',
  primaryCta: { href: 'https://thongphan.com/diagnostic', label: 'Tuyển nhân viên AI đầu tiên' },
  relationships: {
    vid: 'Thư viện video tuyển chọn giúp hiểu sâu vấn đề và năng lực AI.',
    brain2: 'Trải nghiệm xây nền tri thức; không đồng nghĩa triển khai Enterprise Brain2.',
    conan: 'Cộng đồng thực hành riêng; không phải dịch vụ may đo.',
    learn: 'Sản phẩm học tập riêng; chỉ nhận brand contract sau checkpoint của workstream Learn.',
  },
} as const
```

- [ ] **Step 4: Verify and commit**

```bash
npx tsx --test scripts/tailored-ai-ecosystem-contract.test.ts
npx tsc --noEmit --pretty false
git add docs/contracts/TAILORED_AI_PUBLIC_BRAND_CONTRACT.md lib/brand/ecosystem-contract.ts scripts/tailored-ai-ecosystem-contract.test.ts docs/STATUS.md
git commit -m "docs: publish tailored AI ecosystem contract"
```

### Task 7: Align Vid public shell in a separate Vid release

**Files (Vid-owned worktree only):**
- Modify: `components/vid/VidShell.tsx`
- Modify: `components/vid/HomeView.tsx`
- Modify: `components/vid/WatchView.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `app/vid/layout.tsx`
- Modify: `workers/vid/seo.ts`
- Modify: `scripts/vid-ui-contract.test.mjs`
- Modify: `scripts/vid-seo.test.ts`
- Modify: `scripts/qa-vid.mjs`

**Interfaces:**
- Consumes ecosystem contract by copied/version-locked values or shared package only if repository structure permits without coupling deploys.
- Produces brand-consistent header/footer/metadata and contextual handoff to main diagnostic.

- [ ] **Step 1: Create a Vid-owned branch from its current released source**

Do not cherry-pick website-wide commits blindly. First reconcile the active production VID source/version and choose the matching repository commit.

- [ ] **Step 2: Write failing contract/version tests**

Require the wordmark/tagline relationship, one subtle `Khám phá đội ngũ AI may đo` handoff, current video-first discovery/playback invariants, featured title line budget and no first-fold regression. Ban changing catalog API, Bunny IDs, upload, progress or watching-path behavior.

- [ ] **Step 3: Implement only shell/metadata/handoff**

Preserve YouTube-like browsing, infinite loading and player behavior. On watch pages, place the handoff after speaker/context information, not before the player. Keep video titles unclipped and featured content inside one viewport.

- [ ] **Step 4: Run full Vid gate and release separately**

```bash
npx tsx --test scripts/vid-seo.test.ts
node --test scripts/vid-ui-contract.test.mjs
npm run qa:vid
npm run typecheck:vid-worker
npm test
npm run build
```

Record a separate preview, production approval, Worker cutover and rollback. Do not bundle this mutation with main-site production release.

### Task 8: Verify the Brain2 alignment and hand the contract to Conan ownership

**Files:**
- Create: `docs/handoffs/TAILORED_AI_TO_CONAN_HANDOFF.md`
- Create: `scripts/tailored-ai-ecosystem-bridges.test.mjs`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Consumes ecosystem contract.
- Consumes the already approved public Brain2 framing from the subpage plan.
- Produces an accurate Conan ownership handoff without editing generated standalone bundles.

- [ ] **Step 1: Write boundary-first failing tests**

Snapshot Brain2 protected content/access files and every file under `public/conanmaker/`. Require the public Brain2 relationship copy, preserved Brain2 kickoff link, correct diagnostic target and no claim that the Brain2 challenge includes bespoke Marketing AI delivery. Require the Conan handoff to name the current generated-artifact boundary and prohibit direct edits to hashed bundles.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/tailored-ai-ecosystem-bridges.test.mjs`

Expected: FAIL until the handoff and boundary assertions exist.

- [ ] **Step 3: Write the ownership-safe Conan handoff**

Record that Conan teaches and practices the principles while Thông's service directly builds tailored systems with suitable CEOs. The handoff must identify `public/conanmaker/` as a generated artifact with no editable source in this repository, require the Conan owner/source workstream to adopt contract version `tailored-ai-public-v2.0`, preserve Conon's own primary action, add the main-site diagnostic only as a contextual secondary action, and return source commit plus visual/link verification before integration.

- [ ] **Step 4: Verify and commit**

```bash
node --test scripts/tailored-ai-ecosystem-bridges.test.mjs
npm run test:brain2
npm run build
git add docs/handoffs/TAILORED_AI_TO_CONAN_HANDOFF.md scripts/tailored-ai-ecosystem-bridges.test.mjs docs/STATUS.md
git commit -m "docs: hand tailored AI contract to Conan"
```

### Task 9: Hand the Learn contract to its active workstream without code mutation

**Files:**
- Create: `docs/handoffs/TAILORED_AI_TO_LEARN_HANDOFF.md`
- Create: `scripts/tailored-ai-learn-boundary.test.mjs`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Produces a non-code handoff containing contract version, allowed scope, acceptance and integration checkpoint.

- [ ] **Step 1: Write the boundary test**

Assert the current branch contains no diff under `app/learn/**`, Learn Worker/config/release paths. Require the handoff to state owner, base commit, contract version, allowed metadata/shell/CTA changes, forbidden runtime/data/auth changes and merge order.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/tailored-ai-learn-boundary.test.mjs`

Expected: FAIL until handoff exists.

- [ ] **Step 3: Write the handoff**

Learn owner decides when to adopt the public category/tagline/token/CTA. This workstream does not cherry-pick into Learn, edit its files or declare it aligned. Record `PENDING_LEARN_CHECKPOINT` until the other workstream returns commit and verification evidence.

- [ ] **Step 4: Verify and commit**

```bash
node --test scripts/tailored-ai-learn-boundary.test.mjs
git add docs/handoffs/TAILORED_AI_TO_LEARN_HANDOFF.md scripts/tailored-ai-learn-boundary.test.mjs docs/STATUS.md
git commit -m "docs: hand tailored AI contract to Learn"
```

### Task 10: Assemble the main-site release candidate without merging unrelated histories

**Files:**
- Create: `scripts/tailored-ai-release-gate.mjs`
- Create: `docs/releases/TAILORED_AI_MAIN_SITE_RELEASE_REPORT.md`
- Create: `docs/releases/TAILORED_AI_ROLLBACK_RUNBOOK.md`
- Modify: `docs/STATUS.md`
- Modify: `package.json`

**Interfaces:**
- Consumes exact approved commits from the three main-site plans.
- Produces one clean release branch and immutable artifact.

- [ ] **Step 1: Create release branch from current `origin/main`**

```bash
git fetch origin
git worktree add .worktrees/tailored-ai-release -b release/tailored-ai-v2 origin/main
```

Cherry-pick only the listed approved main-site commits in dependency order. Resolve conflicts by comparing source contracts and tests; never accept whole-file ours/theirs on shared shell, sitemap, package or STATUS.

- [ ] **Step 2: Write the composite release gate**

The gate verifies clean worktree, approved commit allowlist, no Learn/Vid runtime diff, route/canonical inventory, old-positioning scan, all focused suites, full tests, TypeScript, Worker TypeScript, lint, build, SEO, bundle, secret scan, visual QA reports, D1 migration evidence and preview fingerprint.

- [ ] **Step 3: Run full local verification from clean checkout**

```bash
npm ci
npm run tailored-ai:release-gate
```

Expected: `TAILORED_AI_RELEASE_LOCAL=PASS_LOCAL`. Any unavailable human/pilot/provider gate remains explicitly PARTIAL and prevents production enablement of that feature, not silent waiver.

- [ ] **Step 4: Build immutable preview**

Record source commit, `out/` tree hash, critical HTML/asset hashes, Worker bundle hashes, D1 migration list and environment bindings. Upload preview only after verifying Cloudflare account/project/database identities. Compare remote fingerprints to local.

- [ ] **Step 5: Run preview QA and owner gate**

Test all required routes/viewports, real links, form preview submission, operator auth boundary, result fixtures, reduced motion, keyboard/no-JS and visual crops. Obtain explicit owner approval for homepage desktop/mobile, offer truthfulness, diagnostic experience, subpage reading integrity and collateral.

- [ ] **Step 6: Commit release evidence before production**

```bash
git add scripts/tailored-ai-release-gate.mjs docs/releases/TAILORED_AI_MAIN_SITE_RELEASE_REPORT.md docs/releases/TAILORED_AI_ROLLBACK_RUNBOOK.md docs/STATUS.md package.json
git commit -m "chore: prepare tailored AI main-site release"
```

### Task 11: Apply production data changes and cut over traffic safely

**Files:**
- Update after execution: `docs/releases/TAILORED_AI_MAIN_SITE_RELEASE_REPORT.md`
- Update after execution: `docs/STATUS.md`

**Interfaces:**
- Produces live main site and diagnostic API, with versioned rollback targets.

- [ ] **Step 1: Capture pre-mutation state**

Record current Pages production deployment, router Worker version/deployment/traffic, diagnostic Worker absence/current version, D1 database identity/migration list/Time Travel bookmark, DNS/route bindings and live smoke fingerprints.

- [ ] **Step 2: Apply additive D1 migration**

Apply only the reviewed migration to the verified production database. Run postflight counts, constraints, orphan checks and no-change checks for existing unrelated tables. Stop on any mismatch; restore only according to the documented Time Travel/forward-repair policy.

- [ ] **Step 3: Deploy diagnostic Worker disabled or preview-scoped first**

Deploy with exact production route and bindings only after a dry run and explicit production approval. Keep public submission feature flag off until Turnstile, rate limit, admin auth, result token and provider configuration smoke pass.

- [ ] **Step 4: Cut main Pages/router to immutable artifact**

Deploy the verified Pages artifact and update router/traffic using the smallest scoped command. Do not redeploy Vid or Learn. Record the new version and immediate rollback target.

- [ ] **Step 5: Enable public diagnostic only when all gates pass**

If brevity pilot, Turnstile, D1, admin auth and result flow pass, enable submissions. If booking provider is not configured, keep invitation generation disabled and show the reviewed-result/manual-contact path. Never fabricate a calendar link.

- [ ] **Step 6: Run production smoke**

Verify real apex routes, canonicals, sitemap, first viewport, critical CTAs, article bodies/images/sources, diagnostic GET/POST security, admin denial, result no-store, mobile menu, reduced motion and no console/network errors. Confirm production HTML/assets match immutable preview fingerprints.

- [ ] **Step 7: Roll back on contract breach**

Rollback triggers: route 5xx/404, homepage overlap/crop/hidden CTA, missing content, canonical drift, form privacy/security failure, admin exposure, invalid invitation or artifact mismatch. Switch router/Pages/Worker to recorded versions; do not attempt ad hoc live patch.

- [ ] **Step 8: Record final evidence and commit**

Update report with exact commands, exit codes, versions, timestamps, routes, screenshots, limitations and PASS/PARTIAL/FAIL. Commit without secrets or operational tokens. Push only after verifying remote privacy/content safety; public repository reports must omit sensitive database bookmarks and internal identifiers.

## Self-Review Gate

- [ ] Every collateral export has editable source, exact dimension, font/asset rights and original-resolution read-back.
- [ ] No launch draft was posted, emailed or scheduled automatically.
- [ ] Vid release changed no playback/catalog/upload/progress behavior.
- [ ] Brain2 release changed no protected content/access/auth behavior.
- [ ] Conan relationship remains distinct and honest.
- [ ] Learn runtime diff is empty and handoff remains pending until its owner returns evidence.
- [ ] Main release branch contains only approved commits based on current `origin/main`.
- [ ] Production report contains no secrets, raw contact, result token, database bookmark or internal authentication material.
- [ ] Every production mutation has a captured prior version and tested rollback path.
- [ ] Program status is `PASS_PRODUCTION` only after real route, content, form, security, visual and parity smoke all pass; otherwise report PARTIAL/BLOCKED honestly.
