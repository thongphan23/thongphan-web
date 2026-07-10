'use client'

import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  filterBlogPosts,
  type BlogCategory,
  type BlogPostItem,
} from './blog-filtering'
import styles from './page.module.css'

export default function BlogFiltersClient({
  categories,
  featuredSlug,
  posts,
}: {
  categories: BlogCategory[]
  featuredSlug?: string
  posts: BlogPostItem[]
}) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPosts = useMemo(
    () => filterBlogPosts(posts, categories, selectedCategory, searchQuery),
    [categories, posts, searchQuery, selectedCategory],
  )
  const showFeatured = selectedCategory === 'all' && searchQuery.trim() === ''
  const featuredPost = showFeatured ? posts.find((post) => post.slug === featuredSlug) : undefined
  const listPosts = featuredPost
    ? filteredPosts.filter((post) => post.slug !== featuredPost.slug)
    : filteredPosts

  return (
    <div className={styles.discovery}>
      <div className={styles.search}>
        <Search aria-hidden="true" size={18} strokeWidth={1.7} />
        <input
          type="text"
          placeholder="Tìm theo AI, Brain2, nội dung, tài sản số..."
          value={searchQuery}
          aria-label="Tìm bài viết"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.filters} role="group" aria-label="Lọc bài theo chủ đề">
        {categories.map((cat) => (
          <button
            key={cat.key}
            type="button"
            className={`${styles.filterBtn} ${selectedCategory === cat.key ? styles.active : ''}`}
            aria-pressed={selectedCategory === cat.key}
            onClick={() => setSelectedCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className={styles.resultMeta} aria-live="polite">
        <span>{filteredPosts.length} bài phù hợp</span>
      </div>

      {featuredPost ? (
        <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
          {featuredPost.coverImage ? (
            <div className={styles.featuredImageWrap}>
              <img
                src={featuredPost.coverImage}
                alt=""
                className={styles.featuredImage}
                loading="eager"
              />
            </div>
          ) : null}
          <div className={styles.featuredContent}>
            <p>Nổi bật · {featuredPost.journeyLabel} · {featuredPost.readerState}</p>
            <h3>{featuredPost.title}</h3>
            <p>{featuredPost.description}</p>
            <span>{featuredPost.journeyContext}</span>
            <small>{featuredPost.readingTime} phút đọc · {new Date(featuredPost.publishedAt ?? '').toLocaleDateString('vi-VN')}</small>
          </div>
        </Link>
      ) : null}

      <div className={styles.postsList}>
        {listPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className={styles.postRow}
            data-has-cover={post.coverImage ? 'true' : 'false'}
          >
            <span className={styles.rowIndex}>{String(index + 1).padStart(2, '0')}</span>
            {post.coverImage ? <img src={post.coverImage} alt="" loading="lazy" /> : null}
            <span className={styles.rowCopy}>
              <small>{post.journeyLabel} · {post.readerState}</small>
              <strong>{post.title}</strong>
              <span>{post.description}</span>
            </span>
            <span className={styles.rowMeta}>
              <small>{post.readingTime} phút</small>
              <small>{new Date(post.publishedAt ?? '').toLocaleDateString('vi-VN')}</small>
            </span>
            <ArrowUpRight aria-hidden="true" size={21} strokeWidth={1.6} />
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className={styles.empty}>
          <p>Chưa có bài phù hợp với lựa chọn này.</p>
          <button type="button" onClick={() => { setSelectedCategory('all'); setSearchQuery('') }}>
            Xem lại tất cả bài
          </button>
        </div>
      )}
    </div>
  )
}
