# Task 3 Report — Canonical Route Migration and SEO Safety

## Status

PASS — `/experiences` is the sole canonical Experience Hub route. The retired
`/challenges` page and data wrapper are deleted, and old inbound traffic is preserved
only through `/challenges /experiences 301`.

## Scope delivered

- Added `scripts/experience-route-contract.test.mjs` to the main test script immediately
  after the Experience Hub contract. It locks canonical page presence, retired page
  absence, the permanent redirect and a source-graph stale-link guard.
- Migrated sitemap and exact/prefix route-mode contracts from `/challenges` to
  `/experiences` with the `evidence-dossier` shell.
- Updated Cinema, SEO and bundle-budget contracts to use the canonical Experience Hub.
- Deleted `app/challenges/page.tsx`, `app/challenges/page.module.css` and
  `lib/challenges.ts`.
- Kept the direct Brain2 route and legacy detail redirect unchanged.

## Plan-conflict resolution

The prescribed stale-link guard scans executable `app`, `components` and `lib` sources,
but `lib/site-journey.ts` still contained `href: '/challenges'`, while Task 3 initially
forbade Task 4 journey work. Work stopped before edits and the coordinator authorized
the minimum overlap: rename only `actions.challenges` to the exact final
`actions.experiences` action and point `asset-detail.primary` at it. `JourneyKey
'challenges'` and `journeyHandoffs.challenges` remain unchanged for Task 4; navigation
and Learn were not modified. `scripts/site-journey.test.ts` now locks the asset-detail
destination and no longer tries to read the intentionally deleted challenge data file.

## TDD evidence

### RED

```text
node --import tsx --test scripts/experience-route-contract.test.mjs scripts/site-route-mode.test.ts scripts/subpage-cinema-contract.test.mjs scripts/site-journey.test.ts
14 tests: 8 pass, 6 fail
```

Failures were the intended missing migration behavior: the retired page still existed,
four executable sources contained stale destinations, `/experiences` had no route mode,
the old data file still existed and asset detail still targeted `/challenges`.

During self-review, `npm run test:bundle` also failed 2/3 because its route inventory
still required `out/challenges.html`. Replacing that single entry with
`experiences.html` made the bundle contract pass 3/3.

### GREEN and verification

```text
Focused route and journey contracts   14/14 pass
npm run build                         exit 0, 82/82 static pages
npm run test:seo                      4/4 pass
npm test                              220/220 pass, 0 fail
npm run test:bundle                   3/3 pass
git diff --check                      pass
```

The build emitted the existing multi-lockfile workspace-root warning and one transient
webpack retry, then compiled, typechecked and exported successfully.

## Self-review

- The stale-link guard passes without an allowlist or redirect-source exception.
- `/experiences` is present and `/challenges` absent in the built sitemap.
- No executable app/component/lib source points to `/challenges`; image directory names
  and redirect compatibility remain deliberately unchanged.
- No Learn repository, navigation component or Brain2 entitlement code changed.
- Remaining Task 4 boundary: retire the legacy `JourneyKey 'challenges'` and handoff,
  then integrate pinned navigation as planned.
