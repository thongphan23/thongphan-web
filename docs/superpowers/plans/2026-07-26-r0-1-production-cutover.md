# R0.1B Owner-Gated Production Cutover Plan

> **For Codex:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` task by
> task, `superpowers:test-driven-development` for the smoke-runner contract, and
> `superpowers:verification-before-completion` before any success claim. Execution
> requires a separate project-owner prompt after R0.1A is reviewed and merged.

**Goal:** Cut over the already merged R0.1A controls to production in a bounded,
observable order, prove endpoint/signup/data integrity, and close R0.1 without
starting R0.H1, R0.2 or PRD-R1.

**Architecture:** The exact `/api/embed` and `/api/chat` routes become dependency-free
410 tombstones first. The truthful signup Worker is deployed and proven with one
controlled apex registration before D1 quarantine migration. Pages is built and
deployed last from the exact clean merged `main` SHA. Email sending remains absent.

**Design authority:**
`docs/superpowers/specs/2026-07-26-r0-1-security-remediation-design.md`

**Local implementation authority:**
`docs/superpowers/plans/2026-07-26-r0-1-security-remediation.md`

**Owner checklist:**
`docs/security/R0-1-OWNER-ACTION-CHECKLIST.md`

## Non-negotiable cutover boundaries

1. This plan needs a new explicit owner prompt. Approval of the design, R0.1A plan,
   documentation PR or implementation PR is not production authorization.
2. Both the documentation PR and R0.1A implementation PR must be merged before this
   plan starts.
3. GitHub default branch must be `main`. Changing it is a separate owner action; this
   plan does not change repository settings.
4. Every production command runs from a fresh checkout of `main`, never from a docs,
   feature or PR branch.
5. Immediately before the first remote mutation: run `git fetch origin`, prove
   `HEAD == origin/main`, prove `git status --porcelain` is empty, and record the
   exact SHA. Stop on any mismatch.
6. CI and the complete local release gate must pass at that exact SHA. The Pages
   artifact must be built from that same SHA.
7. Never print a credential value, fragment, hash, authorization header, synthetic
   identity, name or email address.
8. Do not deploy the email Worker, add a cron, send email, call a provider send API,
   or import any audience.
9. Do not rewrite or force-push Git history. R0.H1 is separate, destructive,
   owner-gated and nonblocking.
10. Do not implement R0.2, PRD-R1, `/read`, auth, membership, payment,
    multi-tenancy or AI.
11. Stop on route, binding, migration-ledger, aggregate, SHA, worktree, control-plane
    or smoke-test drift. Do not improvise through a failed gate.
12. Capture every new Worker version only by comparing secured before/after outputs
    from `versions list --json` with `scripts/r0-1-worker-version-delta.mjs`. Never
    select the first/latest list entry and never scrape deploy text.
13. A zero-version or multiple-version delta is a concurrency/drift stop. An invalid
    input is an evidence-integrity stop. Do not deploy again to repair either capture
    failure. Failure before remote mutation cleans temporary evidence. Failure after
    remote mutation must preserve evidence directory securely; stop; do not re-deploy;
    do not delete evidence; return the preserved absolute path only; wait for an
    owner-authorized read-only recovery prompt.
14. Worker-version JSON is temporary sensitive operational metadata. Keep it only in
    `R0_1B_VERSION_DIR`, never print the complete JSON, never copy it into the checkout
    and never commit it. The exit handler captures the original exit status. If the
    original exit status is nonzero and remote mutation has started, preserve evidence
    regardless of the success flag. If the original exit status is zero and cutover
    succeeded, clean evidence. A pre-mutation failure cleans evidence. If cleanup fails
    after successful closure under `set -e`, preserve the still-secured evidence and
    classify the nonzero exit once. Every path must preserve the original exit status
    and restore the prior umask.

Wrangler command semantics must be checked against the pinned version before use.
`wrangler deploy --dry-run` compiles without upload, D1 migration commands maintain a
ledger and Time Travel restore is destructive. References:
[Workers deploy](https://developers.cloudflare.com/workers/wrangler/commands/workers/),
[D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/),
[D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/), and
[Pages deploy](https://developers.cloudflare.com/workers/wrangler/commands/pages/).

## Execution process contract

Start exactly one private, long-lived `/bin/bash` in a persistent PTY/session before
Task 1. Tasks 1–10 are continuations in that same process; it owns the current working
directory, variables, readonly PR/version identifiers, restrictive umask and `EXIT`
trap until Task 10 closes. Never execute the fenced commands as standalone Markdown
blocks or as separate shell invocations.

Task 1 asserts the required session state immediately after initializing it. Every
Task from 2 through 10 begins by asserting that required session state before doing
any task work.

The executor must prove it can retain and write to that same shell session before
Task 1. For Codex, this means one persistent PTY/session ID reused for every command.
If that facility is unavailable, stop before the first mutation and return exactly:

```text
R0_1B_PERSISTENT_SHELL_UNAVAILABLE
```

If the shell dies after any mutation, preserve the private evidence directory, do not
re-deploy, and start only a separate owner-authorized read-only recovery. Never resume
the cutover in a new process because its process-local trap and readonly state are gone.

## Task 1: Verify owner gates and establish the clean merged-main release root

### Preconditions

- Owner checklist identifies the approved docs PR and R0.1A implementation PR.
- Both PRs report merged to `main`.
- Candidate A `invalid` evidence is recorded.
- Candidate B classification is
  `legacy_orphaned_not_present_in_active_inventory`.
- The complete active inventory evidence is recorded with scope
  3 User API Tokens and 1 Account API Token, zero active Workers AI/Vectorize
  permission match.
- No token names or IDs are recorded and no active Cloudflare token mutation was
  authorized or performed.
- Current tracked tree and approved ignored local configuration are sanitized.
- Current-tree secret scan passes; R0.H1 remains a nonblocking tracked-history
  residual and does not imply Candidate B revoke or rotation.
- Owner has issued a separate prompt authorizing R0.1B.

### Commands

Run read-only checks first:

```bash
set -euo pipefail
readonly R0_1B_DOCS_PR=1
readonly R0_1B_IMPL_PR=2
readonly R0_1B_REPOSITORY=thongphan23/thongphan-web
readonly R0_1B_EXPECTED_DEFAULT_BRANCH=main

