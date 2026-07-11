import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readOut = (path) => readFileSync(new URL(`../out/${path}`, import.meta.url), 'utf8')

test('production export keeps every Learn entry fail-closed and unindexed', () => {
  for (const path of [
    'learn.html',
    'learn/free.html',
    'learn/diagnostic.html',
    'learn/courses/ai-foundation.html',
    'learn/courses/prompt-thinking.html',
    'learn/courses/evaluate-verify.html',
  ]) {
    const html = readOut(path)
    const head = html.slice(0, html.indexOf('</head>'))
    assert.match(html, /<meta name="robots" content="noindex"/)
    assert.match(html, /404/)
    assert.doesNotMatch(head, /thongphan\.com\/learn|Học AI để làm việc tốt hơn|AI Foundation miễn phí toàn bộ/)
  }

  assert.doesNotMatch(readOut('sitemap.xml'), /<loc>https:\/\/thongphan\.com\/learn/)
})
