# thongphan.com Evidence Cinema Homepage — Design Specification

**Status:** Selected visual direction, awaiting written-spec approval

**Date:** 2026-07-10

**Product surface:** `https://thongphan.com/` homepage

**Selected visual target:** [Evidence Cinema selected mock](./assets/2026-07-10-evidence-cinema-selected.png)

**Implementation repo:** `/Users/rio/thongphan-com`

## 1. Decision

The homepage will be redesigned in the selected **Evidence Cinema** direction:

- cinematic documentary noir rather than AI fantasy;
- real, recognizable Thông Phan photography rather than a generated stand-in;
- proof presented as an editorial film/contact sheet;
- ink black, warm paper and lacquer red rather than the current garden palette or generic black-gold luxury;
- a restrained set of repeated motion motifs rather than decorative animation everywhere.

The selected mock is the visual target for composition, rhythm, hierarchy and mood. It is not a factual source. Any text, metric, image, caption or “verified” mark invented by ImageGen must be replaced with sourced content before release.

## 2. Context and problem

The current production homepage has a strong cinematic hero and a useful personal-story pivot, but it has four structural problems:

1. Production is not reproducible from the current GitHub/local source.
2. A CSS asset was changed under a one-year immutable cache URL, causing broken proof layouts for returning visitors.
3. Visual quality peaks in the hero and drops into repeated cards and static text below it.
4. The homepage and `/conanmaker` both act as Conan Maker sales pages, weakening the distinct role of `thongphan.com`.

This redesign must improve the homepage without repeating those failures.

## 3. Product goal

Turn the homepage into a personal-brand headquarters that lets a cold visitor quickly answer:

1. Who is Thông Phan?
2. What does he help people do?
3. Why should I believe him?
4. What is the next step for my current situation?

The intended emotional sequence is:

```text
Recognition → curiosity → evidence → self-diagnosis → next action
```

The homepage should create qualified movement into the diagnostic, library and Conan ecosystem. It must not try to complete the full Conan Maker sales decision.

## 4. Audience

Primary audience:

- Vietnamese professionals with approximately 3–15 years of real experience;
- coaches, consultants, trainers, creators, senior freelancers, marketers, managers and service founders;
- people with expertise but without a clear way to turn it into content, proof, an offer or a paid community;
- people who want a second income stream without immediately leaving their main job.

The page is not optimized for beginners seeking tool lists, prompt hacks or fast-money claims.

## 5. Scope

### In scope

- the homepage information architecture and visual system;
- homepage-specific navigation and section progress;
- real-image asset treatment and the evidence rail;
- one lightweight three-question mirror/diagnostic entry;
- motion choreography for homepage sections;
- desktop, tablet and mobile behavior;
- reduced-motion behavior;
- homepage analytics events;
- homepage contract tests and visual-regression coverage;
- a safe asset/deployment path that avoids immutable-cache mismatch.

### Out of scope

- redesigning the full Conan Maker sales page;
- changing pricing, refund terms or cohort rules;
- rebuilding blog, library, chat or challenge detail pages;
- adding a CMS or admin panel;
- creating a Three.js/WebGL universe;
- inventing public proof, testimonials or metrics;
- adding a long cinematic loader;
- deploying before the live-source discrepancy is resolved.

## 6. Non-negotiable constraints

1. **Visual independence from Brain2 motifs.** Brain2 may inform content and method, but it does not determine the visual language.
2. **Real person first.** The first viewport must show an identifiable Thông Phan, not a generated character.
3. **Real proof only.** Every public proof asset needs a source and a caption explaining what it proves.
4. **One primary CTA per section.** Repeated links to the same destination must not overwhelm the page.
5. **No fake luxury.** Avoid gold gradients, glass cards, glowing orbs, generic bento grids and large collections of equal cards.
6. **No motion tax.** Essential content is readable without waiting for animation.
7. **Mobile is a designed mode.** Mobile must not be a scaled desktop composition.
8. **No new paid dependency is required.** The design uses existing tooling and freely available fonts.

## 7. Selected visual system

### 7.1 Palette

| Token | Value | Use |
|---|---:|---|
| `--cinema-ink` | `#070706` | primary background |
| `--cinema-ink-raised` | `#12100F` | evidence surfaces and subtle depth |
| `--cinema-paper` | `#E8DFCF` | primary text and paper artifacts |
| `--cinema-paper-muted` | `#A69E92` | supporting copy and metadata |
| `--cinema-lacquer` | `#B3231B` | primary CTA, active state and proof stamp |
| `--cinema-lacquer-bright` | `#E04B43` | small text accent on black |
| `--cinema-line` | `rgba(232, 223, 207, 0.20)` | rules, film frame and separators |

