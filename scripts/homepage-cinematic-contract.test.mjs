import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

async function readProjectFile(path) {
  try {
    return await readFile(new URL(path, root), 'utf8')
  } catch (error) {
    if (error?.code === 'ENOENT') return ''
    throw error
  }
}

function escaped(phrase) {
  return new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

function countPhrase(source, phrase) {
  const pattern = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return (source.match(new RegExp(pattern, 'g')) ?? []).length
}

test('homepage locks the approved Evidence Cinema story and truthful assets', async () => {
  const page = await readProjectFile('app/page.tsx')
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const content = await readProjectFile('components/home-cinema/home-cinema-content.ts')
  const proofManifest = await readProjectFile('content/homepage/homepage-proof-assets.json')
  const source = `${page}\n${home}\n${content}\n${proofManifest}`

  for (const required of [
    'Từ trải nghiệm thật đến cộng đồng trả phí',
    'Khám phá lộ trình của bạn',
    'THÔNG PHAN',
    'id="story"',
    'id="proof"',
    'id="method"',
    'id="paths"',
    'id="conan"',
    'thongphan-speaker-hires.jpg',
    'thong-library-author.jpg',
    'preview-first-90s-natural-inspect-20260629-021025/contact-sheet.jpg',
    'thong-library-author.jpg',
    'LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT',
  ]) {
    assert.match(source, escaped(required))
  }

  assert.match(source, /Biến chuyên môn thật\s*<br\s*\/?>(?:\s*)thành\s*<em>tài sản<\/em>\s*có người muốn dùng\./i)

  for (const banned of [
    'Knowledge Garden',
    'premium-garden',
    'ACV Framework',
    '<video',
    'verified',
    '10,000',
    '10000',
  ]) {
    assert.doesNotMatch(source, escaped(banned))
  }
})

test('homepage keeps one compact sourced origin bridge inside the existing ACT 03 header', async () => {
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const bridge = await readProjectFile('components/home-cinema/HomeOriginBridge.tsx')
  const trackedLink = await readProjectFile('components/home-cinema/HomeTrackedLink.tsx')
  const eventContract = await readProjectFile('components/home-cinema/homepage-events.ts')
  const proofSheet = await readProjectFile('components/home-cinema/ProofContactSheet.tsx')
  const navigation = await readProjectFile('components/site-chrome/site-navigation.ts')
  const originManifest = await readProjectFile('content/proof/origin-story-evidence.json')
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const sectionIds = [...home.matchAll(/<section id="([^"]+)"[^>]*data-home-section/g)].map(([, id]) => id)
  const chapterIds = [...navigation.matchAll(/section:\s*'([^']+)'/g)].map(([, id]) => id)
  const proofSection = home.match(/<section id="proof"[\s\S]*?(?=\n\s*<section id="method")/)?.[0] ?? ''
  const bridgeRule = css.match(/\.originBridge\s*\{[^}]*\}/)?.[0] ?? ''

  assert.deepEqual(sectionIds, ['story', 'mirror', 'proof', 'method', 'paths', 'conan'])
  assert.deepEqual(chapterIds, sectionIds)
  assert.match(proofSection, /<HomeOriginBridge\s*\/?>/)
  assert.match(proofSection, /<header[\s\S]*?<HomeOriginBridge\s*\/>[\s\S]*?<\/header>[\s\S]*?<ProofContactSheet/)

  assert.equal((bridge.match(/href=["']\/about["']/g) ?? []).length, 1)
  assert.equal((bridge.match(/eventName=/g) ?? []).length, 1)
  assert.match(bridge, /eventName=\{homepageEvents\.originStory\}/)
  assert.doesNotMatch(bridge, /eventDetail|data-home-section|<h1(?:\s|>)/i)

  for (const line of [
    'Thắng sự chú ý. Thua sản phẩm cốt lõi.',
    'Brain2 bắt đầu từ quyết định không bỏ phí bài học đó.',
  ]) {
    assert.equal(countPhrase(bridge, line), 1)
  }
  assert.match(bridge, /originStoryPublic/)
  assert.match(bridge, /hstl-debt/)
  assert.match(bridge, /debtClaim\.sourceLabel/)
  assert.doesNotMatch(bridge, /pressArtifact\.sourceLabel/)
  assert.doesNotMatch(bridge, escaped('Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'))
  assert.equal(countPhrase(originManifest, 'Hơn 2 tỷ nợ. Mười năm sau vẫn chưa trả hết.'), 1)

  assert.match(eventContract, /originStory:\s*'origin_story_opened'/)
  assert.match(trackedLink, /import type \{ HomepageEvent \} from ['"]\.\/homepage-events['"]/)
  assert.doesNotMatch(trackedLink, /const homepageEvents\s*=/)
  for (const serverConsumer of [home, bridge]) {
    assert.match(serverConsumer, /import HomeTrackedLink from ['"]\.\/HomeTrackedLink['"]/)
    assert.match(serverConsumer, /import \{ homepageEvents \} from ['"]\.\/homepage-events['"]/)
    assert.doesNotMatch(serverConsumer, /HomeTrackedLink,\s*\{ homepageEvents \}/)
  }
  assert.match(proofSheet, /import \{ homepageEvents \} from ['"]\.\/homepage-events['"]/)
  assert.match(bridgeRule, /align-self:\s*end/)
  assert.doesNotMatch(bridgeRule, /min-height|height:\s*100|100(?:d|s|l)?vh/i)
})

test('homepage source exposes the selected cinema visual and responsive contract', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const globals = await readProjectFile('styles/globals.css')
  const layout = await readProjectFile('app/layout.tsx')
  const combined = `${css}\n${globals}\n${layout}`

  for (const required of [
    '--cinema-ink: #070706',
    '--cinema-ink-raised: #12100f',
    '--cinema-paper: #e8dfcf',
    '--cinema-paper-muted: #a69e92',
    '--cinema-lacquer: #b3231b',
    '--cinema-lacquer-bright: #e04b43',
    '@media (prefers-reduced-motion: reduce)',
    '@media (max-width: 767px)',
    'scroll-snap-type: x mandatory',
    'Cormorant_Garamond',
    'Be_Vietnam_Pro',
  ]) {
    assert.match(combined, escaped(required))
  }

  assert.doesNotMatch(combined, /data-theme=["']premium-garden["']/i)
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}[^\n]*(gold|green|blue)/i)
})

test('homepage recreates the selected hero from separated fidelity assets', async () => {
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const reel = await readProjectFile('components/home-cinema/HomeFilmReel.tsx')
  const content = await readProjectFile('components/home-cinema/home-cinema-content.ts')
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const chromeCss = await readProjectFile('components/site-chrome/SiteChrome.module.css')
  const layout = await readProjectFile('app/layout.tsx')
  const source = `${home}\n${reel}\n${content}\n${css}\n${chromeCss}\n${layout}`

  for (const required of [
    'evidence-cinema-hero-v3.webp',
    'evidence-cinema-hero-v3-mobile.webp',
    'evidence-cinema-film-texture-v2.webp',
    'evidence-cinema-stamp-v4.png',
    'evidence-cinema-signature-v3.png',
    'evidence-cinema-arrow-v2.png',
    'evidence-cinema-outer-frame-v2.png',
    'evidence-cinema-conan-portrait-v2.webp',
    'heroFilmItems',
    'data-frame-count={items.length}',
    'data-cinema-frame',
    '--font-cormorant',
  ]) {
    assert.match(source, escaped(required))
  }

  assert.match(content, /export const heroFilmItems\s*=\s*\[[\s\S]*?\]\s*as const/)
  assert.equal((content.match(/heroFrame:\s*'/g) ?? []).length, 3)
  assert.match(content, /label:\s*'NGƯỜI XÂY HỆ'/)
  assert.doesNotMatch(content, /label:\s*'CONAN MAKER'/)
  assert.match(css, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(chromeCss, /\.cinemaHeader\s*\{[\s\S]*?position:\s*absolute/)
  assert.doesNotMatch(css, /\.evidenceStamp::before|\.evidenceStamp::after/)
  assert.doesNotMatch(css, /\.evidenceStamp img\s*\{[\s\S]{0,180}filter:/)
})

test('route-aware chrome includes an accessible mobile cinema menu', async () => {
  const chrome = await readProjectFile('components/site-chrome/SiteChrome.tsx')
  const header = await readProjectFile('components/site-chrome/SiteHeader.tsx')
  const menu = await readProjectFile('components/site-chrome/MobileMenu.tsx')
  const focus = await readProjectFile('components/site-chrome/mobile-menu-focus.ts')
  const navigation = await readProjectFile('components/site-chrome/site-navigation.ts')
  const css = await readProjectFile('components/site-chrome/SiteChrome.module.css')
  const source = `${chrome}\n${header}\n${menu}\n${focus}\n${navigation}`

  for (const required of [
    'usePathname',
    'Mục lục',
    'aria-expanded',
    'aria-modal="true"',
    'role="dialog"',
    'Escape',
    'triggerRef.current?.focus()',
    'Câu chuyện',
    'Bằng chứng',
    'Phương pháp',
    'Conan Maker',
  ]) {
    assert.match(source, escaped(required))
  }

  assert.match(css, /min-height:\s*44px/i)
})

test('homepage motion is scoped, reversible and reduced-motion safe', async () => {
  const motion = await readProjectFile('components/ScrollAnimations.tsx')

  for (const required of [
    "matchMedia('(prefers-reduced-motion: reduce)')",
    '[data-site-shell="unified"]',
    '[data-cinema-reveal]',
    '[data-focus-pull]',
    '[data-evidence-stamp]',
    'context.revert()',
    'trigger.kill()',
  ]) {
    assert.match(motion, escaped(required))
  }

  assert.doesNotMatch(motion, /pointermove|cursor follower|data-cursor/i)
})

test('homepage conversion links emit only the approved analytics events', async () => {
  const [home, homeContent, trackedLink, eventContract] = await Promise.all([
    readProjectFile('components/home-cinema/HomeCinema.tsx'),
    readProjectFile('components/home-cinema/home-cinema-content.ts'),
    readProjectFile('components/home-cinema/HomeTrackedLink.tsx'),
    readProjectFile('components/home-cinema/homepage-events.ts'),
  ])

  for (const eventName of [
    'homepage_primary_cta_clicked',
    'homepage_proof_opened',
    'homepage_path_selected',
    'homepage_conan_handoff_clicked',
    'origin_story_opened',
  ]) {
    assert.match(eventContract, escaped(eventName))
  }

  assert.match(trackedLink, /new CustomEvent\(eventName/)
  assert.match(home, /href="\/conanmaker\/"/)
  assert.match(trackedLink, /if \(props\.href === '\/conanmaker\/'\)[\s\S]*?<a/)
  assert.doesNotMatch(`${home}\n${homeContent}`, /\/conanmaker["']/)
  assert.doesNotMatch(`${trackedLink}\n${eventContract}`, /localStorage|sessionStorage|freeText|answer/i)
})

test('proof media has a readable image failure fallback', async () => {
  const proofImage = await readProjectFile('components/home-cinema/ProofImage.tsx')

  assert.match(proofImage, /onError=/)
  assert.match(proofImage, escaped('Không tải được ảnh tư liệu'))
  assert.match(proofImage, /aria-live="polite"/)
})

test('short laptop view keeps the hero compact while clearing the evidence rail', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const shortLaptop = css.match(
    /@media \(min-width: 768px\) and \(max-height: 800px\)[\s\S]*?(?=@media \(max-width: 767px\))/,
  )?.[0] ?? ''

  assert.match(shortLaptop, /min-height:\s*820px/)
  assert.match(shortLaptop, /\.displayName\s*\{[\s\S]*?font-size:\s*5\.8rem/)
  assert.match(shortLaptop, /\.heroTextStack\s*\{[\s\S]*?bottom:\s*calc\(var\(--hero-film-height\) \+ 1rem\)/)
  assert.match(shortLaptop, /\.heroTextStack\s*\{[\s\S]*?top:\s*var\(--hero-copy-safe-top\)/)
  assert.match(shortLaptop, /\.heroCopy h1\s*\{[\s\S]*?font-size:\s*1\.8rem/)
  assert.match(shortLaptop, /\.primaryButton\s*\{[\s\S]*?min-height:\s*52px/)
  assert.match(shortLaptop, /\.proofAct\s*\{[\s\S]*?padding-top:\s*1\.25rem[\s\S]*?padding-bottom:\s*1\.25rem/)
  assert.match(shortLaptop, /\.proofAct \.actHeader\s*\{[\s\S]*?margin-bottom:\s*0\.75rem/)
  assert.match(shortLaptop, /\.proofAct \.actHeader\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.05fr\)\s+minmax\(24rem,\s*0\.95fr\)/)
  assert.match(shortLaptop, /\.proofCard \.proofImageFrame\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*10/)
})

test('standard laptop view compacts ACT 03 without shrinking the homepage hero', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const compactProof = css.match(
    /@media \(min-width: 901px\) and \(max-height: 950px\)[\s\S]*?(?=@media \(max-width: 900px\))/,
  )?.[0] ?? ''

  assert.match(compactProof, /\.proofAct\s*\{[\s\S]*?padding-top:\s*1\.25rem[\s\S]*?padding-bottom:\s*1\.25rem/)
  assert.match(compactProof, /\.proofAct \.actHeader\s*\{[\s\S]*?margin-bottom:\s*0\.75rem/)
  assert.match(compactProof, /\.proofCard \.proofImageFrame\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*10/)
  assert.match(compactProof, /\.displayName\s*\{[\s\S]*?font-size:\s*7\.4rem/)
  assert.match(compactProof, /\.heroCopy h1\s*\{[\s\S]*?font-size:\s*2\.25rem/)
  assert.match(compactProof, /\.proofMicrocopy\s*\{[\s\S]*?margin-top:\s*0\.65rem/)
  assert.doesNotMatch(compactProof, /\.hero\s*\{/)
})

test('desktop hero keeps the explicit two-line promise below the display name', async () => {
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')

  assert.match(home, /className=\{styles\.heroTextStack\}/)
  assert.match(css, /\.heroTextStack\s*\{[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*column[\s\S]*?gap:/)
  assert.match(css, /\.displayName\s*\{[\s\S]*?position:\s*relative/)
  assert.match(css, /\.heroCopy\s*\{[\s\S]*?position:\s*relative/)
  assert.match(css, /\.heroCopy h1\s*\{[\s\S]*?max-width:\s*100%/)
})

test('desktop hero reserves the chapter-nav safe zone and keeps content above decorative layers', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')

  assert.match(css, /--hero-chrome-safe-top:\s*clamp\(/)
  assert.match(css, /--hero-copy-safe-top:\s*clamp\(/)
  assert.match(css, /\.heroPhoto\s*\{[\s\S]{0,260}top:\s*var\(--hero-chrome-safe-top\)/)
  assert.match(css, /\.heroTextStack\s*\{[\s\S]{0,420}top:\s*var\(--hero-copy-safe-top\)/)
  assert.match(css, /\.displayName span\s*\{[\s\S]{0,120}white-space:\s*nowrap/)
  assert.match(css, /\.heroTextStack\s*\{[\s\S]{0,420}z-index:\s*5/)
  assert.match(css, /\.heroFrameOverlay\s*\{[\s\S]{0,260}z-index:\s*1/)
  assert.match(css, /\.heroFilm\s*\{[\s\S]{0,520}z-index:\s*3/)
  assert.match(css, /\.page \[data-home-section\]\s*\{[\s\S]*?scroll-margin-top:\s*8\.5rem/)
})

test('tablet hero leaves room for two headline lines, the CTA and proof microcopy above the rail', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')

  assert.match(css, /@media \(max-width: 900px\)[\s\S]{0,180}min-height:\s*920px/)
  assert.match(css, /@media \(max-width: 900px\)[\s\S]{0,420}max-width:\s*72vw/)
  assert.doesNotMatch(css, /@media \(max-width: 900px\)[\s\S]{0,180}min-height:\s*1100px/)
})

test('proof contact sheet exposes manual scrolling and an accessible evidence dialog', async () => {
  const proofSheet = await readProjectFile('components/home-cinema/ProofContactSheet.tsx')
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')

  for (const required of [
    'scrollBy',
    'Xem bằng chứng trước',
    'Xem bằng chứng tiếp theo',
    'role="dialog"',
    'aria-modal="true"',
    'resolveMenuKeyAction',
    'triggerRef.current?.focus()',
    'HomepageProofPublicAsset',
    'data-interactive="false"',
  ]) {
    assert.match(proofSheet, escaped(required))
  }
  assert.match(home, /<ProofContactSheet/)
  assert.doesNotMatch(home, /<ProofRail>/)
  assert.doesNotMatch(proofSheet, /sourcePath|sourceSha256|derivativeSha256|sourceRight/)
})

test('film reel is gated and remains static until six approved frames exist', async () => {
  const reel = await readProjectFile('components/home-cinema/HomeFilmReel.tsx')
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')

  for (const required of [
    'items.length >= 6',
    'aria-hidden',
    'data-reel-duplicate',
    'HomeFilmReel',
    'homepageCanRunReel',
    'aria-pressed',
    'Tạm dừng thước phim',
    'priority={!duplicate && index < 3}',
    'focalPoint={item.focalPoint}',
  ]) {
    assert.match(`${reel}\n${home}`, escaped(required))
  }
  assert.match(css, /animation-play-state:\s*paused/)
  assert.match(css, /@media \(hover:\s*none\),\s*\(pointer:\s*coarse\)/)
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.reelTrackDuplicate\s*\{[\s\S]*?display:\s*none/)
})

test('mobile hero keeps the name to two unbroken lines and separates the portrait from the type', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')
  const mobile = css.match(
    /@media \(max-width: 767px\)[\s\S]*?(?=@media \(prefers-reduced-motion: reduce\))/,
  )?.[0] ?? ''

  assert.match(mobile, /\.displayName\s*\{[\s\S]*?font-size:\s*clamp\(4\.75rem,\s*22vw,\s*6\.25rem\)/)
  assert.match(mobile, /\.heroPhoto img\s*\{[\s\S]*?object-position:\s*68%\s+24%/)
})

test('release QA measures decorative-name wrapping, portrait safe area and the live reel', async () => {
  const home = await readProjectFile('components/home-cinema/HomeCinema.tsx')
  const qa = await readProjectFile('scripts/qa-site.mjs')

  assert.match(home, /data-display-name/)
  assert.match(home, /data-display-word/)
  for (const required of [
    'getClientRects()',
    'displayWordLineCounts',
    'displayNameHeaderGap',
    'heroPhotoHeaderGap',
    'heroContentFilmGap',
    'reelRunning',
    'focalFrameCount',
  ]) {
    assert.match(qa, escaped(required))
  }
  assert.match(home, /data-hero-content-end/)
})

test('homepage keeps hero copy above film and ACT 03 visible as a compact three-up sheet', async () => {
  const css = await readProjectFile('components/home-cinema/HomeCinema.module.css')

  assert.match(css, /\.heroTextStack\s*\{[\s\S]{0,260}bottom:\s*calc\(var\(--hero-film-height\)/)
  assert.match(css, /\.proofGrid\s*\{[\s\S]{0,240}grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /\.proofAct\s*\{[\s\S]{0,240}padding-top:\s*clamp\(2\.5rem,\s*4vw,\s*4rem\)/)
  assert.match(css, /\.proofAct \.actHeader\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*1\.4fr\)\s+minmax\(18rem,\s*0\.6fr\)/)
})
