# 01 — Glossary: Ngôn ngữ chuẩn của Thongphan Read

**Document ID:** TPREAD-D02
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26

---

## 1. Cách sử dụng

Glossary là nguồn sự thật cho thuật ngữ trong product, UI, database, analytics và giao tiếp với Codex. Khi một thuật ngữ có nhiều nghĩa phổ biến, tài liệu này định nghĩa nghĩa được phép dùng trong Thongphan Read.

Quy tắc:

- Không tạo synonym mới trong code nếu thuật ngữ chuẩn đã có.
- Tên database/API có thể dùng tiếng Anh, UI dùng tiếng Việt tự nhiên.
- Không biến thuật ngữ nội bộ như “qualified lead” thành nhãn hiển thị gây áp lực cho người dùng.
- Khi chưa chắc, cập nhật Glossary trước khi tạo entity mới.

---

## 2. Product và chiến lược

### Thongphan Read

Hệ thống đọc và phát triển quan hệ cá nhân hóa trên `thongphan.com`, giúp người đọc nhận đúng nội dung và hành động tiếp theo, đồng thời giúp Thông Phan hiểu nhu cầu, xây content/workshop và nhận diện sự phù hợp với offer bằng bằng chứng.

### Public Library

Thư viện công khai tại `/library`, nơi visitor có thể đọc mà không cần tài khoản. Đây là acquisition, trust và canonical content surface.

### Read Workspace

Không gian cá nhân hóa tại `/read`, gồm onboarding, reading path, Active Question, lịch sử, recommendation, member content và notification.

### Reference Implementation

Một implementation thật, chạy cho Thông Phan với user, content, payment và outcome thật. Nó là nguồn bằng chứng để sau này trích xuất phương pháp cho Conan Maker. Reference implementation không đồng nghĩa sản phẩm đa tenant.

### Audience Relationship OS

Tên khái niệm tổng quát của phương pháp bên dưới Thongphan Read: hệ thống nhớ audience, mô hình hóa nhu cầu, nối content với state và chọn hành động tiếp theo.

### Method Transfer

Chuyển giao nguyên lý, model, template và workflow cho người khác mà không nhất thiết cung cấp phần mềm hosted.

### Software Transfer

Cung cấp implementation phần mềm cho creator khác, có thể dưới dạng template, self-hosted package, hosted workspace hoặc SaaS.

### Transferability-first

Thiết kế domain đủ tổng quát để chuyển giao sau này nhưng chỉ xây feature khi reference implementation có nhu cầu thật.

### SaaS-first

Cách tiếp cận bị cấm trong MVP: xây ngay multi-tenancy, billing creator, white-label và self-service trước khi chứng minh giá trị.

### Productization Gate

Bộ điều kiện bắt buộc trước khi biến reference implementation thành sản phẩm cho nhiều creator.

### Case Study

Bản trình bày có bằng chứng về vấn đề, intervention, metric, outcome, failure và learning. “Xây xong hệ thống” không đủ là case study.

### Case Study Evidence Pack

Gói dữ liệu và tài liệu có cấu trúc để chứng minh một giả thuyết sản phẩm: baseline, cohort, event, decision, outcome, screenshot, qualitative quote và limitation.

### North Star Metric

Chỉ số chính phản ánh giá trị sản phẩm. Baseline của Thongphan Read là `Weekly Progressed Readers`.

### Weekly Progressed Reader

Một reader/member trong tuần đã hoàn thành một Next Best Action và tạo bằng chứng rằng họ hiểu rõ hơn, ra quyết định hoặc bắt đầu một hành động có liên quan tới goal/question.

---

## 3. Actor và identity

### Visitor

Người truy cập website. Có thể ẩn danh hoặc đã nhận diện.

### Anonymous Visitor

Visitor chưa đăng nhập và chưa được nối với canonical user.

### Known Visitor

Visitor có một anonymous/session identity ổn định nhưng chưa tạo tài khoản.

### Registered Reader

Người đã tạo tài khoản miễn phí và có canonical user ID.

### Paid Member

Registered Reader đang có entitlement hợp lệ của plan trả phí.

### Activated Member

Paid Member đã hoàn thành activation criterion, ví dụ khai goal/Active Question và hoàn thành hoặc xác nhận một bước đọc.

### Engaged Member

