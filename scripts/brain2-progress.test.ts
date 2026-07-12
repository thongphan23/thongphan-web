import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

import type {
  Brain2LessonBlock,
  Brain2LessonMeta,
  Brain2LessonPackage,
  RichTextNode,
} from '../lib/brain2/lesson-contract'
import {
  brain2LessonContentSha256,
  validateBrain2LessonPackage,
} from '../lib/brain2/lesson-validation'
import {
  BRAIN2_PROGRESS_STORAGE_KEY,
  markBrain2LessonComplete,
  nextBrain2Lesson,
  readBrain2Progress,
  recordBrain2LessonOpened,
  setBrain2ProtectedLessonLoaded,
} from '../lib/brain2/progress'
import { contentSha256 as nodeContentSha256 } from './brain2-normalize.mjs'

class MemoryStorage implements Storage {
  #values = new Map<string, string>()
  get length() { return this.#values.size }
  clear() { this.#values.clear() }
  getItem(key: string) { return this.#values.get(key) ?? null }
  key(index: number) { return [...this.#values.keys()][index] ?? null }
  removeItem(key: string) { this.#values.delete(key) }
  setItem(key: string, value: string) { this.#values.set(key, value) }
}

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

function installStorage(storage = new MemoryStorage()) {
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage })
  return storage
}

type ProtectedLessonBody = Pick<Brain2LessonPackage, 'reason' | 'blocks' | 'deliverable' | 'checklist'>

const protectedBody = (): ProtectedLessonBody => ({
  reason: 'Một lý do đủ rõ để thực hành ngày này.',
  blocks: [
    {
      id: 'day-08-block-01',
      kind: 'prose',
      heading: 'Đọc kỹ',
      children: [
        { type: 'text', value: 'Nội dung ' },
        { type: 'strong', children: [{ type: 'text', value: 'quan trọng' }] },
        { type: 'text', value: ' với ' },
        { type: 'em', children: [{ type: 'text', value: 'nhấn nhẹ' }] },
        { type: 'text', value: ' và ' },
        { type: 'code', children: [{ type: 'text', value: 'mẫu' }] },
        { type: 'break' },
        { type: 'link', href: 'https://example.com/guide', children: [{ type: 'text', value: 'nguồn ngoài' }] },
        { type: 'text', value: ' hoặc ' },
        { type: 'link', href: '/brain2/21-ngay/ngay-09', children: [{ type: 'text', value: 'ngày tiếp theo' }] },
      ],
    },
    {
      id: 'day-08-block-02',
      kind: 'list',
      ordered: true,
      items: [[{ type: 'text', value: 'Bước một' }], [{ type: 'text', value: 'Bước hai' }]],
    },
    {
      id: 'day-08-block-03',
      kind: 'callout',
      tone: 'principle',
      title: 'Nguyên tắc',
      children: [{ type: 'text', value: 'Giữ đầu ra quan sát được.' }],
    },
    { id: 'day-08-block-04', kind: 'prompt', label: 'Mẫu làm việc', text: 'Hãy tạo một đầu ra.' },
    {
      id: 'day-08-block-05',
      kind: 'resources',
      title: 'Tài nguyên',
      items: [
        { title: 'Nguồn ngoài', href: 'HTTPS://example.com/resource', note: 'Đọc phần đầu.' },
        { title: 'Nguồn nội bộ', href: '/brain2/21-ngay/ngay-09' },
      ],
    },
    {
      id: 'day-08-block-06',
      kind: 'deliverable',
      title: 'Đầu ra',
      children: [{ type: 'text', value: 'Một bản nháp có thể dùng lại.' }],
    },
  ] satisfies Brain2LessonBlock[],
  deliverable: {
    title: 'Một bản nháp hoàn chỉnh',
    body: [{ type: 'text', value: 'Bản nháp gắn với một công việc thật.' }] satisfies RichTextNode[],
  },
  checklist: [
    { id: 'ngay-08-check-01', label: 'Đã tạo bản nháp' },
    { id: 'ngay-08-check-02', label: 'Đã chọn việc tiếp theo' },
  ],
})

function protectedMeta(contentSha256: string): Brain2LessonMeta {
  return {
    schemaVersion: 1,
    day: 8,
    slug: 'ngay-08',
    week: 2,
    access: 'conan-maker',
    title: 'Ngày tám',
    promise: 'Tạo một đầu ra có thể dùng lại.',
    objective: 'Hoàn thành một bản nháp.',
    estimatedMinutes: { min: 20, max: 40 },
    preview: 'Bắt đầu từ một công việc thật.',
    sourceFragmentSha256: 'a'.repeat(64),
    contentSha256,
    migratedAt: '2026-07-12T00:00:00.000Z',
    editorialState: 'reviewed',
  }
}

function sealProtectedBody(body = protectedBody()) {
  const contentSha256 = nodeContentSha256(body)
  const meta = protectedMeta(contentSha256)
  return {
    meta,
    lesson: { meta: { ...meta }, ...body } as Brain2LessonPackage,
  }
}

test('browser validator accepts the exact protected package and matches the migration checksum contract', async () => {
  const { lesson, meta } = sealProtectedBody()

  assert.equal(await brain2LessonContentSha256(lesson), nodeContentSha256(lesson))
  assert.deepEqual(await validateBrain2LessonPackage(lesson, meta), lesson)
})

test('browser validator rejects malformed packages before they can reach the renderer', async (t) => {
  await t.test('unknown top-level field', async () => {
    const { lesson, meta } = sealProtectedBody()
    const candidate = { ...lesson, leaked: 'field' }
    assert.equal(await validateBrain2LessonPackage(candidate, meta), null)
  })

  await t.test('metadata mismatch against the static shell', async () => {
    const { lesson, meta } = sealProtectedBody()
    lesson.meta = { ...lesson.meta, title: 'Tiêu đề từ phản hồi cũ' }
    assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
  })

  await t.test('unknown block field with a matching body checksum', async () => {
    const body = protectedBody()
    body.blocks[0] = { ...body.blocks[0], leaked: true } as unknown as Brain2LessonBlock
    const { lesson, meta } = sealProtectedBody(body)
    assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
  })

  await t.test('unknown rich-text node with a matching body checksum', async () => {
    const body = protectedBody()
    body.deliverable.body = [{ type: 'html', value: '<img>' }] as unknown as RichTextNode[]
    const { lesson, meta } = sealProtectedBody(body)
    assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
  })

  await t.test('unsafe rich-text and resource links with matching body checksums', async () => {
    for (const mutate of [
      (body: ReturnType<typeof protectedBody>) => {
        body.deliverable.body = [{ type: 'link', href: 'javascript:alert(1)', children: [{ type: 'text', value: 'Mở' }] }]
      },
      (body: ReturnType<typeof protectedBody>) => {
        const resources = body.blocks.find((block) => block.kind === 'resources')
        if (resources?.kind === 'resources') resources.items[0].href = '//evil.example/path'
      },
    ]) {
      const body = protectedBody()
      mutate(body)
      const { lesson, meta } = sealProtectedBody(body)
      assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
    }
  })

  await t.test('duplicate block and checklist IDs with matching body checksums', async () => {
    for (const mutate of [
      (body: ReturnType<typeof protectedBody>) => { body.blocks[1].id = body.blocks[0].id },
      (body: ReturnType<typeof protectedBody>) => { body.checklist[1].id = body.checklist[0].id },
    ]) {
      const body = protectedBody()
      mutate(body)
      const { lesson, meta } = sealProtectedBody(body)
      assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
    }
  })

  await t.test('body checksum mismatch', async () => {
    const { lesson, meta } = sealProtectedBody()
    lesson.reason = 'Nội dung đã bị thay đổi sau khi ký.'
    assert.equal(await validateBrain2LessonPackage(lesson, meta), null)
  })
})

test('progress stores only the versioned anonymous shape', () => {
  const storage = installStorage()
  recordBrain2LessonOpened('ngay-02')
  const progress = markBrain2LessonComplete('ngay-01', new Date('2026-07-12T09:00:00.000Z'))

  assert.deepEqual(progress, {
    version: 1,
    completed: { 'ngay-01': '2026-07-12T09:00:00.000Z' },
    lastOpened: 'ngay-02',
  })
  assert.deepEqual(JSON.parse(storage.getItem(BRAIN2_PROGRESS_STORAGE_KEY) ?? ''), progress)
  assert.doesNotMatch(storage.getItem(BRAIN2_PROGRESS_STORAGE_KEY) ?? '', /email|code|answer|content/i)
})

test('progress fails closed for malformed, stale or identifying records', () => {
  const storage = installStorage()
  for (const value of [
    '{bad json',
    JSON.stringify({ version: 2, completed: {} }),
    JSON.stringify({ version: 1, completed: {}, email: 'person@example.com' }),
    JSON.stringify({ version: 1, completed: { missing: '2026-07-12T09:00:00.000Z' } }),
    JSON.stringify({ version: 1, completed: { 'ngay-01': 'yesterday' } }),
    JSON.stringify({ version: 1, completed: {}, lastOpened: 'day-01' }),
  ]) {
    storage.setItem(BRAIN2_PROGRESS_STORAGE_KEY, value)
    assert.deepEqual(readBrain2Progress(), { version: 1, completed: {} })
  }
})

test('unknown slugs and protected completion before content load are rejected', () => {
  installStorage()
  assert.throws(() => recordBrain2LessonOpened('toString'), /lesson|slug/i)
  assert.throws(() => markBrain2LessonComplete('ngay-22'), /lesson|slug/i)
  assert.throws(() => markBrain2LessonComplete('ngay-08'), /protected|load|access/i)

  setBrain2ProtectedLessonLoaded('ngay-08', true)
  assert.doesNotThrow(() => markBrain2LessonComplete('ngay-08', new Date('2026-07-12T10:00:00.000Z')))
  setBrain2ProtectedLessonLoaded('ngay-08', false)
})

test('next lesson resumes the open lesson, then advances to the first incomplete day', () => {
  assert.equal(nextBrain2Lesson({ version: 1, completed: {}, lastOpened: 'ngay-04' }), 'ngay-04')
  assert.equal(nextBrain2Lesson({
    version: 1,
    completed: {
      'ngay-01': '2026-07-12T09:00:00.000Z',
      'ngay-02': '2026-07-12T10:00:00.000Z',
    },
    lastOpened: 'ngay-02',
  }), 'ngay-03')
  assert.equal(nextBrain2Lesson({ version: 1, completed: {} }), 'ngay-01')
})

test('storage failures never prevent reading or using a lesson', () => {
  const storage = installStorage()
  storage.getItem = () => { throw new Error('blocked') }
  storage.setItem = () => { throw new Error('blocked') }

  assert.deepEqual(readBrain2Progress(), { version: 1, completed: {} })
  assert.deepEqual(recordBrain2LessonOpened('ngay-03'), {
    version: 1,
    completed: {},
    lastOpened: 'ngay-03',
  })
})

test('progress clients hydrate resume state and expose semantic completion', () => {
  assert.ok(existsSync(new URL('components/brain2/Brain2ProgressClient.tsx', root)))
  const source = read('components/brain2/Brain2ProgressClient.tsx')
  const roadmap = read('components/brain2/Brain2Roadmap.tsx')
  const lesson = read('components/brain2/Brain2LessonDocument.tsx')

  assert.match(source, /readBrain2Progress/)
  assert.match(source, /nextBrain2Lesson/)
  assert.match(source, /recordBrain2LessonOpened/)
  assert.match(source, /markBrain2LessonComplete/)
  assert.match(source, /aria-pressed=\{completed\}/)
  assert.match(source, /Tiếp tục ngày/)
  assert.match(roadmap, /<Brain2ProgressClient variant="hub"/)
  assert.match(lesson, /<Brain2ProgressClient[\s\S]*variant="lesson"/)
  assert.match(lesson, /meta\.access === 'public'/)
  assert.match(lesson, /Dành cho Conan Maker/)
})

test('hub replaces the resume link with a completed 21-day state', () => {
  const source = read('components/brain2/Brain2ProgressClient.tsx')
  const css = read('components/brain2/Brain2.module.css')
  const completionStart = source.indexOf('if (completedCount === 21)')
  const resumeStart = source.indexOf('const nextSlug = nextBrain2Lesson(progress)')

  assert.ok(completionStart >= 0, 'missing 21/21 completion branch')
  assert.ok(resumeStart > completionStart, 'completion must branch before selecting a resume lesson')
  assert.match(source.slice(completionStart, resumeStart), /Bạn đã hoàn thành 21\/21 ngày/)
  assert.doesNotMatch(source.slice(completionStart, resumeStart), /Tiếp tục ngày/)
  assert.match(css, /\.progressSummary strong/)
})

test('access gate is keyboard-contained and submits only the ephemeral code', () => {
  assert.ok(existsSync(new URL('components/brain2/Brain2AccessGate.tsx', root)))
  const source = read('components/brain2/Brain2AccessGate.tsx')

  assert.match(source, /role="dialog"/)
  assert.match(source, /aria-modal="true"/)
  assert.match(source, /inputRef\.current\?\.focus\(\)/)
  assert.match(source, /event\.key === 'Escape'/)
  assert.match(source, /event\.shiftKey/)
  assert.match(source, /triggerRef\.current\?\.focus\(\)/)
  assert.match(source, /document\.body\.style\.overflow = 'hidden'/)
  assert.match(source, /document\.documentElement\.style\.overflow = 'hidden'/)
  assert.match(source, /JSON\.stringify\(\{ code \}\)/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|email|answer/i)
  assert.match(source, /Thử lại sau/)
  assert.match(source, /Tạm thời chưa kiểm tra được quyền truy cập/)
})

test('access gate portals the modal and invalidates closed or unmounted submissions', () => {
  const source = read('components/brain2/Brain2AccessGate.tsx')
  const closeStart = source.indexOf('function close()')
  const openStart = source.indexOf('function openGate()')

  assert.match(source, /import \{ createPortal \} from 'react-dom'/)
  assert.match(source, /createPortal\([\s\S]*document\.body/)
  assert.match(source, /submissionGenerationRef/)
  assert.match(source, /new AbortController\(\)/)
  assert.match(source, /signal: controller\.signal/)
  assert.match(source, /submissionGenerationRef\.current === generation/)
  assert.match(source.slice(closeStart, openStart), /invalidateSubmission\(\)/)
  assert.match(source, /useEffect\(\(\) => \(\) => invalidateSubmission\(\), \[invalidateSubmission\]\)/)
})

test('protected lesson checks, loads and clears server access without storing credentials', () => {
  const source = read('components/brain2/Brain2ProtectedLesson.tsx')

  assert.match(source, /fetch\(`\$\{API_ROOT\}\/access`/)
  assert.match(source, /fetch\(`\$\{API_ROOT\}\/lessons\/\$\{meta\.slug\}`/)
  assert.match(source, /method: 'DELETE'/)
  assert.match(source, /credentials: 'same-origin'/)
  assert.match(source, /setBrain2ProtectedLessonLoaded/)
  assert.match(source, /<Brain2LessonDocument lesson=\{lesson\}/)
  assert.doesNotMatch(source, /localStorage|sessionStorage|BRAIN2_ACCESS_CODE/i)
})

test('protected lesson rejects stale responses and clears content only after a confirmed DELETE', () => {
  const source = read('components/brain2/Brain2ProtectedLesson.tsx')
  const clearStart = source.indexOf('async function clearAccess()')
  const renderStart = source.indexOf("if (state === 'ready' && lesson)")
  const clearAccess = source.slice(clearStart, renderStart)
  const responseCheck = clearAccess.indexOf('if (!response.ok)')
  const contentClear = clearAccess.indexOf('setLesson(null)')
  const catchStart = clearAccess.indexOf('} catch')

  assert.match(source, /validateBrain2LessonPackage/)
  assert.doesNotMatch(source, /function isLessonPackage/)
  assert.match(source, /requestGenerationRef/)
  assert.match(source, /new AbortController\(\)/)
  assert.match(source, /signal: controller\.signal/)
  assert.match(source, /requestGenerationRef\.current === generation/)
  assert.match(source, /invalidateRequests\(\)/)
  assert.ok(responseCheck >= 0 && responseCheck < contentClear, 'DELETE must be OK before clearing the loaded lesson')
  assert.ok(contentClear >= 0 && contentClear < catchStart, 'DELETE failures must retain the loaded lesson')
  assert.doesNotMatch(clearAccess.slice(catchStart), /setLesson\(null\)|setState\('unauthorized'\)/)
  assert.match(clearAccess.slice(catchStart), /setClearError\(/)
  assert.match(source, /role="alert"/)
  assert.match(source, /Thử khóa lại/)
  assert.match(read('components/brain2/Brain2.module.css'), /\.accessToolbar p/)
})
