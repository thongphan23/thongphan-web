# Thiết kế chuyển động mức giải thưởng (award-level motion) cho thongphan.com

- Ngày: 2026-10-14
- Phạm vi: `/`, `/tensai`, `/conan`, `/about` và khung chung (header, footer, chuyển trang)
- Nhánh: `feature/two-path-rebuild` (worktree `.worktrees/two-path-rebuild`)
- Spec nền: `docs/superpowers/specs/2026-10-13-thongphan-two-path-rebuild-design.md`
- Trạng thái: đã triển khai ở bản xem trước (preview), chưa lên production, chờ anh Thông duyệt thẩm mỹ

## 1. Mục tiêu và tiêu chí nghiệm thu

Yêu cầu của anh Thông (14/10/2026): nâng website lên mức các trang từng đoạt giải
(Awwwards, FWA, CSS Design Awards). Khi đặt thongphan.com cạnh các trang đó, người
chấm (critic agent) không phân biệt được trang nào có ấn tượng và trải nghiệm tốt hơn.

Tiêu chí quan sát được:

1. Mỗi trang có một màn mở đầu (first screen) có biên đạo: chữ trồi lên theo từng từ,
   ảnh thật mở ra từ một khung nhỏ, không chờ JavaScript.
2. Cuộn trang tạo được ít nhất một khoảnh khắc "đáng nhớ" mỗi trang: zoom xuyên ảnh
   (home), hàng ngang ghim (pinned horizontal) ở `/conan`, chồng thẻ (stacked cards) ở
   `/tensai`, mục lục năm hồi ở `/about`.
3. Tương tác phần tử: con trỏ tuỳ biến có nhãn, nút hút nam châm (magnetic), ảnh bẻ cong
   bằng WebGL dưới con trỏ, đường kẻ tự vẽ, chữ sáng dần theo cuộn.
4. Không đánh đổi khả năng tiếp cận (accessibility): giảm chuyển động (reduced motion)
   hiện toàn bộ nội dung tĩnh; điện thoại không bị ghim ngang; nội dung không bao giờ bị
   kẹt ẩn nếu engine không chạy.
5. Phản biện mù (blind critic) so cặp với trang đoạt giải không chọn được thongphan.com
   là trang yếu hơn một cách nhất quán. Đây là kết quả của LLM critic, không thay cho
   duyệt thẩm mỹ của anh Thông.

## 2. Thư viện và kiểm tra trước khi tích hợp

| Gói | Phiên bản (ghim chính xác) | Giấy phép (license) | Phụ thuộc | Lý do chọn |
|---|---|---|---|---|
| `gsap` (kèm ScrollTrigger, SplitText) | `3.15.0` | Standard "no charge" license của GSAP, miễn phí cả dùng thương mại | không | Chuẩn thực tế của các trang đoạt giải; SplitText và ScrollTrigger đều đã miễn phí |
| `lenis` | `1.3.26` | MIT | không | Cuộn mượt (smooth scroll) của darkroom.engineering, nhẹ, duy trì đều |

Kiểm tra ngày 14/10/2026:

- **Bảo mật:** `npm audit --omit=dev` không có lỗ hổng nào thuộc `gsap` hay `lenis`.
- **Lỗ hổng có sẵn từ trước:**
  - `next@16.2.10` có các cảnh báo cao và nghiêm trọng (critical), sửa ở bản `>=16.3.6`.
  - Gói con kéo theo cũng có cảnh báo: `postcss`, `sharp`, `js-yaml` và `nanoid`.
  - Các lỗ hổng đó không do việc này thêm vào. Phần lớn nhắm vào máy chủ Next (Image
    Optimization, Server Actions, middleware). Bản xuất tĩnh (static export) trên
    Cloudflare Pages không chạy máy chủ đó.
  - Vẫn cần nâng cấp riêng. Việc này đã được ghi thành việc tách riêng.
- **Mức trưởng thành và bảo trì (maturity, maintenance):** cả hai gói đều có lịch sử phát
  hành dài và đang được duy trì.
- **Mức phù hợp (fit):** dùng qua thuộc tính `data-*` trong markup nên các trang vẫn là
  server component.
- **Hợp đồng test:** `scripts/stage-motion-contract.test.mjs` ghim đúng hai phiên bản trên.

## 3. Kiến trúc

### 3.1 Khởi động và an toàn

- Script `MOTION_BOOT` trong `<head>` gắn class `html.motion` trước lần vẽ đầu.
  - Nó chỉ gắn khi người dùng không bật giảm chuyển động.
  - Nếu sau 4 giây không thấy `data-motion-ready`, nó gỡ class này ra.
  - Nhờ vậy nội dung không bao giờ bị kẹt ở trạng thái ẩn.
