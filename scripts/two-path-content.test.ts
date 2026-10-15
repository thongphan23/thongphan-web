import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { doorEvent, isPathKey, outboundEvent, outboundUrl, withUtm } from '../lib/two-path-links'
import { readStoredPath, writeStoredPath } from '../lib/path-memory'
import { aboutPathContent, conanContent, homeContent, tensaiContent } from '../lib/two-path-content'

const root = new URL('../', import.meta.url)
const allContent = JSON.stringify({ homeContent, tensaiContent, conanContent, aboutPathContent })

async function readProjectFile(path: string) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return ''
    throw error
  }
}

const bannedCopy = [
  /Biến chuyên môn thật thành tài sản/i,
  /AI PHẢI RA TIỀN/i,
  /há há/i,
  /\bOdin\b/i,
  /Bé Lửa/i,
  /Nunito/i,
  /thu nhập/i,
  /học phí/i,
  /\d[\d.,]*\s*(?:đồng|vnđ|vnd|triệu|nghìn|ngàn|k)(?!\p{L})/iu,
  /₫|\$\s?\d/u,
]

test('two-path copy never carries banned positioning, prices or income promises', () => {
  for (const pattern of bannedCopy) assert.doesNotMatch(allContent, pattern, String(pattern))
})

test('outbound links always carry the two-path UTM contract', () => {
  const tensai = new URL(outboundUrl('tensai', 'hero'))
  assert.equal(tensai.origin, 'https://learn.thongphan.com')
  assert.equal(tensai.searchParams.get('utm_source'), 'thongphan.com')
  assert.equal(tensai.searchParams.get('utm_medium'), 'referral')
  assert.equal(tensai.searchParams.get('utm_campaign'), 'two-path')
  assert.equal(tensai.searchParams.get('utm_content'), 'hero')
  assert.equal(new URL(outboundUrl('conan', 'footer')).origin, 'https://www.conan.school')
  assert.equal(new URL(outboundUrl('conan', 'footer')).searchParams.get('utm_content'), 'footer')
  assert.equal(new URL(withUtm('https://www.conan.school/?a=1', 'page')).searchParams.get('a'), '1')
  assert.deepEqual(doorEvent('conan', 'door'), {
    name: 'path_door_selected',
    detail: { path: 'conan', placement: 'door' },
  })
  assert.deepEqual(outboundEvent('tensai', 'closing'), { name: 'outbound_tensai', detail: { placement: 'closing' } })
  assert.deepEqual(outboundEvent('conan', 'nav'), { name: 'outbound_conan', detail: { placement: 'nav' } })
  assert.equal(isPathKey('tensai'), true)
  assert.equal(isPathKey('odin'), false)
  assert.equal(isPathKey(null), false)
})

test('stored path survives garbage values and blocked storage', () => {
  const store = new Map<string, string>()
  const storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
  }
  assert.equal(readStoredPath(storage), null)
  writeStoredPath(storage, 'conan')
  assert.equal(store.get('tp:path'), 'conan')
  assert.equal(readStoredPath(storage), 'conan')
  store.set('tp:path', 'xyz')
  assert.equal(readStoredPath(storage), null)

  const blocked = {
    getItem: () => {
      throw new Error('blocked')
    },
    setItem: () => {
      throw new Error('blocked')
    },
  }
  assert.equal(readStoredPath(blocked), null)
  assert.doesNotThrow(() => writeStoredPath(blocked, 'tensai'))
  assert.equal(readStoredPath(null), null)
  assert.doesNotThrow(() => writeStoredPath(null, 'tensai'))
})

