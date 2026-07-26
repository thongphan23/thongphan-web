# Release 0 — Repository and System Audit

**Project:** Thongphan Read upgrade on the canonical `thongphan.com` runtime
**Release:** R0 only
**Audit date:** 2026-07-26 (`Asia/Ho_Chi_Minh`)
**Repository:** `/Users/rio/thongphan-com`
**Commit audited:** `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`
**Branch:** `main`
**Remote:** `https://github.com/thongphan23/thongphan-web.git`
**Verdict:** Technical audit complete; R0 exit remains blocked on owner decision gates. No PRD-R1 was created.

---

## 1. Scope and audit boundary

The supplied archive contains the foundation documents, not an application runtime. The legacy directory `/Users/rio/Projects/thongphan-read` is retained as migration provenance and is not a Git repository. Its own status document says the old Read Worker was retired and the canonical reading library moved into `thongphan.com`.

Therefore this audit treats:

- `/Users/rio/thongphan-com` as the current application and deployment source of truth;
- `/Users/rio/Projects/thongphan-read` as read-only migration provenance;
- `https://thongphan.com/library` and `/library/read/*` as the live Thongphan Read public surface;
- `/read` as a reserved future workspace route that does not exist today.

R0 did not implement a feature, change framework, change routes, create a production database, add tenancy, add AI, run a migration, deploy, purge cache, or change Cloudflare configuration. Existing AI/Vectorize workers are reported because they are part of the current production surface; they were not added or modified.

## 2. Repository baseline

| Item | Verified value | Evidence |
|---|---|---|
| Repository root | `/Users/rio/thongphan-com` | `pwd` |
| Git branch | `main` | `git branch --show-current` |
| HEAD | `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f` | `git rev-parse HEAD` |
| Remote main | Exact SHA match with HEAD | `git ls-remote origin refs/heads/main`; `git rev-list --left-right --count origin/main...HEAD` → `0 0` |
| Last commit | `docs: record Brain2 kickoff production release` | `git show -s --format=... HEAD` |
| Package manager | npm 10.9.8; `package-lock.json` | repository inventory; `npm --version` |
| Node | v22.22.3 | `node --version` |
| Wrangler | 4.110.0 | `npx wrangler --version`; package.json:58-65 |
| Existing dirty state | `tsconfig.tsbuildinfo` modified plus four untracked Conan Maker assets | pre-audit `git status --short`; preserved unchanged |

The pre-existing `tsconfig.tsbuildinfo` SHA-256 remained exactly `2de0b6ca88190106152ba8cc4ae7f0260b45c442d1ba6daa84ac5b33790f7a2c` after audit commands. The four pre-existing untracked Conan Maker assets were not read, edited, deleted, or staged.

### Repository map

```text
app/                    Next.js App Router pages and metadata routes
components/             shared UI and client state
content/blog/           4 Markdown articles
content/library/        14 Markdown living notes
content/readings/       13 validated JSON reading packages
content/brain2/         21 lesson metadata + 7 public bodies
lib/                    runtime models and generated TypeScript data
public/                 static assets, redirects and headers
scripts/                generators, migrations, contracts and QA
workers/                Cloudflare Worker entrypoints, SQL and migrations
functions/              Pages Functions, including fail-closed Learn routing
docs/                   operational, release, architecture and R0 evidence
wrangler*.{toml,jsonc}  Pages and Worker deployment configurations
```

## 3. Framework, build, test and deploy

### Verified stack

- Next.js 16.2.10, React 19.2.5 and TypeScript 6.0.3: `package.json:36-65`.
- App Router under `app/`; Next static export with unoptimized image output: `next.config.js:2-17`.
- Strict TypeScript with `noEmit`; Workers are intentionally excluded from the main project: `tsconfig.json:3-19`, `tsconfig.json:31-42`.
- Content is generated before dev/build: `package.json:7-12`.
- Pages output is `out/`: `wrangler.toml:1-3`; deployment contract confirms the same source and artifact: `docs/DEPLOYMENT.md:3-14`.
- Deployment is manual Wrangler CLI. There are no tracked GitHub Actions files, Pages reports `Git Provider: No`, and production promotion requires explicit authorization: `docs/DEPLOYMENT.md:183-213`.

