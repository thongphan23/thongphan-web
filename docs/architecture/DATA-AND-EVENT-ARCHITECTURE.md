# Data & Event Architecture

**Document ID:** TPREAD-D11
**Version:** 2.1.0
**Status:** Target data architecture reconciled with R0 current-state evidence; physical R1 schema chưa được duyệt
**Last updated:** 2026-07-26

---

## 1. Mục tiêu

Thiết kế một nền dữ liệu:

- đủ tin cậy cho membership và relationship intelligence;
- tiết kiệm Cloudflare Free-first;
- truy vết Fact → Evidence → Event;
- hỗ trợ single workspace hiện tại;
- chuẩn bị export/method transfer;
- không lưu surveillance telemetry vô hạn;
- có thể migration và rebuild projection;
- hỗ trợ Codex triển khai theo release.

### 1.1. Current data state verified in R0

Tại commit `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`, current state khác target architecture bên dưới:

| Data/capability | Current source of truth | Projection/storage | R0 conclusion |
|---|---|---|---|
| Blog body/metadata | `content/blog/*.md` | generated TypeScript → static HTML | Git is truth |
| Living notes | `content/library/*.md` | validated generated TypeScript → static HTML | Git is truth |
| Curated readings | 13 JSON packages under `content/readings/` | generated TypeScript + 65 static images | Git is truth; 0 ready audio |
| Micro-assets | `lib/micro-assets.ts` | static HTML | hardcoded; no payment |
| Brain2 public lessons | manifest + 7 public JSON packages | static shells/bodies | Git is truth |
| Brain2 protected lessons | manifest metadata in Git | 14 immutable bodies in protected KV | access-code session only |
| Reader bookmark | browser `localStorage` | same device only | no account/history sync |
| Reader/member identity | none | none | verified absent |
| Subscription/entitlement | none | none | verified absent |
| Reading session/evidence/profile | none | none | verified absent |
| Challenge signup | production D1 | `challenge_signups` | 10 rows at audit time |
| Email campaign | production D1 | 210 `legacy-v0` rows, all pending | sender absent; cron empty |
| Product analytics | none verified | none verified | event baseline missing |

Remote D1 tables are limited to `posts`, `challenges`, `challenge_signups`, `email_queue`, `email_logs`, `brain2_access_failures`, `d1_migrations` and `_cf_KV`. There is no current R1 physical schema for user/account, workspace, membership, entitlement, reading, evidence, profile, recommendation, notification or product events.

R0 did not create or migrate any table. The logical catalog in sections below remains a proposal pending ADR/SDD, not an instruction to create production schema.

---

## 2. Target data ownership matrix

| Data type | Source of truth | Projection/cache | Archive/analytics |
|---|---|---|---|
| User/account | D1 | session cache optional | audit |
| Workspace/Creator | D1 | KV config optional | version export |
| Subscription/payment | D1 | provider mirror | R2 raw payload optional |
| Entitlement | D1 | short cache optional | audit |
| Content metadata/model | D1 + content source | static build/KV | R2 export |
| Article body | repository/CMS/R2 theo audit | static assets | version archive |
| Reading session summary | D1 | analytics aggregates | R2 sample optional |
| Raw micro telemetry | Không lưu mặc định | client memory | sampled external/R2 short retention |
| Evidence index | D1 | profile projection | R2 payload |
| Fact/inference/decision | D1 | profile projection | case aggregate |
| Recommendation | D1 | UI cache | analytics |
| Notification intent | D1 | queue | provider delivery |
| Product analytics | Analytics Engine/tool | dashboard | aggregate export |
| Case study pack | D1 metadata | admin | R2 anonymized export |

R0 correction: current content bodies and metadata should remain repository-owned through the first approved vertical slice unless a CMS/database migration ADR demonstrates a concrete editorial need. Existing challenge/email D1 tables must not be treated as reusable reader-account domain tables.

---

## 3. Workspace boundary

### 3.1. Baseline

