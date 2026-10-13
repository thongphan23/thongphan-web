# Kế hoạch thực thi: tái dựng thongphan.com hai con đường

> **Cho agent thực thi:** dùng superpowers:executing-plans (Native) theo từng task; bước dùng checkbox `- [ ]`. Theo ủy quyền ở spec §0, agent tự thực thi theo TDD, không dừng chờ duyệt plan.

**Mục tiêu:** trang chủ chia hai cửa (Tensai cho người đi làm, Conan School cho người kinh doanh), hai trang nhánh `/tensai` và `/conan`, `/about` mới, khung header/footer mới; ảnh thật có manifest khuôn mặt.

**Kiến trúc:** nội dung và ảnh là hằng có kiểu trong `lib/two-path-*.ts`; component server trong `components/two-path/` đọc các hằng đó; client chỉ ở `PathLink`, `PathMemory`, `PathResume` và header. Khung chung giữ `SiteChrome`, thay dữ liệu điều hướng. Trang chủ cũ `components/home-cinema/*` bị gỡ.

**Công nghệ:** Next 16.2.10 App Router (static export, `next build --webpack`), React 19, TypeScript 6, CSS Modules, `lucide-react`, `node --import tsx --test`, Playwright với `channel: 'chrome'`, Pillow + `cwebp` + Swift Vision cho ảnh.

**Spec:** `docs/superpowers/specs/2026-10-13-thongphan-two-path-rebuild-design.md`

## Ràng buộc chung

- Chữ trên trang lấy nguyên văn từ spec §2; không thêm lời hứa thu nhập, không giá, không "Odin", không "Biến chuyên môn thật thành tài sản", không "AI PHẢI RA TIỀN", không "há há", không Bé Lửa/Nunito.
- Link ra Tensai/Conan chỉ tạo qua `outboundUrl()` trong `lib/two-path-links.ts`, UTM `utm_source=thongphan.com&utm_medium=referral&utm_campaign=two-path&utm_content=<placement>`.
- `TENSAI_URL = 'https://learn.thongphan.com/'`, `CONAN_URL = 'https://www.conan.school/'`.
- localStorage key `tp:path`; mọi truy cập bọc try/catch.
- Màu nhánh: Tensai accent `#073B2F`, CTA nền `#C3F331` chữ `#073B2F`, dấu trên ink `#C3F331`; Conan dấu `#D94F2B` (không cho chữ thân bài), CTA nền `#C4441F` chữ `#FFFFFF`.
- Ngân sách ảnh: hero ≤180KB; cửa/chân dung/"Việc thật"/ảnh app ≤140KB; gallery ≤120KB; mentor ≤60KB. JS riêng trang chủ ≤35KB gzip so với about.
- Một `h1` mỗi trang; không `<video>`; vùng chạm ≥44px; reveal ≤16px ≤400ms; tắt khi reduced-motion.
- Không sửa `public/images/homepage/` (route khác còn dùng). Không commit ảnh gốc DQH179.
- Không deploy. Không chạy `npx playwright install`.
- Mọi lệnh: `cd /Users/rio/thongphan-com/.worktrees/two-path-rebuild && …`.

## Review Focus

1. **localStorage bị chặn hoặc chứa rác** (`tp:path = "xyz"`, Safari private): trang vẫn render, không hiện dòng "Tiếp tục…". Test ở Task 1 (`readStoredPath` với giá trị lạ và storage ném lỗi).
2. **Chữ dài trên cửa ở 320px** ("Tôi đang hoặc muốn kinh doanh"): không tràn ngang, không cắt chữ. Kiểm ở Task 8 (QA 320×568 `scrollWidth ≤ innerWidth`).
3. **Người dùng bàn phím mở "Thêm"**: Escape đóng và trả focus về nút, click ngoài đóng. Test nguồn ở Task 4, kiểm hành vi ở Task 8.
4. **Ảnh chưa có consent lọt lên production**: cổng `test:photo-consent` cuối `test:release` đỏ cho tới khi anh xác nhận. Test ở Task 2.
5. **Dòng "Tiếp tục…" gây nhảy bố cục khi hydrate**: chỗ dòng này có `min-height` cố định. Kiểm ở Task 3 (CSS) và Task 8 (ảnh chụp có/không có storage).

