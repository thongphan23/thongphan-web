# Marketing AI Diagnostic and Offer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a short, evidence-aware diagnostic that identifies the first AI role a marketing team should test, routes every submission through human review, and opens a booking invitation only after an offer-specific Sales Ready decision.

**Architecture:** A pure shared contract validates the progressive form in both browser and Worker. A dedicated Cloudflare Worker owns submission, source observation, inference, assessment, review, result-token and invitation state in D1. The public static pages call versioned JSON endpoints; the operator interface is data-empty until authenticated. AI analysis is an optional adapter and never blocks human review.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, Cloudflare Workers, D1 migrations, Turnstile, Web Crypto opaque tokens, Node tests through `tsx`, Wrangler local D1, Playwright.

## Global Constraints

- Depends on the approved authority and typed brand contracts from the brand-foundation plan.
- Work in its own branch/worktree and cherry-pick only the approved foundation commits; never combine unrelated VID or Learn history.
- R1 asks at most ten required blocks and at most three short free-text answers.
- Required business context: business/team, website, fanpage, current output/approver, capability interest, bottleneck, standard, authority boundary, contact, intent/timing/consent.
- Website and fanpage observation is optional, bounded and fail-soft. No login, cookie, deep crawl, page graph, hidden endpoint, browser automation or unrestricted storage.
- The server assigns `workspace_id = thongphan` and `offer_id = marketing-ai-tailored`; never trust either from client input.
- No lead score. Product Qualified uses F-P-I-A evidence; Sales Ready always requires an append-only human decision.
- AI may prepare an assessment but may not issue Sales Ready or a booking invitation.
- No public result contains raw submission, contact, private note, qualification label, source excerpt or internal confidence.
- No mini-CRM, nurture automation, broadcast email, deal pipeline or paid provider integration in R1.
- Booking provider and email provider remain adapters. Until configured, the product must degrade to a reviewed result and explicit manual contact path rather than fabricate availability.
- All mutations validate server-side, rate-limit, enforce Turnstile on public submission and emit an audit record.

## File and Responsibility Map

| Area | Files | Responsibility |
| --- | --- | --- |
| Shared contract | `lib/marketing-diagnostic/contracts.ts`, `questions.ts`, `assessment.ts` | Canonical IDs, validation, progression and public result projection |
| Public form | `app/diagnostic/*` | Progressive accessible form, local state and API submission |
| Result | `app/diagnostic/result/*` | Token-based private/no-store result and invitation state |
| Offer | `app/marketing-ai/*` | Truthful bespoke offer, modules, fit/non-fit, process and diagnostic CTA |
| Worker | `workers/marketing-diagnostic/*` | API routing, security, persistence, observation, review and result issuance |
| Data | `workers/marketing-diagnostic/migrations/*.sql` | Append-only D1 schema and constraints |
| Operations | `app/ops/marketing-assessments/*` | Authenticated queue/detail/review shell only |
| Config | `wrangler.marketing-diagnostic.toml`, `tsconfig.marketing-diagnostic-worker.json` | Worker build, bindings and scoped deploy |
| Tests | `scripts/marketing-diagnostic-*.test.*`, `scripts/qa-marketing-diagnostic.mjs` | Domain, migration, security, UI and journey gates |

---

### Task 1: Define the diagnostic question and validation contract

**Files:**
- Create: `lib/marketing-diagnostic/contracts.ts`
- Create: `lib/marketing-diagnostic/questions.ts`
- Create: `lib/marketing-diagnostic/assessment.ts`
- Create: `scripts/marketing-diagnostic-contract.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `DiagnosticSubmissionInput`, `ValidatedDiagnosticSubmission`, `CandidateRoleId`, `PublicAssessmentResult`, `validateDiagnosticSubmission`, `deriveCandidateRoles`.
- Consumed by public form, Worker, review UI and tests.

- [ ] **Step 1: Write failing domain tests**

Cover a complete valid submission, every required omission, normalization, exact length ceilings, invalid public URL, private literal URL, extra fields and malformed types. Require no more than ten required blocks and three free-text fields.

```ts
const valid: DiagnosticSubmissionInput = {
  schemaVersion: '2026-08-14',
  company: { name: 'Công ty mẫu', businessType: 'dịch vụ', teamSize: '2-5' },
  sources: { website: 'https://example.com', fanpage: 'https://facebook.com/example' },
  operation: { currentOutput: 'Bài viết và video', approver: 'CEO' },
  capabilityIds: ['viral-content-ai', 'video-dubbing-ai'],
  bottleneck: 'Đội ngũ chờ CEO duyệt ý tưởng và sửa giọng.',
  declaredStandard: 'Đúng insight, đúng giọng và có bằng chứng.',
  authorityBoundary: 'AI đề xuất, trưởng nhóm duyệt trước khi đăng.',
  contact: { name: 'An', email: 'an@example.com', phone: '' },
  intent: { wantsConversation: true, timing: 'within-30-days' },
  consent: { version: 'diagnostic-2026-08-14', accepted: true },
}
```

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-contract.test.ts`

