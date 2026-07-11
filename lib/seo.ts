import type { Metadata } from 'next'

export const SITE_URL = 'https://thongphan.com'
export const SITE_NAME = 'Thông Phan'
export const DEFAULT_DESCRIPTION =
  'Biến chuyên môn thật thành nội dung, tài sản số và cơ hội xứng đáng bằng AI và một hệ thống có bằng chứng.'

type PageMetadataInput = {
  title: string
  description: string
  pathname: string
  type?: 'website' | 'article'
  image?: string
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString()
}

export function createPageMetadata({
  title,
  description,
  pathname,
  type = 'website',
  image,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(pathname)
  return {
    title,
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: 'vi_VN',
      type,
      url: canonical,
      ...(image ? { images: [{ url: absoluteUrl(image) }] } : {}),
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(image ? { images: [absoluteUrl(image)] } : {}),
    },
  }
}

export function buildWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: DEFAULT_DESCRIPTION,
        inLanguage: 'vi-VN',
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/about#person`,
        name: SITE_NAME,
        url: `${SITE_URL}/about`,
      },
    ],
  }
}
