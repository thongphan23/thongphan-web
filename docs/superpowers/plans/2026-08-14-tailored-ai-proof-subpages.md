# Tailored AI Proof and Subpage Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn roles, systems and case evidence into a truthful public proof layer, then reframe every homepage destination so its copy, visual shell and next action support the tailored-AI-workforce positioning without losing existing articles, images, sources or canonical URLs.

**Architecture:** Typed role/system/case registries are separate from editorial content and carry explicit evidence status. Shared dossier and handoff primitives render across dark, paper and operations-room route modes. Existing page bodies and generated content remain canonical; each page receives a new framing layer rather than a destructive rewrite.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, CSS Modules, existing content generators, JSON manifests, Node tests through `tsx`, Playwright rendered QA.

## Global Constraints

- Depends on the brand authority/homepage plan; may proceed before the diagnostic backend is released by linking only to the public `/diagnostic` shell.
- Execute in its own worktree and cherry-pick only approved prerequisite commits.
- Preserve all existing public bodies, sources, images, canonical URLs, reading rights and Brain2 access boundaries.
- `/library` remains the canonical public library; `/library/read/*` remains the current reading surface; `/read` is reserved and must not be made public.
- A `planned` or `prototype` role/system is not operational proof. Status must be visible, not hidden in metadata.
- A case cannot be published without source, time window, measurement definition, limitation and owner permission.
- Do not create a generic card grid across every route. Reuse semantic tokens and primitives, not identical page composition.
- Reading surfaces prioritize legibility: no ambient animation behind article text, no pointer spotlight over body copy and no content truncation.
- Each route has exactly one primary next action and at most two non-duplicate contextual alternatives.
- Do not modify Learn runtime, Vid playback/catalog runtime, Brain2 protected lesson content or Conan Maker internals.

## File and Responsibility Map

| Area | Files | Responsibility |
| --- | --- | --- |
| Proof registry | `content/proof/ai-role-registry.json`, `ai-system-registry.json`, `ai-case-registry.json` | Versioned public claims and evidence state |
| Proof model | `lib/proof/ai-proof.ts`, `lib/proof/ai-proof-validation.ts` | Strict validation and public projections |
| Shared UI | `components/ai-proof/*`, `components/journey/*`, `components/dossier/*` | Role dossiers, case anatomy, evidence state and next action |
| About | `app/about/*`, `components/origin-story/*` | Personal credibility and why Thông builds this system |
| Library/readers | `app/library/*`, `components/library/*`, `components/editorial/*` | Reframed discovery while retaining full readable content |
| Assets/experiences/blog | `app/assets/*`, `app/experiences/*`, `app/blog/*` | Contextual framing, status, visual coherence and handoff |
| Journey | `lib/site-journey.ts`, `components/site-chrome/*` | One primary action per route and current positioning language |
| QA | `scripts/ai-proof-*.test.*`, `scripts/subpage-brand-*.test.*`, `scripts/qa-tailored-ai-subpages.mjs` | Provenance, route integrity, content preservation and visual QA |

---

### Task 1: Define strict proof, role and case registries

**Files:**
- Create: `content/proof/ai-role-registry.json`
- Create: `content/proof/ai-system-registry.json`
- Create: `content/proof/ai-case-registry.json`
- Create: `lib/proof/ai-proof.ts`
- Create: `lib/proof/ai-proof-validation.ts`
- Create: `scripts/ai-proof-registry.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `getPublicAiRoles()`, `getPublicAiSystems()`, `getPublicAiCases()`, `getAiRoleById(id)`.
- Consumes canonical role IDs from `lib/brand/role-registry.ts`.

- [ ] **Step 1: Write the failing registry tests**

```ts
export type EvidenceState =
  | 'planned'
  | 'prototype'
  | 'operational_unmeasured'
  | 'measured_internal'
  | 'verified_public'

