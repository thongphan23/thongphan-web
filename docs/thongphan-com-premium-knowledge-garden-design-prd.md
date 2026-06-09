# thongphan.com — Premium Cinematic Knowledge Garden Design PRD

## 1. North Star

Website đại diện cho anh Thông Phan: creator/educator/founder giúp Invisible Experts — người giỏi nghề nhưng ít người biết — biến tri thức sống, trải nghiệm thật và năng lực AI thành thương hiệu cá nhân, tài sản số, và thu nhập xứng đáng.

Trong 5 giây đầu, người xem phải nghĩ:

- Anh Thông có gu.
- Anh Thông chuyên nghiệp.
- Anh Thông giỏi công nghệ nhưng không phô trương.
- Đây không phải website AI template hay landing page khóa học rẻ tiền.

Cảm giác cần tạo: tin tưởng, cinematic, tươi sáng, có chiều sâu, wow vì trải nghiệm, nhưng vẫn đọc dễ và có chất editorial sang trọng.

## 2. Audience

Primary audience: Invisible Experts — người có năng lực/kỹ năng/kinh nghiệm nhưng chưa có Visibility tương xứng, đang chịu nỗi đau unfair income: người kém hơn nhưng biết xuất hiện lại nhận nhiều cơ hội hơn.

Core promise từ Brain2:

> Giúp người giỏi nhưng không ai biết có thu nhập xứng đáng với năng lực bằng ACV: Authenticity, Consistency, Visibility.

## 3. Art Direction

Tên hướng: Cinematic Knowledge Garden.

Visual thesis:

> Kinh nghiệm thật là bộ rễ. Brain2 là đất. Content là cành lá. Sản phẩm/tài sản số là quả chín. AI là hệ thống tưới tiêu và ánh sáng khuếch đại, không thay thế con người.

Không làm fantasy garden, không làm dark HUD, không làm dashboard generic. Đây là một khu vườn tri thức premium: organic + editorial + cinematic + technology restraint.

## 4. Visual System

### 4.1 Mood

- 70% sáng/cream/editorial
- 20% xanh sống/organic
- 10% gold/tech accent

Cinematic không đồng nghĩa tối. Nền chủ đạo cần tươi, sạch, có ánh sáng, không nặng như bản cũ.

### 4.2 Color tokens

- Garden cream: `#fbf5e6`
- Paper: `#fffaf0`
- Deep ink: `#102018`
- Leaf: `#2f8f5b`
- Fresh leaf: `#79c56e`
- Gold: `#d8a63a`
- Warm gold: `#f1d178`
- Sky tech accent: `#82c9e8`
- Muted brown/soil: `#7a6040`

### 4.3 Typography

Editorial, readable, premium.

Rules:

- Desktop hero h1: 56–68px, never 9rem/10rem.
- Mobile hero h1: 34–42px, never fills whole first viewport.
- Body: 16–18px, line-height 1.65–1.8.
- One section = one idea.
- Avoid excessive uppercase and heavy weights.

Fonts currently acceptable:

- Heading: Be Vietnam Pro, weight 650–760.
- Body: Inter, 400–520.
- Serif accent: Lora for emotional phrase only.

## 5. Key Visual Requirements

Hero must use object-first 3D quality.

Required objects:

- Ancient knowledge tree / bonsai-like living tree, premium 3D, not CSS-drawn.
- Floating notes/books/pages as knowledge fragments.
- Gold fruits/orbs as digital assets.
- Soft cinematic atmosphere: light beams, dust/particles, depth.
- Tech hint: subtle data threads/orbit lines, not HUD.

Quality gate:

- The object must look good as a standalone asset.
- No cheap AI fantasy/plastic look.
- Desktop and mobile crops must be separately QA’d.
- The visual must support message, not decorate randomly.

## 6. Homepage Architecture

### Scene 1 — Hero: Living Knowledge Garden

Goal: wow + trust.

Content:

- Short headline.
- One clear subcopy.
- 2 CTAs.
- 3 proof chips.
- 3D object stage.

Recommended headline:

> Biến tri thức sống thành tài sản số.

Subcopy:

> Anh Thông giúp những người giỏi nhưng chưa được biết đến xây thương hiệu cá nhân bằng Brain2, ACV và AI — để kinh nghiệm thật mọc thành nội dung, sản phẩm và cơ hội xứng đáng.

### Scene 2 — Invisible Experts Pain

Goal: make target feel seen.

### Scene 3 — ACV Framework

Goal: explain the method in a premium, non-coursey way.

### Scene 4 — Brain2 as Garden

Goal: show moat and technology depth.

### Scene 5 — Assets / Fruit

Goal: show outputs: diagnostic, articles, frameworks, products.

### Scene 6 — Garden Gate CTA

Goal: invite without cheap selling.

## 7. Component Grammar

- `EditorialPanel`: warm paper card, clear hierarchy.
- `GardenObjectStage`: 3D asset stage with subtle depth.
- `KnowledgeNode`: small semantic node, not generic icon card.
- `AssetFruit`: product/asset proof card.
- `ProofStrip`: compact trust signals.
- `GardenGate`: final CTA.

Avoid card soup and generic icon grids.

## 8. Motion

Motion should feel expensive and restrained.

Allowed:

- Hero object slow float.
- Micro parallax on desktop only.
- Subtle note/particle drift.
- Section reveal via opacity/translate.
- Hover lift < 6px.

Required:

- `prefers-reduced-motion` fallback.
- Mobile reduced intensity.

Forbidden:

- Long boot/loading screen.
- Scanline/HUD cliché.
- Animated text that harms reading.
- Excess glow.

## 9. Acceptance Criteria

### Desktop

- First viewport communicates premium + tech + trust in 5 seconds.
- Headline readable at once.
- Key visual looks intentional and premium.
- CTA visible without feeling salesy.

### Mobile

- Headline does not exceed 3 lines.
- First viewport contains message + CTA or near CTA.
- No awkward crop, overflow, or giant typography.

### Technical

- `npm test` pass.
- `npm run build` pass.
- Browser QA desktop/mobile pass.
- Console clean on key production routes.
- No deploy before QA pass.

## 10. Non-goals

- Not a cheap course landing page.
- Not a SaaS dashboard clone.
- Not a dark fantasy garden.
- Not a CSS-generated art experiment.
- Not a generic AI website.