gh repo view "$R0_1B_REPOSITORY" --json defaultBranchRef
gh pr view "$R0_1B_DOCS_PR" --json state,mergedAt,baseRefName,url
gh pr view "$R0_1B_IMPL_PR" --json state,mergedAt,baseRefName,url

R0_1B_RELEASE_PREFIX=/Users/rio/thongphan-r0-1b-release
test ! -e "$R0_1B_RELEASE_PREFIX"
test ! -L "$R0_1B_RELEASE_PREFIX"
test -d /Users/rio
test ! -L /Users/rio
test -O /Users/rio
r0_1b_release_dir=$(mktemp -d /Users/rio/thongphan-r0-1b-release.XXXXXX)
test -d "$r0_1b_release_dir"
test ! -L "$r0_1b_release_dir"
test -O "$r0_1b_release_dir"
test -z "$(find "$r0_1b_release_dir" -mindepth 1 -maxdepth 1 -print -quit)"
chmod 700 "$r0_1b_release_dir"
git clone --branch "$R0_1B_EXPECTED_DEFAULT_BRANCH" --single-branch \
  "https://github.com/${R0_1B_REPOSITORY}.git" "$r0_1b_release_dir"
cd "$r0_1b_release_dir"
git fetch origin "$R0_1B_EXPECTED_DEFAULT_BRANCH"
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
test -z "$(git status --porcelain)"
R0_1B_MAIN_SHA=$(git rev-parse HEAD)
readonly R0_1B_MAIN_SHA
git show --no-patch --format='%H %cI' "$R0_1B_MAIN_SHA"

