# Thiết kế tái thiết thongphan.com thành hai con đường

- Ngày: 13/10/2026
- Nhánh: `feature/two-path-rebuild` (worktree `.worktrees/two-path-rebuild`, tách từ `origin/main` `106eb01`)
- Trạng thái: đã chốt thiết kế, chờ lập kế hoạch thực thi
- Chủ sản phẩm: Thông Phan

## 0. Thẩm quyền và ủy quyền

Anh Thông đã trực tiếp chốt các quyết định sau qua phiên hỏi đáp ngày 13/10/2026:

| Câu hỏi | Quyết định của anh |
|---|---|
| Nhánh đi làm | Tên hiển thị **Tensai**, đích `learn.thongphan.com`. "Odin" chỉ là tên nội bộ. |
| Định vị | **Thông là người dẫn đường.** AI đang đổi cách làm việc và làm ăn; người đọc chọn ngay ở màn hình đầu. Thay cả "Biến chuyên môn thật thành tài sản" lẫn "AI PHẢI RA TIỀN". |
| Ảnh | Dùng ngay nguồn đang có; anh bổ sung ảnh lúc nào thay lúc đó. |
| Phạm vi đợt 1 | Lõi mới + khung chung: `/`, `/tensai`, `/conan`, `/about`, cùng menu, footer, màu, chữ. Trang cũ giữ nội dung, mặc khung mới. |
| Đích Conan | Mọi CTA về `conan.school`. `/conanmaker/` chỉ còn link nhỏ ở footer, route giữ nguyên. Không hiện giá. |
| Bố cục | Hướng A: cửa chia đôi + hai trang nhánh, công tắc "Đi làm \| Kinh doanh" trên menu, ghi nhớ nhánh đã chọn. |
| Đường dẫn | `/tensai` và `/conan`. |
| Phần còn lại | "Em chủ động quyết định hết theo đề xuất, theo những gì em nghĩ tốt nhất cho anh." |

Anh đã duyệt nội dung (mục 2). Thẩm mỹ, kỹ thuật, QA (mục 3–7), chi tiết nội dung `/tensai`, `/conan` và phân bổ ảnh do agent tự chốt theo ủy quyền trên. Theo cùng ủy quyền, agent tự lập kế hoạch thực thi và làm theo TDD trong worktree mà không dừng chờ duyệt spec hay plan; anh vẫn có thể sửa spec bất cứ lúc nào.

Hai cổng **vẫn cần anh duyệt rõ ràng**, ủy quyền trên không thay thế:

1. Deploy preview và production.
2. Xác nhận consent cho ảnh có người nhìn rõ mặt (mục 5.3).

## 1. Kết quả, phạm vi, tiêu chí nghiệm thu

### 1.1 Kết quả cuối cùng

Người vào `thongphan.com` thấy ngay hai lối đi bằng ảnh thật. Người đi làm được dẫn tới Tensai, người đang hoặc muốn kinh doanh được dẫn tới Conan School. Thông xuất hiện như người dẫn đường, không phải người bán khóa học.

### 1.2 Làm trong đợt này

- Trang chủ mới `/`.
- Trang nhánh mới `/tensai` và `/conan`.
- `/about` sắp xếp lại và kết bằng hai cửa.
- Khung chung: header có công tắc nhánh, menu mobile, footer, token màu theo nhánh.
- Ảnh thật đã xử lý (crop, làm mờ khán giả) và manifest ảnh có trạng thái khuôn mặt.
- Bộ công cụ xử lý ảnh chạy local tại `scripts/photos/`.
- Đo lường bằng CustomEvent và UTM, không thêm công cụ analytics mới.
- Test hợp đồng mới thay cho test của trang chủ cũ.

### 1.3 Không làm trong đợt này

- Không viết lại nội dung các trang cũ (`/library`, `/blog`, `/diagnostic`, `/experiences`, `/assets`, `/chat`, `/brain2/*`, `/ebooks/*`). Các trang này chỉ nhận header và footer mới qua `SiteChrome`.
- Không đổi `/conanmaker/*`, `/game`, `/tpr`, `/classic`, `/concept`.
- Không mở `/learn*` (vẫn 404 theo `learnPublicEnabled`).
- Không thêm Google Analytics hay script đo lường của bên thứ ba.
- Không hiện giá, không hứa thu nhập, không dùng testimonial chụp số liệu doanh thu.
- Không dựng người, bằng chứng hay ảnh học viên bằng AI.
- Không xóa ảnh cũ trong `public/images/homepage/`; dọn dẹp để đợt sau.

### 1.4 Tiêu chí nghiệm thu quan sát được

1. `/` có đúng một `h1`, hai cửa bằng ảnh thật, cả hai cửa nằm trong màn hình đầu ở 390×844 và 1440×900.
2. Cửa "Tôi đi làm" dẫn tới `/tensai`; cửa "Tôi đang hoặc muốn kinh doanh" dẫn tới `/conan`.
3. CTA chính của `/tensai` mở `learn.thongphan.com` có UTM; CTA chính của `/conan` mở `conan.school` có UTM.
4. Sau khi xem `/tensai` hoặc `/conan`, quay lại `/` thấy dòng "Tiếp tục…" đúng nhánh; trang không tự chuyển.
5. Header ở mọi route unified có công tắc "Đi làm | Kinh doanh" (≥640px) hoặc hai nút lớn ở đầu menu mobile (<640px).
6. Không còn chuỗi "Biến chuyên môn thật thành tài sản" và "AI PHẢI RA TIỀN" trên `/`, `/tensai`, `/conan`, `/about`, header và footer.
7. Không ảnh nào trên route công khai có trạng thái `pending-owner-consent` khi chạy cổng phát hành.
8. Cổng phát hành của repo đạt (mục 7.1).
9. Ảnh chụp màn hình Playwright ở 5 viewport cho 4 route lõi và 3 route cũ: không tràn ngang, không lỗi console, không cắt chữ; đã tự xem lại từng ảnh.

