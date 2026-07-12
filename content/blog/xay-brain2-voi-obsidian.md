---
title: "Xây Brain2 với Obsidian, bộ não thứ 2 của tui"
description: "Brain2 không phải app ghi chú cho đẹp. Nó là nền để AI hiểu chuyên môn, câu chuyện và cách nghĩ thật của anh em."
category: brain2
journey: "Brain2"
readerState: "Sáng tỏ"
promise: "Đọc xong, anh em sẽ hiểu vì sao Brain2 là nền cho AI dùng đúng cách, không phải thêm một app để quản lý đời mình."
proof: "Brain2 đang chạy thật bằng Obsidian, pgvector và kho ghi chú được dùng mỗi ngày để viết, hỏi, nối ý."
publishedAt: "2026-04-28"
updatedAt: "2026-07-12"
readingTime: 8
featured: false
coverImage: /images/blog/cover-brain2-obsidian.png
midCta:
  label: "Làm nhỏ trước"
  title: "Nếu Brain2 nghe lớn quá, bắt đầu bằng 21 ngày gom lại thứ anh em đã biết."
  body: "Không cần xây một thư viện trọn vẹn ngay. Cần một hệ thống đủ sống để ngày mai tìm lại được ý hôm nay."
  href: "/brain2/21-ngay"
  cta: "Bắt đầu 21 ngày Brain2"
endCta:
  label: "Sau bài này"
  title: "Khi Brain2 đã có nền, bước tiếp là dùng nó để tạo nội dung và tài sản số."
  body: "Conan Maker là nơi thực hành nhịp đó: viết, đóng gói, nhận góp ý và biến tri thức thành đầu ra thật."
  href: "https://com.conan.school"
  cta: "Vào Conan Maker"
---

Tui quên mọi thứ.

Đọc sách xong → vài hôm sau chỉ còn nhớ một cảm giác mơ hồ.
Học khóa học → tới lúc cần dùng lại không biết nằm ở đâu.
Có ý tưởng hay → quên mất vì không ghi lại.

Đến năm 2022, tui nhận ra: **Não người không được thiết kế để nhớ. Não được thiết kế để suy nghĩ.**

Vậy nên tui xây Brain2, bộ não thứ 2 bằng Obsidian + AI.

## Brain2 là gì?

Brain2 = bộ não thứ 2.

**Não thứ nhất, bộ não sinh học:**
- Suy nghĩ
- Sáng tạo
- Ra quyết định

**Não thứ 2, bộ não số:**
- Lưu trữ
- Kết nối
- Gợi ý

Não 1 + Não 2 = Siêu năng lực.

## Tại sao Obsidian?

Tui đã thử:
- Notion → Quá phức tạp, chậm
- Evernote → Không nối ý tốt
- Google Docs → Không có sơ đồ liên kết
- Roam Research → Đắt, định dạng không thật sự thuộc về mình

**Obsidian thắng vì:**
1. **File Markdown (tệp chữ thuần)**, dễ đọc và dễ mang sang công cụ khác
2. **Liên kết hai chiều**, kết nối ý tưởng tự động
3. **Sơ đồ liên kết**, nhìn thấy cách ý tưởng nối với nhau
4. **Lưu ở máy trước**, dữ liệu ở máy anh em trước khi phụ thuộc cloud (đám mây)
5. **Hệ plugin (tiện ích mở rộng) rộng**, tùy biến được nhiều

## Hệ thống Brain2 của tui

### 1. Ghi lại mọi thứ

**Ghi chú đầu vào**, mỗi ngày 1 ghi chú:
```
# 2026-05-04

## Ý tưởng
- Quy trình AI cho nội dung marketing
- Ca thật Hoa Sơn Tửu Lầu

## Học được
- Viết câu lệnh: cho ví dụ trước tốt hơn hỏi trống
- [[Alex Hormozi]] nói về value ladder

## Việc cần làm
- [ ] Viết blog về Brain2
- [ ] Rà lại email của 21 ngày Brain2
```

**Quy tắc:** Ghi mọi thứ vào hộp đầu vào. Xử lý sau.

### 2. Xử lý, chuyển thành ghi chú một ý

Mỗi ý tưởng = 1 note riêng.