Member quay lại và tạo progression evidence trong cửa sổ thời gian được định nghĩa.

### Advocate

Người chủ động chia sẻ, giới thiệu, đóng góp case hoặc giúp người khác đến với hệ thống.

### Creator

Người tạo hệ quan điểm, nội dung và offer mà workspace phục vụ. Trong reference implementation, creator là Thông Phan.

### Workspace

Ranh giới logic chứa Creator Model, content, offer, user relationship, rules và dữ liệu vận hành. MVP có một workspace `thongphan`.

### Workspace Member

Người thuộc team vận hành creator workspace, không phải paid reader/member. Có thể là owner, editor, operator hoặc support.

### Canonical User ID

ID domain ổn định đại diện một người trong hệ thống. Không dùng email hoặc provider ID làm canonical key.

### Anonymous ID

ID first-party tạm thời cho visitor chưa đăng nhập. Có thể được merge vào Canonical User ID sau khi có bằng chứng identity.

### Identity Merge

Quá trình nối anonymous/provider identities vào canonical user. Phải có provenance và khả năng sửa.

### Entitlement

Quyền truy cập có hiệu lực với một resource/feature, được tạo từ subscription, grant hoặc admin override.

### Subscription

Cam kết thương mại cho một plan trong một khoảng thời gian. Subscription không tự động đồng nghĩa entitlement nếu payment chưa xác nhận hoặc trạng thái lỗi.

### Plan

Gói quyền lợi và giá, ví dụ Reader Free hoặc Read Member 99k.

---

## 4. Creator, content và offer

### Creator Model

Mô hình có cấu trúc mô tả creator phục vụ ai, lời hứa, quan điểm, topic pillars, tiêu chuẩn bằng chứng, offers và desired audience transitions.

### Core Promise

Kết quả giá trị mà creator cam kết giúp audience tiến gần hơn. Không đồng nghĩa guarantee kết quả.

### Core Belief

Quan điểm nền dùng để định hướng content và recommendation.

### Boundary Belief

Điều creator không tin, không làm hoặc không muốn tối ưu.

### Topic Pillar

Chủ đề chiến lược bền vững gắn với lời hứa và offer, không phải hashtag ngẫu nhiên.

### Content Item

Đơn vị nội dung có thể là article, note, curated reading, video, worksheet, email, workshop recording hoặc asset.

### Article

Content Item dạng bài viết có canonical URL và version.

### Article Version

Snapshot bất biến của nội dung và metadata tại một lần publish/update quan trọng.

### Content Model

Metadata có cấu trúc mô tả bài dành cho ai, giải quyết câu hỏi nào, yêu cầu gì trước, tạo shift gì và dẫn tới bước nào.

### Primary Question

Câu hỏi trung tâm mà nội dung có trách nhiệm giải quyết.

### Secondary Question

Câu hỏi phụ được nội dung giải quyết một phần.

### Reader Situation

Bối cảnh có thể quan sát hoặc tự khai khiến nội dung trở nên hữu ích.

### JTBD

Job-to-be-Done: việc người đọc đang cố hoàn thành trong một hoàn cảnh có rào cản và động lực cụ thể.

### Uncertainty Reduced

Sự không chắc chắn cụ thể mà nội dung giúp giảm.

### Expected Shift

Thay đổi mong đợi về cách hiểu, quyết định hoặc hành động sau nội dung.

### Prerequisite

Nội dung, kiến thức, trạng thái hoặc điều kiện nên có trước khi recommendation.

### Freshness

Mức độ còn hiệu lực của nội dung tại thời điểm hiện tại.

### Superseded Content

Nội dung đã bị một version hoặc content khác thay thế; không nên recommendation mặc định.

### Access Level

Mức quyền cần để truy cập: public, registered, member hoặc special entitlement.

### Reading Path

Chuỗi content/action có logic theo state, không phải playlist cố định cho mọi người.

### Offer

Giải pháp thương mại hoặc phi thương mại có lời hứa, phạm vi, điều kiện phù hợp, giá và delivery model rõ.

### Offer Model

Mô hình cấu trúc của offer: problem, audience, fit, non-fit, readiness signal, prerequisite, handoff và outcome.

### Product Fit

Mức độ một người và tình huống của họ phù hợp với offer cụ thể.

### Non-fit Signal