source scripts/r0-1b-version-evidence-lifecycle.sh
r0_1b_version_evidence_init /Users/rio/r0-1b-worker-versions
r0_1b_install_exit_trap
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
```

The GitHub result must name `main`; both PRs must be merged with base `main`.
The generated release directory must be owner-controlled and empty before the exact
`main` clone; it must contain no pre-existing user work. Record `R0_1B_MAIN_SHA`
without adding or modifying a repository file yet. The lifecycle trap is installed
inside the clean merged-main checkout before any remote mutation.

### Stop conditions

Stop if default branch is not `main`, either PR is unmerged, HEAD differs from
`origin/main`, porcelain is nonempty, the generated path is unsafe or nonempty, any
credential disposition/inventory/scan evidence is missing, or the execution prompt
does not explicitly authorize production cutover.

### Rollback

No remote mutation has occurred. Leave the temporary checkout untouched for
inspection and return the unmet owner gate.

## Task 2: Re-prove TDD smoke contract and local release gates at the exact SHA

### RED/TDD proof

The smoke runner and fixture test must already be present from merged R0.1A. Review
the test first and prove it rejects wrong status, missing disabled marker, body
overflow, timeout, unexpected POST, queue growth, PII output and broad cleanup.

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
node --import tsx --test scripts/r0-1-production-smoke.test.mjs
```

If the test or runner is absent, do not create it on the release checkout. Stop and
return to a new R0.1A implementation PR.

### Local release commands

```bash
npm ci
npm run test:r0-1b-version-evidence-lifecycle
npm run test:r0-1b-synthetic-identity
npm run test:r0-1b-production-plan-contract
npm run test:r0-1-worker-version-delta
npm run test:r0-1-worker-version-command-contract
npx tsc --noEmit --incremental false
npm run typecheck:brain2-workers
npm run lint
npm test
npm run build
npm run test:release
npm run test:read-release-safety
npm run test:secret-integrity
npx wrangler deploy --dry-run --outdir /tmp/r0-1b-dry-embed --config wrangler.embed.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1b-dry-chat --config wrangler.chat.toml
npx wrangler deploy --dry-run --outdir /tmp/r0-1b-dry-signup --config wrangler.signup.toml
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
```

Inspect embed/chat dry-run output: both must list zero bindings. Confirm
`test:release` does not invoke `test:secret-integrity:history`. The separate history
diagnostic may remain red and is recorded only as the R0.H1 residual.

### Stop conditions

Stop on any failing command, unexpected generated change, binding, nonempty status,
SHA drift or release script that invokes history scanning.

### Rollback

No remote mutation has occurred. Discard no user work; return failures to a new
implementation PR and repeat from a fresh merged-main checkout after merge.

## Task 3: Verify Cloudflare control-plane availability

### Read-only commands

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
npx wrangler --version
npx wrangler versions list --help
npx wrangler versions view 00000000-0000-0000-0000-000000000000 --help
npx wrangler deployments list --config wrangler.embed.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-embed-deployments.json"
npx wrangler versions list --config wrangler.embed.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-embed-versions.json"
npx wrangler deployments list --config wrangler.chat.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-chat-deployments.json"
npx wrangler versions list --config wrangler.chat.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-chat-versions.json"
npx wrangler deployments list --config wrangler.signup.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-signup-deployments.json"
npx wrangler versions list --config wrangler.signup.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-signup-versions.json"
npx wrangler d1 info thongphan-db --config wrangler.brain2-email.toml --json \
  > "$R0_1B_VERSION_DIR/control-plane-d1-info.json"
npx wrangler d1 migrations list thongphan-db --remote \
  --config wrangler.brain2-email.toml \
  > "$R0_1B_VERSION_DIR/control-plane-d1-migrations.json"
chmod 600 "$R0_1B_VERSION_DIR"/control-plane-*.json
for r0_1b_control_file in "$R0_1B_VERSION_DIR"/control-plane-*.json; do
  test -s "$r0_1b_control_file"
  test ! -L "$r0_1b_control_file"
