# UX / IA Spec — thongphan.com v2

## 1. UX Principle

User không nên phải tự ghép các mảnh “AI, Content, Brain2, Conan”. Site phải làm việc đó cho họ.

Trải nghiệm mục tiêu:

```
Hoang mang
  -> thấy vấn đề được gọi đúng tên
  -> thấy proof thật
  -> hiểu hệ thống
  -> chọn bước tiếp theo
```

## 2. Primary User States

| State | User thought | UX response |
|---|---|---|
| Lost | “AI đang thay đổi hết, tôi phải làm gì?” | Hero + diagnostic |
| Curious | “Brain2/AI workflow của Thông là gì?” | Chat + Brain2 article |
| Stuck | “Tôi có chuyên môn nhưng không scale được” | Expertise System content |
| Ready | “Tôi muốn thực hành với cộng đồng” | Conan Trial/Maker CTA |

## 3. Navigation v2

Recommended:

```
THÔNG PHAN
Start Here
Blog
Chat
About
Conan
```

MVP if no diagnostic page:

```
THÔNG PHAN
Blog
Challenge
Chat
About
Conan
```

Nav CTA:

- If diagnostic exists: `Tự chẩn đoán`
- If not: `Chat với Brain2`

## 4. Homepage IA

### Section 1 — Hero

Purpose: clarify promise in 10 seconds.

Content:

- Eyebrow: `AI Expertise OS · Brain2 · Conan Maker`
- H1: `AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp.`
- Subhead: `Tui giúp người có chuyên môn biến kinh nghiệm thật thành content kéo khách, tài sản số và hệ thống AI tăng trưởng.`
- Primary CTA: `Tự chẩn đoán năng lực AI` or `Chat với Brain2`
- Secondary CTA: `Đọc bài nền tảng`

Proof below hero:

- 40+ viral posts.
- 80k+ shares.
- 600+ workshop signups.
- 100+ Conan Makers.

### Section 2 — Problem Reframe

Purpose: move from AI fear to system gap.

Message:

- Bạn không cần biết mọi tool.
- Bạn cần biết chuyên môn của mình nằm ở đâu trong hệ thống mới.
- AI khuếch đại cái bạn đã có. Nếu chưa hệ thống hóa, AI khuếch đại sự rối.

### Section 3 — The System

Purpose: show red thread.

```
Kinh nghiệm thật
  -> Brain2 / Knowledge OS
  -> Content chứng minh chuyên môn
  -> Lead magnet / offer
  -> AI assistant / workflow
  -> Conan Maker
```

UI: use a horizontal/vertical system map, not four unrelated cards.

### Section 4 — Proof Living System

Purpose: biological vouching.

Items:

- Viral content proof.
- Brain2 proof.
- Conan proof.
- AI workflow proof.

Use real screenshots/media if possible.

### Section 5 — Choose Your Path

Cards by intent:

- `Tôi đang hoang mang vì AI` -> diagnostic / AI clarity post.
- `Tôi muốn xây Brain2` -> Brain2 challenge.
- `Tôi muốn content không generic` -> Viral Content Factory posts.
- `Tôi muốn vào hệ sinh thái` -> Conan Trial.

### Section 6 — Latest / Cornerstone Content

Show 3-5 strategic posts, not just latest chronological.

### Section 7 — Conan Bridge

Purpose: ecosystem handoff.

Copy direction:

> Nếu bạn muốn biến phần này thành practice dài hạn, Conan Maker là cộng đồng nơi anh em build tài sản thật bằng AI, content và chuyên môn riêng.

CTA:

- `Vào Conan Trial`
- `Tìm hiểu Conan Maker`

No vague `www.conan.school/membership` unless it is confirmed as canonical.

## 5. Blog UX

### Listing

Must support:

- Pillar filters.
- Search or quick topic filter.
- Featured cornerstone.
- Suggested path for new readers.

Avoid:

- Category chips that are too many.
- Making all posts same visual weight.

### Article

Must support:

- Reading progress.
- TOC for long posts.
- Strong typography.
- Inline CTA based on content.
- End-of-post “next best step”.

## 6. Chat UX

### Empty State

Current suggested questions are useful. Update to match v2:

- `Tui có 10 năm kinh nghiệm, dùng AI thế nào để không bị thay thế?`
- `Làm sao để AI không viết content generic?`
- `Brain2 khác gì app ghi chú?`
- `Tui nên bắt đầu từ content, Brain2 hay workflow?`
- `Chuyên môn của tui có thể biến thành tài sản số không?`

### After 1-2 messages

Show contextual CTA:

- If Brain2 topic: `Thử challenge Brain2 21 ngày`.
- If AI fear: `Làm diagnostic AI Transformation`.
- If business/content: `Vào Conan Trial`.

## 7. Challenge UX

Current route: `/challenges/brain2-21-ngay`

Recommendations:

- Change copy from “không bán gì cả” to “bước đầu miễn phí để bạn có hệ thống nền”.
- After signup success, show:
  - check email
  - read Brain2 starter article
  - chat with Brain2
  - continue in Conan Trial when ready

## 8. About UX

Rewrite as proof arc:

1. “Tui không đến từ AI tool world. Tui đến từ 10 năm làm thật.”
2. Hoa Sơn Tửu Lầu: khác biệt/worldview.
3. Marketing leadership: hiểu distribution/trust.
4. Brain2: biến trải nghiệm thành system.
5. Conan: biến system thành community.

CTA:

- `Đọc bài 10 năm làm marketing`
- `Chat với Brain2`
- `Vào Conan Trial`

## 9. Footer IA

Footer current line “Giúp người trẻ...” should update to match Brain2:

Recommended:

> Giúp người có chuyên môn dùng AI đúng cách để giữ thu nhập, tạo tài sản số và xây hệ thống tăng trưởng.

Footer ecosystem:

- Conan Trial
- Conan Maker
- Conan School

Only include `Conan Elite` if product is still active.

## 10. UX Acceptance Criteria

- A cold visitor can explain the site promise after first viewport.
- Every page has one primary next action.
- Every external link has a strategic reason.
- Blog, chat, challenge and Conan feel like one journey.
- No page depends on decorative visuals to communicate substance.

