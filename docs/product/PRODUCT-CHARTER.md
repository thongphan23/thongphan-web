# Product Charter — Thongphan Read

**Document ID:** TPREAD-D04
**Version:** 2.0.0
**Status:** Approved foundation specification
**Last updated:** 2026-07-26
**Product owner:** Thông Phan

---

## 1. One-sentence definition

> Thongphan Read là hệ thống đọc và phát triển quan hệ cá nhân hóa giúp người có chuyên môn nhận đúng nội dung và hành động tiếp theo để hiểu rõ vấn đề, ra quyết định và biến điều họ biết thành tài sản có người muốn dùng.

---

## 2. Vì sao sản phẩm tồn tại

Người theo dõi một creator thường tồn tại như một đám đông không có trí nhớ:

- họ từng đọc gì không ai biết;
- họ đang cố giải quyết câu hỏi nào không được ghi lại;
- cùng một bài được gửi cho tất cả;
- creator nhìn pageview nhưng không biết content tạo thay đổi gì;
- người đọc tích lũy bài nhưng không có tiến trình;
- workshop được chọn theo cảm giác;
- lead qualification dựa trên hành vi bề mặt;
- quan hệ phụ thuộc vào thuật toán mạng xã hội và trí nhớ thủ công.

Thongphan Read xây một first-party system để giải quyết vấn đề đó. Người đọc được phục vụ tốt hơn; Thông Phan có bằng chứng tốt hơn để quyết định content, workshop và offer.

---

## 3. Hai mục tiêu liên kết

### 3.1. Mục tiêu sản phẩm trực tiếp

Xây một sản phẩm thật trên `thongphan.com` có khả năng:

- thu hút người lạ bằng public content;
- chuyển người phù hợp thành Registered Reader;
- cho họ trải nghiệm personalization cơ bản;
- chuyển một phần thành Paid Member;
- giúp member tiến theo một Active Question;
- giữ kết nối bằng email và workspace;
- phát hiện demand;
- nhận diện product fit bằng evidence;
- tạo doanh thu cá nhân bền vững.

### 3.2. Mục tiêu R&D và chuyển giao

Dùng chính Thông Phan làm case study để xây phương pháp có thể chuyển giao cho Conan Maker:

- hiểu audience;
- tạo Creator Model;
- tạo Content Model;
- tạo Offer Model;
- xây Audience Memory;
- chọn Next Best Action;
- phát hiện content/workshop demand;
- qualification có bằng chứng;
- đo content → relationship → outcome → revenue.

Mục tiêu R&D không được làm chậm mục tiêu sản phẩm trực tiếp bằng việc xây SaaS quá sớm.

---

## 4. Strategic thesis

### Thesis 1 — Audience không thiếu content; họ thiếu selection và continuity

Khi AI làm content trở nên dư thừa, giá trị không còn nằm ở số bài. Giá trị nằm ở:

- đúng câu hỏi;
- đúng trạng thái;
- đúng thứ tự;
- đúng bằng chứng;
- đúng thời điểm;
- có hành động sau đọc.

### Thesis 2 — Creator cần first-party relationship memory

Mạng xã hội cho reach nhưng không cho creator một hồ sơ đáng tin về mối quan hệ. Creator cần một tài sản sở hữu có identity, consent, history và evidence.

### Thesis 3 — Content roadmap tốt phải được kéo bởi demand thật

Câu hỏi, search gap, reading drop-off, workshop output và Active Question là dữ liệu biên tập tốt hơn việc đoán topic.

### Thesis 4 — Conversion là hệ quả của progression và fit

Người dùng nên được chuyển tới offer khi có bằng chứng về Fit, Problem, Intent và Activation; không phải vì click nhiều.

### Thesis 5 — Phương pháp có thể trở thành lợi thế Conan

Nếu hệ thống chứng minh được giá trị cho Thông và chuyển giao được ở dạng đơn giản cho học viên, Conan có thể sở hữu một capability khác biệt: giúp người làm chuyên môn biến audience thành quan hệ có trí nhớ, content có lộ trình và offer có bằng chứng.

---

## 5. Target audience

### Primary audience

Người đi làm khoảng 25–40 tuổi có chuyên môn, kinh nghiệm hoặc insight thật, đang muốn:

- xây thương hiệu cá nhân;
- biến chuyên môn thành content/tài sản;
- tạo nguồn thu nhập thứ hai;
- tạo offer, workshop, cộng đồng hoặc sản phẩm tri thức;
- dùng AI nhưng không muốn tạo content rỗng;
- đọc ít hơn nhưng có định hướng.

### High-fit initial segment

Người:

- đã có ít nhất vài năm trải nghiệm thực tế;
- từng chia sẻ hoặc muốn chia sẻ;
- nghiên cứu nhiều nhưng chưa chuyển hóa thành tài sản;
- có nhu cầu rõ nhưng bị quá tải bởi lựa chọn;
- sẵn sàng đọc, phản tư và thực hiện bước nhỏ;
- đã biết hoặc có mức trust ban đầu với Thông Phan.

### Non-primary audience

- người chỉ tìm tin nhanh/giải trí;
- người muốn AI làm thay toàn bộ;
- người chưa có bất kỳ trải nghiệm/chuyên môn nào và không muốn khám phá thực tế;
- người cần cam kết làm giàu nhanh;
- doanh nghiệp cần enterprise knowledge management.

---

## 6. Jobs-to-be-Done cấp sản phẩm

### JTBD-01 — Chọn đúng nội dung

> Khi tôi có quá nhiều thứ có thể đọc nhưng không biết cái nào thực sự liên quan, tôi muốn một hệ thống nhớ mục tiêu và câu hỏi của tôi để tôi bắt đầu ở đúng chỗ.

### JTBD-02 — Duy trì mạch học

> Khi tôi đọc xong một bài nhưng thường quên hoặc không biết bước sau, tôi muốn được dẫn tới một hành động vừa sức để việc đọc tạo ra tiến bộ.

### JTBD-03 — Yêu cầu câu trả lời

> Khi tôi có một câu hỏi chưa được kho giải quyết, tôi muốn ghi lại và biết nó đang được theo dõi, thay vì gửi vào khoảng không.

### JTBD-04 — Theo dõi tiến trình

> Khi tôi đọc và làm nhiều thứ trong thời gian dài, tôi muốn thấy mình đã hiểu gì, còn kẹt ở đâu và câu hỏi hiện tại là gì.

### JTBD-05 — Giữ kết nối

> Khi có bài mới thật sự phù hợp, tôi muốn nhận thông báo qua kênh mình đã chọn mà không bị spam mọi bài.

### JTBD-06 — Creator ra quyết định

> Khi tôi là Thông Phan và phải chọn bài/workshop/offer tiếp theo, tôi muốn xem demand và evidence để không quyết định chỉ bằng cảm giác.

---

## 7. Product layers

### Layer A — Public Library

Miễn phí, không bắt đăng nhập:

- public longform;
- tuyển đọc;
- ghi chú sống;
- content path public;
- search/topic;
- CTA tạo tài khoản;
- preview giá trị member.

Mục tiêu:

- discovery;
- trust;
- SEO;
- social distribution;
- anonymous-to-registered conversion.

### Layer B — Registered Reader

Miễn phí, có account:

- lưu bài;
- lịch sử đọc cơ bản;
- chọn goal/chủ đề;
- một Active Question hoặc trial question;
- một số recommendation;
- notification preference;
- preview personalized home;
- upgrade path.

Mục tiêu:

- identity;
- declared data;
- activation;
- chứng minh personalization trước paywall.

### Layer C — Read Member

Giả thuyết giá: 99.000đ/tháng hoặc gói năm.

Quyền lợi lõi:

- reading profile lâu dài;
- personalized reading path;
- Active Question được theo dõi;
- member content/asset;
- đề xuất Next Best Action;
- notification khi câu hỏi được giải quyết;
- quyền ảnh hưởng editorial/workshop demand;
- monthly progress review;
- ưu tiên một số workshop/Q&A.

Không hứa:

- viết riêng một bài cho từng member;
- coaching 1:1;
- kết quả thu nhập;
- recommendation hoàn hảo.

### Layer D — Deeper Offers

Không nằm trong subscription 99k:

- workshop trả phí;
- implementation sprint;
- Conan Maker;
- consulting/service;
- cohort/challenge.

Handoff phải dựa trên Offer Model và evidence.

---

## 8. Value proposition

### Cho reader

- Bớt lạc trong kho content.
- Đọc có lý do.
- Nhận đúng bài theo câu hỏi.
- Không phải bắt đầu lại mỗi lần quay lại.
- Có quyền sửa profile.
- Có ảnh hưởng tới nội dung tiếp theo.
- Thấy bước tiến thay vì chỉ đếm bài.

### Cho Thông Phan

- Sở hữu identity và relationship memory.
- Biết content nào tạo progression.
- Phát hiện demand.
- Viết ít hơn nhưng đúng hơn.
- Làm workshop bám câu hỏi thật.
- Tạo doanh thu subscription.
- Có qualified demand cho offer sâu hơn.
- Xây case study và IP chuyển giao Conan.

### Cho Conan Maker về sau

- Một phương pháp được chứng minh.
- Template theo maturity level.
- Case thật có số liệu và sai lầm.
- Khả năng implementation sprint/managed intelligence.
- Potential hosted product sau Productization Gate.

---

## 9. Core flywheel

