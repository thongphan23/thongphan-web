# Owner feedback incident - crop and captions

## Status

```text
EVIDENCE_CAPTURED: YES
TASTE_PROMOTION: NO
GRAPH_INGESTION: BLOCKED_LEGACY_RUN_MISSING_GLOBAL_EDIT_PLAN
RENDER_UNDER_REVIEW_SHA256: 3ca0371abe5a5f87811b7290e395a206fdae7af3c2cdf64dead8fb1f7f7d9070
CORRECTED_MASTER_SHA256: 3dec0c51959cc086882e6081894e0a4004b69ebab53a06b7ecdf46e303349493
CORRECTED_WEB_SHA256: 5fe2405c693b448a7b99fb83753ed2c80176a44f033f8011354085cc989a9994
FINAL_FACE_SAFE_MASTER_SHA256: 4ba72448acf2b75d99eaf7288110a0ec0ed6c4b07e11aa3d4fc48a25bb685fde
FINAL_FACE_SAFE_WEB_SHA256: 5d6a41a8288f131b8a50dc7b4fb0013352efd8ac066f496f1ab0f5eb2976c703
```

## Phản hồi nguyên văn

> Kiểm tra video mà em tạo gần nhất, anh thấy vẫn còn hiện tượng khung ảnh bị
> lệch ra khỏi những thứ quan trọng như nhân vật, cắt mặt nhân vật, chưa có phụ
> đề ở video nữa, sao lại có lỗi như thế lặp lại nhỉ? Mình đã khắc phục hết rồi
> mà?

> Anh vừa xem lại thì vẫn còn những khung hình bị cắt mặt nhân vật, không trọn
> vẹn. Em kiểm tra lại đi, vẫn còn lỗi đó.

## Phân loại bằng chứng

- `FALSE_HIGH_VERTICAL_CROP`: báo cáo cũ PASS nhưng renderer không tiêu thụ
  canonical vertical edit plan và giữ một crop qua native cut.
- `REMOTE_DELIVERY_IDENTITY_FAILURE`: URL media ổn định dùng cache immutable nên
  owner có thể xem lại payload cũ dù source đã đổi.
- `CAPTION_OBSERVABILITY_FAILURE`: receipt cũ chỉ kiểm HTTP 200, không chứng minh
  phụ đề đã hiện trên payload công khai.
- `WORKFLOW_BYPASS`: run cũ không có `content/edit_plan.json`; lệnh feedback chuẩn
  đã fail trước khi ghi graph. Không tạo artifact giả và không tự promote Taste.
- `FALSE_HIGH_FACE_COMPLETENESS`: kiểm tra tự động cũ nhận ra semantic carrier
  nhưng chưa chứng minh khuôn mặt và phần đầu nằm trọn trong bản mã hóa cuối.
- `STALE_PUBLIC_REVIEW`: trang review còn phát v3 trong khi các bản thử sau chưa
  được đưa lên vì vẫn còn lỗi thị giác; owner vì vậy tiếp tục thấy lỗi đã biết.

## Bản sửa đối chứng

- `26` editorial shots được tách thành `46` static vertical timeline items.
- `138/138` quan sát pixel START/MID/END giữ đúng semantic carrier.
- `231/231` từ có timestamp được phủ; `45/45` caption quan sát trên master mã hóa
  nằm trong vùng an toàn.
- Bản v4 buộc mỗi cảnh cần người có khuôn mặt nổi bật, khoảng cách biên an toàn và
  biên bản kiểm thủ công đủ mặt, đủ đầu tại START/MID/END: `81/81` quan sát `PASS`.
- Nguồn có khuôn mặt quá sát biên hoặc đi qua native cut bị loại trước khi dựng.
- Trang công khai trỏ tới URL chứa checksum và payload tải ngược khớp full SHA-256.

Phản hồi này được giữ làm evidence để nhập graph sau khi run có global Edit Plan
hợp lệ. Trạng thái hiện tại không được diễn giải thành Taste version change.
