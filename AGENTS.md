# AGENTS.md — Thongphan Read

**Document ID:** TPREAD-D00
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26
**Primary owner:** Thông Phan
**Applies to:** toàn bộ repository và mọi tác vụ Codex liên quan tới Thongphan Read

---

## 1. Mục đích của tài liệu

Tài liệu này là bộ quy tắc cấp cao nhất dành cho Codex và mọi agent phần mềm làm việc trong repository Thongphan Read. Nó phải được đọc trước khi phân tích, thay đổi, tạo mới hoặc xóa bất kỳ mã nguồn, migration, cấu hình hạ tầng, dữ liệu mẫu, test hay tài liệu nào.

Thongphan Read có hai vai trò liên kết nhưng không được trộn lẫn:

1. **Sản phẩm thật dành cho độc giả của Thông Phan**, chạy trên nền `thongphan.com`, giúp người đọc tìm đúng nội dung, đọc có tiến trình, đặt câu hỏi, nhận đề xuất và dần trở thành người có quan hệ sâu hơn với hệ sinh thái của Thông Phan.
2. **Reference implementation và case study sống cho Conan Maker**, dùng để quan sát, kiểm nghiệm và sau đó chuyển giao phương pháp cho người làm chuyên môn. Việc chuyển giao ban đầu là phương pháp, template và quy trình; không mặc định là một SaaS đa tenant.

Mọi quyết định kỹ thuật phải ưu tiên vai trò thứ nhất. Vai trò thứ hai tạo yêu cầu về khả năng trừu tượng hóa và truy vết, nhưng không được dùng làm lý do mở rộng phạm vi sớm.

---

## 2. Product doctrine bắt buộc

### 2.1. Sản phẩm không phải là một kho bài trả phí

Giá trị chính không phải “nhiều bài hơn”. Giá trị là:

- nhớ người đọc đang cố giải quyết điều gì;
- biết họ đã tiêu thụ và xác nhận điều gì;
- đề xuất nội dung hoặc hành động tiếp theo có lý do;
- ghi lại bằng chứng của tiến bộ;
- phát hiện khoảng trống nội dung;
- giữ kết nối thông qua email và trải nghiệm first-party;
- xác định khi nào một người có thể phù hợp với một offer sâu hơn.

### 2.2. Mục tiêu không phải ép mọi người mua

Hệ thống phải tối ưu cho **state progression**, không tối ưu mù quáng cho conversion. Một bước tốt hơn có thể là:

- hiểu rõ vấn đề;
- đọc một bài nền;
- dừng đọc và làm worksheet;
- đặt lại câu hỏi;
- tham dự workshop;
- nhận ra sản phẩm không phù hợp;
- trở thành độc giả trung thành;
- trở thành khách hàng tiềm năng của một offer cụ thể.

### 2.3. Mọi suy luận phải có bằng chứng

Không được ghi nhận một inference, recommendation hoặc qualification mà không lưu được:

- bằng chứng đầu vào;
- nguồn và thời điểm bằng chứng;
- rule/model và phiên bản;
- confidence;
- ngày tạo và ngày hết hạn;
- khả năng human override;
- outcome sau quyết định nếu có.

### 2.4. Transferability-first, không SaaS-first

Kiến trúc domain phải đủ rõ để sau này chuyển giao cho học viên, nhưng implementation hiện tại là **single-creator, single-workspace**.

Bản đầu phải dùng workspace chuẩn:

```text
workspace_id = "thongphan"
creator_id   = "thong_phan"
```

Các entity mang tính creator-scoped nên có `workspace_id`, nhưng không được xây đầy đủ:

- cross-workspace UI;
- tenant billing;
- custom domain self-service;
- white-label;
- marketplace;
- cross-tenant analytics;
- Workers for Platforms;
- quyền team phức tạp.

Những thứ trên chỉ được mở sau Productization Gate được mô tả trong Roadmap.

---

## 3. Thứ tự thẩm quyền tài liệu

Khi có xung đột, áp dụng theo thứ tự:

1. Chỉ dẫn trực tiếp mới nhất của Thông Phan.
2. `AGENTS.md` trong scope gần nhất.
3. ADR đã được duyệt.
4. Product Charter và State Transition Model.
5. SAD, Domain Model, Data/Event Architecture.
6. Model specifications.
7. PRD của release hiện tại.
8. SDD của release hiện tại.
9. Test & Acceptance Plan.
10. Implementation Plan và Codex Task Pack.
11. Code comment.
12. Hành vi hiện tại của code nếu không có tài liệu nào khác.

Nếu phát hiện xung đột chưa thể giải quyết, Codex phải:

- dừng thay đổi phần bị ảnh hưởng;
- ghi rõ tài liệu nào xung đột;
- đề xuất lựa chọn và hệ quả;
- không tự chọn một phương án kiến trúc lớn chỉ để tiếp tục task.

---

## 4. Quy tắc repository và audit

### 4.1. Không giả định stack hiện tại

Trước khi sửa code, phải kiểm tra thực tế:

- framework;
- package manager;
- monorepo hay single app;
- build command;
- deploy command;
- Cloudflare config;
- route hiện có;
- CMS/content source;
- auth;
- analytics;
- test;
- migration;
- CI;
- secrets.

Nếu repository chưa được audit theo `CURRENT-SYSTEM-AUDIT.md`, task đầu tiên phải là audit, không phải rewrite.

### 4.2. Không big-bang rewrite

Không được thay toàn bộ framework, CMS, route hoặc hạ tầng chỉ vì một kiến trúc mới “sạch hơn”. Ưu tiên:

- strangler pattern;
- vertical slice;
- migration có rollback;
- giữ URL public;
- feature flag;
- incremental schema.

### 4.3. Giữ ổn định public library

Baseline route:

```text
/library = thư viện public và canonical content surface
/read    = personalized reading workspace, account, recommendations và member experience
```

Không nhân đôi cùng một bài ở cả `/library/article-x` và `/read/article-x` nếu không có canonical/redirect rõ ràng. Mọi thay đổi URL phải có Migration–SEO–Rollback plan riêng.

---

## 5. Cloudflare-first architecture rules

### 5.1. Dịch vụ mặc định

- **Workers Static Assets hoặc Pages static:** public HTML/CSS/JS và nội dung có thể cache.
- **Workers:** API, auth boundary, entitlement, business rules.
- **D1:** operational source of truth.
- **R2:** object, export, evidence payload lớn, file.
- **KV:** cache và config đọc nhiều, không làm database.
- **Queues:** background event xử lý bất đồng bộ.
- **Cron Triggers:** job định kỳ nhỏ và rõ.
- **Analytics Engine:** metric/product event dạng aggregate.
- **Cloudflare Web Analytics:** traffic tổng quan và web performance.
- **Turnstile:** public form và luồng có nguy cơ abuse.
- **Workers AI/AI Gateway:** chỉ sau khi có evaluation và cost guardrail.

### 5.2. Static-first

Public article phải được phục vụ bằng static asset hoặc cacheable response khi có thể. Không query D1 chỉ để render cùng một nội dung cho tất cả visitor.

### 5.3. D1 là nguồn sự thật nghiệp vụ

D1 giữ:

- user/account;
- subscription và entitlement;
- article metadata và version;
- model state;
- evidence index;
- fact/inference/decision;
- reading summary;
- recommendation;
- workshop;
- notification state;
- audit log.

Không dùng KV, Analytics Engine, email provider hoặc PostHog làm source of truth cho các trạng thái trên.

### 5.4. Không lưu raw behavior vô hạn trong D1

Không lưu từng:

- pixel scroll;
- mouse move;
- heartbeat mỗi giây;
- intersection callback;
- visibility change.

Client phải tổng hợp một `ReadingSessionSummary` có giới hạn. Raw telemetry chỉ được sampling vào R2 hoặc công cụ analytics khi có mục đích debug rõ ràng và consent phù hợp.

### 5.5. Queue message phải coarse-grained

Không tạo một queue message cho mỗi scroll event. Queue message nên đại diện cho:

- reading session finalized;
- profile recomputation requested;
- recommendation recomputation requested;
- notification dispatch requested;
- content demand aggregation requested;
- qualification review requested.

### 5.6. Free-first guardrail

Không tối ưu theo giả định free tier là vô hạn. Mỗi integration phải có:

- expected usage;
- warning threshold;
- hard threshold;
- failure behavior;
- upgrade trigger;
- fallback.

Cloudflare limits thay đổi theo thời gian. Mọi con số trong docs phải được xác minh với official docs trước release.

### 5.7. Không dùng Cloudflare Access làm consumer auth mặc định

Cloudflare Access phù hợp với admin/internal app. Reader/member auth phải có UX phù hợp người dùng công khai và được trừu tượng qua auth adapter.

### 5.8. Không hardcode provider

Email, payment và auth implementation phải nằm sau interface/adapter. Domain không được phụ thuộc vào tên provider cụ thể.

---

## 6. Domain rules bắt buộc

### 6.1. Tám model lõi

Hệ thống phải phân biệt:

1. Creator Model.
2. Profile Model.
3. Content Model.
4. Offer Model.
5. State Transition Model.
6. Relationship Graph.
7. Evidence Ledger.
8. Next Best Action Policy.

Không gộp tất cả vào một JSON `user_profile` hoặc `metadata` không có schema.

### 6.2. Creator Model

Mô tả:

- creator phục vụ ai;
- lời hứa cốt lõi;
- quan điểm và giới hạn;
- topic pillars;
- evidence standard;
- offers;
- desired audience transitions.

Creator Model của Thông Phan là cấu hình của workspace, không phải dữ liệu của reader.

### 6.3. Offer Model

Qualification luôn phải gắn với một offer cụ thể. Không dùng `is_qualified = true` trên user mà không có `offer_id`.

### 6.4. Profile Model

Phải tách:

- declared fact;
- observed fact;
- derived fact;
- inference;
- decision;
- outcome;
- human override.

Không ghi inference tâm lý nhạy cảm hoặc phán xét như “lười”, “thiếu tự tin”, “khả năng chi trả cao” nếu không có dữ liệu tự khai hợp lệ và mục đích rõ ràng.

### 6.5. Content Model

Mỗi nội dung cần mô tả chức năng:

- câu hỏi giải quyết;
- reader situation;
- uncertainty reduced;
- progress state from/to;
- prerequisite;
- expected shift;
- next action;
- freshness;
- evidence quality;
- access level;
- offer relevance.

Tag chủ đề đơn thuần không đủ để recommendation.

### 6.6. State không được gộp thành một score

Phải tách ít nhất:

- relationship state;
- progress state;
- commercial state theo offer.

Một member trả phí không tự động là qualified lead. Một reader miễn phí vẫn có thể product-qualified nếu có bằng chứng phù hợp.

### 6.7. Recommendation không phải lúc nào cũng là bài viết

Next Best Action có thể là:

- đọc;
- tiếp tục bài đang dở;
- phản tư;
- cập nhật Active Question;
- làm asset;
- dự workshop;
- nói chuyện với con người;
- xem offer;
- không gửi thêm gì.

### 6.8. Sparse Data Mode trước Rich Data Mode

Khi ít dữ liệu, ưu tiên:

- mục tiêu tự khai;
- Active Question;
- lựa chọn onboarding;
- câu hỏi workshop;
- phản hồi trực tiếp;
- rule đơn giản.

Không giả vờ có machine learning chính xác khi chưa có đủ dữ liệu.

---

## 7. Evidence và explainability rules

Mọi `Inference` phải có:

```text
inference_id
workspace_id
subject_id
inference_type
value
confidence
status
generator_type
generator_version
created_at
expires_at
review_status
```

Và ít nhất một liên kết `INFERENCE_SUPPORTED_BY_EVIDENCE`.

Mọi `Decision` phải có:

- decision type;
- candidate set nếu là recommendation;
- selected action;
- rationale;
- evidence/inference IDs;
- policy version;
- outcome window.

Admin phải truy vết được:

```text
Decision
→ Inference
→ Fact
→ Evidence
→ Raw source hoặc session summary
```

Nếu chuỗi truy vết bị đứt, trạng thái phải bị đánh dấu `unverifiable`, không được sử dụng cho commercial automation.

---

## 8. Privacy, consent và data minimization

### 8.1. Chỉ thu dữ liệu phục vụ mục đích rõ

Không thu thập vì “có thể hữu ích sau này”. Mỗi event phải có:

- purpose;
- retention class;
- lawful/consent basis nếu cần;
- owner;
- downstream use.

### 8.2. Người dùng phải kiểm soát profile quan trọng

Reader/member phải có khả năng:

- xem chủ đề hệ thống đang hiểu;
- sửa mục tiêu;
- đổi Active Question;
- xác nhận hoặc bỏ xác nhận bài đã đọc;
- chọn tần suất email;
- yêu cầu export/xóa dữ liệu;
- phản hồi recommendation không phù hợp.

### 8.3. Không cross-workspace leakage

Khi sau này có creator khác, dữ liệu cá nhân, content và offer của workspace này không được dùng cho workspace khác. Chỉ dữ liệu tổng hợp đã ẩn danh và được cho phép mới có thể dùng để cải thiện phương pháp chung.

### 8.4. Log không chứa dữ liệu nhạy cảm

Không log:

- token;
- password;
- email body đầy đủ;
- payment secret;
- free-text reflection không cần thiết;
- raw profile payload.

Dùng ID, trace ID và redaction.

---

## 9. Security rules

- Mọi admin route phải có authentication và authorization riêng.
- Mọi payment webhook phải verify signature và idempotency.
- Mọi mutation phải validate schema phía server.
- Mọi public form phải có rate limit và Turnstile khi phù hợp.
- Không tin client-generated `user_id`, `workspace_id`, `entitlement` hoặc `read_confidence`.
- Server tính hoặc xác minh các giá trị quan trọng.
- D1 migration phải có forward path, rollback strategy và test.
- Secret chỉ qua Wrangler secret/secret store hoặc CI secret; không commit.
- Không dùng service token trong browser.
- Content member không được chỉ “ẩn bằng CSS”; entitlement phải được enforce ở server/build boundary phù hợp.

---

## 10. Coding standards

### 10.1. TypeScript mặc định

Ưu tiên TypeScript strict. Không dùng `any` nếu không có lý do và comment.

### 10.2. Schema validation

Mọi API boundary, queue message và webhook phải validate bằng schema library phù hợp với codebase.

### 10.3. Pure domain logic

State transition, qualification, ranking và evidence rules nên nằm trong pure functions có unit test; không chôn trong route handler.

### 10.4. Idempotency

Các thao tác sau phải idempotent:

- payment webhook;
- email webhook;
- reading session finalize;
- queue consumer;
- profile recompute;
- recommendation generation;
- subscription activation/expiration.

### 10.5. Time

Lưu timestamp UTC ở database. Hiển thị theo timezone người dùng hoặc `Asia/Bangkok` cho admin mặc định. Không dùng local server time để tính expiry.

### 10.6. IDs

Dùng opaque stable IDs. Không để email, slug hoặc provider ID làm primary key domain.

### 10.7. Migrations

- Không sửa migration đã chạy production.
- Mỗi schema change có migration mới.
- Test migration trên database rỗng và snapshot gần production.
- Backfill tách khỏi schema migration nếu có thể.

### 10.8. Error handling

Error phải phân loại:

- validation;
- unauthorized;
- forbidden;
- not found;
- conflict/idempotency;
- rate limit;
- provider failure;
- internal invariant violation.

Không trả stack trace cho client.

---

## 11. Testing và verification

Mỗi task phải chạy các lệnh phù hợp được xác định sau audit, tối thiểu gồm:

```text
typecheck
lint
unit tests
integration tests
build
```

Task liên quan Cloudflare binding phải có test cho:

- D1 query/migration;
- R2 object path;
- KV fallback;
- queue retry/idempotency;
- Cron logic;
- Worker route.