```text
Public content tạo attention và trust
        ↓
Reader đăng ký và khai goal/question
        ↓
Hệ thống đề xuất content/action phù hợp
        ↓
Reading/reflection tạo evidence
        ↓
Profile và Relationship Graph tốt hơn
        ↓
Content Demand Engine phát hiện gap
        ↓
Thông viết bài/làm workshop đúng hơn
        ↓
Người phù hợp quay lại và tiến trạng thái
        ↓
Một phần phù hợp với member/deeper offer
        ↓
Outcome và doanh thu tạo case study
        ↓
Phương pháp được chuyển giao cho Conan Maker
        ↓
Case pilot làm phương pháp mạnh hơn
```

---

## 10. Core models

Sản phẩm được điều hành bởi tám model:

1. **Creator Model:** Thông giúp ai, tin gì, có offer gì.
2. **Profile Model:** reader đang muốn gì, đã biết gì, kẹt ở đâu.
3. **Content Model:** nội dung giải quyết câu hỏi nào và dẫn tới đâu.
4. **Offer Model:** offer phù hợp với ai và khi nào.
5. **State Transition Model:** định nghĩa progression.
6. **Relationship Graph:** lưu quan hệ giữa người–câu hỏi–content–workshop–offer.
7. **Evidence Ledger:** mọi kết luận truy vết được.
8. **Next Best Action Policy:** quyết định nên làm gì tiếp.

---

## 11. Product principles

### P1 — Public value trước paywall

Một số nội dung tốt nhất phải public để tạo trust. Không khóa mọi thứ đáng giá.

### P2 — Personalization phải giải thích được

Mỗi đề xuất phải có lý do dễ hiểu.

### P3 — Declared data mạnh hơn behavioral guess

Nếu user nói rõ câu hỏi, không cần đợi 30 session để đoán.

### P4 — Reading không đồng nghĩa progress

Sản phẩm phải dẫn tới reflection/action.

### P5 — Less content, better sequence

Không khuyến khích binge reading vô mục đích.

### P6 — Consent và control

User biết điều gì được lưu và có thể sửa/xóa.

### P7 — Human relationship remains central

Automation hỗ trợ, không thay thế workshop, phản hồi và sự hiện diện của Thông.

### P8 — Reference use trước productization

Không mở rộng cho creator khác trước bằng chứng.

### P9 — Method is the moat

Code có thể sao chép; model, evidence standard, case và workflow khó sao chép hơn.

---

## 12. Success definition

### Value success

- Reader tìm được bài phù hợp nhanh hơn.
- Member có progression evidence.
- Recommendation được đánh giá phù hợp.
- Câu hỏi chưa giải quyết được giảm.
- Workshop/content roadmap bám demand.

### Business success

- Registered conversion có ý nghĩa.
- Paid conversion đủ để xác nhận willingness-to-pay.
- Retention thể hiện ongoing value.
- Subscription tạo nguồn thu cá nhân đáng kể.
- Deeper offer handoff có quality, không spam.

### Transfer success

- Case study có thể trình bày trung thực.
- Học viên dùng template thủ công nhận giá trị.
- Universal models được phân biệt khỏi Thông-specific content.
- Có ít nhất 3–5 pilot trước software productization.

---

## 13. North Star và metric tree

### North Star

`Weekly Progressed Readers (WPR)`

Điều kiện gợi ý:

- user hoàn thành một Next Best Action trong tuần;
- action gắn với Active Question/Goal;
- có evidence ở cấp reflection, decision, asset hoặc action;
- không chỉ pageview/click.

### Input metrics

- qualified public traffic;
- public → registered;
- onboarding completion;
- Active Question creation;
- recommendation acceptance;
- confirmed completion;
- reflection rate;
- workshop attendance;
- applied action;
- return rate.

### Business metrics

- registered → paid;
- member activation;
- month-1 retention;
- renewal;
- cancellation reasons;
- MRR/annual cash;
- Product Qualified rate theo offer;
- handoff conversion.

### Guardrail metrics

- unsubscribe;
- complaint;
- recommendation “không phù hợp”;
- profile correction;
- inference without evidence;
- email frequency cap breach;
- support burden;
- Cloudflare quota/cost.

---

## 14. Business model hypotheses

### Membership

- 99.000đ/tháng là mức low-friction nhưng phải chứng minh value.
- Gói năm nên có để giảm renewal friction.
- Có thể dùng founding member cohort để học.

### Upsell

Subscription không chỉ là lead magnet trả phí; nó phải tự có giá trị. Upsell chỉ xảy ra khi offer sâu hơn phù hợp.

### Revenue scenarios

```text
500 members  × 99.000 = 49,5 triệu/tháng gross
1.000 members × 99.000 = 99 triệu/tháng gross
3.000 members × 99.000 = 297 triệu/tháng gross
```