### Runbook

```bash
npm ci
npx tsc --noEmit --incremental false
npm run typecheck:brain2-workers
npm run lint
npm test
npm run build
npm run test:release
npm run test:read-release-safety
git diff --check

# Pages has no deploy --dry-run flag; validate the generated out/ artifact.
# Dry-run each Worker instead:
npx wrangler deploy --dry-run --config <wrangler-config> --outdir <temporary-dir>

# Deployment requires a separate owner authorization:
npx wrangler pages deploy out --project-name thongphan-com --branch <preview-branch> --commit-hash <sha>
```

The tracked deployment contract names the same mandatory gate at `docs/DEPLOYMENT.md:124-137`.

## 4. Current route map

| Surface | Current implementation | Live result | Canonical/index state |
|---|---|---|---|
| `/library` | Public hub aggregating readings, posts and notes | 200 | canonical `/library`; indexable |
| `/library/read` | Curated world-reading index | 200 | canonical `/library/read`; indexable |
| `/library/read/[slug]` | 13 full reading detail routes | 13 static routes; representative live route 200 | self-canonical; indexable |
| `/library/[slug]` | 14 living-note detail routes | 14 static routes | self-canonical; indexable |
| `/blog/[slug]` | 4 authored articles | 4 static routes | self-canonical; indexable |
| `/read` | Not implemented | 404 | custom noindex 404 |
| `/sitemap.xml` | Next metadata route | 200; 55 URLs | contains 29 `/library*` URLs, no `/read` |
| `/robots.txt` | Next metadata route plus Cloudflare-managed prefix | 200 | sitemap declared; `/api/` disallowed |
| `read.thongphan.com` | Retired legacy surface | DNS resolution fails at audit time | not a current redirect or runtime |

Evidence:

- `/library` metadata and three-source aggregation: `app/library/page.tsx:25-37`, `app/library/page.tsx:89-114`.
- Reading index canonical and collection data: `app/library/read/page.tsx:19-49`.
- Reading detail static params and metadata: `app/library/read/[slug]/page.tsx:19-55`.
- Living-note static params and metadata: `app/library/[slug]/page.tsx:21-62`.
- Sitemap composition: `app/sitemap.ts:8-49`; robots source: `app/robots.ts:3-13`.
- Root metadata base: `app/layout.tsx:76-91`; SEO helpers: `lib/seo.ts:3-47`.
- Executable route contracts: `scripts/reading-routes-contract.test.mjs:16-46`, `scripts/library-hub-contract.test.mjs:76-95`.

### Live SEO crawl baseline

Captured 2026-07-26:

- 55/55 sitemap URLs returned HTTP 200.
- 0 sitemap pages missing `<title>`.
- 0 sitemap pages missing canonical.
- 0 sitemap pages marked `noindex`.
- 0 duplicate canonicals.
- One normalization mismatch: sitemap URL `https://thongphan.com/` declares canonical `https://thongphan.com`.
- `/read` correctly returns HTTP 404 with `noindex` and is absent from sitemap.
- Live `robots.txt` includes a Cloudflare Managed Content block not represented in `app/robots.ts`; crawler policy is therefore split between repository and account-level controls.

Commands: a read-only `curl` route matrix and a 55-URL sitemap crawler. No browser state was submitted.

## 5. Content inventory and source of truth

