# vid.thongphan.com — Thông Phan Screening Room

**Trạng thái:** Được anh Thông ủy quyền tự quyết và triển khai  
**Ngày:** 2026-08-12  
**Repo:** `/Users/rio/thongphan-com`  
**Runtime mục tiêu:** Next.js static export + Cloudflare Worker/D1 + Bunny Stream  
**Tên làm việc:** `Thông Phan Screening Room`

## 1. Quyết định sản phẩm

`vid.thongphan.com` là thư viện video công khai do Thông Phan tuyển chọn. Trải
nghiệm khám phá và xem phải quen thuộc như YouTube, nhưng nhận diện thuộc hệ
Cinema hiện có của thongphan.com.

Video không được dịch, dựng hoặc lồng tiếng bên trong sản phẩm này. Pipeline
`youtube-vietnam` tạo file MP4 hoàn chỉnh; Screening Room chỉ nhận file hoàn
chỉnh, tải trực tiếp lên Bunny Stream, biên tập metadata và xuất bản.

Chỉ anh Thông có quyền quản trị. Khi anh yêu cầu trong Codex, Codex dùng công cụ
quản trị local để tải lên. Bản đầu tiên không có tài khoản người xem, bình luận,
thích hay đăng ký kênh.

Mọi video dịch phải công bố nguồn gốc: tác giả/kênh gốc, URL video gốc và nhãn
`Bản thuyết minh tiếng Việt do Thông Phan tuyển chọn`.

## 2. Mục tiêu

1. Người xem tìm được một video đáng xem trong dưới 30 giây.
2. Việc xem, tìm kiếm, xem tiếp, danh sách phát và video liên quan quen thuộc
   với người đã dùng YouTube.
3. Mỗi video có nguồn gốc rõ, nội dung tự nhiên và hình ảnh đúng tỉ lệ.
4. Anh Thông chỉ cần gửi file hoàn chỉnh cùng thông tin nguồn cho Codex; upload
   lớn có thể tiếp tục khi mạng gián đoạn.
5. Thêm video mới không cần rebuild/deploy website.
6. Hạ tầng chịu được một thư viện lớn mà không đưa file video vào Git, Pages
   hoặc máy chủ ứng dụng.

## 3. Ngoài phạm vi bản đầu tiên

- tự dịch, tạo giọng đọc, dựng hoặc chỉnh sửa video;
- tài khoản người xem và đồng bộ đa thiết bị;
- bình luận, thích, theo dõi kênh, thông báo hoặc cộng đồng;
- phát trực tiếp;
- quảng cáo, trả phí theo video hoặc khóa nội dung;
- hệ quản trị công khai trong trình duyệt;
- tự động tuyên bố quyền sử dụng nội dung;
- thay đổi runtime hoặc source của `learn.thongphan.com`;
- sửa các thay đổi Brain2, Conan Maker hoặc Learn thuộc luồng khác.

## 4. Ba hướng đã cân nhắc

### A. Bản sao YouTube đổi màu

Giữ gần như nguyên bố cục YouTube rồi thay màu và logo. Dễ học nhưng thương hiệu
yếu, nhanh cũ và có cảm giác sao chép bề mặt.

### B. Rạp phim nghệ thuật thuần túy

Hero lớn, poster điện ảnh, ít chrome, ưu tiên cảm xúc. Đẹp nhưng tìm kiếm và xem
nhiều video chậm; không đạt yêu cầu “dùng như YouTube”.

### C. YouTube Familiarity × Thông Phan Cinema — chọn

Giữ mô hình tương tác đã quen: thanh trên, thanh bên, chip chủ đề, lưới 16:9,
trang xem hai cột, danh sách phát, tìm kiếm và xem tiếp. Bề mặt dùng ink, paper,
lacquer red, typography và motion của Unified Cinema. Đây là hướng cân bằng giữa
khả năng sử dụng và khác biệt thương hiệu.

## 5. Kiến trúc thông tin

### 5.1 Điều hướng desktop

- `Trang chủ`
- `Chủ đề`
- `Danh sách phát`
- `Xem tiếp`
- `Xem sau`
- liên kết trở về `thongphan.com`

Thanh trên được ghim, gồm wordmark `VID · THÔNG PHAN`, tìm kiếm, nút mở/thu gọn
thanh bên và liên kết hệ sinh thái. Không có avatar giả hoặc nút đăng nhập.

### 5.2 Điều hướng mobile

Thanh trên giữ wordmark và tìm kiếm. Thanh dưới ghim ba đích chính: `Trang chủ`,
`Chủ đề`, `Thư viện`. `Thư viện` chứa Xem tiếp, Xem sau và danh sách phát.
Mọi mục tiêu chạm tối thiểu 44 × 44 px.

