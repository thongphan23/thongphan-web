# State Transition & Qualification Model

**Document ID:** TPREAD-D06
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26

---

## 1. Mục đích

Tài liệu định nghĩa cách Thongphan Read mô tả sự thay đổi của:

- quan hệ giữa một người và hệ thống;
- tiến trình giải quyết một goal/question;
- mức độ phù hợp với một offer;
- mức trưởng thành của creator khi áp dụng phương pháp.

Nó ngăn lỗi phổ biến: gom mọi thứ thành một `lead_score` hoặc một trường `status` mơ hồ.

---

## 2. Nguyên tắc nền

1. **State là mô hình vận hành, không phải bản chất con người.**
2. **Mỗi transition cần evidence.**
3. **Progress state gắn với Goal/Question, không gắn cố định với user.**
4. **Commercial state gắn với Offer, không có qualification chung.**
5. **Relationship state không tự suy ra từ payment duy nhất.**
6. **Một người có thể ở nhiều state trên các trục khác nhau.**
7. **State có thể lùi hoặc hết hạn.**
8. **Inference state và confirmed state phải phân biệt.**
9. **Sales Ready cần human review trong baseline.**
10. **Creator maturity không được dùng để ép học viên xây hệ thống quá mức cần thiết.**

---

## 3. State representation chuẩn

Mỗi state instance cần:

```text
state_instance_id
workspace_id
subject_id
state_axis
state_value
scope_type
scope_id
status
confidence
source_type
policy_version
valid_from
valid_until
created_at
updated_at
```

Ví dụ:

```json
{
  "state_axis": "progress",
  "state_value": "decision_needed",
  "scope_type": "active_question",
  "scope_id": "q_123",
  "confidence": 0.81,
  "source_type": "inferred",
  "policy_version": "progress-v1.0"
}
```

State instance liên kết evidence qua ledger, không nhét toàn bộ evidence vào row.

---

# Phần A — Relationship State

## 4. Relationship state overview

```text
Anonymous
  ↓
Known
  ↓
Registered
  ↓
Paid
  ↓
Activated
  ↓
Engaged
  ↓
Advocate
```

Các trạng thái phụ có thể cùng tồn tại:

```text
Churn Risk
Lapsed
Suspended
Deleted
```

Relationship state là trạng thái với hệ thống Thongphan Read, không phải mức độ “thích Thông” hay chất lượng con người.

---

## 5. Anonymous

### Định nghĩa

Có một visit/session nhưng chưa có canonical user.

### Evidence tối thiểu

- anonymous ID hoặc session event.

### Được phép

- public reading;
- public search;
- local progress;
- CTA account.

### Không được phép suy ra

- identity thật;
- product fit;
- relationship depth;
- long-term preference.

### Transition tới Known

Khi có first-party anonymous identity ổn định hoặc email click identity hợp lệ nhưng chưa account.

---

## 6. Known

### Định nghĩa

Hệ thống nhận diện được một visitor ẩn danh qua một identifier hợp lệ nhưng chưa tạo account.

### Transition tới Registered

Evidence:

- account creation thành công;
- email/OAuth xác minh;
- identity merge approved.

### Expiry

Anonymous identity có retention giới hạn; không giữ vô hạn.

---

## 7. Registered

### Định nghĩa

Có canonical user account.

### Entry criteria

- auth identity verified;
- account status active;
- consent baseline recorded.

### Không đồng nghĩa

- đã onboarding;
- đã đọc;
- quan tâm mạnh;
- qualified.

### Transition tới Paid

- payment/subscription được xác nhận;
- entitlement active.

### Transition tới Activated không cần Paid

Free Reader cũng có thể Activated nếu hoàn thành activation criterion của free tier. Do đó `Paid` và `Activated` có thể được lưu như dimension/flags bổ trợ thay vì strictly single chain trong implementation. UI/business view vẫn có thể trình bày funnel đơn giản.

---

## 8. Paid

### Định nghĩa

Có một entitlement trả phí đang hiệu lực.

### Entry evidence

- verified payment hoặc approved admin grant;
- subscription state;
- entitlement active.

### Không đồng nghĩa

- activated;
- engaged;
- satisfied;
- qualified cho offer sâu hơn.

### Exit

- expired;
- canceled at period end;
- refunded/revoked;
- failed renewal sau grace policy.

---

## 9. Activated

### Định nghĩa

User đã trải nghiệm giá trị lõi đầu tiên.

### Activation criterion baseline

