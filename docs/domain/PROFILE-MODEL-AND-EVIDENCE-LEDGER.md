# Profile Model & Evidence Ledger

**Document ID:** TPREAD-D09
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26

---

## 1. Mục đích

Profile Model giúp hệ thống phục vụ người đọc tốt hơn mà không biến họ thành một hồ sơ giám sát hoặc một tập nhãn thiếu căn cứ. Evidence Ledger bảo đảm mọi fact, inference, recommendation, qualification và case-study claim có thể truy về nguồn.

Tài liệu trả lời:

- hệ thống được phép biết gì về user;
- biết bằng cách nào;
- phân biệt fact và inference ra sao;
- confidence và expiry hoạt động thế nào;
- người dùng kiểm soát profile thế nào;
- khi evidence bị xóa thì điều gì xảy ra;
- làm sao tạo case study có thể chuyển giao cho Conan Maker mà không lộ dữ liệu.

---

## 2. Profile Model không phải gì

Không phải:

- hồ sơ tâm lý toàn diện;
- bản sao toàn bộ Facebook profile;
- dự đoán bí mật về thu nhập, sức khỏe hay chính trị;
- một JSON do LLM viết và được tin tuyệt đối;
- lead score;
- danh sách mọi click vô hạn;
- lý do để spam.

Profile Model chỉ mô tả những dimension cần cho trải nghiệm đọc, progression, workshop và offer fit trong một workspace.

---

## 3. Profile dimensions

### 3.1. Identity context

- canonical user;
- workspace relationship;
- locale/timezone;
- account/membership state.

### 3.2. Goal context

- active goal;
- goal history;
- goal status;
- declared outcome.

### 3.3. Question context

- Active Question;
- raw wording;
- canonical mapping;
- unresolved sub-questions;
- request status.

### 3.4. Knowledge/reading context

- content opened;
- confirmed complete;
- reflection;
- prerequisite known;
- content preference;
- format preference.

### 3.5. Progress context

- scoped progress state;
- decision/output;
- action evidence;
- last progression date;
- blockers tự khai.

### 3.6. Relationship context

- registered/paid/activated/engaged;
- notification preference;
- workshop relationship;
- support interactions.

### 3.7. Offer context

- qualification state theo offer;
- fit/non-fit evidence;
- handoff history;
- outcome.

### 3.8. Trust/control context

- consent;
- profile correction;
- data export/delete;
- inference visibility;
- communication preference.

---

## 4. Data classes

### 4.1. Raw Event

Sự kiện gốc chưa diễn giải, ví dụ:

```text
article page loaded
completion button clicked
reflection submitted
workshop attendance imported
payment webhook received
```

Raw Event không tự động là evidence hợp lệ; cần validation/provenance.

### 4.2. Evidence Record

Bản ghi có source và integrity, dùng hỗ trợ conclusion.

### 4.3. Declared Fact

User/human chủ động nói/xác nhận:

- “Tôi muốn tạo thu nhập từ chuyên môn nhân sự.”
- “Tôi đã đọc xong bài này.”
- “Tôi chọn bắt đầu bằng workshop.”

Declared Fact mạnh cho điều user biết về mình, nhưng vẫn có thể đổi theo thời gian.

### 4.4. Observed Fact

Hệ thống quan sát trực tiếp:

- payment verified;
- workshop attendance;
- worksheet uploaded;
- article completion clicked;
- email link clicked.

### 4.5. Derived Fact

Rule deterministic:

- `active_ms_ratio = active_ms / estimated_read_ms`;
- `has_valid_entitlement = true`;
- `content_prerequisites_satisfied`.

Derived Fact phải lưu rule version và input evidence.

### 4.6. Inference

Giả thuyết:

- likely completed;
- decision needed;
- topic interest;
- potential fit;
- churn risk.

Inference luôn có confidence, expiry và evidence links.

### 4.7. Decision

Hành động hệ thống chọn:

- recommendation article;
- send digest;
- suppress email;
- request human review;
- suggest offer exploration.

### 4.8. Outcome

Kết quả sau Decision:

- opened;
- completed;
- dismissed;
- progressed;
- purchased;
- no response;
- negative feedback.

### 4.9. Human Override

