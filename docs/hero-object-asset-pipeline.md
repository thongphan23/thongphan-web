# Hero Object Asset Pipeline — Lush Knowledge Tree

## Decision

Hero của `thongphan.com` không dùng một ảnh phẳng làm background cuối cùng.

Hướng mới: tạo một vật thể trung tâm có thể tách lớp, xoay nhẹ, parallax và tương tác 2.5D.

Object chính: **Cây cổ thụ tri thức bay lơ lửng** — lush, green, grounded, premium, tượng trưng cho tri thức sống, chuyên môn sinh trưởng và hệ sinh thái học tập.

## Visual Thesis

> A floating ancient knowledge tree: deep roots of expertise, lush green canopy of living knowledge, books and notes integrated as organic fruit/branches, suspended in a premium mist garden.

Cảm giác cần đạt:

- Xanh mướt, xum xuê, có sức sống.
- Sang, editorial, không fantasy game.
- Có chiều sâu vật thể, không phải tranh phẳng.
- Có thể tương tác như một premium product object.
- Gợi “tri thức đang sinh trưởng”, không phải cây ma thuật ảo.

## Anti-patterns

Không dùng:

- Ảnh landscape phẳng chỉ làm background.
- Cây trắng/khô/porcelain nhìn ảo.
- Fantasy glowing tree, cyberpunk, neon, UI labels.
- Quá nhiều sách/đèn/chi tiết khiến thành AI slop.
- Cây nằm chìm trong khung cảnh không tách được object.
- Object bị cắt mép, khó xoay/parallax.

## Required Asset Set

### A. Master Object Views

Tạo cùng một object, cùng art direction, các góc:

1. `front-0deg` — chính diện, dùng hero mặc định.
2. `front-left-15deg` — hover/scroll xoay nhẹ sang trái.
3. `front-right-15deg` — hover/scroll xoay nhẹ sang phải.
4. `top-10deg` — thấy canopy và root platform, dùng mobile/section transition.
5. `detail-root` — cận cảnh rễ + sách + note, dùng section “Proof/Systems”.
6. `detail-canopy` — cận tán lá + artifact tri thức, dùng section “Content/Knowledge”.

### B. Layered 2.5D Pieces

Nếu ChatGPT tạo được transparent/cutout tốt, cần các lớp:

1. `tree-trunk-root` — thân + rễ + platform.
2. `canopy-back` — tán sau.
3. `canopy-front` — tán trước.
4. `books-notes` — sách/note/paper artifacts.
5. `light-particles` — hạt sáng rất nhẹ.
6. `mist-shadow` — bóng/mist nền tách riêng.

Nếu không có alpha chuẩn, dùng remove background/crop manual sau.

## Website Interaction Plan

### Hero

- Text nằm bên trái.
- Object cây nằm bên phải hoặc center-right.
- Object nổi trên nền mist/sage gradient rất nhẹ.
- Mouse move: parallax 6–14px giữa các lớp.
- Hover: rotateY 3–6deg, scale 1.01.
- Scroll first viewport: object lift + canopy breathe.
- Reduce motion: static image.

### Section Transitions

- Root detail dẫn sang section Brain2 / operating system.
- Canopy detail dẫn sang section Content / personal brand assets.
- Floating notes/books dùng làm micro motifs ở các section sau.

## Prompt Pack

### Master object prompt

Create a premium isolated hero object for a website: a floating ancient knowledge tree, lush and alive, rich green canopy, strong organic trunk, visible roots wrapping a minimal circular stone platform. Books, paper notes, and knowledge artifacts are integrated subtly into branches and roots like natural fruit, secondary to the tree. The object should be cleanly separable from the background, centered, full object visible, no cropped edges.

Mood: premium editorial, calm authority, warm morning light, fresh sage green and deep leaf green, subtle champagne highlights, tactile organic wood, refined botanical garden. It must feel like living expertise growing into a public signal.

Composition: object-only, 3/4 product render, lots of transparent or plain warm off-white background, no landscape scene, no people, no readable text, no logos, no fantasy magic, no neon, no sci-fi, no clutter. Realistic but slightly conceptual, Apple-level product object photography.

### Angle variants

Use the exact same object identity and art direction. Generate a [ANGLE] view of the floating lush knowledge tree object. Keep shape, trunk, canopy, root platform, books and notes consistent. Plain warm off-white background. Full object visible. Premium editorial product render.

ANGLE options:

- front view, 0 degrees
- front-left view, rotated 15 degrees
- front-right view, rotated 15 degrees
- slightly top-down view, 10 degrees above

### Layer prompts

Generate only the [LAYER] layer of the same floating lush knowledge tree object, isolated on transparent or plain off-white background, matching the master object exactly. Full layer visible, no other elements.

LAYER options:

- trunk and roots with platform
- back canopy
- front canopy
- books and paper notes attached to branches
- subtle warm light particles
- soft mist and contact shadow

## Quality Gates

Pass only if:

- Object reads clearly when viewed without copy.
- Tree is lush/green/living, not dry/white/fantasy.
- Background is simple enough to cut out.
- Same object identity can be maintained across views.
- There is enough negative space in final hero composition.
- Mobile crop still shows trunk + canopy, not only leaves.

## Implementation Notes

Preferred front-end approach:

- `HeroObjectStage` component.
- CSS perspective + layered absolute images.
- Pointer-driven parallax via CSS variables.
- Scroll-driven transform with `requestAnimationFrame` or Framer Motion if already installed.
- `prefers-reduced-motion` fallback.

Asset path convention:

`public/images/hero-object/knowledge-tree-[variant].png`