export type PublicAiRoleProof = {
  roleId: string
  version: string
  state: EvidenceState
  job: string
  inputs: readonly string[]
  outputs: readonly string[]
  knowledge: readonly string[]
  standards: readonly string[]
  authority: readonly string[]
  evaluation: readonly string[]
  evidenceIds: readonly string[]
  limitation: string
  updatedAt: string
}
```

Require every ID to resolve, every non-planned state to have evidence, every public case to use only `verified_public` claims, and every metric to declare formula/window/source/limitation. Reject unknown fields, duplicate IDs, future dates and empty limitations.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/ai-proof-registry.test.ts`

Expected: FAIL because proof registries do not exist.

- [ ] **Step 3: Populate only truthful initial records**

Start with Thông's own Content AI, Customer Insight AI and AI Chief of Staff as `planned`, `prototype` or `operational_unmeasured` according to available repository evidence. Do not promote them merely because source code exists. Case registry may remain an empty valid array until a publishable case meets the contract.

- [ ] **Step 4: Implement strict validation and projections**

Parse JSON at module initialization and throw a clear build error on invalid records. Public projections remove internal file paths, private notes, subject identifiers and evidence excerpts not approved for publication.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/ai-proof-registry.test.ts
npx tsc --noEmit --pretty false
npm run test:secret-integrity
git add content/proof/ai-*-registry.json lib/proof scripts/ai-proof-registry.test.ts package.json
git commit -m "feat: add truthful AI proof registry"
```

### Task 2: Build shared role dossier, system map and case anatomy primitives

**Files:**
- Create: `components/ai-proof/AiRoleDossier.tsx`
- Create: `components/ai-proof/AiSystemMap.tsx`
- Create: `components/ai-proof/AiCaseAnatomy.tsx`
- Create: `components/ai-proof/EvidenceStateLabel.tsx`
- Create: `components/ai-proof/AiProof.module.css`
- Create: `scripts/ai-proof-ui-contract.test.mjs`

**Interfaces:**
- Consumes public proof projections.
- Produces semantic UI usable on homepage, offer, about and proof sections.

- [ ] **Step 1: Write the failing component contract**

Require status label to be visible text; role dossier to expose job, output, knowledge, standard, authority, eval and limitation; system map to expose handoff/human checkpoints; case anatomy to expose before, build, result, remaining error and next version. Require keyboard controls, 44px targets, visible focus and complete no-JavaScript content.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/ai-proof-ui-contract.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Implement semantic progressive disclosure**

Use `<details>`/`<summary>` for nonessential expansion or native buttons with all critical content in the DOM. Do not use hover as the only disclosure. Render state labels as `Đang thiết kế`, `Bản thử nghiệm`, `Đang vận hành — chưa đủ số liệu`, `Đã đo nội bộ`, `Đã xác minh công khai`.

- [ ] **Step 4: Implement distinct compositions**

Role dossier resembles a tailored personnel file; system map resembles a controlled work handoff; case anatomy resembles an annotated before/after audit sheet. All share tokens, type scale and focus behavior but not identical card geometry.

- [ ] **Step 5: Verify and commit**

```bash
node --test scripts/ai-proof-ui-contract.test.mjs
npx tsc --noEmit --pretty false
npm run lint
git add components/ai-proof scripts/ai-proof-ui-contract.test.mjs
git commit -m "feat: add AI proof presentation primitives"
```

### Task 3: Reframe the About page around credible builder identity

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/about/page.module.css`
- Modify: `components/origin-story/OriginStory.tsx`
- Modify: `components/origin-story/OriginStory.module.css`
- Modify: `lib/origin-story-evidence.ts`
- Modify: `content/proof/origin-story-evidence.json`
- Modify: `lib/seo.ts`
- Create: `scripts/about-tailored-ai-contract.test.ts`

**Interfaces:**
- Consumes: approved bio, origin evidence and role proof.
- Produces: public personal story that explains why Thông is worth trusting without unsupported achievement claims.