```text
workspace_id = "ws_thongphan"
creator_id   = "cr_thongphan"
```

### 3.2. Entity classes

#### Global deployment-scoped

- users;
- user_identities;
- auth sessions;
- system provider registry.

#### Workspace-scoped

- workspace_users;
- creator_models;
- content;
- questions;
- profile facts/inferences;
- recommendations;
- offers;
- workshops;
- notifications;
- case packs.

#### Environment-scoped

- migrations;
- jobs;
- feature flags;
- provider config.

### 3.3. Security rule

Client không gửi trusted `workspace_id`. Server route context gán workspace. Admin export yêu cầu explicit scope.

---

## 4. ID strategy

Requirements:

- opaque;
- globally unique within deployment;
- sortable optional;
- không lộ PII;
- stable qua provider migration.

Có thể dùng UUIDv7/ULID theo codebase compatibility. Prefix human-readable optional:

```text
usr_
ws_
cnt_
ev_
inf_
dec_
```

Không dùng auto-increment ID trong public URLs nếu gây enumeration risk.

---

## 5. Timestamp và timezone

- lưu ISO/epoch UTC;
- admin default `Asia/Bangkok`;
- user preference nếu có;
- `occurred_at` khác `recorded_at`;
- provider event giữ original time;
- expiry tính server-side;
- daily Cloudflare quota reset UTC cần dashboard hiển thị rõ.

---

## 6. Logical D1 schema catalog

Physical DDL được tạo trong SDD/migrations. Foundation đề xuất các table groups.

### 6.1. System/workspace

```text
workspaces
creators
workspace_users
workspace_role_assignments
model_generators
feature_flags
```

### 6.2. Identity

```text
users
user_identities
anonymous_identities
identity_merge_events
user_consents
user_sessions (nếu custom auth)
data_requests
```

### 6.3. Membership

```text
plans
subscriptions
payment_transactions
provider_webhook_events
entitlements
entitlement_events
```

### 6.4. Creator/content/offer

```text
creator_model_versions
creator_beliefs
creator_topic_pillars
content_items
content_versions
content_model_versions
content_topics
content_question_links
content_prerequisites
content_next_actions
content_offer_links
content_sources
offers
offer_model_versions
offer_fit_rules
offer_qualification_rules
```

### 6.5. Goal/question

```text
user_goals
raw_questions
canonical_questions
question_mappings
active_questions
question_clusters
question_cluster_members
content_requests
```

### 6.6. Reading/progress

```text
reading_sessions
reading_session_summaries
reading_checkpoints optional
content_completions
reflection_prompts
reflections
user_outputs
progress_state_instances
progress_state_events
```

### 6.7. Evidence/profile

```text
evidence_records
profile_facts
fact_evidence_links
inferences
inference_evidence_links
decisions
decision_input_links
decision_outcomes
human_overrides
profile_projections
```

### 6.8. Recommendation

```text
recommendation_requests
recommendation_candidates
recommendation_decisions
recommendation_presentations
recommendation_feedback
```

### 6.9. Editorial/workshop

```text
demand_snapshots
editorial_recommendations
workshops
workshop_model_versions
workshop_registrations
workshop_attendance
workshop_outputs
```

### 6.10. Notification

```text
notification_preferences
notifications
notification_deliveries
email_provider_events
suppression_entries
```

### 6.11. Commercial

```text
qualification_state_instances
qualification_evidence_groups
commercial_actions
offer_outcomes
```

### 6.12. Case study/transfer

```text
product_hypotheses
experiments
experiment_cohorts
case_study_packs
case_pack_evidence_links
transfer_artifacts
transfer_annotations
```

### 6.13. Operations

```text
outbox_events
job_runs
audit_logs
schema_migrations
data_quality_issues
```

---

## 7. Normalization và JSON

### Dùng column khi

- query/filter/index thường xuyên;
- invariant;
- join;
- state;
- timestamp;
- foreign key.

### Dùng JSON khi

- versioned extensible payload;
- rationale snapshot;
- provider metadata đã redacted;
- structured response có nhiều dạng.

