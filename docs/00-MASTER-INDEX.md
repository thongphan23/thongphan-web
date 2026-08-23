# 00 — Master Index: Thongphan Read Foundation v2

**Document ID:** TPREAD-D01
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26
**Primary owner:** Thông Phan

---

## 1. Mục đích

Master Index là bản đồ điều hướng, sổ đăng ký phiên bản và hệ thống thẩm quyền của bộ tài liệu Thongphan Read. Nó giúp Thông Phan, Codex và người review biết:

- tài liệu nào đang tồn tại;
- tài liệu nào là nguồn sự thật cho loại quyết định nào;
- phải đọc gì trước khi thực hiện một task;
- tài liệu phụ thuộc vào tài liệu nào;
- quyết định nào đã khóa;
- điểm nào vẫn cần audit repository;
- phạm vi nâng cấp từ v1 sang v2;
- khi nào có thể chuyển từ reference implementation sang phương pháp cho Conan Maker.

---

## 2. Tuyên bố phiên bản v2

Phiên bản 2 nâng cấp hướng tiếp cận theo nguyên tắc:

> Thongphan Read trước hết là sản phẩm thật và hệ thống vận hành audience của cá nhân Thông Phan. Đồng thời, nó được thiết kế như reference implementation và phòng R&D để sau này trích xuất thành phương pháp, template, implementation sprint hoặc hosted system cho học viên Conan Maker.

Điều này **không** có nghĩa v2 là SaaS đa tenant. V2 bổ sung khả năng chuyển giao ở cấp domain và dữ liệu, đồng thời khóa chặt việc productize quá sớm.

### Những thay đổi lớn so với v1

1. Bổ sung **Creator Model**.
2. Bổ sung **Offer Model**.
3. Đưa `workspace_id` vào domain creator-scoped.
4. Định nghĩa **single-workspace reference implementation**.
5. Thêm **Sparse Data Mode** và **Rich Data Mode**.
6. Thêm **Creator Capability Maturity Model** cho việc chuyển giao.
7. Thêm **Case Study Evidence Pack**.
8. Thêm Productization Gate trước multi-tenancy.
9. Thêm pilot chuyển giao thủ công cho Conan Maker trước SaaS.
10. Tách “method transfer” khỏi “software transfer”.
11. Giữ mục tiêu kinh tế cá nhân và mục tiêu R&D trong cùng một flywheel.
12. Tăng yêu cầu chống cross-workspace leakage và sử dụng dữ liệu xuyên creator.

---

## 3. Danh sách chính thức 13 tài liệu

| # | Document ID | File | Vai trò | Mức độ |
|---:|---|---|---|---|
| 1 | TPREAD-D00 | `/AGENTS.md` | Hiến pháp cho Codex và repository | P0 — blocking |
| 2 | TPREAD-D01 | `/docs/00-MASTER-INDEX.md` | Điều hướng, thẩm quyền, trạng thái tài liệu | P0 |
| 3 | TPREAD-D02 | `/docs/01-GLOSSARY.md` | Ngôn ngữ chuẩn xuyên hệ thống | P0 |
| 4 | TPREAD-D03 | `/docs/discovery/CURRENT-SYSTEM-AUDIT.md` | Baseline và checklist audit code thực tế | P0 |
| 5 | TPREAD-D04 | `/docs/product/PRODUCT-CHARTER.md` | Lý do tồn tại, sản phẩm, chiến lược | P0 |
| 6 | TPREAD-D05 | `/docs/product/URD.md` | Yêu cầu người dùng và acceptance intent | P0 |
| 7 | TPREAD-D06 | `/docs/product/STATE-TRANSITION-AND-QUALIFICATION-MODEL.md` | Trạng thái, progress, qualification | P0 |
| 8 | TPREAD-D07 | `/docs/domain/DOMAIN-MODEL-AND-RELATIONSHIP-GRAPH.md` | Entity, boundary và graph semantics | P0 |
| 9 | TPREAD-D08 | `/docs/domain/CONTENT-MODEL-SPEC.md` | Creator Model, Content Model và Offer Model | P0 |
| 10 | TPREAD-D09 | `/docs/domain/PROFILE-MODEL-AND-EVIDENCE-LEDGER.md` | Profile, evidence, inference, case study | P0 |
| 11 | TPREAD-D10 | `/docs/architecture/SAD-CLOUDFLARE-FIRST.md` | Kiến trúc hệ thống Cloudflare-first | P0 |
| 12 | TPREAD-D11 | `/docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md` | Schema, event, retention, lineage | P0 |
| 13 | TPREAD-D12 | `/docs/roadmap/MASTER-RELEASE-ROADMAP.md` | Thứ tự release, gate và Codex execution | P0 |

