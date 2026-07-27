# R0.1 Security Remediation Implementation Report

Status: R0.1A READY FOR IMPLEMENTATION REVIEW

## R0.1A production runbook authority and failure-safety correction

Status: PASS — owner-approved credential authority, private release-checkout scope
and mutation-aware Worker-version evidence handling are reconciled and verified at
source `5514e712e10d0b91c00616ba204344ab6c540b33`.

### Credential authority contradiction and owner disposition

- Previous contradiction: the design, local plan, production plan and owner checklist
  still required revocation or rotation of two credential candidates even though the
  latest owner-approved evidence had already classified them without a live-token
  mutation.
- Candidate A final disposition: read-only verification returned `invalid`; the
  tracked plaintext was sanitized and no revoke or Roll is required.
- Candidate B final disposition:
  `legacy_orphaned_not_present_in_active_inventory`; the project owner reviewed the
  complete active inventory of 3 User API Tokens and 1 Account API Token and found
  zero active Workers AI/Vectorize permission match.
- No token names or IDs were recorded. The approved ignored local credential file was
  deleted. No active Cloudflare token mutation was authorized or performed; active
  tokens serving DNS, Tunnel, Cloudflare One, D1, R2, KV, Workers Scripts or Load
  Balancing remain untouched.
- Current tracked and approved ignored-local controls are sanitized and the current-
  tree secret scan is the mandatory technical gate. R0.H1 remains nonblocking
  public-history hygiene for tracked historical plaintext; R0.H1 does not imply
  Candidate B revoke or rotation.

### Worker-version evidence lifecycle root cause

- Current contradiction: the runbook instructed the operator to preserve secured
  before/after JSON after a post-deploy capture failure, while its unconditional
  `EXIT` trap deleted those same JSON files.
- Impact: a Worker may already be deployed, its exact version identity may become
  ambiguous, the read-only recovery evidence is destroyed, and the runbook forbids
  re-deploying merely to recover that evidence.
- Correct policy: a nonzero exit before any remote mutation cleans temporary evidence;
  an exit after remote mutation but before successful closure preserves the evidence
  securely; successful completed cutover cleans it; every path preserves the original
  process exit status and restores the previous umask.
- Recurrence control: `scripts/r0-1b-version-evidence-lifecycle.sh` owns the stateful
  lifecycle and is exercised only through spawned local Bash fixture processes. It
  has no network, remote-service or JSON-content read path.

### Private release checkout correction

The R0.1B full repository release checkout previously used
`/tmp/thongphan-r0-1b-release.*`. The corrected runbook requires
`/Users/rio/thongphan-r0-1b-release.*`, owner control, an empty generated directory,
exact `main`, and clean porcelain before any production gate.

### RED evidence

- `node --test scripts/r0-1b-version-evidence-lifecycle.test.mjs`: exit `1`; helper
  absent, so the lifecycle behavior could not be satisfied.
- `node --test scripts/r0-1b-production-plan-contract.test.mjs`: exit `1`; stale
  credential authority, `/tmp` release checkout and unconditional cleanup trap were
  all detected.

### GREEN and complete verification

Focused GREEN passed without network or production work:

- Evidence lifecycle: `14/14` passed, including owner-only initialization, inherited
  `0600` files, pre-mutation cleanup, post-mutation preservation, irreversible
  mutation state, direct cleanup, non-recursive trap behavior, original exit-code
  preservation and previous-umask restoration.
- Production-plan contract: `5/5` passed. All authoritative documents now record
  Candidate A as `invalid`, Candidate B as
  `legacy_orphaned_not_present_in_active_inventory`, no live-token mutation gate,
  the owner-controlled release checkout and the failure-safe evidence lifecycle.
- Existing version protections remain green: delta helper `18/18`, version-command
  contract `2/2`, and Bash syntax validation passed.

Complete verification ran from a clean detached worktree outside `/tmp` at exact
source `5514e712e10d0b91c00616ba204344ab6c540b33`. The checkout remained clean after
all commands.

