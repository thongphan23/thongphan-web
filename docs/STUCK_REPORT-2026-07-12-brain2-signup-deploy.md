# STUCK REPORT — Brain2 canonical cutover control plane

Date: 2026-07-12

Resolved: 2026-07-13. Two consecutive read-only checks later passed for both Worker
versions and Pages deployments. Signup v2, preview and canonical production were then
deployed and smoked. This report is retained as incident history; the current open
boundary is `STUCK_REPORT-2026-07-13-brain2-immutable-cache.md`.

## Scope

Deploy the already verified `thongphan-signup-api` v2 Worker and read-only Pages
preview before the canonical Pages production cutover.

## Repeated blocker

Two consecutive `npx wrangler deploy --config wrangler.signup.toml --strict` runs
failed in the Cloudflare control plane before a code/config verdict:

1. HTTP `521` while Wrangler requested the existing Worker's secrets endpoint.
2. HTTP `521` while Wrangler requested the existing Worker service endpoint.

Cloudflare's earlier public incident was then marked resolved, which constituted an
external state change. The one resumed audit produced this exact sequence:

1. `21:38Z`: the read-only Pages preview failed with HTTP `522` while reading the
   `thongphan-com` Pages project.
2. `21:40Z`: one fresh strict signup deploy failed with HTTP `522` while reading the
   Worker secrets endpoint.
3. `21:41Z`: a read-only `versions list` diagnostic succeeded once, then an immediate
   repeat failed with HTTP `522` on the signup Worker versions endpoint, confirming an
   intermittent control-plane failure rather than a deploy verdict.

All failed responses were Cloudflare HTML error pages reported by Wrangler as malformed API
responses. The local release artifact remains green; no signup request or D1 signup/
email-queue mutation was performed by these failed deploys.

At `2026-07-12T21:42Z`, Cloudflare's official status API reported a new unresolved
incident, `cbtmdg3gyx4z` (`Cloudflare dash is unavailable`), with both the customer API
and Dashboard degraded. Its incident update explicitly states that Dashboard and
related API requests may fail. This confirms a current upstream control-plane outage;
it is not a reason to retry a release mutation while the incident is investigating.
Evidence: `https://www.cloudflarestatus.com/api/v2/incidents/unresolved.json` and
`https://stspg.io/962y0j35fzq5`.

## Independent email gate

The only authorized local legacy Brevo credential returned HTTP `401` during its
provider health check, and no replacement credential was found in Keychain. The
approved fallback therefore applies: keep the email Worker and cron undeployed. No
provider send and no v1 email-queue mutation occurred.

## Decision

This decision applied while the incident was open. The control plane later passed its
release gate and the canonical production deployment proceeded. The email Worker/cron
remains undeployed because the independent Brevo credential gate still returns 401.
