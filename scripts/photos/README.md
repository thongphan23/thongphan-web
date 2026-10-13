# Ảnh thật cho `/`, `/tensai`, `/conan`

Bộ công cụ này tạo các file `public/images/two-path/<id>.webp` và đi cùng manifest
`lib/two-path-photos.ts`. Manifest là nguồn duy nhất cho kích thước, chữ thay thế (alt),
chú thích, nguồn và trạng thái khuôn mặt của từng ảnh.

## Yêu cầu

- macOS có `swift` (Vision framework) cho `detect-faces.swift` và `person-mask.swift`.
- `python3` có Pillow và numpy.
- `cwebp` (`brew install webp`).

## Quy trình

Đặt ảnh nguồn vào một thư mục tạm (ví dụ `$P`), đặt tên đúng cột `src` trong `jobs.json`.
Ảnh gốc của Thông (ví dụ `DQH179.JPG`) **không commit** vào repo.

1. Ảnh sân khấu có khán giả: tách người nói, tìm mặt, làm mờ nền.

   ```bash
   swift scripts/photos/person-mask.swift "$P/dqh179.jpg" "$P/dqh179-mask.png"
   swift scripts/photos/detect-faces.swift "$P/dqh179.jpg" > "$P/dqh179-faces.json"
   python3 scripts/photos/blur-audience.py "$P/dqh179.jpg" "$P/dqh179-mask.png" "$P/dqh179-blurred.jpg" \
     --faces "$P/dqh179-faces.json" --zone 0,0.62,0.30,1.0 --preview "$P/prev-dqh179.jpg"
   ```

2. Chân dung có slide phía sau: làm mờ toàn bộ nền để chữ trên slide không đọc được.

   ```bash
   swift scripts/photos/person-mask.swift "$P/speaker.jpg" "$P/speaker-mask.png"
   python3 scripts/photos/blur-audience.py "$P/speaker.jpg" "$P/speaker-mask.png" "$P/speaker-blurred.jpg" \
     --band 0,1 --radius 0.035 --grow 5 --preview "$P/prev-speaker.jpg"
   ```

3. Cắt, thu nhỏ và nén theo ngân sách byte:

   ```bash
   python3 scripts/photos/export-webp.py --src-dir "$P"
   python3 scripts/photos/export-webp.py --src-dir "$P" --only home-hero conan-hero
   ```

4. Cập nhật `lib/two-path-photos.ts` (kích thước in ra ở bước 3) rồi chạy
   `node --import tsx --test scripts/two-path-photos.test.ts`.

## Bắt buộc tự xem ảnh

Sau bước làm mờ và sau khi xuất webp, mở ảnh preview và ảnh webp ở 100% để kiểm từng khuôn
mặt: khán giả phải không nhận diện được, người nói phải giữ nét, không có quầng sáng/tối quanh
người. Máy dò mặt bỏ sót mặt nhỏ, nghiêng hoặc bị che, nên kết quả máy không thay được mắt người.

## Nguồn ảnh

| Ảnh | Nguồn |
|---|---|
| `home-hero`, `home-hero-mobile` | `DQH179.JPG` do Thông cung cấp, khán giả đã làm mờ |
| `founder-portrait` | `assets/branding/thongphan-speaker-hires.jpg`, nền slide đã làm mờ |
| `door-tensai` | `public/images/homepage/proof/thong-author-book-3x2-v1.webp` |
| `tensai-map`, `tensai-lesson` | Ảnh chụp app Tensai live 01/10/2026 (`tensai-home/docs/positioning-v8/release/screens/`) |
| `door-conan`, `conan-hero*`, `field-content-class`, `gallery-*` | Album công khai "Cộng đồng có gì hay?" trên conan.school (URL từng ảnh ghi trong manifest) |
| `mentor-dac-nguyen`, `mentor-thong-phan` | `https://image.conan.school/mentors/` |

## Trạng thái khuôn mặt

`faces` trong manifest quyết định ảnh có được phát hành hay không:

- `none`, `thong-only`, `blurred`, `consent-confirmed`: được dùng.
- `pending-owner-consent`: có người nhận diện được nhưng chưa có xác nhận đồng ý. Cổng
  `npm run test:photo-consent` (chạy cuối `test:release`) sẽ đỏ nếu trang build ra hoặc mã
  nguồn trang còn dùng ảnh này.

Khi Thông xác nhận đồng ý cho một ảnh, đổi sang `consent-confirmed` và ghi `consentNote`
(ai xác nhận, ngày nào, phạm vi).