| Gate | Exit | Command output |
|---|---:|---|
| Clean install | `0` | `npm ci`: 505 packages installed; retained npm audit baseline 14 high severity |
| Root TypeScript | `0` | `npx tsc --noEmit --incremental false` |
| Worker TypeScript | `0` | `npm run typecheck:brain2-workers` |
| Lint | `0` | zero warnings |
| Full tests | `0` | `355/355` passed; no failures, skips or cancellations |
| Evidence lifecycle | `0` | `14/14` passed |
| Production-plan contract | `0` | `5/5` passed |
| Version-delta helper | `0` | `18/18` passed |
| Version-command contract | `0` | `2/2` passed |
| Controlled-smoke contract | `0` | `42/42` passed locally; no production endpoint called |
| Production build | `0` | `82/82` static pages generated |
| Release gate | `0` | build `6/6`, SEO `4/4`, bundle `3/3`, Brain2 `143/143`; secret scan and lint passed |
| Read safety | `0` | `3/3` passed |
| Current-tree secret integrity | `0` | zero findings |
| Diff and disposable status | `0` | `git diff --check HEAD` passed; porcelain empty |
| Canonical preservation | `0` | canonical HEAD, five dirty paths and all five protected SHA-256 values unchanged |

All seven repository-pinned Wrangler `4.110.0` commands used `deploy --dry-run` and
exited `0`:

| Config | Upload / gzip | Bindings |
|---|---:|---|
| `wrangler.embed.toml` | `1.23 / 0.60 KiB` | none |
| `wrangler.chat.toml` | `1.21 / 0.59 KiB` | none |
| `wrangler.signup.toml` | `33.84 / 9.68 KiB` | existing KV, D1 and two rate limiters |
| `wrangler.router.toml` | `2.02 / 0.89 KiB` | none |
| `wrangler.brain2-access.jsonc` | `30.93 / 10.46 KiB` | existing KV and D1 |
| `wrangler.brain2-email.toml` | `42.90 / 11.90 KiB` | existing D1 only |
| `wrangler.brain2-legacy-redirect.jsonc` | `0.69 / 0.42 KiB` | none |

No Worker, Pages project, Cloudflare token, production database, production route,
email runtime, migration or Git history was changed. This was a local Draft PR
authority and failure-safety correction only.

## R0.1A Worker version readback correction

Status: PASS — the tested Worker-version delta helper, branch-wide command contract,
corrected R0.1B readback sequence and complete local release gate passed at source
`3eb1d7f858f0836109d8b46c75332d593a465931`. Production cutover remains unstarted.

### Root cause, impact and recurrence control

- Root cause: the runbook treated `--config` as sufficient for `wrangler versions
  view`, even though pinned Wrangler `4.110.0` requires a positional version ID.
  There was no branch-wide command-contract test, and version-ID capture differed
  between the embed, chat and signup sequences.
- Impact: an R0.1B endpoint deployment could mutate production successfully and then
  stop at the invalid readback command. That leaves a deployed endpoint without the
  evidence needed to close the cutover or identify the exact version for rollback.
- Recurrence control: a local, network-free version-list delta helper captures
  exactly one new UUID from before/after Wrangler JSON, and a static contract scans
  `docs/**`, `scripts/**`, `package.json` and `AGENTS.md` for every version-view
  command, including multiline forms, and rejects any command without a positional ID.

### Pinned Wrangler syntax and JSON schema

Repository-pinned Wrangler reported version `4.110.0`. Its help output proved:

```text
wrangler versions list
  --json  Display output as JSON

wrangler versions view <version-id>
  version-id  The Worker Version ID to view  [string] [required]
  --json  Display output as JSON
```

`--config` is a global configuration selector and does not satisfy the required
positional `version-id`. Inspection of the pinned distribution used by `npm ci`
showed that `versions list --json` serializes the raw version array, and each entry's
version identifier is the `id` field. Wrangler's own validation states that Worker
version IDs are UUIDs. The helper therefore requires an array top level, object
entries, unique nonempty UUID `id` values and set difference rather than list order.
No Cloudflare metadata request was needed to establish this schema.

