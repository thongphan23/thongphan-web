import assert from 'node:assert/strict'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { generateBrain2Data } from './generate-brain2-data.mjs'
import lessonsModule from '../lib/brain2/lessons.ts'
import structuredDataModule from '../lib/brain2/structured-data.ts'

const {
  brain2LessonHref,
  getBrain2LessonMeta,
  getBrain2LessonParams,
  getPublicBrain2Lesson,
} = lessonsModule
const {
  buildBrain2CourseStructuredData,
  buildBrain2LessonStructuredData,
} = structuredDataModule

const sourceContentDir = new URL('../content/brain2/', import.meta.url)

async function makeFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'brain2-generator-'))
  const contentDir = join(root, 'content')
  await cp(sourceContentDir, contentDir, { recursive: true })
  t.after(() => rm(root, { recursive: true, force: true }))
  return { root, contentDir }
}

test('public selectors expose 21 safe shells and bodies for days 01 through 07 only', () => {
  assert.equal(getBrain2LessonParams().length, 21)
  assert.deepEqual(getBrain2LessonParams().at(0), { day: 'ngay-01' })
  assert.deepEqual(getBrain2LessonParams().at(-1), { day: 'ngay-21' })
  assert.ok(getPublicBrain2Lesson('ngay-01')?.blocks.length > 0)
  assert.equal(getPublicBrain2Lesson('ngay-08'), null)
  assert.equal(getPublicBrain2Lesson('toString'), null)
  assert.equal(getPublicBrain2Lesson('__proto__'), null)
  assert.equal(getBrain2LessonMeta('ngay-21')?.access, 'conan-maker')
  assert.equal(getBrain2LessonMeta('missing'), null)
  assert.equal(brain2LessonHref(9), '/brain2/21-ngay/ngay-09')
  assert.throws(() => brain2LessonHref(0), /day|1.*21/i)
})

test('structured data lists all days without leaking protected lesson fields', () => {
  const course = buildBrain2CourseStructuredData()
  assert.equal(course['@type'], 'Course')
  assert.equal(course.hasPart.length, 21)
  assert.equal(course.mainEntity['@type'], 'ItemList')
  assert.equal(course.mainEntity.itemListElement.length, 21)

  const publicLesson = buildBrain2LessonStructuredData('ngay-01')
  assert.ok(publicLesson)
  assert.equal(publicLesson.isAccessibleForFree, true)
  assert.equal(publicLesson.nextItem, 'https://thongphan.com/brain2/21-ngay/ngay-02')

  const protectedLesson = buildBrain2LessonStructuredData('ngay-08')
  assert.ok(protectedLesson)
  assert.equal(protectedLesson.isAccessibleForFree, false)
  assert.equal(protectedLesson.previousItem, 'https://thongphan.com/brain2/21-ngay/ngay-07')
  assert.equal(protectedLesson.nextItem, 'https://thongphan.com/brain2/21-ngay/ngay-09')
  assert.doesNotMatch(
    JSON.stringify(protectedLesson),
    /"(?:reason|blocks|deliverable|checklist|storageKey|prompt)"/,
  )
  assert.equal(buildBrain2LessonStructuredData('missing'), null)
})

test('generator validates public checksums and emits deterministic safe data', async (t) => {
  const { root, contentDir } = await makeFixture(t)
  const firstOutput = join(root, 'first.ts')
  const secondOutput = join(root, 'second.ts')

  const first = await generateBrain2Data({ contentDir, outputFile: firstOutput })
  const second = await generateBrain2Data({ contentDir, outputFile: secondOutput })

  assert.equal(first.metadata.length, 21)
  assert.deepEqual(Object.keys(first.publicLessons), [
    'ngay-01',
    'ngay-02',
    'ngay-03',
    'ngay-04',
    'ngay-05',
    'ngay-06',
    'ngay-07',
  ])
  assert.deepEqual(second, first)
  assert.equal(await readFile(secondOutput, 'utf8'), await readFile(firstOutput, 'utf8'))
  assert.doesNotMatch(await readFile(firstOutput, 'utf8'), /storageKey/)

  const dayOnePath = join(contentDir, 'public', 'ngay-01.json')
  const dayOne = JSON.parse(await readFile(dayOnePath, 'utf8'))
  dayOne.reason += ' tampered'
  await writeFile(dayOnePath, `${JSON.stringify(dayOne, null, 2)}\n`, 'utf8')

  await assert.rejects(
    generateBrain2Data({ contentDir, outputFile: join(root, 'tampered.ts') }),
    /checksum/i,
  )
})

test('generator rejects protected body fields in the tracked manifest', async (t) => {
  const { root, contentDir } = await makeFixture(t)
  const manifestPath = join(contentDir, 'manifest.json')
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  manifest.lessons[7].blocks = [{ kind: 'prompt', text: 'must never be tracked' }]
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  await assert.rejects(
    generateBrain2Data({ contentDir, outputFile: join(root, 'unsafe.ts') }),
    /manifest|metadata|field|protected/i,
  )
})
