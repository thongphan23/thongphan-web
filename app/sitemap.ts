import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'
import { getAllLibraryNotes } from '@/lib/library'
import { getAllMicroAssets } from '@/lib/micro-assets'

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
    '/challenges',
    '/challenges/brain2-21-ngay',
    '/chat',
    '/library',
    '/blog',
  ].map((pathname) => entry(pathname, RELEASE_DATE))

  const blogRoutes = getAllPosts().map((post) =>
    entry(`/blog/${post.slug}`, post.updatedAt ?? post.publishedAt),
  )
  const noteRoutes = getAllLibraryNotes().map((note) =>
    entry(`/library/${note.slug}`, note.updatedAt),
  )
  const assetRoutes = getAllMicroAssets().map((asset) =>
    entry(`/assets/${asset.slug}`, RELEASE_DATE),
  )

  return [...staticRoutes, ...blogRoutes, ...noteRoutes, ...assetRoutes]
}
