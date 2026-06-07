# PRD: Blog Reading Experience — World-Class Upgrade

> **Phiên bản:** 1.0 · **Ngày:** 2026-05-08
> **Mục tiêu:** Nâng trải nghiệm đọc blog thongphan.com lên chuẩn top thế giới.
> **Hướng tiếp cận:** Writer's Blog (Hướng B) — typography-first, markdown-based, content absorption.

---

## 1. Bối cảnh & Vấn đề

### Hiện trạng
- Blog detail **không render markdown thật** — hardcode POST object, dùng `dangerouslySetInnerHTML`
- Chỉ 1 slug được `generateStaticParams` → bài khác **404**
- Blog listing **hardcode POSTS array** — không đọc từ `/content/blog/`
- Typography cho long-form chưa tối ưu cho reading comprehension
- Không có TOC, syntax highlighting, pullquote, callout

### Mục tiêu cốt lõi
Reader phải **thấm** nội dung — không chỉ đọc xong mà **nắm được tinh thần** bài viết truyền tải. Đạt được qua:
1. **Cognitive Fluency** — Typography + spacing đúng → não xử lý dễ → tin tưởng hơn → nhớ lâu hơn
2. **Visual Rhythm** — Nhịp đọc tự nhiên, không bị gián đoạn
3. **Progressive Disclosure** — Thông tin được tiết lộ đúng lúc, đúng mức

### Benchmark
| Blog | Đặc điểm nổi bật |
|---|---|
| overreacted.io | Merriweather serif, tối giản, zero distraction |
| leerob.com | STIX Two Text, MDX interactive, minimal |
| paulgraham.com | Raw text, focus tuyệt đối vào ý tưởng |
| brainpickings.org | Serif editorial, deep longform, pullquotes |

---

## 2. Scope & Ranh giới

### TRONG scope
- Fix toàn bộ blog pipeline (markdown → render)
- Typography overhaul cho reading experience
- Enhanced markdown components (callout, pullquote, sidenote, TOC)
- SEO per-post (OG image, structured data)
- Newsletter CTA inline
- Related posts

### NGOÀI scope
- CMS / admin panel (giữ markdown file-based)
- Comments system
- Paid/gated content
- Multi-language
- Dark/light mode toggle (giữ dark mode mặc định)

---

## 3. User Flow

```
Anh viết .md trong /content/blog/
  → frontmatter: title, description, category, publishedAt, readingTime, featured, tags, series
  → body: markdown + custom syntax (:::callout, :::pullquote, etc.)
  → git push
  → Next.js build đọc tất cả .md files
  → Static pages generated cho mỗi slug
  → Deploy Cloudflare Pages
  → Reader truy cập /blog/[slug]
```

---

## 4. Kiến trúc kỹ thuật

### 4.1 Markdown Pipeline

```
/content/blog/*.md
  → gray-matter (parse frontmatter)
  → unified/remark pipeline:
      remark-parse
      → remark-gfm (tables, strikethrough, tasklists)
      → remark-math (optional)
      → remark-directive (custom blocks: callout, pullquote, sidenote)
      → remark-rehype (convert to HTML AST)
      → rehype-slug (auto-id cho headings → TOC)
      → rehype-autolink-headings (clickable heading anchors)
      → rehype-prism-plus (syntax highlighting)
      → rehype-stringify (output HTML)
```

**Dependencies cần thêm:**
```json
{
  "unified": "^11",
  "remark-parse": "^11",
  "remark-gfm": "^4",
  "remark-directive": "^3",
  "remark-rehype": "^11",
  "rehype-slug": "^6",
  "rehype-autolink-headings": "^7",
  "rehype-prism-plus": "^2",
  "rehype-stringify": "^10"
}
```

### 4.2 Blog Listing (`/blog/page.tsx`)

- **Server component** — đọc tất cả `.md` files từ `/content/blog/` tại build time
- Parse frontmatter → tạo posts array
- Sort by `publishedAt` DESC
- Category filter + search (client-side interactivity giữ nguyên)
- Featured post hiển thị khác biệt (hero card)

### 4.3 Blog Detail (`/blog/[slug]/page.tsx`)

- **Server component** — `generateStaticParams()` đọc tất cả slugs
- Parse markdown → HTML qua unified pipeline
- Extract headings → TOC data
- Calculate reading time từ word count
- Render with `BlogArticle` client component

### 4.4 File Structure mới

