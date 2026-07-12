import {
  brain2LessonHref,
  brain2LessonMetadata,
  getBrain2LessonMeta,
} from './lessons'

const ORIGIN = 'https://thongphan.com'
const COURSE_URL = `${ORIGIN}/brain2/21-ngay`

const absoluteLessonHref = (day: number) => `${ORIGIN}${brain2LessonHref(day)}`

const safeLessonItem = (meta: (typeof brain2LessonMetadata)[number]) => ({
  '@type': 'LearningResource',
  name: `Ngày ${String(meta.day).padStart(2, '0')} · ${meta.title}`,
  description: meta.preview,
  position: meta.day,
  url: absoluteLessonHref(meta.day),
  isAccessibleForFree: meta.access === 'public',
  timeRequired: `PT${meta.estimatedMinutes.min}M`,
})

export function buildBrain2CourseStructuredData() {
  const hasPart = brain2LessonMetadata.map(safeLessonItem)
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: '21 ngày Brain2',
    description: '21 ngày để biến những gì bạn đã sống thành một hệ thống có thể dùng lại.',
    url: COURSE_URL,
    provider: {
      '@type': 'Person',
      name: 'Thông Phan',
      url: ORIGIN,
    },
    hasPart,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: hasPart.length,
      itemListElement: hasPart.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        url: item.url,
      })),
    },
  }
}

export function buildBrain2LessonStructuredData(slug: string) {
  const meta = getBrain2LessonMeta(slug)
  if (!meta) return null

  return {
    '@context': 'https://schema.org',
    ...safeLessonItem(meta),
    isPartOf: {
      '@type': 'Course',
      name: '21 ngày Brain2',
      url: COURSE_URL,
    },
    ...(meta.day > 1 ? { previousItem: absoluteLessonHref(meta.day - 1) } : {}),
    ...(meta.day < 21 ? { nextItem: absoluteLessonHref(meta.day + 1) } : {}),
  }
}