Bằng chứng cho thấy offer không phù hợp hoặc chưa phù hợp.

### Readiness Signal

Bằng chứng cho thấy người dùng có khả năng sẵn sàng đánh giá hoặc bắt đầu offer.

---

## 5. Question, goal và demand

### Goal

Kết quả người dùng tự khai muốn đạt. Goal có scope và thời gian, có thể thay đổi.

### Active Question

Một câu hỏi chính người dùng đang muốn hệ thống giúp giải quyết. Mỗi user nên có số lượng Active Question giới hạn để tránh recommendation loãng.

### Question Node

Đại diện chuẩn hóa của một câu hỏi trong domain graph.

### Raw Question

Cách diễn đạt nguyên bản của người dùng.

### Normalized Question

Câu hỏi đã được chuẩn hóa nghĩa nhưng vẫn giữ liên kết về Raw Question.

### Question Cluster

Nhóm câu hỏi tương đồng về nhu cầu; không được xóa mất khác biệt quan trọng.

### Content Request

Yêu cầu của user muốn có câu trả lời hoặc nội dung. Không phải cam kết viết riêng.

### Content Demand

Tổng hợp bằng chứng cho thấy một câu hỏi/chủ đề cần content hoặc workshop.

### Content Gap

Khoảng trống giữa nhu cầu và khả năng hiện tại của kho content.

### Search Gap

Truy vấn tìm kiếm không có kết quả đủ tốt.

### Editorial Recommendation

Đề xuất cho creator: tái phân phối, cập nhật, viết mới, tạo asset hoặc làm workshop.

### Demand Score

Điểm đa tiêu chí cho content/workshop demand. Phải explainable, không phải popularity đơn thuần.

---

## 6. Reading intelligence

### Reading Session

Khoảng tương tác có ranh giới giữa một user/anonymous identity và một content item.

### Reading Session Summary

Bản tổng hợp có giới hạn của một session: active time, section coverage, conclusion seen, interaction, completion confirmation và client/server metadata.

### Active Reading Time

Thời gian trang visible và có dấu hiệu tương tác hợp lý. Không đồng nghĩa thời gian thực sự đọc từng từ.

### Section Coverage

Tỷ lệ section đạt điều kiện visible/dwell tối thiểu.

### Scroll Depth

Điểm sâu nhất của trang đã đi qua. Là tín hiệu yếu nếu đứng một mình.

### Scroll Rhythm

Mẫu cuộn, dừng và quay lại. Chỉ dùng như tín hiệu bổ trợ.

### Opened

Đã mở content.

### Sampled

Đã xem một phần nhưng chưa có đủ bằng chứng engaged.

### Engaged Reading

Có nhiều tín hiệu phù hợp cho thấy người dùng dành sự chú ý thực sự.

### Likely Completed

Hệ thống suy luận có xác suất cao rằng người dùng đã đi qua phần lớn nội dung. Đây là inference, không phải fact.

### Confirmed Completed

Người dùng chủ động xác nhận hoàn thành. Đây là declared fact nhưng vẫn không chứng minh đã hiểu.

### Reflected

Người dùng trả lời một câu hỏi phản tư, nêu điều hiểu hoặc câu hỏi tiếp theo.

### Applied

Có bằng chứng người dùng thực hiện một hành động hoặc tạo output liên quan tới nội dung.

### Read Confidence

Điểm confidence cho inference reading state, có policy version và evidence. Không hiển thị như “chắc chắn đã đọc”.

### Completion Confirmation

Hành động người dùng bấm “Đã đọc xong” hoặc tương đương.

### Reflection Prompt

Câu hỏi ngắn nhằm xác định điều người dùng hiểu, chưa rõ hoặc muốn làm tiếp.

### Progress Evidence

Bằng chứng cho thấy user tiến trong goal/question, mạnh hơn pageview hoặc click.

---

## 7. Profile và evidence

### Profile Model

Mô hình động về goal, question, known content, progress, preference và trạng thái liên quan tới việc phục vụ user. Không phải hồ sơ tâm lý toàn diện.

### Declared Fact

Thông tin người dùng chủ động cung cấp hoặc xác nhận.

### Observed Fact

Sự kiện quan sát trực tiếp được, ví dụ đăng ký workshop hoặc tải asset.

### Derived Fact

Kết quả tổng hợp theo rule deterministic từ raw/observed data.