## 2. Nội dung (anh đã duyệt)

Giọng: Thông xưng "tui", gọi người đọc là "bạn"; bình tĩnh, thẳng, không giáo trình. Trên trang chủ và trang nhánh không dùng từ đệm kiểu "há há". Không hứa thu nhập.

### 2.1 Trang chủ `/`

1. **Màn hình đầu.**
   - Dòng nhỏ: "Thông Phan · người dẫn đường".
   - `h1`: "AI đang đổi cách chúng ta làm việc và làm ăn. Bạn đang đứng ở phía nào?"
   - Hai cửa:
     - "Tôi đi làm" → `/tensai`. Phụ đề: "Học dùng AI cho việc thật mỗi ngày, cùng Tensai."
     - "Tôi đang hoặc muốn kinh doanh" → `/conan`. Phụ đề: "Xây doanh nghiệp trong kỷ nguyên AI, cùng Conan School."
   - Dòng tiếp tục (chỉ hiện khi đã từng chọn): "Lần trước bạn xem {Tensai | Conan School}. Tiếp tục →".
2. **Thư của Thông** (`h2` "Vì sao tui chia làm hai đường"). Bản nháp:
   > Tui từng thắng sự chú ý và thua ở sản phẩm cốt lõi. Hơn 2 tỷ nợ, mười năm sau vẫn chưa trả hết. Điều tui tiếc nhất không phải lần thất bại đó, mà là những bài học đã để trôi mất.
   >
   > Giờ AI đang đổi cách chúng ta làm việc và làm ăn nhanh hơn mọi lần tui từng thấy. Người đi làm và người kinh doanh đứng trước hai câu hỏi khác nhau, nên tui không nhét cả hai vào một chỗ.
   >
   > Nếu bạn đi làm, Tensai giúp bạn học dùng AI cho chính công việc mỗi ngày, từng bài ngắn một. Nếu bạn đang hoặc muốn kinh doanh, Conan School là cộng đồng nơi bạn xây doanh nghiệp cùng những người đang làm thật.
   >
   > Chọn một cửa. Tui đi cùng bạn đoạn đầu.
   >
   > *Thông Phan*
   - Câu nợ giữ nguyên văn với claim `hstl-debt`.
   - Chữ ký là tên gõ bằng Cormorant Garamond nghiêng, không làm chữ ký viết tay giả.
3. **Việc thật** (`h2` "Việc thật, không phải lời hứa"). Ba mục:
   - Ảnh buổi Offline Hà Nội 2026 "Cùng học viết Content" tại Flow Haus (`239f4131`), chú thích tên buổi và địa điểm.
   - Thẻ chữ: "Một bài viết vượt 12.000 lượt chia sẻ sau 14 tháng gần như không ai đọc." Nguồn: claim `rebuild-twelve-thousand-shares`, link `/about#origin-act-rebuilding`.
   - Thẻ chữ: "Brain2 đang chạy thật: 21 ngày, 21 đầu ra quan sát được." Nguồn: claim `brain2-twenty-one-outputs`, link `/brain2/21-ngay`.
4. **Hai cửa lặp lại** (`h2` "Bắt đầu từ chỗ bạn đang đứng"): hai nút lớn "Tôi đi làm → Tensai" và "Tôi kinh doanh → Conan School".

### 2.2 Trang Tensai `/tensai`

Nguồn đối chiếu ngày 13/10/2026: mã nguồn và tài liệu phát hành trong `/Users/rio/Projects/tensai-home` (`docs/tensai-home/RELEASE.md`, `docs/positioning-v8/release/RELEASE.md`, `definition-*.json`), cùng `learn.thongphan.com` trả 200 với tiêu đề "Tensai · Bất kỳ ai cũng là thiên tài nếu được học đúng cách".

1. **Màn hình đầu** (bố cục chia đôi: chữ trái, ảnh app phải; mobile ảnh xuống dưới chữ).
   - Dòng nhỏ: "Tensai · cho người đi làm".
   - `h1`: "Bất kỳ ai cũng là thiên tài nếu được học đúng cách." (khẩu hiệu chính thức của Tensai).
   - Đoạn dẫn, giọng Thông: "Tensai là nơi tui đặt những bài học ngắn để bạn dùng AI cho chính việc mình đang làm: hiểu AI làm được gì, giao việc có căn cứ và tự kiểm kết quả trước khi gửi đi."
   - CTA chính "Học thử miễn phí" → `learn.thongphan.com` có UTM. CTA phụ "Xem các khóa đang mở" → `#khoa-hoc`.
   - Dòng nhỏ dưới CTA: "Tensai mở từ 30/09/2026. Bạn là một trong những người học đầu tiên."
   - Ảnh: bản đồ khóa Định vị trên Tensai (ảnh chụp app live 01/10/2026), chú thích "Bản đồ khóa Định vị trên Tensai".
2. **Ba tình huống ở chỗ làm** (`h2` "Bạn có đang gặp một trong ba chuyện này?"). Mỗi tình huống dẫn về đúng một khóa đã phát hành:
   - "Mỗi tuần làm lại cùng một bản báo cáo bằng tay." → Workflow AI cơ bản ("Dựng và chạy một workflow báo cáo" là một bài thật trong khóa).
   - "AI trả lời rất trôi chảy, nhưng bạn không chắc nó đúng." → Hiểu về AI ("Vì sao AI có thể nói sai?", "Giao việc để AI có đủ căn cứ").
   - "Phải viết nội dung mà không biết nói gì cho khác người." → Định vị ("Để mỗi nội dung có một lý do").
