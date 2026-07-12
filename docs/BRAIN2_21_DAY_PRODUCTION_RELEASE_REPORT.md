# Origin Story + 21 ngày Brain2 — production release report

Last updated: 2026-07-12

## Release boundary

- Canonical public hub: `/brain2/21-ngay`.
- Public reading bodies: days 01–07.
- Conan Maker-only bodies: days 08–21, outside the repository and static export.
- Included story surfaces: compact homepage bridge and five-act `/about` film.
- Explicitly excluded: private Brain2 vault, Brain2 chat and access to the standalone Brain2 app.
- Legacy retirement is allowed only after canonical production, protected access and signup smoke pass.

## Local release-candidate verdict

**PASS with two Task 15 deployment prerequisites still intentionally unresolved:** the dedicated production KV ID and the two generated Keychain secrets do not exist yet. The email Worker also remains inert because the existing Brevo credential has not passed provider health validation.

No protected lesson body, raw access code, session secret, subscriber identity or authorized lesson screenshot is recorded in this report.

## Automated verification

| Gate | Result | Evidence |
| --- | --- | --- |
| Main functional suite | PASS | `211/211` tests |
| Brain2 release suite with authoritative source/private package paths | PASS | `145/145` tests |
| Read safety | PASS | `3/3` tests |
| ESLint | PASS | zero warnings/errors |
| Frontend TypeScript | PASS | `npx tsc --noEmit --incremental false` |
| Brain2 Worker TypeScript | PASS | `npm run typecheck:brain2-workers` |
| Static production build | PASS | `82/82` generated routes |
| SEO/build/bundle release gates | PASS | build `6/6`, SEO `4/4`, bundle `3/3` |
| Protected fingerprint boundary | PASS | 2,689 files / 6,882 fingerprints / zero hits |
| Production dependency audit | PASS | zero vulnerabilities from `npm audit --omit=dev` |
| Diff hygiene | PASS | `git diff --check` |

The release build contains the hub plus exactly 21 canonical lesson shells. Seven public lessons are indexable; 14 protected shells are `noindex` and contain metadata only. Authoritative `DAY_CONTENT`, the tracked manifest and every public/private release package match by exact metadata and content checksum.

## Content and link integrity

- 21/21 lessons validated in exact day order.
- 41 copy-derived prompt blocks retained.
- 65 source-link occurrences inventoried: 60 retained HTTPS occurrences and five intentionally omitted unsafe/stale occurrences.
- The 60 retained occurrences resolve to 40 unique live targets; all 40 passed bounded HEAD→GET validation with HTTPS redirect protection.
- The five-act story contains the approved consequence once, labels it as a personal account and does not present it as audited financial data.
- The previously oversized viral-article cover is now a physically verified `1200×630` WebP: `68,112` bytes instead of the former `1,109,189`-byte PNG.

## Bundle budgets

- Brain2 hub route delta: `5,055` bytes gzip; budget `65 KiB`.
- Public lesson route delta: `13,004` bytes gzip; budget `45 KiB`.
- Every first-view local raster used by the release matrix stays below `500 KiB`.

## Rendered browser QA

Local Cloudflare Pages-compatible serving used `wrangler pages dev out` rather than a generic static server.

- Matrix: seven representative routes × five viewports × normal/reduced motion = `70/70 PASS`.
- Viewports: `1440×900`, `1280×720`, `1024×768`, `390×844`, `320×568`.
- Routes: `/`, `/about`, the hub, days 01, 07, 08 and 21.
- Assertions: one main/H1, no horizontal overflow, no broken eager image, bounded lazy-image activation, pinned-header clearance, CLS ≤0.1, route-specific counts, protected metadata/body separation and expected 401 handling.
- Interactions: `9/9 PASS` — evidence modal and pinned mobile-menu Tab traps, public progress persistence, prompt copy/focus, protected gate/error state, tampered and authorized sessions through the actual built access Worker, and day 01/day 07 with JavaScript disabled.
- Protected browser fixtures are loopback-only. They assert the actual Worker's 401/200 behavior, private/no-store, `Pragma`, `Vary`, CSP, `nosniff` and `noindex` headers; the authorized case verifies three private document sections without recording their text or screenshot.
- A real 404 caused by treating the standalone Conan Maker document as a Next.js route was found and fixed on both homepage and `/about`; only canonical `/conanmaker/` document anchors remain.
- Visual review confirmed readable desktop/mobile composition, complete faces in approved evidence imagery and a calm paper-light lesson reader consistent with the Cinema system.

Evidence is outside the repository:

- `/tmp/thongphan-brain2-release-qa/qa-report.json`
- `/tmp/thongphan-brain2-release-qa/home-desktop-motion.png`
- `/tmp/thongphan-brain2-release-qa/home-mobile-reduced.png`
- `/tmp/thongphan-brain2-release-qa/about-desktop-motion.png`
- `/tmp/thongphan-brain2-release-qa/about-mobile-reduced.png`
- `/tmp/thongphan-brain2-release-qa/brain2-hub-desktop-motion.png`
- `/tmp/thongphan-brain2-release-qa/brain2-day-01-desktop-motion.png`
- `/tmp/thongphan-brain2-release-qa/brain2-day-08-mobile-reduced.png`

## Protected-content safety

- Private-package scan covers Git files, unignored files, `.next/static`, all `.next/**/*.map`, `out` and fresh Worker dry-run bundles.
- The Task 14 diagnostic scanned `2,689` files against `6,882` protected fingerprints with zero hits and zero symlinks, including every `.next/server` artifact.
- The explicit strict Task 15 mode fails closed unless both Keychain accounts exist. Both modes refuse Worker bundles older than the access source/config/manifest/runtime inputs.
- Current strict CLI result is the expected Task 15 prerequisite failure: Keychain has neither `access-code` nor `session-secret`. The error is generic and disclosed no secret value.

## Task 15 production checklist

- [ ] Create isolated `BRAIN2_PROTECTED_CONTENT` KV and patch the real ID.
- [ ] Apply and read back D1 migration `0002_brain2_access_and_email_campaign.sql`.
- [ ] Generate two high-entropy secrets, store raw values only in Keychain and upload only the code hash/session secret to the Worker.
- [ ] Upload and checksum-readback all 14 immutable protected packages.
- [ ] Run the strict private scan with two Keychain secrets and fresh Worker bundles.
- [ ] Deploy and smoke the dedicated access Worker.
- [ ] Deploy signup v2 before the first controlled signup.
- [ ] Deploy Pages preview read-only, then production and smoke public/protected journeys.
- [ ] Enable email only if a valid Brevo credential passes a controlled health/smoke check; otherwise keep cron and email routes undeployed.
- [ ] Replace the legacy site with redirect-only content, remove legacy secret/bindings, delete the exact audited content-serving deployments and verify the redirect.
- [ ] Record deployment IDs, production screenshots, rollback point and final pass/fail here.
