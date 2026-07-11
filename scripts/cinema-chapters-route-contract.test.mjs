import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')

const routes = [
  ['app/library/page.tsx', 'library', 'paper'],
  ['app/library/read/page.tsx', 'reader', 'paper'],
  ['app/library/[slug]/LibraryArticle.tsx', 'reader', 'paper'],
  ['app/library/read/[slug]/page.tsx', 'reader', 'paper'],
  ['app/assets/page.tsx', 'assets', 'dark'],
  ['app/assets/[slug]/page.tsx', 'asset-detail', 'dark'],
  ['app/challenges/page.tsx', 'challenges', 'dark'],
  ['app/challenges/[slug]/page.tsx', 'challenge-detail', 'dark'],
  ['app/blog/page.tsx', 'blog', 'paper'],
  ['app/blog/[slug]/BlogArticle.tsx', 'blog-detail', 'paper'],
]

test('every high-value subpage closes with its contextual Cinema chapter handoff', () => {
  for (const [path, journeyKey, tone] of routes) {
    const source = read(path)
    assert.match(source, /import ChapterHandoff from '@\/components\/journey\/ChapterHandoff'/, path)
    assert.match(
      source,
      new RegExp(`<ChapterHandoff\\s+journeyKey=["']${journeyKey}["']\\s+tone=["']${tone}["']`),
      path,
    )
  }
})

test('asset detail uses the canonical standalone Conan bridge', () => {
  const source = read('app/assets/[slug]/page.tsx')
  assert.doesNotMatch(source, /https:\/\/com\.conan\.school/)
  assert.match(source, /href="\/conanmaker\/"/)
})

test('library starts from three concrete visitor states', () => {
  const source = read('app/library/page.tsx')
  assert.match(source, /aria-labelledby="current-state-title"/)
  assert.match(source, /Làm rõ điều đang vướng[\s\S]*href="\/diagnostic"/)
  assert.match(source, /Biến chuyên môn thành đầu ra[\s\S]*href="\/assets"/)
  assert.match(source, /Bắt đầu một nhịp thực hành[\s\S]*href="\/challenges\/brain2-21-ngay"/)
})
