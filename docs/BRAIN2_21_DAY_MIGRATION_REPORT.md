# Brain2 21-day canonical migration report

Status: PASS for the canonical migration package split.

## Safe evidence

- Lessons extracted and normalized: 21/21.
- Public packages: 7.
- Protected packages: 14, written only to the validated outside-repository target.
- Copy-derived prompt actions: 41.
- Source external links inventoried before omission: 65.
- External links retained after editorial normalization: 61.
- Static reviewed editorial rows: 21/21, including source-matched duration ranges.
- Protected-day tracked rows contain public metadata only; private package fields are derived deterministically at migration runtime.
- Private output uses canonical real directories, no-follow file writes and an exact 14-entry allowlist.
- Source SHA-256 prefix: `2ff0807fe96a`.
- The implementation is split into editorial metadata, HTML normalization and migration orchestration modules so each review boundary stays focused.

## Editorial normalization

| Class | Count | Treatment |
| --- | ---: | --- |
| `live-campaign` | 21 | Omitted before package output |
| `embedded-passcode` | 0 | Omitted before package output |
| `legacy-domain` | 0 | Omitted before package output |
| `private-chat-cta` | 0 | Omitted before package output |
| `reflection-wall` | 0 | Omitted before package output |
| `local-machine-path` | 4 | Omitted before package output |
| `ai-tool-link` | 3 | Omitted before package output |
| `omitted-resource` | 1 | Omitted before package output |
| `unverified-count` | 0 | Omitted before package output |
| `dynamic-claim` | 2 | Omitted before package output |
| `ai-tool-neutralized` | 19 | Rephrased to tool-neutral instruction |
| `audience-normalized` | 0 | Normalized to `bạn` |

The report intentionally contains no protected lesson body, prompt, resource note, deliverable body or checklist label.
