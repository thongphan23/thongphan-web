# TPR Operations Console

**Status:** released to production on 2026-07-30

**Route:** `https://thongphan.com/tpr`

**System of record:** local TPR evidence and vault state; cloud is a protected operational projection

## Goal

Make the complete Thong Phan Remotion workflow observable and reviewable from one
owner-only interface while preparing the pipeline for hundreds of runs per day.

The console must answer five questions without opening a run folder manually:

1. What is running, blocked, complete, stale, or expensive?
2. Which video, source, model, rule, decision, evidence, and graph edge produced an output?
3. Which owner feedback changed Taste, and what remains only a hypothesis?
4. Which assets and film analyses were reused instead of recomputed?
5. Which Codex decisions and handoffs explain the current system state?

## Scale Findings

The reference run contains 6,490 files and occupies 771 MB for one 59.7-second
voice rendered as three variants. The current Codex session JSONL is larger than
700 MB because it includes tool output and model context. Neither is suitable for
blind replication into D1.

Expected cost order at 100 runs/day:

| Rank | Work | Main cost | Required control |
| --- | --- | --- | --- |
| 1 | Source acquisition and visual observation | time, network, storage, VLM tokens | Film/Footage Vault, content hashes, observation reuse |
| 2 | Candidate reasoning and semantic scoring | LLM/VLM tokens | staged retrieval, cached embeddings/facts, evaluate top-K only |
| 3 | Video rendering and transcoding | CPU/GPU time, temporary disk | proxy-first render, one production winner, shared encode cache |
| 4 | Multiple creative variants | multiplies every upstream/downstream cost | variants only for explicit Taste experiments |
| 5 | Evidence and media transfer | network, object writes, storage | manifest diff, hash dedupe, metadata-first sync |
| 6 | Full regression and repeated review | wall time and compute | focused task tests, wave-level full regression |
| 7 | Raw Codex transcript ingestion | disk, parsing, privacy risk | message-only incremental cursor, redaction, no tool/reasoning upload |

## Scope

- Protected `/tpr` console with overview, runs, videos, source library, documents,
  models/graph, Taste/feedback, Codex activity, and system capacity.
- Dedicated Cloudflare Worker API and dedicated D1 database.
- Optional R2 artifact binding behind a storage adapter. Large-object upload fails
  closed until R2 is explicitly enabled on the account.
- Idempotent batch ingestion with immutable event IDs and content hashes.
- Local sync client for run evidence, Film Source Vault, runtime graph, final-video
  metadata, and selected Codex user/assistant messages.
- Keychain-only sync and owner credentials.
- LaunchAgent polling with a single-instance lock and incremental cursor.

## Non-goals

- D1 is not a video/blob store.
- Raw tool outputs, reasoning, environment contexts, credentials, and arbitrary
  local files are never uploaded.
- The cloud projection does not replace immutable local evidence.
- Feedback does not become active Taste automatically. It creates a traceable
  candidate until outcome verification and promotion.
- This release does not introduce multi-user permissions or public sharing.

## Architecture

```text
TPR runs + state DB + Film Source Vault + Codex JSONL
                 |
       local incremental collector
       redact -> hash -> diff -> batch
                 |
      /api/tpr/ingest (Bearer secret)
                 |
       D1 projection + optional R2 blobs
                 |
      /tpr owner session (HttpOnly cookie)
```

### Storage map

| Data | Canonical location | Cloud projection | Retrieval |
| --- | --- | --- | --- |
| Run documents and manifests | `~/Movies/thong-phan-remotion-runs/<run>` | indexed metadata + selected text | run/artifact API |
| Immutable evidence | `~/Movies/thong-phan-remotion-state/evidence/sha256` | hash, lineage, availability | evidence/graph API |
| Film analyses and usage | `~/Movies/thong-phan-remotion-film-source-vault` | source profile, assessment, rotation | source API |
| Models and runtime graph | run/vault SQLite plus JSON projections | model versions, nodes, edges | graph API |
| Final videos | run renders and approved web publication | metadata + public URL or R2 key | video API |
| Owner feedback and Taste | state DB and feedback receipts | immutable feedback + promotion status | feedback/Taste API |
| Codex collaboration | local session JSONL | redacted user/assistant TPR events only | activity API |

### Capacity policy

- A normal production run makes one 720p proxy and one approved 1080p final.
- Three variants require an explicit experiment ID and budget.
- Search uses vault-first retrieval; external acquisition occurs only after a
  coverage gap is proven.
- Observation is reused by `(source_sha256, trim, observer_version)`.
- LLM/VLM work is recorded by provider/model/input/output token counts and cache hit.
- Sync batches are at most 100 records or 512 KiB and are idempotent.
- Dashboard queries are indexed, bounded, and never scan raw event history.
- Warning thresholds: reuse under 70%, more than 30 acquired clips per minute of
  output, more than 2 proxy renders, or sync lag over 10 minutes.

## Security Contract

- `TPR_OWNER_ACCESS_CODE_HASH`, `TPR_SESSION_SECRET`, and `TPR_SYNC_SECRET` exist
  only in Keychain and Cloudflare encrypted secrets.
- Owner session uses `HttpOnly`, `Secure`, `SameSite=Strict`, path `/` and a
  12-hour maximum age.
- Ingest accepts only same-origin HTTPS plus a timing-safe Bearer secret.
- Dashboard responses are `private, no-store` and `noindex`.
- Redaction runs before hashing/network transfer. A redaction failure blocks sync.
- Every write has an immutable audit event and idempotency key.

## Acceptance Criteria

- [x] Unauthenticated API and dashboard data fail closed.
- [x] Login, logout, expired/tampered session, bad origin, bad secret, oversized
  batch, duplicate event, and D1 failure have executable tests.
- [x] `/tpr` supports desktop/mobile, keyboard use, loading, empty, error, and
  authenticated states without horizontal overflow.
- [x] The latest real run, its three videos, film profiles, model/graph summary,
  evidence documents, feedback empty state, and current Codex activity appear.
- [x] Feedback is tied to variant, optional timestamp/beat/shot, four review axes,
  evidence refs, and remains `candidate` until promoted by verified outcome.
- [x] The sync cursor survives restart and repeated sync sends no duplicate rows.
- [x] No raw secret or absolute private path is present in build output or D1.
- [x] Tests, lint, typecheck, static build, Worker dry-run, local browser QA, and
  production browser QA pass.

## Rollback

- Delete the dedicated Worker route or redeploy its prior version.
- Redeploy the previous Pages production deployment.
- Dedicated D1 data is additive and independent from existing website tables.
- LaunchAgent can be unloaded without changing any TPR run or local evidence.
- R2 remains optional; absence never corrupts metadata or local evidence.