3. **Các khóa đang mở** (`h2` "Các khóa đang mở", `id="khoa-hoc"`):

   | Khóa | Phụ đề chính thức | Quy mô | Mở từ |
   |---|---|---|---|
   | Workflow AI cơ bản | "Hiểu từ gốc. Thiết kế có lý do. Tự làm báo cáo của bạn." | 15 bài, 5 màn vượt ải | 30/09/2026 |
   | Hiểu về AI | "Hiểu cách LLM hoạt động. Dùng AI có căn cứ." | 6 bài, 2 màn vượt ải | 30/09/2026 |
   | Định vị | "Để mỗi nội dung có một lý do." | 12 bài, 4 màn vượt ải | 01/10/2026 |

   - Không liệt kê "Cách học đúng" và "Thuyết phục" (chưa phát hành).
   - Ghi dưới bảng: "Danh sách đối chiếu ngày 13/10/2026."
4. **Cách học trên Tensai** (`h2` "Đừng chỉ xem. Thử làm một chút."), ba bước, kèm ảnh chụp màn hình bài "Khách hiểu sản phẩm theo cách nào?":
   - "Một bài, một ý." Mỗi bài ngắn, đi từ khởi động đến tự vận dụng.
   - "Thử ngay trong bài." Bạn chạm, chọn, viết thử; sai thì sửa tiếp.
   - "Vượt ải để biết mình làm được." Cứ vài bài có một màn vượt ải với tình huống mới.
5. **Đóng trang**: CTA "Học thử miễn phí" lặp lại; link chéo "Bạn đang kinh doanh? Xem Conan School →" tới `/conan`.

Không hiện giá hay gói thành viên. Không dùng Bé Lửa hay font Nunito trên thongphan.com (giữ nhận diện brand mẹ; Bé Lửa chỉ xuất hiện khi nằm sẵn trong ảnh chụp app).

### 2.3 Trang Conan School `/conan`

Nguồn đối chiếu ngày 13/10/2026: HTML và chuỗi i18n đang chạy của `www.conan.school`, album ảnh công khai `/photos/*`, trang `/mentors`; kim chỉ nam lấy từ note Brain2 `02-Projects/Conan School.md`.

1. **Màn hình đầu** (ảnh tràn viền, chữ góc trái dưới trên lớp phủ ink).
   - Dòng nhỏ: "Conan School · cộng đồng cho người xây doanh nghiệp".
   - `h1`: "Xây doanh nghiệp đầu tiên trong kỷ nguyên AI." (h1 chính thức của conan.school).
   - Đoạn mô tả (nguyên văn conan.school): "Conan School là cộng đồng dành cho những người bắt đầu hành trình xây dựng doanh nghiệp trong kỷ nguyên AI. Bạn học business bằng cách hiểu khách hàng, thiết kế offer, xây sản phẩm thật và cải tiến với AI."
   - CTA chính "Vào Conan School" → `conan.school` có UTM.
   - Ảnh nền: buổi Offline Sài Gòn 2026 (`98a49e1f`).
2. **Kim chỉ nam** (khối trích dẫn lớn, Cormorant): "Chúng tôi không hứa giúp bạn đi nhanh nhất. Chúng tôi giúp bạn không đi sai." Dòng nguồn: "Kim chỉ nam của Conan School".
3. **Hai nhóm người đọc** (`h2` "Conan School dành cho ai"):
   - "Bạn muốn bắt đầu kinh doanh": có chuyên môn hoặc một ý tưởng, chưa biết biến nó thành thứ người khác muốn mua, muốn đi đúng từ đầu.
   - "Bạn đang kinh doanh": muốn hiểu khách hàng sâu hơn, làm lại offer và cách truyền đạt, đưa AI vào việc thật.
4. **Hành trình** (`h2` nguyên văn "Từ một câu hỏi đến năng lực của một Builder."; đoạn dẫn nguyên văn "Mỗi khóa học trả lời một Clarity Question. Đi hết chuỗi này, bạn xây đủ năng lực để học, nghĩ, hiểu người, chọn đúng cuộc chơi, tạo offer, truyền đạt và xây thứ chạy được."). Năm chặng và câu hỏi nguyên văn từ conan.school:

   | Chặng | Câu hỏi |
   |---|---|
   | 01 Learn & Think | Tôi có biết học không? · Tôi có nghĩ rõ không? · Điều tôi tin có đứng vững không? |
   | 02 Understand | Tôi có hiểu người không? · Tôi có hiểu đúng problem không? |
   | 03 Choose & Create | Tôi có chọn đúng game không? · Tôi có tạo thứ đáng mua không? |
   | 04 Communicate & Sell | Tôi có biết cần nói gì không? · Tôi có làm người khác nhìn thấy không? · Tôi có hiểu vì sao họ quyết định mua không? |
   | 05 Build | Tôi có thể biến idea thành thứ chạy được không? |

   - Bỏ câu hỏi của khóa "Ideas" vì conan.school đang ghi "Sắp có".
5. **Gallery** (`h2` "Ở Conan, việc học diễn ra như thế này"), ảnh từ album công khai "Cộng đồng có gì hay?" của conan.school:
   - Lớp học: `589d3613` "Lớp học AI Factory tại Hà Nội", `bce04c9f` (chú thích trung tính "Lớp AI Factory Design · Hà Nội · 2025").
   - Offline: `a6c20418` "Offline Hà Nội 2026 · Trao đổi về Decision Making", `239f4131` "Offline Hà Nội 2026 · Cùng học viết Content · Flow Haus", `52eb03ee` "Offline Hà Nội 2026 · KATINAT Kim Mã", `98a49e1f` "Offline Sài Gòn 2026 · Second Brain và Business".
   - Đào tạo doanh nghiệp: `1f236f14` "Training Content cho các MDRT tại Manulife · TECOS Building".
   - Sau giờ học: `22cbf614` "Đi ăn sau những giờ học căng thẳng".
   - Chú thích dạng "Tên sự kiện · nội dung hoặc địa điểm", chỉ ghi năm có trong tên sự kiện. Không in ngày cụ thể vì trường ngày trong CMS của album không đáng tin (hai buổi ở hai thành phố cùng ghi 12/06/2026).
   - Không gọi tên hay tuổi học viên trong chú thích.
   - **Loại khỏi trang:** `5dec322a` (có tờ giấy ghi mật khẩu Wi-Fi trong khung), `cb749871` (có trẻ em), `98bf59fc` (nhiều khách quán không thuộc buổi học), toàn bộ album "Member làm được gì?" (ảnh chụp số liệu doanh thu và tin nhắn có tên thật, dễ thành lời hứa thu nhập).
