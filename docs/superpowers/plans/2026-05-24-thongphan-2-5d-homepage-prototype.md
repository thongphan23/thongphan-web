# thongphan.com 2.5D Homepage Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-reviewable 2.5D cinematic homepage prototype for `thongphan.com` with a game-card reveal, a dominant Thong Phan visual, and layered scroll scenes.

**Architecture:** Keep the work scoped to the homepage and global scroll animation component. Use the supplied stage-teaching photo as the prototype character anchor, use code-native proof/system layers for private-safe visuals, and keep existing route/CTA strategy intact. The prototype must be reviewable locally and must not be deployed without explicit approval.

**Tech Stack:** Next.js App Router, React 19, CSS Modules, global CSS tokens, Next Image, GSAP ScrollTrigger, native browser APIs, Node test/build scripts.

---

## File Structure

- Modify: `/Users/rio/thongphan-com/app/page.tsx`
  - Owns homepage content, hero card reveal markup, 2.5D layer markup, scene data arrays, and CTA structure.
- Modify: `/Users/rio/thongphan-com/app/page.module.css`
  - Owns all homepage-specific visual system, 2.5D layers, card reveal composition, responsive layout, and reduced-motion CSS.
- Modify: `/Users/rio/thongphan-com/components/ScrollAnimations.tsx`
  - Owns reveal sequencing and GSAP scroll timelines. Add selectors for hero reveal and 2.5D depth layers without affecting non-homepage routes.
- Create: `/Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg`
  - Prototype copy of `/Users/rio/Downloads/532021428_10228239041740651_5386335204067042707_n.jpg`.
- Create: `/Users/rio/thongphan-com/docs/superpowers/qa/2026-05-24-thongphan-2-5d-homepage-prototype.md`
  - Manual QA ledger with commands, viewport checks, screenshots/video paths if captured, and known prototype limitations.

## Task 1: Stage The Prototype Character Asset

**Files:**
- Create: `/Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg`

- [ ] **Step 1: Create the homepage asset directory**

Run:

```bash
mkdir -p /Users/rio/thongphan-com/public/images/homepage
```

Expected: command exits with status `0`.

- [ ] **Step 2: Copy the supplied stage-teaching photo**

Run:

```bash
cp /Users/rio/Downloads/532021428_10228239041740651_5386335204067042707_n.jpg /Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg
```

Expected: command exits with status `0`.

- [ ] **Step 3: Verify dimensions**

Run:

```bash
sips -g pixelWidth -g pixelHeight /Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg
```

Expected output includes:

```text
pixelWidth: 1365
pixelHeight: 2048
```

- [ ] **Step 4: Check git status for the staged asset**

Run:

```bash
git status --short /Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg
```

Expected output:

```text
?? public/images/homepage/thong-stage-anchor.jpg
```

- [ ] **Step 5: Commit the staged asset**

Run:

```bash
git add /Users/rio/thongphan-com/public/images/homepage/thong-stage-anchor.jpg
git commit -m "assets: add homepage stage portrait"
```

Expected: commit succeeds and includes only `public/images/homepage/thong-stage-anchor.jpg`.

## Task 2: Replace The Hero With A 2.5D Card Reveal Composition

**Files:**
- Modify: `/Users/rio/thongphan-com/app/page.tsx`
- Modify: `/Users/rio/thongphan-com/app/page.module.css`

- [ ] **Step 1: Replace hero data constants in `app/page.tsx`**

In `/Users/rio/thongphan-com/app/page.tsx`, add this import above the existing imports:

```tsx
import type { CSSProperties } from 'react'
```

Then replace the existing `chaosTokens` constant with:

```tsx
const proofFragments = [
  ['40+', 'bài viral', 'từ kinh nghiệm thật'],
  ['80k+', 'lượt chia sẻ', 'không dựa vào FOMO rỗng'],
  ['600+', 'bình luận đăng ký', 'nhu cầu thật trong 24h'],
  ['Brain2', 'đang chạy', 'hệ tri thức riêng'],
  ['Conan', 'Maker', 'môi trường thực hành'],
  ['AI', 'không cướp việc bạn', 'người hiểu AI mới đáng sợ'],
]

const depthSignals = [
  'Prompt rời rạc',
  'Tool mới mỗi ngày',
  'Bạn bè khoe workflow',
  'Content giống nhau',
  'Kinh nghiệm nằm trong đầu',
  'Chưa biết tầng tiếp theo',
]
```