- `MotionKernel` chỉ tải `components/motion/engine.ts` bằng import động khi trang có
  `[data-motion-stage]` và giảm chuyển động đang tắt. Engine không tính vào ngân sách JS
  tải đầu.
- `mountMotion(root, { stage: true })` bật Lenis và dựng mọi hiệu ứng từ thuộc tính dữ
  liệu. Con trỏ tuỳ biến chỉ bật với con trỏ chính xác (fine pointer).
  - Hàm trả về một hàm dọn dẹp (cleanup) cho điều hướng phía client.
- Màn mở đầu dùng CSS thuần (`styles/motion.css`), nên chạy ngay lần vẽ đầu:
  - `.intro-word`: từng từ trồi khỏi mặt nạ, có đệm dọc để dấu tiếng Việt không bị cắt.
  - `.intro-fade`: hiện mờ dần.
  - `.intro-clip`: ảnh mở từ khung nhỏ.

### 3.2 Từ vựng hiệu ứng (data attributes)

| Thuộc tính | Hiệu ứng |
|---|---|
| `data-split` | Tiêu đề tách dòng, từng dòng trồi khỏi mặt nạ khi cuộn tới |
| `data-scrub-words` | Câu dài sáng dần từng từ theo vị trí cuộn |
| `data-scroll-out` | Chữ màn đầu bay lên và mờ đi khi rời màn |
| `data-img-reveal` (+ `data-reveal-media`) | Ảnh mở bằng clip-path theo hướng, ảnh bên trong lắng từ zoom |
| `data-motion-reveal` (mask, drift, fade) / `data-reveal-children` | Lối vào cho khối và lưới |
| `data-draw-line` | Đường kẻ tự vẽ |
| `data-speed`, `data-parallax-frame`, `data-motion-parallax` | Chiều sâu thị sai (parallax) |
| `data-zoom-reveal` | Ghim section, ảnh mở từ khe giữa hai chữ tới toàn màn (home) |
| `data-hscroll` | Ghim và trượt ngang, chỉ màn rộng ≥ 900px |
| `data-marquee`, `data-velocity-skew` | Dải chữ chạy, nghiêng theo tốc độ cuộn |
| `data-magnetic`, `data-tilt`, `data-cursor`, `data-cursor-tone` | Tương tác con trỏ |
| `data-gl-photo` (+ `data-gl-delay`) | Ảnh thật vẽ lại trên WebGL: thấu kính lỏng dưới con trỏ, gợn theo tốc độ cuộn, hạt phim |
| `data-count` | Bộ đếm số |

### 3.3 Giới hạn WebGL

`gl-photo.ts` chỉ chạy khi đồng thời thoả các điều kiện sau:

- màn ≥ 900px;
- con trỏ chính xác;
- người dùng không bật tiết kiệm dữ liệu (`saveData`);
- tối đa 3 ảnh mỗi trang.

Thẻ `<img>` thật vẫn nằm dưới canvas làm phương án dự phòng, cho SEO và cho trình đọc
màn hình. Canvas chỉ hiện khi texture đã sẵn sàng, và mỗi canvas bị huỷ ngữ cảnh khi rời
trang.

### 3.4 Chuyển trang

`RouteCurtain` phủ hai lớp màn khi chuyển giữa các trang:

1. Một lớp màu dẫn: lime cho Tensai, sơn mài cho Conan.
2. Một tấm mực ghi tên trang đích, rồi cả hai nhấc khỏi trang mới.

Khi người dùng bật giảm chuyển động, màn chuyển trang bị ẩn hoàn toàn.

## 4. Biên đạo theo trang

- **`/` (home):**
  - Màn đầu: hai cửa Tensai và Conan, chữ trồi theo từ.
  - GuideZoom: ảnh Thông mở xuyên giữa hai chữ tới toàn màn.
  - Thư của người sáng lập, dải ảnh việc thật (reel), cửa đôi khép trang.
- **`/tensai`:**
  - Màn đầu nền xanh rêu, CTA lime có con trỏ nhãn "Vào học".
  - Bản đồ học và bài học là ảnh thật, mở bằng clip.
  - Chồng thẻ khi cuộn.