test('homepage letter quotes the debt claim verbatim and proof cards cite real claims', async () => {
  const evidence = JSON.parse(await readProjectFile('content/proof/origin-story-evidence.json')) as {
    claims: { id: string; text: string; publicHref?: string }[]
  }
  const claims = new Map(evidence.claims.map((claim) => [claim.id, claim]))

  assert.ok(homeContent.letter.paragraphs[0].includes(claims.get('hstl-debt')!.text))
  assert.deepEqual(
    homeContent.fieldNotes.cards.map((card) => card.claimId),
    ['rebuild-twelve-thousand-shares', 'brain2-twenty-one-outputs'],
  )
  for (const card of homeContent.fieldNotes.cards) assert.ok(claims.has(card.claimId), card.claimId)
  assert.equal(homeContent.fieldNotes.cards[0].href, '/about#origin-act-rebuilding')
  assert.equal(homeContent.fieldNotes.cards[1].href, claims.get('brain2-twenty-one-outputs')!.publicHref)
})

test('page copy matches the approved spec headings', () => {
  assert.equal(homeContent.eyebrow, 'Thông Phan · người dẫn đường')
  assert.equal(homeContent.title, 'AI đang đổi cách chúng ta làm việc và làm ăn. Bạn đang đứng ở phía nào?')
  assert.deepEqual(
    homeContent.doors.map((door) => [door.path, door.label]),
    [
      ['tensai', 'Tôi đi làm'],
      ['conan', 'Tôi đang hoặc muốn kinh doanh'],
    ],
  )
  assert.equal(homeContent.letter.title, 'Vì sao tui chia làm hai đường')
  assert.equal(homeContent.letter.paragraphs.length, 4)
  assert.equal(homeContent.fieldNotes.title, 'Việc thật, không phải lời hứa')
  assert.equal(homeContent.closing.title, 'Bắt đầu từ chỗ bạn đang đứng')

  assert.equal(tensaiContent.title, 'Bất kỳ ai cũng là thiên tài nếu được học đúng cách.')
  assert.equal(tensaiContent.primaryCta, 'Học thử miễn phí')
  assert.equal(tensaiContent.situations.items.length, 3)
  assert.deepEqual(
    tensaiContent.courses.items.map((course) => course.name),
    ['Workflow AI cơ bản', 'Hiểu về AI', 'Định vị'],
  )
  assert.doesNotMatch(JSON.stringify(tensaiContent), /Cách học đúng|Thuyết phục/)
  assert.equal(tensaiContent.method.steps.length, 3)
  assert.equal(tensaiContent.closing.crossLink.href, '/conan')

  assert.equal(conanContent.title, 'Xây doanh nghiệp đầu tiên trong kỷ nguyên AI.')
  assert.equal(conanContent.primaryCta, 'Vào Conan School')
  assert.equal(conanContent.journey.title, 'Từ một câu hỏi đến năng lực của một Builder.')
  assert.equal(conanContent.journey.stages.length, 5)
  assert.equal(
    conanContent.journey.stages.reduce((total, stage) => total + stage.questions.length, 0),
    11,
  )
  assert.deepEqual(
    conanContent.mentors.people.map((person) => [person.name, person.role]),
    [
      ['Đắc Nguyễn', 'CEO Conan School'],
      ['Thông Phan', 'CMO Conan School'],
    ],
  )
  assert.equal(conanContent.closing.crossLink.href, '/tensai')
  assert.equal(aboutPathContent.title, 'Vì sao có hai con đường')
})

test('only lib/two-path-links.ts spells the outbound destinations', async () => {
  const files = [
    'lib/two-path-content.ts',
    'components/two-path/PathDoors.tsx',
    'components/two-path/PathLink.tsx',
    'components/site-chrome/SiteFooter.tsx',
    'components/site-chrome/SiteHeader.tsx',
    'components/site-chrome/MobileMenu.tsx',
    'app/page.tsx',
    'app/tensai/page.tsx',
    'app/conan/page.tsx',
  ]
  for (const file of files) {
    assert.doesNotMatch(await readProjectFile(file), /learn\.thongphan\.com|conan\.school/, file)
  }
})

test('the Tensai hero lesson keeps one accepted answer and the app’s reply to every pick', () => {
  const { options, remember } = tensaiContent.lesson
  assert.deepEqual(
    options.filter((option) => option.correct).map((option) => option.key),
    ['A'],
  )
  for (const option of options) assert.ok(option.feedback.length > 20, option.key)
  assert.match(remember, /^Định vị có ý nghĩa/)
})
