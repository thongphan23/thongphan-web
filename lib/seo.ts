import type { Metadata } from 'next'

export const SITE_URL = 'https://thongphan.com'
export const SITE_NAME = 'Thông Phan'
export const DEFAULT_DESCRIPTION =
  'Thông Phan dẫn đường cho người đi làm học dùng AI cho việc thật cùng Tensai, và cho người đang hoặc muốn kinh doanh xây doanh nghiệp trong kỷ nguyên AI cùng Conan School.'

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

export function buildAboutPageStructuredData() {
  const personId = `${SITE_URL}/about#person`
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE_URL}/about#about-page`,
    url: `${SITE_URL}/about`,
    name: 'Câu chuyện của Thông Phan',
    description: 'Năm hồi tạo nên cách Thông Phan dẫn đường cho người đi làm và người kinh doanh trong kỷ nguyên AI.',
    inLanguage: 'vi-VN',
    mainEntity: { '@id': personId },
    about: { '@id': personId },
  }
}

export function buildBranchPageStructuredData({
  name,
  description,
  pathname,
}: {
  name: string
  description: string
  pathname: string
}) {
  const url = absoluteUrl(pathname)
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'vi-VN',
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/about#person` },
  }
}