- [ ] **Step 1: Write the failing About contract**

Require the approved one-sentence and long bio thesis, Thông's method, evidence/limitation labels, a builder-in-public role dossier, and primary CTA `/diagnostic`. Preserve all currently verified origin evidence and source labels. Ban biography inflation, generic guru language and unverified financial/outcome claims.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/about-tailored-ai-contract.test.ts scripts/origin-story-evidence.test.ts scripts/origin-story-route.test.ts`

Expected: FAIL on old framing.

- [ ] **Step 3: Recompose without erasing the life story**

Structure: current role → observed CEO problem → personal path and lessons → how those lessons became the method → systems being built → what is verified vs unfinished → diagnostic CTA. Keep portraits uncropped and source-backed. Do not reduce the page to a sales page.

- [ ] **Step 4: Update About metadata and Person graph**

Keep canonical `https://thongphan.com/about#person`. Update description/knowsAbout/service language only to approved positioning; do not add award, affiliation, client or rating schema without evidence.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/about-tailored-ai-contract.test.ts scripts/origin-story-evidence.test.ts scripts/origin-story-route.test.ts
npm run test:seo
npm run build
git add app/about components/origin-story lib/origin-story-evidence.ts content/proof/origin-story-evidence.json lib/seo.ts scripts/about-tailored-ai-contract.test.ts
git commit -m "feat: reframe builder story for tailored AI"
```

### Task 4: Reframe Library discovery while preserving every article and reading

**Files:**
- Modify: `app/library/page.tsx`
- Modify: `app/library/page.module.css`
- Modify: `components/library/LibraryDiscovery.tsx`
- Modify: `components/library/LibraryDiscovery.module.css`
- Modify: `lib/library-discovery.ts`
- Modify: `app/library/[slug]/LibraryArticle.tsx`
- Modify: `app/library/[slug]/page.module.css`
- Modify: `app/library/read/page.tsx`
- Modify: `app/library/read/page.module.css`
- Modify: `app/library/read/[slug]/page.tsx`
- Modify: `app/library/read/[slug]/page.module.css`
- Modify: `components/library/ReadingBody.tsx`
- Modify: `components/library/ReadingBody.module.css`
- Create: `scripts/library-tailored-ai-contract.test.ts`

**Interfaces:**
- Consumes existing generated library/reading datasets unchanged.
- Produces new discovery taxonomy and contextual handoffs without mutating article bodies.

- [ ] **Step 1: Snapshot content before modification**

Write tests that hash the serialized title, body/content HTML, image/source metadata and canonical path for every `getAllLibraryNotes()` and `getAllReadingSummaries()` item. Require identical hashes after UI migration.

- [ ] **Step 2: Add failing taxonomy assertions**

Require six public content pillars: `Tuyển nhân viên AI`, `Dạy theo chuẩn`, `Quản lý nhân viên AI`, `Năng suất đội ngũ`, `Tự do của người chủ`, `Build in public`. Existing items may be mapped to `Nền tảng liên quan` when no honest pillar applies; do not rewrite an article's meaning to force classification.

- [ ] **Step 3: Run RED**

Run: `npx tsx --test scripts/library-tailored-ai-contract.test.ts scripts/library-discovery.test.ts scripts/reading-routes-contract.test.mjs`

Expected: FAIL on missing taxonomy/framing.

- [ ] **Step 4: Implement discovery and reader framing**

Library Hero explains how reading supports choosing, teaching, assigning and evaluating AI roles. Filters use problem/role/method, not product pressure. Article pages add a compact `Liên hệ với đội ngũ AI` context box after the body and before the existing handoff. Reading pages keep a light paper theme, line length 60–75 characters, full body, source disclosure, image captions and minimal motion.

- [ ] **Step 5: Verify preservation and visual legibility**

```bash
npx tsx --test scripts/library-tailored-ai-contract.test.ts scripts/library-discovery.test.ts scripts/editorial-contract.test.mjs scripts/reading-routes-contract.test.mjs scripts/generate-library-data.test.mjs scripts/generate-readings-data.test.mjs
npm run build
npm run test:seo
```

Expected: all content hashes and route counts match baseline; no article body disappears.

- [ ] **Step 6: Commit**

```bash
git add app/library components/library lib/library-discovery.ts scripts/library-tailored-ai-contract.test.ts
git commit -m "feat: align library with tailored AI journey"
```

### Task 5: Reframe Assets as usable operating artifacts

**Files:**
- Modify: `app/assets/page.tsx`
- Modify: `app/assets/page.module.css`
- Modify: `app/assets/[slug]/page.tsx`
- Modify: `app/assets/[slug]/page.module.css`
- Modify: `lib/micro-assets.ts`
- Create: `scripts/assets-tailored-ai-contract.test.ts`

**Interfaces:**
- Consumes current asset registry and download/use instructions.
- Produces role/phase applicability, status, boundaries and contextual CTA.

- [ ] **Step 1: Write failing asset tests**

Hash existing asset IDs, slugs and downloadable content. Require every asset to declare `methodStage`, `applicableRoleIds`, `status`, `intendedUser`, `usageBoundary`; require one primary next action and no unsupported offer claim.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/assets-tailored-ai-contract.test.ts scripts/static-route-contract.test.mjs`

