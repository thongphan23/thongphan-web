# Audit trải nghiệm đọc bài viết thongphan.com

Ngày audit: 2026-05-21  
Repo: `/Users/rio/thongphan-com`  
Phạm vi: `/blog`, `/blog/[slug]`, generator blog, metadata Markdown và CSS article.

## Nguồn Brain2 đã dùng

- `brain2-vault-search`: query về `Thông Phan 2026 brand positioning Brain2 article reading experience Substack-like publication hub reader state sáng tỏ giữa hỗn loạn Conan personal brand content standards proof voice tui anh em`.
- `00-System/agent-context-index.md`
- `00-System/agent-operating-protocol-thong-phan.md`
- `00-System/codex-brain2-operating-protocol.md`
- `01-Atomic/Strategies/strategy-brand-positioning-thongphan-2026.md`
- `00-System/content-standards/codex-pastor-voice-parity-ebook-longform.md`
- `00-System/content-standards/codex-opendesign-long-form-5000-workflow.md`
- `00-System/content-standards/thongphan-post-core-engine.md`
- `01-Atomic/Libraries/library-proof-of-work-evidence-collection.md`
- `01-Atomic/Projects/project-personal-brand.md`

## Hiện trạng trải nghiệm đọc

- `/blog` đã có featured post, search, journey filters và context cho từng card.
- `/blog/[slug]` đã có progress bar, article header, cover image, mobile/desktop TOC, typography riêng, callout/pullquote/takeaway và author card.
- `scripts/generate-blog-data.mjs` đã precompile Markdown, lấy headings và hỗ trợ custom directives.
- `content/blog/*.md` đã có proof thật, CTA cuối bài và giọng `tui` ở nhiều đoạn.
- Asset thật có sẵn: `/public/thong-phan.jpg` và cover blog trong `/public/images/blog/`.

## Những gì đã đúng với Brain2 và publication-like hub

- Trục nội dung đang đi đúng hướng: sợ AI, Brain2, content kéo khách, tài sản số và Conan.
- Signature statement `AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp.` đã xuất hiện rõ.
- Proof layer có thật: 14 tháng flop, 40+ bài viral, 80k+ shares, 600+ đăng ký workshop, Brain2 đang chạy.
- UI đã tránh stock generic, dùng cover riêng và hệ màu/texture hiện tại của site.
- Article width, TOC và progress bar đã tạo nền reading room tốt hơn blog card thông thường.

## Những điểm còn yếu trước khi sửa

- Header bài viết chưa đủ editorial: author proof, reader-state, promise và journey chưa có cấu trúc metadata bền vững.
- Interaction còn thiếu: chưa có copy link, native share, Facebook share, bookmark local state, rail desktop hoặc mobile action bar.
- CTA rhythm còn mỏng: chủ yếu CTA cuối bài, chưa có CTA giữa bài auto-insert theo metadata.
- End-of-article còn generic: author card chưa dùng ảnh thật, chưa có proof stack, read-next theo journey và CTA hành trình rõ.
- Typography đọc dài ổn nhưng còn cảm giác module landing page ở cover/header; cần thêm deck/reading-room hierarchy, quote/callout/takeaway rõ hơn.
- `/blog` card đã có journey context nhưng chưa làm nổi reader-state `Nhẹ nhõm / Sáng tỏ / Kiểm soát` như một lời hứa đọc.
- Content voice còn vài điểm generic: heading `Kết luận`, một số câu dùng `bạn`, `mọi người`, `framework`, `Tại sao?`, `Điều quan trọng` hoặc CTA còn hơi instruction-like.
- SEO/metadata đã có OpenGraph article nhưng thiếu canonical URL, author object, tags/section và metadata reader journey.

## Checklist triển khai

