# thongphan.com Living Library Architecture

Ngày: 2026-05-21  
Repo: `/Users/rio/thongphan-com`  
Phạm vi: `/library`, `/library/[slug]`, `content/library/*.md`, generator library, dữ liệu typed links và UI đọc note.

## Nguồn đã dùng

### Brain2

- `brain2-vault-search`: query về living library, Brain2, Thông Phan 2026, proof, tài sản số, Conan và signature state.
- `brain2-vault-search.vault_context`: context về `Knowledge Alchemist`, proof library, Brain2 knowledge workflows và AI expertise positioning.
- `00-System/agent-context-index.md`
- `00-System/agent-operating-protocol-thong-phan.md`
- `00-System/codex-brain2-operating-protocol.md`
- `00-System/brain2-architecture-documentation.md`
- `01-Atomic/Resources/brain2-architecture-overview.md`
- `01-Atomic/Strategies/strategy-brand-positioning-thongphan-2026.md`
- `00-System/content-standards/codex-pastor-voice-parity-ebook-longform.md`
- `00-System/content-standards/codex-opendesign-long-form-5000-workflow.md`
- `00-System/content-standards/thongphan-post-core-engine.md`
- `01-Atomic/Libraries/library-proof-of-work-evidence-collection.md`
- `01-Atomic/Projects/project-personal-brand.md`

### Skill local

- `/Users/rio/.codex/skills/ebook/SKILL.md`
- `/Users/rio/.codex/skills/long-form-5000/SKILL.md`

### Suy luận triển khai

- Repo hiện dùng Markdown + frontmatter + generator precompile sang TypeScript.
- Repo đã có `remark-directive`, `gray-matter`, App Router và CSS Modules.
- Vì vậy route thư viện dùng Markdown làm source of truth, không thêm MDX dependency.

## Hiện trạng blog/thư viện

`/blog` hiện là publication hub cho bài essay theo journey. Nó đã có featured post, search, filter theo hành trình, reader state, proof, CTA giữa bài và CTA cuối bài.

`/blog/[slug]` hiện là reading room cho bài dài. Nó đã có header editorial, author line, proof line, TOC, progress bar, desktop reading rail, mobile action bar, typography, callout, pullquote, takeaway và publication close.

Điểm mạnh là blog đã có lớp đọc tốt. Điểm còn thiếu là chưa có mô hình tri thức sống. Bài blog vẫn là bài rời rạc, related post chỉ là gợi ý tuyến tính, chưa có typed relations như `supports`, `examples`, `usedIn`, `next`, `prerequisite`.

## Vì sao cần living library thay vì blog thường

Brain2 không vận hành như một blog. Nó vận hành như hệ thống sống gồm atomic notes, MOC, link dày, status lifecycle, proof và tái sử dụng. Nếu thongphan.com chỉ có blog theo thời gian, người đọc phải tự ghép các mảnh `AI`, `Brain2`, `content`, `tài sản số`, `Conan`.

Living library giải quyết 4 việc:

1. Cho người đọc thấy một bản đồ, không chỉ một danh sách bài.
2. Biến proof, story, pattern, template thành tài sản đọc lại được.
3. Giữ đúng định vị Thông Phan 2026: sáng tỏ giữa hỗn loạn, không phải guru công cụ AI.
4. Tạo cầu nối tự nhiên từ personal brand sang Conan, nhưng không để Conan lấn át.

## Kiến trúc nội dung đề xuất

Giữ `/blog` là publication/editorial essays. Tạo `/library` là public knowledge graph.

Tradeoff:

- Ưu điểm: không phá route cũ, không trộn bài essay với note sống, dễ SEO riêng cho library.
- Nhược điểm: có thêm generator và data model mới cần bảo trì.

Các section:

- `concepts`: khái niệm gốc, định nghĩa, mental model.
- `materials`: nguyên liệu như story, observation, raw insight, proof nguồn.
- `patterns`: mẫu vận hành lặp lại.
- `structures`: cấu trúc, framework, logic bên dưới hệ thống.
- `templates`: mẫu có thể dùng lại.
- `maps`: MOC và reading path.
- `proof`: proof/case có provenance.

## Source format

Source of truth là `content/library/*.md`.

HTML/React/CSS chỉ là lớp render.

Không dùng HTML rời rạc làm source of truth. Không thêm MDX trong vòng này vì repo đã có pipeline Markdown đủ tốt. Thay vào đó, generator library dùng:

- `gray-matter` để đọc frontmatter.
- `remark-parse`, `remark-gfm`, `remark-directive`, `remark-rehype`, `rehype-slug`, `rehype-autolink-headings`, `rehype-stringify` để render Markdown.
- Custom directives cho callout, proof block, template block, takeaway.

## Data schema/frontmatter

Frontmatter tối thiểu:

```yaml
---
title:
description:
section: concepts | materials | patterns | structures | templates | maps | proof
type: concept | material | pattern | structure | template | map | proof | field-guide
journey: so-ai | dung-ai-dung-cach | brain2 | content-keo-khach | tai-san-so | conan
readerState: nhe-nhom | sang-to | kiem-soat
status: seed | growing | permanent | evergreen
author: "Thông Phan"
publishedAt:
updatedAt:
readTime:
promise:
proof:
sourceTrace:
related:
  supports:
  examples:
  usedIn:
  next:
tags:
---
```

