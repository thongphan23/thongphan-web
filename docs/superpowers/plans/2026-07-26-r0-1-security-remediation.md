# R0.1 Security and Integrity Remediation Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to execute this plan task by task. Use `superpowers:test-driven-development` for every source change and `superpowers:verification-before-completion` before reporting success. Execution requires a separate project-owner prompt.

**Goal:** Retire the two unnecessary public AI capabilities, make Brain2 signup
truthful, hard-quarantine legacy email rows, contain exposed Cloudflare credential
material, and produce verified R0.1 evidence without starting R0.2 or PRD-R1.

**Architecture:** Exact Cloudflare routes `/api/embed` and `/api/chat` remain in
place but run a shared dependency-free `410 Gone` tombstone with no AI or data
bindings. `/chat` stays a deterministic local page. Signup persists registration
only; email audience state is independent from queue delivery status and is locked
non-sendable in D1. A provider-aware scanner protects the working tree and Git
history without printing secrets.

**Tech stack:** Next.js 16 static export, React 19, TypeScript 6, Node test runner,
Cloudflare Workers, Wrangler 4.110.0, D1/SQLite, native Node scripts.

**Design authority:**
`docs/superpowers/specs/2026-07-26-r0-1-security-remediation-design.md`

## Global execution constraints

1. Start from `/Users/rio/thongphan-com`; record branch, HEAD, upstream and dirty
   state before any write.
2. Do not stash, reset, clean, checkout, delete or overwrite an unrelated change.
3. Add only exact task files to each commit. Never use `git add .` or `git add -A`.
4. Keep `/library`, `/library/read/*`, `/chat`, canonical metadata, sitemap and the
   global router unchanged.
5. Do not create `/read`, auth, membership, payment, entitlement, multi-tenancy or a
   new AI/internal-ingestion feature.
6. Do not deploy the email Worker, add a cron, send email, call a provider send API,
   or import an audience.
7. Preview QA is read-only because Pages preview and production share D1/KV.
8. Never print a token value, fragment, hash, request authorization header, name or
   email address.
9. Use repository-pinned Wrangler. Current documentation can be checked online, but
   do not upgrade dependencies in R0.1.
10. Remote mutation tasks require explicit owner authorization in the execution
    prompt. Git history rewrite requires a second explicit destructive-action gate.
11. Stop after the R0.1 report. Do not start R0.2 or PRD-R1.

## Task 1: Install the working-tree preservation gate

### Goal

Create an executable baseline/verification guard so R0.1 can prove that pre-existing
dirty files, `tsconfig.tsbuildinfo`, and the four Conan Maker assets are preserved.

### Exact files

- Create: `scripts/r0-1-change-boundary.mjs`
- Create: `scripts/r0-1-change-boundary.test.mjs`
- Modify: `package.json`
- Create: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

`scripts/r0-1-change-boundary.mjs` exposes:

```text
capture --output <absolute-json-path> --protect <repo-relative-path>...
verify  --baseline <absolute-json-path> --allow <repo-relative-path>...
```

The JSON stores starting HEAD, NUL-safe porcelain entries and SHA-256 for protected
files. `verify` fails when a protected hash changes, a starting dirty path disappears,
or a new changed path falls outside the allowlist. Output contains paths and states,
never file contents.

Protected paths for this release:

```text
tsconfig.tsbuildinfo
public/conanmaker/assets/index-CIK0RB8_.css
public/conanmaker/assets/index-Dqi6Mg8p.js
public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg
public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

### RED test

Write tests with a temporary Git fixture that contains one dirty tracked file and one
untracked file. Change the protected file, delete the untracked file, and add a path
outside the allowlist.

```bash
node --test scripts/r0-1-change-boundary.test.mjs
```

### Expected failure

The test fails because `scripts/r0-1-change-boundary.mjs` does not exist. After a
minimal shell, each malicious fixture fails for the exact path while a no-change
fixture passes.

### Minimal implementation

Use only `node:child_process`, `node:crypto`, `node:fs` and `node:path`. Invoke
`git status --porcelain=v1 -z` and parse NUL-delimited records. Refuse relative output
paths, repository roots other than the current Git root, missing protected files,
duplicate flags and unknown arguments. Write the baseline with mode `0600` outside
the repository.

Add:

```json
"test:r0-1-boundary": "node --test scripts/r0-1-change-boundary.test.mjs"
```

Create the implementation report with `Status: IN PROGRESS`, starting branch/HEAD,
the pre-existing dirty-path list and the five starting hashes. Do not copy file bodies.

Capture the real baseline:

```bash
node scripts/r0-1-change-boundary.mjs capture \
  --output /tmp/thongphan-r0-1-boundary.json \
  --protect tsconfig.tsbuildinfo \
  --protect public/conanmaker/assets/index-CIK0RB8_.css \
  --protect public/conanmaker/assets/index-Dqi6Mg8p.js \
  --protect public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg \
  --protect public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

### Verification command

```bash
npm run test:r0-1-boundary
node scripts/r0-1-change-boundary.mjs verify \
  --baseline /tmp/thongphan-r0-1-boundary.json \
  --allow scripts/r0-1-change-boundary.mjs \
  --allow scripts/r0-1-change-boundary.test.mjs \
  --allow package.json \
  --allow docs/security/R0-1-IMPLEMENTATION-REPORT.md
```