```
app/blog/
  page.tsx              ← Server: listing (đọc filesystem)
  page.module.css
  [slug]/
    page.tsx            ← Server: parse markdown, generate params
    page.module.css     ← Article typography styles
    BlogArticle.tsx     ← Client: TOC, progress bar, scroll tracking
lib/
  blog.ts              ← getAllPosts(), getPostBySlug(), markdown pipeline
  toc.ts               ← extractTOC() từ HTML headings
components/
  blog/
    TOC.tsx             ← Floating table of contents
    TOC.module.css
    Callout.tsx         ← Custom callout blocks
    Pullquote.tsx       ← Styled pullquotes
    AuthorCard.tsx      ← Reusable author card
    RelatedPosts.tsx    ← Related posts grid
    NewsletterCTA.tsx   ← Inline newsletter signup
    ShareBar.tsx        ← Share buttons
    ReadingProgress.tsx ← Top progress bar
```

---

## 5. Typography System — Trọng tâm của PRD

### 5.1 Triết lý

> "Typography tốt là typography vô hình — reader không nhận ra font, chỉ thấy ý tưởng."

Nguyên tắc:
1. **Serif cho body text** — nghiên cứu chỉ ra serif tăng reading comprehension cho long-form
2. **65-75 ký tự/dòng** — optimal line length cho reading
3. **1.7-1.85 line-height** — breathing room giữa các dòng
4. **Vertical rhythm** — spacing giữa elements tuân theo tỷ lệ nhất quán

### 5.2 Font Stack mới (cho blog article)

```css
/* Chỉ áp dụng trong blog article — KHÔNG thay đổi site-wide */
.article-body {
  font-family: 'Lora', 'Georgia', serif;  /* Lora — elegant Vietnamese serif */
  font-size: 1.125rem;     /* 18px — optimal cho long-form */
  line-height: 1.8;
  letter-spacing: 0.01em;
  color: var(--text-primary);
  max-width: 680px;        /* ~68 chars/line với 18px */
  margin: 0 auto;
}

/* Headings trong article vẫn dùng Be Vietnam Pro */
.article-body h1,
.article-body h2,
.article-body h3 {
  font-family: var(--font-heading); /* Be Vietnam Pro */
  letter-spacing: -0.02em;
  color: var(--text-primary);
}
```

**Lý do chọn Lora:**
- Hỗ trợ tiếng Việt đầy đủ (dấu)
- Serif nhưng modern — không cổ điển quá
- x-height cao → dễ đọc ở 18px trên màn hình
- Google Font → free, fast CDN

### 5.3 Vertical Rhythm

```css
/* Base unit: 8px */
.article-body p           { margin-bottom: 1.5rem; }      /* 24px */
.article-body h2          { margin-top: 3.5rem; margin-bottom: 1rem; }
.article-body h3          { margin-top: 2.5rem; margin-bottom: 0.75rem; }
.article-body blockquote  { margin: 2rem 0; }
.article-body ul, ol      { margin-bottom: 1.5rem; }
.article-body li          { margin-bottom: 0.5rem; }
.article-body pre         { margin: 2rem 0; }
.article-body hr          { margin: 3rem auto; width: 40%; }
.article-body img         { margin: 2.5rem auto; border-radius: var(--radius-md); }
```

### 5.4 Text Enhancement

```css
/* Drop cap cho paragraph đầu tiên */
.article-body > p:first-of-type::first-letter {
  font-family: var(--font-heading);
  font-size: 3.5em;
  float: left;
  line-height: 0.8;
  padding-right: 0.1em;
  color: var(--accent-gold);
  font-weight: 700;
}

/* Strong text — gold accent (giữ convention hiện tại) */
.article-body strong {
  color: var(--accent-gold);
  font-weight: 600;
}

/* Links trong article */
.article-body a {
  color: var(--accent-gold);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(245, 200, 66, 0.3);
  transition: text-decoration-color 0.2s;
}
.article-body a:hover {
  text-decoration-color: var(--accent-gold);
}
```

---

## 6. Enhanced Components

### 6.1 Table of Contents (TOC)

**Vị trí:** Floating bên phải trên desktop (> 1200px), collapsible header trên mobile.

**Hành vi:**
- Auto-generated từ H2, H3 headings
- Highlight heading đang đọc (Intersection Observer)
- Click → smooth scroll đến heading
- Ẩn khi bài < 3 headings

```
┌─────────────────────────────────────────────┐
│                                    ┌──────┐ │
│  [Article Content]                 │ TOC  │ │
│  max-width: 680px                  │ H2 ● │ │
│                                    │ H3   │ │
│                                    │ H3   │ │
│                                    │ H2   │ │
│                                    │ H3   │ │
│                                    └──────┘ │
└─────────────────────────────────────────────┘
```

### 6.2 Callout Blocks