Sửa, revoke hoặc xác nhận conclusion. Không overwrite history.

---

## 5. Evidence Record schema

```json
{
  "evidence_id": "ev_01J...",
  "workspace_id": "thongphan",
  "subject_type": "user",
  "subject_id": "usr_01J...",
  "evidence_type": "reflection_submitted",
  "source_type": "web_app",
  "source_id": "ref_01J...",
  "occurred_at": "2026-07-26T08:30:00Z",
  "recorded_at": "2026-07-26T08:30:02Z",
  "payload_ref": "r2://evidence/2026/07/ev_01J.json",
  "integrity_hash": "sha256:...",
  "retention_class": "member_activity",
  "consent_context_id": "cons_01J...",
  "status": "active"
}
```

Không phải mọi evidence cần payload R2. Dữ liệu nhỏ có thể lưu structured fields D1; `payload_ref` optional.

---

## 6. Evidence strength framework

Strength không phải một số tuyệt đối cho mọi conclusion. Baseline levels:

### E0 — Untrusted/invalid

- event thiếu identity/source;
- client score không validate;
- bot suspicion;
- duplicate webhook.

Không dùng.

### E1 — Weak behavioral

- pageview;
- email open;
- scroll depth;
- short click.

Dùng candidate signal, không tạo strong transition.

### E2 — Moderate behavioral

- meaningful active session;
- repeat visit;
- recommendation accepted;
- content saved;
- workshop registration.

### E3 — Direct declaration

- goal;
- Active Question;
- completion confirmation;
- preference;
- stated intent.

### E4 — Produced artifact/verified action

- worksheet;
- published output;
- payment;
- attendance verified;
- action completed.

### E5 — External outcome/corroborated

- customer response;
- purchase from third party;
- measurable result;
- human-reviewed case evidence.

Một E3 có thể mạnh hơn E4 cho preference; E4 mạnh hơn E3 cho action. Policy phải context-aware.

---

## 7. Fact schema

```text
fact_id
workspace_id
user_id
scope_type
scope_id
fact_type
fact_class
value_json
source_evidence_id
created_at
valid_from
valid_until
status
supersedes_fact_id
```

Ví dụ:

```json
{
  "fact_type": "active_goal",
  "fact_class": "declared",
  "value_json": {
    "text": "Tạo nguồn thu nhập phụ từ chuyên môn nhân sự"
  },
  "valid_until": null
}
```

Fact có thể supersede khi user đổi mục tiêu.

---

