# Thong Phan Experience Hub Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a canonical, image-rich `Trải nghiệm` hub on `thongphan.com` that presents only real available experiences, replaces the narrow `/challenges` wrapper without breaking links, and creates the versioned public registry later experience products can extend.

**Architecture:** A pure typed registry in `lib/experiences.ts` owns public experience metadata and release filtering. A static Next.js `/experiences` route renders the registry through one focused card component, while `/challenges` becomes a permanent compatibility redirect. Journey, navigation, route-mode, sitemap and SEO contracts change in the same repository; `learn.thongphan.com` remains an external dependency and receives no edits.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, CSS Modules, `next/image`, Node test runner through `tsx`, Playwright 1.58.

## Global Constraints

- Do not edit `/Users/rio/Projects/learn-conan-school`, its worktrees, schema, migrations, Worker, content packages or tests.
- Do not change the live Brain2 entitlement: days 01–07 remain public and days 08–21 remain Conan Maker-only.
- Do not publish Tools, Account, subscription or credit links before their routes and commercial contracts exist.
- `learn.thongphan.com` appears in the registry only when `NEXT_PUBLIC_LEARN_PUBLIC_ENABLED === 'true'` at build time. Serving `/learn/*` also requires the separate Pages runtime binding `LEARN_PUBLIC_ENABLED === 'true'`; missing/false runtime state remains a real noindex 404.
- The canonical public route is `/experiences`; `/challenges` permanently redirects to it because `/challenges` is already public.
- Render only published, currently usable experiences. Do not add coming-soon cards to inflate the catalog.
- Reuse approved real/generated raster assets already tracked in `public/images`; create no CSS illustration, handmade SVG, emoji-led hierarchy or generic stand-in.
- Preserve the Unified Cinema `evidence-dossier` route mode, warm paper reading surface, oxblood accent and restrained motion system.
- No face or subject may be clipped: media declares `fit` and `position`, and the card renderer obeys both.
- Stable content must be visible without JavaScript. Reduced motion removes choreography without removing content.
- Pass `1440×900`, `390×844` and `320×568`, keyboard navigation, visible focus, no horizontal overflow, no broken image and no header/title overlap.
- Do not add browser-only analytics events and call them measurement. This slice exposes stable `data-experience-id` attributes only; a real event sink belongs to a separate plan.
- Use TDD for every behavior change, run `git diff --check` before each commit, and do not mix unrelated worktree changes.

## Program Decomposition

This plan implements only the first independently releasable public-site slice. The approved ecosystem spec requires separate detailed plans after their gates are ready:

1. Brain2 Content Restoration is awaiting written-spec and visual-target approval; after both approvals it may execute its dedicated plan without changing this registry contract.
2. Free Experience Loop receives its own content/product spec for one deep article, the expertise diagnostic and a three-day artifact-producing challenge.
3. Content Tool v1 receives a separate product spec and unit-cost experiment before any credit sale.
4. Learn Subscription + Shared Credit begins only after a fresh Learn HEAD/STATUS checkpoint and a versioned owner/producer/consumer contract matrix.
5. Shared Account + Artifact Projection begins only after identity authority and artifact storage authority are agreed across repos.

## File Map

| File | Responsibility |
| --- | --- |
| `lib/experiences.ts` | pure versioned experience registry and release filtering |
| `components/experience/ExperienceCard.tsx` | accessible presentation of one experience |
| `components/experience/ExperienceCard.module.css` | card media framing, hierarchy and responsive behavior |
| `app/experiences/page.tsx` | canonical Experience Hub metadata and composition |
| `app/experiences/page.module.css` | page-level Cinema dossier layout |
| `public/_redirects` | permanent `/challenges` compatibility redirect |
| `app/sitemap.ts` | canonical public route discovery |
| `lib/site-route-mode.ts` | route theming and motion mode |
| `lib/site-journey.ts` | contextual handoff to the Experience Hub |
| `components/site-chrome/site-navigation.ts` | pinned navigation labels and release-aware Learn link |
| `components/site-chrome/MobileMenu.tsx` | secondary product destinations on mobile |
| `scripts/experience-registry.test.ts` | registry truthfulness and release filtering |
| `scripts/experience-hub-contract.test.ts` | source contract for the route and renderer |
| `scripts/experience-route-contract.test.mjs` | canonical route and stale-link guard |
| `scripts/qa-experiences.mjs` | rendered desktop/mobile/reduced-motion QA |

---

### Task 1: Versioned Public Experience Registry

**Files:**
- Create: `lib/experiences.ts`
- Create: `scripts/experience-registry.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: build-time boolean `includeLearn` from `lib/learn-release.ts` consumers.
- Produces: `ExperienceDefinition`, `experiences`, and `getPublishedExperiences({ includeLearn }: { includeLearn: boolean }): readonly ExperienceDefinition[]`.

- [ ] **Step 1: Write the failing registry contract**

Create `scripts/experience-registry.test.ts`:

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { experiences, getPublishedExperiences } from '../lib/experiences'

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
    assert.match(experience.media.src, /^\/images\//)
    assert.ok(experience.media.width > 0)
    assert.ok(experience.media.height > 0)
    assert.ok(experience.media.alt.length >= 20)
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

test('current Brain2 access copy stays truthful', () => {
  const brain2 = experiences.find(({ id }) => id === 'brain2-21-days')
  assert.equal(brain2?.access.label, 'Tuần 1 miễn phí · Tuần 2–3 cần quyền Conan Maker')
  assert.equal(brain2?.href, '/brain2/21-ngay')
})
```

Add `scripts/experience-registry.test.ts` to the explicit file list in the `test` script immediately before `scripts/site-journey.test.ts`.

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run:

```bash
node --import tsx --test scripts/experience-registry.test.ts
```

Expected: FAIL with `Cannot find module '../lib/experiences'`.