---

### Task 1: Thư viện nền (link, bộ nhớ nhánh, nội dung)

**Files:**
- Create: `lib/two-path-links.ts`, `lib/path-memory.ts`, `lib/two-path-content.ts`
- Test: `scripts/two-path-content.test.ts`

**Interfaces (Produces):**
```ts
// lib/two-path-links.ts
export type PathKey = 'tensai' | 'conan'
export type Placement = 'hero' | 'door' | 'nav' | 'footer' | 'page' | 'closing'
export const TENSAI_URL: 'https://learn.thongphan.com/'
export const CONAN_URL: 'https://www.conan.school/'
export const PATH_KEYS: readonly PathKey[]
export const PATH_ROUTES: Record<PathKey, '/tensai' | '/conan'>
export const PATH_LABELS: Record<PathKey, string>          // Tensai | Conan School
export function isPathKey(value: unknown): value is PathKey
export function withUtm(url: string, placement: Placement): string
export function outboundUrl(path: PathKey, placement: Placement): string
export function doorEvent(path: PathKey, placement: Placement): { name: 'path_door_selected'; detail: { path: PathKey; placement: Placement } }
export function outboundEvent(path: PathKey, placement: Placement): { name: 'outbound_tensai' | 'outbound_conan'; detail: { placement: Placement } }

// lib/path-memory.ts
export const PATH_STORAGE_KEY = 'tp:path'
export type PathStorage = Pick<Storage, 'getItem' | 'setItem'>
export function readStoredPath(storage: PathStorage | null): PathKey | null
export function writeStoredPath(storage: PathStorage | null, path: PathKey): void
export function browserStorage(): PathStorage | null

// lib/two-path-content.ts
export const homeContent, tensaiContent, conanContent, aboutPathContent
```

