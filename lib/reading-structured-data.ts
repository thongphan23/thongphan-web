import type { ReadingArticle } from './readings'

const BASE_URL = 'https://thongphan.com'

export function buildReadingStructuredData(reading: ReadingArticle) {
  const canonical = `${BASE_URL}${reading.readingPath}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: reading.title,
    description: reading.description,
    url: canonical,
    mainEntityOfPage: canonical,
    inLanguage: 'vi-VN',
    dateModified: reading.lastReviewedAt,
    author: {
      '@type': 'Person',
      name: 'Thông Phan',
      url: `${BASE_URL}/about`,
    },
    about: {
      '@type': 'CreativeWork',
      name: reading.title,
      author: {
        '@type': 'Person',
        name: reading.author,
      },
    },
    isBasedOn: reading.sourceUrl,
    citation: reading.sourceUrl,
    publisher: {
      '@type': 'Person',
      name: 'Thông Phan',
      url: BASE_URL,
    },
  }
}