- [ ] **Step 3: Implement the smallest truthful registry**

Create `lib/experiences.ts`:

```ts
export type ExperienceType = 'article' | 'diagnostic' | 'guided-practice' | 'challenge' | 'course' | 'tool-trial'
export type ExperienceAvailability = 'always' | 'learn-public'
export type ExperienceAccess = 'public' | 'mixed'
export type ExperienceStatus = 'draft' | 'published' | 'retired'

export type ExperienceDefinition = Readonly<{
  id: string
  version: `${number}.${number}.${number}`
  type: ExperienceType
  status: ExperienceStatus
  availability: ExperienceAvailability
  href: string
  title: string
  promise: string
  audience: string
  problem: string
  durationLabel: string
  output: string
  ctaLabel: string
  access: Readonly<{ kind: ExperienceAccess; label: string }>
  media: Readonly<{
    src: string
    alt: string
    width: number
    height: number
    fit: 'cover' | 'contain'
    position: string
    source: 'owned' | 'generated'
    rights: 'owned-archive' | 'generated-for-thongphan'
  }>
}>

export const experiences: readonly ExperienceDefinition[] = [
  {
    id: 'expertise-asset-map',
    version: '1.0.0',
    type: 'diagnostic',
    status: 'published',
    availability: 'always',
    href: '/diagnostic',
    title: 'Bản đồ tài sản chuyên môn của bạn',
    promise: 'Nhìn rõ mình đang có nguyên liệu gì và đang kẹt ở bước nào trước khi chọn khóa học hay công cụ.',
    audience: 'Người có kinh nghiệm thật nhưng chưa biết nên biến nó thành nội dung, tài sản hay sản phẩm nào trước.',
    problem: 'Chuyên môn còn nằm rời rạc trong đầu nên mỗi lần làm content hoặc sản phẩm đều phải bắt đầu lại.',
    durationLabel: '5–7 phút',
    output: 'Một chẩn đoán vị trí hiện tại và bước nên làm tiếp theo trong hệ sinh thái.',
    ctaLabel: 'Tự soi vị trí',
    access: { kind: 'public', label: 'Miễn phí · Không cần tài khoản' },
    media: {
      src: '/images/homepage/thong-library-author.jpg',
      alt: 'Thông Phan ngồi trong không gian thư viện với những tài liệu đã xuất bản',
      width: 960,
      height: 960,
      fit: 'contain',
      position: '50% 50%',
      source: 'owned',
      rights: 'owned-archive',
    },
  },
  {
    id: 'brain2-21-days',
    version: '1.0.0',
    type: 'challenge',
    status: 'published',
    availability: 'always',
    href: '/brain2/21-ngay',
    title: '21 ngày xây Brain2 từ kinh nghiệm thật',
    promise: 'Gom kinh nghiệm, ca thật và góc nhìn riêng thành một nền tri thức mà AI có thể hiểu và hỗ trợ.',
    audience: 'Người muốn xây hệ thống tri thức cá nhân đủ sâu để tạo content và tài sản từ trải nghiệm của mình.',
    problem: 'Ghi chú, câu chuyện và bằng chứng đang phân tán nên AI chỉ tạo ra những câu trả lời chung chung.',
    durationLabel: '21 ngày',
    output: 'Một nền Brain2 có nguyên liệu thật, liên kết rõ và nhịp tạo đầu ra có thể tiếp tục.',
    ctaLabel: 'Bắt đầu Ngày 01',
    access: { kind: 'mixed', label: 'Tuần 1 miễn phí · Tuần 2–3 cần quyền Conan Maker' },
    media: {
      src: '/images/challenges/brain2-21-day-editorial-slate-v1.webp',
      alt: 'Lịch thực hành giấy, bút chì và bảng slate phim cho thử thách Brain2 21 ngày',
      width: 1200,
      height: 675,
      fit: 'contain',
      position: '50% 50%',
      source: 'generated',
      rights: 'generated-for-thongphan',
    },
  },
  {
    id: 'ai-foundation',
    version: '1.0.0',
    type: 'course',
    status: 'published',
    availability: 'learn-public',
    href: '/learn/free',
    title: 'AI Foundation cho người đi làm',
    promise: 'Học cách kiểm tra và sử dụng AI như một năng lực nghề nghiệp thay vì ghi nhớ thêm một danh sách công cụ.',
    audience: 'Người đi làm đang dùng AI rời rạc và cần một nền tảng tương tác có thể áp dụng vào công việc thật.',
    problem: 'Biết nhiều tool nhưng chưa có cách đánh giá output, đặt bài toán và chuyển kiến thức thành hành động.',
    durationLabel: 'Bài học tương tác',
    output: 'Một nền tư duy sử dụng AI có bằng chứng học tập và Tác phẩm áp dụng vào công việc.',
    ctaLabel: 'Học phần miễn phí',
    access: { kind: 'public', label: 'Mở khi Learn public' },
    media: {
      src: '/images/learn/course-ai-foundation.jpg',
      alt: 'Minh họa khóa AI Foundation trong thế giới học tập của Thông Phan Learn',
      width: 930,
      height: 797,
      fit: 'contain',
      position: '50% 50%',
      source: 'generated',
      rights: 'generated-for-thongphan',
    },
  },
]

export function getPublishedExperiences({ includeLearn }: { includeLearn: boolean }) {
  return experiences.filter((experience) =>
    experience.status === 'published'
      && (experience.availability === 'always' || includeLearn),
  )
}
```

- [ ] **Step 4: Run the focused contract and full TypeScript check**

Run:

```bash
node --import tsx --test scripts/experience-registry.test.ts
npx tsc --noEmit
```

Expected: 3 tests PASS; TypeScript exits 0.

- [ ] **Step 5: Commit the registry**

```bash
git add lib/experiences.ts scripts/experience-registry.test.ts package.json
git diff --cached --check
git commit -m "feat: add versioned experience registry"
```

