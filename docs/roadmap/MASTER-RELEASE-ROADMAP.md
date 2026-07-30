# Master Release Roadmap — Thongphan Read

**Document ID:** TPREAD-D12
**Version:** 2.0.0
**Status:** Approved foundation roadmap
**Last updated:** 2026-07-26
**Primary owner:** Thông Phan

---

## 1. Mục đích

Roadmap xác định thứ tự xây dựng để Codex không:

- tạo một hệ thống lớn nhưng không dùng được;
- xây AI trước dữ liệu;
- xây multi-tenant trước case;
- phá public website;
- trộn membership, profile và qualification;
- triển khai nhiều phần ngang mà không có vertical slice hoàn chỉnh.

Mỗi release phải tạo giá trị quan sát được, có exit criteria, rollback và decision gate.

---

## 2. Roadmap doctrine

1. R0 audit trước code lớn.
2. Public value không bị phá.
3. Membership foundation trước intelligence.
4. Evidence trước inference.
5. Structured models trước personalization.
6. Rule-first trước AI.
7. Case study cùng lúc với product, không viết hồi ký sau cùng.
8. Chuyển giao method trước software.
9. Conan pilot trước multi-tenancy.
10. Một release chỉ mở khi release trước đạt exit gate, trừ task độc lập rõ.

---

## 3. Release map

```text
R0  Audit & Foundation Alignment
 ↓
R1  Public + Identity + Membership + Entitlement
 ↓
R2  Reading Intelligence + Evidence Ledger
 ↓
R3  Creator/Content/Offer/Profile Models + Graph
 ↓
R4  Personalized Reading + Next Best Action
 ↓
R5  Editorial Demand + Workshop + Notification Loop
 ↓
R6  Offer Qualification + Commercial Handoff
 ↓
R7  Case Study Completion + Conan Method Transfer Pilot
 ↓
R8  Productization Decision & Optional Hosted Prototype
 ↓
R9  AI Optimization / SLM Evaluation
```

R8/R9 không mặc định phải thực hiện. Chúng phụ thuộc evidence.

---

# R0 — Audit & Foundation Alignment

## 4. Goal

Biết chính xác codebase hiện tại và điều chỉnh foundation docs theo sự thật.

## 5. User-visible value

Không có feature lớn. Giá trị là giảm rủi ro phá website và giúp release sau chính xác.

## 6. Required reading

- AGENTS;
- Master Index;
- Current System Audit;
- Product Charter;
- SAD;
- Data/Event;
- Roadmap.

## 7. Workstreams

### R0-W1 Repository audit

- framework;
- package manager;
- routes;
- build/test/deploy;
- CI;
- content source;
- current analytics/auth.

### R0-W2 Cloudflare audit

- account/project;
- bindings;
- DNS/routes;
- environments;
- limits/usage;
- secrets.

### R0-W3 Content/SEO audit

- URL inventory;
- canonical;
- sitemap;
- content types;
- metadata coverage;
- existing traffic baseline.

### R0-W4 Security/privacy audit

- cookies;
- forms;
- data stores;
- provider;
- admin access;
- policies.

### R0-W5 Architecture reconciliation

- update SAD/Data docs;
- create ADRs;
- choose incremental path.

## 8. Deliverables

- verified audit report;
- repository map;
- actual architecture diagrams;
- route/SEO baseline;
- content inventory;
- Cloudflare binding map;
- risk register;
- ADR backlog;
- R1 feasibility;
- updated docs v2.x.

## 9. Exit criteria

- local build/test known;
- preview/dry-run works;
- no blocking unknown for R1;
- route decision approved;
- auth/payment/email shortlist;
- migration/rollback principle;
- baseline metric saved.

## 10. Non-goals

- no framework rewrite;
- no production DB migration;
- no multi-tenant;
- no AI.

---

# R1 — Public, Identity, Membership & Entitlement

## 11. Goal

Tạo một vertical slice có thể bán/kiểm nghiệm:

```text
Public article
→ account
→ Reader experience
→ checkout/payment
→ member entitlement
→ member content/feature
```

## 12. Product hypotheses

- visitor sẵn sàng tạo account để lưu/nhận path;
- một phần sẵn sàng trả cho continuity/personalization promise;
- public site không cần bị khóa để bán membership.

## 13. Required documents trước code

- PRD-R1;
- SDD-R1;
- Identity/Auth ADR;
- Payment ADR;
- Email ADR;
- Security/Privacy Threat Model;
- Test/Acceptance R1;
- Migration/SEO plan nếu route thay đổi;
- Implementation Plan và task packs.

## 14. Vertical slices

### R1-S1 Reader account

- signup/login/logout;
- canonical user;
- consent;
- profile shell;
- anonymous identity merge safe.

### R1-S2 Save and basic history

- save public article;
- view saved;
- simple recent history;
- no advanced read inference.

### R1-S3 Membership checkout

- plan page;
- checkout;
- webhook;
- subscription/payment;
- entitlement.

### R1-S4 Member access

- one member article/asset;
- server-side guard;
- account membership status.

### R1-S5 Admin support

- lookup user/subscription;
- grant/revoke entitlement;
- audit.

## 15. Cloudflare

- Static Assets/Pages;
- Workers API;
- D1;
- Turnstile;
- external auth/email/payment adapters;
- Web Analytics.

## 16. Metrics

- public → registered;
- onboarding start;
- checkout start;
- payment success;
- member activation proxy;
- support incidents;
- static vs Worker requests;
- entitlement errors.

## 17. Exit criteria

- secure account;
- payment idempotent;
- entitlement accurate;
- public/member access tested;
- cancellation/expiry path;
- no SEO regression;
- production rollback tested;
- first real users can use.

## 18. Case evidence

Freeze baseline:

- public traffic;
- current newsletter/workshop conversion;
- first account/purchase feedback;
- reasons to register/pay/not pay.

## 19. Non-goals

- no deep personalization;
- no reading confidence;
- no lead qualification;
- no creator transfer UI.

---

# R2 — Reading Intelligence & Evidence Ledger

## 20. Goal

Biết một user đã mở, tham gia, xác nhận, phản tư và hành động tới đâu mà không giám sát quá mức.

## 21. Hypotheses

- user sẵn sàng mark complete/reflect nếu UX nhẹ;
- reading state tốt hơn pageview;
- progression evidence có thể đo được.

## 22. Required docs

- Detailed Reading Intelligence Spec;
- Evidence implementation SDD;
- privacy event catalog;
- R2 test plan;
- data retention baseline.

## 23. Vertical slices

### R2-S1 Reading session summary

- tracker;
- visibility/coverage aggregate;
- finalize endpoint;
- D1 summary;
- analytics event.

### R2-S2 Confirm complete

- explicit button;
- completion fact;
- revoke;
- UI state.

### R2-S3 Reflection

- structured prompt;
- free text optional;
- question follow-up;
- evidence.

### R2-S4 Evidence Inspector v1

- session → evidence → completion/reflection;
- admin detail;
- audit.

### R2-S5 Reading profile

- opened/sampled/likely/confirmed/reflected projection;
- no progress auto beyond policy.

## 24. Cloudflare

- Workers;
- D1;
- Queues optional/outbox;
- Analytics Engine;
- R2 only payload/sample;
- client sendBeacon.

## 25. Metrics

- session finalize success;
- confirmed rate;
- reflection rate;
- correction/revoke;
- reading inference agreement sample;
- D1 write/session;
- tracker performance overhead.

## 26. Exit criteria

- raw micro-event not stored;
- reading states explainable;
- user can correct;
- evidence chain complete;
- quota within budget;
- no material performance/privacy regression.

## 27. Case evidence

Compare:

- pageview vs meaningful reading;
- articles with high open/low progress;
- reflection themes;
- user comfort/feedback.

