# Báo cáo QA — VID · Thông Phan

**Ngày:** 2026-08-12  
**Phạm vi:** giao diện, tương tác, API contract, Bunny lifecycle, bảo mật local  
**Kết luận:** `PASS_PRODUCTION`

## Ngưỡng kết luận

- `PASS_LOCAL`: toàn bộ test, lint, typecheck, build, bundle, secret scan,
  Wrangler dry-run và visual QA đều qua.
- `PASS_PRODUCTION`: local gate qua, preview qua và custom domain/D1/Bunny thật đã
  được kiểm tra trực tiếp.
- `BLOCKED`: một cổng local bắt buộc thất bại.

## Ma trận visual bắt buộc

Trang chủ được kiểm tra ở 1440×900, 1280×720, 1024×768, 390×844 và
320×568. Luồng tìm kiếm, trang xem, player pointer, mô tả, API error, bàn phím
và reduced motion được chạy riêng. Ảnh QA dùng tài sản thật đã có trong repo;
fixture chỉ tồn tại trong script kiểm thử và không đi vào production source.

## Kết quả

- Focused VID: `42/42` test qua.
- Toàn bộ repo: `500/500` test qua.
- TypeScript app và Worker: qua; ESLint: qua; build Next.js 16.3.0: `88/88`
  route tĩnh/SSG được tạo thành công.
- Bundle budget: `3/3`; secret-integrity scan: không có phát hiện; `npm audit`:
  `0 vulnerabilities` cho cả dependency production và development.
- Wrangler dry-run: qua, bundle Worker `31.88 KiB`, gzip `8.53 KiB`.
- Visual QA: `PASS` tại 1440×900, 1280×720, 1024×768, 390×844 và
  320×568; gồm home, search, watch, error, keyboard, player pointer và reduced
  motion. Bằng chứng ảnh tạm ở `/private/tmp/thongphan-vid-qa`.
- Kiểm tra bằng mắt sau render xác nhận tiêu đề đủ tương phản, chỉ có một header,
  hero desktop tách chữ khỏi chủ thể, hero mobile tách ảnh khỏi nội dung và các
  ảnh chân dung giữ trọn đầu/mặt.

## Bằng chứng production

- `https://vid.thongphan.com`: home, search, library, watch, robots và sitemap đều
  HTTP 200; TLS và route custom domain hoạt động.
- Trang chủ production có đúng một shell VID, không generic chrome, không
  horizontal overflow, không ảnh hỏng và không React error overlay. Tìm kiếm
  `Claude` đi đúng `/results?search_query=Claude` và trả đúng video.
- Trang xem có Bunny iframe kích thước hợp lệ, không bị overlay chặn, giữ link tác
  giả/video gốc và không ảnh hỏng. Local rendered QA vẫn phủ 1440, 1280, 1024,
  390 và 320 px, bàn phím, error state và reduced motion.
- API công khai trả một video published/ready nhưng không có `rightsNote`. Signed
  admin status trả HTTP 200; signed Bunny webhook v1 trả HTTP 204; Bunny metadata
  dùng khóa vừa xoay trả HTTP 200 và thời lượng 809 giây.
- Local `out/vid.html`, Pages immutable `/vid` và production `/` có cùng SHA-256
  `ea7ba5e0176867b05504af5393d91b9c0955d8740690e694fa8ac310f373070c`.
- Toàn bộ static artifact có SHA-256
  `3624e4fd51c6e807e30cbe4d6a5069410df11a3c22e1930da4985cd7a7205f40`.
