import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllLibraryNotes } from '@/lib/library'
import { getAllMicroAssets } from '@/lib/micro-assets'
import { getAllReadingSummaries } from '@/lib/readings'
import { brain2LessonMetadata } from '@/lib/brain2/lessons'

const BASE_URL = 'https://thongphan.com'
const RELEASE_DATE = '2026-07-10'

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
    '/ebooks/phan-tich-doi-thu-tim-insight-khach-hang',
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
  return [...staticRoutes, ...publicBrain2Routes, ...blogRoutes, ...noteRoutes, ...readingRoutes, ...assetRoutes]
}