---

### Task 2: Canonical Experience Hub and Accessible Cards

**Files:**
- Create: `components/experience/ExperienceCard.tsx`
- Create: `components/experience/ExperienceCard.module.css`
- Create: `app/experiences/page.tsx`
- Create: `app/experiences/page.module.css`
- Create: `scripts/experience-hub-contract.test.ts`
- Modify: `package.json`
- Modify: `lib/site-journey.ts` (compile dependency only: add `experiences` while preserving `challenges` until Task 4)

**Interfaces:**
- Consumes: `ExperienceDefinition` and `getPublishedExperiences({ includeLearn })` from Task 1; `learnPublicEnabled` from `lib/learn-release.ts`.
- Produces: static `/experiences` route, `ExperienceCard({ experience, index })`, stable `data-experience-id` hooks, and the minimal `JourneyKey = 'experiences'` plus final `journeyHandoffs.experiences` entry required for the page to typecheck.

- [ ] **Step 1: Write the failing source contract**

Create `scripts/experience-hub-contract.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)
const source = (path: string) => readFile(new URL(path, root), 'utf8')

test('Experience Hub renders the filtered registry with one canonical action per card', async () => {
  const [page, card] = await Promise.all([
    source('app/experiences/page.tsx'),
    source('components/experience/ExperienceCard.tsx'),
  ])

  assert.match(page, /alternates:\s*\{\s*canonical:\s*['"]\/experiences['"]\s*\}/)
  assert.match(page, /getPublishedExperiences\(\{\s*includeLearn:\s*learnPublicEnabled\s*\}\)/)
  assert.match(page, /<DossierHeader/)
  assert.match(page, /<ExperienceCard/)
  assert.match(page, /journeyKey="experiences"/)
  assert.match(card, /data-experience-id=\{experience\.id\}/)
  assert.match(card, /data-fit=\{experience\.media\.fit\}/)
  assert.match(card, /style=\{\{ objectPosition: experience\.media\.position \}\}/)
  assert.match(card, /experience\.durationLabel/)
  assert.match(card, /experience\.access\.label/)
  assert.match(card, /experience\.output/)
  assert.equal((card.match(/<Link\b/g) ?? []).length, 1)
})

test('Experience Hub uses real tracked images and no handmade illustration', async () => {
  const files = await Promise.all([
    source('app/experiences/page.tsx'),
    source('components/experience/ExperienceCard.tsx'),
    source('app/experiences/page.module.css'),
    source('components/experience/ExperienceCard.module.css'),
  ])
  const body = files.join('\n')
  assert.match(body, /from ['"]next\/image['"]/)
  assert.doesNotMatch(body, /<svg\b|createLucideIcon|emoji|CSS art/i)
})
```

Add it to the `test` script immediately after `scripts/experience-registry.test.ts`.

- [ ] **Step 2: Run the contract and verify missing files**

Run:

```bash
node --import tsx --test scripts/experience-hub-contract.test.ts
```

Expected: FAIL with `ENOENT` for `app/experiences/page.tsx`.

- [ ] **Step 3: Implement the focused card**

Create `components/experience/ExperienceCard.tsx`:

```tsx
import Image from 'next/image'
import Link from 'next/link'
import type { ExperienceDefinition } from '@/lib/experiences'
import styles from './ExperienceCard.module.css'

export default function ExperienceCard({
  experience,
  index,
}: {
  experience: ExperienceDefinition
  index: number
}) {
  return (
    <article
      className={styles.card}
      data-experience-id={experience.id}
      data-motion-surface
      data-reveal
    >
      <figure className={styles.media} data-fit={experience.media.fit}>
        <Image
          src={experience.media.src}
          alt={experience.media.alt}
          width={experience.media.width}
          height={experience.media.height}
          style={{ objectPosition: experience.media.position }}
        />
        <figcaption>TP / EXPERIENCE / {String(index + 1).padStart(2, '0')}</figcaption>
      </figure>
      <div className={styles.body}>
        <div className={styles.meta}>
          <span>{experience.durationLabel}</span>
          <span>{experience.access.label}</span>
        </div>
        <h2>{experience.title}</h2>
        <p className={styles.promise}>{experience.promise}</p>
        <dl>
          <div><dt>Phù hợp</dt><dd>{experience.audience}</dd></div>
          <div><dt>Đầu ra</dt><dd>{experience.output}</dd></div>
        </dl>
        <Link href={experience.href} className={styles.action} data-motion-action>
          {experience.ctaLabel} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}
```

Create `components/experience/ExperienceCard.module.css`:

```css
.card {
  background: var(--brand-reading-paper);
  border: 1px solid var(--brand-line-paper);
  display: grid;
  grid-template-columns: minmax(260px, .78fr) minmax(0, 1.22fr);
}

.media {
  background: var(--brand-reading-paper-deep);
  border-right: 1px solid var(--brand-line-paper);
  display: grid;
  margin: 0;
  min-height: 100%;
  overflow: hidden;
  place-items: center;
  position: relative;
}

.media img { display: block; height: 100%; max-height: 520px; width: 100%; }
.media[data-fit='cover'] img { object-fit: cover; }
.media[data-fit='contain'] img { object-fit: contain; }
.media figcaption {
  background: rgba(7, 7, 6, .86);
  bottom: 0;
  color: var(--brand-paper);
  font-family: var(--font-mono);
  font-size: .66rem;
  left: 0;
  letter-spacing: .08em;
  padding: .65rem .8rem;
  position: absolute;
}

.body { align-content: start; display: grid; gap: 1.1rem; padding: clamp(1.5rem, 4vw, 3rem); }
.meta { display: flex; flex-wrap: wrap; gap: .6rem 1rem; }
.meta span { color: var(--brand-lacquer); font-family: var(--font-mono); font-size: .7rem; font-weight: 700; text-transform: uppercase; }
.body h2 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3.6rem); letter-spacing: -.04em; line-height: .98; margin: 0; }
.promise { color: var(--brand-text-on-paper); font-size: 1.04rem; line-height: 1.65; margin: 0; max-width: 68ch; }
.body dl { display: grid; gap: .85rem; margin: 0; }
.body dl div { border-top: 1px solid var(--brand-line-paper); display: grid; gap: .35rem; grid-template-columns: 6rem 1fr; padding-top: .85rem; }
.body dt { color: var(--brand-lacquer); font-family: var(--font-mono); font-size: .68rem; font-weight: 700; text-transform: uppercase; }
.body dd { color: var(--brand-muted-on-paper); line-height: 1.55; margin: 0; }
.action { align-items: center; border-bottom: 1px solid currentColor; display: inline-flex; font-weight: 800; gap: .6rem; justify-self: start; min-height: 48px; text-decoration: none; }

@media (max-width: 760px) {
  .card { grid-template-columns: 1fr; }
  .media { border-bottom: 1px solid var(--brand-line-paper); border-right: 0; min-height: 230px; }
  .media img { max-height: 330px; }
  .body dl div { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Implement the canonical page**

Create `app/experiences/page.tsx`:

```tsx
import type { Metadata } from 'next'
import Image from 'next/image'
import { DossierHeader } from '@/components/dossier/DossierHeader'
import ExperienceCard from '@/components/experience/ExperienceCard'
import ChapterHandoff from '@/components/journey/ChapterHandoff'
import { getPublishedExperiences } from '@/lib/experiences'
import { learnPublicEnabled } from '@/lib/learn-release'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Trải nghiệm — Thông Phan',
  description: 'Chọn một trải nghiệm có đầu ra rõ: tự chẩn đoán, thực hành Brain2 hoặc học nền tảng AI tương tác.',
  alternates: { canonical: '/experiences' },
}

export default function ExperiencesPage() {
  const availableExperiences = getPublishedExperiences({ includeLearn: learnPublicEnabled })

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <DossierHeader
              eyebrow="Trải nghiệm thật"
              folio="TP / EXPERIENCE INDEX / 01"
              title="Đừng chỉ đọc. Hãy tạo ra một thứ thuộc về bạn."
              description="Mỗi trải nghiệm ở đây cho bạn biết thời gian cần bỏ ra, đầu ra sẽ mang về và bước đi tiếp nếu thấy phù hợp."
            />
            <figure className={styles.heroPortrait}>
              <Image
                src="/images/homepage/thong-library-author.jpg"
                alt="Thông Phan bên những cuốn sách và tài liệu do mình tạo ra"
                width={960}
                height={960}
                priority
              />
              <figcaption>Đọc để nhìn rõ · Làm để có bằng chứng</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.index} aria-labelledby="experience-index-title">
        <div className="container">
          <header className={styles.indexHeader}>
            <span>Chọn theo đầu ra</span>
            <h2 id="experience-index-title">Bắt đầu bằng việc bạn muốn mang về.</h2>
            <p>Chỉ những trải nghiệm đang hoạt động và có nội dung thật mới xuất hiện ở đây.</p>
          </header>
          <div className={styles.list}>
            {availableExperiences.map((experience, index) => (
              <ExperienceCard key={experience.id} experience={experience} index={index} />
            ))}
          </div>
        </div>
      </section>

      <ChapterHandoff journeyKey="experiences" tone="dark" />
    </div>
  )
}
```

Create `app/experiences/page.module.css`:

```css
.page { background: var(--brand-reading-paper); color: var(--brand-text-on-paper); min-height: 100vh; }
.hero, .index { border-bottom: 1px solid var(--brand-line-paper); padding: clamp(2.75rem, 7vw, 6.5rem) 0; }
.heroGrid { align-items: end; display: grid; gap: clamp(2rem, 6vw, 5rem); grid-template-columns: 1.08fr .92fr; }
.heroGrid > header { border: 0; padding: 0; }
.heroPortrait { background: var(--brand-reading-paper-deep); border: 1px solid var(--brand-line-paper); margin: 0; padding: .7rem; }
.heroPortrait img { display: block; height: auto; object-fit: contain; width: 100%; }
.heroPortrait figcaption { color: var(--brand-muted-on-paper); font-family: var(--font-mono); font-size: .68rem; padding: .75rem .3rem .2rem; text-transform: uppercase; }
.indexHeader { max-width: 820px; }
.indexHeader span { color: var(--brand-lacquer); font-family: var(--font-mono); font-size: .7rem; font-weight: 800; text-transform: uppercase; }
.indexHeader h2 { font-family: var(--font-display); font-size: clamp(2.3rem, 5vw, 4.8rem); letter-spacing: -.045em; line-height: .95; margin: .85rem 0 1rem; }
.indexHeader p { color: var(--brand-muted-on-paper); line-height: 1.65; }
.list { display: grid; gap: 1.2rem; margin-top: 2.5rem; }

@media (max-width: 800px) {
  .heroGrid { grid-template-columns: 1fr; }
  .heroPortrait { max-width: 34rem; }
}
```

- [ ] **Step 5: Run focused tests, lint and TypeScript**

Run:

```bash
node --import tsx --test scripts/experience-registry.test.ts scripts/experience-hub-contract.test.ts
npx tsc --noEmit
npx eslint app/experiences components/experience lib/experiences.ts scripts/experience-*.test.ts --max-warnings=0
```

Expected: 5 tests PASS; TypeScript and ESLint exit 0.

- [ ] **Step 6: Commit the canonical hub**

```bash
git add app/experiences components/experience scripts/experience-hub-contract.test.ts package.json
git diff --cached --check
git commit -m "feat: add canonical experience hub"
```

---

### Task 3: Canonical Route Migration and SEO Safety

**Files:**
- Delete: `app/challenges/page.tsx`
- Delete: `app/challenges/page.module.css`
- Delete: `lib/challenges.ts`
- Modify: `public/_redirects`
- Modify: `app/sitemap.ts`
- Modify: `lib/site-route-mode.ts`
- Modify: `scripts/site-route-mode.test.ts`
- Modify: `scripts/subpage-cinema-contract.test.mjs`
- Modify: `scripts/seo-contract.test.mjs`
- Create: `scripts/experience-route-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: canonical `/experiences` page from Task 2.
- Produces: one canonical route, permanent old-route compatibility, `evidence-dossier` shell and stale-link guard.

