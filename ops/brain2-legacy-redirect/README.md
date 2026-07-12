# Nghỉ hưu `brain2.thongphan.com`

Thư mục này là bản triển khai Cloudflare Pages ở chế độ nâng cao (Advanced Mode)
chỉ để chuyển hướng. Mọi phương thức và mọi đường dẫn cũ trả `301` về
`https://thongphan.com/brain2/21-ngay`, giữ nguyên chuỗi truy vấn và không trả lại
nội dung, passcode hay API cũ.

Cloudflare Pages có API danh sách deployment hỗ trợ `page` và `per_page`. Công cụ
snapshot dùng trực tiếp API có phân trang để giữ đủ 64 deployment production đã
audit; không dùng kết quả 25 dòng mặc định của Wrangler làm danh sách xóa.

Tài liệu API chính thức:
<https://developers.cloudflare.com/api/resources/pages/subresources/projects/subresources/deployments/methods/list/>

## 1. Tạo và xác minh snapshot riêng tư

Chạy từ gốc repo công khai:

```bash
node scripts/snapshot-brain2-legacy.mjs \
  --output /Users/rio/Private/thongphan-brain2-legacy-2026-07-12
```

Công cụ chỉ đọc tám file nằm trong allowlist. Nó không duyệt cây nguồn, không mở
`.env.local`, `.wrangler`, `.claude`, Google Apps Script hoặc tệp bí mật. Credential
Cloudflare được Wrangler cấp trong bộ nhớ để gọi API đọc; credential không được ghi
vào snapshot hay terminal. Thư mục kết quả có mode `700`, mọi file có mode `600`.
Đầu ra terminal chỉ gồm tên tương đối, số byte và SHA-256.

Trước khi triển khai chuyển hướng, kiểm tra riêng các trường không chứa nội dung
người dùng:

```bash
jq '{deployment_count, audited_production_deployment_id, api_pages}' \
  /Users/rio/Private/thongphan-brain2-legacy-2026-07-12/cloudflare/deployments.json
```

Kết quả bắt buộc là `deployment_count: 64`, ba trang API và có deployment
`8d400ccd-3357-4c51-9a0f-87bd2648b9ff`. Không `cat`, log hoặc chụp màn hình
`live/reflections.json`.

## 2. Cổng bắt buộc trước khi thay frontend cũ

Chỉ tiếp tục khi tất cả điều sau đã đạt:

1. Bản production chính tại `https://thongphan.com/brain2/21-ngay` đã vượt qua
   kiểm thử nội dung, quyền truy cập, đăng ký, desktop, mobile và reduced motion.
2. Snapshot riêng tư ở trên đã tự xác minh hash và permission.
3. Báo cáo phát hành đã ghi lại deployment canonical và thủ tục khôi phục.
4. Chưa xóa bất kỳ deployment cũ, KV binding hoặc encrypted secret nào.

## 3. Triển khai chuyển hướng

Lệnh này làm thay đổi production nên chỉ chạy trong Task 15, sau cổng ở trên:

```bash
(
  set -euo pipefail
  REPO_ROOT="$(pwd)"
  WRANGLER_BIN="$REPO_ROOT/node_modules/.bin/wrangler"
  STAGING_DIR="$(mktemp -d /tmp/brain2-legacy-redirect.XXXXXX)"
  test -n "$STAGING_DIR"
  trap 'rm -rf "$STAGING_DIR"' EXIT

  install -m 600 ops/brain2-legacy-redirect/_worker.js "$STAGING_DIR/_worker.js"
  cd "$STAGING_DIR" && \
  "$WRANGLER_BIN" pages deploy . \
    --project-name brain2-platform \
    --branch main
)
```

Thư mục tạm nằm ngoài repo ngăn Wrangler tự tìm ngược lên và nạp `wrangler.toml` của
website canonical vào project legacy. Không thêm asset, HTML hoặc Pages Function nào
khác vào artifact này.

## 4. Smoke chuyển hướng

Kiểm tra cả gốc, đường dẫn cũ, API cũ, query string và POST:

```bash
curl -sS -D /tmp/brain2-root.headers \
  -o /tmp/brain2-root.body \
  https://brain2.thongphan.com/

curl -sS -D /tmp/brain2-path.headers \
  -o /tmp/brain2-path.body \
  'https://brain2.thongphan.com/week/2?utm_source=legacy&day=08'

curl -sS -X POST -D /tmp/brain2-api.headers \
  -o /tmp/brain2-api.body \
  'https://brain2.thongphan.com/api/reflections?from=email'

wc -c /tmp/brain2-root.body /tmp/brain2-path.body /tmp/brain2-api.body
```

Mỗi phản hồi phải có:

- status `301`;
- `Location: https://thongphan.com/brain2/21-ngay` cộng đúng query string nguồn;
- `Cache-Control` với `max-age=300` ở lần phát hành đầu;
- body `0` byte;
- không cookie, passcode, reflection, signup response hay nội dung bài học.

## 5. Dọn binding và deployment cũ

Chỉ sau khi smoke chuyển hướng đạt:

1. Gỡ rõ ràng binding `REFLECTIONS` và encrypted Brevo secret khỏi project Pages.
2. Đọc lại cấu hình project để xác minh các binding đã biến mất.
3. Dùng đúng 64 ID trong
   `cloudflare/deployments.json` của snapshot làm allowlist xóa; không dùng
   `wrangler pages deployment list`, vì lệnh đó chỉ trả trang đầu 25 dòng.
4. Giữ lại deployment redirect-only mới, xóa từng deployment content-bearing cũ,
   rồi xác minh mọi immutable URL cũ không còn truy cập được.
5. Ghi ID, kết quả và thời điểm của từng thao tác vào báo cáo production.

Không chạy thao tác xóa tự động nếu số lượng, ID audited hoặc deployment
redirect-only không khớp chính xác.

## 6. Khôi phục

Snapshot là bằng chứng nguồn và checksum riêng tư, không phải artifact để đưa website
không an toàn trở lại public. Nếu canonical hoặc chuyển hướng gặp sự cố:

1. giữ nguyên domain legacy ở trạng thái redirect-only;
2. sửa hoặc rollback bản canonical bằng deployment đã ghi trong báo cáo;
3. triển khai lại chính `_worker.js` này nếu cần;
4. không tái triển khai passcode phía client, reflection API, Brevo Function hay bất
   kỳ deployment content-bearing cũ nào.