Expected: no TypeScript syntax errors in the file.

- [ ] **Step 2: Replace the current `<section className={styles.hero}>` content**

In `/Users/rio/thongphan-com/app/page.tsx`, replace the entire hero section from:

```tsx
<section className={styles.hero} data-cinematic-hero>
```

through its closing `</section>` before `<section className={styles.chapterRail}` with this markup:

```tsx
<section className={styles.hero} data-cinematic-hero>
  <div className={styles.heroAtmosphere} aria-hidden="true">
    <span className={styles.depthGrid} data-depth-layer="back" />
    <span className={styles.depthRing} data-depth-layer="mid" />
    <span className={styles.depthBeam} data-depth-layer="front" />
  </div>

  <div className={styles.metaStrip} aria-label="Thông tin hành trình trang chủ Thông Phan">
    <span>Tập 04 / Mở khóa hệ điều hành tri thức</span>
    <span>2.5D Brain2 cinematic prototype</span>
    <span>Chẩn đoán → 21 ngày → Conan Trial</span>
  </div>

  <div className={styles.heroRevealShell}>
    <div className={styles.heroCopy} data-reveal>
      <div className={styles.eyebrow}>AI-native expertise system</div>
      <h1>
        Người có chuyên môn không thua AI. <span>Họ thua người biết biến chuyên môn thành hệ thống.</span>
      </h1>
      <p className={styles.heroDesc}>
        Đây là bản prototype cinematic của thongphan.com: mở thẻ nhân vật, đi qua Brain2, proof, chẩn đoán và cổng Conan bằng một hành trình 2.5D.
      </p>
      <div className={styles.readerProtection}>
        <strong>Không thêm hiệu ứng cho vui.</strong>
        <span> Mỗi lớp bay vào phải đưa người xem từ hỗn loạn sang sáng tỏ: proof thật, hệ thống thật, bước tiếp theo thật.</span>
      </div>
      <div className={styles.heroCtas}>
        <Link href="/diagnostic" className="btn-primary">Tự chẩn đoán năng lực AI</Link>
        <Link href="/challenges/brain2-21-ngay" className="btn-outline">Kích hoạt 21 ngày Brain2</Link>
      </div>
    </div>

    <div className={styles.heroStage} aria-label="Mở thẻ hệ điều hành tri thức Thông Phan">
      <div className={styles.cardOrbit} aria-hidden="true">
        {proofFragments.map(([value, label, note], index) => (
          <span
            key={`${value}-${label}`}
            className={styles.orbitFragment}
            data-hero-fragment
            style={{
              '--angle': `${index * 58}deg`,
              '--neg-angle': `${index * -58}deg`,
            } as CSSProperties}
          >
            <b>{value}</b>
            <small>{label}</small>
            <em>{note}</em>
          </span>
        ))}
      </div>

      <div className={styles.revealCard} data-hero-card>
        <div className={styles.revealCardBack}>
          <span>TP</span>
          <strong>Unlocking Brain2</strong>
          <small>Proof / System / Demand</small>
        </div>
        <div className={styles.revealCardFront}>
          <Image
            src="/images/homepage/thong-stage-anchor.jpg"
            alt="Thông Phan đang đứng lớp"
            width={1365}
            height={2048}
            priority
            className={styles.heroPortrait}
          />
          <div className={styles.characterPlate}>
            <span>Thông Phan</span>
            <strong>Knowledge Alchemist</strong>
          </div>
        </div>
      </div>

      <div className={styles.systemPlane} data-depth-layer="mid">
        {depthSignals.map((signal) => (
          <span key={signal}>{signal}</span>
        ))}
      </div>
    </div>
  </div>
</section>
```