### Expected success

All fixture tests pass; the real guard reports the five protected hashes unchanged
and every starting dirty path still present.

### Documentation update

Record command, exit code and baseline path in
`docs/security/R0-1-IMPLEMENTATION-REPORT.md`.

### Rollback

Delete only the two newly created scripts and the new report, remove the one package
script, and leave the pre-existing dirty state untouched.

### Proposed commit

```text
test: guard R0.1 working tree boundaries
```

## Task 2: Add secret detection and sanitize the current tree

### Goal

Detect provider-token patterns without disclosing values, rotate both Cloudflare
credential candidates, sanitize tracked/local plaintext, and make the gate permanent.

### Exact files

- Create: `scripts/secret-integrity-scan.mjs`
- Create: `scripts/secret-integrity-scan.test.mjs`
- Modify: `package.json`
- Modify: `.claude/handoff.md`
- Modify: `.claude/handoff-chat.md`
- Modify locally after rotation, never commit: `.env.embed.local`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

```text
node scripts/secret-integrity-scan.mjs [--history] [--include-local-env]
```

Rules cover named token/key/secret assignments and token-labeled prose with a
high-entropy value of at least 32 characters. Exit `0` means zero prohibited values;
exit `1` means findings; exit `2` means scanner/config failure. Findings expose only
`rule_id`, relative file, line and classification. Synthetic values in the scanner's
own test fixtures are allowed only inside temporary directories.

### RED test

Create temporary fixtures for a quoted Cloudflare token assignment, a prose line that
labels a value as valid, an environment-variable reference without a value, a
placeholder, and an unrelated long checksum.

```bash
node --test scripts/secret-integrity-scan.test.mjs
```

### Expected failure

The test fails because the scanner module does not exist. The repository scan then
fails with the already verified tracked and local locations while printing no value.

### Minimal implementation

Use native Node and `git ls-files`. Scan tracked text files and, only with
`--include-local-env`, the exact ignored `.env*` files beneath the repository root.
Reject symlinks and files larger than a bounded text ceiling. For history mode, use
Git plumbing to inspect reachable text blobs without checking out or printing them.

Add scripts:

```json
"test:secret-integrity": "node scripts/secret-integrity-scan.mjs --include-local-env",
"test:secret-integrity:history": "node scripts/secret-integrity-scan.mjs --history"
```

Add the unit test to `npm test` and both scans to `test:release`.

Before source sanitization, the authorized Cloudflare administrator must revoke or
rotate:

1. the single tracked candidate repeated at `.claude/handoff.md:323` and
   `.claude/handoff-chat.md:809`, `:818`, `:822`;
2. the distinct candidate at `.env.embed.local:1`.

Record only the non-secret confirmation time and actor. Replace tracked literals with
`[REDACTED — credential rotated]` and commands with
`CLOUDFLARE_API_TOKEN` environment-variable references. Sanitize the ignored local
assignment after rotation without echoing its old value. Placeholder-only lines may
remain only when the scanner classifies them as placeholders.

### Verification command

```bash
npm run test:secret-integrity
node --test scripts/secret-integrity-scan.test.mjs
git diff --check -- .claude/handoff.md .claude/handoff-chat.md package.json scripts/secret-integrity-scan.mjs scripts/secret-integrity-scan.test.mjs
```

History mode is expected to remain red until Task 9.

### Expected success

Unit fixtures pass; current tracked and approved local files contain zero prohibited
credential values; output never contains a fixture value; history scan still reports
file/line-only findings and therefore prevents premature R0.1 closure.

### Documentation update

Record provider, owner, rotation confirmation, sanitized paths and scan counts. Do not
record token IDs or values.

### Rollback

Do not restore revoked credentials or plaintext. If prose quality regresses, rewrite
the surrounding handoff text while keeping `[REDACTED — credential rotated]` and the
environment-variable-only instruction.

### Proposed commit

```text
security: detect and redact credential plaintext
```

## Task 3: Replace `/api/embed` with a binding-free 410 tombstone

### Goal

Make every `/api/embed` request incapable of body parsing, AI invocation or Vectorize
write while retaining an explicit decommission response on the current exact route.

### Exact files

- Create: `workers/security/disabled-endpoint.ts`
- Create: `scripts/embed-worker-security.test.ts`
- Modify: `workers/embed-vault.ts`
- Modify: `wrangler.embed.toml`
- Modify: `tsconfig.brain2-workers.json`
- Modify: `package.json`
- Delete: `scripts/embed-via-worker.ts`
- Delete: `scripts/upload-to-embedder.ts`
- Delete: `scripts/embed-brain2.ts`
- Modify: `workers/README.md`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

`workers/security/disabled-endpoint.ts` exports:

```ts
export type DisabledEndpointPath = '/api/embed' | '/api/chat'

export interface DisabledEndpointEvent {
  event: 'disabled_endpoint_hit'
  endpoint: DisabledEndpointPath
  method: string
  status: 410
  request_id: string | null
  ai_calls: 0
  vector_reads: 0
  vector_writes: 0
}

export type SecurityLogger = (event: DisabledEndpointEvent) => void

export function createDisabledEndpointWorker(
  endpoint: DisabledEndpointPath,
  logger?: SecurityLogger,
): ExportedHandler
```

