# User Requirements Document — Thongphan Read

**Document ID:** TPREAD-D05
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26

---

## 1. Mục tiêu URD

URD mô tả người dùng cần đạt được điều gì, trong hoàn cảnh nào và hệ thống phải bảo đảm trải nghiệm gì. Nó không quyết định framework, database table hoặc UI component cụ thể.

Requirement ID dùng làm traceability cho PRD, test và implementation.

Priority:

- **P0:** bắt buộc để release tạo giá trị/an toàn.
- **P1:** quan trọng cho trải nghiệm hoàn chỉnh.
- **P2:** nâng cao hoặc release sau.

---

## 2. Personas và actors

### A1 — Anonymous Visitor

Đến từ Facebook, search, email forwarded hoặc link. Muốn đọc ngay, không muốn tạo tài khoản trước.

### A2 — Registered Reader

Thấy nội dung hữu ích, muốn lưu, nhận đề xuất và giữ lịch sử nhưng chưa trả phí.

### A3 — Paid Read Member

Muốn được điều phối việc đọc, theo dõi Active Question, nhận nội dung/member benefit và progression.

### A4 — Thông Phan / Creator Owner

Tạo content, workshop, offer; cần hiểu demand, progression và commercial fit.

### A5 — Content Operator/Editor

Quản trị metadata, content model, publication, freshness và email audience.

### A6 — Relationship/Member Operator

Xem profile/evidence, hỗ trợ member, review recommendation/qualification.

### A7 — Admin/Support

Quản lý account, payment, entitlement, deletion, incident và audit.

### A8 — Conan Transfer Researcher

Vai trò tương lai/owner có nhiệm vụ trích xuất case, phương pháp và pilot. Không có quyền mặc định xem dữ liệu cá nhân vượt nhu cầu.

### A9 — Conan Pilot Creator

Học viên tham gia pilot method transfer. Không phải user của production v1; requirement của họ dùng để chuẩn bị export/template, không kích hoạt multi-tenant scope.

---

## 3. User outcomes cấp cao

| Outcome ID | Outcome |
|---|---|
| O-01 | Visitor đọc public content không bị cản trở |
| O-02 | Reader tạo account và giữ được progress |
| O-03 | Member nhận recommendation có lý do |
| O-04 | Người dùng biết mình đang giải quyết câu hỏi nào |
| O-05 | Việc đọc dẫn tới reflection/action |
| O-06 | Người dùng kiểm soát profile và notification |
| O-07 | Thông biết content/workshop nào cần làm |
| O-08 | Mọi kết luận quan trọng truy vết được |
| O-09 | Handoff sang offer chỉ khi phù hợp |
| O-10 | Hệ thống tạo được case study trung thực |
| O-11 | Phương pháp có thể trích xuất cho học viên mà không lộ dữ liệu |

---

## 4. Public discovery và reading

### URD-PUB-001 — Đọc không cần đăng nhập — P0

Khi visitor mở public article, họ phải đọc được nội dung chính mà không bị login wall ngay lập tức.

Acceptance intent:

- URL ổn định;
- tải nhanh;
- mobile usable;
- title/source/reading time rõ;
- canonical/SEO không bị phá;
- CTA account không che nội dung.

### URD-PUB-002 — Biết bài dành cho ai — P0

Mỗi public article nên cho người đọc biết:

- bài giải quyết câu hỏi gì;
- đọc xong có thể rõ hơn điều gì;
- thời lượng;
- nguồn/bằng chứng nếu cần;
- bước tiếp theo có thể làm.

### URD-PUB-003 — Tìm nội dung theo nhu cầu — P1

Visitor phải có thể tìm theo:

- câu hỏi;
- chủ đề;
- tình trạng;
- content type.

Search không có kết quả phải được ghi như Content Demand signal nếu consent/policy cho phép.

### URD-PUB-004 — Đường vào theo trạng thái — P1

Người chưa biết bắt đầu ở đâu cần một chẩn đoán ngắn, không đòi account trước khi cho kết quả sơ bộ.

### URD-PUB-005 — Cầu nối tạo account — P0

CTA tạo account phải gắn với giá trị cụ thể:

- lưu bài;
- tiếp tục đọc;
- nhận lộ trình;
- theo dõi câu hỏi;
- được báo khi có bài phù hợp.

Không dùng CTA mơ hồ “Đăng ký ngay”.

### URD-PUB-006 — Preview member value — P1

Visitor/Reader phải hiểu member khác public ở selection, sequence, continuity và participation; không chỉ “nhiều bài hơn”.

---

## 5. Identity và account

### URD-ID-001 — Tạo account ít ma sát — P0

Reader có thể tạo account qua phương thức đã audit/duyệt, ưu tiên email magic link hoặc OAuth phù hợp.

### URD-ID-002 — Nối lịch sử anonymous — P1

Sau signup/login, hệ thống nên nối history có đủ bằng chứng từ anonymous identity vào account mà không ghép nhầm.

### URD-ID-003 — Session an toàn — P0

User phải đăng nhập/đăng xuất được; session hết hạn phù hợp; thiết bị dùng chung không tiếp tục nhận identity cũ sau logout.

### URD-ID-004 — Quản lý account — P0

User có thể:

- xem email/account method;
- cập nhật preference;
- yêu cầu export;
- yêu cầu xóa;
- logout all sessions nếu hỗ trợ.

### URD-ID-005 — Không cần profile đầy đủ ngay — P0

Onboarding dùng progressive profiling; không bắt form dài trước khi tạo giá trị.

### URD-ID-006 — Workspace isolation future-proof — P0 technical user requirement

Mọi creator-scoped relationship phải biết thuộc workspace `thongphan`, để sau này export/pilot không trộn dữ liệu.

---

## 6. Membership, payment và entitlement

### URD-MEM-001 — Hiểu quyền lợi trước thanh toán — P0

Plan page phải nêu:

- quyền lợi;
- không bao gồm gì;
- giá/thời hạn;
- cách gia hạn;
- hủy/hoàn tiền;
- email nhận;
- privacy.

### URD-MEM-002 — Thanh toán có trạng thái rõ — P0

Sau checkout, user biết:

- pending;
- thành công;
- thất bại;
- cần thử lại;
- quyền đã kích hoạt chưa.

### URD-MEM-003 — Webhook idempotent — P0

Retry không tạo subscription/entitlement trùng.

### URD-MEM-004 — Quyền truy cập chính xác — P0

Member content/feature chỉ mở khi entitlement hợp lệ. UI ẩn không đủ.

### URD-MEM-005 — Grace period và expiry — P1

Hệ thống có policy rõ khi:

- payment chậm;
- manual transfer;
- hết hạn;
- refund;
- admin grant;
- provider outage.

### URD-MEM-006 — Free Reader vẫn có giá trị — P0

Không biến free account thành màn paywall trống. Free Reader phải được trải nghiệm save/history/trial personalization.

### URD-MEM-007 — Gói năm — P1

Hệ thống nên hỗ trợ plan dài hạn nếu business quyết định, không hardcode chỉ 30 ngày.

### URD-MEM-008 — Cancellation feedback — P1

Khi hủy/hết hạn, user có thể cho biết lý do và giữ account/history theo policy.

---

## 7. Onboarding và Profile

### URD-PRO-001 — Khai goal — P0

Reader có thể chọn hoặc nhập goal hiện tại.

### URD-PRO-002 — Khai Active Question — P0

Member/eligible Reader có thể ghi một câu hỏi chính. Hệ thống không ép họ dùng taxonomy nội bộ.

### URD-PRO-003 — Progressive profiling — P0

Hệ thống hỏi thêm khi có ngữ cảnh, ví dụ sau bài hoặc trước workshop.

### URD-PRO-004 — Xem hệ thống đang hiểu gì — P0

User có một trang hiển thị:

- goal;
- Active Question;
- topics theo dõi;
- bài confirmed;
- đề xuất hiện tại;
- notification preference.

Không hiển thị nhãn thương mại nội bộ.

### URD-PRO-005 — Sửa/xóa profile item — P0

User có thể sửa declared facts và phản hồi inference/recommendation.

### URD-PRO-006 — Phân biệt fact và suggestion — P0