Expected: FAIL because the shared contract is absent.

- [ ] **Step 3: Implement strict types and validator**

Use discriminated, allow-listed IDs:

```ts
export type CandidateRoleId =
  | 'customer-insight-ai'
  | 'content-strategist-ai'
  | 'content-writer-ai'
  | 'content-critic-ai'
  | 'video-dubbing-ai'
  | 'seo-content-ai'
  | 'knowledge-ai'

export type DiagnosticValidationResult =
  | { ok: true; value: ValidatedDiagnosticSubmission }
  | { ok: false; fieldErrors: Readonly<Record<string, string>> }
```

Reject unknown keys recursively. Trim strings; cap business name at 120, bottleneck/standard/authority at 500 each, names at 100 and URLs at 2,048. Accept only `https:` URLs except local test fixtures explicitly injected into the observer, never in production validation.

- [ ] **Step 4: Implement deterministic candidate-role preparation**

`deriveCandidateRoles()` returns at most three candidates with reasons tied to declared fields; it creates no commercial state. Every candidate value is a canonical Role Registry ID. Keep heuristic rules versioned as `role-rule-2026-08-14`.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-contract.test.ts
npx tsc --noEmit --pretty false
git add lib/marketing-diagnostic scripts/marketing-diagnostic-contract.test.ts package.json
git commit -m "feat: define marketing AI diagnostic contract"
```

### Task 2: Build the progressive public form without commercial shortcuts

**Files:**
- Modify: `app/diagnostic/page.tsx`
- Modify: `app/diagnostic/DiagnosticClient.tsx`
- Replace: `app/diagnostic/diagnostic-model.ts`
- Modify: `app/diagnostic/page.module.css`
- Create: `app/diagnostic/diagnostic-api.ts`
- Create: `scripts/marketing-diagnostic-ui-contract.test.mjs`
- Modify: `scripts/diagnostic-journey.test.ts`

**Interfaces:**
- Consumes: `diagnosticQuestionGroups`, shared validator.
- Calls: `POST /api/marketing-diagnostic/v1/submissions`.
- Produces: confirmation with opaque `submissionId`, never a score or booking link.

- [ ] **Step 1: Write failing UI and journey contracts**

Require five progressive groups: `Doanh nghiệp`, `Đội marketing`, `Điểm nghẽn`, `Tiêu chuẩn & quyền hạn`, `Nhận kết quả`. Assert website and fanpage fields, labels, descriptions, field-level errors, progress, save-in-memory only, submission retry and confirmation. Ban score, fake result, `localStorage`, raw answer analytics and any booking URL in the initial response.

- [ ] **Step 2: Run RED**

Run:

```bash
node --test scripts/marketing-diagnostic-ui-contract.test.mjs
npx tsx --test scripts/diagnostic-journey.test.ts
```

Expected: FAIL against the current five-question self-score UI.

- [ ] **Step 3: Implement accessible progression**

Maintain a single state object typed as `DiagnosticSubmissionInput`; each `fieldset` has one `legend`; Next/Back buttons never submit; Enter does not skip validation; errors link via `aria-describedby`; the first invalid field receives focus. Use an `aria-live="polite"` summary for progress and request status.

The client API signature is:

```ts
export async function submitMarketingDiagnostic(
  input: DiagnosticSubmissionInput,
  turnstileToken: string,
  signal?: AbortSignal,
): Promise<{ submissionId: string; status: 'received_for_review' }>
```

Set a 15-second client timeout; preserve entered values on recoverable errors; never log the input.

- [ ] **Step 4: Implement honest completion state**

After success say the assessment is received and will be reviewed by Thông/operator. Offer one non-commercial next action to `/marketing-ai` and one reading action to `/library`; do not imply approval, result timing or booking availability.

- [ ] **Step 5: Verify and commit**

```bash
node --test scripts/marketing-diagnostic-ui-contract.test.mjs
npx tsx --test scripts/diagnostic-journey.test.ts scripts/marketing-diagnostic-contract.test.ts
npx tsc --noEmit --pretty false
npm run lint
git add app/diagnostic scripts/marketing-diagnostic-ui-contract.test.mjs scripts/diagnostic-journey.test.ts
git commit -m "feat: add short marketing AI diagnostic"
```

### Task 3: Create the D1 schema and prove migration compatibility

**Files:**
- Create: `workers/marketing-diagnostic/migrations/0001_marketing_diagnostic.sql`
- Create: `workers/marketing-diagnostic/migrations/README.md`
- Create: `scripts/marketing-diagnostic-migration.test.mjs`
- Create: `wrangler.marketing-diagnostic.toml`
- Create: `tsconfig.marketing-diagnostic-worker.json`

**Interfaces:**
- Produces relational persistence for submissions, source observations, evidence, inferences, relationships, decisions, invitations, result tokens and audit events.

- [ ] **Step 1: Write an executable failing migration test**

Use a temporary Wrangler local directory. Apply migration to an empty database and to a populated pre-migration fixture. Assert foreign keys, check constraints, unique active-state constraints, indices and rollback documentation. The wrapper must reject `--remote`.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/marketing-diagnostic-migration.test.mjs`