Every method returns status `410` with `Cache-Control: private, no-store, max-age=0`,
`Content-Type: application/problem+json; charset=utf-8`,
`X-Content-Type-Options: nosniff`, and `X-TP-Endpoint-State: disabled`. The fixed body
is `{ "type":"about:blank", "title":"Endpoint disabled", "status":410 }`.

### RED test

Import the current embed Worker and send:

1. unauthenticated POST with a synthetic vector payload;
2. POST with fabricated `CF-Access-Client-Id` and `CF-Access-Client-Secret`;
3. oversized streamed POST whose stream counts reads;
4. GET and OPTIONS.

Use an environment Proxy that throws and counts any property access.

```bash
node --import tsx --test scripts/embed-worker-security.test.ts
```

### Expected failure

The current anonymous POST reaches `env.AI`, the response is not 410, and the current
config contains `AI` plus `BRAIN2_INDEX`. The test fails before a real write because
the spy throws on first binding access.

### Minimal implementation

Replace `workers/embed-vault.ts` with a thin export of
`createDisabledEndpointWorker('/api/embed')`. It has no `Env` interface. Update
`wrangler.embed.toml` to retain name/main/compatibility/exact route, remove `[ai]` and
`[[vectorize]]`, set `workers_dev=false`, `preview_urls=false`, and enable sampled
observability. Remove all three unsupported ingestion scripts. Do not add an internal
route or replacement writer.

Include the shared security module and both retired Worker entries in
`tsconfig.brain2-workers.json`. Add the focused test to `npm test`.

### Verification command

```bash
node --import tsx --test scripts/embed-worker-security.test.ts
npm run typecheck:brain2-workers
npx wrangler deploy --dry-run --outdir /tmp/r0-1-embed-tombstone --config wrangler.embed.toml
if rg -n '(BRAIN2_INDEX|VectorizeIndex|\.upsert\(|\[ai\]|\[\[vectorize\]\])' workers/embed-vault.ts workers/security/disabled-endpoint.ts wrangler.embed.toml; then exit 1; fi
test ! -e scripts/embed-via-worker.ts
test ! -e scripts/upload-to-embedder.ts
test ! -e scripts/embed-brain2.ts
```

The final `rg` exits with no match for the removed embed write path; matches belonging
to the separately audited email/access code are outside its file set.

### Expected success

All methods and fabricated identity headers return 410; the body stream is never read;
environment access and vector-write counters are zero; dry-run succeeds and lists no
binding.

### Documentation update

Update `workers/README.md` to state that `brain2-embedder` is a tombstone and no
supported ingestion workflow exists. Record bundle bytes and dry-run binding output in
the implementation report.

### Rollback

Re-deploy the last verified tombstone version. Never roll back to an unauthenticated
writer. If the exact route is lost, restore only the tombstone route/config.

### Proposed commit

```text
security: retire public Vectorize ingestion
```

## Task 4: Disable `/api/chat` while preserving the local `/chat` journey

### Goal

Remove all production AI/Vectorize capability and remote-client reactivation paths
without removing or renaming the public `/chat` page.

### Exact files

- Create: `scripts/chat-worker-security.test.ts`
- Modify: `workers/api/chat.ts`
- Modify: `wrangler.chat.toml`
- Modify: `app/chat/ChatClient.tsx`
- Modify: `app/chat/chat-model.ts`
- Modify: `scripts/chat-journey.test.ts`
- Modify: `scripts/subpage-cinema-contract.test.mjs`
- Delete: `app/api/chat/route.ts`
- Modify: `package.json`
- Modify: `workers/README.md`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

`workers/api/chat.ts` exports the shared
`createDisabledEndpointWorker('/api/chat')` result and has no environment bindings.
`ChatClient.sendMessage(text)` always uses `createLocalChatTurn(text)`. The public
message/recommendation types in `app/chat/chat-model.ts` remain unchanged. The SSE
parser and `NEXT_PUBLIC_CHAT_API_URL` branch are removed.

### RED test

1. Import the current chat Worker with AI and Vectorize spies.
2. Send anonymous POST, GET, OPTIONS and a 25-request concurrent POST burst.
3. Inspect `wrangler.chat.toml` for paid/data bindings.
4. Inspect `ChatClient.tsx` and the built source contract for remote URL/fetch hooks.
5. Run the current chat journey test after changing its expected invariant to
   local-only.

```bash
node --import tsx --test scripts/chat-worker-security.test.ts scripts/chat-journey.test.ts
```

### Expected failure

The current POST reaches Workers AI, OPTIONS returns wildcard CORS, the config exposes
AI/Vectorize, and the client contains a public environment URL branch.

### Minimal implementation

Replace the Worker with the shared 410 tombstone. Retain the exact apex route, remove
`[ai]`, `[[vectorize]]` and `nodejs_compat`, set `workers_dev=false` and
`preview_urls=false`, and enable sampled observability. Delete the dead Next proxy.
Simplify the client to its existing local model and preserve recommendations, loading
state, accessibility and error-free keyboard flow. Remove only SSE code that becomes
unreachable.

