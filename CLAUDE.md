# thongphan-com — CLAUDE.md

> **ĐỌCHANDOFF TRƯỚC KHI LÀM BẤT CỨ THỨ GÌ.**
> File này load mỗi request — giữ gọn, chi tiết đặt trong spec files.

## Project
Rebuild hoàn toàn thongphan.com từ đầu — Cloudflare-native stack.

## Stack
- **Frontend:** Next.js 15 (App Router) → deploy Cloudflare Pages
- **Backend:** Cloudflare Workers (API, AI, email drip)
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare KV (cache), R2 (media)
- **AI:** Cloudflare Workers AI + Vectorize (RAG từ Brain2)
- **Email:** MailChannels qua Workers

## PHẢI ĐỌC NGAY:
- `.claude/handoff.md` — task hiện tại, trạng thái, build order
- `.claude/spec/brand-design.md` — brand colors, typography, design rules
- `.claude/spec/cloudflare-conventions.md` — Cloudflare API patterns
- `.claude/spec/author-dna.md` — giọng Thông Phan cho AI chat system prompt

## Conventions bắt buộc:
- Tiếng Việt cho tất cả UI text, comments trong code dùng Tiếng Anh
- Dark mode mặc định (`#0A0A0F` background)
- Brand gold: `#F5C842` — chỉ dùng cho accent, CTA, highlight
- Typography: Be Vietnam Pro (heading) + Inter (body) từ Google Fonts
- KHÔNG dùng Tailwind — chỉ Vanilla CSS + CSS Modules
- Blog posts: Markdown trong `/content/blog/` — render phía server
