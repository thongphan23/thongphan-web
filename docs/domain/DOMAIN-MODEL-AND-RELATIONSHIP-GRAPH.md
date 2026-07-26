# Domain Model & Relationship Graph

**Document ID:** TPREAD-D07
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26

---

## 1. Mục đích

Tài liệu định nghĩa ngôn ngữ domain, bounded contexts, entity, aggregate, relationship và invariant của Thongphan Read. Nó là cầu nối giữa Product Charter/URD và schema/API implementation.

Relationship Graph ở đây là **mô hình quan hệ có semantics**, không bắt buộc graph database. Baseline triển khai bằng D1 relational tables và typed edges.

---

## 2. Context map

```text
Identity & Access
      │
      ├── Membership & Entitlement
      │
Creator & Workspace ─── Content & Knowledge
      │                         │
      ├── Offer                 ├── Questions & Goals
      │                         │
      └────────── Relationship Intelligence
                              │
                   Reading & Progress
                              │
                   Evidence & Profile
                              │
                   Recommendation & NBA
                              │
                   Workshop & Editorial
                              │
                   Notification & Lifecycle
                              │
                   Commercial Qualification
                              │
                   Case Study & Transfer
```

Mỗi context có owner semantics riêng; không tạo một “mega user table” chứa tất cả.

---

## 3. Workspace & Creator Context

### 3.1. Workspace

**Identity:** `workspace_id`
**Baseline:** `thongphan`

Thuộc tính:

```text
workspace_id
slug
name
status
default_locale
default_timezone
created_at
updated_at
```

Invariant:

- creator-scoped data phải có workspace;
- MVP chỉ có một active workspace;
- không có API client được tự chọn workspace tùy ý;
- workspace lấy từ server context/config.

### 3.2. Creator

Đại diện cá nhân/thương hiệu đứng sau content và offers.

```text
creator_id
workspace_id
display_name
canonical_domain
status
created_at
```

Một workspace baseline có một primary creator. Tương lai có thể có contributors, nhưng không mở team model phức tạp ở MVP.

### 3.3. Creator Model

Aggregate cấu hình chiến lược, được version hóa.

```text
creator_model_id
creator_id
version
status
core_promise
audience_definition
beliefs
boundaries
topic_pillars
evidence_standard
desired_transitions
published_at
```

Creator Model không được hardcode rải rác trong prompt/UI.

---

## 4. Identity & Access Context

### 4.1. User

Canonical person record trong deployment.

```text
user_id
status
primary_email
email_verified_at
locale
timezone
created_at
updated_at
deleted_at
```

User không trực tiếp chứa reader profile creator-scoped.

### 4.2. User Identity

```text
user_identity_id
user_id
provider
provider_subject
verified_at
created_at
```

### 4.3. Anonymous Identity

```text
anonymous_id
first_seen_at
last_seen_at
consent_snapshot_id
merged_user_id
merged_at
expires_at
```

### 4.4. Workspace Relationship

Nối global user với creator workspace.

```text
workspace_user_id
workspace_id
user_id
relationship_state
joined_at
last_active_at
```

Đây là anchor cho Profile Model, questions, recommendations và commercial state.

### 4.5. Workspace Role

Dành cho operator/admin, không phải reader membership.

```text
workspace_role_assignment_id
workspace_id
user_id
role
status
```

Roles baseline:

- `owner`;
- `editor`;
- `relationship_operator`;
- `support`;
- `analyst_readonly`.

---

## 5. Membership & Entitlement Context

### 5.1. Plan

```text
plan_id
workspace_id
code
name
billing_period
price_amount
currency
status
benefit_summary
```

### 5.2. Subscription

```text
subscription_id
workspace_id
user_id
plan_id
provider
provider_customer_id
provider_subscription_id
status
current_period_start
current_period_end
cancel_at_period_end
created_at
```

### 5.3. Payment Transaction

