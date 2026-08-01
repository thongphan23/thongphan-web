# Vòng 4 - Tự đánh giá dựng dọc

> Đây là tự đánh giá kỹ thuật và hình ảnh của hệ thống, không phải owner fit và không được tự động ghi thành Taste preference.

## Kết quả

| Phim | Shot đạt | Giữ thấp nhất | Giữ trung bình | Kỹ thuật |
|---|---:|---:|---:|---|
| Soul | 19/19 | 0.83 | 0.98 | PASS |
| Forrest Gump | 14/14 | 0.84 | 0.97 | PASS |
| A Beautiful Mind | 18/18 | 0.92 | 1.00 | PASS |

- Điểm khách quan: **98.0/100**.
- Cổng shot: **51/51**.
- Giữ trọng tâm trung bình: **98.4%**.
- Vật mang nghĩa đạt qua kiểm tra pixel: **94.1%**.
- Trạng thái: **PASS_WITH_RESIDUAL_SOURCE_RISKS**.

## Lỗi quan trọng

- Không còn shot vi phạm cổng bắt buộc trong phép đo hiện tại.

## Kiểm tra vật mang nghĩa trên pixel thật

- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-01`: The source remains dark and visually abstract; this is a source-selection issue, not generated camera motion. Hướng xử lý: Prefer a face or immediately readable action in a future source-selection pass.
- `SHOT-SOUL-CAND-SOUL-NT-REACTION-TAIL-03`: Native source motion blur remains visible; the generated crop itself is static. Hướng xử lý: Score native source-camera and motion-blur risk before vertical crop planning.
- `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-ES-REACTION-TAIL-01`: The swimmer remains small in portrait; the crop is stable but readability still depends on motion. Hướng xử lý: Add portrait-scale readability to source selection before framing.
- Đã sửa `ALL-ROUND-4-SHOTS`: 51/51 shot use one immutable generated crop position; no shot starts offset and recenters or pans between detector keyframes.
- Đã sửa `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-SS-REACTION-TAIL-01`: The award evidence uses one fixed crop instead of panning from the certificate to another person.
- Đã sửa `SHOT-SOUL-CAND-SOUL-GN-ACTION-CORE-02`: The detector identity switch from Joe to the band no longer creates a synthetic cross-frame pan.
- Đã sửa `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-RK-ACTION-CORE-01`: The source cut between lecturer and audience retains one stable crop instead of chasing the detected face in each sub-shot.

## Nâng cấp bắt buộc cho vòng sau

- Giữ camera crop tĩnh làm mặc định lâu dài; chỉ mở tracking khi có intent đã duyệt và cùng một semantic carrier.
- Dùng owner review của ba bản sửa để xác nhận tính ổn định và bố cục, không tự suy diễn thành owner approval.
- Nếu một crop tĩnh không giữ được vật mang nghĩa, thay source hoặc adjudicate carrier; không bật lại pan.

## Bằng chứng

- Soul: `audit/round-4/soul-shot-contact-sheet.jpg`, `audit/round-4/soul-camera-stability-contact-sheet.jpg`, `renders/round-4-soul.mp4`, `sha256:33f781f04490ee82814579e555293f16857187030c0bd77bba78526bd587b4ab`.
- Forrest Gump: `audit/round-4/forrest-gump-shot-contact-sheet.jpg`, `audit/round-4/forrest-gump-camera-stability-contact-sheet.jpg`, `renders/round-4-forrest-gump.mp4`, `sha256:6fe09d50c4ca42aa500866c146ee6508e0d020618b51e1dc58adfb672d302cef`.
- A Beautiful Mind: `audit/round-4/a-beautiful-mind-shot-contact-sheet.jpg`, `audit/round-4/a-beautiful-mind-camera-stability-contact-sheet.jpg`, `renders/round-4-a-beautiful-mind.mp4`, `sha256:33206149fa9e244e4bb826aaa76e55f746f8e17ad0d9a359702569698edf903d`.
