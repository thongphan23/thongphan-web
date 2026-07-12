# Nghỉ hưu `brain2.thongphan.com`

Subdomain legacy được một Cloudflare Worker độc lập trên route proxied chuyển hướng về
`https://thongphan.com/brain2/21-ngay`. Mọi phương thức và đường dẫn cũ đều trả
`301`, giữ nguyên query string, body rỗng và không còn phụ thuộc project Pages
`brain2-platform`.

Response có `X-TP-Legacy-Redirect: worker-v1` để chứng minh Worker đã tiếp quản
route trước khi xóa project Pages. Worker không có KV, D1, secret, service binding
hay quyền truy cập nội dung legacy.

## 1. Cổng snapshot và canonical

Chạy snapshot từ gốc repo công khai nếu chưa có bản đã xác minh:

```bash
node scripts/snapshot-brain2-legacy.mjs \
  --output /Users/rio/Private/thongphan-brain2-legacy-2026-07-12
```

Chỉ tiếp tục khi:

1. canonical `https://thongphan.com/brain2/21-ngay` đã qua kiểm thử production;
2. snapshot riêng tư có đủ 64 production deployment, đúng checksum và permission;
3. binding và secret của Pages đã được gỡ và đọc lại là rỗng;
4. có thủ tục rollback canonical trong báo cáo phát hành.

Không log nội dung `live/reflections.json`, secret hay passcode.

## 2. Triển khai Worker chuyển hướng

```bash
(
  set -euo pipefail
  npx wrangler deploy --config wrangler.brain2-legacy-redirect.jsonc --strict
)
```

Config chỉ sở hữu route `brain2.thongphan.com/*`; DNS của subdomain phải tiếp tục
proxied để Worker nhận request. `workers_dev` và preview URL đều tắt. Không gắn thêm
asset, binding hoặc biến môi trường.

## 3. Smoke trước khi xóa Pages

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

`https://brain2.thongphan.com/` phải trả `301`. Cả ba phản hồi phải có:

- đúng `Location: https://thongphan.com/brain2/21-ngay` và query string nguồn;
- `X-TP-Legacy-Redirect: worker-v1`;
- body `0` byte, không cookie và không nội dung legacy;
- cache ban đầu ngắn, `max-age=300`.

## 4. Xóa project Pages legacy

**Chỉ xóa project sau khi** cả ba smoke ở trên đạt và header dấu vân tay xác nhận
Worker đang phục vụ domain thật. Lệnh destructive đã được duyệt trong Task 15:

```bash
npx wrangler pages project delete brain2-platform
```

Sau khi xóa:

1. xác minh `brain2-platform` không còn trong `wrangler pages project list`;
2. xác minh DNS `brain2.thongphan.com` vẫn resolve và proxied bằng chính header
   `worker-v1`; nếu record bị gỡ thì tạo lại record proxied dành cho Worker route;
3. chạy lại toàn bộ smoke và kiểm tra header `worker-v1`;
4. kiểm tra đủ 64 immutable URL từ snapshot, bao gồm cache-busted request, không URL
   nào còn trả HTML, API hoặc nội dung bài học legacy;
5. ghi Worker version, trạng thái DNS và phân bố status của 64 URL vào báo cáo.

## 5. Khôi phục

Snapshot chỉ là bằng chứng riêng tư, không phải artifact để đưa frontend cũ lên lại.
Nếu chuyển hướng lỗi:

1. giữ hoặc phục hồi DNS proxied của `brain2.thongphan.com`;
2. triển khai lại Worker bằng config đã track;
3. rollback canonical bằng deployment đã ghi trong báo cáo nếu lỗi nằm ở canonical;
4. không tái tạo Pages project, passcode phía client, reflection API hay deployment
   content-bearing cũ.