Task domain phải có invariant test, ví dụ:

- inference không có evidence không được active;
- user không có entitlement không truy cập member content;
- state không được chuyển nếu thiếu required evidence;
- qualification không tồn tại nếu không có offer;
- confirmed completion không được tạo chỉ từ scroll depth;
- recommendation không được gửi lại bài đã confirmed complete trừ khi có lý do review.

Trước khi tuyên bố hoàn thành, Codex phải cung cấp:

- file thay đổi;
- test đã chạy;
- output quan trọng;
- migration status;
- rủi ro còn lại;
- screenshot hoặc request/response evidence nếu có UI/API.

---

## 12. Observability

Mỗi request quan trọng cần `trace_id`. Các background job cần `job_id` và `attempt`.

Metric tối thiểu:

- API error rate;
- queue backlog/failure;
- D1 read/write usage;
- email dispatch status;
- payment webhook status;
- entitlement mismatch;
- recommendation generated/opened/completed;
- evidence chain failure;
- inference expired/unverifiable;
- cost budget threshold.

Không tạo dashboard vanity. Mỗi metric phải liên kết với một quyết định vận hành.

---

## 13. AI rules

AI không được ở critical path của Release 1–4 nếu không có fallback.

AI chỉ được dùng khi có:

- task definition rõ;
- golden dataset;
- baseline rule hoặc human performance;
- metric đánh giá;
- threshold;
- failure mode;
- cost budget;
- model/version logging;
- human review cho quyết định nhạy cảm.

AI có thể đề xuất:

- normalize câu hỏi;
- cluster content demand;
- gợi ý Content Model;
- semantic candidate retrieval;
- tóm tắt bằng chứng;
- giải thích recommendation.

AI không được tự quyết:

- Sales Ready;
- nội dung nhạy cảm;
- xóa dữ liệu;
- thay đổi entitlement;
- gửi email hàng loạt;
- cross-workspace data use.

---

## 14. Transferability và Conan Maker guardrails

### 14.1. Reference implementation trước

Mọi feature mới phải trả lời:

1. Vấn đề thật nào của thongphan.com/read đang cần nó?
2. Bằng chứng nào cho thấy vấn đề tồn tại?
3. Kết quả nào sẽ xác nhận feature có ích?
4. Có cách thủ công hoặc rule đơn giản hơn không?

Không được xây feature chỉ vì “sau này học viên có thể cần”.

### 14.2. Case study instrumentation

Mỗi release phải chỉ rõ nó giúp kiểm nghiệm giả thuyết nào, ví dụ:

- người đọc có đăng ký không;
- có trả 99k không;
- recommendation có tăng progressed reader không;
- content demand có cải thiện editorial decision không;
- member có chuyển sang offer sâu hơn không.

### 14.3. Method transfer trước software transfer

Trước khi xây hosted multi-creator product, phải có ít nhất:

- một case đầy đủ của Thông Phan;
- 3–5 pilot thủ công với học viên Conan;
- mô hình nào thực sự phổ quát;
- feature nào chỉ đúng với Thông;
- sparse-data workflow dùng được;
- willingness-to-pay hoặc delivery economics.

### 14.4. Productization Gate

Chỉ mở multi-tenant implementation khi tài liệu Roadmap xác nhận đủ gate. Nếu chưa đủ, mọi task multi-tenant phải bị từ chối hoặc chuyển thành design note.

---

## 15. Definition of Done

Một task chỉ hoàn thành khi:

- outcome theo task pack đạt;
- test phù hợp pass;
- không vi phạm invariant;
- migration chạy được;
- feature flag/rollback có nếu cần;
- observability có;
- security/privacy được kiểm tra;
- tài liệu liên quan được cập nhật;
- code không mở rộng ngoài scope;
- Codex báo rõ phần chưa xác minh.

Một release chỉ hoàn thành khi:

- exit criteria trong Roadmap đạt;
- metric baseline được ghi nhận;
- incident/rollback path đã test;
- admin có thể giải thích trạng thái quan trọng;
- Thông Phan duyệt decision gate.

