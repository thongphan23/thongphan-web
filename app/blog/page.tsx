import type { Metadata } from 'next'
import { getAllPosts } from '@/lib/blog'
import BlogFiltersClient from './BlogFiltersClient'
import type { BlogCategory } from './blog-filtering'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import styles from './page.module.css'

const CATEGORIES: BlogCategory[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'fear-ai', label: 'Sợ AI', journeys: ['Sợ AI'], slugs: ['ai-khong-cuop-viec-ban'] },
  { key: 'right-ai', label: 'Dùng AI đúng cách', journeys: ['Dùng AI đúng cách'], slugs: ['ai-khong-cuop-viec-ban'] },
  { key: 'brain2', label: 'Brain2', journeys: ['Brain2'], categories: ['brain2'] },
  { key: 'content', label: 'Nội dung kéo khách', journeys: ['Content kéo khách'], categories: ['content'] },
  { key: 'assets', label: 'Tài sản số', journeys: ['Tài sản số'], categories: ['career', 'finance'] },
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
    context: 'Bài này đặt bằng chứng sống phía sau hệ thống: 10 năm thị trường, niềm tin và chuyên môn trước khi dùng AI.',
  },
}

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
  title: 'Bài của Thông — Thư viện Thông Phan',
  description: 'Bốn bài viết đi ra từ trải nghiệm thật về AI, Brain2, nội dung kéo khách và cách biến chuyên môn thành tài sản.',
  alternates: { canonical: '/blog' },
}

export default function BlogPage() {
  const posts = getAllPosts()
  const featuredPost = posts.find((p) => p.featured)

  return (
    <div className={styles.blogPage}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Thư viện · Bài của Thông · {posts.length} hồ sơ</p>
          <h1>Những bài viết đi ra từ trải nghiệm thật.</h1>
          <p className={styles.subtitle}>
            Không chạy theo tiếng ồn công cụ. Mỗi bài bắt đầu từ một va chạm thật, một bằng chứng
            đủ rõ và một câu hỏi đáng nghĩ tiếp.
          </p>
        </div>
        <aside className={styles.editorialNote} aria-label="Nguyên tắc viết">
          <p>Nguyên tắc viết</p>
          <strong>Chỉ nói điều mình đã sống đủ lâu để chịu trách nhiệm.</strong>
          <span>Đọc để bớt sợ, nhìn rõ hơn và làm được một bước có thật.</span>
        </aside>
      </header>

      <div className={styles.filmRaster} aria-hidden="true">
        <img src="/images/library/library-film-archive-v1.webp" alt="" width="2048" height="320" />
      </div>

      <section className={styles.archive} aria-labelledby="blog-archive-title">
        <header className={styles.archiveHeader}>
          <p>04 hồ sơ biên tập</p>
          <h2 id="blog-archive-title">Chọn bài theo điều bạn đang cần nhìn rõ.</h2>
        </header>

        <BlogFiltersClient
          categories={CATEGORIES}
          featuredSlug={featuredPost?.slug}
          posts={posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            description: post.description,
            category: post.category,
            publishedAt: post.publishedAt,
            readingTime: post.calculatedReadingTime,
            coverImage: post.coverImage,
            journeyLabel: getJourney(post).label,
            readerState: getJourney(post).state,
            journeyContext: getJourney(post).context,
          }))}
        />
      </section>
      <ChapterHandoff journeyKey="blog" tone="paper" />
    </div>
  )
}
