# Báo cáo QA — VID · Thông Phan

**Ngày:** 2026-08-12  
**Phạm vi:** giao diện, tương tác, API contract, Bunny lifecycle, bảo mật local  
**Kết luận:** `PASS_LOCAL` · tổng thể `PARTIAL`

## Ngưỡng kết luận

- `PASS_LOCAL`: toàn bộ test, lint, typecheck, build, bundle, secret scan,
  Wrangler dry-run và visual QA đều qua.
- `PARTIAL`: local đã qua nhưng Bunny library, D1 và custom domain thật chưa đủ
  bằng chứng kiểm tra trực tiếp.
- `BLOCKED`: một cổng local bắt buộc thất bại.

## Ma trận visual bắt buộc

Trang chủ được kiểm tra ở 1440×900, 1280×720, 1024×768, 390×844 và
320×568. Luồng tìm kiếm, trang xem, player pointer, mô tả, API error, bàn phím
và reduced motion được chạy riêng. Ảnh QA dùng tài sản thật đã có trong repo;
fixture chỉ tồn tại trong script kiểm thử và không đi vào production source.

## Kết quả

- Focused VID: `40/40` test qua.
- Toàn bộ repo: `498/498` test qua.
- TypeScript app và Worker: qua; ESLint: qua; build Next.js 16.3.0: `88/88`
  route tĩnh/SSG được tạo thành công.
- Bundle budget: `3/3`; secret-integrity scan: không có phát hiện; `npm audit`:
  `0 vulnerabilities` cho cả dependency production và development.
- Wrangler dry-run: qua, bundle Worker `31.58 KiB`, gzip `8.42 KiB`.
- Visual QA: `PASS` tại 1440×900, 1280×720, 1024×768, 390×844 và
  320×568; gồm home, search, watch, error, keyboard, player pointer và reduced
  motion. Bằng chứng ảnh tạm ở `/private/tmp/thongphan-vid-qa`.
- Kiểm tra bằng mắt sau render xác nhận tiêu đề đủ tương phản, chỉ có một header,
  hero desktop tách chữ khỏi chủ thể, hero mobile tách ảnh khỏi nội dung và các
  ảnh chân dung giữ trọn đầu/mặt.

## Biên phát hành ngoài hệ thống

Cloudflare OAuth hiện hợp lệ và DNS `vid.thongphan.com` đã nằm trên Cloudflare,
nhưng hostname đang trả `HTTP 502`. Worker `thongphan-vid` chưa tồn tại, D1
`thongphan-vid` chưa được provision, Keychain chưa có `thongphan-vid-admin /
hmac-secret`, còn Bunny library/CDN vars vẫn là `configure-before-deploy`.

Vì chưa có Bunny authority, secret quản trị và MP4 thật được chủ sở hữu duyệt,
không tạo tài nguyên giả, không deploy Worker cấu hình placeholder và không tuyên
bố production release. Bản local được đóng ở `PASS_LOCAL`; tổng thể giữ `PARTIAL`.