R0 evidence artifact (không làm thay đổi bộ 13 foundation documents):

- `/docs/discovery/R0-AUDIT-REPORT.md` — repository/system audit tại commit `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`, gồm route/content/Cloudflare inventory, command outputs, risks, ADR đề xuất và owner decision gates.

R0.1 planning artifacts (không làm thay đổi bộ 13 foundation documents và chưa cho
phép implementation/production cutover):

- `/docs/superpowers/specs/2026-07-26-r0-1-security-remediation-design.md` — thiết kế đã sửa, tách R0.1A, R0.1B và R0.H1.
- `/docs/superpowers/plans/2026-07-26-r0-1-security-remediation.md` — kế hoạch R0.1A Local Security Remediation; source/local tests/dry-runs/implementation PR only.
- `/docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md` — kế hoạch R0.1B Owner-Gated Production Cutover; chỉ chạy bằng prompt riêng sau khi R0.1A được review và merge vào clean `main`.
- `/docs/security/R0-1-OWNER-ACTION-CHECKLIST.md` — checklist approval, credential, branch, clean-SHA và production gates của chủ dự án.
- R0.H1 Public History Remediation là backlog phá hủy lịch sử, cần approval riêng, không chặn R0.1A/R0.1B/R0.2/PRD-R1 sau khi credential rotation và current-tree controls đã pass.

Data Platform migration artifact (không thay đổi bộ 13 foundation documents):

- `/docs/migration/AUDIENCE_DATA_PLATFORM_CUTOVER.md` — inventory, ownership,
  additive schema, acceptance, rollback and stop conditions for the bounded
  `thongphan.com/api/signup` strangler slice. Its current authority is local
  implementation only; it does not authorize a production mutation or deploy.

---

## 4. Thẩm quyền theo loại quyết định

| Loại quyết định | Nguồn sự thật đầu tiên | Nguồn bổ trợ |
|---|---|---|
| Product purpose | Product Charter | URD, State Model |
| User problem | URD | Product Charter |
| Terminology | Glossary | Domain Model |
| State semantics | State Transition Model | Profile/Evidence |
| Creator/Content/Offer semantics | Content Model Spec | Product Charter, Domain Model |
| Profile và inference | Profile/Evidence | State Model, Data/Event |
| Entity và relationship | Domain Model | Data/Event |
| Cloudflare service choice | SAD | Data/Event, Audit |
| Database/event contract | Data/Event Architecture | Domain Model |
| Release order | Master Roadmap | Product Charter |
| Codex behavior | AGENTS.md | Task-specific docs |
| Hiện trạng repository | Current System Audit sau khi hoàn tất | Code và CI |

---

## 5. Dependency graph

```text
AGENTS.md
  ├── Master Index
  ├── Glossary
  └── Current System Audit
          ↓
    Product Charter
          ↓
          URD
          ↓
 State Transition Model
          ↓
 Domain Model & Relationship Graph
       ↙          ↘
Content/Creator/Offer   Profile/Evidence
       ↘          ↙
     Data & Event Architecture
              ↓
     SAD Cloudflare-first
              ↓
     Master Release Roadmap
              ↓
PRD → SDD → Test Plan → Implementation Plan → Codex Task Pack
```

Trong thực tế SAD và Data/Event được phát triển lặp lại với nhau. Graph trên thể hiện thẩm quyền ý nghĩa, không phải quy trình viết tuyến tính tuyệt đối.

