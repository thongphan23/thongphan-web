import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function source(path) {
  return readFile(new URL(path, root), 'utf8')
}

test('hub route exposes the approved promise, canonical, readiness and seven open routes', async () => {
  const [page, client] = await Promise.all([
    source('app/challenge/content-workflow-7days/page.tsx'),
    source('components/content-workflow/ChallengeHubClient.tsx'),
  ])
  const combined = `${page}\n${client}`

  assert.match(page, /7 ngày tự xây quy trình \(workflow\) đầu tiên/)
  assert.match(page, /alternates:\s*\{ canonical: ['"]\/challenge\/content-workflow-7days['"] \}/)
  assert.match(combined, /Tự xây một workflow content có thể chạy lại/)
  for (const key of ['outcome', 'materials', 'aiAccess', 'time']) assert.match(client, new RegExp(`['"]${key}['"]`))
  assert.match(combined, /chưa cần bằng chứng khách hàng/i)
  assert.match(combined, /45–60 phút/)
  assert.match(combined, /20–30 phút.*tùy chọn/)
  assert.match(page, /Bản mô tả workflow/)
  assert.match(page, /Bản thiết kế chuyển giao/)
  assert.match(page, /CONTENT_WORKFLOW_DAYS\.map/)
  assert.match(page, /content-workflow-7days\/\$\{lesson\.slug\}/)
  assert.equal((page.match(/<h1\b/g) ?? []).length, 1)
  assert.doesNotMatch(combined, /pricing|countdown|testimonial|15 triệu|18 triệu/i)
})

test('lesson route statically publishes all seven unique canonical pages', async () => {
  const page = await source('app/challenge/content-workflow-7days/[day]/page.tsx')
  assert.match(page, /generateStaticParams/)
  assert.match(page, /generateMetadata/)
  assert.match(page, /notFound\(\)/)
  assert.match(page, /CONTENT_WORKFLOW_DAYS/)
  assert.match(page, /alternates:\s*\{ canonical/)
  assert.match(page, /<ChallengeWorkbench/)
})

test('workbench keeps workbook local, labels controls and provides accessible failure paths', async () => {
  const [component, editor, resources, css] = await Promise.all([
    source('components/content-workflow/ChallengeWorkbench.tsx'),
    source('components/content-workflow/ArtifactEditor.tsx'),
    source('components/content-workflow/LearningResources.tsx'),
    source('components/content-workflow/ContentWorkflow.module.css'),
  ])
  const combined = `${component}\n${editor}\n${resources}`
  assert.doesNotMatch(combined, /dangerouslySetInnerHTML|\bfetch\s*\(|XMLHttpRequest|sendBeacon/)
  assert.match(editor, /<label/)
  assert.match(editor, /aria-describedby/)
  assert.match(component, /aria-live/)
  assert.match(component, /role="alert"/)
  assert.match(combined, /navigator\.clipboard\.writeText/)
  assert.match(component, /buildStarterKitMarkdown/)
  assert.match(component, /clearChallengeState/)
  assert.match(component, /<dialog/)
  assert.match(component, /lesson\.theory/)
  assert.match(component, /lesson\.misconceptions/)
  assert.match(component, /lesson\.aiLab/)
  assert.match(component, /<LearningResources/)
  assert.match(component, /<ArtifactEditor/)
  assert.match(editor, /assembleRunnableWorkflow/)
  assert.match(resources, /DAY_RESOURCES/)
  assert.match(resources, /Sao chép tài nguyên/)
  assert.match(css, /min-height:\s*44px/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /@media \(max-width:\s*720px\)/)
})

test('sitemap contains the public hub and derives every lesson route', async () => {
  const body = await source('app/sitemap.ts')
  assert.match(body, /['"]\/challenge\/content-workflow-7days['"]/)
  assert.match(body, /Array\.from\(\{ length: 7 \}/)
  assert.match(body, /day-\$\{String\(index \+ 1\)\.padStart\(2, ['"]0['"]\)\}/)
  assert.match(body, /CONTENT_WORKFLOW_RELEASE_DATE = ['"]2026-08-08['"]/)
})

test('owned generated fieldbook asset is present in the project', async () => {
  await assert.doesNotReject(access(new URL('public/images/challenges/content-workflow-7days-fieldbook.webp', root)))
})