- [x] Truy xuất Brain2 bằng `brain2-vault-search`.
- [x] Đọc trực tiếp các note Brain2 bắt buộc nếu khả dụng.
- [x] Xác minh repo bằng `package.json`, route structure và `git remote -v` (repo không có remote configured).
- [x] Kiểm tra repo không có `AGENTS.md` gần hơn.
- [x] Audit `/blog`.
- [x] Audit `/blog/[slug]`.
- [x] Thêm metadata article experience vào `content/blog/*.md`.
- [x] Cập nhật generator để auto-insert mid-article CTA từ metadata.
- [x] Nâng cấp article header: author, proof, journey, date, read time, reader-state, promise.
- [x] Thêm copy/share/bookmark, desktop rail và mobile action bar nhẹ.
- [x] Nâng cấp reading typography, callout, pullquote, takeaway và mobile spacing.
- [x] Nâng end-of-article: author card có proof, read-next theo journey, CTA theo hành trình.
- [x] Nâng `/blog`: reader-state trên card, journey summary/filter rõ hơn.
- [x] Rà content/voice các lỗi generic nổi bật mà không rewrite toàn bộ bài.
- [x] Cập nhật SEO metadata/OG/canonical theo pattern hiện có.
- [x] Chạy `npm run generate-blog`.
- [x] Chạy `npm run build`.
- [x] Chạy lint/test nếu script hợp lệ và ghi rõ blocker nếu không.
- [x] Chạy dev server và kiểm route `/blog`, tất cả `/blog/[slug]`, desktop/mobile.

## Route đã kiểm tra trong audit

- `/blog`
- `/blog/ai-khong-cuop-viec-ban`
- `/blog/xay-brain2-voi-obsidian`
- `/blog/40-bai-viral-tui-hoc-duoc-gi`
- `/blog/10-nam-lam-marketing-toi-hoc-duoc-gi`

## Living library audit bổ sung 2026-05-21

### Câu hỏi audit

Nếu biến blog/thư viện thành living library, route nào nên giữ vai gì?

Kết luận: giữ `/blog` là publication essays, thêm `/library` là public knowledge graph.

### Lý do không nâng `/blog` thành tất cả

`/blog` hiện đang làm tốt vai trò bài luận theo journey. Nếu nhồi concepts, templates, proof library và maps vào cùng một listing, người đọc mới sẽ khó phân biệt đâu là bài đọc sâu, đâu là note thao tác.

`/library` tách lớp tri thức sống ra thành các đơn vị nhỏ hơn:

- concept để định nghĩa.
- material để giữ nguyên liệu.
- pattern để nhận ra mẫu lặp.
- structure để hiểu logic.
- template để dùng lại.
- map để đọc theo hành trình.
- proof để chứng minh luận điểm.

### Audit `/blog`

`/blog` hiện có:

- metadata riêng.
- featured post.
- search theo title/description.
- filters theo journey/category.
- card có reader-state và journey context.
- 4 bài đang generated từ `content/blog/*.md`.

Rủi ro:

- Category constants còn hardcode trong React.
- `journey` đang là tiếng Việt, còn library schema dùng slug ổn định như `so-ai`, `brain2`, `tai-san-so`.
- Blog chưa có graph relation, chỉ có read-next dựa theo journey.

### Audit `/blog/[slug]`

`/blog/[slug]` hiện có:

- `generateStaticParams`.
- metadata article gồm canonical, author, OpenGraph, published/modified time.
- `BlogArticle` client component cho progress, TOC, copy/share/bookmark và CTA.
- CSS reading room đủ tốt cho bài dài.

Rủi ro:

- `BlogPostClient.tsx` là legacy client component chưa được route dùng.
- `BlogArticle.tsx` phụ thuộc HTML generated, không nên dùng trực tiếp cho library vì library cần typed local graph.
- CSS của blog có thể làm nền visual, nhưng library nên có module riêng để không vô tình phá article route.

### Audit generator

`scripts/generate-blog-data.mjs` đang:

- đọc `content/blog/*.md`.
- render Markdown bằng unified.
- hỗ trợ `callout`, `pullquote`, `takeaway`.
- inject mid CTA từ frontmatter.
- xuất `lib/blog-data.generated.ts`.

Kết luận triển khai:

- Không sửa generator blog nếu không cần.
- Tạo `scripts/generate-library-data.mjs` riêng để giữ blast radius nhỏ.
- Copy pattern render Markdown, nhưng thêm validation schema và graph relations cho library.

### Source format decision