Gold, green and blue from the Knowledge Garden system do not appear in the homepage visual layer.

### 7.2 Typography

Use exactly two font families:

- **Cormorant Garamond** for the oversized name lockup and selected editorial headlines. It supports the Vietnamese subset through `next/font/google`.
- **Be Vietnam Pro** for body copy, navigation, captions, CTA and metadata.

Typography rules:

- visual name lockup may reach `clamp(6rem, 13vw, 13.5rem)` on wide screens;
- the semantic `h1` is the promise, not the decorative name lockup;
- body copy remains at least `1rem` desktop and `0.94rem` mobile;
- no text essential to the task may be smaller than `0.75rem`;
- maximum body line length is 65 characters;
- only lacquer red may highlight words inside the primary promise.

### 7.3 Texture and imagery

- monochrome or lightly warm-toned real photography;
- restrained film grain as a fixed, pointer-free overlay;
- subtle frame numbers, crop marks and contact-sheet perforation;
- no fake dust/scratches over text areas;
- no inline generated image that impersonates evidence;
- portraits must preserve recognizable identity and natural skin texture.

### 7.4 Evidence stamp

The circular “evidence stamp” is a recurring decorative motif. It must use sourced, non-claim wording such as:

```text
LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT
```

It is `aria-hidden="true"`. It must never imply that a third party verified a claim unless such verification exists.

## 8. Homepage information architecture

The homepage consists of six acts.

### Act 1 — Manifesto hero

Purpose: establish person, promise and one next action.

Visible content:

- decorative name lockup: `THÔNG PHAN`;
- semantic `h1`: `Biến chuyên môn thật thành tài sản có người muốn dùng.`;
- support line: `Từ trải nghiệm thật đến cộng đồng trả phí — không cần rời bỏ công việc hiện tại.`;
- primary CTA: `Khám phá lộ trình của bạn` → `/diagnostic`;
- proof microcopy: `Làm thật · Trả giá thật · Hệ thống thật`;
- real stage portrait of Thông Phan;
- top navigation: `Câu chuyện`, `Bằng chứng`, `Phương pháp`, `Conan Maker`.

Desktop composition:

- copy and name lockup occupy the left 45–50%;
- portrait occupies the right 50–55% and crosses the base grid;
- the first evidence frames are visible at the bottom edge to invite scroll;
- CTA remains above the fold at 768px viewport height.

### Act 2 — Mirror

Purpose: turn passive admiration into self-recognition.

A lightweight, three-question interaction asks:

1. `Bạn đã có chuyên môn được bao lâu?` — `Dưới 3 năm`, `3–5 năm`, `Trên 5 năm`.
2. `Thứ gì đang mắc kẹt trong đầu mà chưa thành tài sản?` — `Chưa có bằng chứng rõ`, `Có bằng chứng nhưng chưa đóng gói`, `Đã có tài sản nhưng chưa thành offer/cộng đồng`.
3. `Bạn muốn bắt đầu bằng gì?` — `Nội dung`, `Tài sản đầu tiên`, `Cộng đồng trả phí`.

The interaction returns one of three non-persistent states:

- `Cần làm rõ bằng chứng`;
- `Cần đóng gói tài sản đầu tiên`;
- `Sẵn sàng thiết kế offer/cộng đồng`.

The second answer deterministically selects the result category in the same order shown above. The first answer only personalizes the explanatory sentence. The third answer selects the CTA destination: library, diagnostic/assets, or Conan Maker. The interaction does not store personal data and does not replace the full diagnostic page.

### Act 3 — Proof arc

Purpose: make the promise credible through artifacts.

The narrative sequence is:

```text
Hoa Sơn Tửu Lầu → bài học trả giá → content thử sai → hệ thống hóa → Conan community
```

Each proof item contains:

- a real image or screenshot;
- a short factual title;
- a source link when public;
- one sentence: `Điều này chứng minh gì?`;
- no unsupported metric.

The selected mock's three-image film strip becomes a scrollable proof rail. It is not a repeated card grid.

### Act 4 — Method

Purpose: explain the transformation without returning to the Knowledge Garden visual metaphor.

The method is shown as a linear editorial sequence:

```text
Chuyên môn → Bằng chứng → Tài sản → Offer → Cộng đồng
```

The active step sharpens from soft focus as it enters the viewport. The sequence is readable as plain text when motion is disabled.

### Act 5 — Choose a path

Purpose: give the visitor one relevant route instead of nine repeated Conan links.

Only three routes are shown:

1. `Tôi chưa biết nên bắt đầu từ đâu` → diagnostic.
2. `Tôi muốn biến kiến thức thành tài sản` → curated library path.
3. `Tôi đã sẵn sàng xây cộng đồng trả phí` → Conan Maker.

These routes use an editorial list with image transitions, not equal rounded cards.

### Act 6 — Conan handoff

Purpose: hand off qualified users to the offer.

The section states what Conan Maker adds beyond the homepage:

- a 12-month implementation environment;
- feedback and operating rhythm;
- other makers building alongside the visitor.

Primary CTA: `Xem Conan Maker` → `/conanmaker`.

The section does not repeat price, every objection or the full FAQ.

## 9. Navigation and site chrome

The homepage needs a cinema-specific header while subpages keep their existing functional navigation.

Implementation boundary:

- introduce a small `SiteChrome` client component using `usePathname()`;
- render `CinemaHeader` only for `/`;
- render the existing navigation for all other routes;
- preserve the existing footer for subpages;
- use a reduced editorial footer on the homepage.

Desktop header:

- inline anchor navigation;
- active section indicated by a lacquer-red tick on a thin rule;
- minimum pointer target: 44px high.

Mobile header:

- wordmark plus a 44px `Mục lục` button;
- button opens a full-width dark sheet containing the four links;
- focus is trapped while open and returns to the trigger on close;
- Escape closes the sheet;
- no horizontally clipped navigation.

## 10. Motion choreography

Motion uses three motifs only.

### 10.1 Focus pull

- proof media enters from `filter: blur(6px)` and `opacity: 0.55` to sharp/opaque;
- duration: 650–900ms;
- only the incoming proof item animates;
- blur is never applied to a scrolling container.

### 10.2 Match cut

- a proof thumbnail keeps visual continuity when opening its source/case detail;
- prefer the View Transitions API;
- fallback is a normal navigation without delay.

### 10.3 Evidence stamp

- stamp scales from `0.94` to `1` while opacity resolves;
- duration: 420–520ms;
- it runs once when first entering the viewport;
- it never blocks or delays content.

### 10.4 Hero entrance

- no multi-second boot screen;
- name lockup, portrait and CTA resolve within 900ms;
- essential text is present in the DOM and readable before animation completes;
- no autoplay video in this scope.

### 10.5 Reduced motion

When `prefers-reduced-motion: reduce` is active:

- disable scrub, parallax, blur interpolation and stamp scaling;
- show all content in its final state;
- keep native scrolling;
- use normal page navigation rather than view transitions.

## 11. Responsive behavior

### Desktop — 1280px and above

- selected mock composition is the reference;
- hero uses a two-field composition and bottom evidence rail;
- proof rail shows three frames;
- method sequence may pin only if it passes performance and accessibility QA.

### Tablet — 768px to 1279px

- reduce the name lockup and portrait overlap;
- evidence rail shows two frames plus a partial third;
- no pinned scrolling;
- navigation may remain inline when all targets fit.

### Mobile — 320px to 767px

- no desktop overlap assumptions;
- portrait becomes a full-width background/upper field with a controlled dark gradient;
- promise and CTA remain visible in the first viewport at 390×844;
- name lockup uses a maximum of two lines and never clips horizontally;
- evidence rail uses native horizontal scroll snap;
- body sections are single-column editorial blocks;
- no cursor-following effects;
- no hover-dependent information.

## 12. Content and evidence contract

The following source assets are currently approved as identity references:

- `/public/images/homepage/thong-stage-anchor.jpg`;
- `/public/images/homepage/thong-library-author.jpg`;
- `/public/thong-phan.jpg`.

Before implementation completes, the proof rail must have three real assets with source notes. If a third real asset is unavailable, ship two proof items rather than generate a fake third proof.

Dynamic numbers require a source and verification date in the content data. The rendered UI does not show `verified` language unless verification is documented.

## 13. Technical architecture

Keep the implementation narrow and reuse the existing Next.js App Router and GSAP dependency.

Proposed modules:

```text
app/page.tsx
components/site-chrome/SiteChrome.tsx
components/home-cinema/HomeCinema.tsx
components/home-cinema/HomeCinema.module.css
components/home-cinema/home-cinema-content.ts
components/ScrollAnimations.tsx
scripts/homepage-cinematic-contract.test.mjs
```

Responsibilities:

- `app/page.tsx`: metadata and homepage entry only;
- `HomeCinema.tsx`: owns the six-act composition and local interaction state;
- `home-cinema-content.ts`: owns typed copy, proof sources and route destinations;
- `HomeCinema.module.css`: owns the selected visual system and responsive behavior;
- `SiteChrome.tsx`: chooses homepage vs subpage navigation;
- `ScrollAnimations.tsx`: shared observer/GSAP behavior, scoped by data attributes;
- contract test: locks content, assets, motion fallback and banned old motifs.