Không nhét toàn bộ model/profile vào JSON blob duy nhất. JSON phải có schema/version.

---

## 8. Index strategy

D1 row-read limits khiến index quan trọng. Candidate indexes:

```text
workspace_users(workspace_id, user_id)
content_items(workspace_id, status, access_level)
content_question_links(workspace_id, question_id)
active_questions(workspace_id, user_id, status)
reading_sessions(workspace_id, user_id, content_id, started_at)
content_completions(workspace_id, user_id, content_id)
evidence_records(workspace_id, subject_type, subject_id, occurred_at)
inferences(workspace_id, user_id, inference_type, status, expires_at)
decisions(workspace_id, user_id, decision_type, status, created_at)
notifications(workspace_id, user_id, status, scheduled_at)
qualification_state_instances(workspace_id, user_id, offer_id, status)
```

R0/SDD phải dùng `EXPLAIN QUERY PLAN` và đo row reads.

---

## 9. Event architecture principles

1. Event name past tense.
2. Event immutable về nghĩa.
3. Schema versioned.
4. `event_id` unique/idempotent.
5. `occurred_at` và `received_at` riêng.
6. Workspace included server-side.
7. PII minimal.
8. Raw free text reference, không broadcast qua queue nếu không cần.
9. Domain event chỉ phát sau state commit.
10. Event retention theo purpose.

---

## 10. Event envelope

```json
{
  "event_id": "evt_01J...",
  "event_name": "reading_session_finalized",
  "event_version": 1,
  "workspace_id": "ws_thongphan",
  "actor": {
    "user_id": "usr_...",
    "anonymous_id": null
  },
  "subject": {
    "type": "reading_session",
    "id": "rs_..."
  },
  "occurred_at": "2026-07-26T08:30:00Z",
  "received_at": "2026-07-26T08:30:02Z",
  "source": "web",
  "session_id": "ses_...",
  "trace_id": "trc_...",
  "consent_context_id": "cons_...",
  "properties": {},
  "idempotency_key": "..."
}
```

Queue payload có thể chỉ chứa IDs để consumer đọc D1, tránh message lớn/PII.

---

## 11. Event taxonomy

### Identity

```text
anonymous_identity_created
account_registered
identity_verified
identity_merged
session_started
session_revoked
account_deletion_requested
account_deleted
```

### Membership

```text
checkout_started
payment_webhook_received
payment_confirmed
payment_failed
subscription_activated
subscription_canceled
subscription_expired
entitlement_granted
entitlement_revoked
```

### Content

```text
content_created
content_version_published
content_model_published
content_freshness_changed
content_superseded
```

### Reading

```text
article_opened
reading_session_started
reading_session_finalized
content_saved
completion_confirmed
completion_revoked
reflection_submitted
user_output_created
```

### Goal/question

```text
goal_created
goal_closed
active_question_created
active_question_updated
active_question_closed
content_request_created
question_mapped
```

### Profile/evidence

```text
evidence_recorded
fact_created
fact_superseded
inference_created
inference_expired
inference_revoked
profile_projection_updated
state_transitioned
```

### Recommendation

```text
recommendation_requested
recommendation_generated
recommendation_presented
recommendation_opened
recommendation_feedback_submitted
recommendation_outcome_observed
```

### Editorial/workshop

```text
demand_snapshot_generated
editorial_recommendation_created
workshop_published
workshop_registered
workshop_attended
workshop_output_created
```

### Notification

```text
notification_scheduled
notification_suppressed
notification_sent
notification_delivered
notification_clicked
notification_bounced
notification_complained
```

### Commercial

```text
qualification_state_changed
sales_ready_review_requested
commercial_action_approved
commercial_action_executed
offer_purchased
offer_declined
```

### Case/transfer

```text
hypothesis_created
experiment_started
experiment_ended
case_pack_generated
case_pack_anonymized
transfer_artifact_published
```

---

## 12. Client reading event design