Không thêm MDX trong vòng này. Repo đã có Markdown directive đủ dùng, và mục tiêu của library là bền vững như Brain2 public layer, không phải tạo component authoring phức tạp.

Markdown + frontmatter + directive là đủ cho seed version:

- source dễ đọc.
- generated TypeScript ổn với `output: export`.
- không thêm dependency.
- dễ mở rộng sang MDX sau nếu có nhu cầu component tương tác.

### Điều cần kiểm sau triển khai

- `/blog` vẫn trả 200 và các card còn render.
- Tất cả `/blog/[slug]` hiện có vẫn trả 200.
- `/library` có search/filter theo section, journey, reader state, status.
- Tất cả 14 `/library/[slug]` trả 200.
- Mobile không overflow ngang, mobile action không fixed đè nội dung.
- Build pass sau khi generator library chạy.

### Kết quả kiểm sau triển khai living library

- `/blog` vẫn giữ 4 bài generated và route trả 200.
- Tất cả `/blog/[slug]` trả 200 qua local dev server.
- `/library` đã có search/filter theo section, journey, reader state và status.
- Tất cả 14 `/library/[slug]` trả 200 qua local dev server.
- `npm run build` pass với `/library` static và `/library/[slug]` SSG.
- Playwright desktop/mobile không phát hiện horizontal overflow trên `/library`, `/library/sang-to-giua-hon-loan-ai`, `/blog` mobile và `/blog/10-nam-lam-marketing-toi-hoc-duoc-gi` mobile.

## Ghi chú triển khai

- Không xây comments/backend mới trong scope này; dùng feedback/DM CTA qua Messenger và Conan Trial.
- Không copy Substack máy móc. Lấy cảm giác publication: header có ngữ cảnh, thao tác đọc nhẹ, nhịp CTA, read-next và close có chủ đích.
- Conan là nơi thực hành tiếp, không thay thế personal brand Thông Phan trên blog.

## Kết quả sau triển khai

- Article header đã có ảnh thật Thông Phan, proof line, journey, ngày, read time, reader-state và promise sentence.
- Mỗi bài có `journey`, `readerState`, `promise`, `proof`, `midCta`, `endCta` trong frontmatter để bảo trì như publication system.
- Generator tự chèn `.blog-mid-cta` trước section sâu tiếp theo, tránh hardcode CTA giữa bài trong React.
- Interaction layer đã có copy link, native share fallback copy, Facebook share, Messenger feedback CTA, bookmark local state, desktop rail và mobile toolbar trong flow.
- End-of-article có author card proof thật, related/read-next theo journey và CTA theo bài.
- `/blog` dùng reader-state trên featured/card và filter theo journey metadata.
- Content scan đã giảm lỗi generic nổi bật: không còn `tôi`, `các bạn`, `mọi người`, `quý vị`, `Kết luận`, `framework`, `Tóm lại`, `Điều này cho thấy` trong `content/blog`.

## Verification 2026-05-21

- `npm run generate-blog`: pass, generated 4 posts.
- `npm run build`: pass. Routes generated: `/blog`, 4 slug pages, `/challenges/brain2-21-ngay`, `/about`, `/diagnostic`, `/chat`.
- `npm run lint`: blocked do script cũ `next lint` không hợp lệ với Next 16 trong repo, lỗi `Invalid project directory provided ... /lint`.
- Local dev server: `http://localhost:3001`.
- HTTP route checks: `/blog`, `/blog/ai-khong-cuop-viec-ban`, `/blog/xay-brain2-voi-obsidian`, `/blog/40-bai-viral-tui-hoc-duoc-gi`, `/blog/10-nam-lam-marketing-toi-hoc-duoc-gi` đều trả `200`.
- Playwright desktop/mobile:
  - `/blog` desktop không overflow ngang.
  - `/blog/10-nam-lam-marketing-toi-hoc-duoc-gi` desktop không overflow ngang, có mid CTA và publication close.
  - Mobile `390x844` không overflow ngang; mobile action toolbar nằm trong flow, không fixed đè nội dung.
  - Bookmark local state check: `tp:blog:bookmark:ai-khong-cuop-viec-ban = 1` sau khi click.