- [ ] **Step 1: Write the failing route migration contract**

Create `scripts/experience-route-contract.test.mjs`:

```js
import assert from 'node:assert/strict'
import { access, readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function sources(directory) {
  const entries = await readdir(new URL(`${directory}/`, root), { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) return sources(path)
    return /\.(?:ts|tsx|mjs)$/.test(entry.name) && !entry.name.includes('.test.') ? [path] : []
  }))
  return nested.flat()
}

test('Experience Hub is canonical and the retired route exists only as a redirect', async () => {
  await access(new URL('app/experiences/page.tsx', root))
  await assert.rejects(access(new URL('app/challenges/page.tsx', root)))

  const redirects = await readFile(new URL('public/_redirects', root), 'utf8')
  assert.match(redirects, /^\/challenges \/experiences 301$/m)
})

test('executable source contains no stale /challenges destination', async () => {
  const files = (await Promise.all(['app', 'components', 'lib'].map(sources))).flat()
  const bodies = await Promise.all(files.map(async (file) => ({
    file,
    body: await readFile(new URL(file, root), 'utf8'),
  })))
  const stale = bodies.filter(({ body }) => /['"]\/challenges(?:\/|['"])/.test(body)).map(({ file }) => file)
  assert.deepEqual(stale, [])
})
```

Add it to the `test` script immediately after `scripts/experience-hub-contract.test.ts`.

- [ ] **Step 2: Update existing tests before production files**

Apply these exact expected-contract changes:

```ts
// scripts/site-route-mode.test.ts cases
['/experiences', 'evidence-dossier'],
['/experiences/brain2', 'evidence-dossier'],
```

Remove the two `/challenges` route-mode cases and replace every enabled-list occurrence with `/experiences` equivalents.

In `scripts/subpage-cinema-contract.test.mjs`, change the migrated route tuple and route-mode assertions from `challenges` to:

```js
['experiences', 'app/experiences/page.tsx', 'app/experiences/page.module.css']
```

In the test currently named `challenge data and chat runtime have one source of truth`, replace only its challenge assertions with:

```js
assert.ok(existsSync(new URL('../lib/experiences.ts', import.meta.url)))
assert.equal(existsSync(new URL('../lib/challenges.ts', import.meta.url)), false)
const experienceIndex = read('app/experiences/page.tsx')
assert.match(experienceIndex, /from ['"]@\/lib\/experiences['"]/)
assert.match(experienceIndex, /getPublishedExperiences/)
assert.match(experienceIndex, /<ExperienceCard/)
assert.equal(existsSync(new URL('../app/challenges/page.tsx', import.meta.url)), false)
```

Keep every chat-runtime assertion in that test unchanged and rename the test to
`experience data and chat runtime have one source of truth`.

In the final visual test of that file, replace the old `challengeSource` block with:

```js
const experienceSource = read('app/experiences/page.tsx')
const cardSource = read('components/experience/ExperienceCard.tsx')
assert.match(experienceSource, /thong-library-author\.jpg/)
assert.match(cardSource, /experience\.media\.src/)
assert.doesNotMatch(`${experienceSource}\n${cardSource}`, /dayDeck|dayStack|Array\.from\(\{ length: 21 \}\)/)
assert.ok(existsSync(new URL('../public/images/challenges/brain2-21-day-editorial-slate-v1.webp', import.meta.url)))
assert.ok(existsSync(new URL('../public/images/learn/course-ai-foundation.jpg', import.meta.url)))
```

In `scripts/seo-contract.test.mjs`, add `/challenges /experiences 301` to the exact redirect array and add this sitemap assertion:

```js
assert.match(sitemap, /<loc>https:\/\/thongphan\.com\/experiences<\/loc>/)
assert.doesNotMatch(sitemap, /<loc>https:\/\/thongphan\.com\/challenges<\/loc>/)
```

- [ ] **Step 3: Run the focused tests and verify they fail against current production files**

Run:

```bash
node --import tsx --test scripts/experience-route-contract.test.mjs scripts/site-route-mode.test.ts scripts/subpage-cinema-contract.test.mjs
```

Expected: FAIL because `/challenges` still exists and `/experiences` is not in the route-mode contract.

- [ ] **Step 4: Migrate the canonical route**

Delete the two `app/challenges` files and `lib/challenges.ts`. Add this exact line to `public/_redirects`:

```text
/challenges /experiences 301
```

In `app/sitemap.ts`, replace `'/challenges'` with `'/experiences'`.

In `lib/site-route-mode.ts`, replace both exact and prefix challenge entries with:

```ts
'/experiences': 'evidence-dossier',
```

and:

```ts
['/experiences', 'evidence-dossier'],
```

- [ ] **Step 5: Run route, SEO and build contracts**

Run:

```bash
node --import tsx --test scripts/experience-route-contract.test.mjs scripts/site-route-mode.test.ts scripts/subpage-cinema-contract.test.mjs
npm run build
npm run test:seo
```

Expected: focused route tests PASS; static export succeeds; SEO contract PASS with `/experiences` canonical and only `/challenges` redirect compatibility.

- [ ] **Step 6: Commit the route migration**

