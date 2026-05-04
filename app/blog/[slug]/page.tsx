'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

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

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(Math.min(progress, 100))
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Reading Progress Bar */}
      <div
        className="reading-progress"
        style={{ width: `${scrollProgress}%` }}
      />

      <article className={styles.article}>
        <div className="container-blog">
          {/* Header */}
          <header className={styles.header}>
            <span className="badge gold">{POST.category.toUpperCase()}</span>
            <h1 className="mt-4">{POST.title}</h1>
            <p className={styles.description}>{POST.description}</p>
            <div className={styles.meta}>
              <span>{POST.readingTime}</span>
              <span>•</span>
              <span>{POST.date}</span>
            </div>
          </header>

          {/* Content */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: POST.content.replace(/\n/g, '<br/>') }}
          />

          {/* Author Card */}
          <div className={`card ${styles.authorCard}`}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>TP</div>
              <div>
                <h4>Thông Phan</h4>
                <p className="text-muted">
                  10 năm content marketing. 40+ bài viral. Founder Conan School & Autoshop.
                </p>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <section className={styles.related}>
            <h3>Bài liên quan</h3>
            <div className={styles.relatedGrid}>
              <a href="/blog/xay-brain2-voi-obsidian" className="card">
                <span className="badge">Brain2</span>
                <h4 className="mt-4">Xây Brain2 với Obsidian</h4>
                <p className="text-muted mt-4">Bộ não thứ 2 giúp tui nhớ mọi thứ.</p>
              </a>
              <a href="/blog/40-bai-viral-tui-hoc-duoc-gi" className="card">
                <span className="badge">Content</span>
                <h4 className="mt-4">40 bài viral, tui học được gì</h4>
                <p className="text-muted mt-4">10 năm content marketing.</p>
              </a>
            </div>
          </section>
        </div>
      </article>
    </>
  )
}
