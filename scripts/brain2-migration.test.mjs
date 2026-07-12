import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

import * as migration from './migrate-brain2-lessons.mjs'

const { extractDayContent, sourceFragmentSha256 } = migration

const fixture = await readFile(new URL('./fixtures/brain2-legacy-script.js', import.meta.url), 'utf8')
const days = Array.from({ length: 21 }, (_, index) => index + 1)
const repoRoot = new URL('..', import.meta.url).pathname.replace(/\/$/, '')
const privateTestParent = '/Users/rio/Private'
const protectedNames = days.slice(7).map((day) => `ngay-${String(day).padStart(2, '0')}.json`)

const syntheticProtectedPackages = () =>
  protectedNames.map((name) => ({ meta: { slug: name.replace(/\.json$/, '') }, synthetic: true }))

const withPrivateTestRoot = async (prefix, callback) => {
  await mkdir(privateTestParent, { recursive: true })
  const root = await mkdtemp(join(privateTestParent, prefix))
  try {
    return await callback(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

const lessonMember = (day, overrides = {}) => {
  if (overrides.rawMember) return overrides.rawMember
  const key = overrides.key ?? String(day)
  const fields = overrides.fields ?? [
    `title: ${overrides.title ?? `'Synthetic lesson ${String(day).padStart(2, '0')}'`}`,
    `content: ${overrides.content ?? `\`Synthetic body ${String(day).padStart(2, '0')}.\``}`,
  ]
  return `${key}: { ${fields.join(', ')} }`
}

const legacySource = (sourceDays = days, overrides = new Map()) =>
  `const DAY_CONTENT = {\n${sourceDays
    .map((day, index) => `  ${lessonMember(day, overrides.get(index) ?? {})},`)
    .join('\n')}\n}\n`

test('extracts the 21 synthetic fixture lessons in exact day order', () => {
  const entries = extractDayContent(fixture, 'brain2-legacy-script.js')
  assert.deepEqual(entries.map(({ day }) => day), days)
  assert.deepEqual(entries[0], {
    day: 1,
    title: 'Synthetic lesson 01',
    content: 'Synthetic body 01.',
  })
  assert.equal(entries[8].title, 'Synthetic Viral lesson 09')
})

test('hashes the exact UTF-8 title-newline-content source fragment', () => {
  const entry = { day: 1, title: 'Tiêu đề', content: 'Nội dung\nUTF-8 ✓' }
  const expected = createHash('sha256')
    .update(`${entry.title}\n${entry.content}`, 'utf8')
    .digest('hex')
  assert.equal(sourceFragmentSha256(entry), expected)
})

const assertParseDiagnostic = (source, sourceName) => {
  assert.throws(
    () => extractDayContent(source, sourceName),
    (error) => {
      assert.match(
        error.message,
        new RegExp(`^${sourceName}: source contains \\d+ TypeScript parse diagnostic(?:s)?$`),
      )
      return true
    },
  )
}

test('rejects a source truncated before the final DAY_CONTENT brace', () => {
  assertParseDiagnostic(legacySource().slice(0, -2), 'missing-final-brace.js')
})

test('rejects an unterminated final lesson template', () => {
  const source = legacySource()
  assertParseDiagnostic(source.slice(0, source.lastIndexOf('`')), 'unterminated-final-template.js')
})

test('rejects a missing day', () => {
  assert.throws(() => extractDayContent(legacySource(days.slice(0, -1))), /21|missing|exactly/i)
})

test('rejects duplicate days', () => {
  assert.throws(() => extractDayContent(legacySource([1, 1, ...days.slice(1, -1)])), /duplicate|order/i)
})

test('rejects out-of-range days', () => {
  assert.throws(() => extractDayContent(legacySource([...days.slice(0, -1), 22])), /range|21|day/i)
})

test('rejects computed and non-numeric day keys', () => {
  assert.throws(
    () => extractDayContent(legacySource(days, new Map([[0, { key: '[1]' }]]))),
    /computed|numeric|property/i,
  )
  assert.throws(
    () => extractDayContent(legacySource(days, new Map([[0, { key: "'1'" }]]))),
    /numeric|property/i,
  )
})

test('rejects methods in the day map', () => {
  const source = legacySource(days, new Map([[0, { rawMember: '1() { return {} }' }]]))
  assert.throws(() => extractDayContent(source), /method|property/i)
})

test('rejects calls instead of literal lesson fields', () => {
  const source = legacySource(days, new Map([[0, { title: 'makeTitle()' }]]))
  assert.throws(() => extractDayContent(source), /title|string|call/i)
})

test('rejects template substitutions', () => {
  const source = legacySource(days, new Map([[0, { content: '`Synthetic ${suffix}`' }]]))
  assert.throws(() => extractDayContent(source), /content|template|substitution/i)
})

test('rejects spreads in the lesson map or lesson objects', () => {
  assert.throws(
    () => extractDayContent(legacySource().replace('{\n', '{\n  ...extra,\n')),
    /spread|property/i,
  )
  const source = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", 'content: `Synthetic body 01.`', '...extra'] }]]),
  )
  assert.throws(() => extractDayContent(source), /spread|field|property/i)
})

test('rejects unknown, duplicate, or missing lesson fields', () => {
  const unknown = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", 'content: `Synthetic body 01.`', "summary: 'No' "] }]]),
  )
  assert.throws(() => extractDayContent(unknown), /unknown|field/i)

  const duplicate = legacySource(
    days,
    new Map([[0, { fields: ["title: 'Synthetic lesson 01'", "title: 'Again'", 'content: `Synthetic body 01.`'] }]]),
  )
  assert.throws(() => extractDayContent(duplicate), /duplicate|field/i)

  const missingTitle = legacySource(days, new Map([[0, { fields: ['content: `Synthetic body 01.`'] }]]))
  assert.throws(() => extractDayContent(missingTitle), /missing|title/i)

  const missingContent = legacySource(days, new Map([[0, { fields: ["title: 'Synthetic lesson 01'"] }]]))
  assert.throws(() => extractDayContent(missingContent), /missing|content/i)
})