### 5.3 URL công khai

URL bên ngoài dùng subdomain và query string để không phụ thuộc dynamic static
routes:

- `/` — trang chủ;
- `/watch?v=<slug>` — trang xem;
- `/results?search_query=<query>` — kết quả tìm kiếm;
- `/topic?slug=<slug>` — một chủ đề;
- `/playlist?list=<slug>` — danh sách phát;
- `/library` — xem tiếp và xem sau local.

Source Next.js đặt dưới `/vid/*`. Worker của subdomain ánh xạ các URL ngắn ở trên
về static shell tương ứng mà không redirect lộ `/vid`.

## 6. Trải nghiệm chính

### 6.1 Trang chủ

Thứ tự:

1. hàng chip chủ đề cuộn ngang;
2. một `Suất chiếu nổi bật` gọn, không cao quá 52% viewport desktop;
3. `Mới tuyển chọn`;
4. `Xem tiếp` nếu local storage có tiến độ;
5. các lane theo chủ đề/danh sách phát;
6. toàn bộ video mới nhất.

Card dùng ảnh 16:9, duration ở góc dưới, tiêu đề tối đa hai dòng, tên nguồn,
ngày xuất bản và trạng thái tiến độ. Không crop khuôn mặt bằng một object-position
chung; thumbnail là derivative đã duyệt hoặc thumbnail do Bunny tạo tại mốc được
chọn.

Hover sau 650 ms mới tải `preview.webp`; card nâng 2 px và ánh sáng projector đi
qua bề mặt. Không autoplay âm thanh. Reduced motion giữ ảnh tĩnh.

### 6.2 Tìm kiếm và lọc

Tìm theo tiêu đề, mô tả, tác giả gốc, chủ đề, thẻ và danh sách phát. Chuẩn hóa
tiếng Việt để `đ` và `d` có thể khớp. Kết quả phân trang, URL giữ query để chia sẻ
và nút xóa tìm kiếm luôn có accessible name.

### 6.3 Trang xem

Desktop: player 16:9 và nội dung ở cột chính; video liên quan ở cột phải. Mobile:
player ở đầu, metadata, nguồn và video liên quan xếp dọc.

Các khả năng bắt buộc:

- adaptive playback do Bunny Player cung cấp;
- tốc độ, phụ đề, keyboard, toàn màn hình và picture-in-picture khi player hỗ trợ;
- tiêu đề, mô tả rút gọn/mở rộng;
- nguồn gốc và CTA `Xem video gốc`;
- nhãn bản thuyết minh;
- danh sách chủ đề/thẻ;
- chia sẻ URL, sao chép URL tại thời điểm hiện tại;
- video trước/sau trong playlist;
- liên quan có lý do rõ theo chủ đề, thẻ và playlist;
- tự lưu tiến độ vào local storage, không gửi lịch sử cá nhân lên server.

Player không bị ánh sáng/grain phủ lên vùng video hay controls.

### 6.4 Xem tiếp và Xem sau

Không cần tài khoản. Dữ liệu local có version, giới hạn kích thước, fail closed khi
hỏng và chỉ lưu slug, giây đã xem, duration, cập nhật gần nhất cùng danh sách slug
được đánh dấu. Tiến độ dưới 10 giây hoặc trên 95% không đưa vào `Xem tiếp`.

### 6.5 Empty, loading và error

- catalog rỗng: giải thích thư viện đang được tuyển chọn, không dựng card giả;
- video đang xử lý: chỉ hiện trong công cụ quản trị, không public;
- video lỗi: màn hình có retry và video liên quan, không để iframe trắng;
- API lỗi: giữ shell, skeleton hữu hạn rồi đưa retry;
- thumbnail lỗi: surface có title/source, không dùng broken-image icon.

## 7. Visual system

### 7.1 Màu và type

- nền: `--brand-ink` và `--brand-ink-raised`;
- chữ chính: `--brand-paper`;
- chữ phụ: màu giấy giảm sáng nhưng đạt WCAG AA;
- hành động/active/progress: `--brand-lacquer`;
- Be Vietnam Pro cho UI và nội dung;
- Cormorant Garamond chỉ dùng cho tiêu đề editorial nổi bật, không dùng cho toàn
  bộ card như một trang tạp chí.

### 7.2 Shape

Thumbnail gần vuông góc, radius 4–6 px. Control tròn chỉ khi là icon button.
Không dùng glassmorphism, neon xanh, khối gradient tím, viền phát sáng dày, CSS
art, emoji hay logo giả.

