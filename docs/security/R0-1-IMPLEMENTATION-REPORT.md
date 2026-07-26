# R0.1 Security Remediation Implementation Report

Status: IN PROGRESS — Task 8A smoke runner complete; full local release gate pending

## R0.1A Task 1 — Working-tree preservation gate

Task 1 installs a local capture/verification guard. It does not deploy, migrate or
change any production resource.

### Starting repository state

The protected baseline was captured read-only from the canonical dirty repository:

- Repository: `/Users/rio/thongphan-com`
- Branch: `agent/r0-foundation-audit`
- HEAD: `6a1ec9a5a0d61342106c16a1edf42b04a00099de`
- Upstream: `origin/agent/r0-foundation-audit`

Implementation runs in the isolated clean repository:

- Repository: `/Users/rio/thongphan-com-r0-1a`
- Branch: `agent/r0-1a-security-remediation`
- Starting HEAD: `bde1778d698d9c1c0cc4e1823cc28485a3e4a8cf`
- Upstream: `origin/agent/r0-1a-security-remediation`

Pre-existing canonical dirty paths:

```text
 M tsconfig.tsbuildinfo
?? public/conanmaker/assets/index-CIK0RB8_.css
?? public/conanmaker/assets/index-Dqi6Mg8p.js
?? public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg
?? public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

Starting protected SHA-256 values:

| Path | SHA-256 |
|---|---|
| `tsconfig.tsbuildinfo` | `2de0b6ca88190106152ba8cc4ae7f0260b45c442d1ba6daa84ac5b33790f7a2c` |
| `public/conanmaker/assets/index-CIK0RB8_.css` | `c4434e44be49b2cdb4abfe6dec9f04b0675fbee5b87aa771368ce8dd99e5b6c5` |
| `public/conanmaker/assets/index-Dqi6Mg8p.js` | `fe309b6dc4156e92f6418ed7313652c3a1306d8d832aa8fd7ab9a586226d732e` |
| `public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg` | `0928f0a2682ca148a1e2155bae981cd43d6891290bd07373df28db1b445e40f4` |
| `public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4` | `0af0e452665f1dd3a3da1739e414b69ceb7223ea6616e9dcf3ea4d941609d4cb` |

### TDD evidence

RED:

```bash
node --test scripts/r0-1-change-boundary.test.mjs
```

- Exit code: `1`
- Expected reason: `scripts/r0-1-change-boundary.mjs` did not exist.

GREEN:

```bash
npm run test:r0-1-boundary
```

- Exit code: `0`
- Result: `14/14` fixture tests passed.
- Coverage: unchanged dirty tree, exact allowlist, protected-file mutation,
  disappearing starting dirty path, new out-of-boundary path, NUL-safe unusual
  path, private `0600` baseline, output-symlink escape, executable mode, invalid
  roots/paths, missing protected files, duplicate values/flags and unknown
  arguments.

### Canonical baseline capture

The script lives only in the isolated implementation repository. The absolute
script path below allowed a read-only capture with the canonical repository as the
current Git root.

```bash
node /Users/rio/thongphan-com-r0-1a/scripts/r0-1-change-boundary.mjs capture \
  --output /tmp/thongphan-r0-1-boundary.json \
  --protect tsconfig.tsbuildinfo \
  --protect public/conanmaker/assets/index-CIK0RB8_.css \
  --protect public/conanmaker/assets/index-Dqi6Mg8p.js \
  --protect public/conanmaker/assets/thong-stage-anchor-CyfnwxYu.jpg \
  --protect public/conanmaker/assets/thong-stage-anchor-loop-Csh11-t8.mp4
```

- Working directory: `/Users/rio/thongphan-com`
- Exit code: `0`
- Baseline path requested: `/tmp/thongphan-r0-1-boundary.json`
- Baseline path resolved by the operating system: `/private/tmp/thongphan-r0-1-boundary.json`
- Baseline mode: `0600`
- Result: captured starting HEAD, exact NUL-delimited porcelain entries and five
  protected hashes without file bodies.

### Canonical boundary verification

```bash
node /Users/rio/thongphan-com-r0-1a/scripts/r0-1-change-boundary.mjs verify \
  --baseline /tmp/thongphan-r0-1-boundary.json \
  --allow scripts/r0-1-change-boundary.mjs \
  --allow scripts/r0-1-change-boundary.test.mjs \
  --allow package.json \
  --allow docs/security/R0-1-IMPLEMENTATION-REPORT.md
