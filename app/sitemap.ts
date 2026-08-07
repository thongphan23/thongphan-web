import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllLibraryNotes } from '@/lib/library'
import { getAllMicroAssets } from '@/lib/micro-assets'
import { getAllReadingSummaries } from '@/lib/readings'
import { brain2LessonMetadata } from '@/lib/brain2/lessons'

const BASE_URL = 'https://thongphan.com'
const RELEASE_DATE = '2026-07-10'
const CONTENT_WORKFLOW_RELEASE_DATE = '2026-08-08'
const contentWorkflowRoutes = [
  '/challenge/content-workflow-7days',
  ...Array.from({ length: 7 }, (_, index) => `/challenge/content-workflow-7days/day-${String(index + 1).padStart(2, '0')}`),
]

export const dynamic = 'force-static'

function entry(pathname: string, lastModified: string): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${pathname}`,
    lastModified,
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '/',
    '/about',
    '/diagnostic',
    '/assets',
    '/experiences',
    '/brain2/21-ngay',
    '/chat',
    '/library',
    '/library/read',
    '/blog',
  ].map((pathname) => entry(pathname, RELEASE_DATE))

  const blogRoutes = getAllPosts().map((post) =>
    entry(`/blog/${post.slug}`, post.updatedAt ?? post.publishedAt),
  )
  const noteRoutes = getAllLibraryNotes().map((note) =>
    entry(`/library/${note.slug}`, note.updatedAt),
  )
  const readingRoutes = getAllReadingSummaries().map((reading) =>
    entry(reading.readingPath, reading.lastReviewedAt),
  )
  const assetRoutes = getAllMicroAssets().map((asset) =>
    entry(`/assets/${asset.slug}`, RELEASE_DATE),
  )
  const publicBrain2Routes = brain2LessonMetadata
    .filter((lesson) => lesson.access === 'public')
    .map((lesson) => entry(`/brain2/21-ngay/${lesson.slug}`, RELEASE_DATE))
  const contentWorkflowEntries = contentWorkflowRoutes.map((pathname) => entry(pathname, CONTENT_WORKFLOW_RELEASE_DATE))
  return [...staticRoutes, ...contentWorkflowEntries, ...publicBrain2Routes, ...blogRoutes, ...noteRoutes, ...readingRoutes, ...assetRoutes]
}