done
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
```

These resource-specific operations prove authentication and resource access without
retrieving user identity or membership output. Never print or copy the complete
control-plane files. The `.json` suffix is mandatory even for the migrations command,
whose pinned CLI output is text; retain only a safe pass/fail summary.

### Stop conditions

Stop on authentication failure, control-plane error, wrong account/resource,
unexpected config, SHA drift or worktree change. Do not use a newly pasted token in
the shell or repository.

### Rollback

No mutation has occurred. Preserve the command outputs and wait for control-plane or
authorization repair.

## Task 4: Deploy the embed tombstone

### Remote mutation

Recheck clean-main invariants, then deploy only the embed Worker:

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
rg -N -x 'name = "brain2-embedder"' wrangler.embed.toml
rg -N -x 'compatibility_date = "2025-01-01"' wrangler.embed.toml
rg -N -x 'workers_dev = false' wrangler.embed.toml
rg -N -x 'preview_urls = false' wrangler.embed.toml
rg -N -x 'pattern = "thongphan.com/api/embed"' wrangler.embed.toml

R0_1B_EMBED_BEFORE="$R0_1B_VERSION_DIR/embed-before.json"
R0_1B_EMBED_AFTER="$R0_1B_VERSION_DIR/embed-after.json"
R0_1B_EMBED_VIEW="$R0_1B_VERSION_DIR/embed-view.json"
npx wrangler versions list --config wrangler.embed.toml --json > "$R0_1B_EMBED_BEFORE"
chmod 600 "$R0_1B_EMBED_BEFORE"
test -s "$R0_1B_EMBED_BEFORE"
r0_1b_mark_remote_mutation_started
npx wrangler deploy --strict --config wrangler.embed.toml
npx wrangler versions list --config wrangler.embed.toml --json > "$R0_1B_EMBED_AFTER"
chmod 600 "$R0_1B_EMBED_AFTER"
test -s "$R0_1B_EMBED_AFTER"
R0_1B_EMBED_VERSION_ID=$(node scripts/r0-1-worker-version-delta.mjs \
  --before "$R0_1B_EMBED_BEFORE" --after "$R0_1B_EMBED_AFTER")
test -n "$R0_1B_EMBED_VERSION_ID"
readonly R0_1B_EMBED_VERSION_ID
npx wrangler versions view "$R0_1B_EMBED_VERSION_ID" \
  --config wrangler.embed.toml --json > "$R0_1B_EMBED_VIEW"
chmod 600 "$R0_1B_EMBED_VIEW"
test -s "$R0_1B_EMBED_VIEW"
```

Inspect the secured view file locally without printing or copying the full object.
It must show `.id` equal to `R0_1B_EMBED_VERSION_ID`,
`.resources.script_runtime.compatibility_date` equal to `2025-01-01`, and an empty
`.resources.bindings` array. The version object does not expose the Worker name or
route. Exact read-only alternatives for those fields are the config assertions above,
the already-passing embed security contract from Task 2, and the exact-route smoke in
Task 5. Record only the safe pass/fail summary and the version ID.

### Stop conditions

Stop before chat deployment if the before list was not captured immediately before
deploy, upload fails, the after list cannot be captured, the helper returns exit `1`
or `2`, route is not the exact apex path, workers.dev/preview URL is enabled, any
binding appears, or readback is ambiguous. A failed capture after a successful deploy
must not trigger another deploy.

### Rollback

The unauthenticated AI/Vectorize version is not an acceptable rollback target.
Re-deploy the last verified 410 tombstone version or fix forward through a reviewed
emergency PR; otherwise leave the route stopped at the safest verified state.

## Task 5: Deploy the chat tombstone and run the first read-only smoke

### Remote mutation

This deploy replaces the existing production Worker in place under the exact identity
`thongphan-chat-api`. Tombstone describes the source behavior; it is not a new Worker
identity.

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test -n "$R0_1B_EMBED_VERSION_ID"
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
rg -N -x 'name = "thongphan-chat-api"' wrangler.chat.toml
rg -N -x 'compatibility_date = "2026-07-27"' wrangler.chat.toml
rg -N -x 'workers_dev = false' wrangler.chat.toml
rg -N -x 'preview_urls = false' wrangler.chat.toml
rg -N -x 'pattern = "thongphan.com/api/chat"' wrangler.chat.toml

