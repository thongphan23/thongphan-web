# Creator, Content & Offer Model Specification

**Document ID:** TPREAD-D08
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26
**File kept as:** `CONTENT-MODEL-SPEC.md` để bảo toàn liên kết từ bộ v1

---

## 1. Mục đích

Tài liệu định nghĩa ba model mô tả phía cung của hệ thống:

1. **Creator Model:** Thông Phan là ai trong hệ thống, giúp ai, theo logic nào.
2. **Content Model:** Mỗi nội dung làm công việc gì cho reader ở trạng thái nào.
3. **Offer Model:** Mỗi offer phù hợp với ai, giải quyết gì và khi nào nên handoff.

Profile Model mô tả người đọc. Ba model trong tài liệu này mô tả những gì hệ thống có thể dùng để phục vụ họ. Recommendation chỉ có ý nghĩa khi hai phía đều có cấu trúc.

---

# Phần A — Creator Model

## 2. Vai trò của Creator Model

Nếu không có Creator Model, logic của hệ thống dễ bị hardcode thành:

- một số tag;
- prompt “viết theo giọng anh Thông”;
- các rule rời rạc;
- offer CTA không nhất quán.

Creator Model là cấu hình chiến lược versioned giúp:

- định hướng content taxonomy;
- đánh giá strategic fit của demand;
- kiểm tra recommendation có đúng lời hứa không;
- phân biệt phương pháp phổ quát với quan điểm riêng của Thông;
- chuẩn bị chuyển giao cho creator khác sau này.

---

## 3. Creator Model schema

### 3.1. Identity

```text
creator_id
workspace_id
display_name
canonical_domain
short_bio
primary_language
```

### 3.2. Audience Definition

```text
primary_audience
secondary_audiences
high_fit_signals
non_primary_audiences
context_constraints
```

### 3.3. Core Promise

```text
core_promise
promise_boundaries
non_guarantees
```

### 3.4. Core Beliefs

Mỗi belief:

```text
belief_id
statement
explanation
evidence_refs
status
creator_specificity
```

`creator_specificity`:

- `universal_candidate`;
- `thong_specific`;
- `unclassified`.

### 3.5. Topic Pillars

```text
pillar_id
name
strategic_role
questions
related_offers
content_coverage_target
```

### 3.6. Evidence Standard

```text
accepted_evidence_types
minimum_source_quality
citation_policy
personal_story_labeling
update_policy
```

### 3.7. Voice & Interaction Principles

Không dùng để clone văn phong máy móc; dùng để bảo vệ cách phục vụ:

- gần gũi nhưng không giả thân mật;
- giải thích bằng ví dụ;
- không phô thuật ngữ;
- phân biệt fact/inference;
- không hứa quá mức;
- không dùng fear manipulation;
- dẫn tới một bước thực tế.

### 3.8. Desired Audience Transitions

Ví dụ:

```text
mơ hồ → gọi đúng vấn đề
biết nhiều → chọn một đầu ra
đọc nhiều → hành động
follower → registered reader
reader → member
member phù hợp → Conan Maker candidate
```

### 3.9. Offers

Danh sách Offer IDs và vai trò trong ladder.

---

## 4. Creator Model baseline — Thông Phan

### Audience

Người làm chuyên môn 25–40 tuổi muốn:

- biến kinh nghiệm thành tài sản;
- xây thương hiệu cá nhân;
- tạo thu nhập thứ hai;
- dùng AI có chất lượng;
- không rời bỏ công việc hiện tại một cách liều lĩnh.

### Core Promise

> Giúp người có chuyên môn biến điều họ đã thật sự trả giá để biết thành nội dung, tài sản, offer và môi trường tạo giá trị có người muốn dùng.

### Promise boundaries

- không hứa giàu nhanh;
- không làm thay toàn bộ;
- không biến mọi chuyên môn thành khóa học;
- không ưu tiên công cụ trước vấn đề;
- không đo thành công chỉ bằng follower.

### Core beliefs baseline

