# TPR Operations Console — Production Release

**Date:** 2026-07-30

**Owner route:** `https://thongphan.com/tpr`

**Website branch:** `agent/tpr-operations-console-20260730`

**Pages source:** `9d2e7a68fa29a9fafd2542ca95f0e1507dd040e8`

**Plugin branch:** `agent/tpr-control-plane-sync`

**Plugin sync source:** `684a73a7e87e8f266af691c2b9a0c79dbb600672`

## Release Verdict

```text
TPR_OPERATIONS_CONSOLE: RELEASED
OWNER_AUTH: PASS
REAL_DATA_PROJECTION: PASS
DESKTOP_QA: PASS
MOBILE_QA: PASS
VIDEO_PLAYBACK: PASS
PRIVATE_HOME_SCAN: ZERO_MATCHES
OBJECT_STORAGE: METADATA_ONLY
```

## What Is Live

- Owner-only `/tpr` interface with overview, runs, video, source library,
  documents, models/graph, Taste feedback, Codex activity and system capacity.
- Dedicated Worker `thongphan-tpr-control-plane` on `/api/tpr/*`.
- Dedicated D1 `thongphan-tpr-control-plane`
  (`304a3b49-bf29-4390-8009-135af5dc1701`).
- macOS LaunchAgent `com.thongphan.tpr-control-plane-sync`, scheduled every five
  minutes with one-process locking, byte cursor, source fingerprints and an
  atomic idempotent outbox.
- Keychain-only local secrets and Cloudflare encrypted Worker secrets.

## Storage And Retrieval

| Content | Canonical store | Operations projection | Retrieval path |
| --- | --- | --- | --- |
| Run manifests, scripts, boards, plans and QA | `~/Movies/thong-phan-remotion-runs/<run>` | D1 metadata and selected text under 64 KiB | collector fingerprint → `/api/tpr/ingest` → run/document views |
| Immutable evidence | `~/Movies/thong-phan-remotion-state/evidence/sha256` | hashes, lineage and availability | graph/evidence records by run and hash |
| Film analysis, rejection and rotation | `~/Movies/thong-phan-remotion-film-source-vault` | latest source profile and usage | Film Vault fingerprint → source view |
| Models and graph | run/vault JSON or SQLite projections | versioned model records, graph nodes and edges | bounded indexed dashboard query |
| Final videos | local render master plus approved web derivative | metadata and approved URL | video view loads one player at a time |
| Owner feedback and Taste | immutable feedback and promotion receipts | exact target, four scores, status | feedback API → candidate ledger |
| Codex collaboration | local session JSONL | redacted TPR user/assistant messages only | byte cursor → activity view |

D1 is not a blob store. Audio, footage, contact sheets, videos and large evidence
remain local until object storage is explicitly enabled. The API returns
`OBJECT_STORAGE_UNAVAILABLE` rather than pretending a blob exists.

## Scale And Cost Priorities

At hundreds of runs per day, the expected cost order is:

1. Source acquisition and visual observation: network, storage and VLM time.
2. Semantic candidate scoring: LLM/VLM tokens and repeated context assembly.
3. Proxy/final rendering: CPU/GPU, temporary disk and encode time.
4. Creative variants: a direct multiplier of all upstream and downstream work.
5. Evidence transfer and raw event writes.
6. Repeated full regression and review loops.

Controls already shipped:

- vault-first retrieval and content-addressed source identity;
- observation identity `(source_sha256, trim, observer_version)`;
- changed-run fingerprints and Codex byte cursors;
- 100-record/512-KiB idempotent batches and a durable outbox;
- bounded indexed dashboard reads;
- one active video player and metadata-first cloud projection;
- exact-target feedback that cannot auto-promote Taste.

Required before sustained high-volume production:

- explicitly enable R2 and store derivatives by content hash;
- put ingest/render work behind Cloudflare Queues with backpressure and retry;
- use a cheap semantic filter before expensive top-K VLM observation;
- produce one 720p proxy and only one approved 1080p final by default;
- require an experiment budget before producing multiple variants;
- aggregate operational counters by run/day instead of writing every telemetry
  sample as a D1 row;
- add retention/tombstone rules for proxies and superseded derivatives;
- enforce per-run budgets for acquired clips, model tokens, renders, storage and
  wall time before a queue item can expand.

## Real Projection Evidence

- Initial historical sync: 71 batches, 6,879 accepted records, zero pending.
- Unchanged steady state: 0.152 seconds, zero batches.
- Latest incremental LaunchAgent run: one batch, one accepted record, zero
  duplicate and zero pending.
- Production dashboard: 3 runs today, 21 active/review runs, 3 published videos,
  12 source profiles, 36 models, 150 bounded graph nodes and 100 bounded events.
- Current D1 size observed during privacy remediation: 11,444,224 bytes.

## Security Evidence

- Unauthenticated dashboard returns `401` with `private, no-store` and
  `X-Robots-Tag: noindex, nofollow`.
- Session cookie is `HttpOnly`, `Secure`, `SameSite=Strict`, path `/`, maximum 12
  hours and bound to the current access-code hash.
- Login rate limit, bad origin, bad secret, malformed hash, oversized request,
  duplicate batch and D1 failure all fail closed in executable tests.
- A production UI scan found a bare private-home string inside a historical
  Codex sentence. The sanitizer was extended, 44 affected event records were
  replaced in D1, and a post-remediation query returned zero matches.
- The owner access code and hash were rotated after browser QA. The old browser
  session was then proven invalid.

## Verification

```text
Focused website console/API: 7 passed
Website full regression: 249 passed, 0 failed
Website lint: PASS
Website TypeScript: PASS
Worker TypeScript: PASS
Static build: 84 routes, PASS
Plugin control-plane sync: 10 passed
Plugin broad regression: 807 passed, 1 unrelated parity identity failure
Browser desktop: 1280x720, overflow 0, PASS
Browser mobile: 390x844, overflow 0, PASS
Video: 59.712s, readyState 4, currentTime advanced, PASS
```

The plugin broad-suite failure is the existing dual-repository identity check:
the live VBE release is internally valid at commit
`b530254a101a282bc2f552262c324eff55f3f7a8`, while the plugin's frozen expected
VBE identity is older. The control-plane change does not modify that release
contract or any Phase capability.

## Deployment And Rollback

- Pages production: `7e2412b4-2f13-4de7-bcc0-f71462a10088`.
- Prior Pages rollback: `ffe7242a-f5e4-45e9-a322-9507350d87d2`.
- Worker active version: `ac823c73-f4de-492f-a539-ee74f5827285`.
- Worker code version before credential rotation:
  `6b58e3bf-cf33-4348-98da-b393c1705d7b`.
- LaunchAgent can be unloaded without deleting local run/evidence state.
- D1 is isolated from existing site databases. R2 has not been enabled or
  provisioned.
