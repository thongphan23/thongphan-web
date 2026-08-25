# R0.1 Owner Action Checklist

This checklist is a control record, not production authorization. Every production
action still requires a separate explicit R0.1B prompt. Record no credential value,
identity, contact detail or personal name in this file.

## Evidence fields

For every checked action, record only these non-secret fields in the R0.1
implementation report:

| Field | Required content |
|---|---|
| Provider | Service or repository provider |
| Actor role | Authorized role, never a personal name |
| Action | Approved/revoked/rotated/merged/verified action |
| UTC time | ISO 8601 timestamp |
| Result | Non-secret pass/fail state and evidence reference |

## Documentation and branch gates

- [x] Documentation correction PR reviewed.
- [x] Documentation correction PR merged into `main`.
- [x] GitHub default branch is `main`.
- [x] R0.1A branch `agent/r0-1a-security-remediation` created only after the
  documentation correction PR is merged.
- [x] R0.1A implementation PR reviewed.
- [x] R0.1A implementation PR merged into `main`.
- [ ] Fresh release checkout created from `main`.
- [ ] `git fetch origin` completed in the release checkout.
- [ ] Exact clean `main` SHA recorded and proven equal to `origin/main`.
- [ ] Release checkout porcelain status verified empty.

## Credential and current-tree gates

- [x] Candidate A invalid verification evidence recorded.
- [x] Candidate B classified `legacy_orphaned_not_present_in_active_inventory` and
  absent from the complete active inventory.
- [x] Candidate B complete active-token inventory evidence recorded.
- [x] Inventory scope recorded without token names or IDs: 3 User API Tokens and
  1 Account API Token.
- [x] Zero active Workers AI/Vectorize permission match recorded.
- [x] No active Cloudflare token mutation was authorized or performed.
- [x] Current tracked tree and approved ignored-local configuration sanitized and
  current-tree secret scan passed.
- [x] Public-history exposure recorded as a residual risk without sensitive content.
- [x] R0.H1 remains separate and has not been treated as an R0.1 release gate.

No token names or IDs are recorded in this checklist. R0.H1 is nonblocking
public-history hygiene for tracked historical plaintext; R0.H1 does not imply
Candidate B revoke or rotation.

## Completed non-secret evidence

| Provider | Actor role | Action | UTC time | Result | GitHub evidence reference |
|---|---|---|---|---|---|
| GitHub | Repository maintainer | Documentation correction reviewed and merged into `main`; default branch verified as `main` | `2026-07-26T14:11:16Z` | Pass | [PR #1](https://github.com/thongphan23/thongphan-web/pull/1) |
| GitHub | Repository maintainer | R0.1A implementation reviewed and merged; remote implementation branch deleted | `2026-07-27T08:28:39Z` | Pass | [PR #2](https://github.com/thongphan23/thongphan-web/pull/2) |
| Cloudflare / GitHub | Authorized account owner | Candidate A invalid and Candidate B active-inventory disposition recorded without identifiers | `2026-07-27T08:28:39Z` | Pass; no active token mutation | [PR #2](https://github.com/thongphan23/thongphan-web/pull/2) |
| Cloudflare / GitHub | Authorized account owner | Inventory scope and zero active AI/Vectorize permission match recorded | `2026-07-27T08:28:39Z` | Pass | [PR #2](https://github.com/thongphan23/thongphan-web/pull/2) |
| GitHub | Verification agent | Current tree sanitation and nonblocking R0.H1 residual verified | `2026-07-27T09:00:40Z` | Pass; R0.H1 remains separate | [PR #2](https://github.com/thongphan23/thongphan-web/pull/2) |

## Production authorization gates

- [ ] Separate R0.1B execution prompt issued.
- [ ] Cloudflare change window approved.
- [ ] Cloudflare control-plane availability verified before mutation.
- [ ] Tombstone Worker deployments approved.
- [ ] Truthful signup Worker deployment approved.
- [ ] One controlled synthetic apex signup approved.
- [ ] Targeted removal of only the synthetic signup approved after evidence capture.
- [ ] D1 Time Travel bookmark capture approved.
- [ ] Migration `0003_r0_1_email_integrity.sql` remote application approved.
- [ ] Exact merged-`main` Pages deployment approved.
- [ ] Final read-only production verification approved.

## Negative confirmations

- [ ] No production command will run from a docs, feature or PR branch.
- [ ] No email Worker deployment is approved.
- [ ] No cron activation, provider send or audience import is approved.
- [ ] No Git history rewrite or force-push is approved by this checklist.
- [ ] R0.2 has not started.
- [ ] PRD-R1 has not started.

## Stop rule

Any unchecked mandatory item, drift, failed verification or missing non-secret
evidence stops R0.1B. Do not infer approval from a merged PR or earlier design review.