1. Chuyên môn chưa phải sản phẩm.
2. Bằng chứng tạo trust mạnh hơn lời tuyên bố.
3. Content tốt giảm bất định và giúp ra quyết định.
4. AI làm tăng năng lực nhưng không thay responsibility.
5. Tài sản phải có người dùng, không chỉ tồn tại trong kho.
6. Thương hiệu cá nhân cần đường nối tới transformation và offer.
7. Một môi trường thực hành dài hạn có giá trị khác bài đọc.
8. Đọc ít hơn nhưng bắt đầu đúng chỗ tốt hơn tiêu thụ vô hạn.

### Topic pillars baseline

- chuyên môn → bằng chứng;
- content và longform;
- tài sản tri thức;
- offer và kinh doanh chuyên môn;
- AI-first có trách nhiệm;
- cộng đồng trả phí;
- học và chuyển hóa;
- hệ thống audience/relationship.

---

## 5. Creator Model governance

- Creator owner duyệt version publish.
- AI có thể gợi ý từ content/case, không tự publish.
- Model không đổi mỗi khi trend thay đổi.
- Belief thay đổi phải có change rationale.
- Offer link được cập nhật khi offer model publish.
- Case transfer cần đánh dấu field phổ quát/riêng.

---

# Phần B — Content Model

## 6. Content Model mục tiêu

Content Model trả lời:

```text
Nội dung này dành cho ai?
Trong tình trạng nào?
Giải quyết câu hỏi gì?
Giảm bất định gì?
Cần biết gì trước?
Kỳ vọng thay đổi gì?
Nên làm gì sau?
Còn hiệu lực không?
Có liên quan offer nào?
```

Nó không thay nội dung, không tự khẳng định người đọc đã hiểu và không phải SEO metadata đơn thuần.

---

## 7. Content Model schema tổng thể

```text
content_model_id
workspace_id
content_id
content_version_id
model_version
status
model_source
reviewed_by
reviewed_at
```

### 7.1. Identity & classification

```text
content_type
content_role
primary_topic
secondary_topics
difficulty
estimated_reading_minutes
format
language
```

`content_role`:

- acquisition;
- orientation;
- problem framing;
- model/explanation;
- decision support;
- action guide;
- evidence/case;
- objection handling;
- reflection;
- conversion/handoff;
- retention;
- reference.

### 7.2. Audience fit

```text
reader_situations
jtbd_ids
progress_state_from
progress_state_to_candidate
high_fit_conditions
low_fit_conditions
```

`progress_state_to_candidate` là outcome intent, không auto transition.

### 7.3. Question mapping

```text
primary_question_id
secondary_question_ids
partially_answered_question_ids
question_scope_notes
```

### 7.4. Learning/progression intent

```text
uncertainty_reduced
expected_shift
misconceptions_addressed
decisions_supported
actions_enabled
```

### 7.5. Prerequisite

```text
required_content_ids
recommended_content_ids
required_progress_states
required_declared_context
```

### 7.6. Next steps

```text
next_content_candidates
next_action_candidates
reflection_prompt_ids
related_workshop_ids
related_asset_ids
```

### 7.7. Trust & evidence

```text
evidence_quality_level
source_refs
claim_types
personal_experience_scope
citation_review_status
```

### 7.8. Access & publication

```text
access_level
preview_policy
canonical_url
seo_index_policy
published_at
freshness_status
review_due_at
superseded_by
```

### 7.9. Commercial relevance

```text
related_offer_ids
commercial_role
handoff_allowed
handoff_constraints
```

`commercial_role`:

- none;
- awareness;
- problem education;
- solution education;
- readiness;
- direct offer explanation.

Content relevance không tự qualification.

### 7.10. Transferability annotation

```text
creator_specificity
universal_pattern_notes
requires_creator_story
transfer_template_candidate
```

---

## 8. Required fields theo content type

### Public longform

Bắt buộc:

- primary question;
- reader situation;
- uncertainty reduced;
- expected shift;
- reading time;
- evidence/source;
- next action;
- access/canonical/freshness.

