# Round 6 - Tự đánh giá Full-Bleed Vertical Composition v3

Ngày: 2026-08-02

## Kết luận

`PASS` cho sửa lỗi kỹ thuật mà anh đã chỉ ra: bản dọc không còn bê nguyên dải
phim ngang vào giữa khung. Tất cả cảnh cuối đều lấp đầy 1080x1920, giữ một vị
trí crop tĩnh trong từng item và bảo toàn vật mang nghĩa đã khóa.

Đây chưa phải Taste approval. Phản hồi tiếp theo chỉ được gắn vào Taste sau khi
anh xem đúng ba render có hash trong tài liệu này.

## Kết quả đo

| Phim | Timeline item | Frame mã hóa đã xem | Full-bleed | Crop di động | Frame hở | Kết quả |
|---|---:|---:|---:|---:|---:|---|
| Soul | 28 | 84 | 28 | 0 | 0 | PASS |
| Forrest Gump | 31 | 93 | 31 | 0 | 0 | PASS |
| A Beautiful Mind | 33 | 99 | 33 | 0 | 0 | PASS |
| **Tổng** | **92** | **276** | **92** | **0** | **0** | **PASS** |

## Gốc lỗi đã đóng

1. Planner cũ cho phép nới crop thành `context_window` để cứu bối cảnh.
2. Renderer biến lựa chọn đó thành dải phim ngang trên nền mờ.
3. Pixel QA chỉ chứng minh chủ thể còn hiện diện, chưa chứng minh ảnh lấp toàn
   bộ khung dọc.
4. Renderer làm tròn độc lập thời điểm bắt đầu và độ dài, đôi lúc tạo một frame
   trống giữa hai item ngắn.
5. Saliency có thể bị hiểu nhầm là semantic carrier dù chưa có quan sát ngữ
   nghĩa và danh tính chủ thể.

## Cơ chế mới

- Final delivery chỉ nhận `cover_static`.
- Carrier di chuyển được chia thành các portrait hold tĩnh; không lia camera.
- Nếu cùng một source không thể giữ đủ người, hành động hoặc vật chứng, source
  bị loại và phải chọn cảnh khác trong cùng phim.
- Thời lượng frame bằng `round(end) - round(start)`, nên biên liền nhau tuyệt
  đối.
- QA kiểm tra START/MID/END từ MP4 đã mã hóa, full-bleed, carrier, tỉ lệ hiển
  thị, phụ đề và tính liên tục cấp frame.

## Sửa source cụ thể

Cảnh Forrest nhận diện với Nixon và bảng chứng nhận trải quá rộng, không thể
vừa lấp khung 9:16 vừa giữ đủ bằng chứng. Hệ thống đã loại cảnh này và dùng cảnh
tốt nghiệp trong cùng phim: Forrest cùng bằng chứng thành tựu đều đọc được trong
khung dọc.

## Fingerprint và render

- Soul Edit Plan: `sha256:6c0abe71bbdbeb202f1844b6ec654974fd1362c4f38c7b6519447519e7dcb8e1`
- Soul render: `sha256:ee4ae6dd6c7b545971a1f3b5b8a6b26b67321515d6004062b7656d375daadcec`
- Forrest Gump Edit Plan: `sha256:28eb2669ae8bc6751ac393e185c24ed1e3f01ba3812bcfd0eb9dfea95390a4d0`
- Forrest Gump render: `sha256:96759550809c69df37c136b6deb828b077c3c3d76f2f6c2c0bec7fd092db2a81`
- A Beautiful Mind Edit Plan: `sha256:e6f1c8d7a0e622501f58971a59b6b3731399b27af93aa3db9e2f7baab27693c4`
- A Beautiful Mind render: `sha256:a9cdbe2202a1f668d43b8df4ae40c6bef624e2d16e42a4951f1e3b8036e1fc6b`

## Bằng chứng

- `encoded_pixel_evidence.json`
- `../../audit/round-6/manual_pixel_adjudication.json`
- `../../audit/round-6/rendered-contact-sheets/<film>/page-*.jpg`
- `../../variants-round-6/<film>/content/vertical_composition_plan.json`
- `../../variants-round-6/<film>/content/vertical_edit_plan.json`
- `../../variants-round-6/<film>/audit/vertical_semantic_pixel_qa.json`

## Ranh giới còn cần anh chấm

PASS kỹ thuật chứng minh khung dọc đúng và không mất carrier. Nó chưa tự chứng
minh nhịp cảm xúc, lựa chọn cảnh và mức độ dễ hiểu đã đúng Taste của anh.
