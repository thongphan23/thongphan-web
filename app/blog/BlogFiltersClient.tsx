'use client'

import { useState } from 'react'
import Link from 'next/link'
import styles from './page.module.css'

interface Category {
  key: string
  label: string
  icon: string
  journeys?: string[]
  categories?: string[]
  slugs?: string[]
}

interface PostItem {
  slug: string
  title: string
  description: string
  category: string
  publishedAt: string
  readingTime: number
  coverImage?: string
  journeyLabel: string
  readerState: string
  journeyContext: string
}

export default function BlogFiltersClient({
  categories,
  posts,
}: {
  categories: Category[]
  posts: PostItem[]
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = posts.filter((post) => {
    const selectedFilter = categories.find((cat) => cat.key === selectedCategory)
    const matchesCategory =
      selectedCategory === 'all' ||
      selectedFilter?.slugs?.includes(post.slug) ||
      selectedFilter?.journeys?.includes(post.journeyLabel) ||
      selectedFilter?.categories?.includes(post.category) ||
      post.category === selectedCategory
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <>
      {/* Search */}
      <div className={styles.search} data-reveal>
        <input
          type="text"
          className="input"
          placeholder="Tìm bài theo AI, Brain2, nội dung..."
          value={searchQuery}
          aria-label="Tìm bài viết"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Filters */}
      <div className={styles.filters} data-reveal>
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === cat.key ? styles.active : ''}`}
            aria-pressed={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
          >
            <span className={styles.filterIcon}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Posts Grid */}
      <div className={styles.resultMeta} data-reveal>
        <span>{filteredPosts.length} bài phù hợp</span>
      </div>

      <div className={styles.postsGrid} data-reveal>
        {filteredPosts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={styles.postCard}
            data-stagger
          >
            {post.coverImage && (
              <div className={styles.postImageWrap}>
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className={styles.postImage}
                  loading="lazy"
                />
              </div>
            )}
            <div className={styles.postBody}>
              <span className={`badge ${post.category === 'ai' ? 'gold' : ''}`}>
                {post.journeyLabel} · {post.readerState}
              </span>
              <h3 className={styles.postTitle}>{post.title}</h3>
              <p className={styles.postDesc}>{post.description}</p>
              <p className={styles.postContext}>{post.journeyContext}</p>
              <div className={styles.postMeta}>
                <span>{post.readingTime} phút đọc</span>
                <span>·</span>
                <span>{new Date(post.publishedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className={styles.empty}>
          <p>Không tìm thấy bài viết nào.</p>
        </div>
      )}
    </>
  )
}