Expected: FAIL.

- [ ] **Step 3: Add typed applicability metadata and visual framing**

Keep asset content intact. Present each as a working document inside the atelier: what job it helps, what input it needs, who reviews the output and what it cannot decide. If current data cannot support a field, mark `Chưa phân loại` rather than infer.

- [ ] **Step 4: Verify and commit**

```bash
npx tsx --test scripts/assets-tailored-ai-contract.test.ts scripts/static-route-contract.test.mjs
npm run build
git add app/assets lib/micro-assets.ts scripts/assets-tailored-ai-contract.test.ts
git commit -m "feat: frame assets as AI operating artifacts"
```

### Task 6: Reframe Experiences and Brain2 challenge entry without changing protected lessons

**Files:**
- Modify: `app/experiences/page.tsx`
- Modify: `app/experiences/page.module.css`
- Modify: `components/experience/ExperienceCard.tsx`
- Modify: `components/experience/ExperienceCard.module.css`
- Modify: `lib/experiences.ts`
- Modify: `app/brain2/21-ngay/page.tsx`
- Modify: `components/brain2/Brain2Roadmap.tsx`
- Modify: `components/brain2/Brain2.module.css`
- Create: `scripts/experiences-tailored-ai-contract.test.ts`

**Interfaces:**
- Consumes current experience registry and public Brain2 entry data.
- Produces honest framing: experiences teach/build enabling capability; they are not the bespoke service itself.

- [ ] **Step 1: Write boundary tests before editing**

Snapshot all Brain2 lesson routes, public/protected flags, kickoff video link and generated lesson content hashes. Assert implementation diff does not modify `components/brain2/Brain2ProtectedLesson.tsx`, auth/cookie/rate-limit Worker or protected content files.

- [ ] **Step 2: Add failing framing tests**

Require the Experience hub to distinguish `Trải nghiệm thử`, `Bài chuyên sâu`, `Công cụ/tài sản` and `Dịch vụ may đo`. Require 21-day Brain2 entry copy to describe enterprise knowledge capability without claiming that the challenge deploys Enterprise Brain2 for a company. Preserve kickoff link.

- [ ] **Step 3: Run RED**

Run: `npx tsx --test scripts/experiences-tailored-ai-contract.test.ts scripts/experience-registry.test.ts scripts/brain2-route-contract.test.ts`

Expected: FAIL on missing framing.

- [ ] **Step 4: Implement only public-shell changes**