6. **Người dẫn đường** (`h2` "Người dẫn đường"): Đắc Nguyễn (CEO Conan School), Thông Phan (CMO Conan School), đúng chức danh trên conan.school. Ảnh chân dung, tên, vai trò.
6. **Đóng trang**: CTA "Vào Conan School" lặp lại; link chéo "Bạn đang đi làm? Xem Tensai →" tới `/tensai`.

### 2.4 Trang `/about`

- Giữ `DossierHeader`, đổi tiêu đề thành "Tui là người dẫn đường, vì tui đã đi sai đủ nhiều." Mô tả giữ ý "năm hồi kể bằng nguồn báo chí, lời kể cá nhân, ảnh có quyền dùng và hệ thống đang chạy".
- Năm hồi giữ nguyên claim từ `content/proof/origin-story-evidence.json`; câu "Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết." giữ nguyên văn.
- Ẩn khỏi bản hiển thị (không xóa khỏi JSON):
  - claim `conan-maker-handoff` (đích Conan đã chuyển sang conan.school);
  - asset có `generated: true` (ảnh minh họa sinh bằng AI, trái nguyên tắc "hình thật").
- Thêm khối "Vì sao có hai con đường" trước phần kết, nội dung rút gọn từ thư ở mục 2.1.
- Phần kết đổi từ "Đừng để thêm một bài học nào biến mất." sang hai cửa Tensai và Conan School; giữ link phụ "Xem nguồn và bằng chứng" tới `/library/proof-stack-thong-phan-2026`.

### 2.5 Menu và footer

- **Header:** logo "THÔNG PHAN"; công tắc "Đi làm | Kinh doanh" (`/tensai`, `/conan`, `aria-current="page"` khi đang ở trang đó); "Về Thông" (`/about`); nút "Thêm" mở danh sách Thư viện, Trải nghiệm, Chẩn đoán, 21 ngày Brain2 (và "Học" chỉ khi `learnPublicEnabled`).
- **Menu mobile** (<640px): hai nút lớn "Tôi đi làm · Tensai" và "Tôi kinh doanh · Conan School" ở đầu; sau đó Về Thông và các mục trong "Thêm".
- Bỏ điều hướng chương (`homepageChapterNavigation`) của trang chủ cũ.
- **Footer:** khẩu hiệu "Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI."; cột "Hai con đường" (Tensai, Conan School, kèm link ra ngoài có UTM); cột "Khám phá" (Về Thông, Thư viện, Bài viết, Trải nghiệm, Chẩn đoán, 21 ngày Brain2, Tài sản, Bàn hỏi); cột "Kết nối" (Facebook, LinkedIn, Messenger); dòng nhỏ cuối "Conan Maker" tới `/conanmaker/`.

## 3. Thẩm mỹ

### 3.1 Nền thương hiệu mẹ (giữ nguyên)

- Token: `--brand-ink #070706`, `--brand-ink-raised #12100F`, `--brand-paper #E8DFCF`, `--brand-reading-paper #F3EFE6`, `--brand-text-on-paper #171410`, `--brand-muted-on-paper #756D62`, `--brand-lacquer #B3231B`, `--brand-lacquer-bright #E04B43`.
- Chữ: Cormorant Garamond cho tiêu đề lớn, Be Vietnam Pro cho giao diện và thân bài. Tối đa 2 family mỗi route; không nạp Nunito.
- Bo góc 0–8px. Không glass, orb, bento, card bo tròn hàng loạt.
- Ảnh thật gánh phần lớn thị giác; chữ đặt trên ảnh luôn có lớp phủ ink để đạt tương phản.

### 3.2 Màu nhấn theo nhánh (endorsed brand)

Mỗi trang nhánh đặt `data-path="tensai"` hoặc `data-path="conan"` trên phần tử gốc. Màu nhấn chỉ dùng cho nền nút CTA, gạch chân link đang chọn và dấu nhỏ; không dùng làm màu chữ thân bài.

| Nhánh | `--path-accent` (dấu nhỏ trên bề mặt trang) | `--path-cta-bg` (nền nút) | `--path-cta-fg` (chữ trên nút) | Nguồn |
|---|---|---|---|---|
| Tensai | `#073B2F` trên reading paper (≈10,9:1) | `#C3F331` | `#073B2F` (≈9,6:1) | `tensai.css`: ink `#073b2f`, nút lime `#c3f331` |
| Conan | `#D94F2B` trên ink (≈3,9:1, chỉ cho dấu không phải chữ) | `#C4441F` | `#FFFFFF` (≈5,0:1) | primary `#d94f2b` của conan.school; nền nút đậm hơn để chữ trắng đạt AA |

- Trên trang chủ (nền ink), dấu nhánh Tensai dùng lime `#C3F331` (≈15:1 trên ink), dấu nhánh Conan dùng `#D94F2B`.
- `#D94F2B` không dùng làm màu chữ thân bài trên ink (dưới 4,5:1).
- Trang chủ không có `data-path`; hai cửa mang màu nhấn của nhánh tương ứng ở dấu nhỏ.
- Tương phản chữ trên nút phải ≥4,5:1; kiểm bằng `getComputedStyle` trong QA.

