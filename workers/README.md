# Cloudflare Workers — thongphan.com

Tài liệu vận hành hiện hành cho API signup, quyền truy cập 21 ngày Brain2 và
chiến dịch email `brain2-2026-v1`. Mọi lệnh cũ trước chiến dịch v2 đều không còn
giá trị vận hành.

## Implemented source contract

- Source của `brain2-embedder` và `thongphan-chat-api` là hai tombstone `410 Gone`
  tại đúng `/api/embed` và `/api/chat`, không có AI/Vectorize binding. Không còn
  script, internal route hay replacement writer được hỗ trợ.
- `/chat` vẫn là hành trình public chạy local bằng model tất định; client không có
  nhánh gọi lại remote chat.
- Truthful signup source giữ same-origin/rate-limit ở BFF rồi, khi gateway config
  đầy đủ, gửi một command có idempotency tới `api.thongphan.com`. Gateway là
  bên lưu registration; zero queue rows, không hứa delivery và không tuyên bố
  marketing consent. Source production không còn nhánh ghi D1 trực tiếp.
- Migration source `0003_r0_1_email_integrity.sql` tồn tại. Khi được áp dụng trong
  một cutover riêng, nó đặt legacy rows thành `quarantined_legacy`/`sendable = 0`
  và fail closed với mọi mutation tạo sendable state.
- Sender source chỉ claim `brain2-2026-v1` khi đồng thời có
  `audience_state = 'sendable' AND sendable = 1`. Cron trong source giữ rỗng.

## Current production state

- Audience Data Platform slice đang live: production signup Worker gọi gateway
  bằng principal `audience:signup` riêng và không có D1 binding. Migration giữ 12
  source rows, tạo 11 normalized identities cùng 1 quarantine; public synthetic
  acceptance thêm đúng 1 signup có receipt/audit/outbox tương ứng.

- R0.1B recovery is in progress; cutover is incomplete.
- The embed/chat/signup versions are deployed, and the official read-only recovery passed.
- The controlled POST has not run; the command-mode runner fix is verified.
- Migration `0003` and Pages remain untouched.
- Production có 210 hàng `legacy-v0/pending`; các cột `audience_state` và
  `sendable` chưa tồn tại và chỉ xuất hiện sau migration `0003`.
- The email Worker remains undeployed, and the cron remains empty.

## Ranh giới an toàn

- Chỉ hợp nhất lộ trình 21 ngày vào `thongphan.com`.
- Không triển khai chat với Brain2, vault riêng hay ứng dụng Brain2 riêng tư.
- Ngày 01–07 là nội dung công khai; ngày 08–21 được đọc từ KV riêng sau khi
  Worker xác thực phiên Conan Maker.
- Không có endpoint gửi email công khai. Registration không phải delivery consent.

## Worker và cấu hình

| Chức năng | Entry | Cấu hình |
| --- | --- | --- |
| Signup, không tạo hàng email | `workers/api/signup.ts` | `wrangler.signup.toml` |
| Quyền truy cập ngày 08–21 | `workers/brain2-access/index.ts` | `wrangler.brain2-access.jsonc` |
| Mã hợp đồng email bất hoạt, chỉ dry-run local | `workers/api/email-drip.ts` | `wrangler.brain2-email.toml` |
| Tombstone ingestion đã ngừng | `workers/embed-vault.ts` | `wrangler.embed.toml` |
| Tombstone chat từ xa đã ngừng | `workers/api/chat.ts` | `wrangler.chat.toml` |

Signup có hai rate-limit binding, chuẩn hóa email về chữ thường, chuyển business
command tới gateway bằng một consumer secret riêng, rồi mới xóa cache theo kiểu
best-effort. Mã sender giữ queue UUID làm khóa
idempotency Brevo, nhưng toàn bộ claim/update/expire đều cần cặp predicate
`audience_state = 'sendable' AND sendable = 1`; migration R0.1 chặn việc tạo cặp
trạng thái này.

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

## Trình tự triển khai R0.1B

The authoritative sequence is exclusively:
`docs/superpowers/plans/2026-07-26-r0-1-production-cutover.md`.

Tóm tắt thứ tự bắt buộc, không thay thế runbook:

1. embed tombstone;
2. chat tombstone;
3. read-only smoke;
4. truthful signup Worker;
5. controlled synthetic signup và targeted cleanup;
6. D1 bookmark cùng broad/scoped preflight;
7. scoped apply of only migration 0003;
8. post-migration quarantine proof;
9. exact-main Pages deployment;
10. final read-only smoke.

Không dùng trình tự cũ đặt migration trước truthful signup/controlled signup. Không
deploy email Worker, provision email secret, kích hoạt cron hoặc import audience
trong R0.1B.

## Future email release only

Một release email được duyệt sau này phải thêm migration mới, affirmative consent
contract, retention decision và smoke plan trước khi bất kỳ hàng nào có thể gửi.
KV provisioning, email-provider secrets và cron activation thuộc release tương lai
đó, không thuộc R0.1B.

### Secret production

- `BRAIN2_ACCESS_CODE_HASH`
- `BRAIN2_SESSION_SECRET`
- `BREVO_API_KEY`
- `BRAIN2_EMAIL_ADMIN_SECRET`
- `BRAIN2_EMAIL_UNSUBSCRIBE_SECRET`

Giá trị thật chỉ nằm trong Keychain/Cloudflare encrypted secret. Log chỉ được
ghi trạng thái coarse như `brain2_batch`, tuyệt đối không ghi tên, email, token,
API key hay response body từ Brevo.

### Hủy đăng ký

- Email dùng token HMAC không chứa email.
- `GET` chỉ hiển thị trang xác nhận để email scanner không tự hủy.
- `POST` mới cập nhật signup và dừng các hàng v2 còn pending.
- Route Cloudflare phải kết thúc bằng `unsubscribe*` vì matching tính cả query
  string; Worker vẫn kiểm tra `pathname` chính xác.

Nếu D1/provider/binding không sẵn sàng, hệ thống fail closed bằng 503 và không
được coi là đã signup, đã hủy hoặc đã gửi thành công.