### RED and focused GREEN evidence

- Helper RED: `node --test scripts/r0-1-worker-version-delta.test.mjs` exited `1`
  with `0/18` passing because the helper did not yet exist.
- Command-contract RED: the initial branch scan identified the five invalid
  version-view commands in Tasks 4, 6 and 10 of the cutover runbook. The first parser
  fixture also exposed and then corrected a test-string construction defect before
  the implementation was accepted.
- Helper GREEN: `18/18` passed, covering one/zero/multiple deltas, order independence,
  duplicates, missing/empty/malformed IDs, malformed/wrong-shape JSON, relative paths,
  symlink, size and permission rejection, stable exit codes, exact stdout, redacted
  errors and the no-Wrangler/no-network boundary.
- Command-contract GREEN: `2/2` passed. The multiline parser fixture passes and the
  complete scan across `docs/**`, `scripts/**`, `package.json` and `AGENTS.md` reports
  zero invalid executable commands.

### Corrected runbook evidence map

| Fact | Source evidence |
|---|---|
| Private `0700` evidence directory, restrictive umask and cleanup trap | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:88` |
| Embed list-before/deploy/list-after/helper/view sequence | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:226` |
| Chat in-place `thongphan-chat-api` sequence | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:279`, `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:285` |
| Signup sequence with approved existing bindings | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:339`, `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:346` |
| Task 10 reuses all three captured version IDs | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:503` |
| Absolute-path/file-safety/schema/set-difference implementation | `scripts/r0-1-worker-version-delta.mjs:22`, `scripts/r0-1-worker-version-delta.mjs:48`, `scripts/r0-1-worker-version-delta.mjs:102`, `scripts/r0-1-worker-version-delta.mjs:123` |
| Multiline command parser and branch-wide scan roots | `scripts/r0-1-worker-version-command-contract.test.mjs:20`, `scripts/r0-1-worker-version-command-contract.test.mjs:51`, `scripts/r0-1-worker-version-command-contract.test.mjs:73` |
| Focused tests included through `npm test`, not helper execution in `test:release` | `package.json:18`, `package.json:22`, `package.json:30` |

The runbook stops on zero, multiple or invalid deltas; it never selects first/latest
array position or parses human-readable deploy output. A capture failure after upload
must not trigger another deploy. Each secured view uses only its captured ID, and
Task 10 reuses `R0_1B_EMBED_VERSION_ID`, `R0_1B_CHAT_VERSION_ID` and
`R0_1B_SIGNUP_VERSION_ID`.

### Fresh complete release verification

Verification ran from a clean detached disposable worktree at exact source
`3eb1d7f858f0836109d8b46c75332d593a465931`. The checkout remained clean after all
commands.

| Gate | Exit | Command output |
|---|---:|---|
| Clean install | `0` | `npm ci`: 505 packages installed; retained npm audit baseline 14 high severity |
| Root TypeScript | `0` | `npx tsc --noEmit --incremental false` |
| Worker TypeScript | `0` | `npm run typecheck:brain2-workers` |
| Lint | `0` | zero warnings |
| Full tests | `0` | `336/336` passed; previous `316/316` baseline plus 20 focused tests, no regression |
| Helper tests | `0` | `18/18` passed |
| Command contract | `0` | `2/2` passed; zero invalid version-view commands |
| Controlled-smoke contract | `0` | `42/42` passed locally; no production endpoint called |
| Production build | `0` | `82/82` static pages generated |
| Release gate | `0` | build `6/6`, SEO `4/4`, bundle `3/3`, Brain2 `143/143`; secret scan and lint passed |
| Read safety | `0` | `3/3` passed |
| Current-tree secret integrity | `0` | zero findings |
| Diff and disposable status | `0` | `git diff --check HEAD` passed; porcelain empty |
| Canonical preservation | `0` | `VERIFY PASS`; HEAD, five dirty paths and all five protected SHA-256 values unchanged |

All seven repository-pinned Wrangler `4.110.0` commands used `deploy --dry-run`:

| Config | Exit | Upload / gzip | Bindings |
|---|---:|---:|---|
| `wrangler.embed.toml` | `0` | `1.23 / 0.60 KiB` | none |
| `wrangler.chat.toml` | `0` | `1.21 / 0.59 KiB` | none |
| `wrangler.signup.toml` | `0` | `33.84 / 9.68 KiB` | existing KV, D1 and two rate limiters |
| `wrangler.router.toml` | `0` | `2.02 / 0.89 KiB` | none |
| `wrangler.brain2-access.jsonc` | `0` | `30.93 / 10.46 KiB` | existing KV and D1 |
| `wrangler.brain2-email.toml` | `0` | `42.90 / 11.90 KiB` | existing D1 only |
| `wrangler.brain2-legacy-redirect.jsonc` | `0` | `0.69 / 0.42 KiB` | none |

No production request, Worker/Pages deploy, Cloudflare metadata request, remote D1
operation, migration, email action, credential mutation or Git-history rewrite was
performed. This correction returns R0.1A to implementation review only; it does not
claim merge, deployment or R0.1 completion.

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

### Final-review scanner regression closure

- A final whole-branch review found that a bare uppercase/alphanumeric/underscore
  value in an explicitly secret-named assignment was being mistaken for an
  environment reference. The focused RED expected one metadata-only finding but the
  scanner returned exit `0` with none.
- Environment-reference exemption now requires explicit syntax: shell expansion or
  an `env`, `process.env` or `import.meta.env` member reference. Bare values no longer
  receive the exemption.
- Provider/token prose context is now maintained in one forward pass, including
  fenced semantic blocks and the bounded two-line context, instead of rescanning all
  preceding lines for every input line.
- Final-review GREEN: focused scanner fixtures `23/23`; current tracked and approved
  ignored-local scan exit `0` with zero findings; full package suite `299/299`; root
  and Worker TypeScript plus lint all exit `0`.
- All fixtures remain synthetic and temporary, and no credential value, fragment,
  credential-derived hash or provider object ID was printed or recorded.

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
- `wrangler.chat.toml` retains the exact production Worker identity
  `thongphan-chat-api` and exact apex route, disables Workers.dev and preview URLs,
  removes Workers AI, Vectorize and `nodejs_compat`, enables structured-log sampling
  at `0.1`, and advances the compatibility date to `2026-07-27`. The tombstone is an
  in-place replacement, not a second Worker service.
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

Status: PASS — documentation contract and scoped local checks passed; Task 8 had not
run at this checkpoint.

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

At Task 7 completion, the top-level report remained `IN PROGRESS`. Task 7 did not
execute Task 8's complete local release gate or claim implementation-review readiness.

## R0.1A Task 8A — Bounded production-smoke contract

Status: PASS — the runner contract was fixture-verified at this checkpoint; production
execution remained separately gated and the complete local gate belonged to Task 8B.

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
email action or Git-history action occurred in Task 8A. Task 8B verifies this source
locally; it does not authorize or perform the separately gated R0.1B cutover.

Rollback removes only the two smoke-runner files and their `package.json` wiring,
then removes this Task 8A report section. It must not be replaced with an ad hoc
production command.

## R0.1A Task 8B — Complete local release verification

Status: PASS — every local release gate passed at source commit
`2b3f77be060659211165eebd603f735099b26668`; R0.1A is ready for implementation
review only.

### Readiness RED and isolated verification boundary

Before this documentation update, the exact readiness check exited `1` because the
top-level report still said `IN PROGRESS`. Verification then ran from a clean detached
worktree outside `/tmp` at `2b3f77be060659211165eebd603f735099b26668`, with
no source change between the readiness RED and the complete passing run.

### Clean install and local gates

| Gate | Exit | Evidence |
|---|---:|---|
| `npm ci` | `0` | 505 packages installed; npm audit baseline reported 14 high-severity findings |
| Root TypeScript, non-incremental | `0` | `npx tsc --noEmit --incremental false` |
| Worker TypeScript | `0` | `npm run typecheck:brain2-workers` |
| Lint | `0` | zero warnings |
| Full package tests | `0` | `315/315` passed |
| Production build | `0` | `82/82` static routes generated |
| Release gate | `0` | all component suites passed; final Brain2 sub-suite `143/143` |
| Read release safety | `0` | `3/3` passed |
| Current-tree secret integrity | `0` | zero findings |
| `git diff --check HEAD` | `0` | no whitespace error |
| Detached worktree status | `0` | empty |

The npm audit count is retained as the clean-install dependency baseline, not stated
as remediated by R0.1A.

The successful build also emitted the pre-existing Next.js workspace-root inference
warning because a parent lockfile and the disposable worktree lockfile were both
visible. The build still completed with exit `0` and generated all `82/82` routes;
R0.1A did not change output tracing or repository-root configuration.

### Wrangler dry-run evidence

All seven commands were dry-runs only; no Worker or Pages project was deployed.

| Worker/config | Upload | Gzip | Bindings reported |
|---|---:|---:|---|
| Embed tombstone | 1.23 KiB | 0.60 KiB | none |
| Chat tombstone | 1.21 KiB | 0.59 KiB | none |
| Signup | 33.84 KiB | 9.68 KiB | existing KV, D1 and two rate limiters |
| Custom-domain router | 2.02 KiB | 0.89 KiB | none |
| Brain2 access | 30.93 KiB | 10.46 KiB | KV and D1 |
| Brain2 email | 42.90 KiB | 11.90 KiB | D1 only |
| Legacy redirect | 0.69 KiB | 0.42 KiB | none |

The embed and chat bundles therefore retain the required zero-binding tombstone
boundary.

### Canonical preservation and residual history finding

Canonical boundary verification returned `VERIFY PASS` at
`6a1ec9a5a0d61342106c16a1edf42b04a00099de`. All five protected SHA-256 values remain
exactly equal to the Task 1 baseline, and all five original dirty paths remain
preserved. The retired local `.env.embed.local` remains absent.

The separate history diagnostic remains expected-red: exit `1`, exactly five
metadata-only findings classified `history_plaintext`. This is the nonblocking R0.H1
residual and does not weaken the passing current-tree secret gate or R0.1A readiness.

### Stop gate

Remediation Tasks 1–8 are locally complete and R0.1A is ready for implementation
review. R0.1B production cutover, R0.H1 history remediation, R0.2 environment
isolation and PRD-R1 have not started. No production request, controlled production
signup, deploy, migration, remote D1 mutation, email action, history rewrite or push
was performed by Task 8B.

## R0.1A whole-branch review — controlled smoke hardening

Status: SUPERSEDED at source `2b3f77be060659211165eebd603f735099b26668`.
This historical review verdict was reopened by the later Draft PR #2 corrections
recorded below.

### Review findings closed

- The direct controlled CLI now reads synthetic identity only from the absolute path
  in `R0_1_SMOKE_INPUT_FILE`, and only after pinning the native controlled path to the
  exact approved apex `https://thongphan.com`. It accepts only a bounded, owner-owned,
  owner-readable regular non-symlink JSON file with no group/other permissions or
  executable bits. Name and email never enter `argv`, command output or Wrangler
  diagnostics.
