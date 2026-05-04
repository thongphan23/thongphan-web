'use client'

import { useState } from 'react'
import styles from './page.module.css'

const CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: '📚' },
  { key: 'ai', label: 'AI & Công cụ', icon: '🤖' },
  { key: 'career', label: 'Sự nghiệp', icon: '🎯' },
  { key: 'content', label: 'Content Marketing', icon: '✍️' },
  { key: 'brain2', label: 'Brain2 & Tư duy', icon: '🧠' },
  { key: 'finance', label: 'Tài chính cá nhân', icon: '💰' },
]

// Placeholder posts
const POSTS = [
  {
    slug: 'ai-khong-cuop-viec-ban',
    title: 'AI không cướp việc bạn',
    description: 'Người dùng AI giỏi hơn bạn mới cướp. Đây là cách tui dùng AI để tăng năng suất 10x.',
    category: 'ai',
    date: '2026-05-01',
    readingTime: '5 phút đọc',
  },
  {
    slug: 'xay-brain2-voi-obsidian',
    title: 'Xây Brain2 với Obsidian',
    description: 'Bộ não thứ 2 giúp tui nhớ mọi thứ, kết nối ý tưởng, và viết nhanh hơn 5x.',
    category: 'brain2',
    date: '2026-04-28',
    readingTime: '8 phút đọc',
  },
  {
    slug: '40-bai-viral-tui-hoc-duoc-gi',
    title: '40 bài viral, tui học được gì',
    description: '10 năm content marketing, đây là những bài học đắt nhất tui trả tiền để học.',
    category: 'content',
    date: '2026-04-25',
    readingTime: '12 phút đọc',
  },
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = POSTS.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className={styles.blogPage}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <h1>Blog</h1>
          <p className={styles.subtitle}>
            10 năm content marketing. 40+ bài viral. Tui đang chia sẻ tất cả.
          </p>
        </header>

        {/* Search */}
        <div className={styles.search}>
          <input
            type="text"
            className="input"
            placeholder="Tìm bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className={styles.filters}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${selectedCategory === cat.key ? styles.active : ''}`}
              onClick={() => setSelectedCategory(cat.key)}
            >
              <span className={styles.filterIcon}>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Posts Grid */}
        <div className={styles.postsGrid}>
          {filteredPosts.map(post => (
            <a key={post.slug} href={`/blog/${post.slug}`} className="card">
              <span className={`badge ${post.category === 'ai' ? 'gold' : ''}`}>
                {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
              </span>
              <h3 className="mt-4">{post.title}</h3>
              <p className="text-muted mt-4">{post.description}</p>
              <div className={styles.postMeta}>
                <span>{post.readingTime}</span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
            </a>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className={styles.empty}>
            <p>Không tìm thấy bài viết nào.</p>
          </div>
        )}
      </div>
    </div>
  )
}