Add method-stage and intended-user labels to Experience cards. Reframe public Brain2 intro, roadmap headings and contextual CTA; keep curriculum and access gate untouched. Primary experience action remains starting/reading the experience; service CTA appears only as a secondary post-completion handoff.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/experiences-tailored-ai-contract.test.ts scripts/experience-registry.test.ts scripts/experience-hub-contract.test.ts scripts/brain2-route-contract.test.ts scripts/brain2-release-boundary.test.mjs
npm run test:brain2
git add app/experiences components/experience lib/experiences.ts app/brain2/21-ngay/page.tsx components/brain2/Brain2Roadmap.tsx components/brain2/Brain2.module.css scripts/experiences-tailored-ai-contract.test.ts
git commit -m "feat: align public experiences with tailored AI"
```

### Task 7: Reframe Blog taxonomy and article handoffs

**Files:**
- Modify: `app/blog/page.tsx`
- Modify: `app/blog/page.module.css`
- Modify: `app/blog/blog-filtering.ts`
- Modify: `app/blog/BlogFiltersClient.tsx`
- Modify: `app/blog/[slug]/BlogArticle.tsx`
- Modify: `app/blog/[slug]/page.module.css`
- Modify: `lib/blog.ts`
- Create: `scripts/blog-tailored-ai-contract.test.ts`

**Interfaces:**
- Consumes generated blog content unchanged.
- Produces pillar mapping and one context-aware next action.

- [ ] **Step 1: Snapshot current post integrity**

Hash slug, title, source Markdown body, published/updated dates and image references for every post. The migration must not delete or truncate content.

- [ ] **Step 2: Write failing taxonomy/handoff tests**

Require pillar mapping or explicit `Nền tảng liên quan`; preserve author/source/date; ban more than one sales CTA per article; require contextual reason before `/diagnostic` or `/marketing-ai` action.

- [ ] **Step 3: Run RED**

Run: `npx tsx --test scripts/blog-tailored-ai-contract.test.ts scripts/editorial-contract.test.mjs`

Expected: FAIL.

- [ ] **Step 4: Implement editorial framing**

Keep full article body. Add a short top context line and a final `Đi tiếp từ bài này` handoff chosen from the article's mapped pillar. Preserve light reading theme and minimal motion.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/blog-tailored-ai-contract.test.ts scripts/editorial-contract.test.mjs
npm run generate-blog
npm run build
npm run test:seo
git add app/blog lib/blog.ts scripts/blog-tailored-ai-contract.test.ts
git commit -m "feat: align editorial journey with tailored AI"
```

### Task 8: Reconcile the full route journey and link graph

**Files:**
- Modify: `lib/site-journey.ts`
- Modify: `components/journey/ChapterHandoff.tsx`
- Modify: `components/journey/ChapterHandoff.module.css`
- Modify: `components/site-chrome/site-navigation.ts`
- Modify: `components/site-chrome/SiteFooter.tsx`
- Modify: `scripts/site-journey.test.ts`
- Create: `scripts/tailored-ai-link-graph.test.mjs`

**Interfaces:**
- Produces one primary action per public route and no dead/self/duplicate links.

- [ ] **Step 1: Write failing graph tests**