### Living note

Bắt buộc:

- observation/question;
- status as evolving;
- update date;
- limitation;
- related longform.

### Curated reading

Bắt buộc:

- original author/source;
- why selected;
- what reader should notice;
- source link;
- copyright-safe summary policy.

### Worksheet/asset

Bắt buộc:

- job;
- input;
- output;
- prerequisite;
- completion evidence;
- next action.

### Workshop recording

Bắt buộc:

- workshop model;
- date/version;
- prerequisite;
- output;
- whether still current.

---

## 9. Evidence quality levels cho content

### C0 — Opinion/idea

Không có bằng chứng ngoài lập luận; phải label rõ.

### C1 — Personal observation

Trải nghiệm cá nhân, không khái quát quá mức.

### C2 — Case/evidence cụ thể

Có artifact, before–after, result hoặc nguồn kiểm tra.

### C3 — Multi-source support

Có nhiều nguồn/case đáng tin.

### C4 — Strong evidence

Research/official data hoặc repeated case có phương pháp rõ.

Recommendation có thể ưu tiên C2+ cho quyết định quan trọng nhưng không loại content C0 nếu mục tiêu là reflection.

---

## 10. Freshness model

```text
fresh
review_due
stale
superseded
archived
```

Rule:

- content liên quan công cụ/API/law cần review nhanh;
- mental model evergreen review dài hơn;
- stale content không recommendation mặc định;
- user đã đọc version cũ có thể nhận update notice nếu change material;
- version history phải giữ.

---

## 11. Example Content Model 1

### Nội dung giả định

**“Chuyên môn không phải sản phẩm”**

```yaml
content_role: problem_framing
reader_situations:
  - có nhiều kinh nghiệm nhưng chưa biết bán gì
jtbd:
  - biến chuyên môn thành một đầu ra có người dùng
primary_question: vì sao biết nhiều vẫn chưa có sản phẩm?
progress_state_from:
  - problem_aware
progress_state_to_candidate:
  - problem_understood
uncertainty_reduced:
  - phân biệt chuyên môn, tài sản và offer
expected_shift:
  - từ "bán điều tôi biết" sang "giải quyết một việc khách hàng cần"
prerequisite: none
next_actions:
  - chọn một JTBD nhỏ
  - làm chẩn đoán chuyên môn
related_offers:
  - read_membership
  - conan_maker (awareness only)
evidence_quality: C2
access_level: public
creator_specificity: universal_candidate
```

---

## 12. Example Content Model 2

**“Dịch vụ, workshop hay khóa học: nên bắt đầu bằng gì?”**

```yaml
content_role: decision_support
reader_situations:
  - đã chọn được problem nhưng chưa chọn delivery model
primary_question: hình thức sản phẩm đầu tiên phù hợp là gì?
progress_state_from:
  - decision_needed
progress_state_to_candidate:
  - decision_made
prerequisites:
  - content: chuyen-mon-khong-phai-san-pham
  - state: problem_understood
expected_shift:
  - chọn theo mức certainty, interaction và delivery burden
next_actions:
  - hoàn thành decision worksheet
  - tham dự workshop chọn offer
commercial_role: solution_education
handoff_allowed: false
access_level: member
```

Đọc bài không tự tạo `Decision Made`; cần user choice/worksheet.

---

## 13. Content Model authoring workflow

```text
Draft content hoặc import existing
→ AI gợi ý metadata (optional)
→ Editor review question/state/evidence
→ Creator duyệt expected shift và offer relevance
→ Validate schema
→ Publish model version
→ Recommendation eligibility
→ Outcome data tích lũy
→ Review/update model
```

Field bắt buộc Creator duyệt:

- Primary Question;
- Expected Shift;
- progress intent;
- related offer/handoff;
- creator-specific belief.

---

## 14. Migration existing content

Không model hóa 1000 bài trước MVP.

### Wave 1 — 25–50 core items

Chọn:

- public entry articles;
- five big questions;
- member decision/action articles;
- key worksheets;
- workshop prerequisites;
- offer explanation.