**Markdown syntax:**
```markdown
:::callout[💡 Insight]
Nội dung callout ở đây.
:::

:::callout[⚠️ Lưu ý]
Cảnh báo quan trọng.
:::

:::callout[🔥 Key Takeaway]
Bài học chính.
:::
```

**Style:** Glassmorphism card, left border gold accent, icon + title bold, subtle glow.

### 6.3 Pullquote

**Markdown syntax:**
```markdown
:::pullquote
AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp.
:::
```

**Style:** Centered, font-size lớn hơn (1.5rem), italic, gold left border hoặc giant quotation mark, generous padding.

### 6.4 Key Takeaway Box

Xuất hiện cuối mỗi section hoặc cuối bài:

```markdown
:::takeaway
- Điểm 1
- Điểm 2
- Điểm 3
:::
```

**Style:** Card nền gradient nhẹ, border gold, icon ⚡.

### 6.5 Sidenote (Desktop only)

```markdown
Text bình thường.{sidenote: Giải thích thêm cho readers muốn đào sâu.}
```

**Desktop:** Hiển thị bên lề phải, font nhỏ hơn, màu muted.
**Mobile:** Inline tooltip hoặc expandable.

---

## 7. Blog Listing Page (`/blog`)

### 7.1 Layout

```
┌─────────────────────────────────────────┐
│ HERO: "Tất cả bài viết của tui"        │
│ Subtitle + post count                   │
├─────────────────────────────────────────┤
│ [Featured Post — Hero Card]             │
│ Full-width, large title, excerpt        │
├─────────────────────────────────────────┤
│ Search bar                              │
│ Category pills: All | AI | Content | …  │
├─────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│ │ Post    │ │ Post    │ │ Post    │   │
│ │ Card    │ │ Card    │ │ Card    │   │
│ └─────────┘ └─────────┘ └─────────┘   │
└─────────────────────────────────────────┘
```

### 7.2 Post Card

Mỗi card bao gồm:
- Category badge (gold cho featured)
- Title (Be Vietnam Pro, 600 weight)
- Excerpt (2 dòng, text-secondary)
- Reading time + date
- Hover: translateY(-4px) + gold border glow

---

## 8. Blog Article Page (`/blog/[slug]`)

### 8.1 Layout

```
┌─── Reading Progress Bar (gold, fixed top) ───┐
│                                                │
│  ┌── Article Header ─────────────────────┐    │
│  │ Category Badge                        │    │
│  │ H1: Title (Be Vietnam Pro, 3rem)      │    │
│  │ Description (text-secondary, 1.25rem) │    │
│  │ Author avatar + name + date + time    │    │
│  └───────────────────────────────────────┘    │
│                                                │
│  ┌── Cover Image (optional) ─────────────┐    │
│  │ Full-width, rounded, lazy-loaded      │    │
│  └───────────────────────────────────────┘    │
│                                                │
│  ┌── Article Body ──────┐ ┌── TOC ──────┐    │
│  │ Serif, 18px, 680px   │ │ Floating    │    │
│  │ Drop cap first para  │ │ Sticky      │    │
│  │ Gold strong text     │ │ Highlight   │    │
│  │ Callouts, pullquotes │ │ active H2   │    │
│  │ Code with highlight  │ └─────────────┘    │
│  └──────────────────────┘                     │
│                                                │
│  ┌── Key Takeaways ─────────────────────┐    │
│  │ Summarized bullet points             │    │
│  └───────────────────────────────────────┘    │
│                                                │
│  ┌── Newsletter CTA ────────────────────┐    │
│  │ "Muốn nhận bài mới? Email tui."      │    │
│  │ [Email input] [Đăng ký]              │    │
│  └───────────────────────────────────────┘    │
│                                                │
│  ┌── Author Card ────────────────────────┐    │
│  │ Avatar + Bio + Social links           │    │
│  └───────────────────────────────────────┘    │
│                                                │
│  ┌── Related Posts (2-3 cards) ──────────┐    │
│  └───────────────────────────────────────┘    │
└────────────────────────────────────────────────┘
```

### 8.2 Micro-interactions

| Element | Animation |
|---|---|
| Reading progress bar | Smooth width transition, gold gradient |
| TOC active heading | Gold dot indicator, smooth transition |
| Heading anchor | Appear on hover, subtle slide-in |
| Callout blocks | Fade-in on scroll (IntersectionObserver) |
| Images | Fade-in + slight scale on load |
| Code blocks | Hover → subtle border glow |
| Share buttons | Fixed bottom-right, appear after 30% scroll |

---

## 9. Frontmatter Schema