| Family | Count | Authoritative source | Build projection |
|---|---:|---|---|
| Blog | 4 | `content/blog/*.md` | `lib/blog-data.generated.ts` |
| Living notes | 14 | `content/library/*.md` | `lib/library-data.generated.ts` |
| Curated readings | 13 | `content/readings/<slug>/{article,rights,image-pack}.json` | `lib/readings-data.generated.ts` |
| Reading images | 65 | `public/images/readings/<slug>/*` | copied into static export |
| Reading audio | 0 ready | no current public audio package | generated reading DTO forces `audio: []` |
| Micro-assets | 7 | hardcoded `lib/micro-assets.ts` | direct TypeScript runtime data |
| Brain2 lesson shells | 21 | `content/brain2/manifest.json` | `lib/brain2/brain2-data.generated.ts` |
| Brain2 public bodies | 7 | `content/brain2/public/*.json` | public generated module |
| Brain2 protected bodies | 14 | production KV `BRAIN2_PROTECTED_CONTENT` | fetched only after access-code session |

Evidence:

- Blog source and generator: `scripts/generate-blog-data.mjs:19-21`, `scripts/generate-blog-data.mjs:141-178`.
- Living-note source, validation and generator: `scripts/generate-library-data.mjs:18-20`, `scripts/generate-library-data.mjs:235-279`, `scripts/generate-library-data.mjs:359-363`.
- Reading validation and generated public DTO: `scripts/generate-readings-data.mjs:5-9`, `scripts/generate-readings-data.mjs:20-52`, `scripts/generate-readings-data.mjs:66-85`.
- Brain2 manifest/public split: `scripts/generate-brain2-data.mjs:7-9`, `scripts/generate-brain2-data.mjs:45-64`, `scripts/generate-brain2-data.mjs:74-101`.
- Micro-asset checkout currently goes to Messenger, not a payment provider: `lib/micro-assets.ts:37`, `lib/micro-assets.ts:236-289`.
- Legacy Read provenance was imported from `/Users/rio/Projects/thongphan-read`: `scripts/migrate-readings.mjs:9-15`, `scripts/migrate-readings.mjs:210-241`.

Conclusion: the runtime content source is repository Markdown/JSON/TypeScript, not Google Sheets, a CMS, or D1. D1's `posts` table is not the active public content renderer.

## 6. Cloudflare topology, bindings and environments

### Local configuration map

| Deployable | Route | Bindings | Observability / guard |
|---|---|---|---|
| Pages `thongphan-com` | static `out/` | D1 `DB`; KV `KV` + local preview namespace | no separate tracked environment blocks |
| `thongphan-signup-api` | `/api/signup` | D1, KV, IP + email rate limits | observability disabled |
| `thongphan-chat-api` | `/api/chat` | Workers AI, Vectorize | no auth/rate-limit binding |
| `brain2-embedder` | `/api/embed` | Workers AI, Vectorize | no auth/rate-limit binding |
| `thongphan-com-router` | apex and `www` catch-all | none | custom Pages-origin proxy/cache |
| `thongphan-brain2-access-api` | `/brain2/21-ngay/api/*` | D1, protected-content KV, two secrets remotely | access-code session boundary |
| `thongphan-brain2-email-v2` | email admin/unsubscribe | D1; expected Brevo/admin/unsubscribe secrets | `crons = []`; not deployed remotely |
| `thongphan-brain2-legacy-redirect` | `brain2.thongphan.com/*` | none | redirect-only worker |

Config evidence: `wrangler.toml:1-15`, `wrangler.signup.toml:1-42`, `wrangler.chat.toml:1-15`, `wrangler.embed.toml:1-18`, `wrangler.router.toml:1-8`, `wrangler.brain2-access.jsonc:1-33`, `wrangler.brain2-email.toml:1-33`, `wrangler.brain2-legacy-redirect.jsonc:1-17`.

### Remote read-only inventory