### 3.3 Bề mặt từng route

| Route | Route mode | Bề mặt |
|---|---|---|
| `/` | `cinema-dark` | Ink, ảnh tràn viền ở màn hình đầu, thư founder trên paper |
| `/tensai` | `editorial-light` | Reading paper, chữ ink, nút màu Tensai |
| `/conan` | `cinema-dark` | Ink, ảnh lớp offline tràn viền, gallery trên ink |
| `/about` | `cinema-dark` | Giữ nhịp paper/dark xen kẽ hiện có |

### 3.4 Chuyển động

- Không video ở màn hình đầu. Không parallax nặng.
- Hiện dần (fade/translate ≤16px, ≤400ms) bằng CSS và thuộc tính `data-motion-reveal` hiện có; tắt hoàn toàn khi `prefers-reduced-motion: reduce`.
- Hover cửa: ảnh phóng nhẹ 1.03 và mũi tên dịch 4px; có trạng thái `:focus-visible` tương đương.

## 4. Kỹ thuật

### 4.1 Route và trang

| File | Việc |
|---|---|
| `app/page.tsx` | Viết lại: dựng trang chủ từ `components/two-path/*`, metadata mới |
| `app/tensai/page.tsx` + `page.module.css` | Mới |
| `app/conan/page.tsx` + `page.module.css` | Mới |
| `app/about/page.tsx` | Đổi tiêu đề và metadata |
| `components/origin-story/OriginStory.tsx` | Lọc claim `conan-maker-handoff` và asset `generated`; thay phần kết bằng khối "Vì sao có hai con đường" + `PathDoors` |
| `lib/site-route-mode.ts` | Thêm exact `/tensai` → `editorial-light`, `/conan` → `cinema-dark` |
| `app/sitemap.ts` | Thêm `/tensai`, `/conan` |

### 4.2 Thành phần mới `components/two-path/`

| Thành phần | Loại | Trách nhiệm |
|---|---|---|
| `PathDoors.tsx` | server | Hai cửa ảnh thật; biến thể `hero` (đè mép dưới màn hình đầu) và `closing` (hai nút lớn) |
| `PathLink.tsx` | client | Link nội bộ hoặc ra ngoài; khi bấm dispatch CustomEvent; link ra ngoài gắn UTM qua `lib/two-path-links.ts` |
| `PathMemory.tsx` | client | Đặt trên `/tensai` và `/conan`; khi mount ghi `localStorage['tp:path']`; bọc try/catch; không render gì |
| `PathResume.tsx` | client | Đọc `tp:path` bằng `useSyncExternalStore` (server snapshot `null`); hiện dòng "Tiếp tục…"; không tự chuyển trang |
| `FounderLetter.tsx` | server | Ảnh chân dung sân khấu + thư + chữ ký gõ |
| `FieldNotes.tsx` | server | Dải "Việc thật": 1 ảnh + 2 thẻ chữ có nguồn |
| `PhotoGallery.tsx` | server | Lưới ảnh theo nhóm, chú thích dưới ảnh |
| `MentorCards.tsx` | server | Chân dung lớn, tên, vai trò |
| `TwoPath.module.css` | CSS Module | Token `--path-accent`, `--path-cta-bg`, `--path-cta-fg` theo `data-path`; bố cục chung |

Ràng buộc chung: CSS Modules, không Tailwind; icon chỉ `lucide-react` import từng icon; không vẽ SVG tay; `next/image` với `unoptimized` theo cấu hình hiện có, có `width`, `height`, `sizes`, `alt`.

### 4.3 Nội dung và ảnh có kiểu

- `lib/two-path-content.ts`: toàn bộ chữ của `/`, `/tensai`, `/conan` dạng hằng có kiểu; component không chứa chuỗi nội dung dài.
- `lib/two-path-photos.ts`: manifest ảnh.

```ts
export type FaceStatus =
  | 'none'                   // no people or no identifiable faces
  | 'thong-only'             // only Thông is identifiable
  | 'blurred'                // bystander faces blurred locally
  | 'consent-confirmed'      // owner confirmed consent (record who/when in consentNote)
  | 'pending-owner-consent'  // identifiable people, consent not yet confirmed

export type TwoPathPhoto = {
  id: string
  src: `/images/two-path/${string}.webp`
  width: number
  height: number
  alt: string
  caption?: string
  source: string        // original file or public album URL
  faces: FaceStatus
  consentNote?: string
  budgetBytes: number
}
```

- `lib/two-path-links.ts`: hằng `TENSAI_URL`, `CONAN_URL` và hàm `withUtm(url, placement)` với `utm_source=thongphan.com&utm_medium=referral&utm_campaign=two-path&utm_content=<placement>`; `placement` thuộc `hero | door | nav | footer | page | closing`.

### 4.4 Khung chung

- `components/site-chrome/site-navigation.ts`: thay `primaryNavigation`, `secondaryNavigation`, `homepageChapterNavigation` bằng:
  - `pathNavigation` (Đi làm → `/tensai`, Kinh doanh → `/conan`);
  - `aboutNavigation` (Về Thông → `/about`);
  - `getMoreNavigation(includeLearn)` (Thư viện, Trải nghiệm, [Học], Chẩn đoán, 21 ngày Brain2);
  - `footerExploreNavigation`, `footerUtilityNavigation` (Conan Maker).
- `SiteHeader.tsx`: công tắc nhánh dạng segmented link (≥640px), "Về Thông", nút "Thêm" (`aria-expanded`, `aria-controls`, đóng bằng Escape và click ra ngoài, trả focus về nút).
- `MobileMenu.tsx`: hai nút nhánh lớn ở đầu, giữ cơ chế khóa focus hiện có.
- `SiteFooter.tsx`: theo mục 2.5.
- `SiteChrome.tsx`: giữ cấu trúc; `DefaultHeader`/`DefaultFooter` của route legacy không đổi.