- **`/conan`:**
  - Ảnh lớp học thật toàn màn, có màn sơn mài nhấc lên.
  - Câu nguyên tắc sáng dần từng từ.
  - Dải tên chặng chạy nghiêng theo tốc độ cuộn.
  - Năm chặng hành trình ghim ngang trên desktop, vuốt ngang trên điện thoại.
  - Gallery lớp học thật, người dẫn đường, chữ "Conan" khổng lồ trôi ở cuối.
- **`/about` (làm mới ngày 14/10):**
  - Màn đầu lời thú nhận.
    - Tiêu đề Cormorant cỡ lớn trồi theo từ. Vế "đã đi sai đủ nhiều." in nghiêng màu sơn mài.
    - Bên phải là chân dung thật `founder-portrait`, mở bằng `intro-clip`, có parallax
      và WebGL.
    - Đường kẻ phía trên dòng "Hồ sơ nguồn gốc" thẳng hàng với mép trên của chân dung.
      Tiêu đề và lời dẫn nằm sát đáy, ngang với chú thích ảnh.
    - Màn đầu lấp đúng phần còn lại của khung hình, vì vỏ trang (shell) đã chừa chiều cao
      của thanh đầu trang. Chữ "Nguồn gốc" khổng lồ ở nền đã bỏ, vì nó đè lên tiêu đề.
  - Mục lục năm hồi.
    - Hiện ngay trong màn đầu. Từng hồi lần lượt hiện ra sau khi tiêu đề trồi lên
      (`intro-fade` với `--intro-delay` = 1,15 giây + 0,08 giây cho mỗi hồi), không
      chờ cuộn.
    - Năm liên kết tới `#origin-act-<id>`, mỗi đường kẻ phủ màu sơn mài khi rê chuột.
    - Số thứ tự có độ rộng cố định để mọi tên hồi bắt đầu trên cùng một mép.
    - Mục lục kiêm luôn lời hứa cấu trúc của câu chuyện.
  - Giữ nguyên `<OriginStory />`, JSON-LD, nền `var(--cinema-ink)` và không dùng `<main>`
    (theo các test hợp đồng).
  - `DossierHeader` vẫn dùng chung cho các trang khác nên không bị sửa.

## 5. Phương án dự phòng (fallback)

- **Giảm chuyển động:**
  - Không tải engine, không có màn chuyển trang, không có con trỏ tuỳ biến.
  - Hàng ngang `/conan` thành lưới tĩnh năm cột; tên chặng thu cỡ để không gãy giữa từ.
- **Điện thoại (< 900px):**
  - Không ghim ngang, không WebGL, không hiệu ứng con trỏ.
  - Bố cục một cột; chân dung `/about` nằm giữa tiêu đề và đoạn dẫn.
- **Khi JavaScript lỗi:** `html.motion` tự gỡ sau 4 giây.

## 6. Tham chiếu đoạt giải

Bộ tham chiếu được chọn và ghi tại thư mục tạm (scratchpad) `award-refs-2.json` gồm 14 trang:

- Lando Norris (Awwwards Site of the Year 2025)
- Why Zero
- David Whyte Experience
- Siena Film
- ERA Residence
- Oryzo AI
- Charles Leclerc
- Won J. You (coaching)
- Trevor Noah
- David Alaba
- Immersive Garden
- 100 Lost Species
- TKS
- Ottografie

Ảnh chụp chỉ để ở thư mục tạm, không commit, không tải ảnh Mobbin.

## 7. Kiểm chứng

- Test hợp đồng:
  - `stage-motion-contract`;
  - `subpage-cinema-contract`, `chapter-handoff-contract`;
  - `seo-contract`, `two-path-route-contract`.
- QA bằng ảnh chụp thật trên desktop 1440 và điện thoại 390, có cả chế độ giảm chuyển động.
  - Chỉ số kiểm: tràn ngang, ảnh hỏng, phần tử bị kẹt ẩn, lỗi console.
- Quay màn hình (CDP screencast) khi cuộn, rồi dựng tờ ảnh liên tiếp (contact sheet) để
  so cặp mù với trang đoạt giải.

### Lỗi đã biết, không do việc này gây ra

- **Test 75 (ngân sách ảnh raster):** ảnh bìa ebook 772.312 byte vượt ngân sách 512.000 byte.
- **Test 137 và 138:** do môi trường. Máy thiếu Playwright headless shell
  `chromium_headless_shell-1208`, và chưa tải về.

## 8. Cổng còn chờ anh Thông

1. Đồng ý dùng ảnh có khuôn mặt nhận diện được. Cổng này cũng chặn `git push`, vì repo đang public.
2. Duyệt thẩm mỹ cuối. Kết quả LLM critic không thay cho bước này.
3. Lệnh deploy production.
