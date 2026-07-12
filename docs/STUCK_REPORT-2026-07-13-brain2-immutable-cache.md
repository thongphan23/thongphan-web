# STUCK REPORT — deleted Brain2 immutable Pages URLs still serve legacy HTML

Date: 2026-07-13

## Resolution — 2026-07-13

Anh Thông approved the stronger retirement architecture. A dedicated Worker now owns
the proxied route `brain2.thongphan.com/*`; response header
`X-TP-Legacy-Redirect: worker-v1` proves the Worker serves the domain independently
of Pages. After root/path/API POST smoke passed, the Pages custom-domain association
and then the complete `brain2-platform` project were deleted.

Wrangler project inventory no longer contains `brain2-platform`. A post-delete scan
made 128 requests: the exact 64 snapshot URLs plus 64 independently cache-busted
variants. All 128 failed at the retired hostname boundary, with zero body bytes and
zero legacy-content fingerprints. This report is resolved; the project snapshot
remains private only as rollback evidence and must not be redeployed.

## Scope

Finish the approved retirement of 64 content-bearing `brain2-platform` Pages
deployments after canonical production and the redirect-only replacement passed.

## Verified completed state

- Canonical Pages production deployment `a0554edc-d877-4133-bac9-2262b5cefdb7`
  passes public, protected-access, signup and rendered QA.
- Legacy redirect deployment `5ec622ea-15b1-439c-bb2e-3a175359491c` returns a
  body-free `301` for root, old paths, API POSTs and query strings.
- Pages project readback contains no `REFLECTIONS`, `BREVO_API_KEY` or
  `BREVO_LIST_ID` binding.
- The private snapshot allowlist contained exactly 64 unique production deployment
  IDs across API pages `25/25/14`, including audited ID
  `8d400ccd-3357-4c51-9a0f-87bd2648b9ff`.
- Pre-delete live inventory matched exactly those 64 IDs plus the one redirect ID.
- All 64 delete calls returned Cloudflare API success. Post-delete inventory contains
  exactly one production deployment: the redirect.

## Repeated blocker

Every deleted hash URL still returned HTTP `200` and legacy HTML immediately after
API deletion. A cache-busted sample was then checked five times over 60 seconds; all
five responses still contained the exact legacy page title. The custom domain and
project alias correctly return the new `301`, so the remaining exposure is limited
to already-known immutable `*.brain2-platform.pages.dev` hashes.

Cloudflare's official Pages documentation says deletion removes deployments from
public availability, while its serving documentation also describes internal Pages
asset caching that can persist after deployment changes. The account cannot purge the
Cloudflare-owned `pages.dev` zone through the normal zone cache API.

Sources:

- `https://developers.cloudflare.com/pages/configuration/api/`
- `https://developers.cloudflare.com/pages/configuration/serving-pages/`
- `https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/delete/`

## Decision boundary

Do not claim final retirement and do not merge/push the release evidence while any
deleted immutable hash still serves the legacy body. Do not delete the whole Pages
project or move `brain2.thongphan.com` to a Worker route without explicit approval:
that changes the approved redirect architecture and may require a DNS/custom-domain
handoff. The safe current state is canonical production live, legacy custom domain
redirect-only, bindings removed, API inventory cleaned and private snapshot retained.
