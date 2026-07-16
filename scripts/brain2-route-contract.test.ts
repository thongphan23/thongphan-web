import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

import { getBrain2LessonParams } from '../lib/brain2/lessons'
import { isExternalLessonHref, isInternalLessonHref } from '../lib/brain2/lesson-hrefs'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

const requiredFiles = [
  'app/brain2/21-ngay/page.tsx',
  'app/brain2/21-ngay/page.module.css',
  'app/brain2/21-ngay/[day]/page.tsx',
  'app/brain2/21-ngay/[day]/page.module.css',
  'components/brain2/Brain2Roadmap.tsx',
  'components/brain2/Brain2LessonDocument.tsx',
  'components/brain2/Brain2RichText.tsx',
  'components/brain2/Brain2PromptCopy.tsx',
  'components/brain2/Brain2Analytics.tsx',
  'components/brain2/Brain2ProtectedLesson.tsx',
  'components/brain2/Brain2.module.css',
]

test('canonical Brain2 hub and all 21 static lesson shells exist', () => {
  for (const path of requiredFiles) assert.ok(existsSync(new URL(path, root)), path)
  assert.equal(getBrain2LessonParams().length, 21)

  const route = read('app/brain2/21-ngay/[day]/page.tsx')
  assert.match(route, /export const dynamicParams = false/)
  assert.match(route, /generateStaticParams\(\)[\s\S]*getBrain2LessonParams/)
  assert.match(route, /if \(!meta\) notFound\(\)/)
  assert.match(route, /getPublicBrain2Lesson/)
  assert.match(route, /Brain2LessonDocument/)
  assert.match(route, /Brain2ProtectedLesson/)
})

test('hub states the truthful promise, access split and safe course data', () => {
  const page = read('app/brain2/21-ngay/page.tsx')
  const roadmap = read('components/brain2/Brain2Roadmap.tsx')

  assert.match(page, /21 ngày để biến những gì bạn đã sống thành một hệ thống có thể dùng lại/)
  assert.match(page, /Mỗi ngày một đầu ra; thời lượng thay đổi theo độ sâu của bài/)
  assert.match(page, /buildBrain2CourseStructuredData/)
  assert.match(page, /<JsonLd data=\{buildBrain2CourseStructuredData\(\)\}/)
  assert.match(page, /Brain2Roadmap/)
  assert.match(page, /brain2_hub_viewed/)
  assert.match(page, /https:\/\/www\.youtube\.com\/watch\?v=ubsOey-hDyg/)
  assert.match(page, /Buổi Kick-off Brain2 Challenge · Tháng 5\/2026/)
  assert.match(page, /target="_blank"/)
  assert.match(page, /rel="noopener noreferrer"/)
  assert.match(roadmap, /Miễn phí công khai/)
  assert.match(roadmap, /Dành cho Conan Maker/)
  assert.doesNotMatch(`${page}\n${roadmap}`, /15 phút\/ngày|workshop.*(?:đang|live)|chat với Brain2|truy cập vault/i)
})