### 7.3 Motion

Luôn có chuyển động tinh tế nhưng không cạnh tranh với video:

- projector beam rất mờ chạy chậm ở nền ngoài player;
- spotlight theo con trỏ chỉ trên thiết bị hover chính xác;
- card hover lift, focus ring lacquer và preview có trì hoãn;
- chuyển lane bằng fade/slide 160–240 ms;
- progress line nhỏ ở đỉnh trang;
- skeleton shimmer một vòng, sau đó đứng yên;
- mọi chuyển động vô hạn dừng khi tab hidden;
- `prefers-reduced-motion` tắt beam, preview autoplay, parallax và shimmer.

### 7.4 Asset policy

Thumbnail và chân dung phải là asset thật hoặc derivative của video. Không dùng
ImageGen để tạo bằng chứng, người nói hoặc ngữ cảnh giả. ImageGen chỉ được dùng
cho texture/decorative plate nếu cần và phải xuất raster cuối đúng slot.

## 8. Mô hình dữ liệu

### 8.1 Nguồn sự thật

- Bunny Stream: file video, bản mã hóa, player, caption, preview, thumbnail và
  trạng thái xử lý media;
- Cloudflare D1: catalog biên tập, slug, nguồn, quyền xuất bản, chủ đề, playlist
  và trạng thái public;
- local storage: lịch sử xem tiếp và xem sau của trình duyệt;
- Git: schema, Worker, giao diện, migration và tài liệu; không chứa video hay secret.

### 8.2 Video record tối thiểu

`id`, `slug`, `bunny_video_id`, `title`, `description`, `source_title`,
`source_creator`, `source_creator_url`, `source_video_url`, `translation_label`,
`rights_status`, `rights_note`, `duration_seconds`, `thumbnail_url`,
`preview_url`, `published_at`, `status`, `featured_rank`, timestamps.

`status` là `draft | uploading | processing | ready | published | failed |
archived`. Public API chỉ trả `published` và chỉ khi Bunny đã `ready`.

`rights_status` bắt buộc trước publish. Hệ thống ghi nhận bằng chứng/quyết định của
chủ sở hữu, không tự kết luận tính hợp pháp.

### 8.3 Taxonomy

Topics là nhóm bền vững, tags là mô tả linh hoạt, playlists là thứ tự biên tập.
Một video có nhiều topic/tag/playlist; thứ tự playlist được lưu rõ và ổn định.

## 9. Kiến trúc kỹ thuật

### 9.1 Public frontend

Next.js static pages dưới `app/vid` dùng client fetch tới API cùng origin.
Không cần rebuild khi thêm video. Shared brand tokens được reuse nhưng Vid có
shell riêng; không render đồng thời universal SiteChrome để tránh hai header.

### 9.2 Vid Worker

Một Worker riêng sở hữu `vid.thongphan.com/*`:

- proxy static assets/shell từ Pages origin đã cấu hình;
- ánh xạ URL subdomain về `/vid/*`;
- public catalog API đọc D1, cache ngắn và CORS same-origin;
- admin API fail closed;
- webhook Bunny có xác minh HMAC trên raw body;
- cập nhật trạng thái media idempotent;
- không can thiệp Worker/router của apex, Brain2, Learn hoặc TPR.

### 9.3 Upload qua Codex

CLI local nhận:

- đường dẫn MP4;
- title, description;
- source creator và source URL;
- topic/tag/playlist;
- thumbnail/caption tùy chọn;
- rights status/note;
- `--publish` chỉ có hiệu lực sau khi media ready và validation pass.

Luồng:

1. kiểm tra file, MIME, kích thước, source HTTPS và metadata;
2. gọi admin API tạo draft và Bunny video object;
3. nhận TUS presigned credentials;
4. upload thẳng từ máy lên Bunny, có resume và progress;
5. Bunny webhook cập nhật processing/ready/failed;
6. CLI poll trạng thái, tải caption/thumbnail nếu có;
7. preview record;
8. publish bằng lệnh riêng hoặc `--publish` sau gate.

Lệnh phải hỗ trợ `--dry-run`, idempotency key và resume state không chứa secret.

### 9.4 Bảo mật

- Bunny API key và webhook signing material chỉ ở Worker secrets;
- Codex admin secret đọc từ macOS Keychain, không từ argv, Git hoặc log;
- admin request ký HMAC gồm method, path, body hash, timestamp, nonce;
- timestamp lệch tối đa 5 phút, nonce dùng một lần và idempotency key bắt buộc;
- body/request/file metadata có ceiling;
- webhook dùng raw-body signature và constant-time compare;
- public API không lộ Bunny key, rights note riêng tư, internal IDs hoặc drafts;
- logs chỉ có request ID, operation, status và pseudonymous identifiers;
- delete là archive mặc định; xóa Bunny vĩnh viễn cần lệnh riêng và xác nhận rõ.