- The native database adapter invokes only the repository-local Wrangler binary with
  the fixed D1 database/config and `d1 execute ... --remote --file ... --json --yes`.
  Each SQL artifact is created under an owner-only temporary directory with mode
  `0600` and removed in `finally`, including command failure. Tests inject the
  subprocess adapter and never contact remote D1.
- The controlled POST now matches the actual signup Worker contract: JSON content
  type, same-origin `Origin`, canonical `brain2-21-ngay` slug and the exact
  `challenge_slug`, `name`, `email` body. A focused integration fixture calls the
  real `handleBrain2SignupRequest` export through `tsx`.
- Before POST and after targeted cleanup, the runner snapshots the exact global
  `challenge_signups` count and a bounded, deterministically ordered pre-migration
  email aggregate containing only `campaign_version`, `status` and `row_count`. It
  fails closed unless the total is exactly restored and the serialized pre-migration
  aggregate is byte-equal. Multiplicity cleanup still removes every matching row by
  ID plus synthetic identity while preserving unrelated rows.
- D1 lookup returns every positively identified matching ID within the bounded
  Wrangler output contract; it has no three-row cardinality trap. SQL literals double
  apostrophes, and cleanup remains narrow by signup ID, synthetic identity and
  challenge.
- Read-only route, tombstone, canonical, sitemap, timeout and response-size contracts
  are unchanged.