```text
payment_id
subscription_id
provider_event_id
amount
currency
status
paid_at
raw_payload_ref
```

### 5.4. Entitlement

```text
entitlement_id
workspace_id
user_id
entitlement_type
resource_scope
source_type
source_id
valid_from
valid_until
status
```

Invariant:

- subscription, payment và entitlement là ba entity khác nhau;
- entitlement được kiểm tra server-side;
- webhook idempotent theo provider event;
- refund/revoke không xóa history.

---

## 6. Content & Knowledge Context

### 6.1. Content Item

Supertype logic:

```text
content_id
workspace_id
content_type
slug
title
status
access_level
canonical_url
current_version_id
published_at
updated_at
```

`content_type`:

- article;
- living_note;
- curated_reading;
- worksheet;
- video;
- email_resource;
- workshop_recording;
- asset.

### 6.2. Content Version

```text
content_version_id
content_id
version_number
body_ref
content_hash
change_summary
created_by
created_at
published_at
```

Body có thể nằm trong repository/CMS/R2 tùy audit; D1 giữ index và version metadata.

### 6.3. Content Model Version

Mô tả ở TPREAD-D08.

### 6.4. Topic

```text
topic_id
workspace_id
name
slug
parent_topic_id
status
```

Topic không thay Question/JTBD.

### 6.5. Content Collection/Path

```text
collection_id
workspace_id
name
purpose
status
```

Content path có thể dynamic theo profile; collection chỉ là curation tĩnh hoặc rule source.

---

## 7. Goal & Question Context

### 7.1. Goal

```text
goal_id
workspace_id
user_id
title
description
status
created_at
closed_at
```

### 7.2. Raw Question

```text
raw_question_id
workspace_id
user_id
source_type
source_id
question_text
created_at
consent_scope
```

### 7.3. Canonical Question

```text
question_id
workspace_id
normalized_text
question_type
status
created_at
```

### 7.4. Question Mapping

```text
question_mapping_id
raw_question_id
question_id
mapping_method
confidence
review_status
```

### 7.5. Active Question

```text
active_question_id
workspace_id
user_id
question_id
raw_question_id
status
started_at
closed_at
priority
```

Invariant:

- baseline chỉ một primary Active Question/user/workspace;
- raw wording không bị mất;
- AI normalization không tự overwrite canonical mapping khi confidence thấp.

### 7.6. Question Cluster

```text
question_cluster_id
workspace_id
name
summary
status
created_at
```

Nối nhiều canonical questions cho editorial demand, không gộp vĩnh viễn semantic khác nhau.

---

## 8. Reading & Progress Context

### 8.1. Reading Session

```text
reading_session_id
workspace_id
user_id nullable
anonymous_id nullable
content_id
content_version_id
started_at
ended_at
status
client_session_id
```

### 8.2. Reading Session Summary

```text
reading_summary_id
reading_session_id
active_ms
visible_ms
max_scroll_percent
sections_seen
sections_engaged
conclusion_seen
interaction_counts
client_report_version
server_validation_status
created_at
```

### 8.3. Completion Declaration

```text
completion_id
workspace_id
user_id
content_id
content_version_id
completion_type
confirmed_at
revoked_at
```

`completion_type`:

- user_confirmed;
- imported_confirmed;
- admin_confirmed;
- inferred_likely riêng trong inference, không dùng table này.

### 8.4. Reflection

```text
reflection_id
workspace_id
user_id
content_id
prompt_id
response_type
response_text_ref
structured_response
created_at
```

### 8.5. Progress State Instance

Theo State Model, scoped Goal/Question.

### 8.6. User Output/Artifact

```text
user_output_id
workspace_id
user_id
output_type
title
object_ref
related_goal_id
related_question_id
status
created_at
```

Đây là evidence mạnh cho Action/Output state.

---

## 9. Evidence & Profile Context

### 9.1. Evidence Record