Expected: the file imports `CSSProperties`, `Image`, and `Link`, and the inline orbit CSS variables use `as CSSProperties`.

- [ ] **Step 3: Add CSS for the 2.5D hero**

In `/Users/rio/thongphan-com/app/page.module.css`, replace the current hero-related CSS from `.hero {` through `.panelPortrait figcaption { ... }` with this block:

```css
.hero {
  position: relative;
  min-height: calc(100svh - 58px);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 18%, rgba(255, 198, 41, 0.28), transparent 18rem),
    radial-gradient(circle at 74% 38%, rgba(59, 200, 255, 0.18), transparent 22rem),
    linear-gradient(135deg, #07111f 0%, #0f1d31 48%, #101826 100%);
  color: #f7fbff;
}

.heroAtmosphere,
.heroAtmosphere span {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.depthGrid {
  opacity: 0.26;
  background:
    linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
    linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 54px 54px;
  mask-image: radial-gradient(circle at 50% 42%, black, transparent 76%);
}

.depthRing {
  width: min(64vw, 780px);
  height: min(64vw, 780px);
  inset: 50% auto auto 50%;
  border: 1px solid rgba(59, 200, 255, 0.28);
  border-radius: 50%;
  transform: translate(-50%, -50%) rotate(16deg);
  box-shadow:
    0 0 0 80px rgba(17, 103, 255, 0.04),
    0 0 0 180px rgba(255, 198, 41, 0.03);
}

.depthBeam {
  background: linear-gradient(105deg, transparent 0 30%, rgba(255, 198, 41, 0.18) 48%, transparent 66% 100%);
  mix-blend-mode: screen;
}

.metaStrip {
  position: relative;
  z-index: 4;
  width: min(var(--container-max), calc(100% - 48px));
  margin: var(--space-6) auto 0;
  padding: 11px 0 13px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-4);
  border-top: 1px solid rgba(255,255,255,0.18);
  border-bottom: 1px solid rgba(255,255,255,0.18);
  color: rgba(247,251,255,0.66);
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metaStrip span:nth-child(2) {
  text-align: center;
  color: #ffffff;
}

.metaStrip span:last-child {
  text-align: right;
}

.heroRevealShell {
  position: relative;
  z-index: 3;
  width: min(1380px, calc(100% - 48px));
  min-height: calc(100svh - 122px);
  margin: 0 auto;
  padding: var(--space-12) 0 var(--space-16);
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(520px, 1.12fr);
  gap: var(--space-12);
  align-items: center;
}

.heroCopy {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.eyebrow,
.sectionLabel {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255,255,255,0.18);
  border-left: 6px solid var(--accent-gold);
  border-radius: var(--radius-sm);
  color: #ffffff;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.eyebrow::before,
.sectionLabel::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-green);
  box-shadow: 0 0 0 5px rgba(20, 184, 122, 0.13);
}

.hero h1 {
  max-width: 760px;
  color: #ffffff;
  font-size: 4.9rem;
  line-height: 0.94;
  font-weight: 950;
  text-wrap: balance;
}

.hero h1 span,
.routeHeader h2 em,
.journeyIntro h2 em,
.sceneCopy h2 em {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(180deg, transparent 58%, rgba(255, 198, 41, 0.8) 58%);
}

.heroDesc {
  max-width: 650px;
  color: rgba(247,251,255,0.76);
  font-size: 1.12rem;
  line-height: 1.72;
}

.readerProtection {
  max-width: 650px;
  padding: var(--space-4) var(--space-5);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255,255,255,0.16);
  border-left: 6px solid var(--accent-sky);
  border-radius: var(--radius-sm);
  color: rgba(247,251,255,0.75);
  backdrop-filter: blur(18px);
}

.readerProtection strong {
  color: #ffffff;
}

.heroCtas,
.sceneActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.heroStage {
  position: relative;
  min-height: 680px;
  perspective: 1600px;
}

.cardOrbit {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.orbitFragment {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 178px;
  padding: 12px;
  display: grid;
  gap: 3px;
  color: #101826;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(255,255,255,0.64);
  box-shadow: 0 20px 50px rgba(0,0,0,0.28);
  transform:
    translate(-50%, -50%)
    rotate(var(--angle))
    translateY(-300px)
    rotate(var(--neg-angle));
}

.orbitFragment b {
  color: var(--accent-blue);
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 950;
  line-height: 1;
}

.orbitFragment small {
  color: var(--text-primary);
  font-family: var(--font-heading);
  font-weight: 900;
}

.orbitFragment em {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.revealCard {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 2;
  width: min(520px, 82vw);
  aspect-ratio: 0.72;
  transform: translate(-50%, -50%) rotateY(-10deg) rotateX(4deg);
  transform-style: preserve-3d;
}

.revealCardBack,
.revealCardFront {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: 18px;
  backface-visibility: hidden;
  box-shadow: 0 34px 90px rgba(0,0,0,0.42);
}

.revealCardBack {
  display: grid;
  place-items: center;
  padding: var(--space-8);
  text-align: center;
  background:
    radial-gradient(circle at 50% 22%, rgba(255,198,41,0.32), transparent 15rem),
    linear-gradient(135deg, rgba(17,103,255,0.9), rgba(8,17,31,0.96));
}

.revealCardBack span {
  width: 122px;
  height: 122px;
  display: grid;
  place-items: center;
  color: #101826;
  background: var(--accent-gold);
  border-radius: 50%;
  font-family: var(--font-heading);
  font-size: 2.1rem;
  font-weight: 950;
}

.revealCardBack strong {
  margin-top: var(--space-5);
  color: #ffffff;
  font-family: var(--font-heading);
  font-size: 2.4rem;
  font-weight: 950;
  line-height: 0.96;
}

.revealCardBack small {
  color: rgba(255,255,255,0.66);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.revealCardFront {
  background: #07111f;
}

.heroPortrait {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 53% 28%;
  filter: saturate(1.08) contrast(1.04);
}

.characterPlate {
  position: absolute;
  left: var(--space-5);
  right: var(--space-5);
  bottom: var(--space-5);
  padding: var(--space-4);
  background: rgba(7,17,31,0.78);
  border: 1px solid rgba(255,255,255,0.18);
  color: #ffffff;
  backdrop-filter: blur(18px);
}

.characterPlate span {
  color: var(--accent-gold);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.characterPlate strong {
  display: block;
  margin-top: 4px;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 950;
  line-height: 1;
}

.systemPlane {
  position: absolute;
  inset: 8% 2% 5% auto;
  z-index: 1;
  width: 42%;
  transform: translateZ(-120px);
}

.systemPlane span {
  position: absolute;
  width: 160px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(247,251,255,0.72);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.systemPlane span:nth-child(1) { left: 0; top: 5%; }
.systemPlane span:nth-child(2) { right: 8%; top: 18%; }
.systemPlane span:nth-child(3) { left: 12%; top: 38%; }
.systemPlane span:nth-child(4) { right: 0; top: 54%; }
.systemPlane span:nth-child(5) { left: 2%; bottom: 15%; }
.systemPlane span:nth-child(6) { right: 16%; bottom: 2%; }
```