**Ví dụ:**
```markdown
# Viết câu lệnh, cho ví dụ trước khi hỏi

Cho ví dụ trước khi hỏi = đưa AI vài mẫu đúng trước khi yêu cầu nó làm.

## Tại sao hiệu quả?
- AI học mẫu từ ví dụ
- Đầu ra nhất quán hơn
- Ít hallucination hơn

## Khi nào dùng?
- Việc phức tạp
- Cần định dạng cụ thể
- Cần kiến thức riêng của ngành

## Ví dụ
[Ví dụ đặt ở đây]

## Liên quan
- [[Hỏi trống không đưa ví dụ]]
- [[Viết câu lệnh]]
- [[Quy trình AI]]
```

**Quy tắc:** 1 ghi chú = 1 ý. Dễ nối, dễ tìm.

### 3. Kết nối ý tưởng

**Liên kết hai chiều:**
```markdown
[[Alex Hormozi]] nói về [[Value Ladder]]
→ Áp dụng cho [[Nội dung marketing]]
→ Liên quan đến [[Hành trình khách hàng]]
```

**Thẻ:**
```markdown
#ai #noi-dung #marketing #khung-tu-duy
```

**Sơ đồ liên kết:** Nhìn thấy cách ý tưởng kết nối.

### 4. Tạo nội dung từ kho tri thức

**Khi viết blog:**
1. Tìm trong kho: "AI + nội dung marketing"
2. AI gợi ý ghi chú liên quan
3. Kéo ví dụ từ kho tri thức
4. Viết nháp với AI
5. Sửa và đăng

**Kết quả:** Tui không phải nghiên cứu lại từ đầu cho mỗi bài. Thời gian được dành cho việc chọn, nối và kiểm tra.

## AI + Brain2 = dễ tìm lại thứ mình biết

**Trước AI:**
- Tìm thủ công trong kho
- Đọc từng ghi chú để tìm thông tin
- Sao chép ví dụ qua lại

**Với AI:**
- Tìm theo nghĩa: "Tìm mọi thứ về nội dung viral"
- AI tóm tắt 10 ghi chú thành 1 đoạn
- AI gợi ý kết nối giữa các ghi chú

**Công cụ tui dùng:**
- **Obsidian + plugin Copilot**, AI hỏi đáp với kho tri thức
- **Supabase pgvector**, phần tìm kiếm theo nghĩa
- **Claude API (giao diện lập trình)**, tạo nháp và tóm tắt

## Hệ thống thay đổi cách tui làm việc ra sao?

Thứ tui giữ lại không phải một bộ đếm ghi chú. Là ba thay đổi có thể quan sát được:

- Tui không còn quên ý tưởng
- Tui thấy mẫu lặp lại mà trước không thấy
- Tui viết tốt hơn vì có ngữ cảnh đầy đủ

## Lộ trình 21 ngày đi qua ba tuần

Đây không phải bốn tuần nén lại cho vừa một lời quảng cáo. Lộ trình có đúng ba tuần, mỗi ngày hoàn thành một đầu ra quan sát được:

1. **Tuần 1 — Cài nền:** Dựng một Brain2 đủ nhỏ để bắt đầu lưu lại con người, dự án, bài học, góc nhìn và câu chuyện của anh em.
2. **Tuần 2 — Nối:** Đưa những phần đã lưu vào cùng ngữ cảnh, để một ý có thể gặp đúng câu chuyện, bằng chứng và việc đang làm.
3. **Tuần 3 — Dùng:** Lấy tri thức trong Brain2 ra làm đầu vào cho công việc thật, rồi nhìn lại phần nào đáng giữ và phần nào cần xây tiếp.

Thời lượng thay đổi theo độ sâu của từng bài. Điều không đổi là sau mỗi ngày phải có một thứ anh em nhìn thấy và dùng lại được.

**Sau 21 ngày:** Anh em có một nền Brain2 nhỏ, đủ để tìm lại thứ đã ghi và biết mình cần xây tiếp phần nào.

## Chỗ đáng giữ lại

Brain2 không phải về công cụ.

Brain2 là về **cách nghĩ**: não anh em để suy nghĩ, không phải để nhớ.

Xây Brain2 = đầu tư vào tương lai.

Mỗi ghi chú anh em viết hôm nay = lãi kép cho 10 năm sau.

**P/S:** Muốn xây Brain2 trong 21 ngày? Bắt đầu lộ trình này trước. Mỗi ngày làm một đầu ra nhỏ; thời lượng thay đổi theo độ sâu của từng bài. Có nền rồi mới bước tiếp sang Conan Maker.

→ [Tham gia "21 Ngày Brain2"](/brain2/21-ngay)