### 4.5 Gỡ trang chủ cũ

- Xóa `components/home-cinema/*` và `lib/homepage-proof-assets.ts` (chỉ trang chủ cũ và test của nó dùng).
- Xóa test `scripts/homepage-proof-assets.test.ts`, `scripts/homepage-cinematic-contract.test.mjs`, `scripts/home-cinema-content.test.ts`; bỏ khỏi `test` và `test:full-with-tpr` trong `package.json`.
- Sửa các test đang khẳng định hành vi cũ: `site-chrome-contract`, `motion-atmosphere-contract`, `seo-contract`, `site-route-mode`, `learn-public-contract`, `learn-release-gate`, `homepage-build-contract`, `origin-story-route` và các test khác mà kế hoạch thực thi phát hiện khi chạy bộ test đầy đủ.

### 4.6 Test mới

| Test | Nằm trong | Khẳng định |
|---|---|---|
| `scripts/two-path-content.test.ts` | `npm test` | Chữ cấm không xuất hiện; không có giá; mọi link ra ngoài có UTM; claim trích dẫn khớp JSON nguồn |
| `scripts/two-path-photos.test.ts` | `npm test` | Mọi ảnh trong manifest tồn tại, đúng kích thước, dưới ngân sách, có `alt` và `source`; ảnh `consent-confirmed` phải có `consentNote` |
| `scripts/two-path-route-contract.test.mjs` | `npm test` | Cấu trúc nguồn: một `h1` mỗi trang, `data-path` đúng, `PathMemory` có trên hai trang nhánh, header có công tắc |
| `scripts/homepage-build-contract.test.mjs` (viết lại) | `test:build` | `out/index.html`, `out/tensai.html`, `out/conan.html` có đúng một `h1`, không `<video>`, có link `/tensai` và `/conan`; ngân sách ảnh và JS trang chủ |
| `scripts/two-path-photo-consent.test.ts` | `test:release` (bước cuối) | Không ảnh nào dùng trên route công khai có `faces: 'pending-owner-consent'` |

Cổng consent đặt ở bước cuối `test:release` để mọi cổng kỹ thuật chạy trước; khi chỉ còn cổng này đỏ, báo cáo ghi rõ đang chờ anh xác nhận.

### 4.7 SEO

- Metadata qua `createPageMetadata` cho 4 route.
  - `/`: "Thông Phan — Người dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI".
  - `/tensai`: "Tensai — Học dùng AI cho việc thật mỗi ngày | Thông Phan".
  - `/conan`: "Conan School — Xây doanh nghiệp trong kỷ nguyên AI | Thông Phan".
- Ảnh OG dùng ảnh thật đã xử lý của từng route.
- JSON-LD: giữ `Person` hiện có; thêm `WebPage` cho hai trang nhánh; không khai báo `Course` hay `Offer` (không có giá).

## 5. Ảnh

### 5.1 Nguồn và vai trò

| Vai trò | Nguồn | Xử lý | Trạng thái khuôn mặt |
|---|---|---|---|
| Nền màn hình đầu `/` | `/Users/rio/Downloads/DQH179.JPG` (7008×4672), Thông trên sân khấu nhìn xuống hội trường | Làm mờ khán giả trừ dáng Thông; crop 16:9 (desktop) và 4:5 (mobile) | `blurred` |
| Chân dung thư founder | `/Users/rio/assets/branding/thongphan-speaker-hires.jpg` (1365×2048) | Crop 4:5 bỏ dòng "TĂNG 50% LỢI NHUẬN" trên slide; khán giả quay lưng | `thong-only` |
| Cửa Tensai | `public/images/homepage/proof/thong-author-book-3x2-v1.webp` | Crop 4:5 | `thong-only` |
| Cửa Conan | Album conan.school, "Lớp học AI Factory tại Hà Nội" (`589d3613`) | Crop 4:5 | `pending-owner-consent` |
| Màn hình đầu `/conan` | Album conan.school, "Offline Sài Gòn 2026" (`98a49e1f`) | Crop 16:9 và 4:5 | `pending-owner-consent` |
| "Việc thật" trên `/` | Album conan.school, "Offline Hà Nội 2026 · Cùng học viết Content · Flow Haus" (`239f4131`) | 3:2 | `pending-owner-consent` |
| Gallery `/conan` | 8 ảnh liệt kê ở mục 2.3 (`589d3613`, `bce04c9f`, `a6c20418`, `239f4131`, `52eb03ee`, `98a49e1f`, `1f236f14`, `22cbf614`) | 4:3 | `pending-owner-consent` |
| Mentor Conan | Ảnh mentor trên conan.school: Đắc Nguyễn, Thông Phan | 4:5 | Đắc Nguyễn `pending-owner-consent`; Thông `thong-only` |
| Màn hình đầu `/tensai` | `/Users/rio/Projects/tensai-home/docs/positioning-v8/release/screens/live-map.png` (1905×867): bản đồ khóa Định vị trên learn.thongphan.com | Crop vùng nội dung (x≈320–1370), xuất ~1600px rộng | `none` |
| Mục "Cách học" `/tensai` | `.../release/screens/live-lesson-intro.png` (1905×867): mở đầu bài "Khách hiểu sản phẩm theo cách nào?" | Crop vùng nội dung | `none` |

Ảnh chụp app Tensai đã tự xem ngày 13/10/2026: không có tên, email hay dữ liệu học viên; Bé Lửa xuất hiện vì nằm sẵn trong giao diện app, không dùng Bé Lửa ở chỗ khác trên thongphan.com. Repo tensai-home chỉ đọc; ảnh được copy rồi xử lý trong worktree này.