Expected: FAIL because migration/config are absent.

- [ ] **Step 3: Implement append-only schema**

Create tables with server-generated text IDs and ISO timestamps:

```sql
diagnostic_submissions
source_observations
evidence_records
candidate_role_inferences
inference_evidence_links
assessment_decisions
decision_relationships
booking_invitations
assessment_result_tokens
diagnostic_audit_events
```

Critical checks:

```sql
CHECK (submission_status IN ('received','observing','ready_for_review','reviewed','result_issued','closed','deleted'))
CHECK (review_status IN ('pending','accepted','rejected','superseded','expired'))
CHECK (decision_type IN ('needs_information','not_fit','product_qualified','sales_ready'))
CHECK (generator_type IN ('rule','ai','human'))
```

Store form sections in normalized bounded JSON columns only where schema is enforced in application code; keep contact separate from public projection. Never store a general lead score.

- [ ] **Step 4: Document recovery**

Require a pre-migration D1 Time Travel bookmark, fresh/local rehearsal, populated snapshot rehearsal and forward-repair rule after post-migration writes. Do not present destructive down migration as safe rollback.

- [ ] **Step 5: Verify and commit**

```bash
node --test scripts/marketing-diagnostic-migration.test.mjs
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
git add workers/marketing-diagnostic/migrations wrangler.marketing-diagnostic.toml tsconfig.marketing-diagnostic-worker.json scripts/marketing-diagnostic-migration.test.mjs
git commit -m "feat: add marketing diagnostic data model"
```

### Task 4: Implement the public submission Worker boundary

**Files:**
- Create: `workers/marketing-diagnostic/index.ts`
- Create: `workers/marketing-diagnostic/http.ts`
- Create: `workers/marketing-diagnostic/validation.ts`
- Create: `workers/marketing-diagnostic/rate-limit.ts`
- Create: `workers/marketing-diagnostic/audit.ts`
- Create: `workers/marketing-diagnostic/repository.ts`
- Create: `scripts/marketing-diagnostic-worker.test.ts`

**Interfaces:**
- `POST /api/marketing-diagnostic/v1/submissions` → `202 { submissionId, status }`.
- `GET /api/marketing-diagnostic/v1/results/:token` → public projection or 404/410.
- Server bindings: `DB`, `TURNSTILE_SECRET`, `RESULT_TOKEN_SECRET`, optional `AI_ASSESSMENT_ENDPOINT`.

- [ ] **Step 1: Write failing Worker tests**

Cover method/path routing, JSON content type, 32 KiB body limit, malformed body, validation errors, missing/invalid Turnstile, IP/email rate limit, duplicate nonce, trusted server workspace/offer assignment, database failure, CORS denial and audit creation. Assert errors never echo PII or secrets.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-worker.test.ts`

Expected: FAIL because Worker modules are absent.

- [ ] **Step 3: Implement fail-closed request handling**

Use dependency injection for testability:

```ts
export type MarketingDiagnosticEnv = {
  DB: D1Database
  TURNSTILE_SECRET: string
  RESULT_TOKEN_SECRET: string
  ENVIRONMENT: 'preview' | 'production'
  ALLOWED_ORIGIN: string
}

