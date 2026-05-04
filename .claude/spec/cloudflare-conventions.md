# Cloudflare-Native Conventions — thongphan.com

> Stack: Next.js 15 (App Router) + Cloudflare Pages + Workers + D1 + KV + Vectorize + Workers AI

---

## 1. Project Structure

```
/thongphan-com
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (fonts, dark mode)
│   ├── page.tsx                # Homepage
│   ├── blog/
│   │   ├── page.tsx            # Blog listing
│   │   └── [slug]/page.tsx     # Blog post detail
│   ├── challenges/
│   │   ├── page.tsx            # All challenges
│   │   └── [slug]/page.tsx     # Challenge landing + signup form
│   ├── chat/
│   │   └── page.tsx            # AI Chat UI
│   └── about/
│       └── page.tsx            # About page
├── components/                 # Shared React components
│   ├── ui/                     # Primitive UI (Button, Input, Card...)
│   ├── blog/                   # Blog-specific (PostCard, TOC...)
│   ├── challenge/              # Challenge components (SignupForm...)
│   └── chat/                   # Chat UI (ChatBubble, ChatInput...)
├── content/
│   └── blog/                   # Markdown files (.md) for blog posts
│       └── [slug].md
├── workers/                    # Cloudflare Workers (deployed separately)
│   ├── api/                    # Blog API, challenge signup
│   ├── ai/                     # Chat endpoint (RAG pipeline)
│   ├── email/                  # Drip email sender (cron)
│   └── og/                     # OG image generator
├── styles/
│   ├── globals.css             # CSS variables, resets, utilities
│   └── [component].module.css # Per-component styles
├── lib/
│   ├── db.ts                   # D1 query helpers
│   ├── kv.ts                   # KV helpers
│   └── markdown.ts             # Markdown parser (gray-matter + remark)
├── wrangler.toml               # Cloudflare config (Pages + Workers)
└── next.config.ts              # Next.js config (edge runtime)
```

---

## 2. Next.js + Cloudflare Pages Setup

### next.config.ts
```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Required for Cloudflare Pages
  experimental: {
    after: true,
  },
  // Image optimization via Cloudflare
  images: {
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
  },
}

export default config
```

### wrangler.toml (cấu hình cho tất cả Cloudflare services)
```toml
name = "thongphan-com"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "thongphan-db"
database_id = "PLACEHOLDER_SET_AFTER_CREATE"

# KV Namespace
[[kv_namespaces]]
binding = "KV"
id = "PLACEHOLDER_SET_AFTER_CREATE"

# R2 Bucket
[[r2_buckets]]
binding = "R2"
bucket_name = "thongphan-media"

# Vectorize Index (for AI Chat RAG)
[[vectorize]]
binding = "BRAIN2_INDEX"
index_name = "brain2-vault"

# AI binding
[ai]
binding = "AI"

# Environment variables
[vars]
NEXT_PUBLIC_SITE_URL = "https://thongphan.com"
```

---

## 3. D1 Database Schema

```sql
-- BLOG POSTS (backup storage + metadata)
CREATE TABLE IF NOT EXISTS posts (
  id          TEXT PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL CHECK(category IN ('ai','career','content','brain2','finance')),
  published_at TEXT NOT NULL,  -- ISO8601
  reading_time INTEGER,         -- minutes
  is_published INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- CHALLENGE PROGRAMS
CREATE TABLE IF NOT EXISTS challenges (
  id            TEXT PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  tagline       TEXT,
  description   TEXT,
  duration_days INTEGER NOT NULL,
  is_active     INTEGER DEFAULT 1,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- CHALLENGE SIGNUPS
CREATE TABLE IF NOT EXISTS challenge_signups (
  id           TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  current_day  INTEGER DEFAULT 0,
  signed_up_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  is_unsubscribed INTEGER DEFAULT 0,
  UNIQUE(challenge_id, email)
);

-- EMAIL DRIP LOGS
CREATE TABLE IF NOT EXISTS email_logs (
  id        TEXT PRIMARY KEY,
  signup_id TEXT NOT NULL REFERENCES challenge_signups(id),
  day       INTEGER NOT NULL,
  sent_at   TEXT DEFAULT (datetime('now')),
  status    TEXT DEFAULT 'sent',  -- sent | failed | bounced
  UNIQUE(signup_id, day)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signups_email ON challenge_signups(email);
CREATE INDEX IF NOT EXISTS idx_signups_challenge ON challenge_signups(challenge_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_signup ON email_logs(signup_id);
```

---

## 4. Cloudflare Workers Patterns

