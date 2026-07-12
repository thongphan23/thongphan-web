# thongphan.com — Motion Atmosphere System

Date: 2026-07-12
Status: Approved design, awaiting written-spec review

## Goal

Make thongphan.com feel continuously alive, modern and technologically advanced
without turning the Cinema identity into a visual-effects demo. Navigation must remain
available while scrolling, interactive elements must respond with refined light and
depth, and reading surfaces must remain calm.

## Experience principle

The selected intensity is **balanced**: visitors should notice that the website is
alive within the first viewport, but no effect may compete with the message, hide an
action, crop a face, or make long-form reading tiring.

The motion language is physical cinema light rather than generic neon technology:
projector beams, reflected lacquer, lens bloom, film movement and shallow depth.

## Scope

### 1. Persistent navigation

- The unified header is fixed on desktop and mobile across all unified routes.
- At the top of a dark page it appears spacious and translucent. After scrolling it
  compacts slightly, increases background opacity and gains a fine illuminated edge.
- The homepage chapter navigation remains directly below the primary header and
  continues to expose the current chapter.
- Light editorial pages receive an opaque ink header so body text never shows through.
- Layout reserves the header height. No page content may be hidden underneath it.
- Mobile retains the existing accessible menu, focus trap, Escape close and focus
  restoration behavior.

### 2. Ambient light layer

- Dark Cinema surfaces receive one shared ambient layer with a slow projector beam,
  a low-opacity moving bloom and restrained film grain.
- The layer is decorative, `pointer-events: none`, isolated below page content and
  incapable of creating horizontal overflow.
- Reading bodies and other paper-light surfaces do not receive moving beams. They may
  retain only static texture and the existing reading-progress feedback.
- Ambient animation pauses when the page is not visible.

### 3. Pointer light

- Fine-pointer desktop devices receive one page-level light field driven by CSS custom
  properties. One passive pointer listener updates the field through `requestAnimationFrame`.
- The field becomes more visible over explicitly opted-in interactive surfaces, never
  over normal reading paragraphs.
- Touch and coarse-pointer devices do not initialize this behavior.
- The effect must not intercept click, hover, text selection or keyboard focus.

### 4. Interaction physics

- Primary actions receive a short lacquer-light sweep, a small lift and directional
  arrow movement on hover/focus.
- Cards and image links receive a moving edge highlight, restrained depth and image
  scale of no more than 1.02.
- Optional pointer tilt is capped at 1 degree and only applied to large opted-in cards.
- Image motion must preserve the approved focal position and may not introduce a new
  crop. Faces remain fully visible wherever the current composition exposes them.
- Keyboard focus produces an equally legible response; hover is never the only signal.

### 5. Scroll choreography

- Existing GSAP is reused. No new motion dependency is added.
- Section entrances vary between mask reveal, contrast fade and short lateral drift;
  they do not all use the same bottom-up animation.
- Hero and evidence imagery may use shallow parallax. The movement is clamped and
  cannot alter layout geometry.
- The homepage film rail moves only when its existing truthful-asset gate permits it,
  and pauses on hover or focus.
- No section is pinned unless it already has enough viewport space at the supported
  short-laptop breakpoint.

### 6. Route intensity

| Route family | Persistent header | Ambient beam | Pointer light | Scroll motion | Hover depth |
| --- | --- | --- | --- | --- | --- |
| Homepage / dark Cinema | Full | Full, restrained | Full | Full | Full |
| About / diagnostic / action dossiers | Full | Restrained | Interactive areas | Medium | Full |
| Library indexes | Full | Restrained hero only | Interactive areas | Medium | Full |
| Reading and blog detail | Full | None in body | Links/media only | Minimal | Minimal |
| Mobile all routes | Full | Slow and simplified | Off | Simplified | Tap feedback |

## Architecture

### MotionAtmosphere

A single client component mounted in the unified site shell. It owns:

- fine-pointer detection;
- reduced-motion detection;
- page-visibility pause state;
- requestAnimationFrame-throttled pointer coordinates;
- route-mode attributes consumed by CSS.

It renders decorative atmosphere nodes once and exposes state only through data
attributes and CSS custom properties. It does not know about individual page content.

### Persistent SiteHeader

`SiteHeader` owns the compact/non-compact state using a passive scroll listener. The
state is represented by a data attribute so visual behavior remains in CSS. Existing
active-section observation and mobile-menu behavior remain independent.

### Opt-in motion attributes