Đây là scenario, không forecast. Phải trừ churn, payment failure, tax, provider cost, support và content labor.

### Transfer revenue tương lai

- framework/template trong Conan Maker;
- implementation sprint;
- managed intelligence;
- hosted reader system;
- licensing/white-label chỉ sau gate.

---

## 15. Case study hypotheses cần kiểm nghiệm

1. Người đọc có rời social sang owned site không?
2. Có tạo account để lưu progress không?
3. Có trả tiền cho personalization/continuity không?
4. Recommendation có tăng WPR không?
5. Active Question có cải thiện recommendation không?
6. Content Demand có giúp Thông viết đúng hơn không?
7. Workshop Loop có tạo output mạnh hơn không?
8. Evidence-backed qualification có tạo handoff tốt hơn không?
9. Hệ thống có giảm content production lãng phí không?
10. Phương pháp có dùng được khi creator có ít data không?

Mỗi release phải map tới ít nhất một hypothesis.

---

## 16. Creator transfer maturity

Học viên Conan không được yêu cầu xây bản đầy đủ ngay.

### Level 0 — Demand Discovery

- interview;
- question log;
- JTBD;
- offer hypothesis.

### Level 1 — Audience Memory

- danh sách người;
- câu hỏi;
- content đã gửi;
- next action thủ công.

### Level 2 — Owned Reader Hub

- website;
- account;
- email;
- content library;
- save/complete.

### Level 3 — Relationship Intelligence

- models;
- graph;
- evidence;
- recommendation;
- editorial demand.

### Level 4 — Automated Growth

- lifecycle;
- qualification;
- multi-offer;
- operational automation;
- AI optimization.

Sản phẩm của Thông sẽ ở Level 2–4 theo lộ trình; chương trình Conan phải giúp học viên bắt đầu ở level phù hợp.

---

## 17. Scope baseline

### In scope foundation

- public/member content split;
- identity;
- account;
- membership/entitlement;
- reading tracking có giới hạn;
- Active Question;
- Creator/Content/Offer/Profile models;
- Evidence Ledger;
- recommendation rule-first;
- email notification;
- content demand;
- workshop loop;
- admin dashboard;
- qualification theo offer;
- case study reporting.

### Out of scope trước Productization Gate

- multi-tenant SaaS;
- white-label;
- self-service creator onboarding;
- custom domain provisioning;
- creator billing;
- cross-creator benchmark UI;
- mobile native app;
- social media scraping;
- automatic outbound social comments;
- psychological profiling;
- SLM training;
- full marketing automation suite;
- enterprise CRM.

---

## 18. Key risks

### R1 — Build too much before demand

Mitigation: release gates, vertical slices, no SaaS.

### R2 — Users will not pay for articles

Mitigation: sell continuity/progress, test value, free Reader bridge.

### R3 — Tracking feels invasive

Mitigation: data minimization, transparent profile, explicit controls.

### R4 — Recommendation is shallow

Mitigation: declared question, structured content, rule-first, feedback.

### R5 — Thông cannot sustain content cadence

Mitigation: demand-driven roadmap, update/redistribute before write-new, workshop reuse.

### R6 — System distracts from Conan

Mitigation: define it as reference implementation feeding Conan method; no productization until gates.

### R7 — Case does not transfer

Mitigation: maturity levels, sparse-data pilot, document Thông-specific assumptions.

### R8 — Cloudflare free limits fail

Mitigation: static-first, budget dashboard, queue batching, upgrade triggers.

---

## 19. Decision gates

### Gate A — Foundation approval

- Charter approved.
- State Model approved.
- R0 audit authorized.

### Gate B — Membership build

- repository audited;
- route/SEO decision;
- auth/payment architecture approved;
- R1 PRD/SDD/test ready.

### Gate C — Personalization

- enough structured content;
- reading/evidence pipeline works;
- user can correct profile;
- rule baseline defined.

### Gate D — Commercial handoff

- Offer Models exist;
- F–P–I–A rules approved;
- human review flow exists.

### Gate E — Conan transfer pilot

- case study minimum evidence;
- manual toolkit prepared;
- 3–5 learners selected;
- privacy/data isolation plan.

### Gate F — Software productization

- transfer pilot success;
- willingness-to-pay/support model;
- tenancy architecture ADR;
- cost/security assessment.

---

## 20. Product promise to protect

Thongphan Read phải luôn trả lời được:

> “Với người này, trong câu hỏi này, dựa trên bằng chứng nào, bước tiếp theo có ích nhất là gì?”

Nếu một feature không làm câu trả lời tốt hơn, không tạo progression, không tăng trust hoặc không cải thiện decision quality, nó không phải ưu tiên cốt lõi.
