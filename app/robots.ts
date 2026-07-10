import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/classic', '/concept', '/co-che-tep-moi.html', '/api/'],
    },
    sitemap: 'https://thongphan.com/sitemap.xml',
  }
}