Một criterion hợp lệ có thể là:

```text
Registered/Paid
+ goal hoặc Active Question đã khai
+ ít nhất một recommendation được mở
+ ít nhất một progress action: confirmed/reflected/saved path
```

Không nên dùng chỉ login hoặc article open.

### Evidence strength

- declared goal/question: mạnh;
- confirmed/reflection: mạnh;
- recommendation open: vừa;
- pageview: yếu.

### Expiry

Activation là milestone lịch sử, không cần expire; nhưng “currently active” là metric khác.

---

## 10. Engaged

### Định nghĩa

User quay lại và tạo giá trị/progression lặp lại trong cửa sổ thời gian.

### Baseline policy ví dụ

Trong 28 ngày:

- có ít nhất 2 meaningful sessions;
- và ít nhất 1 progression evidence;
- hoặc tham gia workshop + output;
- hoặc cập nhật Active Question + thực hiện Next Action.

Policy phải được calibration bằng dữ liệu, không hardcode vĩnh viễn.

### Không dùng

- email open đơn thuần;
- 20 pageview trong một ngày;
- background tab time.

---

## 11. Advocate

### Định nghĩa

User chủ động giúp hệ thống/creator lan tỏa hoặc tạo social proof.

### Evidence

- referral có người đăng ký;
- testimonial có consent;
- case contribution;
- chủ động chia sẻ nhiều lần;
- giới thiệu workshop/member.

### Human/declared review

Nên có human confirmation hoặc clear event; không suy ra Advocate từ share button click duy nhất.

---

## 12. Churn Risk, Lapsed và Suspended

### Churn Risk

Inference cho Paid Member có tín hiệu giảm value/engagement. Chỉ dùng để đề xuất check-in có ích, không gây áp lực.

### Lapsed

Relationship từng active nhưng không còn activity trong window hoặc entitlement hết hạn.

### Suspended

Account/entitlement bị tạm dừng do abuse, payment dispute, security hoặc admin action.

Mỗi trạng thái cần reason code và expiry/review.

---

# Phần B — Progress State

## 13. Scope của progress

Progress state luôn gắn với:

- một Goal;
- hoặc một Active Question;
- hoặc một target output cụ thể.

Một user có thể:

- `decision_made` với câu hỏi chọn offer;
- nhưng `unclear` với câu hỏi distribution.

Không được ghi global `progress_state = advanced`.

---

## 14. Progress state canonical

```text
Unclear
→ Problem Aware
→ Problem Understood
→ Approach Understood
→ Decision Needed
→ Decision Made
→ Action Planned
→ Action Started
→ Output Produced
→ Outcome Observed
→ Reflected on Outcome
```

Không phải mọi hành trình cần đi qua tất cả. Policy có thể skip khi có evidence.

---

## 15. Unclear

### Định nghĩa

User cảm thấy mắc kẹt nhưng chưa gọi được câu hỏi/problem đủ rõ.

### Evidence

- declared “không biết bắt đầu từ đâu”;
- diagnosis incomplete;
- nhiều topic rời rạc mà không có Active Question.

### Next actions phù hợp

- diagnosis;
- hỏi mục tiêu/tình huống;
- bài reframe nền;
- human conversation.

### Không phù hợp

- push sản phẩm sâu;
- chuỗi bài quá chuyên môn;
- qualification mạnh.

---

## 16. Problem Aware

User nhận biết triệu chứng/problem nhưng chưa hiểu cấu trúc/nguyên nhân.

Ví dụ:

> “Tôi đăng content nhưng không ra khách.”

Next action:

- bài phân biệt traffic, trust, offer và conversion;
- câu hỏi chẩn đoán.

---

## 17. Problem Understood

User có cách diễn đạt đủ rõ về problem và context.

Evidence mạnh:

- reflection;
- diagnosis output;
- workshop answer;
- human-confirmed note.

Next action:

- so sánh cách tiếp cận;
- chọn constraint;
- bài mô hình.

---

## 18. Approach Understood

User hiểu phương pháp/logic chung nhưng chưa ra quyết định cá nhân.

Ví dụ:

> Hiểu cần chọn JTBD trước khi làm khóa học nhưng chưa biết JTBD nào.

Next action:

- decision tool;
- case;
- worksheet;
- workshop thực hành.

---

## 19. Decision Needed

User có các lựa chọn cụ thể và cần tiêu chí chọn.

Đây là state quan trọng cho Content Demand. Longform so sánh, decision tree và workshop phù hợp.

