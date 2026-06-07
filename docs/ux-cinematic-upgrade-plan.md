# Kế hoạch nâng cấp trải nghiệm cinematic cho thongphan.com

## Mục tiêu

Nâng `thongphan.com` từ một website cá nhân đẹp sang một trải nghiệm có cảm giác như bước vào hệ thống: có màn mở đầu, chiều sâu, phản hồi khi rê chuột, chuyển động khi cuộn, trạng thái rõ ràng và các nút có cảm giác “bấm được”.

## Benchmark đã tham chiếu

Nguồn nghiên cứu nhanh:

- Awwwards — Web & Interactive: nhấn mạnh trải nghiệm tương tác, kể chuyện tương tác, chuyển động và giao diện động.
- Awwwards — Games & Entertainment: nhấn mạnh cảm giác nhập vai, HTML5/CSS/JavaScript/WebGL, responsive và digital realm.
- Awwwards — WebGL Collection: pattern thường gặp gồm 3D, scroll storytelling, mouse interaction, page transition, feature scroll interaction, immersive navigation.
- Landing.love — Animation Websites: kho hơn 2.000 landing page có animation, gồm nhóm 3D, portfolio, studio, dark mode, minimal.

## Pattern top-world rút ra

1. Cinematic entry

Người dùng không vào thẳng trang tĩnh. Họ có một khoảnh khắc “boot” ngắn để hiểu đây là một hệ thống, không chỉ landing page.

2. Spatial depth

Trang cần nhiều lớp: nền, lưới, ánh sáng, vật thể chính, mảnh thông tin nổi, phản ứng với chuột. Cảm giác như một sân khấu có chiều sâu.

3. Scroll as story

Mỗi lần cuộn là một cảnh. Người dùng đi qua hành trình: hỗn loạn → tín hiệu → Brain2 → tài sản → bằng chứng → chẩn đoán → Conan.

4. Micro-interaction everywhere

Nút, link, card, thanh điều hướng cần phản hồi rõ: shimmer, focus state, hover lift, ánh sáng theo con trỏ.

5. Performance + accessibility guard

Motion phải có `prefers-reduced-motion`, không phá trải nghiệm mobile, không biến trang thành demo kỹ thuật khó dùng.

## Nâng cấp đã triển khai trong vòng hiện tại

- Thêm `CinematicBoot`: màn mở đầu kiểu hệ điều hành/trailer phim với lõi TP, orbit, boot sequence, progress và nút “Vào ngay”.
- Thêm `Trailer HUD` trong hero để tạo cảm giác đang xem một trải nghiệm live, không phải trang tĩnh.
- Thêm spotlight toàn site theo vị trí con trỏ qua biến CSS `--cursor-x`, `--cursor-y`.
- Nâng micro-interaction cho toàn bộ `.btn-primary`, `.btn-outline`, `.btn-ghost`: shimmer layer, focus-visible rõ, hover giàu cảm giác hơn.
- Giữ guard `prefers-reduced-motion` cho boot và motion chính.

## Vòng tự thực thi tiếp theo

1. QA build/test để bắt lỗi TypeScript/CSS module.
2. Chạy site local và dogfood các route chính:
   - `/`
   - `/diagnostic`
   - `/blog`
   - `/library`
   - `/assets`
   - `/challenges`
   - `/about`
3. Kiểm từng loại tương tác:
   - Header nav
   - CTA hero
   - Route cards
   - Asset cards
   - Diagnostic flow
   - Footer links
4. Ghi lỗi, sửa tiếp, chạy lại build/test/browser.

## Tiêu chuẩn đạt

- Không lỗi build/test.
- Không lỗi console nghiêm trọng trên các route chính.
- Hero có wow moment khi vào trang.
- CTA có phản hồi tương tác rõ.
- Mobile không vỡ layout chính.
- Thay đổi được commit riêng, không gom thay đổi cũ ngoài task.
