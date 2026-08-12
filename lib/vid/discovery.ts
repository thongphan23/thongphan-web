import type { PublicVideo } from './contracts'

export function normalizeVietnamese(value: string): string {
  return value
    .toLocaleLowerCase('vi')
    .replaceAll('đ', 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function includesNormalized(value: string | string[], query: string): boolean {
  return normalizeVietnamese(Array.isArray(value) ? value.join(' ') : value).includes(query)
}

function searchScore(video: PublicVideo, query: string): number {
  if (!query) return 0
  let score = 0
  if (includesNormalized(video.title, query)) score += 20
  if (includesNormalized(video.sourceTitle, query)) score += 12
  if (includesNormalized(video.sourceCreator, query)) score += 10
  if (includesNormalized(video.topics, query)) score += 8
  if (includesNormalized(video.tags, query)) score += 6
  if (includesNormalized(video.description, query)) score += 3
  return score
}

export function filterVideos(videos: PublicVideo[], query = '', topic?: string): PublicVideo[] {
  const normalizedQuery = normalizeVietnamese(query)
  return videos
    .filter((video) => !topic || video.topics.includes(topic))
    .map((video) => ({ video, score: searchScore(video, normalizedQuery) }))
    .filter(({ score }) => !normalizedQuery || score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      const dateOrder = Date.parse(right.video.publishedAt) - Date.parse(left.video.publishedAt)
      return dateOrder || left.video.slug.localeCompare(right.video.slug, 'vi')
    })
    .map(({ video }) => video)
}

function overlap(left: string[], right: string[]): number {
  const rightValues = new Set(right)
  return left.reduce((count, value) => count + Number(rightValues.has(value)), 0)
}

export function rankRelated(current: PublicVideo, candidates: PublicVideo[]): PublicVideo[] {
  return candidates
    .filter(({ slug }) => slug !== current.slug)
    .map((video) => ({
      video,
      score:
        overlap(current.playlists, video.playlists) * 100
        + overlap(current.topics, video.topics) * 10
        + overlap(current.tags, video.tags),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      const dateOrder = Date.parse(right.video.publishedAt) - Date.parse(left.video.publishedAt)
      return dateOrder || left.video.slug.localeCompare(right.video.slug, 'vi')
    })
    .map(({ video }) => video)
}
