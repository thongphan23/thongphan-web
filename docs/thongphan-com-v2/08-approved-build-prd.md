# Approved Build PRD — thongphan.com v2

> Trạng thái: approved direction for implementation.
> Nguồn quyết định: anh Thông chốt trong thread ngày 2026-05-19, đối chiếu Brain2.

## 1. Brand Statement Mới

Thông Phan giúp người có chuyên môn **biến kiến thức thành tài sản và tạo dòng tiền thứ 2 bằng AI**, trong khi vẫn giữ an toàn công việc chính cho đến khi dòng tiền mới đủ vững.

## 2. Primary CTA

CTA chính của website:

> Tự chẩn đoán năng lực AI

Điểm đến: `/diagnostic`

Diagnostic phải trả lời được:

- User đang dùng AI ở tầng nào?
- User nên bắt đầu từ task, content, Brain2, tài sản số hay Conan Trial?
- User có bước tiếp theo rõ ràng, không chỉ nhận một label cho vui.

## 3. Target Audience

### Primary

Người đi làm có chuyên môn:

- Có 3-15 năm kinh nghiệm.
- Đang có công việc chính hoặc nguồn thu chính.
- Có chuyên môn thật nhưng chưa biết đóng gói thành tài sản.
- Muốn tạo thu nhập thứ 2 từ chuyên môn trước khi chuyển hẳn.
- Muốn dùng AI để tăng leverage nhưng không muốn chạy theo tool rời rạc.

### Secondary

Coach, trainer, consultant, freelancer senior, founder dịch vụ nhỏ hoặc người bán chuyên môn đã có khách 1-1 nhưng chưa scale.

### Not For

- Người mới hoàn toàn chưa có nền.
- Người chỉ muốn prompt hack/tool list.
- Người muốn kiếm tiền nhanh không chịu build tài sản thật.

## 4. Funnel

```
Homepage
  -> Diagnostic /diagnostic
  -> 21 ngày Brain2 /challenges/brain2-21-ngay
  -> Conan Trial https://trial.conan.school
  -> Conan Maker https://com.conan.school
```

Challenge 21 ngày là **activation point** để vào Conan Trial, không phải một lead magnet tách rời.

## 5. Positioning Narrative

1. Kiến thức không tự tạo tiền. Hệ thống mới tạo tiền.
2. Người đi làm không cần bỏ việc liều.
3. Họ có thể dùng AI để biến chuyên môn thành content, lead magnet, tài sản số và dòng tiền thứ 2.
4. Khi dòng tiền đủ an toàn, họ mới có quyền chọn chuyển hướng.
5. Brain2 là nền để AI hiểu chuyên môn riêng.
6. Conan Trial/Maker là môi trường thực hành để biến hệ thống thành output.

## 6. Visual Direction

Thương hiệu cần cảm giác:

- Chiều sâu nhưng dễ gần.
- Thực tế, dễ áp dụng.
- Trẻ trung, nhanh nhẹn, vui vẻ.
- Có gu, có cá tính, táo bạo, khác biệt.

Palette:

- Blue primary: `#1167FF`
- Yellow primary: `#FFC629`
- Sky accent: `#3BC8FF`
- Coral accent: `#FF6B4A`
- Green accent: `#14B87A`
- Background: sáng, tươi, editorial; không còn dark luxury làm chủ đạo.

Không dùng:

- Premium dark/purple/gold quá sang trọng.
- Template SaaS chung chung.
- Card wall đều đều.
- Quá nhiều gradient trang trí không mang nghĩa.

## 7. Required Website Changes

### Homepage

- Hero dùng brand statement mới.
- Primary CTA `/diagnostic`.
- System map: kiến thức -> tài sản -> dòng tiền.
- Proof: 40+ viral, 80k+ shares, 600+ workshop signups, 100+ Conan Makers.
- Path cards: diagnostic, 21 ngày Brain2, chat với Brain2.
- Conan Trial bridge rõ.

### Diagnostic

- New route `/diagnostic`.
- 5 câu hỏi.
- 4 tầng kết quả tối thiểu:
  - AI Task User
  - AI Content Starter
  - Expertise System Builder
  - AI Asset Builder
- CTA kết quả:
  - 21 ngày Brain2
  - Conan Trial

### Challenge

- Định vị lại 21 ngày Brain2 là điểm kích hoạt.
- Copy nối sang Conan Trial.
- Success state nhắc Conan Trial.

### About

- Không chỉ timeline.
- Kể proof arc: làm thật -> hệ thống hóa -> Brain2/Conan.
- CTA về diagnostic/chat.

### Chat

- Định vị là Brain2 demo / AI thought partner.
- Suggested questions xoay quanh chuyên môn, tài sản số, dòng tiền thứ 2.
- Link diagnostic cho user chưa biết hỏi gì.

### Layout/Footer

- Nav có `Chẩn đoán AI`.
- Footer brand statement mới.
- Ecosystem links: `trial.conan.school`, `com.conan.school`, `conan.school`.

## 8. Success Criteria

Build được coi là đạt khi:

- `npm run build` pass.
- `/diagnostic` route tồn tại và hoạt động.
- Homepage first viewport nói rõ brand statement mới.
- CTA chính về diagnostic, không còn Blog/Chat làm primary.
- Challenge 21 ngày nói rõ vai trò activation vào Conan Trial.
- Footer không còn “người trẻ” hoặc định vị cũ.
- Visual đọc rõ xanh dương/vàng, trẻ trung, gần gũi, không còn dark luxury.
- Mobile không có overlap nghiêm trọng trên các route chính.

## 9. Stop Criteria

Dừng và hỏi anh nếu:

- Canonical URL của Conan Trial/Maker thay đổi.
- Anh muốn diagnostic thu email trước khi trả kết quả.
- Anh muốn màu xanh/vàng bám một brand guideline cụ thể hơn.
- Cần dùng asset thật mới nhưng chưa có ảnh/screenshot.
- Backend signup/chat bị lỗi do hạ tầng ngoài local.

## 10. Current Implementation Scope

Sprint này thực thi:

- Homepage.
- `/diagnostic`.
- About.
- Chat empty state.
- Challenge detail/listing.
- Signup success state.
- Layout/footer.
- Global visual tokens.

Chưa thực thi:

- Analytics events.
- Diagnostic email capture.
- Conan Trial SSO/API integration.
- Full blog taxonomy migration.
- New real proof screenshots.
