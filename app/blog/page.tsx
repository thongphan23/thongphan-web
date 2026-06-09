import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { getAllPosts } from '@/lib/blog'
import BlogFiltersClient from './BlogFiltersClient'
import Link from 'next/link'
import { GardenSignature } from '@/components/GardenSignature'
import styles from './page.module.css'

const CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: 'TẤT' },
  { key: 'fear-ai', label: 'Sợ AI', icon: 'SỢ', journeys: ['Sợ AI'], slugs: ['ai-khong-cuop-viec-ban'] },
  { key: 'right-ai', label: 'Dùng AI đúng cách', icon: 'AI', journeys: ['Dùng AI đúng cách'], slugs: ['ai-khong-cuop-viec-ban'] },
  { key: 'brain2', label: 'Brain2', icon: 'B2', journeys: ['Brain2'], categories: ['brain2'] },
  { key: 'content', label: 'Content kéo khách', icon: 'ND', journeys: ['Content kéo khách'], categories: ['content'] },
  { key: 'assets', label: 'Tài sản số', icon: 'TS', journeys: ['Tài sản số'], categories: ['career', 'finance'] },
  { key: 'conan', label: 'Conan', icon: 'CN', journeys: ['Conan'], categories: ['conan'] },
]

const JOURNEY_CONTEXT: Record<string, { label: string; state: string; context: string }> = {
  'ai-khong-cuop-viec-ban': {
    label: 'Sợ AI',
    state: 'Nhẹ nhõm',
    context: 'Bài này giúp anh em nhẹ nhõm: nỗi sợ thật không phải AI, mà là người biết dùng AI tốt hơn.',
  },
  'xay-brain2-voi-obsidian': {
    label: 'Brain2',
    state: 'Sáng tỏ',
    context: 'Bài này giúp anh em sáng tỏ vì sao Brain2 không phải app ghi chú, mà là nền để AI hiểu mình.',
  },
  '40-bai-viral-tui-hoc-duoc-gi': {
    label: 'Content kéo khách',
    state: 'Kiểm soát',
    context: 'Bài này giúp anh em kiểm soát hơn: content có mẫu lặp lại, không phải trò may rủi.',
  },
  '10-nam-lam-marketing-toi-hoc-duoc-gi': {
    label: 'Tài sản số',
    state: 'Sáng tỏ',
    context: 'Bài này đặt proof sống phía sau hệ thống: 10 năm thị trường, trust và chuyên môn trước khi dùng AI.',
  },
}

const readingJourney = [
  ['Sợ AI', 'Nhẹ nhõm'],
  ['Brain2', 'Sáng tỏ'],
  ['Content', 'Kiểm soát'],
  ['Conan', 'Thực hành'],
]

function getJourney(post: { slug: string; category: string; journey?: string; readerState?: string; promise?: string }) {
  if (post.journey || post.readerState || post.promise) {
    return {
      label: post.journey || JOURNEY_CONTEXT[post.slug]?.label || post.category,
      state: post.readerState || JOURNEY_CONTEXT[post.slug]?.state || 'Sáng tỏ',
      context:
        post.promise ||
        JOURNEY_CONTEXT[post.slug]?.context ||
        'Bài này là một mảnh trên hành trình biến chuyên môn thành tài sản số và hệ thống AI.',
    }
  }

  return JOURNEY_CONTEXT[post.slug] ?? {
    label: post.category,
    state: 'Sáng tỏ',
    context: 'Bài này là một mảnh trên hành trình biến chuyên môn thành tài sản số và hệ thống AI.',
  }
}

export const metadata: Metadata = {
  title: 'Blog Thông Phan — Sáng tỏ giữa hỗn loạn AI',
  description: 'Thư viện bài viết giúp người có chuyên môn đi từ sợ AI, dùng AI đúng cách, xây Brain2, viết content kéo khách tới tài sản số và Conan.',
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featuredPost = posts.find((p) => p.featured)
  const regularPosts = posts.filter((p) => p !== featuredPost)
  const featuredJourney = featuredPost ? getJourney(featuredPost) : null

  return (
    <div className={styles.blogPage}>
      <div className="container">
        {/* Header */}
        <header className={styles.header} data-reveal>
          <div className={styles.headerShell}>
            <div className={styles.headerCopy}>
              <span className={styles.eyebrow}>Thư viện thực chiến</span>
              <h1>Biến kiến thức thành tài sản bắt đầu từ cách nghĩ đúng.</h1>
              <p className={styles.subtitle}>
                Một publication hub cho người có chuyên môn muốn đi từ hoang mang vì AI tới nhẹ nhõm, sáng tỏ, rồi kiểm soát bằng Brain2 và hệ thống thật.
              </p>
              <div className={styles.postCount}>{posts.length} bài viết · đọc theo trạng thái</div>
              <GardenSignature variant="seed" eyebrow="Reading path" title="Mỗi bài là một hạt giống giúp người đọc chuyển trạng thái, không phải bài lẻ." compact />
            </div>

            <div className={styles.readingCompass} aria-label="Reading compass">
              <div className={styles.compassGrid} />
              <div className={styles.compassCore}>
                <span>Start</span>
                <strong>Đọc theo trạng thái</strong>
              </div>
              <div className={styles.compassPath}>
                {readingJourney.map(([label, state], index) => (
                  <div key={label} className={styles.pathNode} style={{ '--node': index } as CSSProperties}>
                    <span>{label}</span>
                    <strong>{state}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Featured Post */}
        {featuredPost && (
          <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard} data-reveal>
            {featuredPost.coverImage && (
              <div className={styles.featuredImageWrap}>
                <img
                  src={featuredPost.coverImage}
                  alt={featuredPost.title}
                  className={styles.featuredImage}
                  loading="eager"
                />
                <div className={styles.featuredImageOverlay} />
              </div>
            )}
            <div className={styles.featuredContent}>
              <span className="badge gold">
                Nổi bật · {featuredJourney?.label} · {featuredJourney?.state}
              </span>
              <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
              <p className={styles.featuredDesc}>{featuredPost.description}</p>
              {featuredJourney && <p className={styles.featuredContext}>{featuredJourney.context}</p>}
              <div className={styles.featuredMeta}>
                <span>{featuredPost.calculatedReadingTime} phút đọc</span>
                <span>·</span>
                <span>{new Date(featuredPost.publishedAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Category Filters + Post Grid (client-side interactivity) */}
        <BlogFiltersClient
          categories={CATEGORIES}
          posts={regularPosts.map((p) => ({
            slug: p.slug,
            title: p.title,
            description: p.description,
            category: p.category,
            publishedAt: p.publishedAt,
            readingTime: p.calculatedReadingTime,
            coverImage: p.coverImage,
            journeyLabel: getJourney(p).label,
            readerState: getJourney(p).state,
            journeyContext: getJourney(p).context,
          }))}
        />
      </div>
    </div>
  )
}