- Latest Pages production deployment: `350ecbc7-9eec-4661-8451-2b129577b97c`, source `12880bc`; latest preview: `e36e4d04-58b9-4be4-bb5d-745c86ead1a9`.
- `12880bc..HEAD` changes only release/status documentation; runtime code is unchanged.
- Downloaded Pages configuration shows root and `env.production` using the same D1 and KV resources. Preview/staging data isolation is not implemented.
- Pages has no encrypted secrets.
- Relevant D1 `thongphan-db` exists and matches the configured ID.
- KV: protected Brain2 namespace has 14 keys; `KV` and `KV_preview` are empty. A legacy `REFLECTIONS` namespace still exists account-wide but is not bound to this Pages project.
- Vectorize index `brain2-vault` exists (768 dimensions, cosine).
- R2 is disabled for the account; Queues inventory is empty.
- Signup, chat, embed, router, Brain2 access and legacy redirect workers exist remotely. The Brain2 email worker does not exist.
- Only Brain2 access reports two encrypted secret names. Signup/chat/embed/router have no Worker secrets. Secret values were never requested or printed.

No Cloudflare mutation, deployment or migration command was run.

## 7. Auth, analytics, email, payment and privacy

### Authentication and reader state

- There is no canonical reader account, login provider, member role, subscription, entitlement or cross-device reading history.
- Reading bookmarks are local to one browser: `components/library/ReadingToolbar.tsx:34-59`, with explicit non-sync copy at `components/library/ReadingToolbar.tsx:61-77`.
- Brain2 protected lessons use an access-code hash plus signed secure cookie, not general user identity: `workers/brain2-access/index.ts:12-16`, `workers/brain2-access/index.ts:102-175`; cookie boundary at `workers/brain2-access/cookie.ts:101-119`.

### Analytics

- No GA, PostHog or product analytics SDK was found.
- No Cloudflare Web Analytics beacon was found in source or live Read HTML.
- Existing Brain2 anonymous event contracts do not establish the requested Thongphan Read product event model.
- Cloudflare 28-day traffic and field Core Web Vitals were not available through the audited CLI surfaces.

### Email

- Signup collects name/email and writes D1 through `/api/signup`: `components/SignupForm.tsx:72-99`.
- The UI promises the first email within five minutes: `components/SignupForm.tsx:109-123`.
- Production D1 has 10 signups and 210 `legacy-v0` email rows; all 210 are pending; `email_logs` has 0 rows.
- The email sender is intentionally inert in source (`crons = []`) and the configured email Worker is absent remotely: `workers/README.md:7-16`, `wrangler.brain2-email.toml:26-33`.
- Sender code has Brevo, idempotency and unsubscribe boundaries, but code readiness is not provider/runtime readiness: `workers/README.md:20-29`, `workers/api/email-drip.ts:257-359`.

Current consequence: the public success promise is not operationally deliverable.

### Payment

- No Stripe, PayOS, payment webhook, subscription or entitlement implementation exists.
- The seven asset calls-to-action point to Messenger: `lib/micro-assets.ts:37`, `lib/micro-assets.ts:236-267`.

### Privacy and secrets

- No `/privacy`, `/terms`, consent banner, data export or deletion route was found.
- The signup form collects name/email without an adjacent privacy/consent link: `components/SignupForm.tsx:137-182`.
- Retention and disposal policy for the 10 signup rows and 210 queued email bodies is undeclared.
- Token-like plaintext is tracked in historical handoff documentation at `.claude/handoff.md:323` and `.claude/handoff-chat.md:809`, `.claude/handoff-chat.md:818`, `.claude/handoff-chat.md:822`. Values are redacted from this report. Treat them as exposed even if old/expired.
- `.env*`, `.dev.vars*` and private Brain2 outputs are ignored: `.gitignore:5-17`; their values were not read.

## 8. Current data flows