### 12.1. Client memory state

```text
session_id
content_id
content_version_id
started_at
visible_ms
active_ms
max_scroll
section_seen_set
section_engaged_set
conclusion_seen
interactions
last_activity_at
```

### 12.2. Activity heuristic

Active if:

- document visible;
- window focus optional;
- recent user activity within threshold;
- not obvious idle.

Không khẳng định active = reading.

### 12.3. Section observer

Mỗi semantic section có ID. Client ghi aggregate khi:

- intersection ratio đạt threshold;
- dwell minimum;
- không gửi callback từng lần.

### 12.4. Final payload

```json
{
  "client_session_id": "...",
  "content_id": "...",
  "content_version_id": "...",
  "started_at": "...",
  "ended_at": "...",
  "visible_ms": 580000,
  "active_ms": 470000,
  "max_scroll_percent": 93,
  "sections_seen": ["intro", "s1", "s2", "conclusion"],
  "sections_engaged": ["intro", "s1", "s2"],
  "conclusion_seen": true,
  "interactions": {
    "source_opened": 1,
    "saved": 0,
    "highlighted": 0
  },
  "client_report_version": 1
}
```

Server không tin estimated read confidence do client gửi.

### 12.5. Size/batch

Payload nhỏ, bounded. Nếu article có nhiều section, dùng bitset/IDs limit hoặc counts + hashed set tùy privacy/debug need.

---

## 13. Reading ingestion flow

```text
POST /api/reading/sessions/finalize
→ auth/anonymous resolve
→ rate limit
→ schema validate
→ content/version validate
→ clamp numeric ranges
→ idempotency check
→ write session + summary
→ record evidence
→ write outbox event
→ response 202/200
→ dispatcher sends queue message
```

Critical explicit completion endpoint riêng:

```text
POST /api/content/:id/completion
```

Không phụ thuộc telemetry session để user xác nhận.

---

## 14. Outbox pattern

Trong cùng D1 transaction/batch nếu supported:

1. write domain state;
2. write `outbox_events` pending.

Dispatcher/Cron:

- fetch pending batch;
- send Queue;
- mark dispatched;
- retry idempotent.

Nếu direct Queue send sau commit thất bại, outbox không mất event.

Outbox retention/archive sau successful.

---

## 15. Queue architecture

Suggested queues:

```text
profile-updates
recommendation-jobs
notification-jobs
editorial-jobs
case-study-jobs
```

Có thể bắt đầu một queue với `job_type` để đơn giản, tách khi operational need.

### Queue message

```json
{
  "job_id": "job_...",
  "job_type": "recompute_profile",
  "workspace_id": "ws_thongphan",
  "subject_id": "usr_...",
  "trigger_event_id": "evt_...",
  "attempt": 1,
  "schema_version": 1
}
```

### Idempotency

Consumer kiểm tra `job_runs`/domain version. Retry không duplicate facts/notifications.

### Free operation budget

Vì Queue operation tính theo message read/write/delete, phải:

- batch notifications;
- debounce profile recompute;
- coalesce multiple reading events/user;
- không queue analytics micro-events;
- monitor 24h retention/free.

---

## 16. Cron jobs

Baseline:

### Daily

- expire inference;
- subscription/entitlement reconciliation;
- notification due dispatch trigger;
- data quality checks;
- quota snapshot.

### Weekly

- editorial demand aggregation;
- workshop recommendation;
- case experiment snapshot;
- member digest audience;
- stale content review reminders.

### Monthly

- progress summary;
- retention cohort;
- case pack candidate;
- data retention cleanup;
- cost report.

Cron handler chỉ enqueue/coarse work; tránh CPU dài Free.

---

## 17. Analytics Engine datasets

Nếu dùng Analytics Engine, data point thiết kế aggregate, không PII.

### `web_product_events`

Blobs:

- event_name;
- workspace_id;
- content_id/topic;
- anonymous cohort key optional hashed;
- plan;
- source.

Doubles:

- count 1;
- active_ms;
- coverage;
- score components.