---

# R3 — Models & Relationship Graph

## 28. Goal

Cấu trúc hóa phía creator, content, offer và reader để system decisions có ngữ nghĩa.

## 29. Hypotheses

- structured Content Model cải thiện selection;
- Active Question mạnh cho cold start;
- Offer Model giảm qualification sai;
- workspace-ready domain không làm MVP quá nặng.

## 30. Required docs

- model field dictionary;
- physical schema SDD;
- content migration plan;
- admin UX spec;
- state policy v1.

## 31. Vertical slices

### R3-S1 Workspace & Creator Model

- workspace row;
- creator model editor/version;
- beliefs/pillars/offers.

### R3-S2 Content Model

- model schema;
- 25–50 content core;
- question links;
- prerequisite/next action;
- freshness.

### R3-S3 Offer Model

- Read Membership;
- Conan Maker;
- fit/non-fit/F–P–I–A;
- version.

### R3-S4 Active Question

- raw question;
- canonical mapping manual/rule;
- status/history;
- user control.

### R3-S5 Profile & graph view

- facts/inferences;
- typed relationships;
- admin user timeline;
- profile projection.

## 32. Metrics

- content model coverage M2+;
- Active Question adoption;
- question mapping edit rate;
- profile correction;
- admin time to understand user;
- model completeness.

## 33. Exit criteria

- models versioned;
- 25–50 core content eligible;
- two Offer Models;
- Active Question works;
- graph queries proven;
- workspace invariant tests;
- no need Neo4j.

## 34. Case evidence

Document:

- manual decisions before/after structured models;
- common question clusters;
- fields that were hard to model;
- Thông-specific vs universal candidates.

---

# R4 — Personalized Reading & Next Best Action

## 35. Goal

Đưa cho mỗi reader/member một bước tiếp theo có lý do và đo outcome.

## 36. Hypotheses

- one primary NBA tốt hơn feed dài;
- Active Question + state match tốt hơn topic-only;
- rule-first đủ tạo value;
- feedback cải thiện profile.

## 37. Required docs

- Recommendation/NBA Policy v1;
- candidate/score spec;
- cold start/sparse mode;
- recommendation evaluation plan;
- UI rationale spec.

## 38. Vertical slices

### R4-S1 Eligibility

- access;
- freshness;
- completed;
- prerequisite;
- workspace.

### R4-S2 Ranking

- question match;
- stage match;
- content role;
- observed effectiveness optional;
- deterministic score.

### R4-S3 Personalized home

- one primary action;
- alternatives/browse;
- explanation;
- no-content fallback.

### R4-S4 Feedback/outcome

- relevant/not now/already known;
- presented/opened/completed/reflected;
- policy metric.

### R4-S5 Non-reading actions

- update question;
- worksheet;
- workshop;
- no action/continue current.

## 39. Metrics

- recommendation presentation → acceptance;
- confirmed/reflection progression;
- relevant feedback;
- WPR;
- repeat visits;
- false prerequisite;
- suppressed duplicate.

## 40. Exit criteria

- every recommendation explainable;
- fallback works;
- no AI dependency;
- user correction changes future recommendation;
- WPR measurable;
- policy version audit.

## 41. Case evidence

A/B hoặc staged comparison curated path vs personalized rule, với limitation rõ.

---

# R5 — Editorial Demand, Workshop & Notification Loop

## 42. Goal

Đóng vòng:

```text
question → demand → content/workshop → notification → progression
```

## 43. Hypotheses

- demand evidence giúp Thông viết đúng hơn;
- existing content redistribution thường tốt hơn viết mới;
- workshop phù hợp khi users hiểu nhưng chưa làm;
- contextual email kéo người đọc quay lại tốt hơn broadcast.

## 44. Required docs

- Editorial Demand Policy;
- Workshop Model Spec;
- Notification/Lifecycle Spec;
- email provider runbook;
- campaign approval UX;
- content publication workflow.