Generator validate:

- required fields có đủ.
- `section`, `type`, `journey`, `readerState`, `status` nằm trong enum.
- mỗi note có ít nhất 3 typed related links.
- related link không trỏ tới chính nó.
- link target tồn tại trong collection.

## Route architecture

- `/library`: index, search/filter theo section, journey, reader state và status.
- `/library/[slug]`: note detail, header editorial, proof line, local graph, content body, related notes theo typed links, CTA theo journey và update/status.
- `/blog`: giữ nguyên, là publication essays.
- `/blog/[slug]`: giữ nguyên, chỉ kiểm không bị phá sau khi thêm library.

## Graph/cross-link model

Không render full graph. Full graph dễ rối và biến thành đồ trang trí.

UI dùng local graph quanh note đang đọc:

- typed links từ frontmatter của note hiện tại.
- backlinks đơn giản từ các note khác nếu chúng trỏ về note hiện tại.
- label quan hệ bằng tiếng Việt, ví dụ `Nâng đỡ`, `Ví dụ`, `Dùng trong`, `Đọc tiếp`, `Cần trước`.

Typed relation được hỗ trợ trong schema:

- `supports`
- `examples`
- `usedIn`
- `next`
- `contrasts`
- `prerequisite`

## UI principles

Index:

- Mở bằng intro ngắn: thư viện sống, không phải blog công cụ AI.
- Hiển thị 7 section bằng filters.
- Search theo title, description, promise, tags.
- Có filter journey, reader state, status.
- Có `Bản đồ nên bắt đầu` lấy từ section `maps`.
- Có `Note mới cập nhật` sort theo `updatedAt`.

Detail:

- Header như note cao cấp, không như landing page.
- Author Thông Phan + proof ngắn.
- Reader state rõ.
- Local graph/related notes ngay sau header hoặc bên rail.
- Reading room width hẹp, line-height thoáng, heading rhythm.
- Callout, proof, template, takeaway render đẹp.
- End note có author close, related links theo typed relations, CTA theo journey và timestamp/status.

## Checklist triển khai

- [x] Brain2-first retrieval.
- [x] Đọc note Brain2 bắt buộc.
- [x] Đọc skill `/ebook` và `/long-form-5000`.
- [x] Audit route `/blog`.
- [x] Audit route `/blog/[slug]`.
- [x] Xác minh repo bằng `git remote -v`, `package.json`, route structure và metadata.
- [x] Viết test fail cho generator library.
- [x] Tạo `content/library/*.md` với 14 note mẫu.
- [x] Tạo `scripts/generate-library-data.mjs`.
- [x] Tạo `lib/library.ts` và `lib/library-data.generated.ts`.
- [x] Tạo `/library`.
- [x] Tạo `/library/[slug]`.
- [x] Cập nhật nav/footer nếu phù hợp.
- [x] Chạy `npm run generate-blog`.
- [x] Chạy `npm run generate-library`.
- [x] Chạy `npm test` nếu script được thêm.
- [x] Chạy `npm run build`.
- [x] Chạy `npm run lint` và ghi rõ nếu Next 16 chặn `next lint`.
- [x] Kiểm route bằng local server.
- [x] Kiểm desktop/mobile không overflow.

## Rủi ro còn lại

- Search/filter hiện là client-side trên generated data, chưa có search backend thật.
- Proof snapshot thật như screenshot Brain2, bài viral, comment workshop chưa được gắn asset trong vòng này.
- Note mẫu minh họa hệ thống, chưa thay thế Brain2 private vault làm nguồn thật.
- Voice scanner đầy đủ của `/ebook` và `/long-form-5000` không chạy trên từng note vì đây là library seed content, không phải long-form 5.000 từ.
- Nếu sau này cần đồng bộ Brain2 public/private thật, cần product decision rõ về note nào được publish, note nào chỉ làm private source.

## Verification 2026-05-21

- `npm run generate-blog`: pass, generated 4 blog posts.
- `npm run generate-library`: pass, generated 14 library notes.
- `npm test`: pass, 2 generator validation tests.
- `npm run build`: pass. Static routes include `/library` and `/library/[slug]` with 14 generated note pages.
- `npm run lint`: blocked by existing Next 16 script issue, `next lint` reports `Invalid project directory provided ... /lint`.
- Local dev server: `http://127.0.0.1:3001`.
- HTTP route checks: `/blog`, all 4 `/blog/[slug]`, `/library`, all 14 `/library/[slug]` returned `200`.
- Playwright 1.58.0 screenshots/checks:
  - `/library` desktop `1440x1100`: no horizontal overflow.
  - `/library` mobile `390x844`: no horizontal overflow.
  - `/library/sang-to-giua-hon-loan-ai` desktop/mobile: local graph present, no horizontal overflow.
  - `/blog` mobile and `/blog/10-nam-lam-marketing-toi-hoc-duoc-gi` mobile: no horizontal overflow.
  - Library pages have no fixed mobile action bar, so no intrusive sticky CTA. Blog detail keeps only existing fixed progress bar.