R0_1B_CHAT_BEFORE="$R0_1B_VERSION_DIR/chat-before.json"
R0_1B_CHAT_AFTER="$R0_1B_VERSION_DIR/chat-after.json"
R0_1B_CHAT_VIEW="$R0_1B_VERSION_DIR/chat-view.json"
npx wrangler versions list --config wrangler.chat.toml --json > "$R0_1B_CHAT_BEFORE"
chmod 600 "$R0_1B_CHAT_BEFORE"
test -s "$R0_1B_CHAT_BEFORE"
npx wrangler deploy --strict --config wrangler.chat.toml
npx wrangler versions list --config wrangler.chat.toml --json > "$R0_1B_CHAT_AFTER"
chmod 600 "$R0_1B_CHAT_AFTER"
test -s "$R0_1B_CHAT_AFTER"
R0_1B_CHAT_VERSION_ID=$(node scripts/r0-1-worker-version-delta.mjs \
  --before "$R0_1B_CHAT_BEFORE" --after "$R0_1B_CHAT_AFTER")
test -n "$R0_1B_CHAT_VERSION_ID"
readonly R0_1B_CHAT_VERSION_ID
npx wrangler versions view "$R0_1B_CHAT_VERSION_ID" \
  --config wrangler.chat.toml --json > "$R0_1B_CHAT_VIEW"
chmod 600 "$R0_1B_CHAT_VIEW"
test -s "$R0_1B_CHAT_VIEW"
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
```

Inspect the secured view file without printing it. It must show `.id` equal to
`R0_1B_CHAT_VERSION_ID`, compatibility date `2026-07-27`, and an empty bindings
array. Worker name and route are not fields in the version object; the exact config
assertions, the Task 2 chat security contract, the same-service before/after version
delta and the endpoint smoke are the required read-only alternative evidence that
this updated `thongphan-chat-api` in place. No additional tombstone-named Worker may
be created; the historical erroneous identity `thongphan-chat-tombstone` must never
appear in a Wrangler configuration or deploy target.

The smoke must prove both exact endpoints return the 410 contract and `/chat` still
uses its deterministic local journey. This is the required read-only checkpoint
before signup deployment.

### Stop conditions

Stop if the helper returns exit `1` or `2`, the deployed/read-back Worker identity is
not exactly `thongphan-chat-api`, an additional Worker was created, either endpoint differs from
410/no-store/disabled marker, any binding appears, `/chat` fails, the runner exceeds
bounds, or output contains PII. Do not re-deploy if version capture or view readback
fails after the upload.

### Rollback

Re-deploy the last verified 410 tombstone version for the failed endpoint. Never
restore the public AI chat or embed implementation.

## Task 6: Deploy truthful signup and execute one controlled apex registration

### Remote mutation A — signup Worker

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test -n "$R0_1B_CHAT_VERSION_ID"
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
rg -N -x 'name = "thongphan-signup-api"' wrangler.signup.toml
rg -N -x 'compatibility_date = "2025-01-01"' wrangler.signup.toml
rg -N -x 'workers_dev = false' wrangler.signup.toml
rg -N -x 'preview_urls = false' wrangler.signup.toml
rg -N -x 'pattern = "thongphan.com/api/signup"' wrangler.signup.toml
rg -N -x 'pattern = "www.thongphan.com/api/signup"' wrangler.signup.toml

R0_1B_SIGNUP_BEFORE="$R0_1B_VERSION_DIR/signup-before.json"
R0_1B_SIGNUP_AFTER="$R0_1B_VERSION_DIR/signup-after.json"
R0_1B_SIGNUP_VIEW="$R0_1B_VERSION_DIR/signup-view.json"
npx wrangler versions list --config wrangler.signup.toml --json > "$R0_1B_SIGNUP_BEFORE"
chmod 600 "$R0_1B_SIGNUP_BEFORE"
test -s "$R0_1B_SIGNUP_BEFORE"
npx wrangler deploy --strict --config wrangler.signup.toml
npx wrangler versions list --config wrangler.signup.toml --json > "$R0_1B_SIGNUP_AFTER"
chmod 600 "$R0_1B_SIGNUP_AFTER"
test -s "$R0_1B_SIGNUP_AFTER"
R0_1B_SIGNUP_VERSION_ID=$(node scripts/r0-1-worker-version-delta.mjs \
  --before "$R0_1B_SIGNUP_BEFORE" --after "$R0_1B_SIGNUP_AFTER")
test -n "$R0_1B_SIGNUP_VERSION_ID"
readonly R0_1B_SIGNUP_VERSION_ID
npx wrangler versions view "$R0_1B_SIGNUP_VERSION_ID" \
  --config wrangler.signup.toml --json > "$R0_1B_SIGNUP_VIEW"
chmod 600 "$R0_1B_SIGNUP_VIEW"
test -s "$R0_1B_SIGNUP_VIEW"

R0_1_SMOKE_INPUT_FILE=$(node scripts/r0-1b-synthetic-identity.mjs \
  --directory "$R0_1B_VERSION_DIR")
test -n "$R0_1_SMOKE_INPUT_FILE"
test -f "$R0_1_SMOKE_INPUT_FILE"
test ! -L "$R0_1_SMOKE_INPUT_FILE"
readonly R0_1_SMOKE_INPUT_FILE
export R0_1_SMOKE_INPUT_FILE
```

