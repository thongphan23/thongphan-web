# Vòng 3 - Tự đánh giá dựng dọc

> Đây là tự đánh giá kỹ thuật và hình ảnh của hệ thống, không phải owner fit và không được tự động ghi thành Taste preference.

## Kết quả

| Phim | Shot đạt | Giữ thấp nhất | Giữ trung bình | Kỹ thuật |
|---|---:|---:|---:|---|
| Soul | 19/19 | 0.83 | 0.99 | PASS |
| Forrest Gump | 14/14 | 0.98 | 1.00 | PASS |
| A Beautiful Mind | 18/18 | 0.85 | 1.00 | PASS |

- Điểm khách quan: **97.2/100**.
- Cổng shot: **51/51**.
- Giữ trọng tâm trung bình: **99.5%**.
- Vật mang nghĩa đạt qua kiểm tra pixel: **94.1%**.
- Trạng thái: **PASS_WITH_RESIDUAL_SOURCE_RISKS**.

## Lỗi quan trọng

- Không còn shot vi phạm cổng bắt buộc trong phép đo hiện tại.

## Kiểm tra vật mang nghĩa trên pixel thật

- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-01`: Khung giữa shot quá tối và hình thể trừu tượng, khó đọc nếu dừng hình. Hướng xử lý: Ở run sau phải ưu tiên nguồn có khuôn mặt hoặc hành động căng thẳng đọc được ngay.
- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-03`: Chuyển động xe cứu hỏa tạo motion blur mạnh ở midpoint. Hướng xử lý: Đánh giá bằng nhiều frame liên tiếp và tránh dùng midpoint duy nhất cho shot tốc độ cao.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-ES-REACTION-TAIL-01`: Nhân vật dưới nước còn nhỏ nên ý hướng nội phụ thuộc vào chuyển động nhiều hơn khung tĩnh. Hướng xử lý: Bổ sung điểm dễ đọc ở kích thước dọc vào cổng chọn nguồn trước khi lập crop.
- Đã sửa `SHOT-SOUL-CAND-SOUL-RK-REACTION-TAIL-02`: Cảnh làm việc giữ được nhân vật và nối hành động liên tục, không còn vai áo vô nghĩa.
- Đã sửa `SHOT-SOUL-CAND-SOUL-KE-REACTION-TAIL-01`: Gương mặt Joe xuất hiện trọn vẹn và đọc được trạng thái tỉnh thức.
- Đã sửa `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-SS-REACTION-TAIL-01`: Khung giữ người trao và tấm bằng trước, sau đó mới chuyển sang người nhận.

## Nâng cấp bắt buộc cho vòng sau

- Giữ owner review làm nguồn Taste tiếp theo; không tự coi điểm tự đánh giá là owner fit.
- Với shot còn fail hard gate, quay lại bước chọn nguồn thay vì ép crop hoặc dùng xác suất để cứu.
- Mở rộng quan sát vật thể chuyên biệt cho cúp, sách, công cụ và tương tác hai người ở các run sau.

## Bằng chứng

- Soul: `audit/round-3/soul-shot-contact-sheet.jpg`, `renders/round-3-soul.mp4`, `sha256:e700c9597b8d4d1711154123f43f28dc21fe90315b913deaac52df312048d482`.
- Forrest Gump: `audit/round-3/forrest-gump-shot-contact-sheet.jpg`, `renders/round-3-forrest-gump.mp4`, `sha256:39537a31136a0fd63c58bbc141da14f8be63505dba86ffa39ab40be72b89df94`.
- A Beautiful Mind: `audit/round-3/a-beautiful-mind-shot-contact-sheet.jpg`, `renders/round-3-a-beautiful-mind.mp4`, `sha256:76d2eb609a7e92ff45a434e7bcf154faf6a3603a074a5e1ede507babc01283f7`.