- [ ] **Step 1: Viết test hỏng** `scripts/two-path-content.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import originEvidence from '../content/proof/origin-story-evidence.json'
import { doorEvent, outboundEvent, outboundUrl, withUtm } from '../lib/two-path-links'
import { readStoredPath, writeStoredPath } from '../lib/path-memory'
import { aboutPathContent, conanContent, homeContent, tensaiContent } from '../lib/two-path-content'

const allContent = JSON.stringify({ homeContent, tensaiContent, conanContent, aboutPathContent })
const BANNED = [/Biến chuyên môn thật thành tài sản/i, /AI PHẢI RA TIỀN/i, /há há/i, /\bOdin\b/i, /Bé Lửa/i, /Nunito/i,
  /thu nhập/i, /Scale Better/i, /\d[\d.,]*\s*(?:đ|đồng|vnđ|vnd|triệu|k)\b/i, /₫|\$\d/]

test('two-path copy never carries banned positioning, prices or income promises', () => {
  for (const pattern of BANNED) assert.doesNotMatch(allContent, pattern)
})

test('outbound links always carry the two-path UTM contract', () => {
  const url = new URL(outboundUrl('tensai', 'hero'))
  assert.equal(url.origin, 'https://learn.thongphan.com')
  assert.equal(url.searchParams.get('utm_source'), 'thongphan.com')
  assert.equal(url.searchParams.get('utm_medium'), 'referral')
  assert.equal(url.searchParams.get('utm_campaign'), 'two-path')
  assert.equal(url.searchParams.get('utm_content'), 'hero')
  assert.equal(new URL(outboundUrl('conan', 'footer')).origin, 'https://www.conan.school')
  assert.equal(new URL(withUtm('https://www.conan.school/?a=1', 'page')).searchParams.get('a'), '1')
  assert.deepEqual(doorEvent('conan', 'door'), { name: 'path_door_selected', detail: { path: 'conan', placement: 'door' } })
  assert.deepEqual(outboundEvent('tensai', 'closing'), { name: 'outbound_tensai', detail: { placement: 'closing' } })
})

test('stored path survives garbage values and blocked storage', () => {
  const store = new Map<string, string>()
  const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) }
  assert.equal(readStoredPath(storage), null)
  writeStoredPath(storage, 'conan')
  assert.equal(readStoredPath(storage), 'conan')
  store.set('tp:path', 'xyz')
  assert.equal(readStoredPath(storage), null)
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
  assert.equal(readStoredPath(blocked), null)
  assert.doesNotThrow(() => writeStoredPath(blocked, 'tensai'))
  assert.equal(readStoredPath(null), null)
})

test('homepage letter quotes the debt claim verbatim and cards cite real claims', () => {
  const claims = new Map(originEvidence.claims.map((c) => [c.id, c]))
  assert.ok(homeContent.letter.paragraphs[0].includes(claims.get('hstl-debt')!.text))
  for (const card of homeContent.fieldNotes.cards) assert.ok(claims.has(card.claimId), card.claimId)
  const brain2 = homeContent.fieldNotes.cards.find((c) => c.claimId === 'brain2-twenty-one-outputs')!
  assert.equal(brain2.href, claims.get('brain2-twenty-one-outputs')!.publicHref)
})

test('page copy matches the approved spec headings', () => {
  assert.equal(homeContent.title, 'AI đang đổi cách chúng ta làm việc và làm ăn. Bạn đang đứng ở phía nào?')
  assert.deepEqual(homeContent.doors.map((d) => d.path), ['tensai', 'conan'])
  assert.equal(tensaiContent.title, 'Bất kỳ ai cũng là thiên tài nếu được học đúng cách.')
  assert.deepEqual(tensaiContent.courses.items.map((c) => c.name), ['Workflow AI cơ bản', 'Hiểu về AI', 'Định vị'])
  assert.equal(conanContent.title, 'Xây doanh nghiệp đầu tiên trong kỷ nguyên AI.')
  assert.equal(conanContent.journey.stages.length, 5)
  assert.deepEqual(conanContent.mentors.people.map((p) => p.role), ['CEO Conan School', 'CMO Conan School'])
})

test('only lib/two-path-links.ts spells the outbound destinations', async () => {
  const files = ['lib/two-path-content.ts', 'components/two-path/PathDoors.tsx', 'components/two-path/PathLink.tsx',
    'components/site-chrome/SiteFooter.tsx', 'components/site-chrome/SiteHeader.tsx', 'app/tensai/page.tsx', 'app/conan/page.tsx']
  for (const file of files) {
    const source = await readFile(new URL(`../${file}`, import.meta.url), 'utf8').catch(() => '')
    assert.doesNotMatch(source, /learn\.thongphan\.com|conan\.school/, file)
  }
})
```

- [ ] **Step 2: Chạy, xác nhận hỏng** — `node --import tsx --test scripts/two-path-content.test.ts` → FAIL (module không tồn tại).
- [ ] **Step 3: Viết `lib/two-path-links.ts`, `lib/path-memory.ts`, `lib/two-path-content.ts`** theo interface và chữ ở spec §2. Thư lấy câu nợ bằng `originStoryPublic`/JSON claim `hstl-debt` (ghép chuỗi), không gõ lại.
- [ ] **Step 4: Chạy lại** → PASS (test cuối PASS vì file component chưa có hoặc chưa chứa domain).
- [ ] **Step 5: Commit** `feat: add two-path content, link and path-memory primitives`.

### Task 2: Ảnh thật, công cụ ảnh và cổng consent