---

## 6. Các quyết định nền đã khóa

### 6.1. Product

- Thongphan Read là personalized reading and relationship system, không phải paywalled blog đơn giản.
- Public content tiếp tục là kênh acquisition và trust.
- Gói trả phí bán selection, sequence, continuity, progress và quyền ảnh hưởng editorial roadmap.
- Email là kênh kết nối chính; in-app notification là bộ nhớ; push là optional.
- Không tối ưu mọi reader thành buyer.
- North Star là progressed reader, không phải pageview.

### 6.2. Transferability

- Bản đầu là single creator: Thông Phan.
- Hệ thống phải chuẩn bị `workspace_id`, Creator Model và Offer Model.
- Chuyển giao phương pháp trước, phần mềm sau.
- Conan Maker pilot phải bắt đầu bằng template/manual workflow.
- Chưa xây multi-tenant, white-label hoặc hosted creator platform trong MVP.
- Chỉ productize khi có case study của Thông và pilot 3–5 học viên.

### 6.3. Data và trust

- D1 là operational source of truth.
- Fact và inference là hai lớp khác nhau.
- Mọi inference có evidence lineage.
- Không dùng behavioral surveillance để suy luận tâm lý.
- Không dùng một lead score duy nhất.
- Qualification gắn với một offer cụ thể.
- Reading completion không thể suy ra từ time-on-page duy nhất.

### 6.4. Cloudflare

- Public content static-first.
- Workers cho business API.
- D1 cho dữ liệu nghiệp vụ.
- R2 cho object/payload lớn.
- KV cho cache/config.
- Queues/Cron cho background jobs.
- Analytics Engine/Web Analytics cho metric, không thay operational state.
- External adapter cho email/payment nếu Cloudflare Free không đáp ứng.

### 6.5. Route

Baseline thiết kế:

```text
/library = public library và canonical article URLs
/read    = account, personal reading workspace, recommendations, member surfaces
```

Việc thay đổi baseline chỉ được thực hiện qua ADR và Migration–SEO plan sau audit repository.

---

## 7. Trạng thái xác minh R0

Các điểm framework/package manager/repository/deployment/content/auth/analytics/payment/email/routes/test/CI/Cloudflare bindings/SEO/content inventory đã được audit ngày 2026-07-26. Nguồn bằng chứng:

- `docs/discovery/R0-AUDIT-REPORT.md` — full evidence và command outputs;
- `docs/discovery/CURRENT-SYSTEM-AUDIT.md` — current-state snapshot;
- `docs/architecture/SAD-CLOUDFLARE-FIRST.md` — actual topology so với target;
- `docs/architecture/DATA-AND-EVENT-ARCHITECTURE.md` — actual data sources/schema/flows so với target.

Những điểm còn `Unknown` sau R0 là owner/provider/field-data decisions, không phải repository unknown: provider auth/payment/email/analytics được chọn, privacy/retention policy, field Core Web Vitals/traffic 28 ngày, dependency vulnerability verdict và ownership của existing AI routes.

---

## 8. Tài liệu sẽ được tạo sau bộ foundation

Bộ 13 tài liệu không thay thế các tài liệu implementation theo release. Sau R0, cần tạo just-in-time:

```text
/docs/adr/ADR-xxx-*.md
/docs/releases/R1/PRD-R1.md
/docs/releases/R1/SDD-R1.md
/docs/releases/R1/TEST-PLAN-R1.md
/docs/releases/R1/IMPLEMENTATION-PLAN-R1.md
/docs/releases/R1/tasks/TPREAD-R1-T001.md
...
```

Các tài liệu quan trọng khác:

- Security & Privacy Threat Model.
- Notification & Lifecycle Spec.
- Reading Intelligence Detailed Spec.
- Recommendation & Next Best Action Policy.
- Editorial Demand & Workshop Loop Spec.
- Metrics & Dashboard Spec.
- Migration–SEO–Rollback Plan.
- Operations Runbook.
- Conan Transfer Pilot Handbook.
- Case Study Publication Template.

