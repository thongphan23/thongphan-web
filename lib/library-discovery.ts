import type { PostMeta } from './blog'
import type { LibraryNoteMeta } from './library'
import type {
  ReadingDurationBand,
  ReadingIntent,
  ReadingSummary,
} from './readings'

export const DISCOVERY_PARAM_KEYS = ['q', 'type', 'topic', 'duration', 'intent'] as const

export type LibraryEntryType = 'reading' | 'post' | 'note'
export type LibraryEntryDuration = ReadingDurationBand
export type LibraryEntryIntent = ReadingIntent

export interface LibraryEntrySummary {
  type: LibraryEntryType
  slug: string
  href: string
  title: string
  description: string
  promise: string
  author: string
  source?: string
  minutes: number
  duration: LibraryEntryDuration
  intent: LibraryEntryIntent
  topics: string[]
  publishedAt?: string
  updatedAt?: string
  image?: string
}

export interface LibraryDiscoveryState {
  q: string
  type: LibraryEntryType | ''
  topic: string
  duration: LibraryEntryDuration | ''
  intent: LibraryEntryIntent | ''
}

const ENTRY_TYPES = new Set<LibraryEntryType>(['reading', 'post', 'note'])
const DURATION_BANDS = new Set<LibraryEntryDuration>(['under-10', '10-20', 'over-20'])
const INTENTS = new Set<LibraryEntryIntent>(['clarity', 'taste', 'asset'])

const TOPIC_ALIASES: Readonly<Record<string, string>> = {
  'digital-assets': 'tai-san-so',
  expertise: 'chuyen-mon',
}

const TOPIC_LABELS: Readonly<Record<string, string>> = {
  '21-days': 'Thử thách 21 ngày',
  ai: 'AI',
  'ai-fear': 'Nỗi sợ AI',
  'ai-system': 'Hệ thống AI',
  audit: 'Rà soát',
  brain2: 'Brain2',
  'cam-xuc': 'Cảm xúc',
  'chinh-tri': 'Chính trị',
  'chuyen-mon': 'Chuyên môn',
  clarity: 'Sáng tỏ',
  conan: 'Conan',
  content: 'Nội dung',
  'content-pattern': 'Mẫu nội dung',
  'dao-duc': 'Đạo đức',
  data: 'Dữ liệu',
  failure: 'Thất bại',
  'giong-rieng': 'Giọng riêng',
  'global-development': 'Phát triển toàn cầu',
  'hanh-phuc': 'Hạnh phúc',
  'he-gia-tri': 'Hệ giá trị',
  hook: 'Câu mở đầu',
  'khiem-nhuong': 'Khiêm nhường',
  'khung-nhin': 'Khung nhìn',
  'knowledge-os': 'Hệ tri thức',
  map: 'Bản đồ',
  'market-data': 'Dữ liệu thị trường',
  marketing: 'Marketing',
  mortality: 'Cái chết',
  'nghe-thuat': 'Nghệ thuật',
  'noi-tam': 'Nội tâm',
  notes: 'Ghi chú',
  obsidian: 'Obsidian',
  'personal-brand': 'Thương hiệu cá nhân',
  'phan-doan': 'Phán đoán',
  pluralism: 'Đa nguyên',
  positioning: 'Định vị',
  proof: 'Bằng chứng',
  'reading-path': 'Lộ trình đọc',
  reframing: 'Đổi khung nhìn',
  revenue: 'Doanh thu',
  'sang-tao': 'Sáng tạo',
  'scout-mindset': 'Tư duy trinh sát',
  'state-change': 'Chuyển trạng thái',
  structure: 'Cấu trúc',
  taste: 'Gu thẩm định',
  'tai-san-so': 'Tài sản số',
  template: 'Mẫu dùng lại',
  'thien-kien': 'Thiên kiến',
  'ton-giao': 'Tôn giáo',
  trust: 'Niềm tin',
  'truyen-thong': 'Truyền thông',
  viral: 'Lan truyền',
  work: 'Công việc',
  worldview: 'Thế giới quan',
  writing: 'Viết',
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))]
    .sort((a, b) => a.localeCompare(b, 'vi'))
}

export function canonicalTopic(topic: string): string {
  const normalized = topic.trim()
  return TOPIC_ALIASES[normalized] ?? normalized
}

function normalizeTopics(values: Array<string | undefined>): string[] {
  return uniqueSorted(values.map((value) => (value ? canonicalTopic(value) : value)))
}

function intentForPost(post: PostMeta): LibraryEntryIntent {
  if (
    post.readerState === 'Kiểm soát' ||
    ['Content kéo khách', 'Tài sản số', 'Conan'].includes(post.journey ?? '')
  ) {
    return 'asset'
  }

  return 'clarity'
}

