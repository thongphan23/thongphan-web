import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DISCOVERY_PARAM_KEYS,
  adaptBlogPost,
  adaptLivingNote,
  adaptReadingSummary,
  clearDiscoveryParams,
  durationBandForMinutes,
  filterLibraryEntries,
  getDiscoveryTopics,
  parseDiscoveryParams,
  serializeDiscoveryParams,
} from '../lib/library-discovery'

const reading = {
  slug: 'steve-jobs-2005-stanford-commencement-address',
  title: 'Hãy tìm điều bạn yêu',
  description: 'Ba câu chuyện về những lựa chọn quan trọng.',
  author: 'Steve Jobs',
  source: 'Stanford University',
  sourceUrl: 'https://news.stanford.edu/stories/2005/06/youve-got-find-love-jobs-says',
  sourcePublishedAt: null,
  translator: null,
  editor: null,
  translatedAt: null,
  lastReviewedAt: '2026-07-10',
  rightsStatus: 'source-link-only' as const,
  minutes: 24,
  topics: ['cam-xuc', 'noi-tam'],
  intent: 'clarity' as const,
  durationBand: 'over-20' as const,
  readingPath: '/library/read/steve-jobs-2005-stanford-commencement-address',
  whyRead: 'Đọc để nhìn rõ điều đáng theo đuổi.',
  contentChecksum: 'sha256:reading',
  contentVersion: 1,
}

const post = {
  slug: 'xay-brain2-voi-obsidian',
  title: 'Xây Brain2 với Obsidian',
  description: 'Một hệ để tri thức sống lại khi cần.',
  category: 'brain2',
  tags: ['brain2', 'obsidian'],
  journey: 'Brain2',
  readerState: 'Sáng tỏ',
  promise: 'Đọc xong biết vì sao cần một Brain2.',
  publishedAt: '2026-04-28',
  updatedAt: '2026-05-21',
  calculatedReadingTime: 8,
  coverImage: '/images/blog/cover-brain2-obsidian.png',
}

const note = {
  slug: 'tai-san-so-cua-nguoi-co-chuyen-mon',
  title: 'Tài sản số của người có chuyên môn',
  description: 'Biến điều đã biết thành thứ có thể tích lũy.',
  section: 'concepts' as const,
  type: 'concept' as const,
  journey: 'tai-san-so' as const,
  readerState: 'kiem-soat' as const,
  status: 'evergreen' as const,
  author: 'Thông Phan',
  publishedAt: '2026-05-21',
  updatedAt: '2026-05-21',
  readTime: 9,
  calculatedReadTime: 8,
  promise: 'Đọc xong thấy một bước đóng gói cụ thể.',
  proof: 'Một bằng chứng chỉ tồn tại trong server metadata.',
  sourceTrace: ['Brain2'],
  related: {},
  relatedLinks: [],
  tags: ['tai-san-so', 'chuyen-mon'],
}

test('three adapters create one summary contract without body or rights-pending media fields', () => {
  const entries = [
    adaptReadingSummary(reading),
    adaptBlogPost(post),
    adaptLivingNote(note),
  ]

  assert.deepEqual(entries.map(({ type, href }) => ({ type, href })), [
    {
      type: 'reading',
      href: '/library/read/steve-jobs-2005-stanford-commencement-address',
    },
    { type: 'post', href: '/blog/xay-brain2-voi-obsidian' },
    { type: 'note', href: '/library/tai-san-so-cua-nguoi-co-chuyen-mon' },
  ])
  assert.deepEqual(entries.map(({ duration }) => duration), ['over-20', 'under-10', 'under-10'])
  assert.deepEqual(entries.map(({ intent }) => intent), ['clarity', 'clarity', 'asset'])

  const serialized = JSON.stringify(entries)
  for (const privateField of ['contentHtml', 'sections', 'images', 'audio', 'sourceTrace', 'proof']) {
    assert.doesNotMatch(serialized, new RegExp(`"${privateField}"`))
  }
})

test('discovery params are exactly q, type, topic, duration, and intent', () => {
  assert.deepEqual(DISCOVERY_PARAM_KEYS, ['q', 'type', 'topic', 'duration', 'intent'])

  const parsed = parseDiscoveryParams(
    new URLSearchParams('q=%20Brain2%20&type=post&topic=obsidian&duration=under-10&intent=clarity'),
  )
  assert.deepEqual(parsed, {
    q: 'Brain2',
    type: 'post',
    topic: 'obsidian',
    duration: 'under-10',
    intent: 'clarity',
  })

  assert.deepEqual(
    parseDiscoveryParams(new URLSearchParams('type=private&duration=fast&intent=sell')),
    { q: '', type: '', topic: '', duration: '', intent: '' },
  )
  assert.equal(
    serializeDiscoveryParams(parsed).toString(),
    'q=Brain2&type=post&topic=obsidian&duration=under-10&intent=clarity',
  )

  const cleared = clearDiscoveryParams(
    new URLSearchParams('keep=1&q=Brain2&type=post&topic=obsidian&duration=under-10&intent=clarity'),
  )
  assert.equal(cleared.toString(), 'keep=1')
})

test('query and four filter groups compose deterministically', () => {
  const entries = [adaptReadingSummary(reading), adaptBlogPost(post), adaptLivingNote(note)]

  assert.deepEqual(
    filterLibraryEntries(entries, {
      q: 'tìm điều yêu',
      type: 'reading',
      topic: 'cam-xuc',
      duration: 'over-20',
      intent: 'clarity',
    }).map(({ slug }) => slug),
    ['steve-jobs-2005-stanford-commencement-address'],
  )
  assert.deepEqual(
    filterLibraryEntries(entries, {
      q: 'chuyen mon',
      type: '',
      topic: '',
      duration: '',
      intent: 'asset',
    }).map(({ slug }) => slug),
    ['tai-san-so-cua-nguoi-co-chuyen-mon'],
  )
  assert.deepEqual(
    getDiscoveryTopics(entries).map(({ value }) => value),
    ['brain2', 'cam-xuc', 'chuyen-mon', 'noi-tam', 'obsidian', 'tai-san-so'],
  )
})

test('duration bands have stable inclusive boundaries', () => {
  assert.equal(durationBandForMinutes(9), 'under-10')
  assert.equal(durationBandForMinutes(10), '10-20')
  assert.equal(durationBandForMinutes(20), '10-20')
  assert.equal(durationBandForMinutes(21), 'over-20')
})