Expected: first viewport has dark premium background, large card/portrait, proof fragments, and no remaining `.osPanel`, `.brainCore`, or `.panelPortrait` references needed in the hero.

- [ ] **Step 4: Run a TypeScript/build check**

Run:

```bash
npm run build
```

Expected: build completes successfully.

- [ ] **Step 5: Commit the hero prototype**

Run:

```bash
git add /Users/rio/thongphan-com/app/page.tsx /Users/rio/thongphan-com/app/page.module.css
git commit -m "feat: add 2.5d card reveal hero prototype"
```

Expected: commit succeeds and includes only homepage files.

## Task 3: Upgrade GSAP Motion To Support Hero Reveal And 2.5D Depth Layers

**Files:**
- Modify: `/Users/rio/thongphan-com/components/ScrollAnimations.tsx`

- [ ] **Step 1: Replace the hero timeline in `ScrollAnimations.tsx`**

In `/Users/rio/thongphan-com/components/ScrollAnimations.tsx`, replace the current `gsap.timeline({ scrollTrigger: { trigger: '[data-cinematic-hero]' ...` block with:

```tsx
        const heroTimeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
        })

        heroTimeline
          .fromTo('[data-hero-card]', {
            y: 44,
            rotateY: -38,
            rotateX: 8,
            scale: 0.88,
            opacity: 0,
          }, {
            y: 0,
            rotateY: -10,
            rotateX: 4,
            scale: 1,
            opacity: 1,
            duration: 1.05,
          }, 0)
          .fromTo('[data-hero-fragment]', {
            y: 28,
            scale: 0.72,
            opacity: 0,
            filter: 'blur(10px)',
          }, {
            y: 0,
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.82,
            stagger: 0.08,
          }, 0.18)
          .fromTo('[data-depth-layer]', {
            y: 26,
            opacity: 0,
          }, {
            y: 0,
            opacity: 1,
            duration: 1.1,
            stagger: 0.1,
          }, 0.05)

        gsap.timeline({
          scrollTrigger: {
            trigger: '[data-cinematic-hero]',
            start: 'top top',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
          .to('[data-hero-fragment]', {
            y: -110,
            scale: 0.84,
            opacity: 0.34,
            stagger: 0.04,
            ease: 'none',
          }, 0)
          .to('[data-hero-card]', {
            y: 46,
            rotateY: 4,
            rotateX: -2,
            scale: 1.04,
            ease: 'none',
          }, 0)
          .to('[data-depth-layer="back"]', {
            y: -24,
            ease: 'none',
          }, 0)
          .to('[data-depth-layer="mid"]', {
            y: -54,
            ease: 'none',
          }, 0)
          .to('[data-depth-layer="front"]', {
            y: -88,
            ease: 'none',
          }, 0)
```

