import { getAllPosts, getAllSlugs, getPostBySlug, type PostMeta } from '@/lib/blog'
import type { Metadata } from 'next'
import BlogArticle from './BlogArticle'
import { notFound } from 'next/navigation'

const JOURNEY_ORDER = [
  'Sợ AI',
  'Dùng AI đúng cách',
  'Brain2',
  'Content kéo khách',
  'Tài sản số',
  'Conan',
]

function getRelatedPosts(current: PostMeta, posts: PostMeta[]) {
  const currentIndex = JOURNEY_ORDER.indexOf(current.journey || '')
  const journeyPriority =
    currentIndex >= 0
      ? [...JOURNEY_ORDER.slice(currentIndex + 1), ...JOURNEY_ORDER.slice(0, currentIndex + 1)]
      : JOURNEY_ORDER

  return posts
    .filter((post) => post.slug !== current.slug)
    .sort((a, b) => {
      const journeyA = journeyPriority.indexOf(a.journey || '')
      const journeyB = journeyPriority.indexOf(b.journey || '')
      const rankA = journeyA === -1 ? 99 : journeyA
      const rankB = journeyB === -1 ? 99 : journeyB
      if (rankA !== rankB) return rankA - rankB
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    .slice(0, 2)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      journey: post.journey,
      readerState: post.readerState,
      readingTime: post.calculatedReadingTime,
    }))
}

export async function generateStaticParams() {
  const slugs = getAllSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Không tìm thấy bài viết' }

  return {
    title: `${post.title} — Thông Phan`,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    authors: [{ name: 'Thông Phan', url: 'https://thongphan.com/about' }],
    category: post.journey || post.category,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: ['Thông Phan'],
      section: post.journey || post.category,
      tags: post.tags,
      images:
        post.ogImage || post.coverImage
          ? [{ url: post.ogImage || post.coverImage || '' }]
          : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  const allPosts = getAllPosts()

  if (!post) {
    notFound()
  }

  return (
    <BlogArticle
      title={post.title}
      description={post.description}
      category={post.category}
      journey={post.journey}
      readerState={post.readerState}
      promise={post.promise}
      proof={post.proof}
      publishedAt={post.publishedAt}
      readingTime={post.calculatedReadingTime}
      coverImage={post.coverImage}
      contentHtml={post.contentHtml}
      headings={post.headings}
      slug={post.slug}
      endCta={post.endCta}
      relatedPosts={getRelatedPosts(post, allPosts)}
    />
  )
}