export function createMarketingDiagnosticWorker(deps: WorkerDependencies) {
  return { fetch(request: Request, env: MarketingDiagnosticEnv): Promise<Response> }
}
```

Verify exact `Origin`; allow only `https://thongphan.com` in production and configured immutable Pages preview in preview. Send `Cache-Control: private, no-store` on all diagnostic API responses.

- [ ] **Step 4: Persist one transaction and enqueue observation state**

Insert submission, self-declared evidence rows and an audit event in one D1 batch. Derive candidate-role inferences only after evidence IDs exist, then link each inference through `INFERENCE_SUPPORTED_BY_EVIDENCE`. Return only the opaque submission ID and received state.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-worker.test.ts scripts/marketing-diagnostic-contract.test.ts
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
npm run test:secret-integrity
git add workers/marketing-diagnostic scripts/marketing-diagnostic-worker.test.ts
git commit -m "feat: accept secure marketing diagnostic submissions"
```

### Task 5: Add bounded public-source observation

**Files:**
- Create: `workers/marketing-diagnostic/source-policy.ts`
- Create: `workers/marketing-diagnostic/source-observer.ts`
- Create: `scripts/marketing-diagnostic-source-policy.test.ts`
- Modify: `workers/marketing-diagnostic/index.ts`
- Modify: `workers/marketing-diagnostic/repository.ts`

**Interfaces:**
- Consumes: user-declared website/fanpage URLs.
- Produces: bounded `SourceObservation` plus Evidence Ledger record or an explicit limitation.

- [ ] **Step 1: Write security-first failing tests**

Reject localhost, `.local`, private/reserved IPv4 and IPv6 literals, credentials in URL, non-HTTPS, non-80/443 explicit ports, fragments and more than three redirects. Revalidate every redirect URL. Abort after 5 seconds, 256 KiB, non-HTML content or disallowed content encoding. Verify a blocked/timeout source still advances the submission to human review with limitation and no fabricated excerpt.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-source-policy.test.ts`

Expected: FAIL because the observer is absent.

- [ ] **Step 3: Implement the observation policy**

Public observation reads at most the submitted landing URL and extracts only title, description, visible heading summary and a content fingerprint. Facebook URLs record declared presence and fetch status; they do not bypass robots/login or use session cookies. Use `redirect: 'manual'`, stream-size accounting and injected `fetchImpl`.

```ts
export type ObservationResult =
  | { status: 'observed'; finalUrl: string; fingerprint: string; summary: string; retrievedAt: string }
  | { status: 'blocked' | 'unavailable' | 'timeout' | 'oversize'; limitation: string; retrievedAt: string }
```

- [ ] **Step 4: Persist provenance**

Every result creates `source_observations` and `evidence_records` with source, time, integrity and retention class. Only `observed` evidence may support a source-derived inference; declared evidence stays distinguishable from observed evidence.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-source-policy.test.ts scripts/marketing-diagnostic-worker.test.ts
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
git add workers/marketing-diagnostic scripts/marketing-diagnostic-source-policy.test.ts
git commit -m "feat: observe diagnostic sources safely"
```

### Task 6: Prepare assessments with evidence lineage and optional AI

**Files:**
- Create: `workers/marketing-diagnostic/assessment.ts`
- Create: `workers/marketing-diagnostic/ai-adapter.ts`
- Create: `workers/marketing-diagnostic/qualification.ts`
- Create: `scripts/marketing-diagnostic-assessment.test.ts`
- Modify: `workers/marketing-diagnostic/repository.ts`

**Interfaces:**
- Produces pending `CandidateRoleInference[]` and a review draft.
- Does not produce Sales Ready or invitation.

- [ ] **Step 1: Write failing invariant tests**

Assert every active inference has evidence, canonical `candidate_role_id`, generator version, expiry and confidence; expired inference cannot support a decision; AI timeout/error falls back to deterministic rule output; AI output with unknown role ID is rejected; raw sources/contact are not sent unless explicitly required and redacted.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-assessment.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement deterministic baseline and adapter**

The deterministic assessment is sufficient for human review. The optional adapter accepts a minimal structured packet and returns only canonical role candidates, rationale and evidence references. Validate its response as untrusted input. Set inference expiry to 30 days; store `generator_type`, `generator_version` and limitation.

- [ ] **Step 4: Implement F-P-I-A without a score**

```ts
export type FpiaBundle = {
  fitEvidenceIds: readonly string[]
  problemEvidenceIds: readonly string[]
  intentEvidenceIds: readonly string[]
  abilityEvidenceIds: readonly string[]
}