Index bất biến hoặc append-only cho nguồn evidence.

```text
evidence_id
workspace_id
subject_type
subject_id
evidence_type
source_type
source_id
occurred_at
recorded_at
payload_ref
integrity_hash
retention_class
status
```

### 9.2. Profile Fact

```text
fact_id
workspace_id
user_id
fact_type
value_json
fact_class
source_evidence_id
valid_from
valid_until
status
```

`fact_class`: declared, observed, derived.

### 9.3. Inference

```text
inference_id
workspace_id
user_id
scope_type
scope_id
inference_type
value_json
confidence
generator_type
generator_version
status
created_at
expires_at
review_status
```

### 9.4. Inference Evidence Link

Many-to-many với weight/role.

### 9.5. Decision

```text
decision_id
workspace_id
user_id
decision_type
scope_type
scope_id
policy_version
selected_action
rationale_json
created_at
expires_at
status
```

### 9.6. Decision Outcome

```text
decision_outcome_id
decision_id
outcome_type
outcome_value
observed_at
evidence_id
```

### 9.7. Human Override

```text
override_id
workspace_id
target_type
target_id
action
reason
actor_user_id
created_at
```

---

## 10. Offer & Commercial Context

### 10.1. Offer

```text
offer_id
workspace_id
code
name
offer_type
status
landing_url
price_summary
```

### 10.2. Offer Model Version

Mô tả fit/problem/prerequisite/readiness/non-fit.

### 10.3. Qualification State

```text
qualification_state_id
workspace_id
user_id
offer_id
state
confidence
policy_version
valid_from
valid_until
review_status
```

### 10.4. Commercial Action

```text
commercial_action_id
workspace_id
user_id
offer_id
action_type
status
scheduled_at
executed_at
actor_user_id
```

### 10.5. Offer Outcome

Purchase, declined, not fit, later, no response, success milestone.

Invariant:

- no offer-less qualification;
- Sales Ready human-reviewed;
- action frequency và consent respected.

---

## 11. Recommendation Context

### 11.1. Recommendation Request

```text
recommendation_request_id
workspace_id
user_id
trigger_type
scope_type
scope_id
created_at
```

### 11.2. Candidate

Có thể tính runtime hoặc lưu audit candidate set.

```text
recommendation_candidate_id
request_id
candidate_type
candidate_id
eligibility_status
score_components
exclusion_reasons
```

### 11.3. Recommendation Decision

Reuse Decision aggregate hoặc specialized view.

### 11.4. Recommendation Presentation

```text
recommendation_presentation_id
decision_id
channel
presented_at
position
```

### 11.5. Recommendation Feedback/Outcome

- opened;
- accepted;
- dismissed;
- not_relevant;
- already_known;
- completed;
- reflected;
- applied.

---

## 12. Editorial & Workshop Context

### 12.1. Content Request

```text
content_request_id
workspace_id
user_id
raw_question_id
question_id
status
created_at
resolved_by_content_id
```

### 12.2. Demand Snapshot

```text
demand_snapshot_id
workspace_id
question_cluster_id
window_start
window_end
frequency
urgency_score
strategic_fit_score
gap_score
workshop_fit_score
total_score
policy_version
```

### 12.3. Editorial Recommendation

```text
editorial_recommendation_id
workspace_id
question_cluster_id
recommendation_type
rationale_json
evidence_snapshot_ref
status
created_at
```

### 12.4. Workshop

```text
workshop_id
workspace_id
title
scheduled_at
status
registration_url
```

### 12.5. Workshop Model Version

Question, audience, prerequisite, outcome, output, next actions.

### 12.6. Registration, Attendance, Output

Tách ba entity/event; không gộp “tham gia”.

---

## 13. Notification Context

### 13.1. Notification Preference

```text
notification_preference_id
workspace_id
user_id
channel
topic_scope
frequency
status
```

### 13.2. Notification