Indexes theo dataset constraints.

### `cost_usage_snapshots`

- service;
- usage;
- percent limit;
- date.

### `recommendation_metrics`

- policy version;
- candidate type;
- outcome;
- progress result.

Không lưu raw question/reflection text trong Analytics Engine.

---

## 18. R2 object layout

```text
/{environment}/{workspace_id}/
  evidence/YYYY/MM/{evidence_id}.json
  content-versions/{content_id}/{version}/...
  user-outputs/{user_id}/{output_id}/...
  exports/users/{request_id}.zip
  case-packs/{case_pack_id}/...
  backups/{date}/...
  debug-samples/{date}/...   # short retention
```

Rules:

- private bucket;
- signed/time-limited access;
- metadata no sensitive text where possible;
- object key opaque;
- lifecycle deletion;
- integrity hash.

---

## 19. KV keyspace

```text
config:{workspace}:creator-model:{version}
config:{workspace}:public-settings:{version}
cache:{workspace}:content-model:{content_id}:{version}
cache:{workspace}:recommendation:{user_id}:{profile_version}
flag:{environment}:{flag_name}
```

Không KV:

- payment status;
- entitlement truth;
- active question truth;
- evidence;
- notification sent truth.

Cache invalidation theo version/event. Free writes giới hạn nên không cache per micro-session.

---

## 20. Search architecture

### R1–R3

- static/build search hoặc D1 FTS tùy content source;
- query logging có privacy;
- no-result event.

### R4+

- question/content structured match;
- semantic retrieval optional;
- AI Search/Vectorize đánh giá sau.

Search result không phụ thuộc profile; personalization có thể rerank nhẹ.

---

## 21. Identity resolution

### Merge allowed

- authenticated login links current anonymous ID;
- verified email same canonical account;
- provider subject mapping;
- admin-assisted with evidence.

### Merge prohibited

- cùng tên;
- cùng company;
- device fingerprint phỏng đoán;
- email gần giống;
- Facebook profile scraping.

### Merge event

```text
from_identity
to_user
method
evidence
actor
created_at
reversible_status
```

Merging reading history phải respect consent/retention.

---

## 22. Profile projection build

Projection input:

- active facts;
- active inferences;
- state instances;
- latest decisions;
- preferences;
- membership.

Projection version:

```text
profile_projection_version
source_high_watermark
policy_versions
rebuilt_at
```

Rebuild command available for one user/workspace/all in batch.

---

## 23. Recommendation data flow

```text
Trigger
→ Recommendation Request
→ load profile projection
→ load Active Question/Goal
→ retrieve structured candidates
→ eligibility filters
→ ranking policy
→ decision/candidate audit write
→ present
→ outcome events
→ policy metrics
```

Candidate retrieval must filter workspace at first query.

Recommendation cache key includes profile/content model version to avoid stale.

---

## 24. Notification audience flow

```text
Publication event
→ find linked questions/topics
→ candidate users
→ entitlement + preference + frequency cap
→ exclude completed/unsubscribed/suppressed
→ audience preview
→ operator approval for campaign
→ notification intents
→ queue batches
→ provider send
→ webhook delivery events
→ reading outcome
```

Direct request-answer notification có thể auto schedule theo approved policy; broad match cần review.

---

## 25. Payment data flow

```text
Provider webhook
→ signature verify
→ webhook_events unique insert
→ parse normalized event
→ transaction update
→ subscription transition
→ entitlement reconciliation
→ outbox
→ user notification
```

Provider payload:

- minimize;
- store redacted D1 fields;
- raw R2 only if needed/retention;
- never log secret/signature.

---

## 26. Qualification data flow

```text
Offer Model version active
→ evidence changes
→ qualification recompute job
→ group F/P/I/A evidence
→ check freshness/blocking
→ state candidate
→ Product Qualified auto/flag
→ Sales Ready review queue
→ human decision
→ commercial action
→ outcome
```