```text
Markdown/JSON in Git
  -> deterministic generators
  -> generated TypeScript
  -> Next static export out/
  -> Cloudflare Pages origin
  -> catch-all router
  -> thongphan.com/library*

Reader bookmark
  -> browser localStorage only
  -> no D1 / no account / no cross-device sync

Brain2 signup
  -> /api/signup Worker
  -> D1 challenge_signups + email_queue
  -> sender path stops because email Worker is absent and cron is empty

Protected Brain2 lesson
  -> access-code Worker + signed cookie
  -> protected-content KV

Existing AI surfaces (outside Read R0 target)
  -> /api/chat and /api/embed Workers
  -> Workers AI + brain2-vault Vectorize
```

### Current D1 schema

Remote tables are `posts`, `challenges`, `challenge_signups`, `email_queue`, `email_logs`, `brain2_access_failures`, `d1_migrations` and `_cf_KV`. The tracked base schema confirms challenge signup and email PII storage at `workers/schema.sql:29-65`.

There are no current R1 tables for users, identities, plans, subscriptions, entitlements, reading sessions, profile/evidence, recommendations, notifications or workspaces. R0 did not create any of them.

## 9. SEO, performance and bundle baseline

### Static artifact

| Metric | Baseline |
|---|---:|
| Exported routes / HTML files | 82 |
| Total files | 1,046 |
| Total `out/` size | 88 MiB |
| `out/images` | 58 MiB |
| `out/game` | 12 MiB |
| `out/library` | 7.9 MiB |
| Next static JS | 1.4 MiB raw; 392,552 bytes gzip aggregate |
| Next static CSS | 384 KiB raw; 63,224 bytes gzip aggregate |
| Largest JS chunks | two 256 KiB files; two 192 KiB files |
| Files over 1 MiB | includes several 2.1–4.1 MiB raster images and a 2.1 MiB game bundle |

`npm run test:bundle` passes all 3 bundle/image budget contracts. Aggregate `out/` size is a distribution baseline, not the bytes loaded by one Read route.

### Live lab navigation baseline

Headless Chromium 145.0.7632.6, 1440×900, three fresh browser contexts per route, captured 2026-07-26. Values below are medians; transfer excludes the HTML document and reflects browser resource timing. This is a reproducible lab sample, not field Core Web Vitals.

| Route | HTTP | TTFB | DCL | load | LCP | CLS | resource transfer |
|---|---:|---:|---:|---:|---:|---:|---:|
| `/library` | 200 | 120 ms | 273 ms | 410 ms | 316 ms | 0.0197 | 1,591,307 B |
| `/library/read` | 200 | 113 ms | 341 ms | 402 ms | 248 ms | 0.000044 | 738,293 B |
| `/library/read/steve-jobs-2005-stanford-commencement-address` | 200 | 121 ms | 356 ms | 435 ms | 264 ms | 0.000055 | 1,764,679 B |

The detail route had one TTFB outlier at 511 ms; the other two were 110 ms and 121 ms. The `/library` CLS median is below 0.1 but materially higher than the two reading surfaces and should be watched after R1.

## 10. Findings

### AUD-001 — Canonical runtime and legacy boundary

- Status: Verified.
- Evidence: canonical Git repo/SHA above; migration source at `scripts/migrate-readings.mjs:9-15`; deployed public route at `app/library/page.tsx:25-37`.
- Impact: R1 planning against the legacy repo would target retired architecture.
- Recommendation: keep `thongphan-com` as runtime source of truth and legacy Read as immutable provenance.
- Blocking release: R1 documentation until owner approves this boundary.

### AUD-002 — Public library is healthy; `/read` does not exist

- Status: Verified.
- Evidence: route map and 55/55 live crawl; `app/sitemap.ts:20-49` excludes `/read`.
- Impact: the R1 workspace is genuinely new stateful capability, not a hidden route to expose.
- Recommendation: preserve `/library*`; decide `/read` architecture in an ADR before implementation.
- Blocking release: R1 route/hosting design.

### AUD-003 — Content is Git/static-first and already validated

- Status: Verified.
- Evidence: generator paths in section 5; 13 reading rights contracts pass.
- Impact: an early CMS/D1 content migration would add risk without solving a demonstrated problem.
- Recommendation: retain repository content through initial slices; add a storage ADR only after editorial workflow requirements are explicit.
- Blocking release: No.

