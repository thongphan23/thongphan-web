# Task 2 Report — Validated Reading Package Ingestion

Date: 2026-07-10

Base commit: `8e1eb10f585c52f7b489030ab2bf5a3e0bc84cb5`

Verdict: **PASS**

## Goal

Migrate the 13 legacy Read records into deterministic, committed packages without republishing translated bodies or uncleared media. Main-site dev/build must generate public summary data only from those committed packages and must not depend on the external Read repo.

## Scope delivered

- Added 13 directories under `content/readings/<slug>/` with exactly:
  - `article.json`
  - `rights.json`
  - `image-pack.json`
- Added a manual TSX-backed migration script that imports `libraryItems` from the legacy Read repo, writes the packages, and validates after each group of three plus the final package.
- Added a fail-closed rights/package validator.
- Added a byte-stable package-only generator and typed public read API.
- Added a local-only ready-asset validator/materializer. It performs no network or download work.
- Wired `generate-readings` into `dev` and `build`, while leaving migration manual.
- Added focused ingestion/rights/checksum/API tests to `npm test`.

## Deliberate non-goals

- No Task 3 routes, reader UI, components, CSS, or public content pages.
- No changes to the legacy Read runtime or plugin publishing workflow.
- No image/audio copy: the current audit cleared zero media records and found zero ready audio records.
- No full translated sections, paragraphs, or blocks in committed `article.json` or generated public TypeScript.
- No dependency from `dev` or `build` on `/Users/rio/Projects/thongphan-read`.

## Data and rights result

| Gate | Result |
| --- | ---: |
| Packages | 13 |
| Full publication | 0 |
| Source-link summary | 13 |
| Blocked | 0 |
| Legacy media candidates retained privately | 65 |
| Ready/public media | 0 |
| Ready/public audio | 0 |

Each `article.json` contains safe catalog/editorial context, the legacy section count, legacy block count, a legacy-body checksum, a package content checksum/version, and exact `/library/read/<slug>` canonical path. It does not contain legacy body arrays.

Each `rights.json` uses:

```json
{
  "rightsStatus": "source-link-only",
  "publicationMode": "summary",
  "textRights": {
    "translation": false,
    "publicWeb": false,
    "commercialContext": false
  },
  "evidence": []
}
```

Each `image-pack.json` retains legacy source location, alt, caption, credit, provenance, and `pending-rights` status. Pending candidates have no `publicPath`; none are copied into `public/` or emitted in `lib/readings-data.generated.ts`.

## TDD evidence

### RED

Command:

```text
npm exec -- tsx --test scripts/generate-readings-data.test.mjs
```

Observed before implementation:

```text
not ok 1 - reading ingestion artifacts exist before package validation
error: expected reading packages, generator, validator, and materializer
tests 5, fail 1, skipped 4
exit 1
```

The failure was the intended missing-feature assertion, not a syntax or fixture error.

### GREEN

Command:

```text
npm exec -- tsx --test scripts/generate-readings-data.test.mjs
```

Observed after implementation:

```text
tests 6, pass 6, fail 0, skipped 0
exit 0
```

Focused coverage includes package parity with the legacy source, absence of translated body keys, rights promotion rules, checksums, deterministic adapters, byte-stable generation, public API fail-closed behavior, unknown-slug null behavior, and zero-ready asset handling.

## Migration and generation evidence

Manual migration command:

```text
node --import tsx scripts/migrate-readings.mjs
```

Observed:

```text
Validated 3/13 reading packages
Validated 6/13 reading packages
Validated 9/13 reading packages
Validated 12/13 reading packages
Validated 13/13 reading packages
Migrated 13 fail-closed reading packages; copied 0 images and 0 audio files
```

Rights validation:

```text
npm run validate-reading-rights
packages 13, full 0, sourceLinkOnly 13, blocked 0
```

Asset materialization:

```text
npm run materialize-reading-assets
ready 0, validated 0
```

Two consecutive generation runs produced identical bytes:

```text
3df7e7ffcf3bf76929d8059d5ce84e5f8f18db5fbb0f313e778e22663ddb9a46
```

## Full verification

