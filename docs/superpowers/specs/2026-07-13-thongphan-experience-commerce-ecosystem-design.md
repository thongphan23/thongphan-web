# Đặc Tả Hệ Sinh Thái Trải Nghiệm Và Sản Phẩm Thông Phan

**Ngày:** 13/07/2026
**Trạng thái:** Các quyết định thiết kế đã được anh Thông duyệt trong hội thoại; chờ duyệt bản đặc tả viết
**Phạm vi:** `thongphan.com`, tích hợp công khai với `learn.thongphan.com`, các challenge và tool/app tương lai
**Không phải phạm vi:** thay đổi implementation hiện tại của repo Learn trong luồng công việc này

## 1. Quyết định sản phẩm

Thông Phan xây một hệ sinh thái sản phẩm tri thức do chính anh tuyển chọn và tạo ra,
không phải marketplace và không phải phễu chỉ phục vụ Conan Maker.

Hệ sinh thái tạo ba dòng doanh thu độc lập nhưng bổ trợ nhau:

1. `Learn`: thuê bao học tập dưới 200.000đ/tháng;
2. `Tools`: doanh thu theo mức sử dụng thông qua credit;
3. `Conan Maker`: sản phẩm chuyển hóa cao cấp có cộng đồng, phản hồi người thật và
   môi trường triển khai sâu.

Nội dung công khai, diagnostic, challenge và tool dùng thử tạo ra trải nghiệm thật
trước khi người dùng trả tiền. Mỗi trải nghiệm phải tạo ít nhất một trong ba kết quả:

- một sự nhận ra hữu ích về bản thân;
- một Tác phẩm có thể lưu và phát triển;
- một hành vi người dùng muốn tiếp tục.

Conan Maker không phải bước cuối bắt buộc. Nó chỉ được đề xuất khi nhu cầu của người
dùng vượt khỏi phạm vi tự học và tự sử dụng công cụ.

## 2. Quan hệ với các đặc tả hiện có

Đặc tả này mở rộng kiến trúc hệ lai đã duyệt tại
`2026-07-11-thongphan-learn-cat-world-system-design.md` ở tầng hệ sinh thái,
thương mại và trải nghiệm xuyên sản phẩm.

- Đặc tả Learn Cat World tiếp tục là nguồn sự thật cho sư phạm, Lesson Player,
  Learning Core, Cat World, mastery, phần thưởng và ứng dụng người học.
- Đặc tả này là nguồn sự thật mới cho bậc thang trải nghiệm công khai, thuê bao Learn,
  ví credit, tool/app, Không gian của tôi và đo lường xuyên sản phẩm.
- Commerce mua một lần hiện có trong Learning Core không bị xóa. Thuê bao là một loại
  quyền truy cập bổ sung và có thể cùng tồn tại với quyền mua riêng một challenge,
  course hoặc sản phẩm tương lai.
- Quyết định thương mại mới thay đổi định hướng `AI Foundation miễn phí toàn bộ` trong
  đặc tả cũ thành một phần miễn phí đủ tạo kết quả và phần đầy đủ nằm trong thuê bao.
  Thay đổi này chưa được áp dụng vào Learn và cần migration/entitlement decision riêng,
  gồm cách bảo toàn quyền của người đã bắt đầu học trước ngày chuyển đổi.
- Đặc tả phục hồi Brain2 ngày 13/07/2026 tiếp tục sở hữu yêu cầu toàn vẹn nội dung,
  media, kickoff và visual riêng của challenge 21 ngày.
- Quyền truy cập Brain2 hiện tại vẫn là ngày 01–07 công khai và ngày 08–21 dành cho
  Conan Maker. Khả năng đưa challenge 21 ngày vào Learn hoặc bán riêng chỉ là quyền
  thương mại tương lai; không tự động thay đổi access Worker hay entitlement đang live.

Nếu hai tài liệu có vẻ xung đột, quyền sở hữu theo bảng ranh giới ở phần 6 quyết định
tài liệu nào có thẩm quyền.

## 3. Lời hứa hệ sinh thái

> Giúp người đi làm biến tri thức được tuyển chọn thành năng lực, Tác phẩm và đầu ra
> có thể sử dụng trong công việc bằng trải nghiệm học và công cụ AI thực tế.