The burst test is the rate/budget contract: every response is 410 and the aggregate
AI/Vectorize call count is zero. No runtime rate-limit binding is added to a constant,
dependency-free tombstone.

### Verification command

```bash
node --import tsx --test scripts/chat-worker-security.test.ts scripts/chat-journey.test.ts
npm run typecheck:brain2-workers
npx wrangler deploy --dry-run --outdir /tmp/r0-1-chat-tombstone --config wrangler.chat.toml
if rg -n '(NEXT_PUBLIC_CHAT_API_URL|thongphan-chat-api|BRAIN2_INDEX|VectorizeIndex|AI\.run|\[ai\]|\[\[vectorize\]\])' app/chat/ChatClient.tsx app/chat/chat-model.ts workers/api/chat.ts wrangler.chat.toml; then exit 1; fi
test ! -e app/api/chat/route.ts
```

### Expected success

The Worker returns 410 for all cases and 25 burst requests with zero downstream call;
dry-run lists no binding; the remote-url scan has no match; local chat still returns
one useful answer and three unique recommendations; `/chat` canonical/navigation tests
pass.

### Documentation update

Record that `/chat` remains public/local and `/api/chat` is retired. Record the dry-run
bundle and zero-binding result.

### Rollback

If local `/chat` regresses, revert only `ChatClient.tsx`, `chat-model.ts` and their
tests to the last local-only implementation. Keep the Worker tombstone, removed
bindings and deleted proxy.

### Proposed commit

```text
security: retire remote chat capability
```

## Task 5: Make signup behavior and copy truthful

### Goal

Represent a successful signup as persisted registration only, ensure it creates no
`email_queue` rows, and direct the visitor to existing Day 01.

### Exact files

- Create: `lib/brain2/signup-contract.ts`
- Modify: `components/SignupForm.tsx`
- Modify: `workers/brain2-campaign.ts`
- Modify: `scripts/brain2-email-campaign.test.ts`
- Modify: `scripts/brain2-route-contract.test.ts`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

```ts
export const BRAIN2_SIGNUP_SUCCESS_MESSAGE =
  'Đã ghi nhận đăng ký. Email tự động hiện chưa được kích hoạt; bạn có thể bắt đầu Ngày 01 ngay trên website.'

export const BRAIN2_SIGNUP_DATA_NOTICE =
  'Tên và email được lưu để ghi nhận đăng ký 21 ngày Brain2. Email tự động hiện chưa được kích hoạt và địa chỉ này không được thêm vào newsletter.'

export const BRAIN2_DAY_ONE_PATH = '/brain2/21-ngay/ngay-01'
```

`handleBrain2SignupRequest()` keeps its current stable error response and rate-limit
contract. On success it batches only the `challenge_signups` insert and returns
`BRAIN2_SIGNUP_SUCCESS_MESSAGE`.

### RED test

Change the signup test to assert:

- UI and API import the same message contract;
- neither built/source success copy contains a fixed delivery time or claims email
  delivery;
- the data-use notice is adjacent to the form;
- successful signup prepares no `INSERT INTO email_queue` statement;
- the database batch contains exactly one signup statement;
- success link resolves to `BRAIN2_DAY_ONE_PATH`;
- duplicate/rate-limit/error behavior is unchanged.

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts scripts/brain2-route-contract.test.ts
```

### Expected failure

The current UI and Worker contain the five-minute promise and the successful signup
prepares 21 queue statements.

### Minimal implementation

Add the pure contract module and import it from both UI and Worker. Replace the success
paragraph with the canonical message and Day 01 link. Add the descriptive data-use
notice with an accessible relationship to the form. Remove
`buildBrain2CampaignSchedule()`, `buildBrain2QueueStatements()` and their scheduling
constants because signup no longer queues email. Preserve validated templates for the
inert sender source, but do not activate it.

### Verification command

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts scripts/brain2-route-contract.test.ts
npx tsc --noEmit --incremental false
npm run typecheck:brain2-workers
if rg -n '(5 phút|trong vòng 5 phút|Email đầu tiên sẽ đến)' components workers lib app; then exit 1; fi
```

### Expected success

Focused tests pass, `rg` returns no false delivery promise in executable source, a
synthetic successful signup produces exactly one D1 statement, and all current abuse
and duplicate responses remain stable.

### Documentation update

Record the canonical message, data-use notice and zero-queue behavior. Do not claim
consent or delivery readiness.

### Rollback

If rendering fails, restore the previous component structure around the canonical
message and Day 01 link. Do not restore the delivery promise or queue creation.

### Proposed commit

```text
fix: make Brain2 signup behavior truthful
```

## Task 6: Add explicit non-sendable legacy quarantine

### Goal

Create and locally prove a D1 contract in which all 210 legacy rows are explicitly
`quarantined_legacy`, every row is non-sendable, and sender selection is impossible.

### Exact files

- Create: `workers/migrations/0003_r0_1_email_integrity.sql`
- Modify: `workers/api/email-drip.ts`
- Modify: `scripts/brain2-email-campaign.test.ts`
- Modify: `workers/README.md`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

### Interfaces

Migration columns:

