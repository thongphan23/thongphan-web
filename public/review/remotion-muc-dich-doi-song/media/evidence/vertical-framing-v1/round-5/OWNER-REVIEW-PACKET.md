# Owner Review Packet - Round 5

## Ba video cần xem

1. Soul: `renders/soul.mp4`
2. Forrest Gump: `renders/forrest-gump.mp4`
3. A Beautiful Mind: `renders/a-beautiful-mind.mp4`

Cả ba dùng nguyên voice được cung cấp, dài 59,652 giây, 1080x1920, H.264/AAC.
Không phim nào bị trộn nguồn với phim khác.

## Điều cần anh kiểm tra

1. So với Round 4, có còn đoạn nào camera đứng yên nhưng người hoặc vật quan
   trọng bị mất khỏi khung không?
2. Trong mỗi shot, `START`, `MID`, `END` có giữ đúng cùng một chủ thể và cùng
   một ý hiểu không?
3. Các đoạn dùng `context_window` có giữ đủ hành động/quan hệ mà không làm hình
   quá nhỏ không?
4. Soul B07 từ 38,58 đến 49,96 giây có truyền được nhịp vật lộn/đau khổ mà
   không còn cảnh tối, xe cứu hỏa hoặc đổi nhân vật vô nghĩa không?
5. Phim nào matching voice rõ nhất; beat nào vẫn khó hiểu nhất?

## Cách phản hồi để hệ thống học đúng

Nêu tên phim và khoảng thời gian nếu có thể. Hệ thống sẽ resolve phản hồi vào
đúng `timeline_item_id`, `beat_id`, source trim, carrier ID, Edit Plan
fingerprint và render hash. Phản hồi chưa resolve hoặc chỉ gắn ở cấp video sẽ
không được tự động nâng thành Taste rule.

## Bằng chứng trực tiếp

- `SELF-EVALUATION.md`
- `encoded_pixel_evidence.json`
- `../../audit/round-5/manual_pixel_adjudication.json`
- `../../audit/round-5/rendered-contact-sheets/<film>/page-*.jpg`
- `../../variants/<film>/content/vertical_composition_plan.json`
- `../../variants/<film>/content/vertical_edit_plan.json`
- `../../variants/<film>/audit/vertical_semantic_pixel_qa.json`

## Trạng thái Taste

`NOT_PROMOTED_PENDING_OWNER_REVIEW`

