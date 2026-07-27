import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('/read preserves the approved question, choices, privacy notice, states, and inspector link', async () => {
  const [page, workspace] = await Promise.all([
    readFile(new URL('../app/read/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/reader-loop/ReaderLoopWorkspace.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(page, /robots:\s*\{\s*index:\s*false/)
  assert.match(workspace, /Hiện tại anh\/chị đang muốn giải quyết điều gì nhất\?/)
  assert.match(workspace, /SAMPLE_QUESTIONS\.map/)
  assert.match(workspace, /Câu hỏi khác/)
  assert.match(workspace, /Chỉ lưu một mã ẩn danh/)
  assert.match(workspace, /Đang nối lại mạch đọc/)
  assert.match(workspace, /Không thể tải đề xuất/)
  assert.match(workspace, /Chưa có mạch đọc nào/)
  assert.match(workspace, /\/read\/inspector/)
})

test('canonical living-note body owns reading evidence and completion UI without duplicating content', async () => {
  const [article, panel] = await Promise.all([
    readFile(new URL('../app/library/[slug]/LibraryArticle.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../components/reader-loop/ReaderLoopArticlePanel.tsx', import.meta.url), 'utf8'),
  ])

  assert.match(article, /<ReaderLoopArticlePanel/)
  assert.match(article, /dangerouslySetInnerHTML=\{\{ __html: note\.contentHtml \}\}/)
  assert.match(panel, /Điều quan trọng nhất rút ra/)
  assert.match(panel, /Bước dự định làm tiếp/)
  assert.match(panel, /Đánh dấu đã đọc xong/)
  assert.match(panel, /sections_seen/)
  assert.doesNotMatch(panel, /mouse(move|coordinates)|keystroke|fingerprint|ip_address/i)
})

test('preview-only inspector renders the complete evidence-to-decision chain', async () => {
  const inspector = await readFile(new URL('../components/reader-loop/ReaderLoopInspector.tsx', import.meta.url), 'utf8')
  for (const label of [
    'Question', 'Candidate recommendations', 'Selected recommendation', 'Reason codes',
    'Reading evidence', 'Manual completion', 'Reflection', 'Next-action decision',
  ]) assert.match(inspector, new RegExp(label))
})