Inspect the secured view file without printing it. It must show `.id` equal to
`R0_1B_SIGNUP_VERSION_ID`, compatibility date `2025-01-01`, and only the reviewed D1,
KV and two rate-limiter bindings. Worker identity and the two routes use the exact
config assertions above as read-only alternative evidence because they are absent
from the version object. The Task 2 signup tests and the controlled smoke below must
prove the merged truthful contract persists only `challenge_signups` and prepares no
`email_queue` statement.

### Remote mutation B — controlled signup and targeted cleanup

Use the owner-approved synthetic identity through the runner's secure input contract;
never place it in a command argument, report or log.

```bash
npx wrangler d1 migrations list thongphan-db --remote --config wrangler.brain2-email.toml
test -n "${R0_1_SMOKE_INPUT_FILE:-}"
test -f "$R0_1_SMOKE_INPUT_FILE"
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --controlled-signup
```

Before the POST, the migration ledger must show `0003_r0_1_email_integrity.sql` as
unapplied and no unexpected migration. The runner's pre-migration snapshots query only
`campaign_version`, `status` and `row_count`; they must not query `audience_state` or
`sendable`, which do not exist until migration `0003`.

The runner must prove exactly one new signup row and zero queue rows for that signup,
capture aggregate evidence, then remove only the synthetic signup. After cleanup,
prove signup count returned to its pre-smoke value and the serialized pre-migration
queue aggregate is byte-identical. The richer `audience_state`/`sendable` aggregate
is a separate post-migration assertion in Task 8.

### Stop conditions

Stop if the helper returns exit `1` or `2`, version readback is ambiguous, migration
`0003` is already applied, an unexpected migration is pending,
signup copy is false, more than one signup is created, any queue row appears, the
synthetic record cannot be uniquely identified, aggregate counts drift, cleanup would
affect a non-synthetic row, or any identity appears in output. Do not proceed to D1
migration, and do not re-deploy to repair a version-capture failure.

### Rollback

For Worker failure, re-deploy the last verified truthful signup version or fix
forward; never restore queue creation or a delivery promise. For smoke failure, do
not perform a broad delete. Preserve aggregate evidence and remove only a positively
identified synthetic signup after owner review.

## Task 7: Capture D1 bookmark and prove the exact migration precondition

### Read-only preflight