Ảnh bị loại: `5dec322a`, `cb749871`, `98bf59fc` và album "Member làm được gì?" (lý do ở mục 2.3).

Không dùng `screenforge-production-3x2-v1.webp` cho Tensai (không phải sản phẩm Tensai). Không dùng ảnh `thongphan_01/02/03` (341×512, quá nhỏ).

### 5.2 Ngân sách

- Ảnh màn hình đầu: ≤180KB mỗi biến thể (desktop 1920×1080, mobile 900×1125).
- Ảnh cửa, chân dung, "Việc thật": ≤140KB.
- Ảnh gallery: ≤120KB (1200×900).
- Mentor: ≤60KB (480×600, nguồn chỉ 384px nên xuất đúng 384px, không phóng to).
- Định dạng webp; giữ tỷ lệ gốc trong manifest.

### 5.3 Consent

- Ảnh có người nhìn rõ mặt không phải Thông chỉ được lên production khi:
  - đã làm mờ (`blurred`), hoặc
  - anh xác nhận consent (`consent-confirmed`, ghi `consentNote` dạng "Thông xác nhận ngày dd/mm/yyyy: ...").
- Ảnh album conan.school là ảnh nhóm tạo dáng, do Conan School công bố. Làm mờ sẽ phá ảnh nên **không làm mờ**; gắn `pending-owner-consent` và hỏi anh trong báo cáo cuối.
- Nếu anh không xác nhận, phương án dự phòng là thay bằng ảnh của Thông hoặc ảnh không nhận diện được; cổng consent ngăn production cho tới lúc đó.

### 5.4 Bộ công cụ ảnh `scripts/photos/`

Chỉ chạy local trên macOS, không nằm trong build, không gọi dịch vụ trả phí.

- `detect-faces.swift`: Vision `VNDetectFaceRectanglesRequest` revision 3 trên toàn khung và các ô 1400px bước 1000px, khử trùng lặp; in JSON tọa độ pixel.
- `person-mask.swift`: `VNGeneratePersonInstanceMaskRequest`, chọn instance lớn nhất, ghi mask PNG đúng độ phân giải gốc.
- `blur-audience.py`: làm mờ dải khán giả có mép mờ dần, trừ mask người nói; chỉ thêm vệt mờ elip cho mặt nằm ngoài dải; xuất ảnh trung gian.
- `export-webp.py`: crop theo tỷ lệ, resize, xuất webp dưới ngân sách.
- `README.md`: lệnh chạy, yêu cầu (`swift`, `python3` có Pillow), và quy tắc bắt buộc tự xem ảnh sau khi làm mờ.

Ảnh gốc (DQH179 7008px) không commit; chỉ commit webp đã xuất.

## 6. Đo lường

- Không thêm script đo lường. Hiện trang không có analytics script nào; trạng thái bật/tắt Cloudflare Web Analytics ở cấp Pages là **chưa kiểm chứng**.
- CustomEvent (móc nối cho công cụ sau này):
  - `path_door_selected`, `detail: { path: 'tensai' | 'conan', placement }`;
  - `outbound_tensai`, `outbound_conan`, `detail: { placement }`.
- UTM trên mọi link ra `learn.thongphan.com` và `conan.school` theo mục 4.3. Đo chuyển đổi ở phía Tensai và Conan School (nếu hai bên có đo lường).
- Không tuyên bố số liệu traffic hay chuyển đổi khi chưa có đo lường.

## 7. QA và phát hành

### 7.1 Cổng phát hành

```bash
npm ci && npm test && npx tsc --noEmit && npm run build && npm run test:release && git diff --check
```

### 7.2 Kiểm giao diện thật

- Script `scripts/qa-two-path.mjs` (Playwright có sẵn trong repo, chạy trên `out/` qua server tĩnh local):
  - Route: `/`, `/tensai`, `/conan`, `/about`, `/library`, `/blog`, `/diagnostic`.
  - Viewport: 1440×900, 1280×720, 1024×768, 390×844, 320×568.
  - Ghi ảnh chụp toàn trang và màn hình đầu vào `qa/two-path/`.
  - Khẳng định: `scrollWidth ≤ innerWidth`; không lỗi console; đúng một `h1`; mọi ảnh `naturalWidth > 0`; vùng chạm của link/nút trong header, cửa và CTA ≥44px; cả hai cửa nằm trong màn hình đầu ở 390×844 và 1440×900.
- Kiểm bàn phím: Tab qua header, nút "Thêm" (Escape đóng, focus trở về), menu mobile, hai cửa; `:focus-visible` nhìn thấy được.
- Kiểm `localStorage`: xem `/conan`, về `/`, thấy "Tiếp tục… Conan School"; chế độ chặn storage không lỗi.
- Kiểm tương phản chữ trên ảnh và trên nút nhánh bằng giá trị computed.
- Tự xem từng ảnh chụp, sửa lỗi bố cục, tràn dòng, cắt chữ, tương phản, trạng thái rỗng trước khi báo cáo.
- So cạnh mẫu Mobbin (mục 8): ghép ảnh chụp thật với ảnh mẫu tương ứng thành tấm so sánh trong `qa/two-path/mobbin/`.

### 7.3 Phát hành

1. Commit theo từng bước, stage file tường minh, push nhánh `feature/two-path-rebuild`. Push không đồng nghĩa với được deploy.
2. Cập nhật `docs/STATUS.md` mục mới ở đầu file.
3. **Dừng.** Xin anh duyệt deploy preview (`npx wrangler pages deploy out --project-name thongphan-com --branch preview-<commit> --commit-hash <commit>`).
4. Sau preview, xin anh duyệt production (`--branch main`) và xác nhận consent ảnh.
5. Quay lui: deployment Pages production trước đó (ghi mã deployment vào STATUS trước khi deploy).

## 8. Ánh xạ mẫu Mobbin