```bash
git add app/challenges app/experiences app/sitemap.ts lib/challenges.ts lib/site-route-mode.ts public/_redirects scripts/experience-route-contract.test.mjs scripts/site-route-mode.test.ts scripts/subpage-cinema-contract.test.mjs scripts/seo-contract.test.mjs package.json
git diff --cached --check
git commit -m "refactor: make experiences the canonical practice hub"
```

---

### Task 4: Journey and Pinned Navigation Integration

**Files:**
- Modify: `lib/site-journey.ts`
- Modify: `scripts/site-journey.test.ts`
- Modify: `components/site-chrome/site-navigation.ts`
- Modify: `components/site-chrome/MobileMenu.tsx`
- Modify: `components/site-chrome/SiteChrome.module.css`
- Modify: `scripts/site-chrome-contract.test.ts`

**Interfaces:**
- Consumes: canonical `/experiences`, release flag `learnPublicEnabled`, existing ChapterHandoff and mobile focus trap.
- Produces: `JourneyKey = 'experiences'`, `getPrimaryNavigation(includeLearn)`, primary and secondary navigation with no dead route.

- [ ] **Step 1: Update tests to express the new journey and navigation**

In `scripts/site-journey.test.ts`, add these assertions and replace the former challenge-hub expectation:

```ts
assert.equal(getJourneyHandoff('experiences').primary.href, '/brain2/21-ngay')
assert.equal(getJourneyHandoff('asset-detail').primary.href, '/experiences')
```

Add this test to `scripts/site-chrome-contract.test.ts`:

```ts
test('navigation promotes real experiences and hides gated Learn cleanly', async () => {
  const { getPrimaryNavigation, secondaryNavigation } = await import(
    '../components/site-chrome/site-navigation'
  )

  assert.deepEqual(getPrimaryNavigation(false), [
    { href: '/about', label: 'Câu chuyện' },
    { href: '/library', label: 'Thư viện' },
    { href: '/experiences', label: 'Trải nghiệm' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
  ])
  assert.deepEqual(getPrimaryNavigation(true), [
    { href: '/about', label: 'Câu chuyện' },
    { href: '/library', label: 'Thư viện' },
    { href: '/experiences', label: 'Trải nghiệm' },
    { href: '/learn', label: 'Học' },
    { href: '/diagnostic', label: 'Chẩn đoán' },
  ])
  assert.deepEqual(secondaryNavigation, [
    { href: '/assets', label: 'Tài sản' },
    { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
    { href: '/conanmaker/', label: 'Conan Maker' },
  ])
})
```

In the existing exact primary-navigation test, replace direct `primaryNavigation` comparison with `getPrimaryNavigation(false)` and retain the homepage chapter assertions.

- [ ] **Step 2: Run focused tests and verify the old contract fails**

Run:

```bash
node --import tsx --test scripts/site-journey.test.ts scripts/site-chrome-contract.test.ts
```

Expected: FAIL because the retired `challenges` journey key still exists and `getPrimaryNavigation` does not exist.

- [ ] **Step 3: Update the journey model**

In `lib/site-journey.ts`:

1. Remove the retired `JourneyKey` member `'challenges'`; preserve the existing `'experiences'` member added by Task 2.
2. Verify `actions.experiences`, moved forward by Task 3 for canonical-link safety, matches:

```ts
experiences: {
  href: '/experiences',
  label: 'Chọn một trải nghiệm',
  reason: 'Chọn theo thời gian, đầu ra và mức cam kết thay vì mở thêm nội dung ngẫu nhiên.',
  eyebrow: 'Bắt tay làm',
},
```

3. Verify `asset-detail.primary` already uses `actions.experiences`; do not add a second action.
4. Verify the existing hub handoff still matches this exact final contract; do not add a duplicate:

```ts
experiences: {
  chapter: 'Chọn một cam kết',
  title: 'Bắt đầu bằng một đầu ra đủ nhỏ để hoàn thành.',
  description: 'Tự chẩn đoán nếu chưa rõ vị trí, hoặc bắt đầu Brain2 nếu bạn đã sẵn sàng gom tri thức thật.',
  primary: actions.brain2Challenge,
  secondary: [actions.diagnostic, actions.library],
},
```

Keep `'challenge-detail'` unchanged because it remains a valid future handoff type and does not create a route.

- [ ] **Step 4: Make navigation release-aware without exposing dead Tools or Account links**

Replace the primary/secondary arrays in `components/site-chrome/site-navigation.ts` with:

```ts
import { learnPublicEnabled } from '@/lib/learn-release'

const coreNavigation = [
  { href: '/about', label: 'Câu chuyện' },
  { href: '/library', label: 'Thư viện' },
  { href: '/experiences', label: 'Trải nghiệm' },
] as const

export function getPrimaryNavigation(includeLearn: boolean) {
  return [
    ...coreNavigation,
    ...(includeLearn ? [{ href: '/learn', label: 'Học' } as const] : []),
    { href: '/diagnostic', label: 'Chẩn đoán' } as const,
  ]
}

export const primaryNavigation = getPrimaryNavigation(learnPublicEnabled)

export const secondaryNavigation = [
  { href: '/assets', label: 'Tài sản' },
  { href: '/brain2/21-ngay', label: '21 ngày Brain2' },
  { href: '/conanmaker/', label: 'Conan Maker' },
] as const
```

Keep `homepageChapterNavigation` unchanged.

In `MobileMenu.tsx`, import `secondaryNavigation` and add this block immediately after the primary nav:

```tsx
<nav className={styles.mobileSecondaryNav} aria-label="Điểm đến mở rộng">
  {secondaryNavigation.map((link) =>
    link.href === '/conanmaker/' ? (
      <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
    ) : (
      <Link key={link.href} href={link.href} onClick={closeMenu}>{link.label}</Link>
    ),
  )}
</nav>
```

Add to `SiteChrome.module.css`:

```css
.mobileSecondaryNav {
  border-top: 1px solid var(--brand-line-dark);
  display: grid;
  gap: .2rem;
  margin-top: 1rem;
  padding-top: 1rem;
}

.mobileSecondaryNav a {
  align-items: center;
  color: color-mix(in srgb, var(--brand-paper) 76%, transparent);
  display: flex;
  min-height: 44px;
  min-width: 44px;
  text-decoration: none;
}
```

Extend the existing 44px target test selector list with `'mobileSecondaryNav a'`.

- [ ] **Step 5: Run journey, navigation, accessibility and full source tests**

Run:

```bash
node --import tsx --test scripts/site-journey.test.ts scripts/site-chrome-contract.test.ts scripts/mobile-menu-focus.test.ts
npm test
npx tsc --noEmit
```

Expected: focused tests PASS; full source suite PASS; TypeScript exits 0.

- [ ] **Step 6: Commit journey and navigation integration**

```bash
git add lib/site-journey.ts scripts/site-journey.test.ts components/site-chrome scripts/site-chrome-contract.test.ts
git diff --cached --check
git commit -m "feat: connect experiences to site journey"
```

---

### Task 5: Rendered Visual, Motion and Accessibility QA

**Files:**
- Create: `scripts/qa-experiences.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: static export at `QA_BASE_URL`, default `http://127.0.0.1:3022`.
- Produces: `/tmp/thongphan-experience-hub-qa/report.json`, twenty authoritative
  normal-viewport segment screenshots (`top`, `card-1`, `card-2`, `handoff` for
  each of five cases), and one active-motion desktop viewport screenshot.

**2026-07-13 evidence architecture decision:** Headless Chromium full-page capture
is nondeterministic for this route and produced black compositor tiles after two
capture-only mitigation rounds. It is retired as authoritative evidence. See
`docs/qa/STUCK_REPORT_EXPERIENCE_FULLPAGE_CAPTURE_2026-07-13.md`. Task 5 uses
faithful segmented viewport evidence and retains the objective DOM/content,
reduced-motion, no-JavaScript and keyboard contracts. It must not hide production
content. A corrupt ordinary viewport screenshot is a stop condition, not an
invitation for another workaround.

- [ ] **Step 1: Add the rendered QA script**

Create `scripts/qa-experiences.mjs`:

```js
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright'

const base = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3022'
const output = process.env.QA_OUTPUT_DIR ?? '/tmp/thongphan-experience-hub-qa'
const cases = [
  { name: 'desktop', width: 1440, height: 900, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'mobile', width: 390, height: 844, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'mobile-320', width: 320, height: 568, reducedMotion: 'no-preference', javascriptEnabled: true },
  { name: 'desktop-reduced', width: 1440, height: 900, reducedMotion: 'reduce', javascriptEnabled: true },
  { name: 'desktop-no-js', width: 1440, height: 900, reducedMotion: 'no-preference', javascriptEnabled: false },
]

await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []

try {
  for (const item of cases) {
    const context = await browser.newContext({
      viewport: { width: item.width, height: item.height },
      reducedMotion: item.reducedMotion,
      javaScriptEnabled: item.javascriptEnabled,
    })
    const page = await context.newPage()
    const errors = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    page.on('pageerror', (error) => errors.push(error.message))

    const response = await page.goto(`${base}/experiences.html`, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      await document.fonts?.ready
      window.scrollTo(0, document.body.scrollHeight)
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
      window.scrollTo(0, 0)
    })

    const state = await page.evaluate(() => {
      const header = document.querySelector('header[data-header-scrolled]')?.getBoundingClientRect()
      const title = document.querySelector('h1')?.getBoundingClientRect()
      const overlap = header && title
        ? Math.max(0, Math.min(header.bottom, title.bottom) - Math.max(header.top, title.top))
        : 0
      return {
        h1Count: document.querySelectorAll('h1').length,
        cardCount: document.querySelectorAll('[data-experience-id]').length,
        overflow: document.documentElement.scrollWidth - innerWidth,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
        headerTitleOverlap: overlap,
        reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }
    })

    if (response?.status() !== 200) throw new Error(`${item.name}: HTTP ${response?.status()}`)
    if (state.h1Count !== 1) throw new Error(`${item.name}: expected one H1`)
    if (state.cardCount < 2) throw new Error(`${item.name}: expected at least two real experiences`)
    if (state.overflow > 1) throw new Error(`${item.name}: horizontal overflow ${state.overflow}px`)
    if (state.brokenImages) throw new Error(`${item.name}: ${state.brokenImages} broken images`)
    if (state.headerTitleOverlap > 0) throw new Error(`${item.name}: header overlaps title`)
    if (item.reducedMotion === 'reduce' && !state.reduced) throw new Error(`${item.name}: reduced motion did not apply`)
    if (errors.length) throw new Error(`${item.name}: ${errors.join(' | ')}`)

    await page.screenshot({ path: `${output}/${item.name}.png`, fullPage: true })
    results.push({ ...item, ...state, errors })
    await context.close()
  }

  const keyboard = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await keyboard.goto(`${base}/experiences`, { waitUntil: 'networkidle' })
  await keyboard.keyboard.press('Tab')
  const firstFocus = await keyboard.evaluate(() => ({
    tag: document.activeElement?.tagName,
    outline: getComputedStyle(document.activeElement).outlineStyle,
  }))
  if (!firstFocus.tag || firstFocus.outline === 'none') throw new Error('keyboard: first focus is not visible')
  await keyboard.close()
} finally {
  await browser.close()
}

await writeFile(`${output}/report.json`, `${JSON.stringify(results, null, 2)}\n`)
console.log(`Experience QA passed ${results.length}/${cases.length}: ${output}`)
```

Add this package script:

```json
"qa:experiences": "node scripts/qa-experiences.mjs"
```