### Wave 2 — Content used in recommendation

Model khi được đưa vào candidate pool.

### Wave 3 — Long tail

Semi-automatic enrichment, review theo demand.

### Quality tiers

```text
M0: title/type only — browse, không personalized
M1: topic/question basic — search/candidate weak
M2: state/prerequisite/next action — recommendation eligible
M3: evidence/offer/outcome calibrated — high-confidence eligible
```

---

## 15. Content effectiveness

Không dùng pageview đơn lẻ. Đo theo role:

- acquisition: registration/trust interaction;
- orientation: Active Question clarified;
- problem framing: progress transition/reflection;
- decision support: decision output;
- action guide: action started/output;
- evidence: confidence/trust feedback;
- handoff: informed offer exploration.

Model outcome được dùng để calibration, không auto rewrite semantics.

---

# Phần C — Offer Model

## 16. Vai trò Offer Model

Offer Model ngăn hệ thống biến engagement thành bán hàng vô định. Nó trả lời:

```text
Offer giải quyết problem nào?
Dành cho ai?
Không dành cho ai?
Cần trạng thái/prerequisite gì?
Signal nào cho thấy muốn đánh giá offer?
Signal nào blocking?
Handoff nào phù hợp?
Outcome nào cần đo?
```

---

## 17. Offer Model schema

```text
offer_model_id
workspace_id
offer_id
version
status
reviewed_by
published_at
```

### 17.1. Promise và scope

```text
problem_statement
solution_category
core_promise
scope_included
scope_excluded
non_guarantees
delivery_model
duration
```

### 17.2. Audience fit

```text
fit_conditions
high_fit_signals
non_fit_conditions
required_context
```

### 17.3. Progress prerequisites

```text
required_progress_states
recommended_content
required_outputs
minimum_activation
```

### 17.4. F–P–I–A policy

```text
fit_evidence_rules
problem_evidence_rules
intent_evidence_rules
activation_evidence_rules
blocking_rules
expiry_rules
```

### 17.5. Handoff

```text
allowed_handoff_actions
human_review_required
frequency_cap
consent_requirement
follow_up_policy
```

### 17.6. Outcome

```text
purchase_outcome
activation_outcome
success_milestones
non_success_signals
review_window
```

### 17.7. Transferability

```text
creator_specificity
universal_offer_pattern
requires_live_delivery
support_burden
```

---

## 18. Offer Model — Read Membership 99k baseline

### Problem

- quá nhiều content nhưng không biết đọc gì;
- mất mạch khi quay lại;
- muốn theo dõi câu hỏi;
- muốn nhận bài phù hợp thay vì broadcast.

### Fit

- sẵn sàng tạo account;
- có một goal/question;
- thấy giá trị trong reading/reflection;
- đồng ý notification preference.

### Non-fit

- chỉ muốn tải toàn bộ content;
- cần coaching cá nhân tức thời;
- không muốn cung cấp bất kỳ preference nào;
- kỳ vọng bài viết bảo đảm thu nhập.

### Intent signals

- tạo Active Question;
- save nhiều hơn một bài;
- hoàn thành trial path;
- xem member benefit;
- chọn notify when answered.

### Activation signals

- confirmed/reflected một bài;
- quay lại theo recommendation;
- cập nhật question.

### Handoff

- self-serve member page;
- contextual CTA;
- không cần human review;
- frequency cap.

### Outcome

- member activation;
- WPR;
- retention;
- content request resolution;
- renewal.

---

## 19. Offer Model — Conan Maker baseline

### Problem

Người có chuyên môn cần môi trường, nhịp, feedback và hệ thống để biến chuyên môn thành tài sản/offer/thu nhập.

### High-fit

- chuyên môn/trải nghiệm thật;
- mục tiêu tạo tài sản hoặc nguồn thu;
- sẵn sàng làm đều;
- muốn đồng hành dài hạn;
- đã thử một số bước và thấy bottleneck thực thi/hệ thống.