Only after controlled-signup cleanup succeeds:

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
npx wrangler d1 time-travel info thongphan-db --config wrangler.brain2-email.toml --json
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status ORDER BY campaign_version,status; SELECT COUNT(*) AS email_log_count FROM email_logs;"
npx wrangler d1 migrations list thongphan-db --remote --config wrangler.brain2-email.toml
```

Record the Time Travel bookmark without PII. The exact pre-migration aggregate must
be 210 `legacy-v0/pending` and zero email logs. The `sendable` field does not exist
until migration 0003; zero sendable rows is therefore verified only after apply. The
only unapplied migration must be `0003_r0_1_email_integrity.sql`.

### Stop conditions

Stop before migration if the bookmark is absent, an aggregate differs, a v1 row
exists, any email log exists, migration `0003` is missing, or any additional
unapplied migration appears.

### Rollback

No D1 mutation has occurred in this task. Retain the bookmark/evidence and reconcile
drift through a reviewed plan.

## Task 8: Apply only migration 0003 and prove quarantine

### Remote mutation

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
npx wrangler d1 migrations apply thongphan-db --remote --config wrangler.brain2-email.toml
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,audience_state,sendable,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status,audience_state,sendable ORDER BY campaign_version,status,audience_state,sendable; SELECT COUNT(*) AS sendable_count FROM email_queue WHERE sendable=1; SELECT COUNT(*) AS email_log_count FROM email_logs;"
npx wrangler d1 migrations list thongphan-db --remote --config wrangler.brain2-email.toml
```

Required result: exactly
`legacy-v0 | pending | quarantined_legacy | 0 | 210`, zero sendable rows, zero email
logs, and no unapplied migration.

### Stop conditions

Stop before Pages build if apply fails, any extra migration applies, the exact
aggregate differs, a row is sendable, a log exists, or the ledger remains dirty.

### Rollback

Do not reverse the migration by making rows sendable. Use the recorded D1 Time Travel
bookmark only for proven schema/data corruption, only with a new explicit owner
approval, and only after proving no legitimate post-bookmark signup would be lost.
Time Travel restore is destructive; otherwise keep email absent and fix forward.

## Task 9: Build and deploy Pages from the exact merged main SHA

### Local build proof

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
npm run build
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test "$(git rev-parse origin/main)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
```

### Remote mutation

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash "$R0_1B_MAIN_SHA"
```

Never substitute a feature/docs branch in `--branch`, and never deploy an artifact
built at another SHA.

### Stop conditions

Stop if the build changes the tracked tree, SHA differs, the output directory is
missing, Pages project is wrong, command is not `--branch main`, or deployment cannot
be associated with the exact recorded SHA.

### Rollback

Do not roll back to Pages content containing the false five-minute delivery promise.
If the deployment itself fails, current production remains in place and R0.1B stays
open. If the new artifact is broken, keep the truthful signup Worker, prepare a
reviewed fix-forward main commit, and redeploy its exact clean SHA.

## Task 10: Run final read-only smoke and close R0.1

### Read-only verification

```bash
test "$R0_1B_EXIT_TRAP_INSTALLED" = 1
test "$R0_1B_EVIDENCE_INITIALIZED" = 1
test -n "$R0_1B_MAIN_SHA"
test -n "$R0_1B_VERSION_DIR"
test -d "$R0_1B_VERSION_DIR"
test ! -L "$R0_1B_VERSION_DIR"
trap -p EXIT | grep -F '_r0_1b_version_evidence_exit_handler'
test -n "$R0_1B_EMBED_VERSION_ID"
test -n "$R0_1B_CHAT_VERSION_ID"
test -n "$R0_1B_SIGNUP_VERSION_ID"
node scripts/r0-1-production-smoke.mjs --origin https://thongphan.com --read-only
npx wrangler versions view "$R0_1B_EMBED_VERSION_ID" \
  --config wrangler.embed.toml --json > "$R0_1B_VERSION_DIR/embed-final-view.json"
chmod 600 "$R0_1B_VERSION_DIR/embed-final-view.json"
test -s "$R0_1B_VERSION_DIR/embed-final-view.json"
npx wrangler versions view "$R0_1B_CHAT_VERSION_ID" \
  --config wrangler.chat.toml --json > "$R0_1B_VERSION_DIR/chat-final-view.json"
chmod 600 "$R0_1B_VERSION_DIR/chat-final-view.json"
test -s "$R0_1B_VERSION_DIR/chat-final-view.json"
npx wrangler versions view "$R0_1B_SIGNUP_VERSION_ID" \
  --config wrangler.signup.toml --json > "$R0_1B_VERSION_DIR/signup-final-view.json"
chmod 600 "$R0_1B_VERSION_DIR/signup-final-view.json"
test -s "$R0_1B_VERSION_DIR/signup-final-view.json"
npx wrangler d1 execute thongphan-db --remote --config wrangler.brain2-email.toml --command \
  "SELECT campaign_version,status,audience_state,sendable,COUNT(*) AS row_count FROM email_queue GROUP BY campaign_version,status,audience_state,sendable ORDER BY campaign_version,status,audience_state,sendable; SELECT COUNT(*) AS sendable_count FROM email_queue WHERE sendable=1; SELECT COUNT(*) AS email_log_count FROM email_logs;"
npx wrangler deployments list --config wrangler.brain2-email.toml
rg -n '^crons = \[\]$' wrangler.brain2-email.toml
test "$(git rev-parse HEAD)" = "$R0_1B_MAIN_SHA"
test -z "$(git status --porcelain)"
```