Người dùng không mua một kho video hoặc tập hợp app rời rạc. Họ tích lũy một hồ sơ có
trí nhớ về mục tiêu, năng lực, Tác phẩm, tiến độ học và công cụ đã sử dụng.

## 4. Bậc thang trải nghiệm

| Tầng | Trải nghiệm | Kết quả người dùng | Vai trò kinh doanh |
| --- | --- | --- | --- |
| Khám phá | bài viết, câu chuyện, case study, video | hiểu vấn đề theo góc nhìn của anh Thông | tạo demand và trust |
| Soi mình | diagnostic, bài viết tương tác | biết đang ở đâu và kẹt ở đâu | ghi nhận tín hiệu nhu cầu |
| Thắng nhỏ | bài thực hành 20–45 phút, tool dùng thử | tạo đầu ra đầu tiên | chứng minh phương pháp |
| Kích hoạt | challenge miễn phí ba ngày | hoàn thành một Tác phẩm nhỏ | hình thành hành vi và tài khoản |
| Phát triển năng lực | Learn 179.000đ/tháng ở mức thử nghiệm | học foundation và kỹ năng chuyên sâu | doanh thu thuê bao |
| Tăng tốc sản xuất | tool dùng credit | làm nhanh, đều và có chất lượng hơn | doanh thu theo mức sử dụng |

Không ép người dùng đi theo một đường thẳng. Các hành trình hợp lệ gồm:

```text
Bài viết -> bài thực hành -> Learn
Diagnostic -> challenge ba ngày -> Learn
Bài viết -> tool dùng thử -> mua credit
Challenge -> khóa chuyên sâu -> tool
Tool -> nhận ra thiếu nền tảng -> Foundation
Learn -> cần xây hệ thống kinh doanh -> Conan Maker
```

Mỗi bề mặt chỉ đưa ra một **bước tốt nhất tiếp theo** theo ngữ cảnh, không đặt nhiều
CTA cạnh tranh nhau.

## 5. Kiến trúc trải nghiệm năm không gian

### 5.1. `thongphan.com` — cửa chính

Sở hữu câu chuyện, niềm tin, nội dung công khai, catalog, commerce và những trải
nghiệm thử ban đầu.

Điều hướng chính đề xuất:

```text
Thư viện | Trải nghiệm | Học | Công cụ | Về Thông | [Tài khoản]
```

Conan Maker vẫn hiện diện trong menu mở rộng, footer và các handoff phù hợp, nhưng
không cạnh tranh với hành động đầu tiên của người mới.

### 5.2. Trung tâm Trải nghiệm

Một hub công khai tập hợp:

- diagnostic;
- bài viết tương tác;
- bài thực hành 20–45 phút;
- challenge 3, 7 và 21 ngày;
- buổi học miễn phí;
- tool dùng thử.

URL cuối cùng phải được kiểm tra với route graph hiện có trước implementation.
Nhãn hiển thị là `Trải nghiệm`; không dùng `Challenges` làm khái niệm bao trùm.

Mỗi mục công bố rõ người phù hợp, vấn đề, thời gian, đầu ra, điều kiện tài khoản,
giá/credit và bước tiếp theo.

### 5.3. `learn.thongphan.com` — không gian học tập

Ứng dụng tập trung vào Hôm nay, lộ trình, bài học, challenge trong khóa, tiến độ,
bằng chứng năng lực, Tác phẩm và Cat World. Không đưa blog, sales page dài hoặc quá
nhiều hoạt động bán hàng vào phiên học.

### 5.4. Khu vực Công cụ

Catalog công khai nằm tại `thongphan.com/tools`. Mỗi tool có trang giải thích, ví dụ,
giá credit và chế độ dùng thử. Runtime của tool có thể là app riêng, nhưng phải giữ
cùng danh tính, nhận diện, ví credit, kho Tác phẩm và lịch sử.

### 5.5. Không gian của tôi

Một hồ sơ xuyên hệ thống hiển thị:

- bước tốt nhất tiếp theo;
- nội dung đã lưu và đang đọc;
- challenge đang tham gia;
- khóa học và tiến độ;
- Tác phẩm đã tạo;
- tool gần đây;
- số dư và lịch sử credit;
- thuê bao, quyền truy cập và giao dịch.

## 6. Quyền sở hữu và giao thức chống xung đột

### 6.1. Quyền sở hữu theo repo