export function evaluateProductQualification(bundle: FpiaBundle):
  | { status: 'insufficient'; missing: readonly ('F'|'P'|'I'|'A')[] }
  | { status: 'product_qualified'; evidenceIds: readonly string[] }
```

No weighting and no numeric lead score. Product Qualified remains a pending rule decision until the operator reviews it.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-assessment.test.ts scripts/marketing-diagnostic-worker.test.ts
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
git add workers/marketing-diagnostic scripts/marketing-diagnostic-assessment.test.ts
git commit -m "feat: prepare evidence-linked marketing assessments"
```

### Task 7: Build the authenticated human review queue

**Files:**
- Create: `app/ops/marketing-assessments/page.tsx`
- Create: `app/ops/marketing-assessments/OpsAssessmentClient.tsx`
- Create: `app/ops/marketing-assessments/page.module.css`
- Create: `app/ops/marketing-assessments/[submissionId]/page.tsx`
- Create: `app/ops/marketing-assessments/[submissionId]/OpsAssessmentDetail.tsx`
- Create: `workers/marketing-diagnostic/admin-auth.ts`
- Modify: `workers/marketing-diagnostic/index.ts`
- Create: `scripts/marketing-diagnostic-admin.test.ts`

**Interfaces:**
- `GET /api/marketing-diagnostic/v1/admin/submissions`
- `GET /api/marketing-diagnostic/v1/admin/submissions/:id`
- `POST /api/marketing-diagnostic/v1/admin/submissions/:id/decisions`
- `POST /api/marketing-diagnostic/v1/admin/submissions/:id/results`

- [ ] **Step 1: Write failing auth and state tests**

Require authenticated operator identity, exact allowed issuer/audience/email allowlist, CSRF/origin protection for mutation, audit actor and reason. Assert unauthenticated requests return 401 without existence leak. Assert review never mutates or deletes the prior decision; override inserts a superseding decision.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-admin.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement the minimal queue**

The queue displays company, submitted time, review state and limitation count. Detail shows declared fields, observations, candidate roles, evidence links and history. Allowed actions are `Yêu cầu thêm thông tin`, `Không phù hợp`, `Product Qualified`, `Sales Ready`; Sales Ready is disabled until Product Qualified, declared conversation intent, appropriate timing and a non-empty review reason exist.

Do not implement contact pipeline, tasks, bulk action, nurture, sales stages or general notes.

- [ ] **Step 4: Protect static ops shells**

Add `noindex,nofollow` metadata. The public HTML contains no data and no secret. API denies unauthenticated access. Add `/ops/*` no-store and noindex headers in `public/_headers`; if Cloudflare Access is used, record application/audience verification in the release report rather than trusting a forwarded email alone.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-admin.test.ts scripts/marketing-diagnostic-assessment.test.ts
npx tsc --noEmit --pretty false
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
git add app/ops workers/marketing-diagnostic public/_headers scripts/marketing-diagnostic-admin.test.ts
git commit -m "feat: add human assessment review queue"
```

### Task 8: Issue private results and gated booking invitations

**Files:**
- Create: `app/diagnostic/result/page.tsx`
- Create: `app/diagnostic/result/DiagnosticResultClient.tsx`
- Create: `app/diagnostic/result/page.module.css`
- Create: `workers/marketing-diagnostic/result.ts`
- Create: `workers/marketing-diagnostic/invitation.ts`
- Create: `workers/marketing-diagnostic/booking-adapter.ts`
- Create: `scripts/marketing-diagnostic-result.test.ts`

**Interfaces:**
- Operator issues one opaque result token with expiry.
- Public result contains candidate role, why it matters, evidence limitations and next action.
- Invitation exists only for a reviewed Sales Ready decision and configured booking adapter.

- [ ] **Step 1: Write failing token and invitation tests**

Cover wrong token, expired token, replay policy, revoked token, deleted submission, no-store, noindex, projection allowlist, non-fit action and invitation invariants. Assert an expired inference, superseded decision or Product Qualified-only decision cannot produce an invitation. Assert every invitation has `offer_id`, `submission_id`, `decision_id`, expiry and actor.

- [ ] **Step 2: Run RED**

Run: `npx tsx --test scripts/marketing-diagnostic-result.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement token handling and public projection**