```

- Working directory: `/Users/rio/thongphan-com`
- Exit code: `0`
- Result: `VERIFY PASS`; all five starting dirty paths remained present, all five
  protected hashes were unchanged and no new canonical changed path appeared.

### Rollback

Delete only `scripts/r0-1-change-boundary.mjs`,
`scripts/r0-1-change-boundary.test.mjs` and this report, then remove only the
`test:r0-1-boundary` package script. Leave the canonical dirty state untouched.

### Remaining R0.1A boundary

Task 1 does not mark R0.1A ready for implementation review. Later tasks own the
remaining local source controls and final report status. R0.1B production cutover
has not started.

## R0.1A Task 2 — Secret detection and current-tree sanitation

Status: PASS — current tree sanitized; history residual remains diagnostic-only.

### Owner confirmation and inventory

- Provider: Cloudflare.
- Confirmation recorded: `2026-07-27T00:38:17+0700`.
- Actor role: authorized Cloudflare administrator, relayed by the controller.
- Candidate A classification: `invalid`.
- Candidate B classification:
  `legacy_orphaned_not_present_in_active_inventory`.
- Manual inventory scope: three user tokens and one account token.
- Relevant AI/Vectorize permissions: zero.
- Current-tree sanitation authorization: yes.
- Live token mutation authorization: no; none was performed.

No token name, provider object ID, account ID, credential value, fragment or
credential-derived hash is recorded.

### Sanitization result

- Four tracked locations across `.claude/handoff.md` and
  `.claude/handoff-chat.md` were replaced with invalid-credential redaction and
  environment-variable references.
- The canonical local `.env.embed.local` contained only the retired assignment. It
  was deleted and then verified absent; it remains uncommitted by design.
- No production or remote resource was mutated, no live token was changed and no
  history rewrite was attempted.

### TDD and verification evidence

- Initial RED: scanner module absent, exit `1`.
- Reviewer-hardening RED reproduced three blind spots: generic secret-name
  assignments, high-entropy hexadecimal values in explicit credential contexts and
  oversized historical text blobs. A fourth regression fixture preserved the known
  public minimum-length test phrase without weakening generic-name coverage.
- Focused scanner fixtures: `22/22` passed.
- Package-integrated suite: `264/264` passed.
- Current-tree post-sanitization scan: exit `0`, zero findings.
- Separate history diagnostic: exit `1` with five metadata-only findings. It remains
  outside `test:release` as the nonblocking R0.H1 residual.
- Canonical working-tree boundary verification: `VERIFY PASS` from
  `/Users/rio/thongphan-com`. An initial invocation from the implementation worktree
  correctly failed the wrong-root guard and was immediately rerun from the canonical
  repository.
- Diff whitespace verification passed for the exact Task 2 files.

Detailed pre-sanitization metadata-only evidence:
`.superpowers/sdd/2026-07-26-r0-1-security-remediation/task-2-phase-a-report.md`.

### Reviewer hardening

- Generic names such as service tokens, database passwords and API keys now reach
  `named-secret-assignment` after non-secret metadata suffixes are excluded.
- High-entropy hexadecimal values of at least 32 characters are accepted only in
  explicit named-assignment and bearer contexts; unrelated checksum prose remains
  excluded.
- History mode samples only a bounded binary prefix through Git plumbing for blobs
  above the text ceiling. A definitive binary prefix is skipped; otherwise the scan
  fails closed with exit `2`, classification `oversized_text_rejected` and file path
  metadata only.
- Scanner output and verification evidence contain no credential value, fragment,
  credential-derived hash or Git object ID.

## R0.1A Task 3 — Retire public Vectorize ingestion

Status: PASS — source tombstone and local verification complete; production cutover
not performed.

### Outcome

- `workers/embed-vault.ts` is now a three-line export of the shared disabled-endpoint
  Worker for `/api/embed`.
- Every method returns the fixed `410 Gone` problem response with private no-store,
  `nosniff` and disabled-state headers.
- The handler does not parse or read the request body and has no environment binding
  parameter, AI invocation, Vectorize read or Vectorize write path.
- `wrangler.embed.toml` retains `brain2-embedder`, the existing entry, compatibility
  date and exact apex route while removing the AI and Vectorize bindings. Workers.dev
  and preview URLs are disabled; structured tombstone logs are sampled at `0.1`.
- The three unsupported local ingestion scripts were deleted. No internal route,
  replacement writer or supported ingestion workflow was added.
- This task changed local source only. It did not deploy, mutate a route, access a
  remote binding, write D1, alter a token, send email or rewrite Git history.

### TDD evidence

Initial RED:

```bash
node --import tsx --test scripts/embed-worker-security.test.ts
```

- Exit code: `1`; `0/5` checks passed.
- Anonymous and fabricated-identity POSTs returned `500` after the environment Proxy
  detected legacy binding access, the streamed body was consumed and returned `500`,
  and GET/OPTIONS returned `200` instead of `410`.
- The Proxy threw before any external AI call or Vectorize write could occur.

Logging RED:

- Exit code: `1`; the HTTP tombstone checks were already green, while the injected
  security logger received zero events instead of the required fixed event.

GREEN:

- Focused suite: `6/6` passed.
- Full package suite: `270/270` passed.
- The focused assertions cover anonymous and fabricated Access identity headers,
  GET/OPTIONS, an eight-MiB bounded stream with a read counter, zero environment
  property access, zero AI calls, zero Vectorize writes, exact response headers/body
  and the metadata-only structured log event.

### Type and Wrangler verification

- `npm run typecheck:brain2-workers`: pass.
- `npm run lint`: pass with zero warnings.
- Wrangler `4.110.0` dry-run: pass.
- Wrangler summary: `Total Upload: 1.23 KiB / gzip: 0.60 KiB`; `No bindings found.`
- Emitted JavaScript bundle: `1,262` bytes; source map: `2,322` bytes.
- The scoped write-path guard found no `BRAIN2_INDEX`, `VectorizeIndex`, `.upsert(`,
  `[ai]` or `[[vectorize]]`; all three retired scripts were absent.

The exact `ExportedHandler` interface required the official Workers declarations,
which were absent from the repository because Wrangler exposes them only as an
optional peer. Task 3 therefore adds and locks only
`@cloudflare/workers-types@5.20260726.1`; no unrelated dependency was upgraded.
`package-lock.json` is the single mechanically required file beyond the task brief's
listed files.

### Temporary plan mismatch carried to Task 4

The plan asks Task 3 to add both retired Worker entries to
`tsconfig.brain2-workers.json`. Adding the still-active Task 4 chat Worker with the
current Cloudflare types exposed pre-existing `workers/api/chat.ts:87` error
`TS2352`: the legacy AI result is a `Record<string, unknown>` cast to
`ReadableStream`. Task 3 did not suppress the error or edit the Task 4-owned file.
The shared security module and embed entry are included now; Task 4 must replace the
chat Worker with the shared tombstone and add the chat entry before final R0.1A
verification. Until then, the two-entry plan requirement is not claimed complete.

### Rollback boundary

The safe rollback is the last verified tombstone version. Never restore the retired
unauthenticated writer. If the exact route is lost during a later owner-authorized
cutover, restore only the tombstone route and binding-free configuration.

## R0.1A Task 4 — Retire remote chat capability

Status: PASS — source tombstone and local `/chat` verification complete; production
cutover not performed.

### Outcome

- `workers/api/chat.ts` now exports the shared disabled-endpoint Worker for exactly
  `/api/chat`. POST, GET, OPTIONS and a concurrent 25-POST burst all return the fixed
  `410 Gone` problem response without reading a binding or consuming AI/Vectorize
  budget.
- `wrangler.chat.toml` retains the exact apex route, uses the retired-service name
  `thongphan-chat-tombstone`, disables Workers.dev and preview URLs, removes Workers
  AI, Vectorize and `nodejs_compat`, enables structured-log sampling at `0.1`, and
  advances the compatibility date to `2026-07-27`.
- `/chat` remains a public static page. `ChatClient.sendMessage(text)` always uses
  `createLocalChatTurn(text)` and retains loading state, progressive display,
  keyboard form submission, live-region output and three unique contextual
  recommendations.
- The public `ChatMessage` and `ChatTurn` contracts are unchanged. The unreachable
  SSE parser, `NEXT_PUBLIC_CHAT_API_URL` branch, client fetch path and dead Next proxy
  at `app/api/chat/route.ts` were removed.
- `workers/api/chat.ts` is now included in `tsconfig.brain2-workers.json`, closing the
  Task 3 reviewer contingency with the current `@cloudflare/workers-types` and no
  suppression.
- This task changed local source only. It did not deploy, push, mutate a route, access
  a remote binding, write D1, alter a token, send email or rewrite Git history.

### TDD evidence

Initial RED:

```bash
node --import tsx --test scripts/chat-worker-security.test.ts scripts/chat-journey.test.ts
```

- Exit code: `1`; `2/6` checks passed and `4/6` failed for the intended reasons.
- The client still exposed `NEXT_PUBLIC_CHAT_API_URL` and `fetch`; the anonymous POST
  and concurrent burst completed the local AI/Vectorize spies and returned `200`
  instead of `410`; the config still exposed AI/Vectorize and omitted the disabled
  public-surface/observability controls.
- All spies were synthetic local objects. No Workers AI or Vectorize service was
  contacted during RED.

GREEN:

- Focused security/journey suite: `6/6` passed.
- Adjacent `/chat` canonical, navigation, site-shell and static-route contracts:
  `27/27` passed.
- Full package suite: `273/273` passed.
- The burst contract proves all 25 responses are `410` with aggregate `0` AI calls
  and `0` Vectorize reads; the local journey still returns a useful answer and three
  unique internal recommendations.

### Type, build and Wrangler verification

- `npx tsc --noEmit`: pass after the independently reviewed Task 3 root type-boundary
  fix at `94d35fd`.
- `npm run typecheck:brain2-workers`: pass with both retired Worker entries and
  `@cloudflare/workers-types@5.20260726.1`; no suppression or unsafe cast added.
- `npm run lint`: pass with zero warnings.
- `npm run build`: pass; Next generated `82/82` static pages and retained `/chat` as a
  static route. The existing multiple-lockfile workspace-root warning remains
  informational.
- Current-tree secret-integrity scan: exit `0`, zero findings after explicit staging.
- Wrangler `4.110.0` dry-run: pass. Summary: `Total Upload: 1.21 KiB / gzip:
  0.59 KiB`; `No bindings found.` Emitted JavaScript bundle: `1,237` bytes; source
  map: `2,317` bytes.
- The remote-reactivation scan found no `NEXT_PUBLIC_CHAT_API_URL`, legacy Worker
  name, `BRAIN2_INDEX`, `VectorizeIndex`, `AI.run`, `[ai]` or `[[vectorize]]`; the
  Next proxy is absent.

### Cloudflare review and residual concerns

The dependency-free tombstone does not buffer request bodies, carry mutable global
request state, float promises, access bindings or fail open. The retained TOML format
is intentional because this task owns the existing `wrangler.chat.toml`; its current
schema validation, exact route, compatibility date, public-surface controls and
sampled observability were verified by Wrangler dry-run.

No Task 4 implementation concern remains. Wrangler reported that `4.114.0` is
available while the repository remains pinned to `4.110.0`; this task did not expand
scope into a dependency upgrade. Production remains unchanged until a separately
authorized cutover deploys the tombstone.

### Rollback boundary

If the local `/chat` experience regresses, revert only `ChatClient.tsx`,
`chat-model.ts` and their local-journey contracts. Keep the `/api/chat` tombstone,
binding-free config and deleted proxy; never restore the retired remote AI/Vectorize
path.

## R0.1A Task 5 — Make signup behavior and copy truthful

Status: PASS — local signup contract, zero-queue persistence and Day 01 continuation
verified; production cutover not performed.

### Outcome

- `lib/brain2/signup-contract.ts` now owns the canonical success message, descriptive
  data-use notice and existing Day 01 path. Both the UI and signup Worker import the
  same success-message contract.
- A successful signup means only that the registration was persisted. The Worker
  batches exactly one `challenge_signups` insert and prepares no `email_queue` insert.
- The success state links directly to `/brain2/21-ngay/ngay-01`. It makes no fixed-time
  or delivery promise.
- The form is accessibly related to the adjacent notice through
  `aria-describedby="brain2-signup-data-notice"`. The notice states that name and
  email are stored for this registration, email automation is inactive and the
  address is not added to a newsletter.
- The existing duplicate, abuse-rate-limit, bounded-body and stable infrastructure
  error responses remain unchanged. Validated campaign templates remain inert sender
  source; this task does not activate delivery.
- This task changed local source only. It did not deploy, push, mutate a production
  route or D1 database, send email, import an audience, activate cron, alter a token
  or rewrite Git history.

### Canonical contract

Success message:

> Đã ghi nhận đăng ký. Email tự động hiện chưa được kích hoạt; bạn có thể bắt đầu
> Ngày 01 ngay trên website.

Data-use notice:

> Tên và email được lưu để ghi nhận đăng ký 21 ngày Brain2. Email tự động hiện chưa
> được kích hoạt và địa chỉ này không được thêm vào newsletter.

These statements are descriptive only. They do not establish marketing consent or
claim that email delivery is ready.

### TDD and local D1 evidence

Initial RED:

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts scripts/brain2-route-contract.test.ts
```

- Exit code: `1`; `17/20` checks passed and `3/20` failed for the intended reasons.
- The API returned the former fixed-time delivery promise, a successful request still
  prepared the 21 queue statements, and the shared signup contract did not exist.
- Duplicate, rate-limit and error-path checks already remained green during RED.

GREEN:

- Focused email/route suite: `20/20` passed.
- Full package suite: `273/273` passed.
- Root `npx tsc --noEmit --incremental false`: pass.
- `npm run typecheck:brain2-workers`: pass.
- `npm run lint`: pass with zero warnings.
- `npm run build`: pass; Next generated `82/82` static pages, including the existing
  Day 01 route. The built Brain2/UI artifacts contain no former delivery promise.
- The synthetic successful-request contract records one batch containing one signup
  statement and no prepared `INSERT INTO email_queue` statement.
- A Wrangler-local D1 fixture against `workers/schema.sql` records
  `signup_rows = 1` and `queue_rows = 0`. It used a dedicated temporary persistence
  directory and did not contact the production database.

The plan's broad literal scan also matches unrelated `15 phút` learning-duration
copy because `5 phút` is a substring. The task-scoped source and built-artifact scan
therefore uses delivery context; it returns no match in `components`, `workers`,
`lib`, `app`, the emitted signup Worker bundle or built Brain2 assets.

### Wrangler dry-run and Cloudflare review

- Repository-pinned Wrangler: `4.110.0`.
- Config: `wrangler.signup.toml`; dry-run only, no deploy.
- Summary: `Total Upload: 33.84 KiB / gzip: 9.68 KiB`.
- Bindings are unchanged and limited to the existing D1 database, KV namespace and
  two signup rate limiters. The dry-run bundle contains no fixed delivery promise.
- The request handler still bounds and streams the small signup body, awaits D1 and
  rate-limit promises, keeps request state local, uses Web Crypto for identifiers and
  opaque limiter keys, and returns explicit no-store error responses. Removing queue
  preparation reduces request-path writes without introducing a floating promise or
  remote service call.

### Residual boundary and rollback

Email templates and the sender remain inert until later integrity, consent and
delivery gates pass. Production still serves the pre-cutover implementation until
R0.1B is separately authorized.

If rendering regresses, restore only the previous component structure around the
canonical message and Day 01 link. Never restore the delivery promise or signup-time
queue creation.

## R0.1A Task 6 — Hard-quarantine legacy email rows

Status: PASS — the forward-only local migration, mutation guards and impossible
sender predicates are verified; no production migration or delivery action occurred.

### Inventory and consent boundary

- The previously recorded read-only source inventory contains 10 signup records and
  210 queue rows. All queue rows were pending `legacy-v0`; the signup inventory has
  one case-insensitive duplicate group. This task did not query production again and
  retained counts/classifications only.
- The current signup schema has registration and unsubscribe fields, but no affirmative
  marketing-consent, delivery-consent, consent-source or consent-timestamp field.
  Registration therefore cannot authorize email delivery.
- One separately owner-reviewed address candidate remains classified `invalid` and is
  not an import candidate. `pending`, `failed`, `bounced` and invalid-address fixture
  states all remain non-sendable. Bounce or invalid status never implies consent and
  cannot be promoted by R0.1A.
- The duplicate group, invalid record and all legacy rows remain intact. Deduplication,
  deletion and retention duration require an owner-approved retention decision; this
  task neither merged nor deleted any record.

### Migration and sender contract

- `workers/migrations/0003_r0_1_email_integrity.sql` adds constrained
  `audience_state` and `sendable` columns. It temporarily removes only the legacy
  update guard needed for the backfill, updates rows where
  `campaign_version = 'legacy-v0'`, then recreates immutable legacy update/delete
  triggers.
- Insert/update triggers reject `sendable <> 0` and
  `audience_state = 'sendable'`. New rows default to
  `delivery_inactive`/`sendable = 0`.
- Every sender claim, owned update, expiry and success-finalization path now requires
  the expected v1 campaign plus
  `audience_state = 'sendable' AND sendable = 1`. The migration prevents that
  conjunction, so R0.1 selects zero rows and makes zero provider calls.
- The email configuration remains `crons = []`. A later separately approved email
  release must add a new migration, affirmative consent contract, retention decision
  and controlled smoke plan before any row can become sendable.

### TDD and local evidence

Initial RED:

```bash
node --import tsx --test scripts/brain2-email-campaign.test.ts
```

- Exit code: `1`; `11/12` checks passed and the new fixture failed only because
  `workers/migrations/0003_r0_1_email_integrity.sql` did not exist.

GREEN:

- Focused email suite: `12/12` passed.
- Full package suite: `273/273` passed.
- Local SQLite aggregate:
  `legacy-v0|pending|quarantined_legacy|0|210`.
- Sendable rows across all fixture campaigns/statuses: `0`; mutation attempts to
  create a sendable row and update/delete a legacy row all failed closed.
- Case-insensitive duplicate inventory groups: `1`; sender-selected rows: `0`;
  provider fetch count: `0`.
- `npm run typecheck:brain2-workers`: pass.
- Wrangler `4.110.0` email dry-run: pass, `42.90 KiB / gzip 11.90 KiB`; the only
  reported binding was the configured D1 binding. This was `--dry-run` only.
- Task-scoped `git diff --check`: pass.
- Current-tree secret-integrity scan with local-env coverage: pass with zero findings.

### Production and rollback boundary

This task changed local source and a local SQLite fixture only. It did not deploy,
push, write production D1, apply a production migration, send email, contact the
provider, import an audience, activate cron, mutate credentials or rewrite history.

If the contract is wrong, revert this local source commit and retain the failing
regression test. There is no production data rollback in R0.1A. Never make a legacy
row sendable as rollback behavior.

## R0.1A Task 7 — Current-state architecture documentation

Status: PASS — documentation contract and scoped local checks passed; Task 8 remains pending.

### Documented source state

- Current-state audit, SAD, Data/Event Architecture and STATUS now distinguish local
  implemented source from production deployment.
- `/api/embed` returns `410` and `/api/chat` returns `410` in implemented source through
  the binding-free shared tombstone (`workers/embed-vault.ts:1-3`,
  `workers/api/chat.ts:1-3`, `workers/security/disabled-endpoint.ts:22-50`). Neither
  tombstone is claimed as production-deployed.
- `/chat` remains a static/local journey and calls `createLocalChatTurn()` directly
  (`app/chat/ChatClient.tsx:27-41`, `app/chat/chat-model.ts:28-33`).
- Signup success means persisted registration only; its D1 batch contains one signup
  insert and no queue insert (`workers/brain2-campaign.ts:269-294`). The descriptive
  UI notice does not create marketing consent (`lib/brain2/signup-contract.ts:1-7`,
  `components/SignupForm.tsx:114-125`, `components/SignupForm.tsx:138-190`).
- The local migration maps legacy rows to `quarantined_legacy` and the numeric
  equivalent of `sendable = false`, then rejects every sendable insert/update
  (`workers/migrations/0003_r0_1_email_integrity.sql:4-47`). Every sender path also
  requires independent audience eligibility (`workers/api/email-drip.ts:133-181`,
  `workers/api/email-drip.ts:283-324`). Delivery status never grants eligibility.
- Email remains undeployed with an empty cron list (`wrangler.brain2-email.toml:32-33`).
  Preview/production D1 isolation remains the unstarted R0.2 boundary, separate from
  R0.1 endpoint binding removal.

### Lifecycle boundary

- `R0.1A source complete` applies to remediation Tasks 1–7 in the local repository.
- Task 8 must run the complete local release verification before this report may say
  `R0.1A READY FOR IMPLEMENTATION REVIEW`.
- `R0.1B production cutover not started`; no production mutation is authorized here.
- R0.H1 public-history findings remain a separate nonblocking residual.

### TDD and documentation verification

Initial RED:

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

- Exit code: `1` before documentation edits, with no output, because the required
  current-state markers were not all present.

GREEN:

- Exact Task 7 documentation contract: exit `0`, no output.
- Scoped `git diff --check` over the five exact Task 7 documents: exit `0`, no output.
- `npm run test:secret-integrity`: exit `0`, zero findings.

The top-level report remains `IN PROGRESS`. Task 7 does not execute Task 8's complete
local release gate and therefore does not claim implementation-review readiness.

## R0.1A Task 8A — Bounded production-smoke contract

Status: PASS — the runner contract is fixture-verified; production execution and the
full local release gate remain pending.

### Outcome

- `scripts/r0-1-production-smoke.mjs` exposes the documented `--read-only` and
  `--controlled-signup` modes through a native Node command shell and an injected
  runner interface.
- Read-only mode issues only GET requests. It verifies both binding-free tombstones,
  `/chat`, `/library`, one representative `/library/read/*` route, exact canonical
  metadata and the required sitemap entries, while reporting zero POST and database
  calls.
- Every request receives a native `AbortSignal.timeout()`; response bodies are read
  as bounded byte streams with a hard ceiling. HTTPS is mandatory, unknown flags are
  rejected and omitting a mutation flag defaults to read-only mode.
- Controlled mode fails closed unless both an injected database adapter and an
  explicitly marked `.invalid` synthetic identity are present. The passing fixture
  proves one POST, one created signup, zero queue rows, one identity-and-ID-targeted
  deletion and zero matching rows after cleanup. Unrelated rows remain untouched.
- Command output contains only pass/fail, mode, route/status and aggregate counts.
  It contains no name, email, signup ID or response body.

### TDD and local fixture evidence

Initial RED:

```bash
node --test scripts/r0-1-production-smoke.test.mjs
```

- Exit code: `1`.
- Expected reason: `scripts/r0-1-production-smoke.mjs` did not exist
  (`ERR_MODULE_NOT_FOUND`).
- Subsequent vertical RED/GREEN cycles independently exposed the missing 410,
  HTTP-200, canonical, sitemap, timeout, byte-limit, controlled-signup and command
  shell invariants.

GREEN:

```bash
npm run test:r0-1-production-smoke
```

- Exit code: `0`.
- Result: `25/25` adapter fixtures passed.
- Coverage includes seven independent tombstone-marker mutations, public route and
  SEO failures, native timeout, streamed byte overflow, zero-mutation read-only mode,
  exact controlled signup/queue/cleanup counts, unrelated-row preservation,
  pre-existing-fixture refusal, redacted output and fail-closed CLI argument/input
  handling.
- Reviewer-hardening RED reproduced a multiplicity cleanup gap: one POST created two
  matching synthetic rows, the runner rejected the row-count contract but left both
  rows behind. The minimal fix deletes every discovered post-preflight matching row
  through the exact `signupId` plus synthetic-identity adapter contract, checks every
  delete count, preserves the original multiplicity failure and leaves unrelated rows
  intact.
- Package-integrated full suite: `npm test`, exit `0`, `298/298` tests passed.

### Production and release-gate boundary

The runner has **not** been executed against a production origin. No production
request, controlled signup, remote D1 read/write, migration, deploy, route mutation,
email action or Git-history action occurred in Task 8A. The top-level status remains
`IN PROGRESS`; Task 8B owns the disposable-worktree full local release gate and is
not started by this commit.

Rollback removes only the two smoke-runner files and their `package.json` wiring,
then removes this Task 8A report section. It must not be replaced with an ad hoc
production command.