### TDD and local verification evidence

RED evidence was observed before implementation: the actual Worker fixture rejected
the old POST contract (`SMOKE_SIGNUP_HTTP_CONTRACT`); the aggregate assertion exposed
the missing before/after database snapshots; and the direct CLI exited fail-closed
because no secure input/D1 path existed. Each vertical slice was made green before
the next slice was added.

Final-review RED evidence additionally reproduced the late non-apex rejection and the
three-match D1 cardinality trap. Both were closed in the bounded review loop; no third
fix loop was required.

| Gate | Exit | Evidence |
|---|---:|---|
| Focused controlled-smoke suite | `0` | `41/41` passed |
| Full package tests | `0` | `315/315` passed |
| Current-tree secret integrity | `0` | zero findings |
| Root TypeScript, non-incremental | `0` | `npx tsc --noEmit --incremental false` |
| Worker TypeScript | `0` | `npm run typecheck:brain2-workers` |
| Lint | `0` | zero warnings |
| Production build | `0` | `82/82` static routes generated |
| Task diff check | `0` | no whitespace errors |
| Canonical preservation | `0` | `VERIFY PASS`; five protected hashes unchanged |

The test-evidence Minor recorded at this historical checkpoint was later closed by a
standalone, valid-cardinality Wrangler result fixture in the Draft PR #2 review
corrections below.