```sql
audience_state TEXT NOT NULL DEFAULT 'delivery_inactive'
  CHECK (audience_state IN ('delivery_inactive', 'quarantined_legacy', 'sendable'))
sendable INTEGER NOT NULL DEFAULT 0
  CHECK (sendable IN (0, 1))
```

Migration guards:

- temporarily drop `quarantine_legacy_email_update`;
- update only `campaign_version='legacy-v0'` to
  `audience_state='quarantined_legacy', sendable=0`;
- recreate immutable legacy update/delete triggers;
- add insert and update triggers that abort when `sendable <> 0` or
  `audience_state='sendable'`;
- sender claim/update/expire SQL requires the expected v1 campaign and
  `audience_state='sendable' AND sendable=1`, an intentionally impossible R0.1
  conjunction that returns zero rows.

The sender Worker and cron remain absent. A later approved email release must add a
new migration and consent contract before any row can become sendable.

### RED test

Extend the real SQLite fixture to apply `workers/schema.sql`, migration `0002`, then
the new migration. Seed ten signup rows and 210 queue rows, including one
case-insensitive duplicate group, without printing address values.

Assert:

1. exact aggregate `legacy-v0|pending|quarantined_legacy|0|210`;
2. zero sendable rows across every campaign/status;
3. update/insert attempts with `sendable=1` fail;
4. update/delete of a legacy row fail;
5. sender claim returns no item and provider fetch count stays zero;
6. duplicate inventory returns one aggregate group;
7. pending, failed, bounced and invalid fixture states never become sendable;
8. no raw name/email appears in test output or report.

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts
```

### Expected failure

The new migration file/columns do not exist, current rows expose only
`campaign_version`, and current sender SQL has no audience/sendable predicate.

### Minimal implementation

Write one forward-only migration with exact guards above. Do not rebuild the queue
table, delete rows, merge duplicates or change delivery status. Add the two predicates
to every sender claim/owned update/expire path so no alternate sender state bypasses
the audience gate. Keep `crons=[]` and do not deploy the email Worker.

### Verification command

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts
npm run typecheck:brain2-workers
npx wrangler deploy --dry-run --outdir /tmp/r0-1-email-inert --config wrangler.brain2-email.toml
git diff --check -- workers/migrations/0003_r0_1_email_integrity.sql workers/api/email-drip.ts scripts/brain2-email-campaign.test.ts workers/README.md
```

### Expected success

SQLite aggregates are exact; all mutation guards fail closed; sender/provider count is
zero; Worker dry-run passes while the tracked cron remains empty.

### Documentation update

Record source inventory, consent-field absence, duplicate count, invalid/bounce rule,
retention owner gate and local migration output in the implementation report.

### Rollback

Before remote application there is no data rollback. After remote application, use
the pre-migration D1 Time Travel bookmark only if schema/data integrity fails and the
owner confirms no legitimate post-bookmark signup would be lost. Never roll back by
making legacy rows sendable.

### Proposed commit

```text
security: hard quarantine legacy email rows
```

## Task 7: Update current-state architecture documents

### Goal

Make operational documentation reflect the implemented tombstones, local chat,
truthful signup, non-sendable audience model and remaining R0.2 boundary.

### Exact files

- Modify: `docs/discovery/CURRENT-SYSTEM-AUDIT.md`
- Modify: `docs/architecture/SAD-CLOUDFLARE-FIRST.md`
- Modify: `docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md`
- Modify: `docs/STATUS.md`
- Modify: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`

`docs/discovery/R0-AUDIT-REPORT.md` remains an immutable R0 baseline and is not edited.

### Interfaces

Each document must distinguish:

- source complete versus production deployed;
- `/chat` page versus disabled `/api/chat`;
- registration storage versus email delivery/consent;
- queue delivery status versus audience eligibility;
- R0.1 endpoint binding removal versus R0.2 environment isolation.

### RED test

Before editing, run an exact documentation contract:

```bash
node - <<'NODE'
const fs = require('node:fs')
const files = [
  'docs/discovery/CURRENT-SYSTEM-AUDIT.md',
  'docs/architecture/SAD-CLOUDFLARE-FIRST.md',
  'docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md',
  'docs/STATUS.md',
]
const text = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n')
if (!text.includes('/api/embed` returns `410')) process.exit(1)
if (!text.includes('quarantined_legacy')) process.exit(1)
if (!text.includes('sendable = false')) process.exit(1)
if (!text.includes('R0.2')) process.exit(1)
NODE
```

### Expected failure

Current documents describe both Workers as active AI surfaces and legacy state only
as `legacy-v0`, so the contract exits 1.

### Minimal implementation

Update current-state tables and data-flow diagrams with evidence from Tasks 3–6.
Record that email remains undeployed, `/chat` remains local, exact API routes return
410, and preview/production D1 isolation is unresolved. Set `docs/STATUS.md` to
“R0.1 implementation in progress” until production and history gates pass.

### Verification command

Run the documentation contract above, then:

```bash
git diff --check -- docs/discovery/CURRENT-SYSTEM-AUDIT.md docs/architecture/SAD-CLOUDFLARE-FIRST.md docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md docs/STATUS.md docs/security/R0-1-IMPLEMENTATION-REPORT.md
```

### Expected success

The contract exits 0, every current-state claim matches source evidence, R0.2 remains
open, and the report still says `IN PROGRESS`.

### Documentation update

This task is the documentation update. Include file:line evidence after line numbers
stabilize.

### Rollback

Revert only claims unsupported by source or command evidence. Do not restore a claim
that AI/email capability is live.

### Proposed commit

```text
docs: record R0.1 remediated architecture
```

## Task 8: Run the complete local release gate in a disposable worktree

### Goal

Prove the committed implementation without mutating the canonical worktree's unrelated
dirty files or tracked build-info file.

### Exact files

- Update after evidence: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`
- No application/source change

