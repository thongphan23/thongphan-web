# Cloudflare Workers — thongphan.com

Tài liệu vận hành hiện hành cho API signup, quyền truy cập 21 ngày Brain2 và
chiến dịch email `brain2-2026-v1`. Mọi lệnh cũ trước chiến dịch v2 đều không còn
giá trị vận hành.

## Ranh giới an toàn

- Chỉ hợp nhất lộ trình 21 ngày vào `thongphan.com`.
- Không triển khai chat với Brain2, vault riêng hay ứng dụng Brain2 riêng tư.
- `brain2-embedder` chỉ còn là tombstone `410 Gone` tại đúng `/api/embed`, không
  có AI/Vectorize binding và không có quy trình ingestion được hỗ trợ.
- `/chat` vẫn là hành trình public chạy local bằng model tất định; `/api/chat`
  chỉ còn tombstone `410 Gone`, không có AI/Vectorize binding hay nhánh client
  có thể kích hoạt lại gọi từ xa.
- Ngày 01–07 là nội dung công khai; ngày 08–21 được đọc từ KV riêng sau khi
  Worker xác thực phiên Conan Maker.
- 210 email cũ giữ nguyên `legacy-v0` và bị migration khóa update/delete.
- Sender mới chỉ claim `brain2-2026-v1`.
- Không có endpoint gửi email công khai. Cron phải giữ rỗng cho tới khi toàn bộ
  migration, secret, provider health và smoke test production đều đạt.

## Worker và cấu hình

| Chức năng | Entry | Cấu hình |
| --- | --- | --- |
| Signup + tạo 21 hàng email v2 | `workers/api/signup.ts` | `wrangler.signup.toml` |
| Quyền truy cập ngày 08–21 | `workers/brain2-access/index.ts` | `wrangler.brain2-access.jsonc` |
| Brevo sender + hủy đăng ký | `workers/api/email-drip.ts` | `wrangler.brain2-email.toml` |
| Tombstone ingestion đã ngừng | `workers/embed-vault.ts` | `wrangler.embed.toml` |
| Tombstone chat từ xa đã ngừng | `workers/api/chat.ts` | `wrangler.chat.toml` |

Signup có hai rate-limit binding, chuẩn hóa email về chữ thường, ghi signup và
21 hàng queue trong một `D1.batch()`, rồi mới xóa cache theo kiểu best-effort.
Sender dùng queue UUID làm khóa idempotency Brevo, claim nguyên tử, lease bốn
phút, timeout 20 giây và chỉ retry trong cửa sổ 25 phút.

Không còn script upload, đường nội bộ hay writer thay thế cho Brain2 Vectorize.
Mọi phương thức gọi `/api/embed` nhận cùng problem response `410`; rollback chỉ
được khôi phục tombstone đã kiểm chứng, không được khôi phục writer cũ.

Mọi phương thức gọi `/api/chat` cũng nhận cùng problem response `410`. Trang
`/chat` không gọi endpoint này: câu trả lời và ba đề xuất tiếp theo được tạo local
từ model tất định. Nếu giao diện local hồi quy, chỉ rollback client/model và test;
không khôi phục Worker AI, Vectorize, proxy Next hay URL public cũ.

## Kiểm tra local bắt buộc

```bash
npm test
npx tsc --noEmit
npm run typecheck:brain2-workers
npm run build
npm audit --audit-level=high

npx wrangler deploy --dry-run --config wrangler.signup.toml --outdir /tmp/brain2-signup-dry-run
npx wrangler deploy --dry-run --config wrangler.brain2-access.jsonc --outdir /tmp/brain2-access-dry-run
npx wrangler deploy --dry-run --config wrangler.brain2-email.toml --outdir /tmp/brain2-email-dry-run
npx wrangler deploy --dry-run --config wrangler.chat.toml --outdir /tmp/r0-1-chat-tombstone
```

Trước release private content, chạy thêm publisher/leak gate theo tài liệu và
script trong `scripts/`. Không đưa nội dung ngày 08–21 hoặc secret vào command
line, Git, build output hay log.

## Trình tự triển khai

1. Audit D1 ở chế độ chỉ đọc; xác nhận số hàng `legacy-v0` và không có email đã
   gửi ngoài chủ đích.
2. Áp migration bằng Wrangler migration ledger.
3. Provision KV riêng, upload 14 package bất biến và xác minh checksum đọc lại.
4. Nạp secret bằng `wrangler secret put`; không lưu plaintext trong repo.
5. Deploy signup và access Worker, sau đó smoke test endpoint thật bằng dữ liệu
   tổng hợp được phê duyệt.
6. Deploy email Worker từ `wrangler.brain2-email.toml` khi `crons = []`.
7. Kiểm tra nhà cung cấp, không gửi mail:

```bash
curl --fail-with-body \
  -H "Authorization: Bearer $BRAIN2_EMAIL_ADMIN_SECRET" \
  https://thongphan.com/brain2/21-ngay/api/email-admin
```

8. Chỉ sau khi signup, unsubscribe, D1/KV và Brevo health đều đạt mới cập nhật
   lịch cron trong một release riêng. `POST` cùng URL admin chỉ được dùng cho
   một controlled smoke row v2 và phải có Bearer secret.

## Secret production

- `BRAIN2_ACCESS_CODE_HASH`
- `BRAIN2_SESSION_SECRET`
- `BREVO_API_KEY`
- `BRAIN2_EMAIL_ADMIN_SECRET`
- `BRAIN2_EMAIL_UNSUBSCRIBE_SECRET`

Giá trị thật chỉ nằm trong Keychain/Cloudflare encrypted secret. Log chỉ được
ghi trạng thái coarse như `brain2_batch`, tuyệt đối không ghi tên, email, token,
API key hay response body từ Brevo.

## Hủy đăng ký

- Email dùng token HMAC không chứa email.
- `GET` chỉ hiển thị trang xác nhận để email scanner không tự hủy.
- `POST` mới cập nhật signup và dừng các hàng v2 còn pending.
- Route Cloudflare phải kết thúc bằng `unsubscribe*` vì matching tính cả query
  string; Worker vẫn kiểm tra `pathname` chính xác.

Nếu D1/provider/binding không sẵn sàng, hệ thống fail closed bằng 503 và không
được coi là đã signup, đã hủy hoặc đã gửi thành công.