Shared semantic attributes define the effect boundary:

- `data-motion-surface` for light-reactive cards or media;
- `data-motion-action` for interactive light sweeps;
- `data-motion-parallax` for approved shallow scroll movement;
- existing reveal attributes remain supported.

Pages opt in rather than receiving blanket transforms. This prevents article prose,
forms and small controls from moving unexpectedly.

### CSS layers

The unified shell uses a stable layer contract:

1. page background;
2. ambient light and grain;
3. page imagery;
4. page content and actions;
5. persistent navigation;
6. menus, dialogs and focus overlays.

Decorative layers never sit above actions.

## Motion timing

- Ambient cycle: 16–24 seconds, alternate direction, no abrupt reset.
- Hover/focus response: 180–420ms depending on element size.
- Section entrance: 500–900ms, triggered once unless the existing experience requires
  reversible motion.
- Header compaction: 220ms.
- Parallax displacement: maximum 18px desktop and zero on mobile.

Only `transform`, `opacity`, filter intensity and CSS custom properties may animate in
continuous loops. Layout properties are excluded from continuous animation.

## Accessibility and safety

- `prefers-reduced-motion: reduce` disables ambient travel, pointer tracking, parallax,
  tilt, auto-moving rails and nonessential entrance motion.
- Reduced motion preserves color, hierarchy, focus indication and all navigation.
- Effects meet the existing focus-ring contract and do not lower text contrast.
- Decorative nodes are hidden from assistive technology.
- Header landmarks and labels remain unchanged.
- No animation flashes more than three times per second.

## Performance budget

- No WebGL, canvas, autoplay background video or new animation package.
- One passive scroll listener for header state and one fine-pointer listener for the
  shared light field.
- Pointer updates are throttled to one animation frame.
- Ambient layers use at most three composited pseudo-elements/nodes.
- No measurable horizontal overflow or layout shift may be introduced.
- Homepage JavaScript and image release budgets must continue to pass.

## Error handling and progressive enhancement

- With JavaScript disabled, navigation remains visible and all links work.
- If GSAP fails to initialize, content remains visible in its final state.
- If pointer capability changes or reduced motion is enabled, the atmosphere component
  tears down its listener and clears transient transforms.
- Browsers without `backdrop-filter` receive a more opaque header background.

## Acceptance criteria

1. Header remains visible at page top, mid-page and near the footer on representative
   dark, light editorial and dossier routes.
2. Homepage chapter navigation remains usable and correctly marks the active section.
3. No content is hidden behind the fixed header at desktop, tablet or mobile sizes.
4. Ambient motion is visible on dark routes and absent from long-form reading bodies.
5. Pointer light follows a fine pointer without blocking clicks or text selection.
6. Approved buttons, cards and media provide hover and keyboard-focus responses.
7. No new face crop, text collision, frame intrusion or horizontal overflow appears.
8. Reduced-motion mode disables all nonessential movement while preserving function.
9. Browser console contains no relevant warning/error during the target flows.
10. Existing functional, type, static-build, SEO, bundle and Read-safety gates pass.
11. Production smoke passes at minimum `1440x900`, `1280x720`, `390x844` and
    `320x568` on the custom domain.

## Target flows

- Homepage loads → header remains available → visitor scrolls through chapters →
  active chapter updates → interactive surfaces respond → CTA opens diagnostic.
- Library loads → restrained hero motion runs → visitor hovers/focuses a reading →
  reading opens → article body remains calm while navigation stays available.
- Any route with reduced motion → page loads with no ambient travel/parallax/tilt →
  navigation and interactions remain fully usable.

## Non-goals

- No redesign of information architecture, copy or approved Cinema assets.
- No WebGL, Three.js, cursor replacement, particle field or game-like interaction.
- No blanket animation applied to article paragraphs, form controls or every DOM node.
- No fabricated proof asset and no change to the film-reel truthfulness gate.
- No public release of the independent Learn PWA.

## Verification evidence required for release

- Red/green contracts for fixed-header spacing, layer ordering and reduced-motion teardown.
- Rendered desktop/mobile screenshots before and after scroll.
- DOM measurements for header/content separation and horizontal overflow.
- Interaction proof for chapter navigation, CTA, hover/focus and mobile menu.
- Reduced-motion and coarse-pointer checks.
- Fresh full test, typecheck, build, release and Read-safety output.
- Production deployment ID and custom-domain smoke report recorded in `docs/STATUS.md`.