## 45. Vertical slices

### R5-S1 Content Request

- request;
- match existing content;
- status;
- user visibility.

### R5-S2 Weekly demand

- signal aggregation;
- cluster review;
- gap analysis;
- editorial recommendation.

### R5-S3 Workshop intelligence

- workshop model;
- pre-reading;
- registration/attendance/output;
- questions back to demand.

### R5-S4 Publication audience

- new content linked to questions;
- eligible audience preview;
- operator approval.

### R5-S5 Email/in-app

- immediate requested answer;
- weekly digest;
- frequency cap;
- delivery webhook;
- outcome.

## 46. Metrics

- requests resolved;
- content gaps;
- old content reused;
- email click → meaningful reading;
- workshop output rate;
- content created from demand;
- time request → answer.

## 47. Exit criteria

- weekly report usable;
- notification respects preference;
- no email duplicate;
- workshop attendance/output separate;
- published content maps back to demand;
- relevant user notified and outcome tracked.

## 48. Case evidence

Một editorial case trọn vẹn:

```text
question cluster
→ quyết định viết/workshop
→ audience notified
→ reading/workshop outcome
→ learning
```

---

# R6 — Offer Qualification & Commercial Handoff

## 49. Goal

Nhận diện sự phù hợp với Read Membership và deeper offers bằng evidence, bảo vệ trust.

## 50. Hypotheses

- F–P–I–A tạo handoff chất lượng hơn engagement score;
- human review giảm false positive;
- member progression là signal tốt hơn số bài đọc.

## 51. Required docs

- qualification policy per offer;
- sales-ready review UX;
- commercial communication policy;
- privacy review;
- evaluation plan.

## 52. Vertical slices

### R6-S1 Qualification engine

- evidence groups;
- expiry;
- blocking non-fit;
- state instances.

### R6-S2 Offer Inspector

- user × offer view;
- evidence chain;
- human override.

### R6-S3 Handoff

- invite learn more;
- operator approval;
- no auto outreach baseline;
- outcome.

### R6-S4 Offer feedback

- not fit/not now;
- purchase;
- declined;
- onboarding.

### R6-S5 Qualification metrics

- precision/review override;
- handoff acceptance;
- false positive;
- conversion/outcome.

## 53. Exit criteria

- no global lead score;
- qualification always offer-scoped;
- Sales Ready reviewed;
- non-fit protected;
- commercial action consent/frequency;
- evidence traceable.

## 54. Case evidence

Compare manually selected leads vs policy-assisted; report false positives and human judgment.

---

# R7 — Case Study Completion & Conan Method Transfer Pilot

## 55. Goal

Chuyển hệ thống đã dùng thật thành phương pháp có thể áp dụng ở mức phù hợp cho 3–5 học viên Conan Maker, **không xây SaaS**.

## 56. Preconditions

- ít nhất một cohort reader/member thật;
- R1–R5 core hoạt động;
- có một số WPR/progression;
- có editorial loop case;
- có lesson/failure;
- privacy/anonymization ready.

R6 có thể chưa hoàn tất toàn bộ nếu pilot tập trung audience/content, nhưng qualification transfer cần R6 evidence.

## 57. Hypotheses

- tám model có thể giải thích cho creator khác;
- sparse-data workflow tạo value khi audience nhỏ;
- manual Audience Memory là bước đúng cho nhiều học viên;
- phần nào thực sự universal có thể xác định qua pilot.

## 58. Pilot design

### Select 3–5 creators

Đa dạng nhưng không quá rộng:

- một expert ít audience;
- một creator có content nhưng không hệ thống;
- một người có workshop/offer;
- một ngành khác Thông.

### Assign maturity level

L0–L3; không ép xây Level 3.

### Toolkit

- Creator Model Canvas;
- Audience Question Log;
- Profile/Relationship Sheet;
- Content Model Cards;
- Offer Model Canvas;
- Weekly Next Action Review;
- Demand/Workshop Review;
- evidence checklist.