Store only a SHA-256 digest of 32 random bytes; return the raw token once. Result endpoint joins the current non-expired accepted inference and reviewed decision, then maps to:

```ts
export type PublicAssessmentResult = {
  status: 'reviewed'
  candidateRole: { id: CandidateRoleId; label: string }
  whyThisRole: readonly string[]
  firstAssignment: string
  humanControl: string
  limitation: readonly string[]
  nextAction:
    | { kind: 'learning'; href: string; label: string }
    | { kind: 'conversation'; invitationId: string; href: string; label: string }
}
```

Never serialize contact, raw answers, source excerpt, qualification label, confidence or private rationale.

- [ ] **Step 4: Implement booking adapter fail-closed**

```ts
export interface BookingAdapter {
  createLink(input: { invitationId: string; expiresAt: string }): Promise<string>
}
```

If `BOOKING_PROVIDER` or its server-side URL is absent, Sales Ready may issue a reviewed result but invitation creation returns `provider_not_configured` and does not expose a guessed URL. Manual operator contact remains available outside the public API.

- [ ] **Step 5: Verify and commit**

```bash
npx tsx --test scripts/marketing-diagnostic-result.test.ts scripts/marketing-diagnostic-admin.test.ts
npx tsc --noEmit --pretty false
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
git add app/diagnostic/result workers/marketing-diagnostic scripts/marketing-diagnostic-result.test.ts
git commit -m "feat: issue reviewed diagnostic results"
```

### Task 9: Publish the truthful Phòng Marketing AI offer page

**Files:**
- Create: `app/marketing-ai/page.tsx`
- Create: `app/marketing-ai/page.module.css`
- Create: `components/marketing-ai/CapabilityModule.tsx`
- Create: `components/marketing-ai/MarketingAiProcess.tsx`
- Create: `scripts/marketing-ai-offer-contract.test.mjs`
- Modify: `app/sitemap.ts`
- Modify: `lib/seo.ts`
- Modify: `components/site-chrome/site-navigation.ts`

**Interfaces:**
- Consumes: `marketingAiOffer`, `capabilityModules`, method registry.
- Produces: one public offer route with one primary diagnostic CTA.

- [ ] **Step 1: Write the failing offer truthfulness contract**

Require audience `doanh nghiệp đang có đội marketing hoặc content marketing`, one promise, four capability modules, fit/non-fit, bespoke status, working process, boundaries and CTA `/diagnostic`. Ban price, guarantee, fixed turnaround, 24/7 replacement language, separate checkout and unsupported client result.

- [ ] **Step 2: Run RED**

Run: `node --test scripts/marketing-ai-offer-contract.test.mjs`

Expected: FAIL because `/marketing-ai` is absent.

- [ ] **Step 3: Implement the offer page**

Structure: Hero → who it fits → current bottleneck → one tailored marketing room → four modules → method → human/AI boundary → non-fit → diagnostic CTA. Each module states work, input, output, standard, human control and public readiness. Avoid generic card wall; use a functional department plan/dossier composition.

- [ ] **Step 4: Add canonical metadata and sitemap**

Add `/marketing-ai` only when content is complete. Structured data may describe a service category but must not claim price, rating, availability or result. Verify internal links use `/marketing-ai` exactly.

- [ ] **Step 5: Verify and commit**

```bash
node --test scripts/marketing-ai-offer-contract.test.mjs
npm run test:seo
npm run build
npx tsc --noEmit --pretty false
npm run lint
git add app/marketing-ai components/marketing-ai app/sitemap.ts lib/seo.ts components/site-chrome/site-navigation.ts scripts/marketing-ai-offer-contract.test.mjs
git commit -m "feat: publish tailored Marketing AI offer"
```

### Task 10: Verify privacy lifecycle, journey and release candidate