- [ ] **Step 2: Build and serve the static export**

Run terminal A:

```bash
npm run build
python3 -m http.server 3022 --bind 127.0.0.1 --directory out
```

Expected: build exports `/experiences`; the server listens on `127.0.0.1:3022`.

- [ ] **Step 3: Run rendered QA**

Run terminal B:

```bash
npm run qa:experiences
```

Expected: `Experience QA passed 5/5 with 21 viewport screenshots`, twenty named
segment screenshots, `desktop-motion-viewport.png`, and `report.json` with segment
target/scroll/viewport metadata under `/tmp/thongphan-experience-hub-qa`.

- [ ] **Step 4: Inspect the screenshots at original resolution**

Open all 21 PNG files at original resolution and verify:

- the pinned header never covers the title;
- every subject remains complete inside its frame;
- the 320px cards do not force horizontal scroll;
- typography, paper, oxblood, image treatment and motion atmosphere belong to the existing Cinema system;
- no empty card, coming-soon promise or Learn card appears when the release flag is false;
- reduced-motion and no-JavaScript segments contain the same content signatures;
- no segment contains a black compositor tile or a clipped media subject.

If any item fails, add the smallest failing contract to `experience-hub-contract.test.ts` or `qa-experiences.mjs`, reproduce, then fix the source before continuing.

- [ ] **Step 5: Commit the QA harness**

```bash
git add scripts/qa-experiences.mjs package.json
git diff --cached --check
git commit -m "test: add Experience Hub rendered QA"
```

---

### Task 6: Release-Candidate Verification and Status Handoff

**Files:**
- Modify: `docs/STATUS.md`
- Create: `docs/qa/EXPERIENCE_HUB_FOUNDATION_REPORT.md`

**Interfaces:**
- Consumes: Tasks 1–5 at one clean HEAD.
- Produces: locally verified release candidate and evidence for a later authorized production deployment.

- [ ] **Step 1: Run the complete local verification matrix**

Run:

```bash
npm run lint
npm test
npx tsc --noEmit
npm run build
npm run test:build
npm run test:seo
npm run test:bundle
npm audit --omit=dev
git diff --check
```

Expected: every command exits 0; production dependency audit has zero vulnerability; static export contains `/experiences` and no `/challenges` page.

- [ ] **Step 2: Verify both Learn release states without touching Learn**

Run:

```bash
NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=false npm run build
rg -n "AI Foundation cho người đi làm" out/experiences.html && exit 1 || true
NEXT_PUBLIC_LEARN_PUBLIC_ENABLED=true npm run build
rg -n "AI Foundation cho người đi làm" out/experiences.html
```

Expected: the false build contains no Learn card; the true build contains the AI Foundation card; no command changes `/Users/rio/Projects/learn-conan-school`.

- [ ] **Step 3: Write the QA report with fixed evidence fields**

Create `docs/qa/EXPERIENCE_HUB_FOUNDATION_REPORT.md` with:

```markdown
# Experience Hub Foundation QA Report

Date: 2026-07-13
Verdict: local release candidate passed

## Scope

- Canonical `/experiences` hub
- Permanent `/challenges` compatibility redirect
- Versioned published-experience registry
- Release-aware Learn card
- Journey, pinned navigation, sitemap and route-mode integration
- No Learn runtime or contract modification

## Automated verification

- `npm run lint`: passed
- `npm test`: passed
- `npx tsc --noEmit`: passed
- `npm run build`: passed
- `npm run test:build`: passed
- `npm run test:seo`: passed
- `npm run test:bundle`: passed
- `npm audit --omit=dev`: zero production vulnerability
- `git diff --check`: passed

## Rendered verification

- 1440x900: passed
- 390x844: passed
- 320x568: passed
- 1440x900 reduced motion: passed
- 1440x900 JavaScript disabled: passed
- Keyboard visible focus: passed
- Horizontal overflow: zero
- Broken images: zero
- Header/title overlap: zero
- Evidence: `/tmp/thongphan-experience-hub-qa`

## Boundary verification

- `/Users/rio/Projects/learn-conan-school` was not modified.
- Brain2 day 01–07 public / day 08–21 Conan access remained unchanged.
- Tools, Account, subscription and credit links were not exposed.
- Production deployment was not performed by this plan.
```

- [ ] **Step 4: Update STATUS with the verified boundary**

Add this section near the top of `docs/STATUS.md`:

```markdown
## Experience Hub Foundation — locally verified — 2026-07-13

- `/experiences` is the canonical public hub for currently usable diagnostic,
  challenge and release-enabled Learn experiences.
- `/challenges` is redirect-only; sitemap, journey and pinned navigation use the
  canonical Experience route.
- The registry is versioned, fail-closed for Learn and exposes no unavailable Tool,
  Account, subscription or credit destination.
- Desktop, mobile, reduced-motion, keyboard, link, SEO, build and source contracts
  pass. Evidence is recorded in `docs/qa/EXPERIENCE_HUB_FOUNDATION_REPORT.md`.
- Learn runtime and the live Brain2 access boundary were not changed.
- Production deployment remains a separate explicitly authorized release action.
```

- [ ] **Step 5: Commit the verified release candidate**

```bash
git add docs/STATUS.md docs/qa/EXPERIENCE_HUB_FOUNDATION_REPORT.md
git diff --cached --check
git commit -m "docs: verify Experience Hub release candidate"
git status --short --branch
```

Expected: commit succeeds and the feature worktree is clean.

## Production Release Boundary

This plan stops at a local release candidate. Production deployment is a separate external-state action. Before deploying, the release owner must confirm the desired Learn flag, deploy the exact verified commit, smoke `/experiences`, `/challenges`, `/diagnostic`, `/brain2/21-ngay` and `/learn`, then record deployment ID and canonical smoke evidence in `docs/STATUS.md`.