**Files:**
- Create: `scripts/photos/detect-faces.swift`, `scripts/photos/person-mask.swift`, `scripts/photos/blur-audience.py`, `scripts/photos/export-webp.py`, `scripts/photos/README.md`
- Create: `public/images/two-path/*.webp`, `lib/two-path-photos.ts`
- Test: `scripts/two-path-photos.test.ts`, `scripts/two-path-photo-consent.test.ts`

**Interfaces (Produces):**
```ts
export type FaceStatus = 'none' | 'thong-only' | 'blurred' | 'consent-confirmed' | 'pending-owner-consent'
export type TwoPathPhoto = { id: string; src: `/images/two-path/${string}.webp`; width: number; height: number;
  alt: string; caption?: string; source: string; faces: FaceStatus; consentNote?: string; budgetBytes: number;
  focal?: { x: number; y: number } }
export const twoPathPhotos: Record<TwoPathPhotoId, TwoPathPhoto>
export function photo(id: TwoPathPhotoId): TwoPathPhoto
```
Id: `home-hero`, `home-hero-mobile`, `founder-portrait`, `door-tensai`, `door-conan`, `field-content-class`, `tensai-map`, `tensai-lesson`, `conan-hero`, `conan-hero-mobile`, `gallery-ai-factory`, `gallery-ai-factory-design`, `gallery-decision-making`, `gallery-content-flow-haus`, `gallery-katinat`, `gallery-saigon`, `gallery-manulife`, `gallery-after-class`, `mentor-dac-nguyen`, `mentor-thong-phan`.

- [ ] **Step 1: Test hỏng** `scripts/two-path-photos.test.ts`:

```ts
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'
import { twoPathPhotos } from '../lib/two-path-photos'

function webpSize(buf: Buffer) {
  assert.equal(buf.toString('ascii', 0, 4), 'RIFF'); assert.equal(buf.toString('ascii', 8, 12), 'WEBP')
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) }
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff }
  const bits = buf.readUInt32LE(21); return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
}

test('every manifest photo exists, matches its dimensions, fits budget and is described', async () => {
  for (const p of Object.values(twoPathPhotos)) {
    const file = new URL(`../public${p.src}`, import.meta.url)
    const [buf, info] = await Promise.all([readFile(file), stat(file)])
    assert.deepEqual(webpSize(buf), { width: p.width, height: p.height }, p.id)
    assert.ok(info.size <= p.budgetBytes, `${p.id} ${info.size} > ${p.budgetBytes}`)
    assert.ok(p.alt.trim().length > 8, `${p.id} alt`)
    assert.ok(p.source.trim().length > 0, `${p.id} source`)
    if (p.faces === 'consent-confirmed') assert.match(p.consentNote ?? '', /^Thông xác nhận ngày \d{2}\/\d{2}\/\d{4}: .+/)
  }
})
```
`scripts/two-path-photo-consent.test.ts`: quét `out/**/*.html` (sau build) và nguồn `lib/two-path-content.ts`; mọi `/images/two-path/x.webp` xuất hiện phải có trong manifest và không có `faces === 'pending-owner-consent'`.

- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Công cụ ảnh** trong `scripts/photos/` dựa trên bản thử ở scratchpad: Vision quét theo ô chồng lấp (`detect-faces.swift`), mask người nói (`person-mask.swift`), `blur-audience.py` (dải mờ mép mềm trừ mask, elip cho mặt ngoài dải), `export-webp.py` (crop tỷ lệ + focal, resize không phóng to, `cwebp` giảm chất lượng từng bước 5 tới khi dưới ngân sách).
- [ ] **Step 4: Xuất ảnh** vào `public/images/two-path/`; **tự xem từng ảnh** (hero sau làm mờ không còn mặt khán giả rõ; chân dung không còn chữ "TĂNG 50% LỢI NHUẬN").
- [ ] **Step 5: Viết manifest** `lib/two-path-photos.ts` với kích thước thật; chạy test → PASS.
- [ ] **Step 6: Commit** `feat: add processed real photos with face-status manifest`.

