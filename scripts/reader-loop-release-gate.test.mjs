import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')

test('Reader Loop is fail-closed unless an explicit preview build enables it', async () => {
  const [release, readPage, inspectorPage, article, client, buildGate] = await Promise.all([
    read('lib/reader-loop/release.ts'),
    read('app/read/page.tsx'),
    read('app/read/inspector/page.tsx'),
    read('app/library/[slug]/LibraryArticle.tsx'),
    read('lib/reader-loop/client.ts'),
    read('scripts/reader-loop-release-build-gate.mjs'),
  ])

  assert.match(release, /NEXT_PUBLIC_READER_LOOP_PREVIEW_ENABLED/)
  assert.match(release, /=== 'true'/)
  assert.match(readPage, /if \(!readerLoopPreviewEnabled\) notFound\(\)/)
  assert.match(inspectorPage, /if \(!readerLoopPreviewEnabled\) notFound\(\)/)
  assert.match(article, /readerLoopPreviewEnabled\s*\?\s*<ReaderLoopArticlePanel/)
  assert.doesNotMatch(client, /127\.0\.0\.1:8787|localhost:8787/)
  assert.match(client, /READER_LOOP_PREVIEW_DISABLED|READER_LOOP_API_ORIGIN_MISSING/)
  assert.match(buildGate, /finally\s*\{[\s\S]*runBuild\(false\)/)
  assert.match(buildGate, /Final Reader Loop artifact is production-disabled/)
})