### Inference

Giả thuyết có confidence, được sinh bởi rule, AI hoặc human analysis và phải có evidence.

### Decision

Lựa chọn hành động của hệ thống dựa trên fact/inference/policy.

### Outcome

Kết quả quan sát sau decision trong một outcome window.

### Evidence

Đơn vị dữ liệu có nguồn, thời gian, integrity và retention, dùng hỗ trợ fact/inference/decision.

### Evidence Ledger

Sổ cái logic giữ index và quan hệ truy vết của evidence, fact, inference, decision và outcome.

### Evidence Strength

Mức độ một evidence hỗ trợ kết luận. Declared answer trực tiếp thường mạnh hơn email open, nhưng strength còn phụ thuộc loại kết luận.

### Evidence Lineage

Chuỗi truy vết từ conclusion ngược về nguồn gốc.

### Provenance

Thông tin ai/hệ thống nào tạo, nguồn nào, thời điểm nào và bằng cách nào.

### Confidence

Mức độ tin cậy được hiệu chỉnh cho một inference, không phải “độ đúng tuyệt đối”.

### Expiry

Thời điểm inference/fact không còn đủ mới để sử dụng mà không refresh.

### Human Override

Sửa hoặc vô hiệu hóa state/inference/decision bởi người có quyền, kèm lý do và audit.

### Unverifiable

Trạng thái kết luận không còn evidence chain đầy đủ; không được dùng cho commercial automation.

### Sensitive Inference

Suy luận liên quan sức khỏe, chính trị, tôn giáo, dân tộc, đời sống tình dục, tài chính nhạy cảm hoặc tâm lý. Bị cấm trừ khi có thiết kế pháp lý/đạo đức riêng ngoài baseline.

---

## 8. Relationship Graph

### Relationship Graph

Mô hình các node và edge giữa user, creator, question, content, workshop, asset, offer, evidence và decision.

### Node

Một entity có identity ổn định.

### Edge

Quan hệ có semantics rõ, source, timestamp và khi cần confidence/evidence.

### Typed Edge

Quan hệ có loại cụ thể như `ARTICLE_ANSWERS_QUESTION`, tốt hơn edge generic mơ hồ.

### Graph Traversal

Truy vấn đi qua nhiều edge để trả lời câu hỏi như “những user có Active Question được bài mới giải quyết”.

### Relationship Memory

Khả năng hệ thống nhớ lịch sử tương tác và tiến trình của một người qua thời gian.

### Relationship State

Độ sâu mối quan hệ với hệ thống: anonymous, registered, paid, activated, engaged, advocate.

### Creator-scoped Data

Dữ liệu thuộc một workspace/creator và không được sử dụng xuyên workspace ngoài policy cho phép.

---

## 9. Recommendation và Next Best Action

### Candidate

Content/action đủ điều kiện ban đầu để xem xét.

### Eligibility Filter

Rule loại candidate dựa trên access, prerequisite, freshness, completion hoặc safety.

### Ranking

Xếp thứ tự candidate theo policy explainable.

### Recommendation

Decision đề xuất một content/action cho user tại một thời điểm.

### Next Best Content

Content phù hợp nhất trong candidate set, nếu hành động phù hợp là đọc.

### Next Best Action

Hành động phù hợp nhất, có thể không phải content.

### Recommendation Rationale

Lý do có cấu trúc, gồm match, prerequisite, evidence và policy version.

### Recommendation Feedback

User/admin phản hồi phù hợp, không phù hợp hoặc không đúng thời điểm.

### Recommendation Outcome

Kết quả sau recommendation: opened, completed, reflected, applied, ignored hoặc dismissed.

### Sparse Data Mode

Chế độ dựa chủ yếu vào declared data và rule khi chưa đủ interaction history.

### Rich Data Mode

Chế độ bổ sung behavior, cohort và observed effectiveness khi có đủ dữ liệu.

### Cold Start

Tình huống chưa có đủ profile/content outcome để cá nhân hóa.

---

## 10. State và qualification

### State Transition

Sự thay đổi từ trạng thái này sang trạng thái khác, phải có trigger/evidence và policy.

### Relationship State

Trạng thái mối quan hệ với hệ thống.

### Progress State

Trạng thái tiến bộ theo một goal/question cụ thể.

### Commercial State