Không được chuyển sang Decision Made chỉ vì user đọc bài so sánh.

---

## 20. Decision Made

User chủ động xác nhận lựa chọn hoặc có output thể hiện lựa chọn.

Evidence:

- declared decision;
- worksheet;
- workshop output;
- approved plan.

Decision có thể có expiry/reopen nếu context thay đổi.

---

## 21. Action Planned

Có kế hoạch cụ thể:

- hành động;
- deadline;
- scope;
- success evidence.

Đọc checklist chưa đủ.

---

## 22. Action Started

Có observable evidence hành động đầu tiên:

- tạo draft;
- gửi offer;
- đăng page;
- phỏng vấn khách;
- nộp asset.

---

## 23. Output Produced

Đã tạo vật thể có thể review:

- content;
- asset;
- offer;
- workshop outline;
- landing page;
- dataset;
- case draft.

Output không đồng nghĩa outcome.

---

## 24. Outcome Observed

Có phản hồi/kết quả từ thực tế:

- người đọc phản hồi;
- khách trả tiền;
- workshop attendance;
- user sử dụng asset;
- conversion;
- failure signal.

Outcome có thể tích cực, trung tính hoặc tiêu cực.

---

## 25. Reflected on Outcome

User đã diễn giải điều học được, điều chỉnh model hoặc quyết định bước tiếp.

Đây là progression mạnh vì biến trải nghiệm thành knowledge reusable.

---

## 26. Transition evidence matrix

| From → To | Evidence tối thiểu | Không đủ |
|---|---|---|
| Unclear → Problem Aware | declared symptom hoặc diagnosis | pageview |
| Problem Aware → Understood | reflection/diagnosis output | article complete |
| Understood → Approach Understood | quiz/reflection/case choice | time-on-page |
| Approach → Decision Needed | declared alternatives/constraint | browse category |
| Decision Needed → Made | explicit choice/worksheet | đọc comparison |
| Decision Made → Planned | plan artifact | save article |
| Planned → Started | action event/output draft | email open |
| Started → Output | submitted/published artifact | intent statement |
| Output → Outcome | external response/result | creator self-assessment alone |
| Outcome → Reflected | retrospective/lesson | elapsed time |

---

## 27. Regression và reopen

Progress không tuyến tính. State có thể:

- reopen do context mới;
- regress vì decision không còn phù hợp;
- split thành sub-question;
- close vì user không còn quan tâm.

Không xóa history. Tạo state instance mới và quan hệ supersede.

---

# Phần C — Commercial Qualification State

## 28. Scope bắt buộc

Commercial state luôn có:

```text
offer_id
workspace_id
user_id
qualification_policy_version
```

Ví dụ một người có thể Product Qualified cho Read Membership nhưng Unknown Fit với Conan Maker.

---

## 29. Canonical commercial states

```text
Unknown Fit
→ Potential Fit
→ Problem Qualified
→ Solution Qualified
→ Product Qualified
→ Sales Ready
→ Customer
```

Các state phụ:

```text
Not Fit
Not Ready
Disqualified
Dormant
Former Customer
```

---

## 30. F–P–I–A model

### F — Fit

Bằng chứng về audience/context phù hợp với Offer Model.

Ví dụ Conan Maker:

- có chuyên môn/kinh nghiệm thật;
- muốn biến thành tài sản/thu nhập;
- chấp nhận thực hành dài hạn.

### P — Problem

Người dùng xác nhận vấn đề offer giải quyết đang tồn tại và có ý nghĩa.

### I — Intent

Hành vi/declared signal cho thấy muốn đánh giá hoặc tìm giải pháp.

### A — Activation

Đã làm một hành động chứng minh khả năng/cam kết sử dụng giải pháp.

Không có một nhóm nào được thay thế hoàn toàn bằng engagement volume.

---

## 31. Unknown Fit

Chưa đủ evidence về fit. Đây là default, không phải tiêu cực.

Không gửi offer personalization dựa trên state này.

---

## 32. Potential Fit

Có ít nhất một fit signal và không có non-fit rõ, nhưng Problem/Intent chưa đủ.

Next action:

- phục vụ content;
- hỏi context tự nguyện;
- không sales outreach.

---

## 33. Problem Qualified

Điều kiện:

- Fit tối thiểu;
- Problem được declared/confirmed;
- problem liên quan Offer Model;
- problem còn active/fresh.

Không cần intent mua ngay.