### AUD-004 — No reader identity, membership, entitlement or durable reading evidence

- Status: Verified absent.
- Evidence: repository-wide route/provider/schema audit; bookmark evidence at `components/library/ReadingToolbar.tsx:34-77`; remote D1 schema inventory.
- Impact: R1 acceptance criteria cannot assume reusable auth or entitlement primitives.
- Recommendation: decide identity/session/payment/entitlement boundaries before PRD-R1.
- Blocking release: Yes, for R1 scope.

### AUD-005 — Preview and production data are not isolated

- Status: Verified.
- Evidence: downloaded Pages config uses the same D1/KV in root and production; local `wrangler.toml:5-15` declares only resource bindings, not isolated envs.
- Impact: future preview code could touch production state if dynamic Pages Functions are added.
- Recommendation: require separate preview D1/KV and provider test credentials before any R1 stateful preview.
- Blocking release: Yes, before stateful R1 preview.

### AUD-006 — Public embed mutation endpoint lacks an authorization boundary

- Status: Verified, critical existing risk outside Read scope.
- Evidence: production route at `wrangler.embed.toml:16-18`; arbitrary content POST, AI call and Vectorize upsert at `workers/embed-vault.ts:28-69`; live GET confirms the Worker is routed.
- Impact: unauthorized callers may consume AI resources and mutate the Brain2 Vectorize index.
- Recommendation: owner must choose disable/remove from public routing or require strong admin authentication, strict body limits and rate limiting. This is a separate security release, not an R0 implementation change.
- Blocking release: Yes; P0 security gate before R1.

### AUD-007 — Public chat consumes AI without auth/rate-limit

- Status: Verified existing surface outside Read target.
- Evidence: route/bindings at `wrangler.chat.toml:6-15`; wildcard CORS and unbounded public POST at `workers/api/chat.ts:36-111`.
- Impact: cost/abuse and scope contamination; current foundation says AI is not in the Read critical path.
- Recommendation: isolate the existing chat decision from Thongphan Read and decide its production ownership/security separately.
- Blocking release: Owner security/scope decision.

### AUD-008 — Signup promise and email runtime disagree

- Status: Verified.
- Evidence: five-minute promise at `components/SignupForm.tsx:109-123`; inert cron at `wrangler.brain2-email.toml:32-33`; sender intentionally inert at `workers/README.md:7-16`; remote email Worker absent; 210/210 legacy rows pending.
- Impact: misleading success state and retained PII/email bodies without delivery.
- Recommendation: choose retire/repair the promise, disposition legacy rows, provider readiness and retention before connecting Read lifecycle email.
- Blocking release: Yes, for any R1 email promise.

### AUD-009 — Privacy and secret-management baseline is incomplete

- Status: Verified.
- Evidence: no privacy/terms/delete routes; PII form at `components/SignupForm.tsx:137-182`; tracked token-like strings at redacted handoff lines listed in section 7.
- Impact: unclear user rights/retention and potential credential exposure.
- Recommendation: rotate/revoke all historical tokens if ever valid, define history-purge policy, privacy notice, consent purpose, retention and delete/export workflow.
- Blocking release: Yes, before new account/profile collection.

### AUD-010 — Product analytics and field baseline are absent

- Status: Verified absent/partially unknown.
- Evidence: no analytics SDK/beacon found; no 28-day traffic/CWV surface available to audit.
- Impact: R1 cannot measure activation/retention or compare field performance.
- Recommendation: approve a minimal privacy-preserving event catalog and data owner; do not block public static content on analytics availability.
- Blocking release: R1 measurement plan.

### AUD-011 — Deployment is manual and documentation has drift

