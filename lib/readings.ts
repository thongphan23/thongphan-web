import { generatedReadings } from './readings-data.generated'

export type ReadingRightsStatus =
  | 'public-domain'
  | 'permission-confirmed'
  | 'licensed'
  | 'source-link-only'
  | 'blocked'

export type ReadingIntent = 'clarity' | 'taste' | 'asset'
export type ReadingDurationBand = 'under-10' | '10-20' | 'over-20'

export type ReadingBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'highlight'; text: string }
  | { kind: 'pause'; text: string }
  | { kind: 'quote'; text: string; attribution?: string }
  | { kind: 'insight'; label: string; text: string }

export interface ReadingSection {
  title: string
  minutes: number
  blocks: ReadingBlock[]
}

export interface ReadingImage {
  src: string
  alt: string
  caption: string
  credit: string
  checksum: string
  license: string
}

export interface ReadingAudio {
  src: string
  title: string
  durationSeconds: number
  checksum: string
}

export interface ReadingInfoBox {
  title: string
  summary: string
  bullets?: string[]
}

export interface ReadingSummary {
  slug: string
  title: string
  description: string
  author: string
  source: string
  sourceUrl: string
  sourcePublishedAt: string | null
  translator: string | null
  editor: string | null
  translatedAt: string | null
  lastReviewedAt: string
  rightsStatus: ReadingRightsStatus
  minutes: number
  topics: string[]
  intent: ReadingIntent
  durationBand: ReadingDurationBand
  readingPath: string
  coreIdea?: string
  whyRead?: string
  reflection?: string
  authorProfile?: ReadingInfoBox
  contentContext?: ReadingInfoBox
  contentChecksum: string
  contentVersion: number
}

export interface ReadingArticle extends ReadingSummary {
  publicationMode: 'summary' | 'full'
  sections?: ReadingSection[]
  images: ReadingImage[]
  audio: ReadingAudio[]
}

const publicReadings = generatedReadings.filter((reading) => reading.rightsStatus !== 'blocked')

const toSummary = ({ publicationMode: _publicationMode, sections: _sections, images: _images, audio: _audio, ...summary }: ReadingArticle): ReadingSummary => summary

export function getAllReadingSummaries(): ReadingSummary[] {
  return publicReadings.map(toSummary)
}

export function getPublicReadings(): ReadingArticle[] {
  return publicReadings
}

export function getReadingBySlug(slug: string): ReadingArticle | null {
  return publicReadings.find((reading) => reading.slug === slug) ?? null
}

export function getReadingSlugs(): string[] {
  return publicReadings.map((reading) => reading.slug)
}

export function getRelatedReadingSummaries(slug: string, limit = 3): ReadingSummary[] {
  const current = getReadingBySlug(slug)
  if (!current || limit <= 0) return []

  const currentTopics = new Set(current.topics)

  return publicReadings
    .filter((reading) => reading.slug !== slug)
    .map((reading) => ({
      reading,
      score:
        reading.topics.filter((topic) => currentTopics.has(topic)).length * 3 +
        Number(reading.intent === current.intent) +
        Number(reading.durationBand === current.durationBand),
    }))
    .sort((a, b) =>
      b.score - a.score ||
      a.reading.title.localeCompare(b.reading.title, 'vi'),
    )
    .slice(0, limit)
    .map(({ reading }) => toSummary(reading))
}
