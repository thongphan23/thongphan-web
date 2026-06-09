# Full-site Premium Garden Redesign Spec

## North Star

`thongphan.com` phải trở thành một website thương hiệu cá nhân đẳng cấp, không phải landing page SaaS. Visual system chuyển từ `panel / dashboard / graph / scan` sang `floating object / root / seed / branch / fruit / gate / garden path`.

Trung tâm nhận diện: **cây cổ thụ tri thức bay lơ lửng** — xanh mướt, xum xuê, có rễ, có quả tri thức, có sách/note/artifact tích hợp tinh tế. Hero object phải dùng được cho 2.5D/parallax/hover/scroll, không phải ảnh nền phẳng.

## Quality Rules

- Không dùng icon phổ thông kiểu library icon chung chung.
- Icon phải là glyph riêng của Thông Phan: root, seed, branch, fruit, gate, growth ring, leaf-note.
- Không dùng visual AI slop: không sci-fi, không neon, không HUD/dashboard rẻ tiền, không chữ nhảm trong ảnh.
- Không dùng nhiều label trên visual object; để object kể chuyện.
- Typography: editorial, thoáng, authority, ưu tiên dark emerald + warm gold + cream.
- Mọi route public phải cùng một thế giới visual.

## Global System

- Background: deep emerald / near-black, mist, grain, soft garden glow.
- Primary accent: warm gold.
- Secondary accent: lush green / sage / moss.
- Blue/cyan chỉ dùng rất hạn chế cho intelligence glow.
- Cards: dark translucent glass, organic shadow, gold-green rim.
- Buttons: gold premium pill, không blue block shadow.
- Nav/footer: như cửa vào vườn tri thức, không giống SaaS nav.

## Route Direction

### `/`
Master cinematic hero. Dùng floating knowledge tree object + 2.5D parallax. Text bên trái hoặc center-left, object center-right. Các section sau chuyển thành rễ/thân/tán/quả/cổng Conan.

### `/about`
Origin tree. Timeline thành vòng tuổi/rễ ký ức. Proof numbers thành seed/growth plaques. Portrait nếu dùng phải là gardener/keeper mood, không CV card.

### `/diagnostic`
Root Scan / Knowledge Soil Diagnosis. 5 tầng thành quá trình từ hạt → mầm → rễ → quả → greenhouse Conan. Giữ UX quiz nhưng đổi metaphor khỏi radar/HUD.

### `/chat`
Greenhouse Brain2. Empty state phải có Brain2 seed/tree node. Suggestion prompt thành seed prompts/leaf questions.

### `/blog`
Vườn bài viết / path of thinking. Featured post thành editorial leaf/book object. Filters thành branch tabs.

### `/blog/[slug]`
Article reading là branch map. Progress bar thành root growth line. End CTA thành harvest/garden gate.

### `/library`
Living knowledge garden mạnh nhất sau homepage. Graph nodes thành seed pods/leaves/glowing roots. Section cards thành garden beds.

### `/library/[slug]`
Mỗi note là seed object. Local graph thành root cluster. Source trace là soil layers. Backlinks là roots returning.

### `/assets`
Harvest Garden. Featured asset là quả tri thức chín. Catalog thành fruit capsules. Boundary với Conan là greenhouse gate.

### `/assets/[slug]`
Mỗi asset có product object identity. Purchase card là floating harvest panel. Includes là object disassembly/layers.

### `/challenges`
Growth Program. 21 ngày là 21 leaves / growth rings.

### `/challenges/[slug]`
21-day root calendar. Signup là planting card. Before/after là đất khô → rễ nối.

### `/concept`
Sandbox/prototype. Không làm route điều hướng chính.

### `/classic`
Legacy/archive. Không để nó định nghĩa visual mới.

## Asset Pipeline

Xem thêm: `docs/hero-object-asset-pipeline.md`.

Bắt buộc tạo batch object-first:

- `hero-tree-front.png`
- `hero-tree-left-15.png`
- `hero-tree-right-15.png`
- `hero-tree-top-10.png`
- `hero-tree-roots-detail.png`
- `hero-tree-canopy-detail.png`

Nếu ChatGPT Web khó giữ consistency, dùng contact sheet 2x2 một lần để giữ cùng vật thể, sau đó crop từng view.