Store evidence bundle snapshot so later policy changes do not erase why decision occurred.

---

## 27. Editorial demand data flow

Signals:

- Active Question;
- Content Request;
- raw workshop question;
- reflection unresolved;
- search gap;
- repeated recommendation dismiss;
- content completion without progress;
- support conversation (manual).

Pipeline:

```text
normalize/map questions
→ cluster candidate
→ human review cluster
→ aggregate signal counts/strength
→ compare Content Model coverage
→ demand score
→ editorial recommendation
→ creator decision
→ publication links back
```

No raw free text in analytics aggregate without permission.

---

## 28. Case study data flow

```text
Hypothesis created
→ baseline snapshot frozen
→ cohort membership frozen/rules recorded
→ intervention version recorded
→ events/outcomes occur
→ end snapshot
→ qualitative evidence attach
→ limitations entered
→ anonymization job
→ owner approval
→ transfer artifact
```

Cohort definition, code version và policy version là bắt buộc để case reproducible.

---

## 29. Data retention baseline

Exact legal retention cần privacy review. Foundation:

| Data | Baseline approach |
|---|---|
| Account | tới deletion + required audit |
| Subscription/payment | theo accounting/legal policy |
| Reading summaries | configurable, ví dụ 12–24 tháng |
| Raw debug samples | 7–30 ngày |
| Reflections | user-controlled, tới deletion/retention |
| Inferences | expire/recompute, history có giới hạn |
| Notification events | delivery/support window |
| Analytics aggregate | lâu hơn nếu anonymous |
| Case pack anonymous | theo IP/research policy |

Retention jobs phải test và audit.

---

## 30. Data deletion and anonymization

### Deletion scopes

- account deletion;
- specific reflection/output;
- marketing preference;
- reading history reset;
- workspace relationship delete.

### Process

- auth request;
- status pending;
- suppress notification;
- cascade D1 according policy;
- delete R2 objects;
- provider delete/suppress;
- evidence dependency invalidation;
- analytics anonymization where possible;
- completion receipt.

Do not delete financial record beyond legal requirement; detach/anonymize appropriately.

---

## 31. Consent snapshot

Mỗi relevant event có `consent_context_id` trỏ tới version:

```text
privacy_notice_version
analytics_choice
personalization_choice
email_topics
terms_version
accepted_at
```

Không retroactively assume new purpose from old consent.

---

## 32. Data quality checks

Daily/weekly checks:

- active inference without evidence;
- decision missing policy version;
- cross-workspace FK mismatch;
- active entitlement outside validity;
- subscription/payment mismatch;
- content current version missing;
- duplicate provider event;
- reading summary impossible values;
- notifications sent to unsubscribed;
- case pack PII scan;
- orphan R2 object.

Issues recorded `data_quality_issues` and alert severity.

---

## 33. D1 transaction/batch strategy

Use D1 transaction semantics/batch supported by runtime for:

- payment normalized state + outbox;
- completion fact + evidence + outbox;
- Active Question switch;
- decision + candidate audit;
- override + audit.

Avoid long transaction and network call inside transaction. Provider calls occur before verification or after commit via queue.

---

## 34. Query/read budget strategy

- use indexes;
- projections;
- pagination;
- select columns;
- avoid N+1;
- cache versioned public model;
- aggregate weekly tables;
- archive old raw rows;
- monitor D1 meta/usage.

Admin dashboard không query full evidence graph cho mọi user at once; load detail on demand.

---

## 35. Write budget strategy

- one reading summary/session, not heartbeats;
- debounce recomputations;
- no duplicate analytics in D1;
- append evidence only for meaningful events;
- bulk notification intents;
- batch attendance import;
- outbox cleanup;
- store large payload R2.

---

## 36. Migration strategy

### Schema migration

- immutable migration files;
- local/staging/production sequence;
- migration ledger;
- backward compatible first;
- destructive later.

### Backfill

- separate job;
- checkpoint;
- idempotent;
- rate limited;
- metrics;
- rollback/re-run.

### Content migration