**Files:**
- Create: `scripts/marketing-diagnostic-retention.test.ts`
- Create: `scripts/qa-marketing-diagnostic.mjs`
- Create: `docs/qa/MARKETING_AI_DIAGNOSTIC_REPORT.md`
- Create: `docs/releases/MARKETING_AI_DIAGNOSTIC_RELEASE_RUNBOOK.md`
- Modify: `docs/STATUS.md`
- Modify: `package.json`

**Interfaces:**
- Produces: export/delete proof, browser journey evidence, migration/recovery runbook and scoped preview artifact.

- [ ] **Step 1: Write export/delete and orphan-state tests**

Export must include the submitted user data, consent, observations and public decision history but exclude server secrets. Delete/anonymize must revoke result tokens/invitations, expire usable inference and prevent orphan commercial state while preserving minimal non-PII audit required by policy.

- [ ] **Step 2: Run focused security gate**

```bash
npx tsx --test \
  scripts/marketing-diagnostic-contract.test.ts \
  scripts/marketing-diagnostic-worker.test.ts \
  scripts/marketing-diagnostic-source-policy.test.ts \
  scripts/marketing-diagnostic-assessment.test.ts \
  scripts/marketing-diagnostic-admin.test.ts \
  scripts/marketing-diagnostic-result.test.ts \
  scripts/marketing-diagnostic-retention.test.ts
node --test scripts/marketing-diagnostic-migration.test.mjs
```

Expected: PASS.

- [ ] **Step 3: Run rendered QA**

At 1440, 1366, 1024, 768, 390 and 320 widths test complete form, validation, network error/retry, Turnstile failure fixture, submitted state, authenticated review fixture, non-fit result, Sales Ready result and provider-not-configured state. Test keyboard-only progression, reduced motion, no overlap, no horizontal overflow, 44px controls, focus restore and console/network errors.

- [ ] **Step 4: Conduct the brevity pilot**

Run at least five near-ICP people through the form. Pass when median completion is at most five minutes and at least four finish without moderator. After twenty non-bot starts, require completion at least 65% and no step loss above 25%. Do not fabricate pilot data; until available, label release PARTIAL and keep production submission disabled.

- [ ] **Step 5: Run full local gate**

```bash
npm test
npx tsc --noEmit --pretty false
npx tsc --noEmit -p tsconfig.marketing-diagnostic-worker.json --pretty false
npm run lint
npm run build
npm run test:seo
npm run test:bundle
npm run test:secret-integrity
node scripts/qa-marketing-diagnostic.mjs
git diff --check
```

Expected: all automated checks PASS.

- [ ] **Step 6: Prepare preview and recovery evidence**

Apply migration locally and to a disposable preview D1 only. Dry-run Worker bundle and verify binding names. Upload immutable Pages preview; deploy a preview Worker route that cannot touch production D1. Record HTML fingerprint, Worker bundle hash, migration list, D1 Time Travel procedure, result-token revocation and previous Worker/Pages rollback targets.

- [ ] **Step 7: Commit evidence**

```bash
git add scripts/marketing-diagnostic-retention.test.ts scripts/qa-marketing-diagnostic.mjs docs/qa/MARKETING_AI_DIAGNOSTIC_REPORT.md docs/releases/MARKETING_AI_DIAGNOSTIC_RELEASE_RUNBOOK.md docs/STATUS.md package.json
git commit -m "test: verify marketing diagnostic release candidate"
```

## Self-Review Gate

- [ ] No client field can set workspace, offer, qualification, review or invitation state.
- [ ] No active inference lacks an Evidence Ledger relationship.
- [ ] No expired/superseded state can produce a result or invitation.
- [ ] No booking link exists before human Sales Ready review.
- [ ] No raw answer, contact, URL or private note enters analytics or public bundle.
- [ ] Safe fetch tests cover direct target, every redirect, size, timeout and content type.
- [ ] Migration passes empty and populated snapshots and has an operational recovery note.
- [ ] `rg -n "lead.?score|auto.*sales.?ready|TODO|TBD|placeholder" app/diagnostic app/marketing-ai app/ops lib/marketing-diagnostic workers/marketing-diagnostic` returns no unapproved implementation placeholder.
- [ ] `git diff origin/main...HEAD -- app/learn lib/learn-release.ts components/vid workers/vid` is empty except intentionally cherry-picked shared shell changes reviewed in the ecosystem plan.
- [ ] No production D1, Worker route, booking provider or email provider was mutated by this plan.