Inspect the three final secured view files against the same version IDs,
compatibility dates and binding contracts recorded in Tasks 4–6. Do not recalculate
an ID from list ordering or deployment text. If any ID no longer resolves or any
resource differs, R0.1B remains open.

The final smoke must verify `/api/embed`, `/api/chat`, `/library`, a representative
`/library/read/*`, `/chat`, canonical metadata and sitemap. The expected email control
state is Worker absent and cron empty. Record endpoint results, Worker/Pages version
IDs, main SHA, D1 bookmark, migration ledger and aggregate counts without PII.

### Stop conditions

Any failed route, metadata, binding, data, email-runtime, SHA or clean-tree check
leaves R0.1B open. Do not mark R0.1 complete and do not begin R0.2 or PRD-R1.

### Rollback

Read-only verification has no rollback. Apply the owning task's safe rollback or
fix-forward rule; never restore AI bindings, queue creation, false copy or sendability.

### Closure

Update the implementation report and `docs/STATUS.md` in a new documentation PR from
the recorded production state. Closure evidence must distinguish source SHA,
deployed version IDs, Pages deployment, D1 state and remaining R0.H1 residual.
Only after every route, version, D1, email-runtime and safe-summary check above has
passed, mark successful closure, delete the temporary JSON and unregister the trap:

```bash
r0_1b_mark_cutover_succeeded
r0_1b_cleanup_version_evidence
r0_1b_remove_exit_trap
```

On failure after remote mutation, the trap preserves the evidence directory. Stop,
do not re-deploy, do not delete the evidence, return only
`R0_1B_VERSION_EVIDENCE_PRESERVED=<absolute path>`, and wait for an
owner-authorized read-only recovery prompt. Cleanup of preserved evidence requires a
later explicit owner instruction.

## Exact cutover order

1. Obtain approvals and record the Candidate A invalid and Candidate B
   legacy/orphaned complete-active-inventory evidence without live token mutation.
2. Verify Cloudflare control-plane availability.
3. Deploy the embed tombstone.
4. Deploy the chat tombstone.
5. Run read-only smoke for both endpoints and `/chat`.
6. Deploy the truthful signup Worker.
7. Run one controlled synthetic signup on the apex.
8. Verify one signup and zero queue rows.
9. Remove only the synthetic signup after evidence capture.
10. Capture the D1 Time Travel bookmark.
11. Capture the exact pre-migration aggregate.
12. Prove the only unapplied migration is `0003_r0_1_email_integrity.sql`.
13. Apply migration 0003.
14. Prove `legacy-v0 | pending | quarantined_legacy | 0 | 210`.
15. Prove zero sendable rows and zero email logs.
16. Build the exact merged `main` SHA.
17. Deploy Pages from that exact `main` SHA.
18. Run final read-only smoke.
19. Verify `/library`, representative `/library/read/*`, `/chat`, canonical and sitemap.
20. Verify the email Worker is absent and cron is empty.

Stop immediately on drift at any numbered step.

## Explicit stop gate

After Task 10, return the evidence and decision gates to the project owner. Do not
start R0.H1, R0.2 or PRD-R1 without another explicit prompt.
