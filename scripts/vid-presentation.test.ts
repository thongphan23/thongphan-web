import assert from 'node:assert/strict'
import test from 'node:test'
import { compactVideoTitle } from '../lib/vid/presentation'

test('compactVideoTitle removes duplicated source title and visible attribution', () => {
  assert.equal(
    compactVideoTitle({
      title: 'Nguyên tắc ứng phó với trật tự thế giới đang thay đổi - Theo Ray Dalio (Principles for Dealing with the Changing World Order by Ray Dalio)',
      sourceTitle: 'Principles for Dealing with the Changing World Order by Ray Dalio',
    }),
    'Nguyên tắc ứng phó với trật tự thế giới đang thay đổi',
  )
})

test('compactVideoTitle preserves a meaningful parenthetical that is not the source title', () => {
  assert.equal(
    compactVideoTitle({
      title: 'Tư duy hệ thống (bản dành cho người mới)',
      sourceTitle: 'Systems Thinking',
    }),
    'Tư duy hệ thống (bản dành cho người mới)',
  )
})

test('compactVideoTitle shortens an unstructured title at a word boundary', () => {
  assert.equal(
    compactVideoTitle({
      title: 'Một tiêu đề rất dài không có cấu trúc lặp lại nhưng vẫn cần được trình bày thật gọn gàng để không phá vỡ bố cục của trang video',
      sourceTitle: 'A different source title',
    }),
    'Một tiêu đề rất dài không có cấu trúc lặp lại nhưng vẫn cần được trình bày thật gọn…',
  )
})

