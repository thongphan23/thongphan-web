# Vòng 2 - Tự đánh giá dựng dọc

> Đây là tự đánh giá kỹ thuật và hình ảnh của hệ thống, không phải owner fit và không được tự động ghi thành Taste preference.

## Kết quả

| Phim | Shot đạt | Giữ thấp nhất | Giữ trung bình | Kỹ thuật |
|---|---:|---:|---:|---|
| Soul | 16/19 | 0.00 | 0.95 | PASS |
| Forrest Gump | 13/14 | 0.68 | 0.99 | PASS |
| A Beautiful Mind | 15/18 | 0.31 | 0.97 | PASS |

- Điểm khách quan: **59.0/100**.
- Cổng shot: **44/51**.
- Giữ trọng tâm trung bình: **96.6%**.
- Trạng thái: **NEEDS_IMPROVEMENT**.

## Lỗi quan trọng

- Pixel thật xác nhận face-aware framing sửa phần lớn lỗi cắt mặt của Forrest và John Nash; cải thiện là có thật, không chỉ nằm trong metric.
- Một số shot Soul đông người vẫn bám khuôn mặt lớn nhất hoặc vùng saliency mạnh nhất nhưng đó không phải nhân vật/vật chứng đang mang nghĩa của voice.
- Cảnh hành động rộng có thể giữ một người nhưng làm mất quan hệ người-vật hoặc người-người; đây là lỗi chọn loại tín hiệu, không thể sửa chỉ bằng đổi tâm crop.
- Pan tuyến tính từ keyframe đầu đến cuối khiến camera luôn trôi dù hành động giữa shot cần một khoảng giữ yên; vòng 3 phải dùng đoạn hold và dead-zone.
- `SHOT-SOUL-CAND-SOUL-SE-REACTION-TAIL-01`: giữ thấp nhất 0.53; chiến lược `subject_track`.
- `SHOT-SOUL-CAND-SOUL-GN-ACTION-CORE-02`: giữ thấp nhất 0.00; chiến lược `subject_track`.
- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-03`: giữ thấp nhất 0.00; chiến lược `subject_track`.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-SS-REACTION-TAIL-01`: giữ thấp nhất 0.68; chiến lược `subject_track`.
- `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-ES-ACTION-CORE-02`: giữ thấp nhất 0.31; chiến lược `subject_track`.
- `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-SS-ACTION-CORE-01`: giữ thấp nhất 0.52; chiến lược `subject_track`.
- `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-RM-REACTION-TAIL-03`: giữ thấp nhất 0.77; chiến lược `subject_track`.

## Nâng cấp bắt buộc cho vòng sau

- Phân biệt cảnh cảm xúc ưu tiên mặt với cảnh hành động/vật chứng ưu tiên saliency theo semanticRole.
- Dùng ba keyframe có đoạn hold thay vì pan tuyến tính suốt shot.
- Hạ ngưỡng chuyển tâm nhỏ thành dead-zone và kiểm tra liên tục giữa hai shot cùng claim.

## Bằng chứng

- Soul: `audit/round-2/soul-shot-contact-sheet.jpg`, `renders/round-2-soul.mp4`, `sha256:1e09c2681bfefa050b165e288d302ae06025dc6c8d164277b53c7f3cdefa47c8`.
- Forrest Gump: `audit/round-2/forrest-gump-shot-contact-sheet.jpg`, `renders/round-2-forrest-gump.mp4`, `sha256:8d4c2672d51388e5205d5e5d3f50e2097fc2556f63c33321e3e92277cf9ecfbd`.
- A Beautiful Mind: `audit/round-2/a-beautiful-mind-shot-contact-sheet.jpg`, `renders/round-2-a-beautiful-mind.mp4`, `sha256:3fc8639320984a9277b93845de6065b5aa797ca55ab734c40bcb1651de90d88f`.