## 10. SEO, accessibility và performance

- canonical luôn là `https://vid.thongphan.com/...`;
- home, watch, topic và playlist có metadata/OG thích hợp;
- video published xuất `VideoObject` với thumbnail, uploadDate, duration và embedUrl;
- sitemap video được Worker tạo từ D1 hoặc job vật hóa, không đưa draft;
- keyboard điều khiển toàn bộ shell; skip link; focus visible; landmarks đúng;
- contrast AA; text UI tối thiểu 14 px; touch target tối thiểu 44 px;
- player iframe có title chính xác;
- grid không horizontal overflow ở 320 px;
- ảnh thumbnail dùng kích thước phù hợp và lazy-load ngoài màn hình đầu;
- public catalog response có pagination và cache; không tải toàn bộ thư viện;
- JS ngoài player cho màn hình đầu có ngân sách gzip riêng và được đo trong release.

## 11. Liên kết với thongphan.com

`Video` được thêm vào secondary navigation/footer của thongphan.com và các điểm
hợp ngữ cảnh trong Library/Experience. Không đẩy một mục thứ năm vào primary nav
desktop hiện tại nếu làm vỡ safe area; Vid tự có shell điều hướng riêng.

Mỗi watch page có lối về `Thư viện bài đọc`, `Trải nghiệm` hoặc nội dung liên quan
khi có mapping biên tập; không tự động đẩy mọi video sang Conan Maker.

## 12. Acceptance criteria

### Sản phẩm

- trang chủ, search, topic, playlist, watch, xem tiếp và xem sau hoạt động với
  dữ liệu API thật hoặc fixture bị cô lập trong QA;
- thêm video published qua API làm nó xuất hiện mà không rebuild;
- related/search/taxonomy deterministic;
- source attribution hiện trên mọi watch page;
- public không thấy draft/processing/failed;
- không có CTA đăng nhập, like, comment hoặc subscribe giả.

### Upload/Bunny

- MP4 lớn upload TUS trực tiếp và resume sau gián đoạn;
- API key không xuất hiện ở browser bundle, public HTML, logs hoặc Git;
- webhook hợp lệ cập nhật trạng thái; webhook sai chữ ký bị 401;
- upload lặp cùng idempotency key không tạo hai video;
- publish bị chặn nếu thiếu source, rights status hoặc Bunny chưa ready.

### Visual/UX

- không crop mặt/đầu trong fixture QA;
- không overlap, clipping hoặc horizontal overflow tại 1440×900, 1280×720,
  1024×768, 390×844 và 320×568;
- pinned bars không che nội dung/focus target;
- hover/focus/active/loading/error/empty đều có trạng thái hoàn chỉnh;
- reduced motion, keyboard và screen-reader baseline pass;
- player không bị motion layer che hoặc nhận pointer events ngoài ý muốn.

### Boundary/release

- không sửa Learn repo/runtime/schema;
- không chứa video, secret hay nội dung riêng trong Git/static output;
- focused tests, full tests, lint, TypeScript, Worker typecheck, build, bundle,
  secret scan và visual QA pass;
- preview pass trước production;
- production origin/subdomain/API fingerprints khớp artifact đã kiểm;
- Bunny credentials/D1/custom domain chưa có thì verdict là `PARTIAL`, không
  tuyên bố production complete.

## 13. Chỉ số sau phát hành

Không đặt mục tiêu traffic giả. Thu thập tối thiểu, tổng hợp:

- lượt bắt đầu xem và hoàn thành theo video từ Bunny analytics;
- search có/không kết quả;
- CTR từ home/search sang watch;
- tỷ lệ tiếp tục video local (không định danh);
- lỗi playback/upload/webhook.

Các metric chưa đo được giữ `NULL`; không suy diễn demand hoặc conversion.

## 14. Rollout

1. Foundation: schema, Worker contracts, public API và upload CLI dry-run.
2. Media: Bunny integration, webhook, TUS resume và publish gate.
3. Experience: shell, home, search, watch, topic, playlist, local library.
4. Visual QA: responsive, motion, reduced motion, keyboard, player.
5. Preview: D1 preview + Bunny test library + subdomain preview.
6. Production: secrets, D1 migration, custom domain, first real video, smoke.

Rollback tách biệt: frontend Pages artifact, Vid Worker version, D1 publish state
và Bunny media. Rollback website không xóa video; archive catalog không xóa Bunny
media.