UI không trình bày inference như sự thật. Ví dụ: “Có vẻ…” và cho phép sửa.

### URD-PRO-007 — Multiple goal history — P1

Khi user đổi goal, hệ thống giữ history/audit nhưng recommendation dùng goal active mới.

### URD-PRO-008 — Không suy luận nhạy cảm — P0

Hệ thống không tạo profile tâm lý/nhạy cảm ngoài scope.

---

## 8. Reading Intelligence

### URD-READ-001 — Theo dõi có minh bạch — P0

User được thông báo website ghi nhận reading activity để lưu progress và đề xuất nội dung.

### URD-READ-002 — Active time — P1

Hệ thống chỉ tính active time khi page visible và có điều kiện hợp lý; không coi browser-open time là reading time.

### URD-READ-003 — Section coverage — P1

Hệ thống có thể tổng hợp section được nhìn thấy mà không lưu raw scroll liên tục.

### URD-READ-004 — Mark complete — P0

User có nút xác nhận đã đọc xong.

### URD-READ-005 — Reading state có nhiều mức — P0

Phải phân biệt Opened, Sampled, Engaged, Likely Completed, Confirmed, Reflected, Applied.

### URD-READ-006 — Reflection — P0/P1

Cuối bài có câu hỏi ngắn, có thể chọn:

- đã rõ;
- vẫn chưa rõ;
- muốn biết cách làm;
- không phù hợp;
- nhập câu hỏi tiếp theo.

### URD-READ-007 — Resume — P1

Reader có thể quay lại bài đang dở và biết vị trí gần nhất nếu họ muốn.

### URD-READ-008 — Manual correction — P0

User có thể đánh dấu lại completion hoặc xóa reading record theo policy.

### URD-READ-009 — Không dùng tracking để giám sát — P0

Admin không được xem mouse-by-mouse replay mặc định chỉ để đánh giá cá nhân.

### URD-READ-010 — Progress khác completion — P0

Đọc xong không tự động chuyển progress state nếu thiếu reflection/action evidence.

---

## 9. Recommendation và Next Best Action

### URD-REC-001 — Recommendation có lý do — P0

User nhìn thấy lý do ngắn, ví dụ:

> Vì bạn đang muốn chọn hình thức sản phẩm đầu tiên và đã đọc bài nền về JTBD.

### URD-REC-002 — Không đề xuất bài đã hoàn thành — P0

Trừ khi bài được cập nhật đáng kể hoặc có review purpose rõ.

### URD-REC-003 — Kiểm tra prerequisite — P0

Không đưa content quá cao khi user thiếu nền tảng, trừ khi user tự chọn.

### URD-REC-004 — Không chỉ đề xuất đọc — P0

Next Best Action có thể là reflection, worksheet, workshop, update question hoặc nghỉ.

### URD-REC-005 — Feedback — P0

User có thể chọn:

- phù hợp;
- không phù hợp;
- đã biết;
- chưa đúng lúc;
- muốn chủ đề khác.

### URD-REC-006 — Sparse Data Mode — P0

User mới vẫn nhận được recommendation từ declared goal/question và rule đơn giản.

### URD-REC-007 — Không giả vờ chính xác — P0

Nếu evidence yếu, UI phải nói “gợi ý để bắt đầu”, không nói “đây là bài bạn cần”.

### URD-REC-008 — User có quyền duyệt kho — P1

Personalization không khóa user trong một filter bubble; họ vẫn tìm/browse toàn thư viện có quyền.

### URD-REC-009 — Frequency control — P1

Không đưa quá nhiều Next Best Actions cùng lúc; ưu tiên một bước chính.

---

## 10. Active Question và Content Request

### URD-Q-001 — Một câu hỏi chính — P0

Member có thể chọn một Active Question; giới hạn giúp focus.

### URD-Q-002 — Đổi câu hỏi — P0

User có thể đóng/cập nhật Active Question và nêu lý do.

### URD-Q-003 — Kiểm tra content hiện có — P0

Trước khi tạo request mới, hệ thống tìm content hiện có phù hợp.

### URD-Q-004 — Gửi Content Request — P0