---

## 34. Solution Qualified

User hiểu/đồng ý xem xét loại giải pháp mà offer cung cấp.

Ví dụ:

- nhận ra cần môi trường thực hành, không chỉ bài đọc;
- muốn tham gia workshop;
- hỏi cách chương trình hoạt động.

---

## 35. Product Qualified

Baseline yêu cầu:

- Fit evidence đủ;
- Problem Qualified;
- Intent signal;
- Activation signal;
- không có non-fit blocking;
- evidence còn mới.

Product Qualified có thể được rule tạo nhưng phải explainable.

---

## 36. Sales Ready

Baseline:

- Product Qualified;
- user có signal muốn trao đổi/xem offer;
- timing phù hợp;
- human review approved.

Không tự động outreach chỉ vì score.

---

## 37. Customer

Payment/contract cho offer xác nhận. Sau purchase, qualification history vẫn giữ nhưng focus chuyển sang onboarding/outcome.

Customer không tự động là success hoặc advocate.

---

## 38. Not Fit và Not Ready

### Not Fit

Offer không phù hợp với context hiện tại. Có thể permanent hoặc temporal.

### Not Ready

Fit/problem có nhưng thiếu prerequisite, timing hoặc capacity.

Hệ thống nên đề xuất bước phục vụ phù hợp, không cố nurture vô hạn để bán.

---

## 39. Example qualification policy — Read Membership

### Fit

- muốn đọc có định hướng;
- có câu hỏi/chủ đề theo dõi;
- chấp nhận account/email.

### Problem

- quá tải content;
- không biết đọc gì tiếp;
- muốn continuity.

### Intent

- save article;
- tạo Active Question;
- xem membership page;
- chọn notification.

### Activation

- hoàn thành trial path;
- phản tư;
- quay lại đọc.

Product Qualified cho gói 99k có thể không cần human review; purchase CTA có thể tự động nhưng không phải invasive outreach.

---

## 40. Example qualification policy — Conan Maker

### Fit

- có chuyên môn thật;
- muốn tạo tài sản/offer/thu nhập;
- phù hợp với phương pháp;
- sẵn sàng nhịp dài hạn.

### Problem

- chưa chuyển hóa chuyên môn;
- thiếu hệ thống, feedback hoặc environment.

### Intent

- hỏi về đồng hành;
- tham dự workshop liên quan;
- xem offer page;
- trả lời muốn triển khai.

### Activation

- hoàn thành worksheet;
- tạo asset/output;
- thực hiện task;
- duy trì nhịp.

Sales Ready yêu cầu human review.

---

## 41. Qualification expiry

Evidence có freshness. Ví dụ:

- page view: rất ngắn;
- Active Question: 30–90 ngày tùy update;
- workshop output: lâu hơn;
- declared goal: cần reconfirm định kỳ;
- payment: theo transaction.

Khi evidence hết hạn, state có thể giảm confidence hoặc chuyển Dormant; không xóa history.

---

# Phần D — Creator Capability Maturity

## 42. Mục đích

Mô hình này dành cho việc chuyển giao Conan Maker. Nó không chấm điểm phẩm chất creator, chỉ xác định mức hệ thống nên triển khai.

---

## 43. Level 0 — Demand Discovery

### Đặc điểm

- audience ít hoặc chưa rõ;
- chưa có content library;
- chưa có offer ổn định;
- dữ liệu chủ yếu là conversation.

### Capability cần

- Creator Model sơ bộ;
- interview/question log;
- JTBD;
- manual content demand;
- Offer hypothesis.

### Không cần

- behavior tracking phức tạp;
- recommendation engine;
- graph database;
- membership platform.

### Exit criteria

- xác định được audience/problem có bằng chứng;
- có 10–20 conversation/question thật;
- có content/offer experiment đầu.

---

## 44. Level 1 — Audience Memory

### Đặc điểm

- có người tương tác;
- creator quên ai hỏi gì;
- chăm sóc thủ công.

### Capability

- contact/relationship table;
- question log;
- content đã gửi;
- next action;
- consent/source;
- weekly review.

### Công cụ có thể chỉ là Sheet/Notion/CRM nhẹ.

### Exit criteria

- creator dùng memory trong 4–6 tuần;
- thấy được repeated question;
- có nhu cầu owned hub.

---

## 45. Level 2 — Owned Reader Hub

### Đặc điểm

- có kho content;
- có traffic/email;
- muốn identity và progress.

### Capability