### Task 3: Component two-path, ba route và SEO

**Files:**
- Create: `components/two-path/{PathLink,PathMemory,PathResume,PathDoors,FounderLetter,FieldNotes,PhotoGallery,MentorCards}.tsx`, `components/two-path/TwoPath.module.css`, `components/two-path/TwoPathPhoto.tsx`
- Create: `app/tensai/page.tsx`, `app/tensai/page.module.css`, `app/conan/page.tsx`, `app/conan/page.module.css`, `app/home.module.css`
- Modify: `app/page.tsx`, `lib/site-route-mode.ts`, `app/sitemap.ts`, `lib/seo.ts` (`DEFAULT_DESCRIPTION`, `buildBranchPageStructuredData`), `app/layout.tsx` (title)
- Test: `scripts/two-path-route-contract.test.mjs`, sửa `scripts/site-route-mode.test.ts`

**Interfaces:**
- Consumes: Task 1, Task 2.
- Produces:
  - `<PathLink kind="door" | "outbound" path placement className? children />` (client; `door` → `next/link` tới `PATH_ROUTES[path]`, `outbound` → `<a href={outboundUrl()}>`; bấm thì `window.dispatchEvent(new CustomEvent(name, { detail }))`; chuyển tiếp `data-motion-action`).
  - `<PathDoors variant="hero" | "closing" placement />`, `<PathMemory path />`, `<PathResume />`.
  - `buildBranchPageStructuredData({ path, name, description, pathname })` → JSON-LD `WebPage` có `isPartOf` website và `about` person.

- [ ] **Step 1: Test hỏng** `scripts/two-path-route-contract.test.mjs`: đọc nguồn `app/page.tsx`, `app/tensai/page.tsx`, `app/conan/page.tsx` + component; khẳng định:
  - mỗi route (page + component nó dùng, trừ chrome) có đúng 1 `<h1`;
  - `/tensai` có `data-path="tensai"` và `<PathMemory path="tensai"`; `/conan` tương tự;
  - `app/page.tsx` không có `data-path=`, có `<PathDoors variant="hero"` và `<PathResume`;
  - `PathResume` dùng `useSyncExternalStore` với server snapshot `() => null`, không gọi `router.push`/`location.assign`;
  - `TwoPath.module.css` có `[data-path='tensai']` với `#c3f331`, `#073b2f`; `[data-path='conan']` với `#c4441f`;
  - component có `data-motion-action`, `data-motion-surface`, `data-motion-reveal="mask"`, `data-motion-reveal="drift"`, `data-motion-parallax`;
  - CSS có `@media (prefers-reduced-motion: reduce)` và `scale(1.03)`;
  - `routeModeForPath('/tensai') === 'editorial-light'`, `routeModeForPath('/conan') === 'cinema-dark'`;
  - sitemap chứa `'/tensai'` và `'/conan'`.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết component + route** theo spec §2.1–2.3, §3; dòng resume có `min-height: 44px` cố định.
- [ ] **Step 4: Chạy test** → PASS; `npx tsc --noEmit` sạch.
- [ ] **Step 5: Commit** `feat: build two-path homepage and Tensai/Conan branch pages`.

### Task 4: Khung chung (điều hướng, header, menu mobile, footer)

**Files:**
- Modify: `components/site-chrome/site-navigation.ts`, `SiteHeader.tsx`, `MobileMenu.tsx`, `SiteFooter.tsx`, `SiteChrome.module.css`
- Test: sửa `scripts/site-chrome-contract.test.ts`, `scripts/learn-public-contract.test.ts`, `scripts/learn-release-gate.test.mjs`

