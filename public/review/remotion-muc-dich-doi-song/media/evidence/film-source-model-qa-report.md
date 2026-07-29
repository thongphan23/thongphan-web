# Film Source Model QA Report

## Kết luận

`PASS` cho vòng owner review. Ba bản dùng cùng voice, subtitle, nhạc nền, meaning
beats và viewer model; biến độc lập duy nhất là phim, tuyến nhân vật và casting
cảnh. Không bản nào lặp asset trong chính video.

## Chọn nguồn phim

- Chọn `The Devil Wears Prada`: gần người trẻ văn phòng, có thành tích nhìn thấy
  được, nhịp thăng tiến và cái giá quan hệ trên cùng tuyến Andy.
- Chọn `The Truman Show`: có tuyến áp đặt - nhận ra - phản kháng - dư âm, đọc
  được bằng hành động và phản ứng khi tắt tiếng.
- Chọn `Inside Out`: biến trạng thái nội tâm, ký ức, phần thưởng, áp lực và mất
  cân bằng thành vật thể, gần ưu điểm diễn đạt của `Soul`.
- Loại `The Intern`: thiếu xung đột và hậu quả cho cao trào cuối.
- Loại `Office Space`: dễ làm lệch thesis thành châm biếm chống công việc.
- Loại `The Pursuit of Happyness`: source pool mỏng và có nguy cơ củng cố niềm
  tin phải đau khổ mới xứng đáng thành công.

## Bằng chứng sản xuất

- 84 clip Clip.cafe được tải và quan sát: Prada 30, Truman 24, Inside Out 30.
- 68 shot được khóa: Prada 24, Truman 21, Inside Out 23.
- Mỗi selected shot có visible fact cụ thể, source URL, observation package và
  contact-sheet reference; mô tả thoại không được dùng thay bằng chứng hình.
- Source phim tắt tiếng; voice đầu vào là nguồn âm thanh authoritative.
- Phụ đề chia 28 segment, mỗi dải giấy chỉ chứa một dòng.
- Luật luân phiên được seal ở khoảng cách tối thiểu 5 video; ba phim cũ bị chặn
  trong batch hiện tại và ba phim mới nhận ordinal 7, 8, 9.

## QA kỹ thuật

- Cả ba master: 1920x1080, H.264/AAC, 59.712 giây.
- Âm thanh chung: -15.0 LUFS integrated, -5.2 dBFS true peak.
- `blackdetect`: không có đoạn đen dài hơn 0.3 giây.
- `freezedetect`: không có đoạn đứng hình dài hơn 2.5 giây.
- Plugin focused: 46 passed; plugin full: 795 passed.
- VBE full: 75 passed; Remotion TypeScript: PASS.

## Ghi chú cần owner chấm

Đây là owner-review round, không phải kết luận Taste cuối. Cần chấm theo bốn
tín hiệu `Hiểu - Cảm - Nhớ - Tin`, đặc biệt ở đoạn cao trào 38.58-49.96 giây.
Feedback tiếp theo phải tham chiếu variant + timestamp để trở thành Taste
evidence có thể kiểm chứng.