## 8. Inference schema và lifecycle

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
created_at
expires_at
status
review_status
supersedes_inference_id
```

Lifecycle:

```text
draft
→ active
→ confirmed hoặc corrected
→ expired
→ superseded
→ revoked
→ unverifiable
```

### Generator types

- deterministic_rule;
- scoring_policy;
- AI_model;
- human_analysis.

### Confidence rules

- confidence không mặc định là xác suất calibrated;
- nếu chưa calibration, label `heuristic_confidence`;
- không dùng hai chữ số thập phân giả chính xác;
- threshold theo inference type;
- user-facing không cần hiện số nếu gây hiểu lầm.

---

## 9. Example inference — likely completed

Inputs:

- active time 8m/estimated 10m;
- 14/16 sections engaged;
- conclusion seen;
- source link opened;
- không bấm complete.

Output:

```json
{
  "inference_type": "reading_state",
  "value_json": {"state": "likely_completed"},
  "confidence": 0.82,
  "generator_type": "scoring_policy",
  "generator_version": "reading-confidence-v1.0",
  "expires_at": null
}
```

Hệ thống có thể hỏi user xác nhận; không biến thành Confirmed Fact.

---

## 10. Example inference — decision needed

Evidence:

- Active Question: dịch vụ hay khóa học;
- đã confirmed bài problem framing;
- reflection: “Em hiểu nhưng chưa chọn được”;
- chưa có decision output.

Inference:

```text
progress state candidate = Decision Needed
confidence = high
```

Next Best Action có thể là decision article/worksheet.

---

## 11. Decision schema

```json
{
  "decision_id": "dec_...",
  "workspace_id": "thongphan",
  "user_id": "usr_...",
  "decision_type": "next_best_action",
  "scope_type": "active_question",
  "scope_id": "aq_...",
  "selected_action": {
    "type": "read_content",
    "content_id": "cnt_..."
  },
  "policy_version": "nba-v1.2",
  "rationale": {
    "question_match": 0.95,
    "stage_match": "decision_needed",
    "prerequisites": "satisfied",
    "exclusions_checked": true
  },
  "created_at": "...",
  "expires_at": "..."
}
```

Candidate set/exclusion reason cần audit nếu decision quan trọng.

---

## 12. Evidence lineage

Chuỗi chuẩn:

```text
Raw Event/Provider Event
→ Evidence Record
→ Fact/Derived Fact
→ Inference
→ Decision
→ Outcome
```

Admin Evidence Inspector cần hỗ trợ:

- mở Decision;
- xem policy version;
- xem facts/inferences;
- mở evidence source;
- xem integrity/retention;
- xem override;
- xem dependent decisions.

Nếu source bị xóa:

1. evidence status `deleted_by_request`;
2. dependent fact/inference review;
3. inference `unverifiable` hoặc recompute;
4. decision automation không dùng conclusion lỗi;
5. audit giữ metadata tối thiểu nếu policy cho phép, không giữ payload đã xóa.

---

## 13. Profile update pipeline

```text
Event ingested
→ validate/idempotency
→ evidence recorded
→ fact derivation
→ inference candidates
→ policy evaluation
→ profile snapshot update
→ state transition candidate
→ recommendation recompute request
→ audit/metrics
```

Không update Profile JSON tùy ý từ client.

---

## 14. Profile snapshot vs source records

### Source records

Fact/inference/evidence là source of truth có history.

### Profile snapshot

Materialized projection để UI/query nhanh:

```text
active_goal
active_question
relationship_state
current_progress_states
followed_topics
confirmed_content_count
next_best_action
notification_summary
```

Snapshot có `projection_version` và có thể rebuild. Không mất source records.

---

## 15. User-facing profile control

Reader/member phải thấy một phiên bản dễ hiểu:

```text
Bạn đang muốn: ...
Câu hỏi đang theo dõi: ...
Các chủ đề đã chọn: ...
Bạn đã đánh dấu hoàn thành: ...
Đề xuất hiện tại: ... vì ...
```

Control:

- edit goal;
- change/close question;
- mark/unmark complete;
- topic preference;
- recommendation feedback;
- notification preference;
- export/delete.

Không hiển thị:

- Sales Ready;
- churn risk;
- commercial score;
- internal notes không phù hợp;
- raw tracking details.

---

## 16. Admin access policy

### Owner

Đầy đủ trong workspace, trừ secret/payment raw không cần.

### Editor

Content/demand aggregate; không cần xem full personal profile.

### Relationship Operator

User profile, evidence cần cho support; không xem raw payment secret.

### Analyst Read-only

Aggregate/anonymized; PII hạn chế.

### Conan Transfer Researcher

Chỉ case pack đã anonymized/approved, không production user profile mặc định.

Least privilege là requirement.

---

## 17. Prohibited inferences

Baseline cấm:

- sức khỏe/khuyết tật;
- chính trị;
- tôn giáo;
- dân tộc;
- xu hướng tính dục;
- tình trạng tài chính từ hành vi;
- chẩn đoán tâm lý;
- “lười”, “thiếu kỷ luật”, “thiếu tự tin” như fact;
- khả năng mua dựa demographic;
- private life từ social scraping.

Có thể lưu exact user declaration nếu họ chủ động cung cấp cho một purpose hợp lệ, nhưng không tự mở rộng suy luận.

---

## 18. Reading evidence policy

### Được thu

- page/content ID;
- version;
- start/end;
- visibility aggregate;
- active aggregate;
- section coverage aggregate;
- completion/reflection;
- meaningful interaction count;
- device class coarse;
- referrer/UTM theo privacy policy.

### Không cần thu mặc định

- mouse coordinates;
- raw keystroke;
- clipboard content;
- full replay;
- continuous scroll timestamps;
- unrelated browsing;
- social profile.

### Read Confidence components baseline

```text
coverage          0–30
active time       0–25
conclusion        0–10
interaction       0–10
scroll plausibility 0–10
explicit confirmation 0–15
```

Nếu explicit confirm, tạo Declared Completion riêng; score vẫn có thể dùng data quality nhưng không thay fact.

Policy phải versioned và test chống scroll fraud.

---

## 19. Recommendation evidence policy

Recommendation cần ít nhất:

- eligible access;
- content not superseded;
- question/topic/state match;
- prerequisite status;
- user history exclusion;
- policy version.

High-impact recommendation (offer/workshop limited capacity) cần stronger evidence hoặc human approval.

Feedback được xem là evidence:

- “không phù hợp” có strength E3 cho preference/context;
- không click là evidence yếu, không kết luận dislike.

---

## 20. Qualification evidence policy

### Fit

Ưu tiên:

- declared role/context;
- completed onboarding;
- human conversation;
- produced output.

### Problem

Ưu tiên:

- Active Question;
- reflection;
- diagnosis;
- workshop question.

### Intent

- request offer details;
- choose follow-up;
- view page nhiều lần chỉ là bổ trợ;
- direct question mạnh hơn.

### Activation

- worksheet/output;
- workshop attendance + output;
- member progression;
- actual action.

Mọi qualification bundle lưu evidence grouped by F/P/I/A.

---

## 21. Case Study Evidence Pack

### 21.1. Mục đích

Cho phép Thông chứng minh hệ thống có hoặc không có tác dụng và trích xuất bài học cho Conan Maker.

### 21.2. Pack structure

```text
Case metadata
Hypothesis
Baseline
Cohort
Intervention
Implementation version
Metrics
Qualitative evidence
Outcomes
Failures
Confounders
Privacy/anonymization
Conclusion
Transferable principles
Thong-specific elements
Next experiment
```

### 21.3. Required quantitative fields

Tùy hypothesis:

- traffic source;
- registration;
- activation;
- paid conversion;
- WPR;
- recommendation acceptance;
- completion/reflection;
- return rate;
- demand resolution;
- workshop registration/output;
- qualification/handoff;
- revenue/churn.

### 21.4. Required qualitative fields

- user quote có consent;
- support feedback;
- recommendation failure;
- cancellation reason;
- creator observation;
- edge cases.

### 21.5. Limitation

Mọi pack phải ghi:

- sample size;
- selection bias;
- traffic source;
- novelty effect;
- missing data;
- whether outcome causality can be claimed.

Không tuyên bố “hệ thống tăng doanh thu” nếu chỉ có correlation.

---

## 22. Case pack anonymization

Trước khi dùng trong Conan:

- remove email/name/user IDs;
- generalize time/role khi cần;
- redact free text;
- quote consent;
- suppress small cohorts;
- không export raw reading trail;
- audit file trước share;
- record export actor/purpose.

Có thể dùng synthetic example để dạy flow khi data thật nhạy cảm.

---

## 23. Universal vs creator-specific learning

Mỗi learning trong case pack có tag:

```text
universal_candidate
thong_specific
needs_more_pilots
contradicted
```

Ví dụ:

- “Active Question mạnh hơn topic follow cho cold start” → universal candidate.
- “Người đọc của Thông thích xưng anh/em” → Thông-specific.
- “99k là giá tối ưu” → needs more context, không phổ quát.

Pilot Conan dùng để kiểm tra tag, không copy máy móc.

---

## 24. Data retention classes

### R0 — Security/audit minimum

Giữ theo legal/operational need.

### R1 — Account/contract

Trong thời gian account + policy sau deletion.

### R2 — Member activity

Reading summary, completion, reflection với configurable retention.

### R3 — Analytics aggregate

Có thể giữ lâu hơn nếu anonymized.

### R4 — Raw debug/sample

Rất ngắn, ví dụ 7–30 ngày, chỉ khi cần.

### R5 — Case pack anonymized

Giữ theo IP/research policy, không chứa PII.

Exact duration cần Security/Privacy doc và pháp lý review.

---

## 25. Deletion workflow

```text
User requests deletion
→ authenticate request
→ mark deletion pending
→ stop communication
→ identify data by class/workspace
→ delete/anonymize payload
→ invalidate identity/session
→ mark evidence dependencies
→ recompute/revoke inferences
→ confirm completion
→ retain only legally required audit metadata
```

Không xóa một row user rồi để PII trong R2/email provider/log.

---

## 26. Data quality states

Evidence/fact/inference có thể:

- valid;
- suspect;
- duplicate;
- stale;
- conflicted;
- unverifiable;
- deleted;
- revoked.

Conflict example:

- declared goal mới khác inference cũ;
- user confirms not interested nhưng behavior match topic.

Declared correction ưu tiên cho personalization; history giữ để audit.

---

## 27. Conflict resolution

Priority baseline:

1. verified security/payment fact cho entitlement;
2. latest explicit user declaration cho preference/goal;
3. human-reviewed artifact;
4. deterministic observed/derived fact;
5. inference;
6. weak behavior.

Không áp dụng priority mù quáng cho mọi domain; policy-specific.

---

## 28. Model/Rule version registry

Mọi generator cần registry:

```text
generator_id
name
type
version
status
input_schema
output_schema
owner
released_at
retired_at
evaluation_ref
```

Decision lưu exact version. Khi version mới:

- không rewrite history;
- có thể recompute active profiles;
- compare outcome.

---

## 29. Evaluation framework

### Reading inference

- precision/recall so với user confirmation sample;
- false completion rate;
- correction rate.

### Progress inference

- human agreement;
- user correction;
- next action success.

### Recommendation

- relevance feedback;
- progression rate;
- diversity;
- suppression errors.

### Qualification

- precision cao ưu tiên hơn volume;
- non-fit false positive;
- handoff acceptance;
- operator override.

### AI clustering

- cluster purity;
- lost nuance;
- human edit rate.

---

## 30. Sparse Data Mode profile

Khi user mới:

```text
Declared goal
+ Active Question
+ chosen topics
+ one or two reading facts
+ explicit feedback
```

Hệ thống không cần infer sâu. Profile snapshot nên ghi uncertainty.

Example:

```text
Goal: self-declared
Question: self-declared
Progress: unclear/problem-aware (heuristic)
Recommendation basis: question match + public prerequisite
Confidence label: starting suggestion
```

---

## 31. Rich Data Mode profile

Chỉ kích hoạt khi có threshold:

- nhiều sessions;
- multiple progress evidence;
- content outcome data;
- stable identity;
- consent.

Bổ sung:

- observed effectiveness;
- cohort patterns;
- preference inference;
- timing.

Rich mode không được override explicit user correction.

---

## 32. Cross-creator learning future

Nếu sau này có pilot/multi-workspace:

### Được phép tiềm năng

- aggregate pattern đã anonymize;
- model template;
- evaluation metric;
- non-PII feature effectiveness.

### Không được phép mặc định

- user profile;
- raw question;
- content/private offer;
- email;
- reading history;
- case quote.

Cần policy/consent/ADR riêng trước implementation.

---

## 33. Admin Evidence Inspector requirements

Màn hình cho phép:

- search user/content/decision;
- timeline evidence;
- filter fact/inference;
- view source;
- see confidence/expiry;
- see dependent decisions;
- override/revoke;
- export audit;
- hide/redact sensitive payload theo role.

UI phải giúp operator hiểu, không biến thành bảng dữ liệu khổng lồ.

---

## 34. Invariants và tests

1. Active inference có ít nhất một active evidence link.
2. AI inference có model version.
3. Human override có actor/reason.
4. User deletion stop notifications ngay.
5. Case pack không export PII.
6. Qualification bundle đủ F–P–I–A theo Offer Model.
7. Likely completion không tạo completion fact.
8. Profile snapshot rebuild được từ source records.
9. Evidence workspace phải match target workspace.
10. Deleted evidence không còn dùng trong active decisions.

Test example:

```text
Given an inference depends only on evidence E
When E is deleted
Then inference becomes unverifiable and downstream commercial decisions are suspended.
```

---

## 35. Definition of trustworthy profile

Một Profile Model đáng tin không phải profile có thật nhiều dữ liệu. Nó là profile:

- giới hạn đúng mục đích;
- biết điều gì là fact;
- biết điều gì chỉ là inference;
- truy vết được;
- có freshness;
- người dùng sửa được;
- không dùng dữ liệu nhạy cảm;
- dẫn tới quyết định có ích;
- đo outcome;
- không lộ xuyên workspace.