Nếu chưa có câu trả lời đủ, user có thể gửi request.

### URD-Q-005 — Không hứa viết riêng — P0

UI nói rõ request được tổng hợp để định hướng content/workshop; không bảo đảm một bài riêng.

### URD-Q-006 — Trạng thái request — P1

User biết request đang:

- được ghi nhận;
- có content hiện hữu;
- đã gom vào cluster;
- đang được lên kế hoạch;
- đã có bài/workshop mới.

### URD-Q-007 — Thông báo khi giải quyết — P0

User yêu cầu trực tiếp được ưu tiên notification khi content phù hợp xuất bản.

---

## 11. Email và notification

### URD-NOT-001 — Opt-in rõ — P0

User chọn chủ đề, tần suất và loại email.

### URD-NOT-002 — Email transactional — P0

Account/payment/security email phải đáng tin, không trộn quảng cáo không liên quan.

### URD-NOT-003 — Personalized digest — P1

Member có thể nhận digest theo profile và content mới.

### URD-NOT-004 — Immediate requested-content email — P0

Khi bài giải quyết request trực tiếp, gửi email riêng có context câu hỏi.

### URD-NOT-005 — Frequency cap — P0

Không gửi nhiều bài liên tiếp khi user còn backlog hoặc đã chọn weekly digest.

### URD-NOT-006 — In-app notification center — P1

User thấy bài mới, bài dở, workshop và request status trong workspace.

### URD-NOT-007 — Unsubscribe và preference — P0

User quản lý preference mà không phải xóa account.

### URD-NOT-008 — Không dùng open làm proof mạnh — P0

Email open chỉ là telemetry yếu; click + reading session mạnh hơn.

---

## 12. Editorial Demand và content operations

### URD-ED-001 — Tổng hợp câu hỏi — P0

Creator xem question clusters theo số người, freshness và evidence.

### URD-ED-002 — Content gap — P0

Hệ thống chỉ ra:

- đã có bài đủ;
- có bài nhưng thiếu case/asset;
- cần cập nhật;
- chưa có nội dung.

### URD-ED-003 — Đề xuất loại intervention — P1

Không phải mọi demand dẫn tới longform. Có thể đề xuất:

- redistribute;
- update;
- short note;
- longform;
- worksheet;
- workshop;
- FAQ.

### URD-ED-004 — Audience to notify — P0

Khi publish, creator thấy nhóm user phù hợp và bằng chứng inclusion/exclusion.

### URD-ED-005 — Content Model editing — P0

Editor có thể tạo, duyệt, version và audit metadata.

### URD-ED-006 — Freshness review — P1

Content lỗi thời được cảnh báo và không recommendation mặc định.

### URD-ED-007 — Demand không chỉ là volume — P0

Score phải xét strategic fit, urgency, gap và workshop fit.

### URD-ED-008 — Case study tagging — P1

Creator đánh dấu content/intervention thuộc hypothesis nào để thu case evidence.

---

## 13. Workshop Loop

### URD-WS-001 — Workshop Model — P0

Mỗi workshop có question, target state, prerequisite, outcome và asset.

### URD-WS-002 — Personalized invitation — P1

Chỉ mời người phù hợp hoặc đã chọn nhận workshop notice.

### URD-WS-003 — Pre-reading — P1

Người tham dự được đề xuất bài chuẩn bị nếu cần.

### URD-WS-004 — Attendance không đồng nghĩa progress — P0

Hệ thống phân biệt đăng ký, tham dự, output và outcome.

### URD-WS-005 — Capture questions — P0

Câu hỏi trong workshop đi vào demand pipeline có source.

### URD-WS-006 — Post-workshop Next Action — P0

Người tham dự nhận một bước phù hợp, không tự động sales pitch.

### URD-WS-007 — Workshop recommendation report — P1

Hàng tuần creator nhận đề xuất chủ đề workshop với evidence.

---

## 14. Offer và commercial qualification

### URD-OFF-001 — Offer Model bắt buộc — P0

Mỗi offer sâu phải có audience, problem, fit, non-fit, readiness và prerequisite.

### URD-OFF-002 — Qualification theo offer — P0

