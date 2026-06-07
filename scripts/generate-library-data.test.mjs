import assert from 'node:assert/strict'
import test from 'node:test'

import {
  flattenRelatedLinks,
  validateLibraryNote,
} from './generate-library-data.mjs'

test('validateLibraryNote accepts a note with required frontmatter and typed links', () => {
  const note = {
    slug: 'sang-to-giua-hon-loan-ai',
    title: 'Sáng tỏ giữa hỗn loạn AI',
    description: 'Một note mẫu',
    section: 'concepts',
    type: 'concept',
    journey: 'so-ai',
    readerState: 'sang-to',
    status: 'evergreen',
    author: 'Thông Phan',
    publishedAt: '2026-05-21',
    updatedAt: '2026-05-21',
    readTime: 7,
    promise: 'Đọc xong thấy rõ bước tiếp theo.',
    proof: 'Brain2 đang chạy thật.',
    sourceTrace: ['Brain2'],
    related: {
      supports: ['tai-san-so-cua-nguoi-co-chuyen-mon'],
      examples: ['14-thang-flop-la-nguyen-lieu'],
      next: ['ban-do-bat-dau-neu-anh-em-dang-so-ai'],
    },
    tags: ['brain2'],
  }

  assert.deepEqual(validateLibraryNote(note), [])
  assert.deepEqual(flattenRelatedLinks(note.related), [
    { relation: 'supports', slug: 'tai-san-so-cua-nguoi-co-chuyen-mon' },
    { relation: 'examples', slug: '14-thang-flop-la-nguyen-lieu' },
    { relation: 'next', slug: 'ban-do-bat-dau-neu-anh-em-dang-so-ai' },
  ])
})

test('validateLibraryNote rejects notes without at least three typed content links', () => {
  const errors = validateLibraryNote({
    slug: 'thin-note',
    title: 'Thin note',
    description: 'Missing links',
    section: 'concepts',
    type: 'concept',
    journey: 'so-ai',
    readerState: 'sang-to',
    status: 'seed',
    author: 'Thông Phan',
    publishedAt: '2026-05-21',
    updatedAt: '2026-05-21',
    readTime: 1,
    promise: 'Promise',
    proof: 'Proof',
    sourceTrace: ['Brain2'],
    related: {
      supports: ['one-link'],
    },
    tags: ['brain2'],
  })

  assert.ok(errors.some((error) => error.includes('at least 3 related links')))
})
