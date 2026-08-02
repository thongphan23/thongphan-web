# Round 7 - Tự đánh giá phụ đề dọc trong vùng an toàn mạng xã hội

Ngày: 2026-08-02

## Kết luận

`PASS` cho lỗi kỹ thuật được nêu: phụ đề của ba video dọc không còn nằm ở đáy
khung hoặc thay đổi trên/dưới theo shot. Phụ đề được khóa vào một làn ổn định
gần giữa, hơi chếch xuống dưới và nằm trong giao điểm vùng an toàn của TikTok,
Instagram Reels và YouTube Shorts.

Đây chưa phải Taste approval. Round 7 kế thừa nguyên picture plan của Round 6,
nên phản hồi mới có thể được quy về đúng thay đổi phụ đề.

## Kết quả đo trên MP4 đã mã hóa

| Phim | Phụ đề kiểm tra | Một dòng | Ba nền tảng an toàn | OCR thấp nhất | Kết quả |
|---|---:|---:|---:|---:|---|
| Soul | 30 | 30/30 | 90/90 | 1,00 | PASS |
| Forrest Gump | 30 | 30/30 | 90/90 | 1,00 | PASS |
| A Beautiful Mind | 30 | 30/30 | 90/90 | 1,00 | PASS |
| **Tổng** | **90** | **90/90** | **270/270** | **1,00** | **PASS** |

Mỗi phụ đề được kiểm tra một lần trên từng phim; mỗi phép kiểm tra lại được đối
chiếu với ba hồ sơ giao diện nền tảng. OCR Apple Vision đọc lại đúng 100% nội
dung trên toàn bộ 90 frame giữa phụ đề.

## Vùng an toàn và bố cục

- TikTok in-feed: `x=120, y=240, width=780, height=1020`.
- Instagram Reels: `x=108, y=270, width=804, height=1050`.
- YouTube Shorts: `x=108, y=231, width=804, height=1185`.
- Giao điểm bắt buộc: `x=120, y=270, width=780, height=990`.
- Làn phụ đề: tâm `x=510, y=1180`, cho phép `y=1056..1190`.
- Mảnh giấy thực tế: cao 72 px, rộng co theo text từ 360 đến 750 px.
- Text: một dòng, tối đa 38 ký tự, font 28-38 px, Be Vietnam Pro 700.

## Gốc lỗi đã đóng

1. Picture plan cũ cho phép phụ đề đổi giữa `top` và `bottom` theo shot, phù hợp
   với tránh carrier nhưng không đại diện cho vùng an toàn giao diện mạng xã hội.
2. Vị trí đáy có thể bị tên kênh, mô tả và nút tương tác che khi đăng thật.
3. Chia hai dòng làm mảnh giấy cao và khó quét mắt; tách quá ngắn lại tạo các
   flash một từ gây giật nhịp.
4. Renderer chưa có hợp đồng nền tảng và chưa kiểm tra lại text trên MP4 sau mã hóa.

## Cơ chế mới

- `social_ui_intersection.v1` là vùng duy nhất được phép cho phụ đề dọc cuối.
- Reflow sử dụng word timeline thật, cân bằng câu để loại orphan flash, không
  suy đoán lại timestamp từ số ký tự.
- Một mảnh giấy chỉ chứa một dòng; chiều rộng co theo nội dung.
- Renderer dùng font cục bộ và khóa render cho đến khi font đã tải.
- QA trích 90 frame từ MP4, đo bbox, độ phủ giấy, OCR và sinh ảnh phủ mô phỏng
  TikTok, Reels, Shorts để review bằng mắt.

## Fingerprint và render

- Soul caption plan: `sha256:bd6f507e6d636b37b0937df9a5ad24abe72c92178a791ca592a05687d5a1d49e`
- Soul render: `sha256:93e9548ad79cef65876e65b8535a9820cd338dfdb3fcaf7fef63c7e6733682f5`
- Forrest Gump caption plan: `sha256:775d749b75ce9d3edbdcce7b0f1963bfe0f5f060feea8945483d86436f61c3cd`
- Forrest Gump render: `sha256:642d23c0a6ec3ed4867006086eced9f1b84b9ed85452a1c03c974bd577f437ef`
- A Beautiful Mind caption plan: `sha256:a53fd6d7bf97e54a1d339b8634c10df5d8994778802bdda4f4d3ae6624af29d3`
- A Beautiful Mind render: `sha256:1d5f420eb93c2d9280ef84e1c4d3c01a892246617e4857bf62fca5cb6583246b`

## Ranh giới còn cần anh chấm

PASS này chứng minh phụ đề đọc được và không đụng UI chuẩn. Nó chưa chứng minh
mọi caption đều không che carrier theo Taste. Nếu phụ đề và carrier cùng cần một
vùng, rule mới bắt buộc sửa crop hoặc chọn source khác, không đẩy chữ ra vùng
nguy hiểm.