**Interfaces (Produces):**
```ts
export const pathNavigation: readonly [{ href: '/tensai'; label: 'Đi làm'; path: 'tensai' }, { href: '/conan'; label: 'Kinh doanh'; path: 'conan' }]
export const aboutNavigation: { href: '/about'; label: 'Về Thông' }
export function getMoreNavigation(includeLearn: boolean): { href: string; label: string }[]
// false → Thư viện /library, Trải nghiệm /experiences, Chẩn đoán /diagnostic, 21 ngày Brain2 /brain2/21-ngay
// true  → chèn Học /learn sau Trải nghiệm
export const moreNavigation = getMoreNavigation(learnPublicEnabled)
export const footerExploreNavigation  // Về Thông, Thư viện, Bài viết /blog, Trải nghiệm, Chẩn đoán, 21 ngày Brain2, Tài sản /assets, Bàn hỏi /chat
export const footerUtilityNavigation  // [{ href: '/conanmaker/', label: 'Conan Maker' }]
export const socialNavigation         // Facebook, LinkedIn, Messenger (URL đã xác minh)
```

- [ ] **Step 1: Sửa test** `site-chrome-contract`:
  - `getMoreNavigation(false)`/`(true)` đúng thứ tự; `pathNavigation` đúng href/label; `footerExploreNavigation` đúng 8 mục; `footerUtilityNavigation` chỉ Conan Maker.
  - header: `pathNavigation.map`, `aria-current={pathname === link.href ? 'page' : undefined}`, `aria-controls="site-more-menu"`, xử lý `Escape` trả focus `moreTriggerRef.current?.focus()`, `pointerdown` ngoài để đóng; không còn `homepageChapterNavigation`.
  - menu: `pathNavigation.map` trước `aboutNavigation`; giữ các khẳng định khóa focus; không còn `/conanmaker/`.
  - footer: `footerUtilityNavigation.map` với `<a href={link.href}>` cho `/conanmaker/`; có `socialNavigation.map` với `rel="noopener noreferrer"`.
  - vùng chạm 44px cho `menuTrigger`, `menuClose`, `mobilePathNav a`, `mobileNav a`, `moreTrigger`, `moreMenu a`, `pathSwitch a`.
  - 340px: giữ quy tắc `.menuTrigger span` ẩn.
  - icon: chỉ lucide, không `<svg`, không `Search|Home|BookOpen|Sparkles|User`.
  - `learn-public-contract`/`learn-release-gate`: đổi sang `getMoreNavigation`.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Viết điều hướng, header (công tắc ≥640px, Về Thông + Thêm ≥900px, nút menu <900px), menu mobile (hai nút nhánh lớn ở đầu), footer bốn khối.**
- [ ] **Step 4: Chạy** `site-chrome-contract`, `mobile-menu-focus`, `learn-public-contract`, `learn-release-gate` → PASS.
- [ ] **Step 5: Commit** `feat: two-path site chrome with path switch and more menu`.

### Task 5: `/about` theo định vị người dẫn đường

**Files:**
- Modify: `app/about/page.tsx`, `components/origin-story/OriginStory.tsx`, `components/origin-story/OriginStory.module.css`, `lib/seo.ts` (`buildAboutPageStructuredData` giữ nguyên tên)
- Delete: `components/origin-story/OriginStoryTrackedLink.tsx` (CTA Brain2 cuối trang bị thay bằng hai cửa)
- Test: sửa `scripts/origin-story-route.test.ts`

- [ ] **Step 1: Sửa test:** tiêu đề "Tui là người dẫn đường, vì tui đã đi sai đủ nhiều."; story lọc `hiddenClaimIds` chứa `conan-maker-handoff` và `asset.generated`; phần kết có `aboutPathContent.title`, `<PathDoors variant="closing"` và đúng 1 `href="/library/proof-stack-thong-phan-2026"`; không còn "Đừng để thêm một bài học nào biến mất."; giữ các khẳng định 5 hồi, `<Image`, `press-card`, một heading path.
- [ ] **Step 2: Chạy** → FAIL.
- [ ] **Step 3: Sửa component.**
- [ ] **Step 4: Chạy** `origin-story-route`, `origin-story-evidence` → PASS.
- [ ] **Step 5: Commit** `feat: reframe about as the guide story with two-path closing`.