- public library;
- account;
- save/complete;
- onboarding;
- email;
- basic recommendation;
- Active Question.

### Exit criteria

- registered users;
- recurring visits;
- content path used;
- first willingness-to-pay hoặc clear engagement value.

---

## 46. Level 3 — Relationship Intelligence

### Capability

- Profile Model;
- Content Model;
- Offer Model;
- Relationship Graph;
- Evidence Ledger;
- state transition;
- recommendation;
- editorial demand.

### Exit criteria

- progression measurable;
- decision quality improves;
- content roadmap changed by evidence;
- commercial fit signals credible.

---

## 47. Level 4 — Automated Growth System

### Capability

- lifecycle automation;
- multi-offer qualification;
- workshop loop;
- case reporting;
- AI augmentation;
- operational role/team.

### Preconditions

- enough data;
- stable models;
- offer economics;
- support capacity;
- privacy/security.

---

## 48. Maturity transition rules

Không chuyển level vì “muốn công nghệ xịn”. Chỉ chuyển khi bottleneck hiện tại yêu cầu capability tiếp theo.

| Transition | Bằng chứng cần |
|---|---|
| L0 → L1 | recurring relationships/questions |
| L1 → L2 | manual memory không đủ + content/audience tồn tại |
| L2 → L3 | personalization/editorial decision có volume đủ |
| L3 → L4 | stable workflow + automation ROI |

Thongphan Read là reference implementation có thể tiến Level 2–4. Học viên bắt đầu theo trạng thái thật.

---

# Phần E — Policy vận hành

## 49. Transition engine order

```text
1. Nhận evidence
2. Validate source/integrity
3. Tạo/cập nhật fact
4. Xác định candidate transitions
5. Kiểm tra required evidence và exclusions
6. Tạo inference nếu cần
7. Apply deterministic transition hoặc đưa review queue
8. Ghi audit/domain event
9. Recompute recommendation nếu liên quan
10. Đo outcome
```

---

## 50. Human review matrix

| Transition/Decision | Auto | Human review |
|---|---:|---:|
| Anonymous → Registered | Có | Không |
| Registered → Paid | Có sau verified payment | Chỉ lỗi |
| Activated | Có rule | Có thể override |
| Progress inferred | Có | User sửa được |
| Decision Made | Chỉ declared/output | Không bắt buộc |
| Product Qualified | Có rule | Review tùy offer |
| Sales Ready | Không baseline | Bắt buộc |
| Advocate | Có candidate | Nên duyệt |
| Sensitive inference | Không | Ngoài scope |

---

## 51. State explanation format

Admin explanation:

```text
State: Product Qualified — Conan Maker
Policy: conan-pq-v1.1
Valid: 2026-07-26 → 2026-08-26
Evidence:
- Declared goal: tạo nguồn thu từ chuyên môn
- Active Question: chọn offer đầu tiên
- Workshop output submitted
- Viewed Conan Maker detail after workshop
Blocking non-fit: none
Confidence: 0.82
```

User-facing explanation không hiển thị “Product Qualified”; chỉ hiển thị bước hữu ích.

---

## 52. Invariants

1. Commercial state luôn có Offer ID.
2. Progress state luôn có Goal/Question scope.
3. Active inference luôn có evidence.
4. Confirmed state do user/human không bị AI tự sửa không audit.
5. Pageview không tạo progress transition mạnh.
6. Payment không tạo Sales Ready.
7. Reading completion không tạo Outcome Produced.
8. State expired không dùng cho automation.
9. Human override không xóa state history.
10. Cross-workspace transition bị cấm.

---

## 53. Test examples

```text
Given user scrolls to 100% in 5 seconds
When reading policy runs
Then state is not Confirmed Completed and no progress transition occurs.
```

```text
Given user declares a new Active Question
When previous progress state belongs to old question
Then old state remains historical and new scope starts independently.
```

```text
Given user is Paid Member
But has no Conan Maker problem/intent evidence
When qualification runs
Then commercial state for Conan remains Unknown/Potential Fit.
```

```text
Given inference evidence is deleted by user request
When lineage recompute runs
Then inference becomes unverifiable/revoked and dependent decisions are reviewed.
```

---

## 54. Decision owner

- Product owner duyệt semantics.
- Domain implementation không được thay state name/criteria mà thiếu version update.
- Qualification policy theo offer cần owner của offer duyệt.
- Conan transfer maturity được dùng như diagnostic, không làm marketing claim cứng.
