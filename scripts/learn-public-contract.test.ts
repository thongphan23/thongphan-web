import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function source(path: string) {
  return readFile(new URL(path, root), 'utf8')
}

test('public Learn catalog exposes one truthful free course and two locked paid courses', async () => {
  const { learnCourses, getLearnCourse } = await import('../lib/learn-catalog')

  assert.equal(learnCourses.length, 3)
  assert.deepEqual(learnCourses.map((course) => course.slug), [
    'ai-foundation',
    'prompt-thinking',
    'evaluate-verify',
  ])
  assert.equal(getLearnCourse('ai-foundation')?.access, 'free')
  assert.equal(getLearnCourse('prompt-thinking')?.access, 'coming-paid')
  assert.equal(getLearnCourse('evaluate-verify')?.access, 'coming-paid')
  assert.equal(getLearnCourse('missing'), undefined)
})

test('Learn placement uses eight work challenges and deterministic recommendation bands', async () => {
  const { placementChallenges, scorePlacementAnswers } = await import(
    '../app/learn/diagnostic/diagnostic-model'
  )

  assert.equal(placementChallenges.length, 8)
  assert.equal(new Set(placementChallenges.map((challenge) => challenge.id)).size, 8)
  for (const challenge of placementChallenges) {
    assert.equal(challenge.options.length, 3)
    assert.ok(challenge.correctIndex >= 0 && challenge.correctIndex < 3)
  }

  const novice = scorePlacementAnswers(Object.fromEntries(placementChallenges.map((item) => [item.id, null])))
  const strong = scorePlacementAnswers(
    Object.fromEntries(placementChallenges.map((item) => [item.id, item.correctIndex])),
  )

  assert.equal(novice.correct, 0)
  assert.equal(novice.recommendedStart, 'AI Foundation · Bài 1')
  assert.equal(strong.correct, 8)
  assert.equal(strong.recommendedStart, 'AI Foundation · Luyện tập Chặng 1')
  assert.ok(strong.confidence >= 0.85)
})

test('Learn routes ship discovery, diagnostic, free entry and three static course details', async () => {
  const [page, diagnostic, free, course] = await Promise.all([
    source('app/learn/page.tsx'),
    source('app/learn/diagnostic/page.tsx'),
    source('app/learn/free/page.tsx'),
    source('app/learn/courses/[slug]/page.tsx'),
  ])

  assert.match(page, /Học AI để làm việc tốt hơn/)
  assert.match(page, /AI Foundation/)
  assert.match(page, /learn\.thongphan\.com/)
  assert.match(page, /application\/ld\+json|<JsonLd/)
  assert.match(diagnostic, /LearnPlacementClient/)
  assert.match(free, /AI Foundation/)
  assert.match(course, /generateStaticParams/)
  assert.match(course, /notFound\(\)/)
})

test('Learn owns the learning-dossier route mode and the primary navigation replaces Tài sản with Học', async () => {
  const [{ routeModeForPath }, { primaryNavigation, secondaryNavigation }] = await Promise.all([
    import('../lib/site-route-mode'),
    import('../components/site-chrome/site-navigation'),
  ])

  assert.equal(routeModeForPath('/learn'), 'learning-dossier')
  assert.equal(routeModeForPath('/learn/diagnostic'), 'learning-dossier')
  assert.deepEqual(primaryNavigation, [
    { href: '/about', label: 'Câu chuyện' },
    { href: '/library', label: 'Thư viện' },
    { href: '/learn', label: 'Học' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
    { href: '/conanmaker/', label: 'Conan Maker' },
  ])
  assert.deepEqual(secondaryNavigation, [{ href: '/assets', label: 'Tài sản' }])
})