---

## 16. Những điều tuyệt đối không làm

1. Không đổi chiến lược sản phẩm bằng một task code.
2. Không xây SaaS đa tenant ở MVP.
3. Không dùng Neo4j chỉ vì có từ “Graph”.
4. Không huấn luyện SLM khi chưa có dữ liệu và benchmark.
5. Không lưu raw behavior vô hạn vào D1.
6. Không dùng KV làm operational database.
7. Không dùng email open làm bằng chứng quan tâm mạnh.
8. Không coi time-on-page là đã đọc.
9. Không coi paid member là qualified lead.
10. Không tạo một lead score tổng duy nhất.
11. Không tự động gửi offer dựa trên inference yếu.
12. Không thay URL public mà thiếu redirect/canonical plan.
13. Không hardcode provider vào domain.
14. Không commit secret.
15. Không tạo inference thiếu evidence.
16. Không cho AI sửa Fact thành Inference hoặc ngược lại.
17. Không cross-workspace data leakage.
18. Không tuyên bố task hoàn thành nếu chưa chạy verification.

---

## 17. Required reading theo loại task

| Loại task | Tài liệu bắt buộc |
|---|---|
| Audit/repo setup | AGENTS, Master Index, Current System Audit, SAD |
| Product/UX | Product Charter, URD, State Model, Glossary |
| Content/admin CMS | Content Model, Domain Model, URD |
| Profile/evidence | Profile & Evidence, Domain Model, State Model |
| Reading tracking | Data & Event, Profile & Evidence, URD |
| Recommendation | State Model, Content Model, Profile & Evidence, Domain Model |
| Membership/payment | URD, SAD, Data & Event, Roadmap |
| Cloudflare infra | SAD, Data & Event, Current System Audit |
| Conan transfer/pilot | Product Charter, State Model, Domain Model, Roadmap |
| AI | AGENTS AI rules, Profile & Evidence, Data & Event, Roadmap |

---

## 18. References cần kiểm tra định kỳ

- OpenAI Codex và `AGENTS.md`: <https://openai.com/index/introducing-codex/>
- Cloudflare Workers limits: <https://developers.cloudflare.com/workers/platform/limits/>
- Workers Static Assets billing: <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>
- D1 limits/pricing: <https://developers.cloudflare.com/d1/platform/limits/>
- KV limits: <https://developers.cloudflare.com/kv/platform/limits/>
- Queues pricing/limits: <https://developers.cloudflare.com/queues/platform/pricing/>
- Cloudflare Email Service pricing: <https://developers.cloudflare.com/email-service/platform/pricing/>

Các URL trên là tài liệu tham chiếu, không thay thế việc xác minh release-specific limits vào thời điểm triển khai.

---

## 19. Quy ước xuất bản artifact lên GitHub

Quy ước này chỉ áp dụng cho repository Thongphan Read trong `/Users/rio/thongphan-com`:

1. Mọi tài liệu, báo cáo, đặc tả, kế hoạch, audit artifact và file dự án có ý nghĩa được Codex tạo hoặc cập nhật phải được commit và push lên GitHub trước khi báo task hoàn thành, trừ khi anh Thông yêu cầu rõ chỉ lưu local.
2. Phải stage bằng danh sách file tường minh khi working tree có thay đổi không liên quan. Không dùng yêu cầu này làm lý do commit nhầm thay đổi của người dùng hoặc artifact ngoài scope.
3. Không đưa lên GitHub secret, credential, token, file môi trường local, dữ liệu cá nhân chưa được phép công khai, build cache, file tạm hoặc bằng chứng chứa giá trị nhạy cảm.
4. Trước khi push phải chạy kiểm tra phù hợp với loại thay đổi và kiểm tra secret trên đúng phạm vi được stage.
5. Sau khi push phải báo rõ branch, commit SHA, pull request hoặc remote ref và kết quả kiểm tra.
6. Việc push tài liệu hoặc code không tự động cấp quyền deploy, thay production, merge PR, chạy migration phá hủy hoặc vượt qua decision gate của chủ dự án.