Expected: the initial reveal animates on load, then scroll scrub moves depth layers at different speeds.

- [ ] **Step 2: Upgrade scene timelines to support depth layers**

Inside the existing `scenes.forEach((scene) => { ... })` loop, after:

```tsx
const items = scene.querySelectorAll<HTMLElement>('[data-scrub-item]')
```

add:

```tsx
const depthLayers = scene.querySelectorAll<HTMLElement>('[data-scene-depth]')
```

After the existing `if (items.length) { ... }` block, add:

```tsx
if (depthLayers.length) {
  timeline.fromTo(depthLayers, {
    y: 46,
    opacity: 0.55,
    filter: 'blur(5px)',
  }, {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    stagger: 0.12,
    ease: 'none',
  }, 0)
}
```

Expected: future scene-depth elements animate without affecting current scenes.

- [ ] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 4: Commit motion upgrade**

Run:

```bash
git add /Users/rio/thongphan-com/components/ScrollAnimations.tsx
git commit -m "feat: add 2.5d homepage motion timelines"
```

Expected: commit succeeds and includes only `components/ScrollAnimations.tsx`.

## Task 4: Convert Existing Scroll Scenes Into More 2.5D Layered Surfaces

**Files:**
- Modify: `/Users/rio/thongphan-com/app/page.tsx`
- Modify: `/Users/rio/thongphan-com/app/page.module.css`

- [ ] **Step 1: Add scene depth elements to the Signal scene**

In `/Users/rio/thongphan-com/app/page.tsx`, inside the Signal scene `signalPanel`, before `<div className={styles.signalText}`, add:

```tsx
<span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>fear.exe</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>clarity.signal</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>human &gt; tool</span>
```

Expected: signal scene has three depth labels.

- [ ] **Step 2: Add scene depth elements to the Brain2 scene**

In `/Users/rio/thongphan-com/app/page.tsx`, inside `graphStage`, before `{graphNodes.map`, add:

```tsx
<span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>vault.memory</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>semantic.context</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>personal OS</span>
```

Expected: Brain2 scene has three depth labels.

- [ ] **Step 3: Add scene depth elements to the Proof scene**