- inventory;
- canonical IDs;
- model tier M0–M3;
- wave rollout;
- validation report.

### User import

Không import social friends. Chỉ import account/email/workshop lists có lawful source/consent và mapping plan.

---

## 37. Backup and recovery

- D1 Time Travel theo plan;
- periodic logical export for critical tables;
- R2 version/lifecycle if needed;
- provider export;
- restore drill before paid launch;
- recovery point/time objectives defined after R0.

Case/evidence archive không thay operational backup.

---

## 38. API data contracts baseline

### Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "trace_id": "trc_...",
    "details": []
  }
}
```

### Pagination

Cursor-based cho lists.

### Versioning

- `/api/v1` hoặc header/internal version theo framework;
- event version riêng;
- model version riêng.

### Idempotency

Header/body key cho critical mutation.

### Authorization

Server resolves user/workspace; never trust payload.

---

## 39. Privacy-preserving analytics

- use pseudonymous IDs;
- no raw reflection in analytics;
- aggregate small cohorts carefully;
- avoid fingerprinting;
- allow opt-out where appropriate;
- Web Analytics for general traffic;
- D1 only for user value features with transparency.

---

## 40. Transferability data contract

Transfer artifact export includes:

- model templates;
- anonymized aggregate;
- case narrative;
- rule version;
- creator-specific annotations.

Excludes:

- user IDs/email;
- raw history;
- private reflection;
- payment details;
- unpublished content unless owner chooses.

`workspace_id` is never remapped silently. Import to pilot creates new IDs and no shared personal records.

---

## 41. Physical schema decisions deferred to SDD

R0 facts now verified:

- ORM/query builder: none in the current app; D1 uses direct SQL/Worker APIs.
- framework: Next.js 16.2.10 App Router, React 19.2.5, static export.
- existing DB: one relevant production D1 with challenge/signup/email/access tables only.
- content source: repository Markdown/JSON/TypeScript; D1 is not the public renderer.
- auth provider: none for readers; Brain2 uses a separate access-code signed-cookie boundary.
- Cloudflare bindings: Pages D1/KV; signup D1/KV/rate limits; Brain2 access D1/protected KV; chat/embed AI/Vectorize.
- environment isolation: target not met; Pages preview and production share D1/KV.
- R2/Queue: unavailable/not provisioned.

SDD chỉ được tạo sau owner approval và sẽ phải produce:

- DDL;
- indexes;
- constraints;
- sample queries;
- migration numbers;
- repository paths;
- test fixtures.

Không bắt đầu SDD/PRD-R1 từ logical catalog này trước khi các ADR identity, entitlement, environment isolation, privacy, email, analytics và existing AI route ownership được duyệt.

---

## 42. Required invariants tests

1. Duplicate webhook no duplicate entitlement.
2. Same reading session finalize twice no duplicate evidence.
3. User cannot read member content without entitlement.
4. Cross-workspace insert/query rejected.
5. Inference creation without evidence rejected.
6. Active Question switch closes old primary.
7. Completion confirm creates declared fact, not inferred.
8. Evidence deletion invalidates dependent inference.
9. Notification respects unsubscribe/frequency cap.
10. Case export redacts PII.
11. Queue retry idempotent.
12. Profile projection rebuild produces same active state.
13. Stale/superseded content excluded.
14. Qualification requires Offer Model and F–P–I–A.

---

## 43. Example trace

```text
1. User submits reflection “Em vẫn chưa biết chọn dịch vụ hay khóa học”
2. raw event evt_1
3. evidence ev_1 reflection_submitted
4. declared fact fact_1 unresolved_decision
5. progress inference inf_1 Decision Needed, based on ev_1 + active question
6. recommendation decision dec_1 selects comparison article
7. notification/in-app presentation
8. user completes worksheet output ev_9
9. progress state Decision Made
10. outcome links back to dec_1
11. case pack can show decision progression without exposing text
```

Đây là chuẩn trustworthiness mà implementation phải bảo toàn.
