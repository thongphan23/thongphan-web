# Reader Loop v0 review bundle

Status: **READY FOR REVIEW — preview only, unmerged**

- Preview: https://reader-loop-v0.thongphan-reader-loop-preview.pages.dev/read
- Evidence Inspector: https://reader-loop-v0.thongphan-reader-loop-preview.pages.dev/read/inspector
- PR: https://github.com/thongphan23/thongphan-web/pull/8
- Verified implementation head before this review-bundle commit:
  `f937a76d96681bd2d1efefd54bca3832d01c846f`
- Final preview deployment: `bbcd5eee.thongphan-reader-loop-preview.pages.dev`
- Worker version: `6c174123-2bad-41a9-ac4f-e05e41259cce`

## Demo flow dưới năm phút

1. Mở `/read` và chọn một vấn đề mẫu hoặc `Câu hỏi khác`.
2. Nhấn `Nhận một bài để bắt đầu`; đọc lý do, kết quả mong đợi và các lựa chọn thay thế.
3. Nhấn `Đọc bài này`; nội dung vẫn là bài canonical dưới `/library/[slug]`.
4. Cuộn bài, chọn `Đánh dấu đã đọc xong`, điền hai trường phản tư bắt buộc.
5. Xem một Next Best Action cùng lý do; mở `Evidence Inspector` để kiểm tra toàn chuỗi evidence → decision.

## Ba kịch bản đã chạy trên public preview

- **Scenario A — PASS:** sample question → recommendation → read → completion → reflection → next action.
- **Scenario B — PASS:** custom question → recommendation → refresh/resume → completion, chạy ở viewport mobile 390×844.
- **Scenario C — PASS:** incomplete session → return `/read` → thấy coverage đã lưu lớn hơn 0 → continue đúng session → complete.

Mỗi kịch bản dùng một browser context ẩn danh riêng. Lệnh cuối trên deployment public:

```bash
READER_LOOP_BASE_URL=https://reader-loop-v0.thongphan-reader-loop-preview.pages.dev \
READER_LOOP_SCREENSHOT_DIR=.tmp/reader-loop-browser-qa-final-deployment \
npm run qa:reader-loop-browser
```

## Tuyên bố cách ly production

Reader Loop v0 chỉ dùng:

- Pages project `thongphan-reader-loop-preview`;
- Worker `thongphan-reader-loop-preview-api` trên `workers.dev`;
- D1 `thongphan-reader-loop-preview`, ID `cbc3a7e5-d614-4648-bd12-b9839047d61d`.

Config không có production route, KV, secret hoặc production D1 ID
`7cffb7f5-c48b-49c2-b215-9611abd734a5`. Không có production data copy và không có Reader Loop production write.

## Nội dung bundle

- `ACCEPTANCE-RESULTS.md`: definition-of-done, gates và audit verdict.
- `DATA-AND-EVIDENCE.md`: data boundary, traceability và readback D1.
- `BACKLOG-P2-P3.md`: các finding không chặn review.
- `screenshots/`: bằng chứng desktop, mobile, ba scenarios, Inspector và API fallback.
