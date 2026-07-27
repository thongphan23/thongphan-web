# Reader Loop v0 — preview isolation contract

Reader Loop v0 chỉ chạy trên hạ tầng preview độc lập:

- D1: `thongphan-reader-loop-preview` với ID riêng được ghi trong `wrangler.reader-loop-preview.toml` sau khi provision.
- Worker: `thongphan-reader-loop-preview-api`.
- Worker chỉ dùng `workers.dev` và preview URL; không có custom route hoặc production DNS.
- UI dùng một Pages project/preview deployment riêng, không thay binding của project production.
- Không KV, R2, Queue, secret, production signup hoặc production data copy.
- Article body tiếp tục lấy từ Git và URL canonical `/library/*`; D1 chỉ giữ state anonymous của Reader Loop.

Production D1 `7cffb7f5-c48b-49c2-b215-9611abd734a5` bị cấm tuyệt đối trong config, script, runtime và test của Reader Loop. Contract test `scripts/reader-loop-preview-isolation.test.mjs` fail nếu ID, Worker identity, route hoặc binding production xuất hiện.