### Support cadence

- baseline interview;
- setup workshop;
- weekly review 4–8 tuần;
- outcome interview;
- case pack.

## 59. Software scope R7

Chỉ những công cụ hỗ trợ export/template/case cho Thông. Pilot có thể dùng:

- Sheets/Notion;
- cloned local template;
- separate minimal tool;
- không production multi-tenant.

Nếu cần isolated pilot database, ADR riêng, no shared PII.

## 60. Metrics

- toolkit completion;
- weekly usage;
- decisions improved;
- content/workshop generated from demand;
- creator time saved;
- audience progression evidence;
- willingness-to-pay;
- support hours;
- feature requests;
- universal vs specific annotations.

## 61. Exit criteria

- ít nhất 3 pilot hoàn thành đủ period;
- có case success và failure;
- xác định capability level phù hợp;
- method transfer manual tạo value;
- biết phần mềm nào thực sự cần;
- data isolation không lỗi;
- economics sơ bộ.

## 62. Deliverables

- Conan Audience Relationship Method v1;
- pilot handbook;
- 3–5 case packs;
- universal model spec update;
- productization recommendation;
- no-go list.

---

# R8 — Productization Decision & Optional Hosted Prototype

## 63. Goal

Ra quyết định bằng evidence:

```text
Không productize
hoặc
Template/self-hosted
hoặc
Implementation Sprint
hoặc
Managed Intelligence
hoặc
Hosted multi-workspace product
```

## 64. Mandatory gate

### Demand/economics

- creator willingness-to-pay;
- support burden;
- implementation time;
- retention need;
- distribution.

### Product repeatability

- workflows lặp lại;
- model fields phổ quát;
- onboarding requirements;
- maturity segmentation.

### Security/privacy

- tenancy isolation;
- data processing agreements;
- creator ownership;
- user consent;
- anonymized benchmarks.

### Architecture

- shared D1 vs per workspace;
- identity;
- custom domain;
- Workers for Platforms or not;
- billing;
- admin/support;
- migration.

## 65. Possible outcomes

### Outcome A — Method only

Include in Conan Maker; no software.

### Outcome B — Productized service

Conan team triển khai cho từng creator, không self-service.

### Outcome C — Hosted pilot

2–5 isolated workspaces, controlled onboarding.

### Outcome D — SaaS

Chỉ nếu economics/architecture rõ.

## 66. Non-goal

Không mặc định SaaS là kết quả “cao nhất”. Managed service có thể phù hợp hơn.

---

# R9 — AI Optimization / SLM Evaluation

## 67. Goal

Dùng AI cho tasks đã ổn định và có labeled data, không dùng AI để che domain chưa rõ.

## 68. Candidate tasks

- normalize/map question;
- cluster demand;
- draft Content Model;
- semantic retrieval;
- evidence summary;
- recommendation explanation;
- content gap analysis;
- creator weekly brief.

## 69. Evaluation gates

- golden set;
- baseline rule/human;
- accuracy/relevance metric;
- failure cost;
- privacy;
- latency/cost;
- model version;
- fallback.

## 70. SLM criteria

Chỉ đánh giá SLM nếu:

- task lặp lại, scope hẹp;
- hàng nghìn labeled examples hoặc đủ quality;
- large model cost/latency là bottleneck;
- on-device/private deployment có giá trị;
- benchmark cho thấy student đạt threshold.

Không huấn luyện SLM chỉ để tạo moat biểu tượng.

---

## 71. Cross-release workstreams

### Security/privacy

Từ R0 xuyên suốt.

### SEO/performance

Mọi public release.

### Cost/limits

Daily/weekly monitoring sau R1.

### Documentation

Update foundation docs và ADR.

### Case study

Hypothesis, baseline, intervention, outcome từng release.

### Data quality

Invariant checks và evidence lineage.

---

## 72. Release quality gates

Mỗi release cần:

- PRD;
- SDD;
- acceptance tests;
- implementation plan;
- Codex task packs;
- security review;
- migration/rollback;
- observability;
- feature flag/rollout;
- documentation update;
- decision log.

---

## 73. Codex task sizing

Một task lý tưởng:

- 0,5–2 ngày developer effort tương đương;
- một vertical outcome;
- file scope rõ;
- test rõ;
- no architecture guessing;
- rollback/revertable.

Ví dụ tốt:

> Implement idempotent reading-session finalize endpoint, D1 migration, validation, tests and outbox event.

Ví dụ xấu:

> Xây toàn bộ Relationship Intelligence.

---

## 74. First 25 Codex tasks sau khi đưa docs vào repo

### R0

1. Locate all AGENTS and map repo.
2. Verify package/build/test commands.
3. Inventory routes and canonical URLs.
4. Audit Cloudflare config/bindings.
5. Inventory content sources/types.
6. Audit auth/analytics/payment/email.
7. Capture SEO/performance baseline.
8. Produce R0 findings.
9. Draft ADR route strategy.
10. Update SAD/Data docs with actual paths.

### R1 planning

11. Create PRD-R1.
12. Create SDD-R1.
13. Create threat model.
14. Create D1 physical schema/migrations plan.
15. Create auth ADR.
16. Create payment ADR.
17. Create email ADR.
18. Create R1 test plan.
19. Break implementation task packs.

### R1 implementation initial

20. Add environment-safe Cloudflare bindings/types.
21. Implement workspace seed/config.
22. Implement canonical user/account foundation.
23. Implement Reader signup/login vertical slice.
24. Implement plan/subscription/entitlement schema.
25. Implement one gated member resource with tests.

Không chạy task 20+ trước khi task 11–19 được duyệt.

---

## 75. Rollout strategy

### Internal

Owner/admin test.

### Friendly cohort

10–30 người tin tưởng, feedback trực tiếp.

### Founding Readers/Members

Cohort nhỏ có expectation rõ.

### Gradual public

Feature flag/audience percentage.

Không launch toàn bộ recommendation/email automation cùng lúc.

---

## 76. Stop conditions

Pause release nếu:

- public SEO/performance bị hại đáng kể;
- privacy concern chưa xử lý;
- evidence invariant fail;
- entitlement error;
- cost/quota không kiểm soát;
- user không hiểu value;
- support burden vượt capacity;
- feature không map hypothesis.

---

## 77. Pivot rules

Được thay chiến thuật:

- pricing;
- onboarding;
- CTA;
- recommendation policy;
- content mix;
- email cadence.

Không đổi toàn bộ product thesis chỉ từ một tuần data. Review theo decision gate với sample/qualitative evidence.

---

## 78. Definition of foundation completion

Bộ foundation hoàn thành khi:

- 13 docs nhất quán;
- R0 audit có thể bắt đầu;
- transferability được chuẩn bị nhưng scope bị khóa;
- Creator/Offer Models có semantics;
- Cloudflare boundaries rõ;
- evidence/state/qualification rõ;
- roadmap có gate.

Nó không có nghĩa hệ thống đã sẵn sàng code toàn bộ.

---

## 79. Immediate next action

```text
1. Copy 13 docs into repository.
2. Add AGENTS.md at repo root.
3. Ask Codex to execute R0 only.
4. Review audit findings.
5. Update foundation docs.
6. Approve PRD-R1.
7. Implement R1 by vertical slices.
```

Prompt đầu tiên cho Codex không nên là “xây Thongphan Read”. Nó phải là:

> Đọc AGENTS.md và các tài liệu R0 bắt buộc. Thực hiện repository/system audit theo CURRENT-SYSTEM-AUDIT.md. Không sửa kiến trúc hoặc triển khai feature. Tạo evidence-backed audit report, route/content inventory, Cloudflare binding map, test/build baseline và danh sách ADR cần quyết định.