Trạng thái phù hợp/sẵn sàng với một offer cụ thể.

### Potential Fit

Có tín hiệu ban đầu về sự phù hợp nhưng chưa đủ xác nhận problem/intent.

### Problem Qualified

Có bằng chứng người dùng có vấn đề mà offer nhắm tới và vấn đề có ý nghĩa với họ.

### Solution Qualified

Người dùng hiểu hoặc đồng ý đánh giá loại giải pháp tương ứng.

### Product Qualified

Có fit, problem, intent và activation đủ theo policy của offer.

### Sales Ready

Đủ điều kiện để con người thực hiện commercial handoff. Baseline yêu cầu human review.

### Customer

Đã mua offer cụ thể. Không tự động là advocate hoặc thành công.

### F–P–I–A

Bốn nhóm bằng chứng qualification: Fit, Problem, Intent, Activation.

### Lead Score

Một điểm tổng đơn. Không được dùng làm representation chính; chỉ có thể là view phụ giải thích được.

### Commercial Handoff

Chuyển từ nurturing sang một hành động thương mại phù hợp, không nhất thiết là sales call.

---

## 11. Workshop và transformation

### Workshop Model

Metadata mô tả câu hỏi, prerequisite, outcome, asset và state transition của workshop.

### Workshop Attendance

Bằng chứng user tham dự, không chứng minh đã hiểu hoặc làm.

### Workshop Output

Asset/bài tập/decision được tạo trong hoặc sau workshop.

### Activation

Hành động đầu tiên chứng minh user bắt đầu dùng giá trị sản phẩm.

### Transformation Evidence

Bằng chứng trước–sau cho một thay đổi có ý nghĩa, không chỉ attendance.

---

## 12. Creator capability và Conan transfer

### Creator Capability Level

Mức trưởng thành của creator trong việc hiểu và chăm sóc audience.

### Level 0 — Demand Discovery

Chưa có audience/data đủ; dùng interview, question log và JTBD.

### Level 1 — Audience Memory

Có danh sách người, câu hỏi, content đã gửi và Next Best Action thủ công.

### Level 2 — Owned Reader Hub

Có website/account/content library/email và một số reading state.

### Level 3 — Relationship Intelligence

Có Profile, Content Model, Graph, Evidence và recommendation.

### Level 4 — Automated Growth System

Có lifecycle, qualification, editorial loop và automation đủ kiểm soát.

### Conan Transfer Pilot

Pilot 3–5 học viên sử dụng phương pháp/template trước khi xây multi-creator software.

### Hosted Reader System

Phiên bản phần mềm được Conan/Thông vận hành cho creator khác. Đây là lựa chọn tương lai, không phải MVP.

### Managed Intelligence

Dịch vụ báo cáo và đề xuất định kỳ dựa trên dữ liệu audience của creator.

### White-label

Cho phép thay thương hiệu toàn hệ thống. Không nằm trong scope reference implementation.

### Multi-tenancy

Một implementation phục vụ nhiều workspace với isolation. Chưa được xây trước Productization Gate.

---

## 13. Cloudflare và hạ tầng

### Workers

Compute serverless dùng cho API và business logic.

### Workers Static Assets

Phục vụ static files mà không invoke Worker script nếu route phù hợp.

### D1

SQLite-based serverless database của Cloudflare, source of truth nghiệp vụ trong baseline.

### R2

Object storage cho file, export, evidence payload lớn và archive.

### KV

Eventually consistent key-value store cho cache/config đọc nhiều; không dùng cho transaction state.

### Queues

Hàng đợi message cho background processing và retry.

### Cron Trigger

Schedule gọi Worker theo lịch.

### Workflows

Orchestration durable nhiều bước. Chỉ dùng khi queue/cron không đủ.

### Analytics Engine

Lưu/query data point analytics dạng aggregate. Không phải source of truth user state.

### Cloudflare Web Analytics

Traffic và performance analytics thiên về privacy; không dùng để xác định reader-specific completion.

### Turnstile

Anti-bot challenge cho form/endpoint có abuse risk.

### Workers AI

Inference AI trên Cloudflare. Chỉ dùng sau evaluation gate.

### AI Gateway

Proxy/control layer cho AI provider, dùng log, rate, cache và cost governance.

### Workers for Platforms

