// lib/blog.ts — Thin wrapper re-exporting from generated data file
// All fs operations are done at build-time by scripts/generate-blog-data.mjs
// This avoids Turbopack worker CWD resolution issues with fs.readFileSync

export type { TOCHeading, PostMeta, Post } from './blog-data.generated'
export { getAllPosts, getAllSlugs, getPostBySlug } from './blog-data.generated'

// Re-export PostFrontmatter for backwards compatibility
export type PostFrontmatter = {
  title: string
  description: string
  category: string
  tags?: string[]
  journey?: string
  readerState?: string
  promise?: string
  proof?: string
  midCta?: {
    label?: string
    title: string
    body?: string
    href: string
    cta: string
  }
  endCta?: {
    label?: string
    title: string
    body?: string
    href: string
    cta: string
  }
  publishedAt: string
  updatedAt?: string
  readingTime?: number
  featured?: boolean
  series?: string
  seriesOrder?: number
  coverImage?: string
  ogImage?: string
}