In `/Users/rio/thongphan-com/app/page.tsx`, inside `proofCollage`, before `{proofTiles.map`, add:

```tsx
<span className={`${styles.sceneDepth} ${styles.sceneDepthBack}`} data-scene-depth>receipts</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthMid}`} data-scene-depth>track record</span>
<span className={`${styles.sceneDepth} ${styles.sceneDepthFront}`} data-scene-depth>proof beats claim</span>
```

Expected: proof scene has three depth labels.

- [ ] **Step 4: Add CSS for scene depth labels**

In `/Users/rio/thongphan-com/app/page.module.css`, add this block before `@media (prefers-reduced-motion: reduce)`:

```css
.sceneDepth {
  position: absolute;
  z-index: 0;
  padding: 10px 12px;
  border: 1px solid rgba(16, 24, 38, 0.12);
  background: rgba(255, 255, 255, 0.52);
  color: rgba(16, 24, 38, 0.48);
  font-family: var(--font-mono);
  font-size: 0.64rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  pointer-events: none;
}

.sceneDepthBack {
  left: 8%;
  top: 12%;
  transform: scale(0.86);
  opacity: 0.52;
}

.sceneDepthMid {
  right: 10%;
  top: 34%;
  transform: scale(1);
}

.sceneDepthFront {
  left: 16%;
  bottom: 12%;
  z-index: 4;
  color: var(--accent-blue);
  transform: scale(1.08);
}
```

Expected: depth labels sit behind/around existing scene content without blocking readability.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 6: Commit scene layer work**

Run:

```bash
git add /Users/rio/thongphan-com/app/page.tsx /Users/rio/thongphan-com/app/page.module.css
git commit -m "feat: layer homepage scroll scenes"
```

Expected: commit succeeds and includes only homepage files.

## Task 5: Responsive And Reduced-Motion Polish

**Files:**
- Modify: `/Users/rio/thongphan-com/app/page.module.css`

- [ ] **Step 1: Extend reduced-motion CSS**

In `/Users/rio/thongphan-com/app/page.module.css`, inside `@media (prefers-reduced-motion: reduce)`, add:

```css
  .orbitFragment,
  .revealCard,
  .heroAtmosphere span,
  .sceneDepth {
    animation: none;
    transform: none;
  }
```

Expected: reduced-motion users do not get persistent animation/3D transforms.

- [ ] **Step 2: Add tablet responsive rules**

In `/Users/rio/thongphan-com/app/page.module.css`, inside `@media (max-width: 960px)`, add:

```css
  .heroRevealShell {
    grid-template-columns: 1fr;
    min-height: auto;
    gap: var(--space-10);
  }

  .heroStage {
    min-height: 620px;
  }

  .systemPlane {
    width: 100%;
    inset: auto 0 0;
  }
```

Expected: hero stacks cleanly before mobile sizes.

- [ ] **Step 3: Add mobile responsive rules**

In `/Users/rio/thongphan-com/app/page.module.css`, inside `@media (max-width: 680px)`, add:

```css
  .heroRevealShell {
    width: calc(100% - 32px);
    padding: var(--space-10) 0 var(--space-12);
  }

  .hero h1 {
    font-size: 2.55rem;
    line-height: 1.03;
  }

  .heroStage {
    min-height: 540px;
  }

  .revealCard {
    width: min(330px, 82vw);
  }

  .orbitFragment {
    width: 132px;
    padding: 9px;
    transform:
      translate(-50%, -50%)
      rotate(var(--angle))
      translateY(-220px)
      rotate(var(--neg-angle));
  }

  .orbitFragment b {
    font-size: 1rem;
  }

  .orbitFragment em,
  .systemPlane,
  .sceneDepth {
    display: none;
  }

  .characterPlate {
    left: var(--space-3);
    right: var(--space-3);
    bottom: var(--space-3);
  }