No production origin, remote D1 operation, deploy, migration, email action, push or
history mutation was performed during this hardening or final verification.

## Draft PR #2 review corrections

Status: PASS — focused corrections, independent review and the fresh full release
gate passed at source `d68a27b26ef266883d7095bd25e929c74cffadbb`. R0.1A is
ready for implementation review only; production cutover has not started.

### Findings corrected

- The R0.1B sequence runs the controlled signup before migration `0003`. The native
  snapshot SQL now reads only `challenge_signups` count plus the bounded,
  deterministically ordered `campaign_version`, `status`, `row_count` aggregate. It
  does not query `audience_state` or `sendable` during this phase. The separate
  post-migration aggregate remains an R0.1B step after migration `0003`.
- `wrangler.chat.toml` now uses the exact existing production identity
  `thongphan-chat-api`. Its tombstone source, exact `/api/chat` route,
  `workers_dev=false`, `preview_urls=false`, zero AI/Vectorize bindings and sampled
  observability remain unchanged.
- The Wrangler `success` predicate now has standalone evidence with exact stdout
  `[{"success":false,"results":[]}]`. Cardinality is valid, so the fixture fails
  only because `success !== true`; the previous Minor is closed.

### TDD evidence

Pre-migration RED:

```text
SMOKE_DATABASE_COMMAND_FAILED: no such column: audience_state
```

- The RED fixture created an in-memory SQLite database from `workers/schema.sql`,
  seeded the expected challenge, ten historical signups and 210 `legacy-v0/pending`
  queue rows, then applied only migration `0002`. It exercised the SQL emitted by the
  native Wrangler adapter and failed before POST because the former snapshot queried
  a migration-`0003` column.
- The chat config RED failed because the configured name was not
  `thongphan-chat-api`.

Focused GREEN:

| Gate | Exit | Evidence |
|---|---:|---|
| Controlled-smoke suite | `0` | `42/42` passed |
| Pre-0003 actual SQLite/Worker slice | `0` | one synthetic signup, zero queue rows, one targeted removal, count restored to 10 and byte-equal pre-migration aggregate |
| Chat Worker security/config | `0` | `3/3` passed; exact production identity, route, disabled public surfaces, zero AI/Vectorize and sampled observability |
| Standalone Wrangler `success=false` | `0` | valid one-result-set cardinality rejected with `SMOKE_DATABASE_CONTRACT` before any POST |