test('rejects multiple top-level DAY_CONTENT declarations', () => {
  assert.throws(
    () => extractDayContent(`${legacySource()}\nconst DAY_CONTENT = {}`),
    /multiple|declaration/i,
  )
})

test('rejects nested-only DAY_CONTENT declarations', () => {
  assert.throws(() => extractDayContent(`function wrapper() {\n${legacySource()}\n}`), /DAY_CONTENT|top-level/i)
})

test('rejects lessons that are not authored in exact 1 through 21 order', () => {
  assert.throws(() => extractDayContent(legacySource([2, 1, ...days.slice(2)])), /order|expected/i)
})

test('extractor source contains no executable loading primitive', async () => {
  const implementation = await readFile(new URL('./migrate-brain2-lessons.mjs', import.meta.url), 'utf8')
  assert.doesNotMatch(implementation, /\beval\s*\(|\bvm\b|\bimport\s*\(/)
})

test('normalizes legacy HTML into typed rich-text blocks without HTML payloads', () => {
  assert.equal(typeof migration.normalizeLessonHtml, 'function')
  const result = migration.normalizeLessonHtml(
    `<h2>Heading</h2>
     <p>Hello <strong>strong</strong>, <em>emphasis</em>, <code>code</code><br>next.</p>
     <ul><li>First</li><li>Visit <a href="https://example.com/guide">the guide</a></li></ul>
     <pre>Reusable working template</pre>`,
    { day: 1, sourceName: 'typed-fixture' },
  )

  assert.deepEqual(result.blocks.map(({ kind }) => kind), ['prose', 'prose', 'list', 'prompt'])
  assert.equal(result.blocks[0].heading, 'Heading')
  assert.equal(result.blocks[3].label, 'Mẫu làm việc')
  assert.equal(result.inventory.sourceExternalLinks, 1)
  assert.equal(result.inventory.retainedExternalLinks, 1)
  assert.doesNotMatch(JSON.stringify(result.blocks), /<\/?(?:p|strong|a|pre)\b|style=|onclick=/i)
})

test('preserves word boundaries when a heading contains legacy line breaks', () => {
  const result = migration.normalizeLessonHtml(
    '<h2>Ngày<br>quan trọng</h2><h3>Atomic —<br>Brain2</h3><p>Body</p>',
    { day: 1, sourceName: 'heading-break-fixture' },
  )

  assert.deepEqual(
    result.blocks.filter(({ heading }) => heading).map(({ heading }) => heading),
    ['Ngày quan trọng', 'Atomic — Brain2'],
  )
})

test('pairs each copy button to one literal same-lesson target', () => {
  assert.equal(typeof migration.normalizeLessonHtml, 'function')
  const handler =
    "navigator.clipboard.writeText(document.getElementById('prompt-1').textContent);this.textContent='Copied';setTimeout(()=>this.textContent='Copy',2000)"
  const result = migration.normalizeLessonHtml(
    `<div id="prompt-1">One <strong>synthetic</strong> prompt</div><button onclick="${handler}">Copy prompt</button>`,
    { day: 2, sourceName: 'copy-fixture' },
  )

  assert.equal(result.inventory.copyDerivedPrompts, 1)
  assert.deepEqual(result.blocks, [
    { id: 'day-02-block-01', kind: 'prompt', label: 'Copy prompt', text: 'One synthetic prompt' },
  ])
})

test('rejects non-literal, missing, reused and duplicate copy targets', () => {
  const normalize = (html) => migration.normalizeLessonHtml(html, { day: 2, sourceName: 'copy-reject' })
  const valid = (id) =>
    `navigator.clipboard.writeText(document.getElementById('${id}').textContent);this.textContent='Copied';setTimeout(()=>this.textContent='Copy',2000)`

  assert.throws(
    () => normalize(`<div id="p">Text</div><button onclick="copyPrompt('p')">Copy</button>`),
    /copy|literal|handler|target/i,
  )
  assert.throws(() => normalize(`<button onclick="${valid('missing')}">Copy</button>`), /missing|target/i)
  assert.throws(
    () => normalize(`<div id="p">Text</div><button onclick="${valid('p')}">A</button><button onclick="${valid('p')}">B</button>`),
    /reused|target|duplicate/i,
  )
  assert.throws(
    () => normalize(`<div id="p">One</div><pre id="p">Two</pre><button onclick="${valid('p')}">Copy</button>`),
    /duplicate|target|id/i,
  )
})

test('removes unsafe URLs and stale operational copy while retaining safe links', () => {
  const result = migration.normalizeLessonHtml(
    `<p>Dán vào Antigravity để mày và anh em bắt đầu.</p>
     <p>Tham gia Zoom và đăng lên nhóm Zalo trong workshop tháng 5/2026.</p>
     <p>Passcode 0203 tại https://brain2.thongphan.com và /Users/example/.agent/config.</p>
     <p>Create 1 note today.</p><p>Trusted by 1200 members.</p>
     <p>Công ty đóng cửa → mất hết</p>
     <ul><li>Miễn phí vĩnh viễn</li><li>Miễn phí 100%</li><li>Free forever</li><li>Miễn phí với tài khoản Google cá nhân</li><li>Useful retained item</li></ul>
     <p><a href="javascript:alert(1)">Unsafe</a> <a href="https://example.com/safe">Safe</a></p>
     <p><a href="https://antigravity.google/download">Legacy tool download</a></p>
     <a href="https://video.example/legacy"><div><p>Antigravity setup tutorial</p></div></a>
     <a href="https://video.example/dynamic"><div><p>Course</p><p>Từng được bán $97, nay free. Khóa học đầy đủ nhất.</p></div></a>
     <p><a href="https://sachmoi.net/book">Old resource</a></p>`,
    { day: 3, sourceName: 'editorial-fixture' },
  )
  const serialized = JSON.stringify(result.blocks)

  assert.match(serialized, /trợ lý AI/)
  assert.match(serialized, /bạn/)
  assert.match(serialized, /Create 1 note today/)
  assert.match(serialized, /Useful retained item/)
  assert.match(serialized, /Phụ thuộc vào quyền truy cập và chính sách của nền tảng/)
  assert.doesNotMatch(serialized, /Miễn phí vĩnh viễn|Miễn phí 100%|Free forever|Miễn phí với tài khoản Google|\$97|nay free|khóa học đầy đủ nhất|Công ty đóng cửa\s*→\s*mất hết/i)
  assert.doesNotMatch(serialized, /1200 members/)
  assert.doesNotMatch(
    serialized,
    /Antigravity|\bmày\b|anh em|Zoom|Zalo|workshop|tháng 5|0203|brain2\.thongphan\.com|\/Users\/|\.agent|javascript:|sachmoi\.net/i,
  )
  assert.equal(result.inventory.sourceExternalLinks, 6)
  assert.equal(result.inventory.retainedExternalLinks, 1)
})

test('counts only retained HTTPS external links, never canonical internal links', () => {
  const result = migration.normalizeLessonHtml(
    '<p><a href="/brain2/21-ngay">Internal</a> <a href="https://example.com/guide">External</a></p>',
    { day: 1, sourceName: 'link-count-fixture' },
  )

  assert.equal(result.inventory.sourceExternalLinks, 1)
  assert.equal(result.inventory.retainedExternalLinks, 1)
  assert.equal(JSON.stringify(result.blocks).includes('/brain2/21-ngay'), true)
})

test('content checksum is recursively stable and excludes metadata by contract', () => {
  assert.equal(typeof migration.contentSha256, 'function')
  const first = {
    reason: 'Reason',
    blocks: [{ id: 'b', kind: 'prose', children: [{ type: 'text', value: 'Body' }] }],
    deliverable: { title: 'Artifact', body: [{ type: 'text', value: 'Observable' }] },
    checklist: [{ id: 'c', label: 'Checked' }],
  }
  const reordered = {
    checklist: first.checklist,
    deliverable: { body: first.deliverable.body, title: first.deliverable.title },
    blocks: [{ children: first.blocks[0].children, kind: 'prose', id: 'b' }],
    reason: first.reason,
  }

  assert.equal(migration.contentSha256(first), migration.contentSha256(reordered))
  assert.equal(migration.contentSha256({ ...first, meta: { migratedAt: 'later' } }), migration.contentSha256(first))
})

test('reviewed editorial table exposes private-day public metadata only', () => {
  assert.ok(Array.isArray(migration.LESSON_EDITORIAL))
  assert.equal(migration.LESSON_EDITORIAL.length, 21)
  assert.deepEqual(migration.LESSON_EDITORIAL.map(({ day }) => day), days)

  for (const field of ['title', 'promise', 'objective', 'preview']) {
    const values = migration.LESSON_EDITORIAL.map((row) => row[field])
    assert.equal(new Set(values).size, 21, `${field} must be unique by lesson`)
    assert.ok(values.every((value) => typeof value === 'string' && value.trim().length >= 12))
    assert.ok(values.every((value) => !/placeholder|todo|generic|nội dung ngày|bài học ngày/i.test(value)))
  }
  assert.equal(migration.LESSON_EDITORIAL[8].title, 'Brain2 → viết bài viral')
  assert.equal(migration.LESSON_EDITORIAL[14].title, 'Đo sức khỏe Brain2')
  assert.equal(migration.LESSON_EDITORIAL[20].title, 'Tốt nghiệp và bản đồ tri thức')

  for (const row of migration.LESSON_EDITORIAL) {
    assert.ok(row.estimatedMinutes.min >= 10 && row.estimatedMinutes.max <= 120)
    assert.ok(row.estimatedMinutes.min <= row.estimatedMinutes.max)
  }
  for (const row of migration.LESSON_EDITORIAL.slice(0, 7)) {
    assert.equal(typeof row.reason, 'string')
    assert.ok(row.deliverable?.title?.trim().length >= 12)
    assert.ok(row.deliverable?.body?.trim().length >= 12)
    assert.ok(row.checklist.length >= 2)
    assert.equal(new Set(row.checklist).size, row.checklist.length)
  }
  for (const row of migration.LESSON_EDITORIAL.slice(7)) {
    assert.deepEqual(Object.keys(row).sort(), [
      'day',
      'estimatedMinutes',
      'objective',
      'preview',
      'promise',
      'title',
    ])
  }
})

test('derives protected package fields deterministically from synthetic normalized blocks', () => {
  assert.equal(typeof migration.deriveProtectedLessonBody, 'function')
  const meta = {
    objective: 'Public synthetic objective',
    preview: 'Public synthetic preview',
    promise: 'Public synthetic promise',
  }
  const blocks = [
    { id: 'b1', kind: 'prose', heading: 'Synthetic heading', children: [] },
    { id: 'b2', kind: 'prose', children: [{ type: 'text', value: 'Synthetic private reason' }] },
    { id: 'b3', kind: 'prose', children: [{ type: 'text', value: 'Bài tập' }] },
    { id: 'b4', kind: 'prose', children: [{ type: 'text', value: 'Synthetic observable artifact' }] },
    {
      id: 'b5',
      kind: 'list',
      ordered: false,
      items: [
        [{ type: 'text', value: 'First synthetic check' }],
        [{ type: 'text', value: 'Second synthetic check' }],
      ],
    },
  ]

  const first = migration.deriveProtectedLessonBody(blocks, meta, 'ngay-08')
  const second = migration.deriveProtectedLessonBody(structuredClone(blocks), meta, 'ngay-08')
  assert.deepEqual(first, second)
  assert.equal(first.reason, 'Synthetic private reason')
  assert.deepEqual(first.deliverable, {
    title: 'Synthetic observable artifact',
    body: [{ type: 'text', value: 'Synthetic observable artifact' }],
  })
  assert.deepEqual(first.checklist.map(({ label }) => label), [
    'First synthetic check',
    'Second synthetic check',
  ])

  const fallback = migration.deriveProtectedLessonBody([], meta, 'ngay-08')
  assert.equal(fallback.reason, meta.preview)
  assert.equal(fallback.deliverable.title, meta.objective)
  assert.deepEqual(fallback.deliverable.body, [{ type: 'text', value: meta.promise }])
  assert.deepEqual(fallback.checklist.map(({ label }) => label), [meta.objective, meta.preview])
})

test('builds a body-free 21-record manifest with immutable protected keys', () => {
  assert.equal(typeof migration.buildManifest, 'function')
  const packages = days.map((day) => ({
    meta: {
      schemaVersion: 1,
      day,
      slug: `ngay-${String(day).padStart(2, '0')}`,
      week: Math.ceil(day / 7),
      access: day <= 7 ? 'public' : 'conan-maker',
      title: `Synthetic metadata ${day}`,
      promise: `Synthetic promise ${day}`,
      objective: `Synthetic objective ${day}`,
      estimatedMinutes: { min: 20, max: 30 },
      preview: `Synthetic preview ${day}`,
      sourceFragmentSha256: String(day).padStart(64, '0'),
      contentSha256: String(day + 1).padStart(64, '0'),
      migratedAt: '2026-07-12T00:00:00.000Z',
      editorialState: 'reviewed',
    },
    reason: `Protected-or-public reason ${day}`,
    blocks: [{ id: `block-${day}`, kind: 'prompt', label: 'Do not publish', text: `Body ${day}` }],
    deliverable: { title: 'Artifact', body: [{ type: 'text', value: `Deliverable ${day}` }] },
    checklist: [{ id: `check-${day}`, label: `Check ${day}` }],
  }))
  const manifest = migration.buildManifest(packages, {
    sourceSha256: 'a'.repeat(64),
    copyDerivedPrompts: 41,
    sourceExternalLinks: 65,
    retainedExternalLinks: 60,
  })
  const serialized = JSON.stringify(manifest)

  assert.equal(manifest.lessons.length, 21)
  assert.equal(manifest.lessons[7].storageKey, 'brain2:21:2026-07-12.1:day:08')
  assert.doesNotMatch(serialized, /"reason"|"blocks"|"deliverable"|"checklist"|Do not publish|Protected-or-public reason/)
})

test('rejects private output inside repo, linked worktrees, build output or tmp', async () => {
  assert.equal(typeof migration.resolvePrivateContentDir, 'function')
  const linkedWorktree = `${repoRoot}-linked`
  const options = { repoRoot, worktreeRoots: [repoRoot, linkedWorktree] }

  await assert.rejects(() => migration.resolvePrivateContentDir(repoRoot, options), /outside|repo|worktree/i)
  await assert.rejects(() => migration.resolvePrivateContentDir(`${linkedWorktree}/private`, options), /worktree/i)
  await assert.rejects(() => migration.resolvePrivateContentDir(`${repoRoot}/.next/private`, options), /\.next|build|repo/i)
  await assert.rejects(() => migration.resolvePrivateContentDir(`${repoRoot}/out/private`, options), /out|build|repo/i)
  await assert.rejects(() => migration.resolvePrivateContentDir('/tmp/brain2-private', options), /tmp|temporary/i)
})

test('writer and validator reject a v1 symlink into a worktree', async () => {
  const validator = await import('./validate-brain2-lessons.mjs')
  assert.equal(typeof migration.writeProtectedPackages, 'function')
  assert.equal(typeof validator.validatePrivatePackageDirectory, 'function')
  const options = { repoRoot, worktreeRoots: [repoRoot] }

  await withPrivateTestRoot('brain2-v1-link-', async (root) => {
    await symlink(repoRoot, join(root, 'v1'), 'dir')
    await assert.rejects(
      () => migration.writeProtectedPackages(syntheticProtectedPackages(), root, options),
      /symlink|worktree|escape|directory/i,
    )
    await assert.rejects(
      () => validator.validatePrivatePackageDirectory(root, options),
      /symlink|worktree|escape|directory/i,
    )
  })
})

test('writer and validator reject a private lesson-file symlink before reading or writing', async () => {
  const validator = await import('./validate-brain2-lessons.mjs')
  assert.equal(typeof migration.writeProtectedPackages, 'function')
  assert.equal(typeof validator.validatePrivatePackageDirectory, 'function')
  const options = { repoRoot, worktreeRoots: [repoRoot] }
  const sentinel = join(repoRoot, `.brain2-symlink-sentinel-${process.pid}`)

  await writeFile(sentinel, 'sentinel', 'utf8')
  try {
    await withPrivateTestRoot('brain2-file-link-', async (root) => {
      const versionRoot = join(root, 'v1')
      await mkdir(versionRoot)
      await symlink(sentinel, join(versionRoot, protectedNames[0]), 'file')
      for (const name of protectedNames.slice(1)) await writeFile(join(versionRoot, name), '{}', 'utf8')

      await assert.rejects(
        () => migration.writeProtectedPackages(syntheticProtectedPackages(), root, options),
        /symlink|regular|escape/i,
      )
      await assert.rejects(
        () => validator.validatePrivatePackageDirectory(root, options),
        /symlink|regular|escape/i,
      )
      assert.equal(await readFile(sentinel, 'utf8'), 'sentinel')
    })
  } finally {
    await rm(sentinel, { force: true })
  }
})

test('writer and validator reject every unexpected private directory entry', async () => {
  const validator = await import('./validate-brain2-lessons.mjs')
  assert.equal(typeof migration.writeProtectedPackages, 'function')
  assert.equal(typeof validator.validatePrivatePackageDirectory, 'function')
  const options = { repoRoot, worktreeRoots: [repoRoot] }

  await withPrivateTestRoot('brain2-extra-entry-', async (root) => {
    const versionRoot = join(root, 'v1')
    await mkdir(versionRoot)
    await writeFile(join(versionRoot, 'backup.tmp'), 'synthetic backup', 'utf8')
    await assert.rejects(
      () => migration.writeProtectedPackages(syntheticProtectedPackages(), root, options),
      /unexpected|exact|entry/i,
    )
    await assert.rejects(
      () => validator.validatePrivatePackageDirectory(root, options),
      /unexpected|exact|entry/i,
    )
  })
})

test('validator accepts typed packages and rejects checksum, block and link violations', async () => {
  const validator = await import('./validate-brain2-lessons.mjs')
  assert.equal(typeof validator.validateLessonPackage, 'function')
  const body = {
    reason: 'A concrete synthetic reason for validation.',
    blocks: [
      {
        id: 'day-01-block-01',
        kind: 'prose',
        children: [
          { type: 'link', href: 'https://example.com/guide', children: [{ type: 'text', value: 'Guide' }] },
          { type: 'link', href: '/brain2/21-ngay/ngay-02', children: [{ type: 'text', value: 'Next lesson' }] },
        ],
      },
      { id: 'day-01-block-02', kind: 'prompt', label: 'Copy prompt', text: 'Synthetic prompt only.' },
    ],
    deliverable: { title: 'Synthetic artifact', body: [{ type: 'text', value: 'Observable output.' }] },
    checklist: [{ id: 'ngay-01-check-01', label: 'Verified synthetic output' }],
  }
  const lesson = {
    meta: {
      schemaVersion: 1,
      day: 1,
      slug: 'ngay-01',
      week: 1,
      access: 'public',
      title: 'Synthetic title',
      promise: 'Synthetic promise',
      objective: 'Synthetic objective',
      estimatedMinutes: { min: 20, max: 30 },
      preview: 'Synthetic preview',
      sourceFragmentSha256: 'a'.repeat(64),
      contentSha256: migration.contentSha256(body),
      migratedAt: '2026-07-12T00:00:00.000Z',
      editorialState: 'reviewed',
    },
    ...body,
  }

  assert.deepEqual(validator.validateLessonPackage(lesson, { expectedDay: 1, expectedAccess: 'public' }), {
    prompts: 1,
    retainedLinks: 1,
  })
  assert.throws(
    () => validator.validateLessonPackage({ ...lesson, meta: { ...lesson.meta, contentSha256: 'b'.repeat(64) } }, { expectedDay: 1, expectedAccess: 'public' }),
    /checksum/i,
  )
  assert.throws(
    () => validator.validateLessonPackage({ ...lesson, blocks: [{ id: 'bad', kind: 'unknown' }] }, { expectedDay: 1, expectedAccess: 'public' }),
    /block|unknown/i,
  )
  const unsafe = structuredClone(lesson)
  unsafe.blocks[0].children[0].href = 'javascript:alert(1)'
  unsafe.meta.contentSha256 = migration.contentSha256(unsafe)
  assert.throws(() => validator.validateLessonPackage(unsafe, { expectedDay: 1, expectedAccess: 'public' }), /link|href|unsafe/i)
  const htmlPayload = structuredClone(lesson)
  htmlPayload.blocks[1].text = '<section>raw HTML payload</section>'
  htmlPayload.meta.contentSha256 = migration.contentSha256(htmlPayload)
  assert.throws(
    () => validator.validateLessonPackage(htmlPayload, { expectedDay: 1, expectedAccess: 'public' }),
    /html|banned|event/i,
  )
})

if (process.env.BRAIN2_LEGACY_ROOT) {
  test('extracts the explicitly supplied authoritative legacy source', async () => {
    const sourceName = join(process.env.BRAIN2_LEGACY_ROOT, 'script.js')
    const source = await readFile(sourceName, 'utf8')
    const entries = extractDayContent(source, sourceName)
    assert.equal(entries.length, 21)
    assert.deepEqual(entries.map(({ day }) => day), days)
    assert.match(entries[8].title, /Viral/i)
    assert.doesNotMatch(entries[8].title, /backlink/i)
  })

  test('normalizes the authoritative source to the exact migration contract', async () => {
    const sourceName = join(process.env.BRAIN2_LEGACY_ROOT, 'script.js')
    const source = await readFile(sourceName, 'utf8')
    const result = migration.migrateSourceText(source, sourceName)

    assert.equal(result.packages.length, 21)
    assert.equal(result.packages.filter(({ meta }) => meta.access === 'public').length, 7)
    assert.equal(result.packages.filter(({ meta }) => meta.access === 'conan-maker').length, 14)
    assert.equal(result.stats.copyDerivedPrompts, 41)
    assert.equal(result.stats.sourceExternalLinks, 65)
    assert.deepEqual(
      result.packages.map(({ meta }) => meta.estimatedMinutes),
      migration.LESSON_EDITORIAL.map(({ estimatedMinutes }) => estimatedMinutes),
    )
    assert.equal(result.manifest.lessons.length, 21)
    assert.ok(result.manifest.lessons.slice(7).every((record) => record.storageKey))
    assert.ok(result.manifest.lessons.every((record) => !('reason' in record) && !('blocks' in record)))
    assert.ok(
      result.packages.slice(7).every(
        ({ reason, deliverable, checklist }) =>
          typeof reason === 'string' &&
          reason.length > 0 &&
          typeof deliverable?.title === 'string' &&
          deliverable.body.length > 0 &&
          checklist.length >= 2,
      ),
    )
  })

  test('authoritative migration metadata and checksums exactly match every release artifact', async () => {
    assert.ok(process.env.BRAIN2_PRIVATE_CONTENT_DIR, 'BRAIN2_PRIVATE_CONTENT_DIR is required for real parity')
    const sourceName = join(process.env.BRAIN2_LEGACY_ROOT, 'script.js')
    const source = await readFile(sourceName, 'utf8')
    const expected = migration.migrateSourceText(source, sourceName)
    const committedManifest = JSON.parse(
      await readFile(join(repoRoot, 'content', 'brain2', 'manifest.json'), 'utf8'),
    )

    assert.deepEqual(committedManifest, expected.manifest)
    for (const expectedPackage of expected.packages) {
      const { day, slug, contentSha256: expectedContentSha256 } = expectedPackage.meta
      const packagePath = day <= 7
        ? join(repoRoot, 'content', 'brain2', 'public', `${slug}.json`)
        : join(process.env.BRAIN2_PRIVATE_CONTENT_DIR, 'v1', `${slug}.json`)
      const actualPackage = JSON.parse(await readFile(packagePath, 'utf8'))
      const { meta: actualMeta, ...actualBody } = actualPackage

      assert.deepEqual(actualMeta, expectedPackage.meta, `day ${day} metadata differs`)
      assert.equal(actualMeta.contentSha256, expectedContentSha256, `day ${day} recorded checksum differs`)
      assert.equal(migration.contentSha256(actualBody), expectedContentSha256, `day ${day} body checksum differs`)
    }
  })
}
