import styles from './page.module.css'
import BlogPostClient from './BlogPostClient'

// Placeholder post data
const POST = {
  title: 'AI không cướp việc bạn',
  description: 'Người dùng AI giỏi hơn bạn mới cướp. Đây là cách tui dùng AI để tăng năng suất 10x.',
  category: 'ai',
  date: '2026-05-01',
  readingTime: '5 phút đọc',
  content: `
# AI không cướp việc bạn

Người dùng AI giỏi hơn bạn mới cướp.

## Tại sao mọi người sợ AI?

Vì họ nghĩ AI sẽ thay thế con người. Nhưng sự thật là: **AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp.**

## Cách tui dùng AI

Tui dùng AI để:

1. **Viết nhanh hơn 5x** — Claude Code giúp tui viết code, content, và tài liệu
2. **Nghiên cứu sâu hơn** — RAG từ Brain2 vault giúp tui tìm insights nhanh
3. **Tự động hóa** — Workflows giúp tui focus vào creative work

## Kết luận

Đừng sợ AI. Hãy học cách dùng AI đúng cách.
  `,
}

export async function generateStaticParams() {
  // For static export, generate params for known blog posts
  return [
    { slug: 'ai-khong-cuop-viec-ban' },
  ]
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <BlogPostClient post={POST} />
  )
}
