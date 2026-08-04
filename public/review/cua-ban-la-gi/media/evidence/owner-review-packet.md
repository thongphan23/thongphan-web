# Owner Review Packet - Của bạn là gì?

## Kết quả

- Trạng thái: `READY_FOR_OWNER_REVIEW`
- Định dạng: dọc `9:16`, `1080x1920`, `30 fps`
- Thời lượng: `88.213 giây`
- Voice: giữ nguyên audio được trích từ Facebook Reel do owner cung cấp
- Phim minh họa duy nhất: `Coco`
- Cấu trúc biên tập: `26` shot từ `13` clip nguồn; sau khi tách native cut, renderer dùng `46` timeline item
- Camera nhân tạo: `0`; mỗi timeline item dùng một crop dọc tĩnh đã khóa trong `vertical_edit_plan`
- Phụ đề: `45` đoạn, mỗi đoạn đúng một dòng, tối đa `30` ký tự; phủ đủ `231/231` từ có timestamp

## Ý đồ truyền thông

Video biến một ước muốn quay ngược thời gian thành một lời nhắc hành động ở hiện tại. Người xem cần nhớ: **nếu phép màu của mình còn hiện hữu, đừng để cái ôm phải chờ đến một giấc mơ**.

## Vì sao chọn Coco

`Coco` được chọn thay cho `Minari` và `The Farewell` vì cùng một phim đã có đủ các bằng chứng hình ảnh đọc được khi tắt tiếng: quan hệ ông bà - cháu, ảnh gia đình, sự biến mất không thể đảo ngược, ký ức đời thường, gặp lại và cái ôm. Khóa một phim giữ tuyến nhân vật và thế giới hình ảnh liên tục, tránh bắt người xem học lại bối cảnh.

## Các điểm neo hình ảnh

| Khoảng | Nội dung voice | Bằng chứng hình ảnh |
|---|---|---|
| 00:00-00:04 | Điều ước phi lý nhất | Ảnh gia đình trên bàn thờ |
| 00:04-00:15 | Quay lại gặp ông | Đứa trẻ chạy, người ông giữ ảnh, hai thế hệ ngồi cạnh nhau |
| 00:15-00:22 | Sợ sinh ly tử biệt | Gương mặt người bà lo sợ rồi gương mặt đứa trẻ đau buồn |
| 00:22-00:37 | Tưởng người vẫn còn ở bên | Tiếp xúc an ủi rồi ảnh gia đình giữ lâu trong khung |
| 00:37-00:44 | Không thể gặp, nghe, nắm tay | Người rời đi và khoảng trống vật lý còn lại |
| 00:44-01:09 | Phép màu, ký ức và giấc mơ | Hai thế hệ gần nhau, ký ức trở lại, gia đình tụ họp |
| 01:09-01:18 | Tìm cách khác để gặp lại | Người ông và đứa cháu cùng giữ kỷ vật |
| 01:18-01:28 | Ôm phép màu đang hiện hữu | Ánh sáng được trao, cái ôm trực tiếp và dư âm gia đình |

## Gate đã chạy

- Timeline liền mạch và trim không bị kéo dài: `PASS`
- Source trim không trùng nhau: `PASS`
- Crop dọc giữ chủ thể/ý nghĩa: `PASS` trên `46/46` timeline item
- Kiểm tra khung mã hóa START/MID/END: `138/138` quan sát `PASS`
- Silent review: `PASS`
- Không có đoạn đen dài hơn 250 ms: `PASS`
- Không có khoảng im lặng dưới -45 dB dài hơn 1.5 giây: `PASS`
- Phụ đề một dòng và nằm trong vùng an toàn mạng xã hội: `45/45` quan sát pixel mã hóa `PASS`
- TypeScript: `PASS`

## Sửa lỗi sau phản hồi owner

- Bỏ việc đưa `focus_x` thủ công thẳng vào CSS; renderer chỉ đọc tọa độ đã chuyển đổi và khóa trong `vertical_edit_plan`.
- Tách các clip có thay đổi nhân vật hoặc góc máy tại native cut, nên không còn một crop tĩnh bị kéo qua nhiều chủ thể.
- Thay kiểm tra JSON tự khai bằng kiểm tra pixel từ master thật ở START/MID/END.
- Đối chiếu bản có phụ đề với bản silent cùng frame và cùng CRF để chứng minh phụ đề thực sự đã được đốt vào hình.
- Bản review dùng tên MP4 chứa SHA-256 rút gọn; không tái sử dụng URL `immutable` cũ.

## Tệp truy vết

- `content/transcript_approved.json`
- `content/voice_timeline.json`
- `content/communication_intent.json`
- `content/message_architecture.json`
- `content/narrative_intent.json`
- `content/viewer_model.json`
- `content/creative_plan.json`
- `content/source_casting_board.json`
- `content/pacing_design.json`
- `content/production_shot_plan.json`
- `content/vertical_composition_plan.json`
- `content/vertical_edit_plan.json`
- `content/subtitles.json`
- `audit/native-cut-and-crop-review.json`
- `audit/vertical-rendered-observations.json`
- `audit/vertical_semantic_pixel_qa.json`
- `audit/vertical-caption-rendered-observations.json`
- `audit/vertical_caption_safe_area_qa.json`
- `evidence/final/final-video-qa.json`
- `evidence/final/owner-feedback-crop-caption-incident.md`
- `remotion/renders/final-contact-sheet-v3.jpg`

## Nội dung cần owner chấm

1. Mức độ dễ hiểu giữa voice và hình khi không cần biết trước phim.
2. Nhịp giữ lâu ở đoạn ảnh gia đình so với các cụm cảm xúc nhanh hơn.
3. Mức độ chạm cảm xúc của đoạn kết ánh sáng - cái ôm - gia đình.
4. Vị trí và khả năng đọc phụ đề trên nền tảng dọc thực tế.
# Bằng chứng tăng tốc production

- Kế hoạch 120 phút: `content/production_acceleration_plan.json`
- Báo cáo 12 cổng chất lượng: `evidence/acceleration/production-acceleration-report.json`
- Receipt page/video HTTP 200: `evidence/final/review_publish_receipt.json`
- Benchmark: run cũ 660 phút; đường găng mới 110 phút nhờ 13 footage Coco `FRESH`, không bỏ cổng chất lượng.