### Interfaces

The report status remains `IN PROGRESS` until every local command passes. Verification
runs from a detached clean worktree at the current implementation commit.

### RED test

```bash
rg -n '^Status: PASS$' docs/security/R0-1-IMPLEMENTATION-REPORT.md
```

### Expected failure

The report is still `IN PROGRESS`, so the command exits 1 and prevents a premature
completion claim.

### Minimal implementation

Commit all Tasks 1–7 first. Then:

```bash
r0_1_verify_dir=$(mktemp -d /tmp/thongphan-r0-1-verify.XXXXXX)
git worktree add --detach "$r0_1_verify_dir" HEAD
cd "$r0_1_verify_dir"
npm ci
npx tsc --noEmit --incremental false
npm run typecheck:brain2-workers
npm run lint
npm test
npm run build
npm run test:release
npm run test:read-release-safety
npm run test:secret-integrity
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-embed --config wrangler.embed.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-chat --config wrangler.chat.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-signup --config wrangler.signup.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-router --config wrangler.router.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-access --config wrangler.brain2-access.jsonc
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-email --config wrangler.brain2-email.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1-dry-legacy --config wrangler.brain2-legacy-redirect.jsonc
git diff --check HEAD
cd /Users/rio/thongphan-com
git worktree remove "$r0_1_verify_dir"
```

Inspect embed/chat dry-run output and fail if either lists any binding.

### Verification command

```bash
node scripts/r0-1-change-boundary.mjs verify \
  --baseline /tmp/thongphan-r0-1-boundary.json \
  --allow .claude/handoff.md \
  --allow .claude/handoff-chat.md \
  --allow app/api/chat/route.ts \
  --allow app/chat/ChatClient.tsx \
  --allow app/chat/chat-model.ts \
  --allow components/SignupForm.tsx \
  --allow docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md \
  --allow docs/architecture/SAD-CLOUDFLARE-FIRST.md \
  --allow docs/discovery/CURRENT-SYSTEM-AUDIT.md \
  --allow docs/security/R0-1-IMPLEMENTATION-REPORT.md \
  --allow docs/STATUS.md \
  --allow lib/brain2/signup-contract.ts \
  --allow package.json \
  --allow scripts/brain2-email-campaign.test.ts \
  --allow scripts/brain2-route-contract.test.ts \
  --allow scripts/chat-journey.test.ts \
  --allow scripts/chat-worker-security.test.ts \
  --allow scripts/embed-brain2.ts \
  --allow scripts/embed-via-worker.ts \
  --allow scripts/embed-worker-security.test.ts \
  --allow scripts/r0-1-change-boundary.mjs \
  --allow scripts/r0-1-change-boundary.test.mjs \
  --allow scripts/r0-1-production-smoke.mjs \
  --allow scripts/r0-1-production-smoke.test.mjs \
  --allow scripts/secret-integrity-scan.mjs \
  --allow scripts/secret-integrity-scan.test.mjs \
  --allow scripts/subpage-cinema-contract.test.mjs \
  --allow scripts/upload-to-embedder.ts \
  --allow tsconfig.brain2-workers.json \
  --allow workers/README.md \
  --allow workers/api/chat.ts \
  --allow workers/api/email-drip.ts \
  --allow workers/brain2-campaign.ts \
  --allow workers/embed-vault.ts \
  --allow workers/migrations/0003_r0_1_email_integrity.sql \
  --allow workers/security/disabled-endpoint.ts \
  --allow wrangler.chat.toml \
  --allow wrangler.embed.toml
git status --short
```

The guard treats every allow entry as one exact path; deletion of the four retired
source files is allowed, while every unrelated descendant remains protected.

### Expected success

TypeScript, Worker TypeScript, lint, full tests, build, release, Read safety, seven
Wrangler dry-runs and current-tree secret scan pass. Embed/chat dry-runs list zero
bindings. The canonical worktree's five protected hashes are byte-identical.

### Documentation update

Record each command, exit code, test count, route count, bundle bytes and dry-run
bindings. Keep report status `IN PROGRESS` because production and history gates remain.

### Rollback

No runtime rollback applies. Remove only the disposable worktree. If a gate fails,
return to the owning task, add a regression test and repeat Task 8 from a new clean
worktree.

### Proposed commit

```text
docs: record R0.1 local verification
```

## Task 9: Execute the owner-gated production cutover

### Goal

Deploy both tombstones, apply the non-sendable migration, deploy truthful signup and
Pages copy, then prove the live state without sending email or mutating from preview.

### Exact files