```text
notification_id
workspace_id
user_id
notification_type
context_type
context_id
status
scheduled_at
sent_at
```

### 13.3. Delivery Attempt

Provider, idempotency, status, bounce, complaint.

### 13.4. In-app Inbox Item

Có thể reuse Notification với channel `in_app`.

---

## 14. Case Study & Transfer Context

### 14.1. Product Hypothesis

```text
hypothesis_id
workspace_id
name
statement
success_metric
guardrail_metrics
status
```

### 14.2. Experiment/Intervention

```text
experiment_id
hypothesis_id
release_id
cohort_definition
intervention_type
start_at
end_at
status
```

### 14.3. Case Study Evidence Pack

```text
case_pack_id
workspace_id
hypothesis_id
experiment_id
baseline_snapshot_ref
outcome_snapshot_ref
qualitative_evidence_ref
limitations
anonymization_status
created_at
```

### 14.4. Transfer Artifact

```text
transfer_artifact_id
workspace_id
artifact_type
version
source_case_pack_id
universal_scope
creator_specific_notes
object_ref
```

Types:

- Creator Model template;
- Content Model template;
- Offer Model template;
- weekly review worksheet;
- manual CRM sheet;
- workshop guide;
- case lesson.

### 14.5. Pilot Creator Record

Không nhất thiết nằm production database R1–R6. Nếu R7 pilot cần, dùng isolated pilot workspace/tooling theo ADR.

---

## 15. Relationship Graph semantics

### 15.1. Core nodes

```text
Workspace
Creator
User
Goal
Question
QuestionCluster
Content
ContentVersion
Topic
Workshop
Asset/UserOutput
Offer
Evidence
Fact
Inference
Decision
Recommendation
Subscription
CasePack
```

### 15.2. Core typed edges

#### Identity/relationship

```text
USER_BELONGS_TO_WORKSPACE
USER_HAS_GOAL
USER_HAS_ACTIVE_QUESTION
USER_FOLLOWS_TOPIC
```

#### Reading/progress

```text
USER_OPENED_CONTENT
USER_CONFIRMED_CONTENT
USER_REFLECTED_ON_CONTENT
USER_PRODUCED_OUTPUT
OUTPUT_ADDRESSES_QUESTION
```

#### Knowledge

```text
CONTENT_ANSWERS_QUESTION
CONTENT_PARTIALLY_ANSWERS_QUESTION
CONTENT_REQUIRES_CONTENT
CONTENT_LEADS_TO_CONTENT
CONTENT_REDUCES_UNCERTAINTY
CONTENT_SUPPORTS_PROGRESS_TRANSITION
```

#### Workshop

```text
WORKSHOP_ANSWERS_QUESTION
WORKSHOP_REQUIRES_CONTENT
USER_REGISTERED_WORKSHOP
USER_ATTENDED_WORKSHOP
USER_PRODUCED_WORKSHOP_OUTPUT
```

#### Offer

```text
OFFER_SOLVES_QUESTION_TYPE
OFFER_REQUIRES_PROGRESS_STATE
USER_QUALIFIED_FOR_OFFER
DECISION_RECOMMENDS_OFFER
```

#### Evidence/decision

```text
FACT_SUPPORTED_BY_EVIDENCE
INFERENCE_SUPPORTED_BY_EVIDENCE
DECISION_USES_INFERENCE
DECISION_USES_FACT
OUTCOME_EVALUATES_DECISION
```

#### Transfer

```text
CASE_PACK_TESTS_HYPOTHESIS
TRANSFER_ARTIFACT_DERIVED_FROM_CASE
MODEL_FIELD_CREATOR_SPECIFIC
MODEL_FIELD_UNIVERSAL_CANDIDATE
```

---

## 16. Typed tables vs generic edges

Baseline implementation:

- high-volume/critical relationships dùng typed tables (`user_content_completion`, `article_question_link`);
- generic `relationship_edges` chỉ dùng cho low-volume extensible relations hoặc admin exploration;
- không duplicate mà không có source-of-truth rule;
- graph view được dựng qua query/view/service.

Generic edge schema:

```text
edge_id
workspace_id
from_type
from_id
edge_type
to_type
to_id
source_type
source_id
confidence
valid_from
valid_until
status
created_at
```

Không lưu raw pageview làm generic edge.

---

## 17. Aggregate boundaries

### User Account Aggregate

User identity/session/security.

### Workspace Relationship Aggregate

Relationship state, preferences, creator-scoped profile anchor.

### Subscription Aggregate

Subscription, payments, entitlement generation.

### Content Aggregate

Content item, version, model version, publication.

### Active Question Aggregate

Raw/canonical question, status, progress scope.

### Evidence Aggregate

Evidence record append, integrity và lineage.

### Recommendation Aggregate

Request, candidate audit, decision, outcome.

### Offer Qualification Aggregate

Offer-scoped state và evidence review.

Không cố transaction xuyên tất cả aggregate; dùng domain events/outbox.

---

## 18. Invariants xuyên domain

1. `workspace_id` không lấy từ body client cho creator-scoped mutation.
2. User bị xóa không còn nhận notification.
3. Entitlement active có valid window.
4. Article published phải có current version.
5. Member-only article phải có access enforcement.
6. Active Question raw wording được giữ.
7. Inference active có evidence link.
8. Decision active có policy version.
9. Qualification có offer.
10. Progress state có goal/question scope.
11. Sales Ready có human review.
12. Case export không chứa PII chưa anonymize.
13. Cross-workspace edges bị cấm.
14. Model version đã publish là immutable; update tạo version mới.
15. Deleting evidence phải trigger dependency review.

---

## 19. Query examples

### Những người cần được thông báo về bài mới

```text
Article → ANSWERS → Question
User → HAS_ACTIVE_QUESTION → Question
User has valid notification preference
User has not confirmed article
User has required entitlement
```

### Bài nào tạo progression tốt

```text
Recommendation selected Content
→ user completed/reflected/applied
→ progress transition occurred within window
```

### Câu hỏi nào nên làm workshop

```text
QuestionCluster with demand
+ existing articles completed
+ users remain Decision Needed/Action Blocked
+ workshop fit high
```

### Ai Product Qualified cho Conan Maker

```text
User + OfferModel(Conan)
+ Fit evidence
+ Problem evidence
+ Intent evidence
+ Activation evidence
- blocking non-fit
```

### Rule nào có thể chuyển giao

```text
CasePack outcomes across Thong + pilot creators
→ model fields tagged universal_candidate
→ compare creator-specific overrides
```

---

## 20. Multi-tenancy future options — chưa quyết định

Sau Productization Gate mới ADR một trong:

1. Shared D1 với `workspace_id` và application isolation.
2. D1 per workspace.
3. Hybrid control plane + workspace data plane.
4. Self-hosted template.
5. Managed service không self-service.

Foundation không khóa phương án. Việc thêm `workspace_id` chỉ giữ domain boundary.

---

## 21. Anti-patterns

- JSON blob `profile` chứa mọi thứ.
- `users.status` chứa relationship + billing + lead.
- `content.tags` dùng thay Content Model.
- global `lead_score`.
- generic graph edge cho mọi event.
- hardcode Thông-specific beliefs trong recommendation code.
- qualification không có Offer Model.
- copy production data sang học viên pilot.
- graph database trước query need.
- multi-tenant UI trước Productization Gate.

---

## 22. Required diagrams sau R0

Codex phải bổ sung:

- actual context map với module path;
- entity relationship diagram;
- reading event sequence;
- payment/entitlement sequence;
- recommendation sequence;
- evidence lineage sequence;
- publication → notification sequence;
- case-study export sequence.

Diagrams có thể Mermaid nhưng phải đồng bộ code/schema.
