# Vòng 1 - Tự đánh giá dựng dọc

> Đây là tự đánh giá kỹ thuật và hình ảnh của hệ thống, không phải owner fit và không được tự động ghi thành Taste preference.

## Kết quả

| Phim | Shot đạt | Giữ thấp nhất | Giữ trung bình | Kỹ thuật |
|---|---:|---:|---:|---|
| Soul | 10/19 | 0.00 | 0.81 | PASS |
| Forrest Gump | 5/14 | 0.00 | 0.65 | PASS |
| A Beautiful Mind | 12/18 | 0.00 | 0.89 | PASS |

- Điểm khách quan: **59.0/100**.
- Cổng shot: **27/51**.
- Giữ trọng tâm trung bình: **79.6%**.
- Trạng thái: **NEEDS_IMPROVEMENT**.

## Lỗi quan trọng

- Kiểm tra pixel thật cho thấy Soul ở các shot 05-06 chỉ còn vai, lưng hoặc mép cửa; đó là mất chủ thể chứ không chỉ là bố cục chưa đẹp.
- Forrest Gump ở shot xe đạp và một số shot hậu quả cắt một phần người hoặc để hành động quan trọng sát mép; người xem phải đoán phần bị mất.
- A Beautiful Mind giữ mặt tốt hơn nhờ nguồn cận cảnh, nhưng cảnh nhóm người và cảnh tương tác rộng vẫn mất quan hệ không gian.
- Dải phụ đề đã giữ một dòng và không tràn khung; lỗi chính của vòng này nằm ở quyết định vùng hình được giữ lại.
- `SHOT-SOUL-CAND-SOUL-SE-REACTION-TAIL-01`: giữ thấp nhất 0.19; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-RK-REACTION-TAIL-01`: giữ thấp nhất 0.77; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-RK-REACTION-TAIL-02`: giữ thấp nhất 0.21; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-GN-ACTION-CORE-02`: giữ thấp nhất 0.00; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-SS-ACTION-CORE-01`: giữ thấp nhất 0.82; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-02`: giữ thấp nhất 0.70; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-03`: giữ thấp nhất 0.00; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-RM-REACTION-TAIL-01`: giữ thấp nhất 0.47; chiến lược `center_static`.
- `SHOT-SOUL-CAND-SOUL-RM-REACTION-TAIL-02`: giữ thấp nhất 0.59; chiến lược `center_static`.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-ES-REACTION-TAIL-01`: giữ thấp nhất 0.57; chiến lược `center_static`.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-ES-REACTION-TAIL-02`: giữ thấp nhất 0.00; chiến lược `center_static`.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-RK-ACTION-CORE-01`: giữ thấp nhất 0.58; chiến lược `center_static`.

## Nâng cấp bắt buộc cho vòng sau

- Thay crop giữa bằng tâm khung lấy từ mặt hoặc vùng chú ý trên từng keyframe thật.
- Cho phép dải phụ đề chuyển lên trên khi vùng bằng chứng bắt buộc nằm phía dưới.
- Giới hạn tốc độ đổi tâm và giữ khung tĩnh cho shot dưới 2 giây để tránh giật.

## Bằng chứng

- Soul: `audit/round-1/soul-shot-contact-sheet.jpg`, `renders/round-1-soul.mp4`, `sha256:71528c4a796228d507df6c3113c307fc50fd0a322afb39e61b9506ffd85e1145`.
- Forrest Gump: `audit/round-1/forrest-gump-shot-contact-sheet.jpg`, `renders/round-1-forrest-gump.mp4`, `sha256:69f29319700494c10cfe0b5c24db07b81bd715cd288c3e5c9ee4e289afea87e3`.
- A Beautiful Mind: `audit/round-1/a-beautiful-mind-shot-contact-sheet.jpg`, `renders/round-1-a-beautiful-mind.mp4`, `sha256:1249793dcb20240a657f8274c4a4abc74a99e39dcdf7e69dbca69d4e6508cb0a`.