| Khu vực | Mẫu | URL | Lấy gì | Đổi gì |
|---|---|---|---|---|
| Hai cửa đè mép màn hình đầu | Contra | https://mobbin.com/sites/sections/0e71cc83-e290-499f-8060-cdae5f763d98 | Hai panel ảnh lớn cạnh nhau, nhãn ngắn | Ảnh thật của Thông và lớp Conan; nhãn tiếng Việt theo người đọc |
| Hai cửa | Seed | https://mobbin.com/sites/sections/2787e930-75cc-4a53-af4e-378b8cfdc22c | Panel ảnh có tiêu đề nằm trong ảnh | Lớp phủ ink cho tương phản |
| Màn hình đầu bằng ảnh | Square | https://mobbin.com/sites/sections/29337e63-1f63-4b05-bdfd-672cd2a1f5ed | Ảnh tràn viền, tiêu đề lớn góc trái | Cormorant, gradient ink từ trái |
| Màn hình đầu chia đôi | Square | https://mobbin.com/sites/sections/2db28706-46d4-4ca6-b94d-74d7fce42780 | Chia đôi ảnh và chữ | Dùng cho `/tensai` (chữ trái, ảnh app phải) |
| Ảnh lớn, chữ tối giản | Rivian | https://mobbin.com/sites/sections/cb7032a4-86c3-4b9a-8641-04ade2ebc1a4 | Nhịp ảnh lớn, chữ ít | Màn hình đầu `/conan` |
| Thư founder | Patch | https://mobbin.com/sites/sections/c0d0e236-a289-4cdc-8bfa-731de969cf49 | Thư dài trên nền giấy, chữ ký | Chữ ký gõ, không giả viết tay |
| Thư founder | incident.io | https://mobbin.com/sites/sections/67e11461-af20-4b7e-8e9a-8f0cdc669a8d | Ảnh + thư + chữ ký | Ảnh sân khấu thật |
| Thư founder | KÖPPEN | https://mobbin.com/sites/sections/81d6349f-9811-4b17-9b2d-327dbabfa4fa | Chân dung lớn cạnh ghi chú | Tỷ lệ 4:5 |
| Thư founder | Zellerfeld | https://mobbin.com/sites/sections/09a9a70b-70f6-49d9-8966-d5524e46f120 | Tiêu đề trái, thư phải | Desktop ≥1024px |
| Gallery | Plain | https://mobbin.com/sites/sections/6849b42b-fd97-486b-b6a9-df81b07e7480 | Lưới tối, ảnh thật, chú thích nhỏ | Nhóm theo loại hoạt động |
| Chú thích ảnh | Aino | https://mobbin.com/sites/sections/6e82f83c-f6fb-410d-ad9c-cdd19a453bb8 | Chú thích dưới ảnh | Tên sự kiện và nội dung buổi |
| Chú thích sự kiện | Pentagram | https://mobbin.com/sites/sections/0dcc75b6-c115-40f0-af00-fc6d69e50fd0 | Dòng meta sự kiện | Chỉ in năm có trong tên sự kiện, không in ngày cụ thể |
| Công tắc nhóm người đọc | Klarna | https://mobbin.com/sites/sections/b955d30d-fd93-4b0d-99df-857e6aa81c91 | Segmented "For shoppers \| For business" trên header | "Đi làm \| Kinh doanh"; mobile chuyển vào menu |
| CTA đóng trang hai nút | Square | https://mobbin.com/sites/sections/05188221-44f8-4e82-8cfb-78a99afc647c | Hai nút lớn song song cuối trang | Hai cửa lặp lại |
| Người dẫn đường | Upwork | https://mobbin.com/sites/sections/5cca6507-8115-448d-b83c-6a7da8081572 | Chân dung lớn, tên, vai trò | Mentor Conan |
| Người dẫn đường | ClassPass | https://mobbin.com/sites/sections/2c544a1e-a7a8-4078-9a4a-76122e4971ea | Thẻ người hướng dẫn | Tối giản, không đánh giá sao |

Ảnh mẫu đã xem trực tiếp qua Mobbin MCP ngày 13/10/2026. Đây là ảnh tĩnh; không suy ra chuyển động từ mẫu.

## 9. Rủi ro và cách xử lý

| Rủi ro | Xử lý |
|---|---|
| Anh không xác nhận consent ảnh Conan | Cổng consent chặn production; thay ảnh theo mục 5.3 |
| Câu chữ thư founder chưa đúng giọng anh | Bản nháp trong mục 2.1; anh sửa trực tiếp trong `lib/two-path-content.ts` hoặc báo em sửa |
| Hành trình Conan hoặc khóa Tensai đổi sau khi build | Nội dung đã đối chiếu ngày 13/10/2026 và nằm tập trung trong `lib/two-path-content.ts`; trang ghi "Danh sách đối chiếu ngày …"; ghi ngày đối chiếu vào STATUS |
| Trường ngày trong album conan.school không đáng tin | Chú thích không in ngày cụ thể, chỉ in năm có trong tên sự kiện |
| Kim chỉ nam Conan chưa có trên conan.school | Nguồn là note Brain2 `02-Projects/Conan School.md`; ghi nguồn trong `lib/two-path-content.ts`; anh có thể bỏ khối này nếu chưa muốn công bố |
| Gỡ trang chủ cũ làm vỡ test khác | Chạy toàn bộ `npm test` sau khi gỡ; sửa từng test theo hành vi mới, không xóa test ngoài danh sách mục 4.5 khi chưa ghi lý do |
| Màu nhấn nhánh làm loãng thương hiệu mẹ | Chỉ dùng cho CTA và dấu nhỏ; nền vẫn ink/paper |
| Ảnh màn hình đầu vượt ngân sách | Giảm chất lượng webp hoặc kích thước theo bước 5% tới khi đạt; tự xem lại độ nét |