```

Expected: mobile hero has no overflow and avoids tiny/overlapping labels.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: build passes.

- [ ] **Step 5: Commit responsive polish**

Run:

```bash
git add /Users/rio/thongphan-com/app/page.module.css
git commit -m "fix: polish 2.5d homepage responsiveness"
```

Expected: commit succeeds and includes only `app/page.module.css`.

## Task 6: Local Browser QA And Documentation

**Files:**
- Create: `/Users/rio/thongphan-com/docs/superpowers/qa/2026-05-24-thongphan-2-5d-homepage-prototype.md`

- [ ] **Step 1: Run build and tests**

Run:

```bash
npm run build
npm test
```

Expected:

- `npm run build` succeeds.
- `npm test` succeeds for `scripts/generate-library-data.test.mjs`.

- [ ] **Step 2: Start local dev server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3002
```

Expected:

- Server starts on `http://127.0.0.1:3002`.
- If port `3002` is busy, use `3003` and record the actual port in the QA doc.

- [ ] **Step 3: Browser-check desktop**

Open `http://127.0.0.1:3002/` at `1440x1000`.

Verify:

- Hero loads without blank-screen delay.
- Thong/stage card is visually dominant in the first viewport.
- Proof fragments do not cover CTA or headline.
- Scrolling moves hero/depth layers.
- Signal, Brain2, Proof, Diagnostic, Conan scenes remain readable.
- No console errors.
- No horizontal overflow.

- [ ] **Step 4: Browser-check mobile**

Open `http://127.0.0.1:3002/` at `390x844`.

Verify:

- No horizontal overflow.
- Hero card/portrait remains visible and meaningful.
- Orbit fragments do not make text unreadable.
- CTAs are tappable and full-width on mobile.
- Scroll scenes stack without sticky clipping.

- [ ] **Step 5: Browser-check reduced motion**

Use browser reduced-motion emulation or OS setting, then open `/`.

Verify:

- Content remains visible.
- Hero card is not hidden waiting for animation.
- No pinned/scroll animation prevents reading.

- [ ] **Step 6: Write QA ledger**

Create `/Users/rio/thongphan-com/docs/superpowers/qa/2026-05-24-thongphan-2-5d-homepage-prototype.md` with:

```markdown
# thongphan.com 2.5D Homepage Prototype QA

Date: 2026-05-24
Local URL: http://127.0.0.1:3002

## Commands

- `npm run build`: succeeded
- `npm test`: succeeded

## Desktop 1440x1000

- Hero no blank delay: yes
- Thong dominant: yes
- Proof fragments readable: yes
- 2.5D scroll visible: yes
- Scenes readable: yes
- Console errors: none observed
- Horizontal overflow: none observed

## Mobile 390x844

- No horizontal overflow: yes
- Hero card visible: yes
- CTAs tappable: yes
- Scenes readable: yes
- Text overlap: none observed

## Reduced Motion

- Content visible: yes
- No scroll lock: yes
- Motion disabled or simplified: yes

## Prototype Limitations

- Uses supplied stage photo, not final hero key-art.
- Uses code-native proof/system panels, not approved private screenshots.
- Not deployed to production.
```

If any observed result differs from the success wording above, write the actual observed result in that line instead of the success wording.

- [ ] **Step 7: Commit QA ledger**

Run:

```bash
git add /Users/rio/thongphan-com/docs/superpowers/qa/2026-05-24-thongphan-2-5d-homepage-prototype.md
git commit -m "docs: record 2.5d homepage prototype qa"
```

Expected: commit succeeds and includes only the QA file.

## Self-Review Checklist

- Spec coverage:
  - Game-card reveal: Task 2 and Task 3.
  - Thong visual dominance: Task 1 and Task 2.
  - 2.5D scroll direction: Task 3 and Task 4.
  - Private-safe proof/system visuals: Task 2 and Task 4.
  - Mobile/reduced motion: Task 5 and Task 6.
  - No production deployment: Task 6 documentation only.
- Red-flag scan:
  - This plan intentionally contains no incomplete implementation steps.
- Type consistency:
  - `proofFragments`, `depthSignals`, `data-hero-fragment`, `data-hero-card`, `data-depth-layer`, and `data-scene-depth` are consistently named across markup, CSS, and GSAP tasks.