function intentForNote(note: LibraryNoteMeta): LibraryEntryIntent {
  if (
    note.readerState === 'kiem-soat' ||
    ['content-keo-khach', 'tai-san-so', 'conan'].includes(note.journey)
  ) {
    return 'asset'
  }

  if (['materials', 'patterns', 'proof'].includes(note.section)) return 'taste'
  return 'clarity'
}

export function durationBandForMinutes(minutes: number): LibraryEntryDuration {
  if (minutes < 10) return 'under-10'
  if (minutes <= 20) return '10-20'
  return 'over-20'
}

export function adaptReadingSummary(reading: ReadingSummary): LibraryEntrySummary {
  return {
    type: 'reading',
    slug: reading.slug,
    href: reading.readingPath,
    title: reading.title,
    description: reading.description,
    promise: reading.whyRead ?? reading.description,
    author: reading.author,
    source: reading.source,
    minutes: reading.minutes,
    duration: reading.durationBand,
    intent: reading.intent,
    topics: normalizeTopics(reading.topics),
    publishedAt: reading.sourcePublishedAt ?? undefined,
    updatedAt: reading.lastReviewedAt,
  }
}

export function adaptBlogPost(post: PostMeta): LibraryEntrySummary {
  return {
    type: 'post',
    slug: post.slug,
    href: `/blog/${post.slug}`,
    title: post.title,
    description: post.description,
    promise: post.promise ?? post.description,
    author: 'Thông Phan',
    source: 'Bài của Thông',
    minutes: post.calculatedReadingTime,
    duration: durationBandForMinutes(post.calculatedReadingTime),
    intent: intentForPost(post),
    topics: normalizeTopics(post.tags ?? []),
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? post.publishedAt,
    image: post.coverImage,
  }
}

export function adaptLivingNote(note: LibraryNoteMeta): LibraryEntrySummary {
  return {
    type: 'note',
    slug: note.slug,
    href: `/library/${note.slug}`,
    title: note.title,
    description: note.description,
    promise: note.promise,
    author: note.author,
    source: 'Ghi chú sống',
    minutes: note.readTime,
    duration: durationBandForMinutes(note.readTime),
    intent: intentForNote(note),
    topics: normalizeTopics(note.tags),
    publishedAt: note.publishedAt,
    updatedAt: note.updatedAt,
  }
}

export function parseDiscoveryParams(params: URLSearchParams): LibraryDiscoveryState {
  const type = params.get('type') ?? ''
  const duration = params.get('duration') ?? ''
  const intent = params.get('intent') ?? ''

  return {
    q: (params.get('q') ?? '').trim(),
    type: ENTRY_TYPES.has(type as LibraryEntryType) ? (type as LibraryEntryType) : '',
    topic: canonicalTopic(params.get('topic') ?? ''),
    duration: DURATION_BANDS.has(duration as LibraryEntryDuration)
      ? (duration as LibraryEntryDuration)
      : '',
    intent: INTENTS.has(intent as LibraryEntryIntent) ? (intent as LibraryEntryIntent) : '',
  }
}

export function serializeDiscoveryParams(state: LibraryDiscoveryState): URLSearchParams {
  const params = new URLSearchParams()

  for (const key of DISCOVERY_PARAM_KEYS) {
    const value = state[key].trim()
    if (value) params.set(key, value)
  }

  return params
}

export function mergeDiscoveryState<Key extends keyof LibraryDiscoveryState>(
  state: LibraryDiscoveryState,
  key: Key,
  value: LibraryDiscoveryState[Key],
): LibraryDiscoveryState {
  return { ...state, [key]: value }
}

export function clearDiscoveryParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  for (const key of DISCOVERY_PARAM_KEYS) next.delete(key)
  return next
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[đĐ]/g, 'd')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('vi')
}

export function filterLibraryEntries(
  entries: LibraryEntrySummary[],
  state: LibraryDiscoveryState,
): LibraryEntrySummary[] {
  const queryTokens = normalizeSearchValue(state.q).split(/\s+/).filter(Boolean)

  return entries.filter((entry) => {
    if (state.type && entry.type !== state.type) return false
    if (state.topic && !entry.topics.includes(canonicalTopic(state.topic))) return false
    if (state.duration && entry.duration !== state.duration) return false
    if (state.intent && entry.intent !== state.intent) return false

    const searchable = normalizeSearchValue(
      [
        entry.title,
        entry.description,
        entry.promise,
        entry.author,
        entry.source,
        ...entry.topics,
      ].filter(Boolean).join(' '),
    )

    return queryTokens.every((token) => searchable.includes(token))
  })
}

export function topicLabel(topic: string): string {
  const canonical = canonicalTopic(topic)
  const label = TOPIC_LABELS[canonical]
  if (!label) throw new Error(`Missing approved topic label: ${topic}`)
  return label
}

export function getDiscoveryTopics(entries: LibraryEntrySummary[]) {
  return normalizeTopics(entries.flatMap((entry) => entry.topics)).map((value) => ({
    value,
    label: topicLabel(value),
  }))
}
