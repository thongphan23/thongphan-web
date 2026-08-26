import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const slug = 'phan-tich-doi-thu-tim-insight-khach-hang'
const publicRoot = `public/ebook/${slug}`

test('ebook landing page exposes reading and PDF actions', async () => {
  const page = await readFile(new URL(`app/ebooks/${slug}/page.tsx`, root), 'utf8')
  assert.match(page, new RegExp(`/ebook/${slug}/read/`))
  assert.match(page, /\/downloads\/ebook-phan-tich-doi-thu-tim-insight-khach-hang\.pdf/)
  assert.match(page, /alternates:\s*\{ canonical: BASE_PATH \}/)
})

test('ebook reader is self-contained and uses local assets', async () => {
  const reader = await readFile(new URL(`${publicRoot}/read/index.html`, root), 'utf8')
  const refs = [
    ...reader.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g),
    ...reader.matchAll(/url\(['"]?(\.\/assets\/[^)'"]+)['"]?\)/g),
  ].map(([, ref]) => ref)

  assert.ok(refs.length >= 14, 'expected seven images and seven embedded font references')
  assert.doesNotMatch(reader, /\.\.\/assets\//)
  for (const ref of refs) await access(new URL(`${publicRoot}/read/${ref.slice(2)}`, root))
  await access(new URL('public/downloads/ebook-phan-tich-doi-thu-tim-insight-khach-hang.pdf', root))
  await access(new URL('public/images/ebooks/phan-tich-doi-thu-tim-insight-khach-hang-cover.jpg', root))
})

test('library and sitemap surface the ebook landing page', async () => {
  const [library, sitemap] = await Promise.all([
    readFile(new URL('app/library/page.tsx', root), 'utf8'),
    readFile(new URL('app/sitemap.ts', root), 'utf8'),
  ])
  assert.match(library, new RegExp(`/ebooks/${slug}`))
  assert.match(sitemap, new RegExp(`/ebooks/${slug}`))
})