### Worker cơ bản (TypeScript)
```typescript
export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  BRAIN2_INDEX: VectorizeIndex;
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': 'https://thongphan.com',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
    
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    // Route handling
    if (url.pathname === '/api/challenge/signup' && request.method === 'POST') {
      return handleChallengeSignup(request, env, corsHeaders)
    }

    return new Response('Not found', { status: 404 })
  },
  
  // Cron trigger for email drip
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(sendDailyEmails(env))
  }
}
```

### D1 Query Helper
```typescript
// lib/db.ts
export async function getPostBySlug(db: D1Database, slug: string) {
  const result = await db
    .prepare('SELECT * FROM posts WHERE slug = ? AND is_published = 1')
    .bind(slug)
    .first()
  return result
}

export async function getRecentPosts(db: D1Database, limit = 10) {
  const { results } = await db
    .prepare('SELECT * FROM posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT ?')
    .bind(limit)
    .all()
  return results
}
```

### KV Cache Pattern
```typescript
// Cache blog list với TTL 1 giờ
const cacheKey = 'blog:list:recent'
const cached = await env.KV.get(cacheKey, 'json')
if (cached) return Response.json(cached)

const posts = await getRecentPosts(env.DB)
await env.KV.put(cacheKey, JSON.stringify(posts), { expirationTtl: 3600 })
return Response.json(posts)
```

### Rate Limiting với KV
```typescript
async function rateLimit(env: Env, ip: string, limit = 10, window = 86400) {
  const key = `rl:chat:${ip}`
  const current = await env.KV.get(key)
  const count = current ? parseInt(current) : 0
  
  if (count >= limit) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  await env.KV.put(key, String(count + 1), { expirationTtl: window })
  return null // no rate limit hit
}
```

---

## 5. AI Chat RAG Pipeline

```typescript
// workers/ai/index.ts
async function handleChat(request: Request, env: Env): Promise<Response> {
  const { message } = await request.json()
  
  // 1. Rate limit check
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
  const rateLimitResponse = await rateLimit(env, ip, 10, 86400)
  if (rateLimitResponse) return rateLimitResponse
  
  // 2. Embed user message
  const embedding = await env.AI.run('@cf/baai/bge-small-en-v1.5', {
    text: message
  })
  
  // 3. Search Vectorize for relevant Brain2 chunks
  const results = await env.BRAIN2_INDEX.query(embedding.data[0], {
    topK: 5,
    returnMetadata: true,
  })
  
  // 4. Build context from chunks
  const context = results.matches
    .map(m => m.metadata?.text || '')
    .join('\n\n---\n\n')
  
  // 5. Build system prompt with Author DNA
  const systemPrompt = `Bạn là Thông Phan. ${AUTHOR_DNA_SUMMARY}
  
Dựa trên kiến thức sau đây từ Brain2 vault của tôi:
${context}

Trả lời bằng tiếng Việt, giọng cà phê, xưng "tui", gọi "anh em".`

  // 6. Stream response
  const stream = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    stream: true,
  })
  
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}
```

---

## 6. Email Drip via MailChannels

```typescript
async function sendEmail(to: string, name: string, subject: string, html: string) {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to, name }] }],
      from: { email: 'hello@thongphan.com', name: 'Thông Phan' },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  })
  return response.ok
}
```

---

## 7. Markdown Blog Processing

```typescript
// lib/markdown.ts — dùng gray-matter + remark
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkHtml from 'remark-html'
import remarkGfm from 'remark-gfm'

export interface BlogFrontmatter {
  title: string
  description: string
  category: 'ai' | 'career' | 'content' | 'brain2' | 'finance'
  publishedAt: string  // ISO8601
  readingTime?: number
  featured?: boolean
}

export async function parseMarkdown(content: string) {
  const { data, content: mdContent } = matter(content)
  const processed = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(mdContent)
  
  return {
    frontmatter: data as BlogFrontmatter,
    html: processed.toString(),
  }
}
```

---

## 8. Cloudflare Pages Deployment

```bash
# Cài wrangler
npm install -g wrangler

# Login
wrangler login

# Tạo D1 database
wrangler d1 create thongphan-db

# Tạo KV namespace
wrangler kv:namespace create thongphan-kv

# Tạo Vectorize index (for AI chat)
wrangler vectorize create brain2-vault --dimensions=384 --metric=cosine

# Deploy Pages
wrangler pages deploy ./out --project-name=thongphan-com

# Deploy worker
wrangler deploy workers/api/index.ts
```

---

## 9. DNS Setup (thongphan.com đã trên Cloudflare)

Sau khi Pages project tạo xong:
```
# Thay record hiện tại:
# thongphan.com A 216.198.79.1 → CNAME thongphan-com.pages.dev
# www.thongphan.com CNAME → thongphan-com.pages.dev

# Custom domains trong Pages dashboard:
# - thongphan.com
# - www.thongphan.com
```