| Phạm vi | Repo/chủ sở hữu implementation |
| --- | --- |
| public discovery, article, diagnostic, Experience Hub, catalog, public commerce shell | `/Users/rio/thongphan-com` |
| learner runtime, Learning Core, identity hiện có, learning entitlement, progress, mastery, Cat World | `/Users/rio/Projects/learn-conan-school` |
| authoring lesson | `/Users/rio/plugins/learn-lesson-forge` |
| tool runtime tương lai | repo riêng được duyệt cho từng tool |
| hợp đồng xuyên sản phẩm | tài liệu thiết kế tại `thongphan-com`; implementation chỉ sau handoff có phiên bản |

### 6.2. Ranh giới luồng công việc hiện tại

Anh Thông đang phát triển Learn trong một luồng chat khác. Vì vậy luồng này:

- không sửa source, schema, migration, Worker, content package hoặc test của
  `/Users/rio/Projects/learn-conan-school`;
- không giả định commit hoặc trạng thái Learn đã đọc ngày 13/07/2026 sẽ còn nguyên;
- chỉ mô tả yêu cầu tích hợp và contract cần bàn giao;
- mọi thay đổi xuyên repo phải được tách thành commit riêng theo chủ sở hữu;
- không cherry-pick một commit chứa cả public site và Learn runtime;
- không để hai luồng cùng sửa một contract chưa có version và owner rõ ràng.

### 6.3. Điểm đồng bộ bắt buộc trước implementation

Trước mỗi lát cắt chạm Learn, agent thực thi phải:

1. đọc `docs/STATUS.md`, HEAD, worktree và diff hiện tại của cả hai repo;
2. xác nhận luồng Learn đã hoàn thành hoặc chưa chạm các file/contract liên quan;
3. lập ma trận `contract -> owner -> producer -> consumer -> version`;
4. thống nhất version mới và compatibility trước khi sửa producer;
5. triển khai consumer chịu được trạng thái contract cũ/mới nếu cần rollout lệch nhịp;
6. chạy contract test ở cả hai repo tại đúng commit đã ghi nhận;
7. cập nhật STATUS của repo thực sự bị thay đổi.

Nếu chưa có checkpoint này, phần Learn chỉ được dùng như một external dependency;
không được sửa để “tiện tích hợp”.

## 7. Experience Engine

Challenge không phải toàn bộ hành trình. Diagnostic, bài viết tương tác, bài thực hành,
challenge, buổi học thử và tool dùng thử là các loại experience dùng chung một hợp đồng.

Mỗi experience bắt buộc có:

- `id`, `version`, `type`, trạng thái xuất bản;
- nhóm người dùng và vấn đề;
- lời hứa cụ thể;
- thời lượng và điều kiện tham gia;
- đầu ra/Tác phẩm;
- cách xác nhận hoàn thành;
- access mode: công khai, cần tài khoản, thuê bao, mua riêng hoặc credit;
- bước tiếp theo;
- source/provenance của content và media;
- sự kiện đo lường bắt buộc.

Nội dung xuất bản có version bất biến. Chỉnh sửa tạo version mới và không làm hỏng
tiến độ hoặc Tác phẩm đã tham chiếu version cũ.

## 8. Các loại trải nghiệm chủ lực

### 8.1. Bài viết chuyên sâu có hành động

Nhịp mặc định:

1. gọi đúng biểu hiện;
2. kể một câu chuyện hoặc case thật;
3. tái định khung;
4. giải thích bằng framework, hình ảnh hoặc bằng chứng;
5. cho người đọc tự soi ngay trong bài;
6. tạo một đầu ra có thể lưu;
7. đưa ra đúng một bước tiếp theo.

Bài viết vẫn phải đọc trọn vẹn khi JavaScript lỗi. Phần tương tác là enhancement;
không được làm mất nội dung gốc.

### 8.2. Challenge

- 3 ngày: kết quả đầu tiên và kích hoạt người mới;
- 7 ngày: phát triển một kỹ năng hoặc hoàn thành một sản phẩm nhỏ;
- 21 ngày: thay đổi thói quen hoặc xây hệ thống có chiều sâu.

Mỗi ngày gồm: lý do, nội dung/video, ví dụ, một hành động chính, đầu ra, tiêu chí tự
kiểm tra và chuẩn bị cho ngày tiếp theo.