- Status: Verified.
- Evidence: no `.github` workflow; Pages Git provider is absent; `docs/DEPLOYMENT.md:18-39` names an older “current” release and says the retired Read subdomain returns 530, while current DNS does not resolve.
- Impact: release facts are easy to stale; no automated gate proves the exact promoted artifact.
- Recommendation: ADR for manual-vs-CI release, environment promotion and release-evidence ownership. Correct stale operational facts in a dedicated docs maintenance change.
- Blocking release: Not R0, but required before repeated R1 releases.

### AUD-012 — Dependency vulnerability result is unknown

- Status: Unknown due tooling/API failure.
- Evidence: `npm ci --ignore-scripts` succeeded in an isolated temporary directory, but npm 10 audit returned HTTP 400 “Invalid package tree”; npm 11 bulk audit returned a malformed compressed registry response.
- Impact: no fresh vulnerability verdict can be claimed from this audit.
- Recommendation: repair/replace the dependency audit path and record a successful immutable result before R1 release.
- Blocking release: R1 release gate, not R0 repository analysis.

## 11. Component disposition

| Component | R0 recommendation | Reason |
|---|---|---|
| Next.js/App Router | Retain | build/test/SEO pass; no migration evidence |
| Cloudflare Pages static public plane | Retain | strong static/SEO baseline |
| `/library*` routes | Retain unchanged | canonical and healthy |
| Repository Markdown/JSON content | Retain initially | deterministic, validated, versioned |
| D1 challenge/email schema | Isolate; do not reuse blindly | not a reader/account domain model |
| Browser bookmark | Retain as anonymous fallback | graceful degradation; not identity |
| Brain2 access-code session | Do not treat as reader auth | different identity/entitlement semantics |
| Existing AI/Vectorize workers | Exclude from Read scope; security decision required | user non-goal and current risk |
| R2/Queues | Do not provision in R0 | no current binding or approved R1 need |
| Multi-tenant/workspace runtime | Do not build | explicit non-goal |

## 12. R1 feasibility

R1 is technically feasible on the current Next.js + Cloudflare stack without a framework rewrite. However, R0 is not approved for exit because the owner decisions below materially change identity, environment isolation, privacy, provider and release design. No PRD-R1 should be written until those gates are resolved.

---

## Findings

- Public Read content is healthy, static-first, canonical and fully discoverable under `/library*`.
- The future `/read` workspace, reader account, membership, entitlement and evidence model do not exist.
- Current email, privacy, environment isolation and dependency-audit baselines are not release-ready for stateful R1.
- Existing unauthenticated AI mutation/chat routes are outside the Read goal but are material production security/scope risks.

## Verified facts

- Canonical repo/HEAD: `/Users/rio/thongphan-com` at `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`.
- Stack: Next.js 16.2.10, React 19.2.5, TypeScript 6.0.3, npm, static export, Cloudflare Pages + Workers.
- Content: 4 blog posts, 14 notes, 13 readings, 65 reading images, 0 ready reading audio, 7 micro-assets, 21 Brain2 shells.
- SEO: 55/55 sitemap URLs return 200; `/read` is a noindex 404; all sitemap pages have title and canonical.
- Production D1 has 10 challenge signups, 210 pending legacy email rows and no email logs; no R1 domain tables.
- Seven Worker configurations pass Wrangler dry-run; no deployment was made.

## Unknowns

- Approved identity, auth/session, payment, email and product analytics providers.
- Field Core Web Vitals, 28-day traffic and Cloudflare request/cost baseline.
- Lawful retention/disposition decision for existing signup/email data.
- Fresh dependency vulnerability verdict because registry audit APIs failed.
- Whether existing chat/embed workers should be retired, isolated or hardened.

## Risks

- P0: unauthenticated `/api/embed` can mutate Vectorize and spend Workers AI resources.
- P1: preview and production dynamic data are not isolated.
- P1: signup success promises email that current production cannot send.
- P1: PII collection lacks an explicit privacy/retention/delete contract.
- P1: token-like plaintext exists in tracked historical handoff documents.
- P2: no product analytics/field baseline and no automated CI release pipeline.