- Create: `scripts/r0-1-production-smoke.mjs`
- Create: `scripts/r0-1-production-smoke.test.mjs`
- Modify: `package.json`
- Update: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`
- Update: `docs/STATUS.md`

### Interfaces

```text
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --controlled-signup
```

Read-only mode checks endpoint status/headers, `/chat`, `/library`, a representative
reader route, canonical and sitemap without POSTing signup. Controlled-signup mode
requires an explicit synthetic address supplied through an environment variable,
creates one signup, verifies zero queue rows for its returned signup ID, and removes
the synthetic signup only after aggregate evidence is captured. It never touches
legacy rows or calls an email provider.

### RED test

Write fetch/database adapter fixtures first, then run the read-only smoke against the
current production before deployment:

```bash
node --test scripts/r0-1-production-smoke.test.mjs
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
```

### Expected failure

Fixture tests initially fail because the runner does not exist. The current live smoke
fails because `/api/embed` returns 200 and `/api/chat` GET returns 405 instead of 410.

### Minimal implementation

Use native fetch with timeouts, exact status/header assertions, bounded response reads
and redacted JSON output. Commit the runner before remote mutation.

After a fresh owner approval and Cloudflare status check:

1. Deploy tombstones first:

```bash
npx wrangler deploy --strict --config wrangler.embed.toml
npx wrangler deploy --strict --config wrangler.chat.toml
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
```

2. Capture D1 Time Travel and exact pre-migration aggregates:

```bash
npx wrangler d1 time-travel info thongphan-db --config wrangler.brain2-email.toml --json
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status ORDER BY campaign_version,status; SELECT COUNT(*) AS email_log_count FROM email_logs;"
```

Expected precondition: exactly 210 `legacy-v0/pending`, zero email logs, zero v1 rows.
Stop on drift.

3. Apply only migration `0003` through the ledger and read back aggregate state:

```bash
npx wrangler d1 migrations list thongphan-db --remote --config wrangler.brain2-email.toml
npx wrangler d1 migrations apply thongphan-db --remote --config wrangler.brain2-email.toml
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,audience_state,sendable,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status,audience_state,sendable ORDER BY campaign_version,status,audience_state,sendable; SELECT COUNT(*) AS email_log_count FROM email_logs;"
```

Expected: `legacy-v0|pending|quarantined_legacy|0|210`, zero sendable and zero logs.
The migration-list command must show exactly `0003_r0_1_email_integrity.sql` as
unapplied. Any additional unapplied file stops the rollout before `migrations apply`.

4. Deploy signup Worker, build once, deploy a read-only preview, then main Pages:

```bash
npx wrangler deploy --strict --config wrangler.signup.toml
npm run build
r0_1_release_sha=$(git rev-parse HEAD)
npx wrangler pages deploy out --project-name thongphan-com --branch r0-1-security-preview --commit-hash "$r0_1_release_sha"
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash "$r0_1_release_sha"
```

Preview smoke is static/read-only. Controlled signup runs only on the apex after main
deployment. Before that mutation, confirm the synthetic address is approved and not a
real recipient. After cleanup, verify aggregate legacy counts are unchanged and the
synthetic signup has zero queue rows.

5. Confirm the email Worker remains absent and cron remains empty:

```bash
npx wrangler deployments list --config wrangler.brain2-email.toml
rg -n '^crons = \[\]$' wrangler.brain2-email.toml
```

The first command must return Worker-not-found; that expected control-plane result is
recorded as a pass, not hidden.

### Verification command

```bash
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
npx wrangler versions view --config wrangler.embed.toml
npx wrangler versions view --config wrangler.chat.toml
npx wrangler versions view --config wrangler.signup.toml
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,audience_state,sendable,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status,audience_state,sendable ORDER BY campaign_version,status,audience_state,sendable; SELECT COUNT(*) AS email_log_count FROM email_logs;"
```

### Expected success

Both API routes return 410/no-store/disabled marker for all tested methods; `/chat`
and Read routes remain 200; embed/chat remote versions list no bindings; exact legacy
aggregate remains 210 quarantined/non-sendable with zero logs; controlled signup
creates no queue row; email Worker remains absent.

### Documentation update

Record Worker version IDs, Pages deployment IDs, D1 Time Travel bookmark, migration
ledger result, aggregate counts and smoke output. Do not record the synthetic address.

### Rollback

- Re-deploy the last verified tombstone version for endpoint failure.
- Revert only the local `/chat` Pages commit for UI failure.
- Do not restore old embed/chat capabilities or false signup copy.
- Use D1 Time Travel only for proven migration corruption and after checking for
  post-bookmark signups.
- Keep email absent throughout rollback.

### Proposed commit

```text
test: verify R0.1 production security boundary
```

## Task 10: Rewrite exposed public Git history under a separate owner gate

### Goal

Remove the rotated tracked Cloudflare candidate from every reachable public Git ref
and require collaborators to adopt the rewritten canonical history.

### Exact files

- No new application file
- Update after evidence: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`
- Update after evidence: `docs/STATUS.md`
- Private temporary inputs outside repository: replacement file and mirror backup

### Interfaces

The secret scanner's `--history` mode is the acceptance interface. A secure
replacement input is created outside the repository with mode `0600`; it maps the
already rotated literal to `[REDACTED — credential rotated]` without displaying the
literal.

