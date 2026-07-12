# STUCK REPORT — legacy reader image fetch

Date: 2026-07-12

## Scope

Materialize the remote editorial images that were previously hotlinked by
`read.thongphan.com` into `public/images/readings/<slug>/`.

## Repeated blocker

Two consecutive runs of `npm run migrate-readings` failed while Node `fetch`
requested Wikimedia assets:

1. HTTP 429 on a Wikimedia thumbnail URL.
2. `ETIMEDOUT` / `EHOSTUNREACH` from Undici on the same asset family.

The URL itself is valid: `curl -I -L` returned HTTP 200 from the same machine.

## Decision

Stop retrying or patching the Node-fetch path in this rescue. Pre-materialize the
same immutable source URLs with `curl --retry-all-errors`, then run the deterministic
migration against the local files. This changes transport only; source URL, bytes,
checksum, caption, credit and legacy provenance remain in the package.