```yaml
---
title: "AI không cướp việc bạn"
description: "Người dùng AI giỏi hơn bạn mới cướp."
category: ai                    # ai | career | content | brain2 | finance
tags: [ai, productivity, workflow]
publishedAt: "2026-05-01"
updatedAt: "2026-05-03"         # optional
readingTime: 7                  # phút — hoặc auto-calculate
featured: true                  # hiển thị hero card trên listing
series: "AI Mastery"            # optional — nhóm bài liên quan
seriesOrder: 1                  # optional
coverImage: "/blog/ai-cover.jpg" # optional
ogImage: "/blog/ai-og.jpg"      # optional — auto-generate nếu không có
---
```

---

## 10. SEO Requirements

- **Per-post metadata:** title, description, og:image, og:type=article
- **Structured data:** Schema.org `BlogPosting` với author, datePublished, dateModified
- **Auto OG image:** Nếu không có `ogImage` trong frontmatter → generate bằng template (title + author + brand)
- **Canonical URL:** `https://thongphan.com/blog/[slug]`
- **Sitemap:** `/sitemap.xml` include tất cả blog posts
- **RSS:** `/feed.xml` cho subscribers

---

## 11. Acceptance Criteria

### P0 — Fix Broken (Sprint 1)
- [ ] Blog listing đọc posts từ `/content/blog/*.md` filesystem
- [ ] Tất cả slugs có trong `/content/blog/` đều render được (không 404)
- [ ] Markdown render đúng: headings, bold, italic, links, lists, code blocks, images
- [ ] `npm run build` pass với 0 errors

### P1 — Premium Reading (Sprint 2)
- [ ] Lora serif font cho article body, 18px, 680px max-width
- [ ] Drop cap paragraph đầu tiên
- [ ] TOC floating bên phải (desktop), collapsible (mobile)
- [ ] TOC highlight heading đang đọc
- [ ] Syntax highlighting cho code blocks (rehype-prism-plus)
- [ ] Reading progress bar hoạt động chính xác
- [ ] Callout blocks render từ markdown directive syntax
- [ ] Pullquote blocks render từ markdown directive syntax
- [ ] Author card cuối bài với ảnh thật + bio
- [ ] Related posts dựa trên category matching
- [ ] Responsive: mobile đọc thoải mái, không bị overflow

### P2 — Growth (Sprint 3)
- [ ] Newsletter CTA inline (connect với signup worker đã deploy)
- [ ] Share buttons (copy link, Facebook, LinkedIn)
- [ ] Series navigation (prev/next trong series)
- [ ] RSS feed `/feed.xml`
- [ ] Schema.org BlogPosting structured data
- [ ] Auto OG image generation (hoặc template-based)
- [ ] Featured post hero card trên listing page

---

## 12. Không được làm

- ❌ KHÔNG thay đổi design system site-wide (chỉ blog article typography)
- ❌ KHÔNG dùng Tailwind
- ❌ KHÔNG thêm CMS / database cho blog
- ❌ KHÔNG thêm comments system
- ❌ KHÔNG thay đổi dark mode default
- ❌ KHÔNG đổi brand colors (gold #F5C842, bg #06060C)
- ❌ KHÔNG break existing pages (homepage, about, chat, challenges)

---

## 13. Build Order cho Claude Code

```
PHASE 1 — Foundation (ước tính 30 phút)
  1. Tạo lib/blog.ts — getAllPosts(), getPostBySlug(), markdown pipeline
  2. Install dependencies (unified, remark-*, rehype-*)
  3. Rewrite app/blog/page.tsx — server component, đọc filesystem
  4. Rewrite app/blog/[slug]/page.tsx — generateStaticParams từ tất cả slugs
  5. Verify: npm run build pass, tất cả 3 bài render đúng

PHASE 2 — Typography & Components (ước tính 45 phút)
  1. Thêm Lora font vào Google Fonts import
  2. Tạo article typography CSS (serif body, vertical rhythm, drop cap)
  3. Tạo components/blog/TOC.tsx + styles
  4. Tạo components/blog/ReadingProgress.tsx
  5. Tạo callout + pullquote rendering (remark-directive)
  6. Rewrite BlogArticle.tsx với TOC, progress, new typography
  7. Verify: đọc thử 1 bài dài, check rhythm + readability

PHASE 3 — Polish & SEO (ước tính 30 phút)
  1. Tạo components/blog/AuthorCard.tsx
  2. Tạo components/blog/RelatedPosts.tsx
  3. Tạo components/blog/NewsletterCTA.tsx
  4. Thêm Schema.org BlogPosting
  5. Thêm per-post metadata (og:image, description)
  6. Responsive QA: mobile, tablet, desktop
  7. Verify: Lighthouse SEO score ≥ 90
```

---

*PRD by Antigravity · 2026-05-08*
