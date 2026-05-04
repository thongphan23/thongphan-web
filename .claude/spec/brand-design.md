# Brand & Design System — thongphan.com

> Source: Author DNA + Vault Brain2. Claude Code phải tuân thủ tuyệt đối.

---

## 1. Brand Identity

**Tagline chính:** "AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp."
**Tagline phụ (sub-headline):** "10 năm content marketing. 40+ bài viral. Tui đang chia sẻ tất cả."
**Brand statement:** Giúp người đi làm giữ và +1 thu nhập nhờ dùng AI đúng cách, bất chấp mọi nghề.

**Tone:** Provocative Truth-teller. Giọng cà phê, KHÔNG giáo trình. Bình tĩnh + authority.
**NOT:** Motivational speaker, giáo sư lý thuyết, guru trên bục giảng.

---

## 2. Color System (CSS Variables)

```css
:root {
  /* Backgrounds */
  --bg-primary:    #0A0A0F;   /* near black — default page bg */
  --bg-secondary:  #12121A;   /* card, sidebar bg */
  --bg-tertiary:   #1E1E2E;   /* hover state, input bg */
  --bg-elevated:   #252535;   /* modal, dropdown bg */

  /* Brand Accent */
  --accent-gold:   #F5C842;   /* PRIMARY accent — CTA, highlight, logo */
  --accent-gold-dim: #C9A220; /* hover state for gold elements */
  --accent-blue:   #3B82F6;   /* links, secondary CTAs */
  --accent-blue-dim: #2563EB; /* hover for blue */

  /* Text */
  --text-primary:   #EAEAF0;  /* main body text */
  --text-secondary: #9898B0;  /* meta, labels, timestamps */
  --text-muted:     #5A5A7A;  /* placeholder, disabled */

  /* Borders & Dividers */
  --border-subtle:  rgba(255,255,255,0.06);
  --border-medium:  rgba(255,255,255,0.12);
  --border-gold:    rgba(245,200,66,0.3);   /* for featured items */

  /* Functional */
  --success: #22C55E;
  --warning: #F59E0B;
  --error:   #EF4444;
}
```

---

## 3. Typography

```css
/* Google Fonts — import in global CSS */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-heading: 'Be Vietnam Pro', sans-serif;  /* All headings, display text */
  --font-body:    'Inter', sans-serif;             /* Body text, UI */
  --font-mono:    'JetBrains Mono', monospace;    /* Code snippets, prompts */
}

/* Scale */
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
--text-hero: 4rem;      /* 64px */
```

---

## 4. Spacing & Layout

```css
--space-1:  0.25rem;
--space-2:  0.5rem;
--space-3:  0.75rem;
--space-4:  1rem;
--space-6:  1.5rem;
--space-8:  2rem;
--space-12: 3rem;
--space-16: 4rem;
--space-24: 6rem;

--container-max: 1200px;
--container-blog: 760px;   /* blog post reading width */
--container-chat: 800px;   /* chat UI width */

--radius-sm:  6px;
--radius-md:  12px;
--radius-lg:  20px;
--radius-full: 9999px;
```

---

## 5. Component Patterns

### Card
```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: border-color 0.2s, transform 0.2s;
}
.card:hover {
  border-color: var(--border-gold);
  transform: translateY(-2px);
}
```

### Primary Button (Gold CTA)
```css
.btn-primary {
  background: var(--accent-gold);
  color: #0A0A0F;
  font-family: var(--font-heading);
  font-weight: 700;
  padding: 12px 28px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.btn-primary:hover {
  background: var(--accent-gold-dim);
  transform: translateY(-1px);
}
```

### Text Input
```css
.input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: var(--text-base);
  width: 100%;
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--accent-gold);
}
```

---

## 6. Animation Standards

```css
/* Page transitions */
.page-enter { opacity: 0; transform: translateY(8px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: 0.3s ease; }

/* Fade-in on scroll */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-in { animation: fadeInUp 0.5s ease forwards; }

/* Gold shimmer for hero text */
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
.text-gold-shimmer {
  background: linear-gradient(90deg, #F5C842 0%, #FFE0A0 50%, #F5C842 100%);
  background-size: 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shimmer 3s linear infinite;
}

/* Reading progress bar */
.reading-progress {
  position: fixed;
  top: 0; left: 0;
  height: 3px;
  background: var(--accent-gold);
  z-index: 1000;
  transition: width 0.1s;
}
```

---

## 7. Navigation Structure

```
/ (Homepage)
/blog (Blog listing — all posts)
/blog/[slug] (Blog post detail)
/challenges (All challenge programs)
/challenges/[slug] (Challenge landing + signup)
/chat (AI Chat — Thông Phan clone)
/about (About page)
```

---

## 8. SEO Requirements

- Every page: `<title>` + `<meta name="description">`
- Blog posts: `<meta property="og:image">` → auto-generated via OG image Worker
- Schema.org: BlogPosting for articles, Person for about
- Canonical URLs
- Vietnamese: `<html lang="vi">`
- Sitemap: `/sitemap.xml` (generated by Worker or Next.js)

---

## 9. Content Categories (for Blog filtering)

| Key | Label | Icon | Description |
|-----|-------|------|-------------|
| `ai` | AI & Công cụ | 🤖 | Dùng AI đúng cách trong công việc |
| `career` | Sự nghiệp | 🎯 | Chiến lược giữ và +1 thu nhập |
| `content` | Content Marketing | ✍️ | 10 năm kinh nghiệm thực chiến |
| `brain2` | Brain2 & Tư duy | 🧠 | Xây bộ não thứ 2, quản lý tri thức |
| `finance` | Tài chính cá nhân | 💰 | Tiền bạc, đầu tư, bài học khó |
