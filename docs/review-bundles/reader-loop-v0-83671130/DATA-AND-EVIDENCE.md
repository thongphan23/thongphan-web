# Data and evidence

## Preview resource inventory

| Resource | Identity | Boundary |
|---|---|---|
| Pages | `thongphan-reader-loop-preview` | dedicated project, preview branch `reader-loop-v0` |
| Worker | `thongphan-reader-loop-preview-api` | `workers.dev`; no production route |
| D1 | `thongphan-reader-loop-preview` | `cbc3a7e5-d614-4648-bd12-b9839047d61d` |
| Recommendation policy | `reader-loop-rules-v0.1.0` | deterministic, rule-based, no LLM/embedding |
| Next-action policy | `reader-loop-next-action-v0.1.0` | exactly one primary action |

Forbidden production D1 `7cffb7f5-c48b-49c2-b215-9611abd734a5` is absent from Reader Loop config. The Worker has no route, KV, R2, Queue or secret binding.

## Evidence and inference remain separate

- `reader_questions`: user-stated problem.
- `recommendation_decisions`: selected/candidate content, reason codes, policy version and unknowns.
- `reading_sessions`: opened/in-progress/completed lifecycle and canonical repository content URL.
- `reading_evidence_summaries`: visible/active milliseconds, maximum scroll percentage, seen section IDs and aggregate meaningful-interaction count.
- `manual_completions`: explicit reader confirmation, stored separately from scroll/time.
- `reflections`: required takeaway and next step.
- `next_action_decisions`: action, reason, evidence used, unknowns and policy version.
- `reader_creation_rate_limits`: bộ đếm theo giờ dành riêng cho preview; các bucket cũ hơn 24 giờ được xóa khi có yêu cầu tạo reader mới.

The application does not infer comprehension from scroll or time. It does not store raw scrolling streams, pointer movement, keystrokes, IP or fingerprint.

## Anonymous and privacy boundaries

- Browser stores a random anonymous reader ID/token in local storage.
- D1 stores only the SHA-256 token hash, never the raw token.
- Reader-owned API reads require `Reader <token>` and return 404 for another reader's session.
- Evidence và completion bắt buộc gửi đúng canonical `content_url` của session; payload thiếu hoặc gắn sang bài khác bị từ chối trước persistence.
- Evidence update dùng một câu SQL điều kiện, chỉ tăng aggregate, hợp nhất section và không ghi sau khi session đã completed.
- Free text is bounded; likely email addresses and phone numbers are rejected before persistence.
- Mọi request API phải có Origin được phép. CORS chỉ chấp nhận localhost QA và dedicated Pages project; POST không có Origin trả 403.
- Reader creation được giữ ở tối đa 60 lần mỗi giờ trên toàn preview và tối đa 1.000 anonymous readers trong vòng đời D1; cả reservation và lifetime cap đều dùng conditional D1 writes.
- Request bodies are capped and every API response is `no-store`.

## Traceability and persistence checks

The final read-only aggregate query against the dedicated remote D1 returned:

| Measure | Value |
|---|---:|
| anonymous readers | 27 |
| recommendation decisions | 26 |
| reading sessions | 25 |
| sessions with active time and coverage | 16 |
| completed sessions | 23 |
| manual completions | 23 |
| reflections | 23 |
| next-action decisions | 23 |
| active rate-limit buckets | 1 |

Cloudflare reported `rows_written=0` and `changed_db=false` for this verification query. Counts include repeated QA passes; no personal data was used.

## Scenario evidence

- Scenario A proves the complete sample-question evidence chain and Inspector.
- Scenario B proves a custom question survives article refresh in the same anonymous browser and completes.
- Scenario C waits for periodic aggregate sync, leaves the article incomplete, verifies non-zero persisted coverage on `/read`, resumes the same session ID and completes.
- The binding scenario attaches a valid session ID to the wrong canonical article and proves zero evidence/completion writes plus no completion UI.
- Forced API 503 proves the canonical article body remains readable and exposes a retryable inline state.

Selected public-preview screenshots are committed in `screenshots/`. The executable browser contract is `scripts/reader-loop-browser-qa.mjs`.