### RED test

```bash
npm run test:secret-integrity:history
```

### Expected failure

Reachable commits containing `.claude/handoff.md` and `.claude/handoff-chat.md` fail
with file/line/rule-only findings.

### Minimal implementation

Proceed only after:

1. non-secret proof that both candidate credentials are revoked/rotated;
2. written owner approval for history rewrite and force-push;
3. collaborator push freeze and branch-protection coordination;
4. a private read-only mirror backup outside the public remote;
5. installation/verification of `git-filter-repo` from its trusted package source.

Use `git filter-repo --replace-text <secure-absolute-file> --force` in a dedicated
mirror clone, scan all rewritten refs, then force-push only the approved branch/tag
set. Delete the secure replacement input after successful verification through a
recoverable authorized process. Require every collaborator/worktree to reclone or
hard-reset only after saving unrelated local work separately.

Do not execute this task inside the dirty canonical worktree.

### Verification command

In the clean rewritten mirror and after remote push:

```bash
npm run test:secret-integrity:history
git fsck --full --no-reflogs --unreachable
git ls-remote --heads --tags origin
```

Clone the public remote into a fresh temporary directory and rerun the history scan.
GitHub code search for the exact affected file paths must expose no raw candidate.

### Expected success

All reachable local and remote refs pass the history scan, the public clone passes,
and neither scanner nor report prints a secret. The repository commit IDs change and
the report records the new canonical HEAD.

### Documentation update

Record owner approval time, freeze window, rewritten ref count, old-to-new canonical
HEAD mapping, remote verification and collaborator reset/reclone notice. Never record
the replacement file or token value.

### Rollback

Do not re-publish old refs containing the credential. If a ref mapping is wrong, fix
it from the private mirror, rescan, and push corrected rewritten refs. Credential
revocation remains final.

### Proposed commit

The history rewrite changes existing commits. After the rewrite, create a documentation
commit:

```text
docs: record credential history remediation
```

## Task 11: Close R0.1 and stop before R0.2

### Goal

Produce the final evidence-backed verdict, prove all gates, update status, and stop.

### Exact files

- Modify: `docs/security/R0-1-IMPLEMENTATION-REPORT.md`
- Modify: `docs/STATUS.md`
- Modify if line evidence changed after history rewrite:
  `docs/discovery/CURRENT-SYSTEM-AUDIT.md`
- Modify if line evidence changed after history rewrite:
  `docs/architecture/SAD-CLOUDFLARE-FIRST.md`
- Modify if line evidence changed after history rewrite:
  `docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md`

### Interfaces

The implementation report ends with:

- repository state before/after;
- endpoint/source/data/secret findings;
- root-cause controls;
- local and production commands with exit status;
- Worker/Pages versions and D1 aggregate evidence;
- files created/modified/deleted;
- owner decisions and residual risks;
- explicit `PASS` or `FAIL` for every R0.1 exit criterion;
- exact stop statement: `R0.2 and PRD-R1 not started.`

### RED test

Before finalizing:

```bash
rg -n '^Status: PASS$' docs/security/R0-1-IMPLEMENTATION-REPORT.md
npm run test:secret-integrity:history
```

### Expected failure

At least the report status remains `IN PROGRESS` until every prior task and owner gate
has evidence. Any history finding also blocks closure.

### Minimal implementation

Run the complete Task 8 gate again at the rewritten canonical HEAD, rerun Task 9
read-only production smoke, verify D1 aggregates, verify the email Worker is absent,
and run the change-boundary guard. Mark each exit criterion pass/fail. Set
`docs/STATUS.md` to `R0.1 implementation complete — R0.2 and PRD-R1 not started` only
when every mandatory criterion passes. Otherwise set an evidence-backed blocked state
without weakening a control.

### Verification command

```bash
npx tsc --noEmit --incremental false
npm run typecheck:brain2-workers
npm run lint
npm test
npm run build
npm run test:release
npm run test:read-release-safety
npm run test:secret-integrity
npm run test:secret-integrity:history
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
git diff --check
git status --short
```

Use the disposable-worktree procedure for build/release commands when the canonical
worktree still contains unrelated dirty files. Rerun the complete exact-path
change-boundary verification command from Task 8 after these commands.

### Expected success

Every local/production/security/data gate passes, the report says `Status: PASS`, the
five protected hashes remain unchanged, the final diff contains only the approved
R0.1 paths, and status explicitly stops before R0.2/PRD-R1.

### Documentation update

Finalize the report and status with current line evidence and rewritten HEAD. Preserve
`docs/discovery/R0-AUDIT-REPORT.md` as the historical R0 baseline.

### Rollback

Documentation may be corrected to match evidence. Runtime/data/security controls are
not weakened to obtain a passing report. A failed mandatory criterion leaves R0.1
open and R0.2/PRD-R1 locked.

### Proposed commit

```text
docs: close R0.1 security remediation
```

## Explicit stop gate

After Task 11:

1. Do not design or implement R0.2 environment isolation.
2. Do not create PRD-R1.
3. Do not add auth, Member, entitlement, payment, `/read`, multi-tenancy or AI.
4. Return the implementation report and decision gates to the project owner.
5. Wait for a separate prompt.