Không có global qualified state.

### URD-OFF-003 — F–P–I–A evidence — P0

Product Qualified yêu cầu đủ nhóm evidence theo policy.

### URD-OFF-004 — Human review Sales Ready — P0

Không tự động gửi sales outreach chỉ từ AI/rule.

### URD-OFF-005 — User-centered handoff — P0

Offer được trình bày như lựa chọn giải quyết bước tiếp theo, có quyền từ chối.

### URD-OFF-006 — Non-fit protection — P0

Hệ thống phải có khả năng không đề xuất offer khi không phù hợp.

### URD-OFF-007 — Outcome logging — P1

Handoff outcome được ghi để cải thiện policy.

---

## 15. Admin và explainability

### URD-ADM-001 — User 360 có giới hạn — P0

Admin xem:

- declared profile;
- progress;
- content history summary;
- questions;
- recommendations;
- evidence chain;
- membership;
- notification.

Không hiển thị raw surveillance data không cần thiết.

### URD-ADM-002 — Evidence Inspector — P0

Admin mở inference/decision và đi ngược về evidence.

### URD-ADM-003 — Human override — P0

Override có reason, actor, timestamp và không xóa history.

### URD-ADM-004 — Content Admin — P0

Quản lý article version, models, access, freshness và publication.

### URD-ADM-005 — Offer Admin — P1

Quản lý Offer Model và qualification policy.

### URD-ADM-006 — Editorial Dashboard — P1

Demand, gap, recommendation và content outcome.

### URD-ADM-007 — Membership Support — P0

Tra cứu payment/entitlement và xử lý grant/revoke theo quyền.

### URD-ADM-008 — Audit log — P0

Mọi thay đổi admin quan trọng có audit.

### URD-ADM-009 — Case Study Dashboard — P1

Xem hypothesis, cohort, intervention, outcome và limitation.

---

## 16. Analytics và dashboard

### URD-AN-001 — Growth view — P0/P1

Traffic, source, article entry, registration, paid conversion.

### URD-AN-002 — Reading/Progress view — P0

Opened, engaged, confirmed, reflected, applied và WPR.

### URD-AN-003 — Editorial view — P1

Question demand, gap, content effectiveness, workshop demand.

### URD-AN-004 — Member/Offer view — P1

Activation, retention, qualification theo offer, handoff outcome.

### URD-AN-005 — Trust/Data quality view — P0

Inference without evidence, expired inference, profile correction, recommendation mismatch.

### URD-AN-006 — Cost/Quota view — P1

Cloudflare/provider usage và threshold.

### URD-AN-007 — Metric definitions — P0

Mỗi metric có source, formula, window và limitation.

---

## 17. Privacy, trust và accessibility

### URD-TRUST-001 — Data purpose — P0

User hiểu dữ liệu dùng để lưu progress và đề xuất.

### URD-TRUST-002 — Data minimization — P0

Chỉ thu event cần thiết.

### URD-TRUST-003 — Export/delete — P0

User yêu cầu export/xóa theo policy.

### URD-TRUST-004 — No sensitive profiling — P0

Cấm baseline.

### URD-TRUST-005 — No cross-workspace leakage — P0

Dữ liệu Thông không trộn với pilot creator.

### URD-TRUST-006 — Accessible reading — P0

Keyboard, contrast, font size, semantic heading, screen reader và reduced motion.

### URD-TRUST-007 — Mobile first — P0

Reading và account flows hoạt động tốt trên mobile.

### URD-TRUST-008 — User feedback channel — P1

Báo lỗi, recommendation sai và content issue.

---

## 18. Case study và Conan transfer requirements

### URD-CS-001 — Hypothesis mapping — P0/P1

Mỗi experiment/release có hypothesis và metric.

### URD-CS-002 — Baseline vs after — P1

Case pack có baseline, intervention và outcome window.

### URD-CS-003 — Failure capture — P0

Hệ thống cho phép ghi thất bại/limitation, không chỉ success.

### URD-CS-004 — Anonymized export — P1

Có thể export case data không chứa PII để dùng đào tạo.

### URD-CS-005 — Universal vs specific annotation — P1