Hạ tầng dispatch nhiều user Worker. Không nằm trong MVP; chỉ đánh giá nếu hosted multi-creator product đủ bằng chứng.

### Binding

Cách Worker truy cập D1, R2, KV, Queue hoặc service khác qua environment config.

### Adapter

Interface cô lập domain khỏi provider cụ thể.

---

## 14. Event, metric và vận hành

### Raw Event

Sự kiện gốc nhận từ client/provider/system.

### Domain Event

Sự kiện có ý nghĩa nghiệp vụ như `member_activated` hoặc `article_confirmed`.

### Event Envelope

Cấu trúc chuẩn gồm ID, version, actor, workspace, time, source và properties.

### Idempotency Key

Key bảo đảm retry không tạo tác động lặp.

### Outbox Pattern

Ghi state change và event intent trong cùng transaction, sau đó dispatcher gửi bất đồng bộ.

### Trace ID

ID nối request/job/event qua log.

### Source of Truth

Hệ thống có thẩm quyền cho một loại dữ liệu.

### Derived Metric

Metric tính từ event/fact, không phải state nghiệp vụ.

### Vanity Metric

Metric trông tích cực nhưng không hỗ trợ quyết định hoặc giá trị, ví dụ pageview đứng một mình.

### Activation Rate

Tỷ lệ user đạt activation criterion trong cửa sổ xác định.

### Progression Rate

Tỷ lệ user có state progression sau recommendation/intervention.

### Retention

Khả năng user quay lại và tiếp tục nhận giá trị theo cohort.

### Churn

Subscription kết thúc hoặc user dừng engagement theo định nghĩa cụ thể.

### Cost Guardrail

Ngưỡng cảnh báo, hard limit và hành động khi usage/cost tăng.

### Degradation Mode

Cách hệ thống giảm tính năng nhưng vẫn giữ core experience khi provider/quota lỗi.

### Feature Flag

Cơ chế bật/tắt hoặc rollout feature có kiểm soát.

### Rollback

Quy trình quay lại code/schema/config an toàn.

---

## 15. Ngôn ngữ UI được khuyến nghị

| Nội bộ | Tránh hiển thị | Cách hiển thị phù hợp |
|---|---|---|
| Inference: decision_needed | “Bạn chưa biết quyết định” | “Có vẻ bước tiếp theo của bạn là làm rõ một lựa chọn” |
| Qualified lead | “Bạn là khách hàng tiềm năng” | Không hiển thị; chỉ đưa ra lựa chọn phù hợp |
| Read confidence 84 | “Bạn đã đọc 84%” | “Bài này có vẻ đã được đọc gần hết — bạn có muốn đánh dấu hoàn thành?” |
| Churn risk | “Bạn sắp rời bỏ” | “Câu hỏi trước đây còn đúng với bạn không?” |
| Interest topic | “Hệ thống biết bạn thích…” | “Bạn đang theo dõi chủ đề…” |
| Recommendation | “AI quyết định bạn phải đọc” | “Đề xuất tiếp theo, vì…” |

---

## 16. Nguyên tắc đặt tên trong code

- Entity singular: `user`, `article`, `offer`.
- Table plural hoặc theo convention codebase sau audit, nhưng nhất quán.
- Event past tense: `article_opened`, `membership_activated`.
- Command imperative: `FinalizeReadingSession`.
- Inference type rõ scope: `progress_stage_inference`.
- Commercial state luôn có `offer_id`.
- Creator-scoped entity luôn có `workspace_id`.
- Không dùng `status` mơ hồ khi có thể dùng `relationship_state`, `subscription_status`, `review_status`.

---

## 17. Các từ bị cấm hoặc cần cảnh giác

- “Hiểu chính xác con người” — hệ thống chỉ hiểu tín hiệu có giới hạn.
- “Đã đọc” nếu chỉ có scroll/time.
- “AI biết” — phải nói AI suy luận dựa trên evidence.
- “Tự động chuyển đổi lead” — phải có consent và human control.
- “Cá nhân hóa hoàn toàn” — luôn có uncertainty.
- “Một model cho mọi creator” — Creator/Offer Model khác nhau.
- “SaaS” trước Productization Gate.
- “Graph database” đồng nghĩa Relationship Graph.
- “Member” đồng nghĩa “qualified”.
- “Email open” đồng nghĩa “interest”.
