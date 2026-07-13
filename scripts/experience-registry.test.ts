import assert from 'node:assert/strict'
import test from 'node:test'
import { experiences, getPublishedExperiences } from '../lib/experiences'

type Assert<T extends true> = T
type IsReadonlyArray<T extends readonly unknown[]> = T extends unknown[] ? false : true
type PublishedExperiencesStayReadonly = Assert<
  IsReadonlyArray<ReturnType<typeof getPublishedExperiences>>
>

test('registry exposes stable versioned experiences with complete user-facing contracts', () => {
  assert.deepEqual(experiences.map(({ id }) => id), [
    'expertise-asset-map',
    'brain2-21-days',
    'ai-foundation',
  ])

  for (const experience of experiences) {
    assert.match(experience.version, /^\d+\.\d+\.\d+$/)
    assert.equal(experience.status, 'published')
    assert.match(experience.href, /^\//)
    assert.ok(experience.title.length >= 12)
    assert.ok(experience.promise.length >= 30)
    assert.ok(experience.audience.length >= 20)
    assert.ok(experience.problem.length >= 20)
    assert.ok(experience.durationLabel.length >= 4)
    assert.ok(experience.output.length >= 20)
    assert.ok(experience.ctaLabel.length >= 8)
    assert.ok(experience.access.label.length >= 10)
    assert.match(experience.media.src, /^\/images\//)
    assert.ok(experience.media.width > 0)
    assert.ok(experience.media.height > 0)
    assert.ok(experience.media.alt.length >= 20)
    assert.match(experience.media.position, /^\d+% \d+%$/)
    assert.equal(
      experience.media.rights,
      experience.media.source === 'owned' ? 'owned-archive' : 'generated-for-thongphan',
    )
  }
})

test('Learn is fail-closed while always-available experiences remain public', () => {
  assert.deepEqual(
    getPublishedExperiences({ includeLearn: false }).map(({ id }) => id),
    ['expertise-asset-map', 'brain2-21-days'],
  )
  assert.deepEqual(
    getPublishedExperiences({ includeLearn: true }).map(({ id }) => id),
    ['expertise-asset-map', 'brain2-21-days', 'ai-foundation'],
  )
})

test('unknown future availability remains fail-closed even when Learn is public', () => {
  const futureIndex = experiences.length
  Reflect.set(experiences, futureIndex, {
    ...experiences[0],
    id: 'future-experience',
    availability: 'future-gate',
  })

  try {
    assert.equal(
      getPublishedExperiences({ includeLearn: true }).some(({ id }) => id === 'future-experience'),
      false,
    )
  } finally {
    Reflect.deleteProperty(experiences, futureIndex)
  }
})

test('current Brain2 access copy stays truthful', () => {
  const brain2 = experiences.find(({ id }) => id === 'brain2-21-days')
  assert.equal(brain2?.access.label, 'Tuần 1 miễn phí · Tuần 2–3 cần quyền Conan Maker')
  assert.equal(brain2?.href, '/brain2/21-ngay')
})