test('public reader uses typed React rendering, secure links and explicit prompt copy', () => {
  const reader = read('components/brain2/Brain2LessonDocument.tsx')
  const richText = read('components/brain2/Brain2RichText.tsx')
  const prompt = read('components/brain2/Brain2PromptCopy.tsx')

  assert.match(reader, /lesson\.reason/)
  assert.match(reader, /lesson\.deliverable/)
  assert.match(reader, /lesson\.checklist/)
  assert.match(reader, /Brain2PromptCopy/)
  assert.match(reader, /brain2LessonHref/)
  assert.doesNotMatch(`${reader}\n${richText}\n${prompt}`, /dangerouslySetInnerHTML/)
  assert.match(richText, /rel="noopener noreferrer"/)
  assert.match(richText, /switch \(node\.type\)/)
  assert.match(richText, /isExternalLessonHref/)
  assert.match(richText, /isInternalLessonHref/)
  assert.match(richText, /throw new Error\(`Unsafe Brain2 lesson href/)
  assert.doesNotMatch(`${reader}\n${richText}`, /href\.startsWith\('https:\/\/'\)/)
  assert.match(prompt, /navigator\.clipboard\.writeText/)
  assert.match(prompt, /aria-live="polite"/)
  assert.match(prompt, /brain2_prompt_copied/)
})

test('render-time href classification rejects escape paths and accepts canonical links', () => {
  assert.equal(isExternalLessonHref('HTTPS://example.com/guide'), true)
  assert.equal(isInternalLessonHref('/brain2/21-ngay/ngay-02'), true)
  assert.equal(isInternalLessonHref('/\\evil.example/path'), false)
  assert.equal(isInternalLessonHref('//evil.example/path'), false)
  assert.equal(isInternalLessonHref('relative/path'), false)
})

test('analytics union is anonymous and protected shells import no static lesson body', () => {
  const analytics = read('components/brain2/Brain2Analytics.tsx')
  const locked = read('components/brain2/Brain2ProtectedLesson.tsx')
  const route = read('app/brain2/21-ngay/[day]/page.tsx')

  for (const event of [
    'brain2_hub_viewed',
    'brain2_lesson_opened',
    'brain2_access_gate_viewed',
    'brain2_access_granted',
    'brain2_access_failed',
    'brain2_prompt_copied',
    'brain2_lesson_completed',
    'brain2_conan_handoff_clicked',
  ]) assert.match(analytics, new RegExp(event))
  assert.doesNotMatch(analytics, /email|visitorId|userId|fingerprint/i)
  assert.match(locked, /meta\.preview/)
  assert.match(locked, /meta\.day === 21/)
  assert.match(locked, /Đừng giữ Brain2 như một kho lưu trữ/)
  assert.match(locked, /@\/lib\/brain2\/routes/)
  assert.doesNotMatch(locked, /@\/lib\/brain2\/lessons/)
  assert.match(locked, /meta\.day === 21[\s\S]*<Brain2ConanLink placement="day-21"/)
  assert.doesNotMatch(locked, /placement=\{meta\.day === 21 \? 'day-21' : 'hub'\}/)
  assert.doesNotMatch(locked, /getPublicBrain2Lesson|brain2-data\.generated|content\/brain2/i)
  assert.match(route, /robots:[\s\S]*index: meta\.access === 'public'[\s\S]*follow: true/)
})

test('Brain2 hub and reader preserve readable responsive and reduced-motion boundaries', () => {
  const shared = read('components/brain2/Brain2.module.css')
  const hub = read('app/brain2/21-ngay/page.module.css')
  const lesson = read('app/brain2/21-ngay/[day]/page.module.css')

  assert.match(shared, /min-height:\s*44px/)
  assert.match(shared, /max-width:\s*(?:68|70|72)ch/)
  assert.match(`${shared}\n${hub}\n${lesson}`, /@media\s*\(max-width:\s*(?:760|800)px\)/)
  assert.match(`${shared}\n${hub}\n${lesson}`, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  assert.doesNotMatch(`${shared}\n${hub}\n${lesson}`, /position:\s*sticky|overflow-x:\s*(?:scroll|auto)/)
})

test('week-boundary conclusions remain the final action in their lesson', () => {
  const reader = read('components/brain2/Brain2LessonDocument.tsx')
  const locked = read('components/brain2/Brain2ProtectedLesson.tsx')

  assert.ok(reader.indexOf('<LessonNavigation day={meta.day} />') < reader.indexOf('meta.day === 7'))
  assert.match(locked, /const navigation =/)
  assert.match(locked, /meta\.day === 21 \? navigation : null[\s\S]*className=\{styles\.lockedSheet\}/)
  assert.match(locked, /className=\{styles\.lockedSheet\}[\s\S]*meta\.day < 21 \? navigation : null/)
})