Không viết tất cả trước R0. Chỉ tạo khi release chuẩn bị triển khai.

---

## 9. Cách Codex sử dụng bộ tài liệu

### 9.1. Trước một task

Codex phải:

1. đọc `AGENTS.md`;
2. đọc task pack;
3. mở Master Index để xác định nguồn sự thật;
4. đọc docs bắt buộc theo bảng trong `AGENTS.md`;
5. kiểm tra repository và `git status`;
6. xác nhận scope và non-goals;
7. chạy baseline test nếu task có code.

### 9.2. Trong task

- không tự mở rộng phạm vi;
- ghi lại assumption;
- cập nhật test cùng code;
- không thay domain semantics trong route handler;
- tạo ADR nếu có thay đổi kiến trúc;
- giữ traceability requirement → implementation → test.

### 9.3. Sau task

Codex phải báo:

- outcome;
- file thay đổi;
- test đã chạy;
- output;
- migration;
- docs cập nhật;
- rủi ro;
- bước tiếp theo nhưng không tự thực hiện ngoài scope.

---

## 10. Review cadence của tài liệu

| Thời điểm | Việc cần làm |
|---|---|
| Trước R0 | Duyệt Product Charter, state semantics, route baseline |
| Sau R0 | Cập nhật Audit, SAD, Data/Event với code thực tế |
| Trước mỗi release | Tạo PRD/SDD/Test/Implementation Plan |
| Sau mỗi release | Ghi metric baseline, decision log, learning |
| Mỗi tháng | Review Cloudflare limits, provider costs, privacy |
| Sau 90 ngày | Review product evidence và case-study viability |
| Trước Conan pilot | Tách universal method khỏi Thông-specific workflow |
| Trước multi-tenant | Productization Gate bắt buộc |

---

## 11. Productization Gate tóm tắt

Không được bắt đầu hosted multi-creator product nếu thiếu một trong các nhóm bằng chứng sau:

### Case của Thông

- có reader đăng ký;
- có member trả phí hoặc commitment thật;
- có retention/return signal;
- recommendation tạo progression;
- editorial loop tạo content đúng hơn;
- có commercial handoff có bằng chứng.

### Transfer pilot

- ít nhất 3–5 học viên ngành khác nhau;
- workflow manual/template đã dùng được;
- xác định phần phổ quát và phần riêng;
- sparse-data mode có ích;
- có willingness-to-pay hoặc rõ delivery economics.

### Kỹ thuật

- workspace boundary rõ;
- no cross-workspace leakage;
- admin/support model rõ;
- cost model;
- migration model;
- hosted vs self-hosted decision;
- support burden được ước lượng.

Nếu gate chưa đạt, roadmap tiếp tục tập trung vào reference implementation và method transfer.

---

## 12. Quick reading map

### Anh Thông muốn duyệt chiến lược

Đọc:

1. Product Charter.
2. State Transition Model.
3. Master Roadmap.
4. Creator/Content/Offer Model.

### Codex chuẩn bị audit

Đọc:

1. AGENTS.
2. Current System Audit.
3. SAD.
4. Data/Event.
5. Roadmap R0.

### Codex xây Profile/Recommendation

Đọc:

1. URD.
2. State Model.
3. Domain Model.
4. Creator/Content/Offer Model.
5. Profile/Evidence.
6. Data/Event.

### Chuẩn bị chuyển giao Conan Maker

Đọc:

1. Product Charter — Transferability thesis.
2. Creator Capability Maturity Model trong State doc.
3. Creator/Offer Model.
4. Case Study Evidence Pack trong Profile/Evidence.
5. R7–R8 trong Roadmap.

---

## 13. Trạng thái phê duyệt

Bộ tài liệu v2 được coi là **foundation approved để bắt đầu R0 audit**, không phải approval để Codex lập tức xây toàn bộ hệ thống.

Decision gate đầu tiên:

```text
Duyệt Product Charter + State Model
→ đưa docs vào repository
→ chạy R0 audit
→ cập nhật docs bằng bằng chứng code
→ tạo PRD-R1
```