### Non-fit

- muốn làm giàu ngay;
- không muốn thực hành;
- chưa có hoặc không muốn khám phá một chuyên môn/problem;
- chỉ cần công cụ AI tức thời;
- không phù hợp cam kết/giá.

### Progress prerequisites

- Problem Understood;
- Approach Understood hoặc Decision Made ở một phạm vi;
- có activation/output nhỏ là signal tốt.

### Intent

- hỏi về đồng hành;
- xem offer sau workshop;
- request environment/feedback;
- chủ động hỏi cách tham gia.

### Activation

- nộp worksheet;
- tạo asset;
- thực hiện challenge;
- duy trì nhịp.

### Handoff

- human review;
- invite to learn more;
- không auto DM;
- lưu non-fit/readiness.

---

## 20. Offer ladder relationships

```text
Public Content
  → Registered Reader
  → Read Membership
  → Workshop/Asset
  → Sprint/Diagnostic hoặc Conan Maker
```

Đây không phải đường bắt buộc. Relationship Graph lưu những route thực tế.

Content Model có `related_offer_ids`, nhưng Offer Model quyết qualification. Content không “sở hữu” lead.

---

## 21. Creator-specific vs universal

### Có khả năng phổ quát

- Creator Promise;
- audience fit;
- question-state mapping;
- Offer F–P–I–A;
- evidence lineage;
- next action.

### Riêng Thông

- topic pillars;
- core beliefs cụ thể;
- Conan Maker offer;
- giọng và case;
- giá/member benefit;
- funnel hiện tại.

Case study phải label rõ để không dạy học viên copy positioning của Thông.

---

## 22. Model versioning

- Draft model có thể sửa.
- Published model immutable về lịch sử; update tạo version.
- Recommendation/decision lưu model version.
- Nếu model thay đổi material, candidate/qualification có thể recompute.
- Không recompute history như thể version mới đã tồn tại trong quá khứ.

---

## 23. Validation rules

### Creator Model

- một active published version/workspace;
- có audience + promise + boundary;
- topic pillar không rỗng;
- offer reference hợp lệ.

### Content Model M2+

- primary question;
- reader situation;
- progress from;
- expected shift;
- next action;
- freshness/access;
- evidence level.

### Offer Model

- problem;
- fit/non-fit;
- F–P–I–A;
- handoff;
- human review flag;
- outcome.

---

## 24. AI usage

AI được phép:

- gợi ý question mapping;
- trích reader situation;
- đề xuất topic;
- tìm prerequisite candidate;
- phát hiện duplicate;
- draft summary.

AI không được tự publish:

- Creator core belief;
- progress transition intent;
- offer fit/non-fit;
- qualification rule;
- commercial handoff;
- evidence quality.

Mọi AI suggestion lưu model/version nếu dùng production.

---

## 25. Admin experience tối thiểu

### Creator Model editor

- version;
- beliefs;
- pillars;
- offers;
- transferability annotation.

### Content Model editor

- structured form;
- graph links;
- validation;
- preview recommendation rationale;
- freshness.

### Offer Model editor

- fit/non-fit;
- F–P–I–A;
- human review;
- test cases.

Admin phải xem được “model này đang được decisions nào sử dụng” trước khi thay đổi.

---

## 26. Model evaluation

### Creator Model

- content/editorial decisions có nhất quán không;
- demand strategic fit có hợp lý không.

### Content Model

- recommendation relevance;
- prerequisite failures;
- intended progress vs observed outcome;
- user feedback.

### Offer Model

- Product Qualified precision;
- non-fit protection;
- handoff acceptance;
- purchase/outcome;
- false positive cost.

---

## 27. Transfer artifact output

Từ ba model có thể tạo cho Conan pilot:

- Creator Model Canvas;
- Content Function Card;
- Offer Fit Canvas;
- Question-to-Content Map;
- Content Coverage Matrix;
- Qualification Evidence Checklist;
- Weekly Editorial Review.

Các artifact này được thử thủ công trước khi biến thành software module.
