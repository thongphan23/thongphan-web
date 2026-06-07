'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'

interface Post {
  title: string
  description: string
  category: string
  date: string
  readingTime: string
  content: string
}

export default function BlogPostClient({ post }: { post: Post }) {
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
            <span className="badge gold">{post.category.toUpperCase()}</span>
            <h1 className="mt-4">{post.title}</h1>
            <p className={styles.description}>{post.description}</p>
            <div className={styles.meta}>
              <span>{post.readingTime}</span>
              <span>•</span>
              <span>{post.date}</span>
            </div>
          </header>

          {/* Content */}
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />

          {/* Author Card */}
          <div className={`card ${styles.authorCard}`}>
            <div className={styles.authorInfo}>
              <div className={styles.authorAvatar}>TP</div>
              <div>
                <h4>Thông Phan</h4>
                <p className="text-muted">
                  10 năm làm nội dung và marketing. 40+ bài viral. Đồng sáng lập Conan School & Autoshop.
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
                <span className="badge">Nội dung</span>
                <h4 className="mt-4">40 bài viral, tui học được gì</h4>
                <p className="text-muted mt-4">10 năm làm nội dung và marketing.</p>
              </a>
            </div>
          </section>
        </div>
      </article>
    </>
  )
}