Challenge Engine hỗ trợ kickoff, media, tài liệu, nhiệm vụ, check-in, nhắc tiếp tục,
Tác phẩm cuối, phản tư trước/sau và handoff sang bài học/tool liên quan.

### 8.3. Tool dùng thử

Ba trạng thái:

1. xem mẫu bằng dữ liệu mẫu, không tốn credit;
2. tạo kết quả đầu tiên bằng dữ liệu thật với credit tặng;
3. sử dụng thường xuyên bằng credit.

Trước tác vụ phải công bố số credit, đầu ra dự kiến và dữ liệu được xử lý. Lỗi kỹ
thuật, timeout hoặc đầu ra không hợp lệ không được làm mất credit.

## 9. Tác phẩm dùng chung

`Tác phẩm` là đầu ra có giá trị được lưu theo version và thuộc về người dùng, ví dụ:

- bản đồ chuyên môn từ diagnostic;
- bản nháp bài viết từ tool;
- bài hoàn thành challenge;
- project từ Learn;
- lead magnet hoặc sản phẩm số nhỏ.

Hợp đồng xuyên sản phẩm tối thiểu cần:

- ID ổn định và owner;
- loại, source product và source version;
- trạng thái riêng tư/chia sẻ;
- metadata an toàn để hiển thị xuyên sản phẩm;
- pointer tới nội dung authoritative;
- version history;
- export và delete semantics.

Không sao chép nội dung Tác phẩm giữa nhiều database mà không có authority rõ ràng.
Hệ thống consumer chỉ giữ projection hoặc pointer cần thiết.

## 10. Thuê bao và quyền truy cập

### 10.1. Người dùng miễn phí

- nội dung công khai và diagnostic;
- challenge miễn phí ba ngày;
- một phần AI Foundation đủ tạo kết quả thật;
- hạn mức thử tool;
- lưu một số Tác phẩm;
- credit chào mừng một lần.

Tầng miễn phí phải tạo được kết quả thật, không phải demo bị khóa gần hết.

### 10.2. Thành viên Learn

Giá thử nghiệm đã duyệt: **179.000đ/tháng**. Giá năm tham chiếu là 1.790.000đ nhưng
chỉ mở sau khi kiểm chứng retention và cơ chế hoàn/hủy phù hợp.

Quyền lợi dự kiến:

- toàn bộ Foundation đã xuất bản;
- khóa chuyên sâu nằm trong thuê bao;
- challenge thành viên;
- tiến độ, bằng chứng và Tác phẩm trong giới hạn hợp lý;
- credit tool hằng tháng;
- giá mua thêm credit tốt hơn;
- gợi ý lộ trình dựa trên mục tiêu và bằng chứng học tập.

Không dùng blueprint hoặc nội dung chưa hoàn thiện để thổi phồng catalog.

### 10.3. Challenge mua riêng

- challenge 3 ngày thường miễn phí;
- challenge 7 ngày có thể miễn phí theo chiến dịch, mua riêng hoặc nằm trong thuê bao;
- challenge 21 ngày có thể nằm trong Learn và bán quyền riêng cho người ngoài;
- việc bù trừ giá challenge vào tháng Learn đầu là promotion có thời hạn, không phải
  luật entitlement vĩnh viễn.

Riêng Brain2 21 ngày, access hiện tại không thay đổi cho đến khi có migration plan,
security review và quyết định rõ về quyền của Conan Maker, Learn và người mua riêng.

### 10.4. Conan Maker

Conan có payment, entitlement và lợi ích riêng. Credit không mua được Conan. Thành
viên Learn không mặc định được giảm giá Conan.

## 11. Ví credit

| Nguồn | Mục đích | Chính sách đề xuất |
| --- | --- | --- |
| chào mừng | trải nghiệm tool lần đầu | hết hạn sau 30 ngày |
| thành viên | quyền lợi thuê bao | cộng dồn tối đa hai chu kỳ |
| mua thêm | sử dụng tool độc lập | hiệu lực ít nhất 12 tháng |

Trừ credit theo hạn gần nhất. Số credit và giá gói chỉ được chốt sau khi đo:

```text
chi phí model + hạ tầng + retry/hao hụt + phí thanh toán + biên lợi nhuận mục tiêu
```

Credit sử dụng sổ cái append-only/idempotent, không chỉ một trường số dư. Mỗi giao
dịch có source, amount, expiry, reason, idempotency key và liên kết tới tác vụ. Refund
tạo giao dịch bù, không sửa lịch sử.

