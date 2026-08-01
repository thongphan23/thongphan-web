# Round 5 - Tự đánh giá Vertical Semantic Composition v2

Ngày: 2026-08-02

## Kết luận

`PASS` về điều kiện kỹ thuật và integrity của vật mang nghĩa. Round 5 không còn
coi video dọc là bản crop của lựa chọn ngang. Mỗi timeline item được khóa theo
chuỗi quyết định:

`beat/claim -> presentation unit -> source -> trim -> native event -> carrier -> frame mode -> encoded pixels`.

Đây chưa phải Taste approval. Chỉ phản hồi sau khi anh xem ba video mới được
ghi nhận thành owner evidence và gắn với đúng variant, beat, item, source trim,
Edit Plan fingerprint và render hash.

## Kết quả đo

| Phim | Timeline item | Frame mã hóa đã xem | Cover static | Context window | Crop di động | Kết quả |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Soul | 24 | 72 | 15 | 9 | 0 | PASS |
| Forrest Gump | 18 | 54 | 9 | 9 | 0 | PASS |
| A Beautiful Mind | 27 | 81 | 22 | 5 | 0 | PASS |
| **Tổng** | **69** | **207** | **46** | **23** | **0** | **PASS** |

Nguồn chuẩn bị gồm 690 keyframe trên 230 native event. Mỗi timeline item cuối
có đúng ba frame kiểm tra `START`, `MID`, `END` trích từ MP4 đã mã hóa.

## Những lỗi Round 4 đã được đóng

1. **Camera đứng yên nhưng mất chủ thể:** hệ thống có Vertical Edit Plan riêng,
   được quyền đổi nguồn hoặc trim trước khi crop.
2. **Một item chứa nhiều cú cắt nội tại:** detector chuẩn chia source trim thành
   native event; item chỉ được tham chiếu một event.
3. **Nhầm vùng nổi bật thành vật mang nghĩa:** carrier có stable ID, loại
   `person`, `action` hoặc `group relation`, kèm visibility requirement.
4. **Crop hẹp phá quan hệ/bối cảnh:** `context_window` giữ cửa sổ ngang nhỏ nhất
   còn đọc đủ bằng chứng trong một dải dọc ổn định.
5. **False-high trên frame nguồn:** gate cuối dùng frame trích từ MP4 đã mã hóa,
   không dùng proxy từ plan hoặc detector.

## Sửa lỗi cuối trong Soul B07

Item cũ dùng source `920-2520 ms` đi qua xe cứu hỏa, motion blur rồi đổi sang
Joe và con mèo. Scene score tại cú cắt là khoảng `0.186`, cao hơn ngưỡng cũ
nhưng bị bỏ sót vì detector dùng `0.20`.

Bản cuối:

- detector mặc định được khóa ở `0.16` với regression test;
- item thay bằng `ASSET-SOUL-DISTRESS-CLOSEUP-4000-5600`;
- carrier là `CHARACTER-22-SOUL`;
- cả `START`, `MID`, `END` giữ cùng nhân vật và cùng native event.

## Fingerprint và render

### Soul

- Edit Plan: `sha256:ecd934102bad38b04cb00d3e177f026310a88959fb2a4b299bf516db2480158a`
- Render: `sha256:f40af25812eff9fd2cf7074e9cdc463485b83ad0b183b69fbf072e43462c00b3`

### Forrest Gump

- Edit Plan: `sha256:d7548e9fcdae93be3e7401999c7dbaf006a9ddadb5dfd7bbcbf0c71830229556`
- Render: `sha256:816a6602462252a3c52cec34190fc6fabc8d8bc8f907524202529fa00b84d7c7`

### A Beautiful Mind

- Edit Plan: `sha256:7ef1d66dcf65af6b24ad2ec5c6641d5e31acdf7ae981b58952d656bac1f91006`
- Render: `sha256:907571812d647247aad807d8d7a213639bb80cd8a1713619da3242a21ac2a16e`

## Evidence

- `encoded_pixel_evidence.json`: thông số media, hash MP4, 207 frame hash.
- `../../audit/round-5/manual_pixel_adjudication.json`: quyết định xem trực tiếp.
- `../../variants/<film>/content/vertical_beat_contract.json`: vật mang nghĩa phải giữ.
- `../../variants/<film>/content/source_event_segmentation.json`: ranh giới native event.
- `../../variants/<film>/content/vertical_composition_plan.json`: lựa chọn và phương án bị loại.
- `../../variants/<film>/content/vertical_edit_plan.json`: timeline renderer đã khóa.
- `../../variants/<film>/audit/vertical_semantic_pixel_qa.json`: fail-closed pixel QA.

## Rủi ro còn lại cần owner chấm

- `context_window` giữ đúng quan hệ/bối cảnh nhưng có thể làm chủ thể nhỏ hơn
  cảm giác anh mong muốn.
- Mật độ cắt ở cao trào B07 có thể đúng nghĩa nhưng vẫn cần chấm nhịp cảm xúc.
- PASS kỹ thuật không tự động chứng minh ba phim chạm cảm xúc ngang nhau.