Migration `0003` remained unapplied in the actual SQLite slice: both
`audience_state` and `sendable` were absent before and after the controlled signup.

### Evidence map

| Fact | Source evidence |
|---|---|
| Pre-migration adapter interface and bounded exact row schema | `scripts/r0-1-production-smoke.mjs:126`, `scripts/r0-1-production-smoke.mjs:136` |
| Pre-migration SQL selects only `campaign_version`, `status`, `row_count` in deterministic order | `scripts/r0-1-production-smoke.mjs:313` |
| Before/after snapshot, exact one-row/zero-queue contract and targeted cleanup | `scripts/r0-1-production-smoke.mjs:371` |
| Real schema + 10-signup/210-queue SQLite fixture with migration `0002` only | `scripts/r0-1-production-smoke.test.mjs:204` |
| Actual pre-0003 Worker/SQL regression proof and post-cleanup invariants | `scripts/r0-1-production-smoke.test.mjs:559` |
| Standalone valid-cardinality `success=false` fixture | `scripts/r0-1-production-smoke.test.mjs:1076` |
| Exact chat production identity and binding-free route config | `wrangler.chat.toml:1`, `scripts/chat-worker-security.test.ts:112` |
| In-place chat cutover and phase-separated migration plan | `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:206`, `docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md:263` |

### Fresh complete release verification

Verification ran from a clean detached worktree at
`d68a27b26ef266883d7095bd25e929c74cffadbb`. The worktree was created outside
the canonical repository and remained empty under `git status --porcelain` after
all commands.

| Gate | Exit | Command output |
|---|---:|---|
| Clean install | `0` | `npm ci`: 505 packages installed; retained npm audit baseline 14 high severity |
| Root TypeScript | `0` | `npx tsc --noEmit --incremental false` |
| Worker TypeScript | `0` | `npm run typecheck:brain2-workers` |
| Lint | `0` | zero warnings |
| Full tests | `0` | `316/316` passed; the previous `315/315` baseline did not regress |
| Production build | `0` | `82/82` static pages generated |
| Release gate | `0` | build `6/6`, SEO `4/4`, bundle `3/3`, Brain2 `143/143`; secret scan and lint passed |
| Read safety | `0` | `3/3` passed |
| Current-tree secret integrity | `0` | zero findings |
| Diff and disposable status | `0` | `git diff --check HEAD` passed; porcelain empty |
| Canonical preservation | `0` | `VERIFY PASS`; HEAD, five dirty paths and all five protected SHA-256 values unchanged |

All seven repository-pinned Wrangler `4.110.0` commands used `deploy --dry-run`:

| Config | Exit | Upload / gzip | Bindings |
|---|---:|---:|---|
| `wrangler.embed.toml` | `0` | `1.23 / 0.60 KiB` | none |
| `wrangler.chat.toml` | `0` | `1.21 / 0.59 KiB` | none |
| `wrangler.signup.toml` | `0` | `33.84 / 9.68 KiB` | existing KV, D1 and two rate limiters |
| `wrangler.router.toml` | `0` | `2.02 / 0.89 KiB` | none |
| `wrangler.brain2-access.jsonc` | `0` | `30.93 / 10.46 KiB` | existing KV and D1 |
| `wrangler.brain2-email.toml` | `0` | `42.90 / 11.90 KiB` | existing D1 only |
| `wrangler.brain2-legacy-redirect.jsonc` | `0` | `0.69 / 0.42 KiB` | none |

The independent correction review returned zero Critical, Important or Minor
finding. Branch search finds the retired tombstone-named identity only in the
historical-error explanation in the production cutover plan, never in executable
configuration or a deploy target.

No Worker, Pages project, Cloudflare token, production database, production route,
email runtime or Git history was changed. These were local Draft PR review
corrections only. No production origin, remote D1 operation, deploy, migration,
email action or history mutation occurred during these corrections.