### Task 6: Gỡ trang chủ cũ và đồng bộ bộ test

**Files:**
- Delete: `components/home-cinema/*`, `lib/homepage-proof-assets.ts`, `scripts/homepage-proof-assets.test.ts`, `scripts/homepage-cinematic-contract.test.mjs`, `scripts/home-cinema-content.test.ts` (+ `content/homepage/homepage-proof-assets.json` nếu chỉ test cũ dùng)
- Modify: `package.json` (`test`, `test:full-with-tpr` thêm `two-path-content`, `two-path-photos`, `two-path-route-contract`; thêm `test:photo-consent`, nối cuối `test:release`), `scripts/bundle-budget.test.mjs` (thêm `tensai.html`, `conan.html`), `scripts/homepage-build-contract.test.mjs` (viết lại), `scripts/motion-atmosphere-contract.test.ts` (trỏ sang `components/two-path/*`)

- [ ] **Step 1: Viết lại `homepage-build-contract`:** `out/index.html`, `out/tensai.html`, `out/conan.html` có đúng 1 `<h1`, không `<video`, có `href="/tensai"` và `href="/conan"`; `out/tensai.html` có `utm_campaign=two-path`; ngân sách `public/images/two-path/*` theo manifest; giữ kiểm asset refs `conanmaker/index`, `game/index`; giữ kiểm JS riêng trang chủ ≤35KB gzip so với about.
- [ ] **Step 2: Gỡ file cũ, sửa package.json, chạy `npm test`** → chỉ còn 2 lỗi baseline Playwright.
- [ ] **Step 3: Commit** `refactor: retire evidence-cinema homepage and align test suite`.

### Task 7: Cổng phát hành

- [ ] `npm ci && npm test && npx tsc --noEmit && npm run build && npm run test:release && git diff --check`
- [ ] Kỳ vọng: mọi cổng kỹ thuật PASS; `test:photo-consent` đỏ vì ảnh Conan `pending-owner-consent` (chờ anh). 2 lỗi baseline `qa-experiences-safety` do thiếu binary Playwright.
- [ ] Commit sửa lỗi nếu có.

### Task 8: QA hình ảnh thật

**Files:** Create `scripts/qa-two-path.mjs`, `qa/two-path/*` (ảnh chụp), `qa/two-path/mobbin/*` (ảnh ghép so sánh)

- [ ] Script phục vụ `out/` bằng server tĩnh nội bộ (Node `http`, map `/x` → `x.html`), Playwright `chromium.launch({ channel: 'chrome' })`.
- [ ] 7 route × 5 viewport: `scrollWidth ≤ innerWidth`, không lỗi console, 1 `h1`, mọi `img` `naturalWidth > 0`, vùng chạm header/cửa/CTA ≥44px, hai cửa trong màn hình đầu ở 390×844 và 1440×900, tương phản chữ nút nhánh ≥4.5:1.
- [ ] Kịch bản: vào `/tensai` rồi `/` thấy "Lần trước bạn xem Tensai"; chặn storage (`addInitScript` ném lỗi) vẫn không lỗi; bàn phím mở "Thêm", Escape trả focus.
- [ ] Tự xem từng ảnh chụp, sửa lỗi bố cục, chụp lại. Ghép so sánh Mobbin.
- [ ] Commit `test: add two-path visual QA script and evidence`.

### Task 9: Tài liệu trạng thái và bàn giao

- [ ] Cập nhật `docs/STATUS.md` (phase, kết quả cổng, consent đang chờ, preview chưa deploy).
- [ ] Push nhánh `feature/two-path-rebuild`. Không deploy.
- [ ] Báo cáo cuối theo §9, xin duyệt preview/production và consent ảnh.