Parse exported HTML and assert every internal link target exists in `out/`, every page linked from homepage has one primary handoff, primary destination differs from current path, alternatives have unique intent and external links use safe `rel`. Allow anchor links only when target IDs exist.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/tailored-ai-link-graph.test.mjs`

Expected: FAIL until build and journey registry are aligned.

- [ ] **Step 3: Implement the journey matrix**

Use these route purposes:

```text
home -> diagnostic
about -> diagnostic
marketing-ai -> diagnostic
diagnostic submitted -> marketing-ai or library
library -> topic/role discovery, then diagnostic
reader/article -> related library item, then diagnostic
assets -> use artifact, then diagnostic
experiences -> start experience, then post-completion diagnostic
brain2 challenge -> continue challenge, then enterprise Brain2 context
blog -> relevant library path, then diagnostic
```

Do not promote Conan Maker as the default next step for the new brand; preserve it as a distinct ecosystem route.

- [ ] **Step 4: Verify and commit**

```bash
npm run build
node --test scripts/tailored-ai-link-graph.test.mjs
npx tsx --test scripts/site-journey.test.ts scripts/chapter-handoff-contract.test.mjs
git add lib/site-journey.ts components/journey components/site-chrome scripts/site-journey.test.ts scripts/tailored-ai-link-graph.test.mjs
git commit -m "fix: unify tailored AI route handoffs"
```

### Task 9: Perform cross-subpage visual and content-preservation QA

**Files:**
- Create: `scripts/qa-tailored-ai-subpages.mjs`
- Create: `docs/qa/TAILORED_AI_SUBPAGES_REPORT.md`
- Modify: `docs/STATUS.md`
- Modify: `package.json`

**Interfaces:**
- Produces route-by-route PASS/PARTIAL/FAIL with screenshots and DOM evidence.

- [ ] **Step 1: Encode rendered assertions**

Test `/about`, `/library`, a library article, `/library/read`, a reading, `/assets`, an asset, `/experiences`, `/brain2/21-ngay`, `/blog`, a blog article and `/marketing-ai` at 1440x900, 1024x768, 768x1024, 390x844 and 320x568. Require zero horizontal overflow, clipped glyph, overlapping text, hidden action and destructive face crop.

- [ ] **Step 2: Test content and accessibility**

Assert article/reading text length and source/image counts equal baselines, headings are ordered, focus visible, mobile menu restores focus, reduced motion removes ambient movement, reading line height/measure pass, no JavaScript still shows core content and primary link, and no console/runtime/network error occurs.

- [ ] **Step 3: Run focused and full gates**

```bash
npx tsx --test scripts/ai-proof-registry.test.ts scripts/about-tailored-ai-contract.test.ts scripts/library-tailored-ai-contract.test.ts scripts/assets-tailored-ai-contract.test.ts scripts/experiences-tailored-ai-contract.test.ts scripts/blog-tailored-ai-contract.test.ts
node --test scripts/ai-proof-ui-contract.test.mjs scripts/tailored-ai-link-graph.test.mjs
npm test
npx tsc --noEmit --pretty false
npm run lint
npm run build
npm run test:seo
npm run test:bundle
npm run test:secret-integrity
node scripts/qa-tailored-ai-subpages.mjs
git diff --check
```

Expected: all automated gates PASS.

- [ ] **Step 4: Owner visual/content review**

Present desktop/mobile screenshots plus direct preview links for each route family. Ask the owner to verify vibe consistency, reading completeness, natural Vietnamese copy, image crop and next action. Do not call release ready until this human taste/content gate is approved.

- [ ] **Step 5: Commit evidence**

```bash
git add scripts/qa-tailored-ai-subpages.mjs docs/qa/TAILORED_AI_SUBPAGES_REPORT.md docs/STATUS.md package.json
git commit -m "test: verify tailored AI subpage system"
```

## Self-Review Gate

- [ ] Every non-planned proof has evidence IDs and a visible limitation.
- [ ] Every public case metric has formula, source, time window and permission.
- [ ] Existing content counts, body hashes, source links and image references match baseline.
- [ ] `/read` remains absent/publicly blocked and `/library/read/*` remains canonical.
- [ ] No page has more than one primary action or self-links as the primary action.
- [ ] No reader surface uses ambient background motion behind body text.
- [ ] Search `rg -n "Biến chuyên môn thật|tài sản có người muốn dùng|TODO|TBD|placeholder" app/about app/library app/assets app/experiences app/blog components lib` and classify every remaining hit.
- [ ] `git diff -- app/learn components/vid workers/vid workers/brain2-access` contains no unauthorized change.
- [ ] No production mutation occurred in this plan.