## Recommended ADRs

1. ADR-001 — Canonical runtime repo and legacy Read provenance boundary.
2. ADR-002 — Retain Next.js static public plane and define `/read` dynamic hosting boundary.
3. ADR-003 — Identity provider, session model and account recovery/deletion.
4. ADR-004 — Reader/Member plans, payment provider, webhook idempotency and entitlement.
5. ADR-005 — Content source retention versus CMS/database migration trigger.
6. ADR-006 — Preview/staging/production resource isolation.
7. ADR-007 — Privacy, consent, retention, data requests and analytics policy.
8. ADR-008 — Email provider, sender readiness, legacy queue disposition and truthful UI promises.
9. ADR-009 — Minimal product event catalog and analytics storage ownership.
10. ADR-010 — Existing `/api/chat` and `/api/embed` ownership, isolation or retirement.
11. ADR-011 — Worker boundaries, routing precedence and observability.
12. ADR-012 — Manual versus CI deployment, artifact promotion, rollback and dependency scanning.

## Test outputs

| Command | Result |
|---|---|
| `npx tsc --noEmit --incremental false` | PASS, exit 0 |
| `npm run typecheck:brain2-workers` | PASS, exit 0 |
| `npm run lint` | PASS, exit 0 |
| `npm test` | PASS 242/242 after installing the missing local Playwright Chromium cache; first run had 2 infrastructure failures only |
| `npm run build` | PASS, 82/82 pages exported |
| `npm run test:release` | PASS: build 6/6, SEO 4/4, bundle 3/3, Brain2 143/143 |
| `npm run test:read-release-safety` | PASS 3/3 |
| 7× `wrangler deploy --dry-run` | PASS; gzip uploads 0.42–11.87 KiB |
| Live sitemap crawl | PASS 55/55 HTTP 200; one root trailing-slash canonical normalization mismatch |
| `npm audit` | BLOCKED by registry/API errors; no vulnerability verdict claimed |

## Files changed

- `AGENTS.md` — imported foundation operating contract.
- `docs/00-MASTER-INDEX.md` — imported and linked to the R0 evidence artifact; `docs/01-GLOSSARY.md` and foundation product/domain/roadmap documents — imported from the supplied archive.
- `docs/discovery/R0-AUDIT-REPORT.md` — this evidence report.
- `docs/discovery/CURRENT-SYSTEM-AUDIT.md` — updated with verified R0 state.
- `docs/architecture/SAD-CLOUDFLARE-FIRST.md` — updated with actual topology and gaps.
- `docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md` — updated with actual current sources/schema/flows.
- `docs/STATUS.md` — R0 status and approval boundary.

No application, route, Worker, schema, migration or production configuration file was changed.

## Decision gates cần chủ dự án duyệt

1. Duyệt `/Users/rio/thongphan-com` là runtime chuẩn và repo Read cũ chỉ là provenance.
2. Duyệt giữ Next.js + Cloudflare Pages static plane và không đổi `/library*` trong R1.
3. Chọn auth/session/account recovery/delete model cho Reader/Member.
4. Chọn payment + entitlement boundary hoặc xác nhận R1 chưa có paid membership.
5. Duyệt tách hoàn toàn preview/staging khỏi production D1/KV/provider credentials.
6. Quyết định xử lý P0 `/api/embed` và public `/api/chat` trước khi mở R1.
7. Duyệt privacy/consent/retention/delete/export policy và số phận 210 email legacy.
8. Duyệt email provider/runtime hoặc gỡ lời hứa gửi mail cho tới khi vận hành thật.
9. Duyệt event catalog và công cụ analytics tối thiểu.
10. Duyệt release/CI/dependency-audit policy.
11. Xác nhận R0 exit. Chỉ sau xác nhận này mới được bắt đầu PRD-R1.
