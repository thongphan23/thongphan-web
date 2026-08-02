# Owner Review Packet - Round 6

## Ba video cần xem

1. Soul: `renders/soul.mp4`
2. Forrest Gump: `renders/forrest-gump.mp4`
3. A Beautiful Mind: `renders/a-beautiful-mind.mp4`

Cả ba dùng nguyên voice được cung cấp, dài 59,652 giây, 1080x1920, H.264/AAC.
Mỗi bản chỉ dùng một phim và không còn dải khổ ngang hoặc nền mờ cứu crop.

## Điều cần anh kiểm tra

1. Có đoạn nào vẫn tạo cảm giác là cảnh ngang bị thu nhỏ trong khung dọc không?
2. Nhân vật, hành động hoặc vật chứng quan trọng có luôn nằm trong khung không?
3. Các lần đổi portrait hold có giống hard cut có chủ ý, hay tạo cảm giác giật?
4. Cảnh Forrest tốt nghiệp có truyền “mục đích bên ngoài/thành tựu” rõ hơn cảnh
   nhận diện quá rộng trước đó không?
5. Phim và beat nào còn khó hiểu dù crop kỹ thuật đã đúng?

## Cách phản hồi để Taste học đúng

Nêu phim và khoảng thời gian nếu có thể. Hệ thống sẽ resolve phản hồi vào đúng
`timeline_item_id`, `beat_id`, source trim, carrier ID, Edit Plan fingerprint và
render hash. Không nâng Taste từ nhận xét chưa gắn được vào bằng chứng cụ thể.

## Bằng chứng trực tiếp

- `SELF-EVALUATION.md`
- `encoded_pixel_evidence.json`
- `../../audit/round-6/manual_pixel_adjudication.json`
- `../../audit/round-6/rendered-contact-sheets/<film>/page-*.jpg`
- `../../variants-round-6/<film>/content/vertical_composition_plan.json`
- `../../variants-round-6/<film>/content/vertical_edit_plan.json`
- `../../variants-round-6/<film>/audit/vertical_semantic_pixel_qa.json`

## Trạng thái Taste

`NOT_PROMOTED_PENDING_OWNER_REVIEW`