Không có tool AI “không giới hạn” trong gói 179.000đ.

## 12. Danh tính và chuyển tiếp ngữ cảnh

Một người dùng có một danh tính xuyên hệ thống. Nền identity hiện có của Learn được
ưu tiên đánh giá để mở rộng; không tự xây hệ danh tính thứ hai cạnh tranh.

Handoff giữ được:

- nội dung/experience nguồn;
- mục tiêu đã chọn;
- diagnostic result an toàn;
- Tác phẩm liên quan;
- bước được đề xuất;
- return destination sau auth/payment.

Không đưa dữ liệu nhạy cảm vào URL. Cross-domain handoff dùng token ngắn hạn, một lần,
scope hẹp hoặc server-side session exchange đã được threat-model và test.

## 13. Đo lường

North-star metric:

> Số người tạo được một kết quả có ý nghĩa mỗi tuần.

Một kết quả có ý nghĩa gồm diagnostic hoàn chỉnh, Tác phẩm, ngày challenge hợp lệ,
bài học/thử thách năng lực, nội dung được xuất bản bằng tool hoặc lần quay lại phát
triển Tác phẩm cũ.

Vòng đời sự kiện chuẩn:

```text
seen -> started -> meaningful_action -> artifact_created -> completed
     -> returned -> paid
```

Nhóm báo cáo tối thiểu:

- activation và time-to-first-artifact;
- completion và tuần quay lại;
- MRR, free-to-paid, churn tháng 2/3;
- doanh thu credit và gross margin theo tool;
- hành trình article/experience/Learn/tool;
- Conan fit signal, không chỉ click CTA.

Sự kiện phải đến một sink thật và có schema/version. `CustomEvent` trong browser chỉ
là transport nội bộ, không được coi là analytics đã ghi nhận.

Học, tạo Tác phẩm và trừ credit không được phụ thuộc vào analytics availability.

## 14. Riêng tư và quyền người dùng

Chỉ thu dữ liệu phục vụ trực tiếp trải nghiệm. Người dùng được:

- xem dữ liệu và Tác phẩm;
- xem lịch sử credit và giao dịch;
- hiểu vì sao một bước được đề xuất;
- quản lý consent và email reminder;
- export và yêu cầu xóa dữ liệu.

Learning evidence không được dùng làm quảng cáo hoặc sales scoring ngoài consent đã
công bố. Handoff Conan chỉ dùng signal an toàn và không tự động gửi liên hệ.

## 15. Toàn vẹn nội dung và media

Mọi experience có source manifest, media manifest và parity/coverage gate phù hợp.
Challenge 21 ngày Brain2 là mẫu đầu tiên:

- đủ 21 ngày;
- giữ nội dung hữu ích đầy đủ, không thay bằng summary;
- kickoff video thật và media gốc có provenance;
- không mất link/asset mà không có quyết định;
- version hóa thay đổi;
- preview đúng bề mặt người dùng;
- public/protected boundary giữ nguyên.

Link và media lỗi phải có trạng thái rõ hoặc làm release gate fail; không im lặng
thay bằng placeholder generic.

## 16. Error handling và tính toàn vẹn thương mại

- Payment webhook/confirmation và entitlement grant idempotent.
- Gia hạn, grace period, hủy, refund và payment failure có state rõ.
- Subscription hết hạn không xóa tiến độ, evidence hoặc Tác phẩm.
- Credit reservation và finalization tách biệt cho tác vụ dài; lỗi giải phóng hoặc
  refund reservation.
- Retry cùng idempotency key không trừ hai lần.
- Consumer contract cũ không crash khi producer đã rollout version mới.
- Tool, analytics hoặc recommendation lỗi không chặn đọc/học.
- Link, asset, route và cross-domain return path có automated checks.

## 17. Lộ trình triển khai

### Giai đoạn 0 — nội dung và nguồn sự thật

- hoàn tất phục hồi Brain2 21 ngày theo spec riêng;
- khôi phục kickoff/media;
- khóa manifest, parity và visual QA;
- không thay đổi Learn trong lát cắt này.

### Giai đoạn 1 — vòng trải nghiệm miễn phí