Creator đánh dấu rule/workflow nào phổ quát, rule nào riêng Thông.

### URD-CS-006 — Manual pilot toolkit — P1, R7

Sinh template cho creator pilot:

- Creator Model;
- audience/question log;
- Content Model;
- Offer Model;
- Next Action review;
- weekly demand report.

### URD-CS-007 — No automatic multi-tenant scope — P0

Không yêu cầu pilot creator tự onboard vào production app trước Productization Gate.

---

## 19. Non-functional requirements

### NFR-01 — Performance — P0

Public static content không được phụ thuộc API personalization để render nội dung chính.

### NFR-02 — Availability — P0

AI/email/queue lỗi không làm public library sập.

### NFR-03 — Security — P0

Authentication, authorization, signature, validation, secret management và audit.

### NFR-04 — Explainability — P0

Commercial/profile/recommendation decision truy vết được.

### NFR-05 — Scalability — P1

Thiết kế đủ cho personal product scale hợp lý; không over-engineer enterprise.

### NFR-06 — Cost — P0

Free-first có threshold và upgrade path.

### NFR-07 — Maintainability — P0

Domain logic testable; provider adapter; migrations; documentation.

### NFR-08 — Portability — P1

Core model không phụ thuộc UI/provider, phục vụ transfer/export.

### NFR-09 — Observability — P0

Trace, error, queue, webhook, quota và invariant metric.

### NFR-10 — Data integrity — P0

Idempotency, unique constraints, evidence lineage và audit.

---

## 20. Representative acceptance scenarios

### Scenario A — Public to Reader

**Given** Lan đọc một bài public và muốn lưu
**When** Lan tạo account
**Then** bài được lưu, lịch sử anonymous đủ tin cậy được nối, và Lan nhận một recommendation trial có lý do.

### Scenario B — Reading completion

**Given** Lan mở bài và cuộn nhanh xuống cuối
**When** session kết thúc
**Then** hệ thống không ghi Confirmed Completed; chỉ tạo state phù hợp với evidence.

### Scenario C — Active Question

**Given** Lan khai “Nên bắt đầu bằng dịch vụ hay khóa học?”
**When** kho có bài phù hợp
**Then** bài được recommendation và content request mới không bị tạo trùng.

### Scenario D — Content gap

**Given** nhiều member có câu hỏi tương tự và kho chưa đủ
**When** weekly editorial job chạy
**Then** dashboard tạo gap có evidence, không tự publish nội dung.

### Scenario E — New article notification

**Given** bài mới giải quyết đúng request của Lan
**When** editor publish và duyệt audience
**Then** Lan nhận email contextual, còn người chỉ match yếu không nhận immediate email.

### Scenario F — Qualification

**Given** Minh đọc nhiều bài nhưng chưa khai problem hoặc hành động
**When** qualification policy chạy
**Then** Minh không được Product Qualified chỉ vì engagement.

### Scenario G — Offer handoff

**Given** Minh có F–P–I–A đủ cho Conan Maker
**When** operator review
**Then** hệ thống đề xuất handoff, hiển thị evidence và operator quyết định.

### Scenario H — Profile correction

**Given** hệ thống suy luận Lan đang ở giai đoạn chọn offer
**When** Lan nói đã chọn xong và đang cần traffic
**Then** inference cũ được supersede, history giữ lại và recommendation cập nhật.

### Scenario I — Provider failure

**Given** email provider lỗi
**When** bài publish
**Then** article vẫn live, notification job retry, admin thấy failure và không gửi trùng.

### Scenario J — Conan pilot

**Given** một học viên tham gia transfer pilot
**When** phương pháp được áp dụng
**Then** họ dùng toolkit/export riêng; production data của Thông không bị lộ và không cần multi-tenant feature.

---

## 21. Requirement traceability convention

PRD/SDD/Test phải tham chiếu ID, ví dụ:

```text
PRD-R2-F03 satisfies URD-READ-004, URD-READ-005
TEST-R2-E2E-007 verifies URD-READ-004
```

Requirement thay đổi semantics phải tăng version và cập nhật State/Domain docs nếu cần.
