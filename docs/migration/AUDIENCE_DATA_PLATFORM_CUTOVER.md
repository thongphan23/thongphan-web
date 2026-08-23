# Audience signup -> Data Platform cutover

- Updated: 2026-08-23
- Current verdict: `PRODUCTION_PASS`
- Public surface: `POST https://thongphan.com/api/signup`
- Canonical domain owner: Audience
- Canonical production store: existing D1 `thongphan-db`
- Logical ingress: `POST https://api.thongphan.com/v1/audience/challenge-signups`

## Scope

This is one strangler slice, not a website rewrite. It moves only the Brain2
challenge registration command behind the shared gateway. It does not move Git
content, Brain2 Markdown/YAML, Read packages, browser bookmarks, protected Brain2
access, the inert email campaign, Learn or any other website route.

## Ownership and request path

```mermaid
flowchart LR
  F["Signup form"] --> B["thongphan.com signup BFF"]
  B -->|"origin check + IP/email rate limit"| G["api.thongphan.com v1 Audience command"]
  G -->|"isolated audience:signup principal"| A["Audience domain repository"]
  A --> D["thongphan-db canonical rows"]
  A --> C["uniqueness + idempotency + audit + outbox"]
```

The browser receives the existing `{success,message,signup_id}` DTO and never
receives a database credential, table name or unrestricted mutation shape. The
website BFF keeps abuse protection. The gateway owns schema validation,
normalization, identity from the authenticated consumer, idempotency, uniqueness,
audit and the atomic canonical commit.

## Verified pre-cutover production inventory

Read-only Wrangler queries were pinned by the existing signup config to D1 UUID
`7cffb7f5-c48b-49c2-b215-9611abd734a5` and wrote zero rows.

| Object | Current count |
| --- | ---: |
| `challenges` | 1 |
| `challenge_signups` | 12 |
| normalized challenge/email identities | 11 |
| normalized duplicate groups | 1 |
| extra duplicate source rows | 1 |
| `email_queue` | 210 |
| `email_logs` | 0 |
| `brain2_access_failures` | 33 |

All 12 stored names are nonblank and all 12 emails pass the existing basic email
shape check. The latest signup is `2026-08-11T23:53:31.922Z`. No name or email was
printed into task evidence.

## Migration behavior

The Data Platform domain migration creates:

- `audience_signup_keys`: one normalized challenge/email claim pointing to the
  canonical legacy or newly created signup;
- `audience_idempotency_receipts`: exact consumer/key/request-hash result;
- `audience_audit_log`: actor, consumer, action, subject and request lineage;
- `audience_outbox_events`: PII-minimized domain change record;
- `audience_data_quality_quarantine`: explicit review state for source conflicts.

It does not delete or overwrite `challenge_signups`. For a legacy normalized
duplicate, the earliest stable row becomes the uniqueness owner and every extra
source row remains in place with a quarantine reason. A production-like local
SQLite fixture retained both source rows, created one key, quarantined one extra
row, returned `integrity_check=ok` and had zero foreign-key findings.

## Local implementation evidence

- The BFF gateway mode performs no D1 statement and forwards only the approved
  command DTO with bearer, request and idempotency headers.
- Missing gateway credential fails closed. The source retains a bounded legacy
  branch for historical rollback compatibility, but the live signup Worker has no
  D1 binding and therefore cannot execute it.
- The browser keeps one random idempotency key across a retry and rotates it when
  form input changes.
- Data Platform Node contract, Workers+D1 integration and TypeScript gates pass.
- Website signup tests and both website TypeScript gates pass.

## Reviewed live sequence — executed 2026-08-23

Items 1–8 and 10 completed. Item 9 remained a conditional incident response; its
credential rollback/forward behavior was rehearsed on staging with new immutable
versions because Cloudflare correctly refused unsafe activation of a historical
version whose secret had changed.

1. Snapshot both Worker traffic baselines and the production consumer directory.
2. Bind `AUDIENCE_DB` in staging to the existing staging Data Platform D1 to avoid
   a new Cloudflare resource. Apply the Audience migration there and seed only a
   synthetic `example.invalid` challenge identity.
3. Append one isolated `audience:signup` consumer to staging. Deploy the immutable
   gateway version and prove first write, exact replay, fresh-key duplicate,
   wrong-scope `403`, table counts and unchanged registry baseline.
4. Export production `thongphan-db` to a mode-0600 backup, record SHA-256 and D1
   Time Travel bookmark, restore locally, and verify integrity, foreign keys and
   exact counts.
5. Apply the production Audience migration. Read back 12 source signups, 11 keys,
   exactly 1 quarantine row and zero change to the 210 legacy email rows.
6. Bind production Data Platform `AUDIENCE_DB` to the existing `thongphan-db`,
   append one isolated consumer without changing existing entries, upload and
   promote the immutable version, then verify all bindings and old Reach/Learn
   probes.
7. Store the same consumer token only as `DATA_PLATFORM_AUDIENCE_TOKEN` on the
   signup BFF. Upload/promote the BFF with `DATA_PLATFORM_URL` set to the exact
   gateway hostname.
8. Perform one bounded synthetic public signup, replay it with the same key, test
   a fresh-key duplicate, compare exact database deltas and retain the synthetic
   row as labelled operational evidence unless a separate exact deletion is
   approved.
9. On failure, restore both Worker traffic baselines. The migration is additive,
   so the old Worker remains readable; do not delete new control tables during
   an incident.
10. After a stable acceptance window, remove direct signup D1 authority in a
    separate task. Keep D1 on Pages only while `/api/challenges` still needs it.

## Production result

- Durable private evidence and mode-0600 pre/post SQL exports are under
  `/Users/rio/Private/thongphan-audience-cutover-20260823`.
- The pre-migration backup SHA-256 is
  `e5802c372c2035432c13403d9e3ab3456745f64d54747538af5afa06634538f8`;
  isolated restore returned integrity `ok`, zero foreign-key findings, 12 signups
  and 210 email-queue rows. The immediate Time Travel bookmark is recorded in the
  private manifest.
- The migration retained 12 source signups, created 11 normalized keys and 1
  quarantine row, and changed neither the 210 inert email rows nor the old website
  migration ledger.
- Data Platform production version
  `e5849065-6a6a-4b2e-a7e3-0d7cf6d4bfbb` preserves Reach and all five Learning
  roles and adds only the isolated Audience principal/binding.
- Signup Worker version `ac79e610-2ed4-4c4e-bc99-6dde54463fd7` is live at 100%
  with no D1 binding. The exact public first write/replay returned the same signup
  ID; a fresh key returned `409`. Final counts are 13 signups, 12 keys, 1
  quarantine, 1 production receipt/audit/outbox event, 210 email-queue rows and 0
  email logs.
- Staging rollback version `97c06b38-8daf-41d6-b9fc-ce8d2dde0faa` kept health and
  Learning at `200` while revoking Audience to `401`; restored version
  `821b2ba5-70ce-4287-8cdd-3229a591bd8d` returned Audience to authenticated
  validation and is live at 100%.
- No Pages deployment, new Cloudflare resource, paid plan or email activation was
  used.

## Stop conditions

These were the live execution gates. None triggered during the completed cutover.

Stop before mutation if the backup cannot be restored, the D1 bookmark or binding
identity is uncertain, consumer preservation is not exact, staging modifies
registry rows, production counts differ from this inventory, any email becomes
sendable, or Cloudflare asks for a paid upgrade.