| Command | Result |
| --- | --- |
| `npm test` | PASS — 39/39 tests, 0 failures |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run build` | PASS — production build and 38 static pages generated |
| body/public-path scan | PASS — no `sections`, `paragraphs`, `blocks`, or `publicPath` keys in articles/generated public data |
| generated media scan | PASS — generated records contain `images: []` and `audio: []`; no media hotlinks |

The build emitted the pre-existing Next.js multiple-lockfile workspace-root warning and the existing edge-runtime/static-generation warning. Neither is introduced by this slice and neither failed the build.

## Self-review

- **Rights boundary:** PASS. `source-link-only` and `blocked` packages are rejected if any body key appears recursively. Full publication requires an approved full-text rights status, all three text-right booleans, and retained non-placeholder evidence.
- **Public API boundary:** PASS. Blocked records are omitted; unknown slugs return `null`; summaries explicitly strip body/media fields; no pending candidate/provenance data is generated publicly.
- **Source parity:** PASS. Default tests compare all 13 packages against a committed safe manifest; optional live-source parity remains available as an explicit manual command without copying the bodies.
- **Determinism:** PASS. Package and media checksums are regenerated from stable JSON inputs; topic, intent, and duration adapters are deterministic; package directories and generated records are sorted.
- **Runtime independence:** PASS. Only manual migration/parity commands import the external Read repo. Default tests, dev, and build use committed files only.
- **Asset safety:** PASS. Pending candidates cannot have `publicPath`; ready records require a local reading path, checksum, source URL, license, and rights evidence. Materialization only reads and verifies ready local files.
- **Scope:** PASS. No Task 3 UI, Conan files, images, audio, `next-env.d.ts`, or `tsconfig.tsbuildinfo` are included in the intended commit.

## Final verdict

**PASS.** Task 2 acceptance criteria are met with 13 committed fail-closed reading packages, deterministic generation, no translated body publication, no media/audio publication, and fresh test/type/build evidence.

## Independent review remediation

Review verdict received after commit `56ad83a`: **Needs fixes**. All four findings were addressed in a focused follow-up.

### Fixes

1. **Portable default tests**
   - Replaced the default-suite import of the external Read repo with `scripts/fixtures/readings-legacy-manifest.json`.
   - Added a regression assertion that the default test file contains neither the absolute legacy path nor the legacy-root environment variable.
   - Added `npm run test:readings-live-parity` as an explicit optional/manual check. It is not referenced by `npm test`, dev, or build.
2. **Complete rights-evidence validation**
   - Allowed evidence types are now `license`, `permission`, and `public-domain`.
   - Every retained evidence record requires a non-placeholder `reference` and a real calendar date in `YYYY-MM-DD` form.
   - Invalid `type`, placeholder/unverified `verifiedAt`, and impossible dates cannot unlock full publication.
3. **Explicit publication mode**
   - `publicationMode` must be one of `summary`, `full`, or `blocked` before status compatibility is evaluated.
   - Missing and misspelled modes are rejected explicitly.
4. **Ready-media containment**
   - Validator and materializer now share normalized path logic.
   - A ready asset must remain beneath `public/images/readings/<slug>/`; traversal and non-canonical paths are rejected before any file read.

### Follow-up TDD evidence

RED command:

```text
npm exec -- tsx --test scripts/generate-readings-data.test.mjs
```

Observed before the fixes:

```text
tests 11, pass 6, fail 5
```

The five expected failures were: missing manual live-parity command, placeholder evidence type accepted, missing publication-mode enum validation, validator traversal accepted, and materializer traversal reaching `ENOENT` instead of being rejected.

GREEN command:

```text
npm exec -- tsx --test scripts/generate-readings-data.test.mjs
```

Observed after the fixes:

```text
tests 11, pass 11, fail 0
```

### Follow-up verification

| Command | Result |
| --- | --- |
| `npm run test:readings-live-parity` | PASS — optional/manual parity for 13 readings |
| `npm run validate-reading-rights` | PASS — 13 packages; 0 full, 13 source-link-only, 0 blocked |
| `npm run materialize-reading-assets` | PASS — 0 ready, 0 validated |
| `npm test` | PASS — 44/44 tests |
| `npx tsc --noEmit` | PASS — exit 0 |
| `npm run build` | PASS — production build and 38 static pages generated |

Follow-up verdict: **PASS**. The default release gate is portable and all rights/publication/path findings are closed.