`SiteChrome` owns both header and footer variants so the existing root-layout footer is not rendered underneath the cinema homepage. The current subpage header/footer markup is preserved inside the default variant.

Scroll progress and pointer work must be coalesced through `requestAnimationFrame`; observers and GSAP timelines must only initialize when their scoped data attributes exist. No state manager, new animation library or runtime content service is needed.

## 14. Performance budget

- no hero video in the first implementation;
- hero LCP image: ≤350KB desktop and ≤180KB mobile target after optimization;
- initial JavaScript added by homepage interaction: ≤35KB gzip target;
- LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile target;
- animate `transform` and `opacity`; use `filter` only on one bounded item at a time;
- no full-page `backdrop-filter`;
- grain texture must be fixed, lightweight and pointer-free;
- below-fold proof imagery uses lazy loading;
- no asset may be updated under an existing immutable URL.

## 15. Accessibility requirements

- semantic heading order with one `h1`;
- all functional controls have visible focus states;
- pointer targets are at least 44px for primary controls;
- mobile menu supports keyboard and Escape;
- evidence images have descriptive alt text; decorative crop marks/stamps are hidden;
- color contrast meets WCAG AA for text and controls;
- motion has a reduced-motion path;
- horizontal proof rail remains keyboard scrollable and has visible overflow cues;
- no information is communicated by lacquer red alone.

## 16. Analytics events

Track only events that answer a product question:

- `homepage_primary_cta_clicked`;
- `homepage_mirror_completed` with result category only;
- `homepage_proof_opened` with proof slug;
- `homepage_path_selected` with route slug;
- `homepage_conan_handoff_clicked`.

Do not record free-text answers from the mirror interaction.

## 17. Error and fallback behavior

- if JavaScript fails, all six acts and normal links remain usable;
- if a proof image fails, render the sourced title/caption and a neutral paper placeholder;
- if View Transitions are unavailable, navigate normally;
- if GSAP loading fails, content remains in its final visible state;
- if a proof source cannot be verified, omit it from public rendering;
- deployment must fail when the built HTML references a missing fingerprinted asset.

## 18. Verification plan

### Automated

- update and run `npm test`;
- run `npm run build`;
- add contract checks for selected copy, selected asset paths and banned Knowledge Garden terms;
- assert a reduced-motion media query exists;
- assert the homepage includes one primary CTA above the fold;
- assert no unsupported proof metric exists in content data.

### Browser QA

Capture and compare against the selected visual target at:

- desktop: 1440×1024;
- laptop: 1280×720;
- tablet: 834×1194;
- mobile: 390×844 and 375×812.

Test:

- hero hierarchy and crop;
- CTA and anchor navigation;
- mobile menu keyboard/focus flow;
- mirror interaction states;
- evidence rail keyboard/touch behavior;
- reduced motion;
- no horizontal overflow;
- proof source links;
- fresh and returning-visitor cache behavior.

### Visual acceptance

- real Thông Phan is immediately identifiable;
- the first viewport reads as documentary/editorial, not AI fantasy;
- the selected mock's large name, portrait tension, lacquer CTA and film rail are visibly preserved;
- no garden/tree/cloud/island motif remains;
- no generic card wall appears;
- text remains readable at every breakpoint;
- motion clarifies focus and evidence rather than delaying reading.

## 19. Acceptance criteria

The design is ready for implementation when all of the following are true:

1. The selected mock is stored in the repo and referenced by this spec.
2. Homepage role and Conan Maker role are clearly separated.
3. Every homepage act has one purpose and one primary action.
4. Typography, palette, imagery and motion tokens are explicit.
5. Desktop, mobile and reduced-motion behavior are defined.
6. Real-proof and no-fake-metric rules are explicit.
7. The source/deployment mismatch is a blocking Phase 0 task in the implementation plan.
8. Verification covers build, behavior, visual fidelity, accessibility and cache safety.

## 20. Implementation precondition

Before editing homepage implementation files, the implementation plan must begin with a Phase 0 source reconciliation:

1. capture the exact current live source/build inputs;
2. decide whether the repo version replaces the live manual build or whether live changes are imported;
3. preserve the current untracked `public/_redirects` and `public/conanmaker/` work;
4. establish one reproducible build/deploy path;
5. create new fingerprinted assets and verify returning visitors no longer receive mismatched CSS.

Implementation must not proceed by blindly overwriting the live experience from the stale repo state.