- một bài chuyên sâu quanh `biến kinh nghiệm thành tài sản`;
- diagnostic Bản đồ tài sản chuyên môn;
- challenge miễn phí ba ngày;
- lưu Tác phẩm đầu tiên;
- handoff tới AI Foundation hoặc Brain2 theo nhu cầu.

### Giai đoạn 2 — tool content đầu tiên ở beta

Giải quyết một job trọn vẹn: biến trải nghiệm thật thành bài content có góc nhìn riêng
và có thể xuất bản. Cho kết quả đầu tiên miễn phí; chưa bán credit; đo chi phí, chất
lượng và reuse để xác định đơn vị credit cùng gross-margin gate.

### Giai đoạn 3 — thuê bao, tài khoản và ví thống nhất

Chỉ mở gói kết hợp Learn + monthly credit khi có nội dung Learn dùng được ngay và ít
nhất một tool có unit economics đã đo. Mở rộng identity/entitlement qua contract
versioned; triển khai subscription, credit ledger, artifact projection, history và
cross-domain handoff sau checkpoint với luồng Learn.

Learn được phép mở thuê bao sớm hơn theo luồng riêng nếu giá trị học tập tự thân đã đạt
release gate, nhưng không được quảng cáo credit hoặc tool chưa tồn tại. Khi thêm credit,
quyền lợi mới phải được công bố và cấp nhất quán cho thành viên đủ điều kiện.

### Giai đoạn 4 — vòng thương mại hoàn chỉnh

- kích hoạt monthly credit;
- mở bán credit mua thêm;
- nối Tác phẩm giữa Experience, Learn và tool;
- theo dõi free-to-paid, retention, tool reuse và gross margin;
- chỉ mở rộng sau khi giao dịch và đối soát pass production smoke.

### Giai đoạn 5 — nhân rộng

Chỉ thêm experience, course và tool sau khi vòng đầu có completion, retention, revenue
và gross-margin evidence.

## 18. Non-goals của bản đầu

- marketplace hoặc tác giả bên ngoài;
- nhiều cấp thuê bao;
- recommendation AI phức tạp;
- bán credit trước khi biết unit economics;
- tool content đa năng giải quyết mọi công việc;
- ép người dùng Learn/tool vào Conan;
- rebuild Learn hoặc identity trong luồng thongphan.com;
- nhân rộng challenge trước khi mẫu Brain2 và challenge ba ngày đạt gate.

## 19. Acceptance criteria cấp hệ thống

### Trải nghiệm

- Người mới hiểu năm không gian và bước đầu tiên mà không cần anh Thông giải thích.
- Người dùng đi từ bài viết/diagnostic tới Tác phẩm đầu tiên mà không gặp trang cụt.
- Mỗi handoff giữ ngữ cảnh, return path và focus/accessibility phù hợp.
- Mobile `320×568`, `390×844`, desktop, keyboard và reduced-motion pass.

### Nội dung

- Brain2 21 ngày đủ content/media theo spec phục hồi.
- Experience manifest và source/version coverage đạt 100% cho experience phát hành.
- Không link chết, asset thiếu hoặc protected body leak qua public bundle.

### Thương mại

- Subscription 179.000đ có state purchase/active/grace/cancelled/expired/refunded rõ.
- Entitlement idempotent và không xóa learning evidence khi hết hạn.
- Credit ledger đối soát được; lỗi không trừ credit; retry không trừ hai lần.
- Giá credit dựa trên chi phí thật và đạt gross-margin gate được duyệt.

### Đo lường

- Sink nhận được event versioned cho seen/start/meaningful/artifact/complete/paid.
- Dashboard trả lời được activation, retention, MRR/churn, tool margin và hành trình
  xuyên sản phẩm.
- Analytics outage không làm hỏng giao dịch hoặc trải nghiệm chính.

### Phối hợp

- Không có commit nào vô tình sửa cả Learn và thongphan.com trong cùng lát cắt.
- Mọi contract xuyên repo có owner, version, compatibility và consumer test.
- STATUS của hai repo phản ánh đúng commit và phase trước release.

## 20. Điều kiện chuyển sang implementation plan

1. Anh Thông duyệt bản đặc tả viết này.
2. Luồng Learn cung cấp checkpoint HEAD/STATUS mới trước mọi plan chạm Learn.
3. Kế hoạch được tách theo repo và owner, bắt đầu bằng lát cắt không xung đột.
4. Mỗi lát cắt có test, visual QA, migration/rollback và release gate tương xứng.
