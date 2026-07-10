# thongphan.com Unified Cinema System — Design Specification

**Status:** Visual Option 1 đã được chọn; full system spec chờ anh Thông duyệt trước khi lập implementation plan  
**Ngày:** 2026-07-10  
**Repo triển khai:** `/Users/rio/thongphan-com`  
**Visual target đã chọn:** [Film Archive Editorial](./assets/2026-07-10-unified-library-film-archive-selected.png)  
**Visual gốc của hệ:** [Evidence Cinema homepage](./assets/2026-07-10-evidence-cinema-selected.png)

## 1. Quyết định

thongphan.com sẽ trở thành một hệ sản phẩm duy nhất với cùng nhận diện:

- **Evidence Cinema** cho các bề mặt kể chuyện và tạo niềm tin;
- **Evidence Dossier** cho công cụ, chẩn đoán và sản phẩm thực hành;
- **Film Archive Editorial** cho thư viện, bài viết và trải nghiệm đọc dài.

Ba chế độ dùng chung một bộ màu, ngôn ngữ ảnh, typography, header, footer, chuyển động và asset policy. Chúng khác độ sáng và mật độ để phù hợp nhiệm vụ, không phải ba thương hiệu riêng.

`thongphan.com/library` là thư viện chính. `read.thongphan.com` chưa được anh Thông public nên không cần redirect hay duy trì một frontend riêng. Repo Read chỉ còn là nguồn tham khảo và pipeline nhập 13 bài đọc, ảnh, audio vào repo chính.

Read runtime hiện vẫn truy cập được về kỹ thuật. Trong thời gian preview nó phải nhận `X-Robots-Tag: noindex, nofollow` và meta `noindex`. Sau khi main library production pass, custom domain `read.thongphan.com` và Worker route cũ phải được gỡ. Không dùng 301 và không để hai bản nội dung cùng tồn tại sau release.

## 2. Vấn đề cần giải quyết

Audit production ngày 2026-07-10 xác nhận:

1. Homepage dùng Evidence Cinema nhưng mọi route khác quay về Knowledge Garden cũ.
2. Token toàn cục vẫn là cream, green, gold và electric blue.
3. Logo, `GardenSignature`, graph, radar, beacon và nhiều visual trọng tâm là CSS/div art.
4. Mobile navigation của trang con không đầy đủ.
5. `/diagnostic` và `/chat` có nested `<main>`.
6. ACT 03 cao khoảng 1.822px tại viewport `1440 × 900`; không thể xem trọn trong một màn hình.
7. Hero tại `1440 × 900` có CTA và microcopy va vào filmstrip do dùng `top` cố định.
8. Proof photos dùng tỉ lệ và crop chung, làm cắt mặt và giảm độ tin cậy.
9. Read hiện có trải nghiệm đọc tốt nhưng là Vite SPA, bundle toàn bộ nội dung và không phù hợp làm runtime thứ hai.

Đây là lỗi hệ thống. Không giải quyết bằng cách reskin từng trang độc lập.

## 3. Mục tiêu sản phẩm

Người dùng chuyển từ homepage sang bất kỳ route nào vẫn nhận ra cùng một thế giới thương hiệu, đồng thời mỗi bề mặt phục vụ đúng nhiệm vụ:

- homepage tạo nhận biết, bằng chứng và một bước tiếp theo;
- chẩn đoán giúp người dùng hiểu mình đang mắc ở đâu;
- thư viện giúp đọc sâu, nối ý và tìm nội dung đáng giá;
- bài viết và ghi chú giữ nhịp đọc dài thoải mái;
- tài sản, thử thách và chat giúp người dùng bắt đầu làm;
- Conan Maker là bước handoff khi người dùng sẵn sàng triển khai lâu dài.

## 4. Phạm vi

### Trong phạm vi

- bộ brand token chung;
- universal `SiteChrome`, navigation, mobile menu và footer;
- route-mode contract;
- homepage hero, hero filmstrip, physical stamp asset và ACT 03;
- `/library`, `/library/[slug]`;
- `/library/read`, `/library/read/[slug]`;
- đưa 13 bài từ Read vào main library;
- rights/source audit cho 13 bài và toàn bộ ảnh đi kèm;
- nâng plugin `/Users/rio/plugins/thong-phan-read` để xuất package/canonical về main repo, đồng bộ cache/config đang active và kiểm thử writeback contract;
- noindex rồi retire Read Worker/custom domain sau khi main production pass;
- hệ editorial dùng chung cho library/blog/article;
- nâng visual của `/about`, `/diagnostic`, `/assets`, `/challenges`, `/chat`;
- metadata, canonical, sitemap, robots và structured data cho content routes;
- responsive, accessibility, reduced motion, performance budgets và visual QA.

### Ngoài phạm vi

- public hoặc quảng bá `read.thongphan.com`;
- redirect từ Read subdomain;
- tài khoản người đọc, đồng bộ đa thiết bị hoặc backend bookmark mới;
- thay đổi logic kinh doanh, giá hoặc offer Conan Maker;
- tạo bằng chứng, ảnh sự kiện, testimonial hoặc số liệu không có nguồn;
- redesign `/conanmaker/` trong vòng này;
- cứu lại visual của `/classic`, `/concept` hoặc HTML prototype cũ.

## 5. Visual target

### 5.1 Film Archive Editorial

Selected mock là nguồn sự thật cho:

- tỷ lệ masthead đen và body giấy sáng;
- cách phối serif lớn với sans metadata;
- bố cục editorial bất đối xứng;
- featured reading + hai lane nội dung;
- film contact sheet ở cạnh dưới;
- warm paper, black ink và lacquer red;
- khoảng thở, rule lines và mật độ danh mục.

Mock không phải nguồn sự thật cho copy, ảnh, metric hoặc số lượng nội dung. Implementation dùng dữ liệu thật trong repo.

### 5.2 Những gì không được mang sang

- green/gold Knowledge Garden;
- electric blue;
- glass card, glowing orb, radar, graph hoặc bento dashboard;
- vòng tròn CSS dùng làm brand mark;
- pseudo-element giả seal, stamp, film frame hoặc illustration;
- card bo tròn cho mọi loại nội dung;
- fake luxury black-gold;
- generated person hoặc generated evidence.

## 6. Brand system

### 6.1 Semantic tokens

| Token | Giá trị | Vai trò |
|---|---:|---|
| `--brand-ink` | `#070706` | nền Cinema, masthead |
| `--brand-ink-raised` | `#12100F` | surface tối nâng nhẹ |
| `--brand-paper` | `#E8DFCF` | text sáng, paper artifact |
| `--brand-reading-paper` | `#F3EFE6` | nền đọc chính |
| `--brand-reading-paper-deep` | `#E8DECF` | band, sidebar, divider vùng |
| `--brand-text-on-paper` | `#171410` | text trên nền sáng |
| `--brand-muted-on-paper` | `#756D62` | metadata, caption |
| `--brand-lacquer` | `#B3231B` | CTA, active, stamp |
| `--brand-lacquer-bright` | `#E04B43` | accent nhỏ trên nền tối |
| `--brand-line-dark` | `rgba(232,223,207,.20)` | line trên ink |
| `--brand-line-paper` | `rgba(23,20,16,.16)` | line trên paper |

UI primary không dùng green, blue hoặc gold. Màu tự nhiên trong ảnh thật được phép giữ lại khi nó là một phần của bằng chứng.

### 6.2 Typography theo route mode

- **Cinema/Dossier:** Cormorant Garamond cho display; Be Vietnam Pro cho UI và body.
- **Editorial:** Newsreader cho display và body đọc; Be Vietnam Pro cho navigation, metadata và controls.
- Mỗi route chỉ render hai font family chính.
- Root layout chỉ preload Be Vietnam Pro. Cormorant và Newsreader được apply ở route/component scope với `preload: false`; font không dùng trên route không được request.
- Body đọc desktop: `18–20px`, line-height `1.75–1.9`, line length `58–68ch`.
- UI không nhỏ hơn `14px`; essential caption không nhỏ hơn `12px`.
- Không dùng chữ monospaced dài cho nội dung. Mono chỉ dành cho archive number ngắn.

### 6.3 Shape và material

- Surface chính dùng spacing, rule line và tint trước border/shadow.
- Border radius mặc định `0–8px`; chỉ control hoặc touch target mới dùng pill khi có lý do.
- Paper texture có opacity thấp, không làm giảm contrast.
- Film grain và perforation là raster asset; không phủ lên vùng đọc dài.
- Lacquer red luôn là tín hiệu có chủ đích, không dùng rải đều để trang “có màu”.

## 7. Asset policy

### 7.1 Bắt buộc dùng asset thật

Các visual có độ nổi bật cao phải là source asset hoặc raster asset được tạo/QA riêng:

- physical evidence stamp;
- signature;
- film frame, perforation và contact-sheet edge;
- hero plate;
- proof photos;
- route key visual;
- editorial thumbnails.

CSS chỉ đảm nhiệm layout, spacing, typography, states, focus, responsive và motion. `lucide-react` được phê duyệt là visual dependency mới duy nhất cho control icons; import theo từng icon để tree-shake. Không vẽ SVG thủ công.

### 7.2 Evidence integrity

- Ảnh dùng làm proof phải là người, sự kiện hoặc artifact thật.
- ImageGen được phép tạo texture, paper, film frame và decorative stamp.
- ImageGen không được tạo người, cộng đồng, sân khấu, testimonial hoặc kết quả giả.
- Outpaint ảnh thật chỉ được mở rộng background. Không thay đổi mặt, cơ thể, vật chứng hoặc ngữ cảnh chứng minh.
- Mỗi proof asset có manifest gồm source, caption, điều nó chứng minh và focal point.

Trước Slice 3 phải có `homepage-proof-assets.json` với tối thiểu:

- 6 ảnh hero reel đã xác minh source/quyền dùng, focal point và derivative `16:9`;
- 3 ảnh ACT 03 đã xác minh source/quyền dùng, focal point và derivative `3:2`;
- checksum, alt, caption và proof statement cho từng ảnh.

Nếu chưa đủ 6 ảnh hero, Slice 3 giữ contact sheet tĩnh và không ship running reel. Nếu chưa đủ 3 ảnh ACT 03, Slice 3 bị chặn ở preview, không hạ acceptance xuống hai ảnh và không tạo evidence giả để lấp chỗ trống.

### 7.3 Physical stamp v4

- output RGBA `1024 × 1024` hoặc lớn hơn;
- mực đỏ son, mép đứt, áp lực không đều, vòng hơi lệch;
- wording: `LÀM THẬT · TRẢ GIÁ THẬT · HỆ THỐNG THẬT`;
- safe area `12–15%`;
- không glow, không filter brightness/saturate trong CSS;
- QA chính tả ở kích thước render thật;
- nếu ImageGen làm sai chữ, compositing chữ được phép nhưng texture phải vẫn là raster cuối.

## 8. Route modes

Matcher dùng exact path trước prefix path, theo thứ tự dưới đây:

| Priority | Mode | Exact/prefix contract | Ghi chú |
|---:|---|---|---|
| 1 | `standalone` | `/conanmaker`, `/conanmaker/*` | static bundle trong `public`, bypass Next layout |
| 2 | `cinema-dark` | exact `/`, exact `/about` | storytelling, real imagery, proof |
| 3 | `evidence-dossier` | exact `/diagnostic`, `/assets`, `/assets/*`, `/challenges`, `/challenges/*`, exact `/chat` | tool/product surface, paper + ink + lacquer |
| 4 | `editorial-light` | `/library`, `/library/*`, `/blog`, `/blog/*` | long reading, archive catalog |
| 5 | `legacy` | exact `/classic`, exact `/concept`, static `/co-che-tep-moi.html` | noindex, khỏi navigation, không redesign |
| 6 | `default` | mọi pathname còn lại, gồm not-found | dùng functional shell tối giản, không tự nhận một mode mới |

Route mode nằm trong một map khai báo rõ và có contract test cho từng pathname. `/conanmaker/*` và static HTML không tham gia universal Next chrome.

## 9. Universal SiteChrome

### 9.1 Header

Một header dùng cho mọi Next route trong scope, thay đổi theme bằng route mode. `/conanmaker/*` được miễn vì là bundle standalone ngoài App Router.

Primary navigation:

1. `Câu chuyện` → `/about`
2. `Thư viện` → `/library`
3. `Chẩn đoán` → `/diagnostic`
4. `Tài sản` → `/assets`
5. `Conan Maker` → `/conanmaker/`

Homepage có thêm `HomepageChapterNav` riêng cho các act nhưng không thay brand shell.

### 9.2 Mobile

- menu dialog có focus trap;
- Escape đóng menu;
- trả focus về trigger;
- body scroll lock;
- đủ primary navigation, không ẩn toàn bộ link và chỉ để lại CTA;
- minimum touch target `44 × 44px`.

### 9.3 Footer

Footer giữ một voice và một hệ link. Editorial mode dùng nền ink để đóng trang; Cinema mode dùng cùng ink nhưng nhẹ hơn homepage hero.

## 10. Homepage refinement

### 10.1 Hero layout

- Hero copy được neo bằng `bottom: calc(var(--hero-film-height) + 24px–32px)`, không dùng `top` cố định cho mọi chiều cao.
- CTA, lead và microcopy phải nằm hoàn toàn trên filmstrip ở `1440 × 900`, `1280 × 800` và `1280 × 720`.
- Hero portrait giữ identity và skin texture; không dùng filter làm mặt bệt.
- Physical stamp v4 thay stamp hiện tại.

### 10.2 Hero running filmstrip

- 6–9 ảnh thật;
- derivative desktop `1200 × 675` hoặc `720 × 405`, aspect ratio `16:9`;
- track duplicate để loop `30–45s`;
- duplicate set `aria-hidden="true"`;
- pause khi hover hoặc focus;
- touch device và reduced motion không autoplay;
- ảnh lazy-load ngoài first visible set;
- mỗi frame khoảng `70–120KB`.

Running reel chỉ được production-promote khi đủ tối thiểu 6 ảnh vượt source/crop QA. Trước gate đó homepage giữ contact sheet tĩnh hiện có.

### 10.3 Face-safe crop

- face nằm trong 70% vùng giữa theo chiều ngang;
- vùng mặt nằm khoảng 12–62% chiều cao;
- caption không đè cằm;
- `ProofImage` nhận `focalPoint` hoặc `objectPosition` theo asset manifest;
- ảnh dọc/vuông không bị ép `object-fit: cover` vào frame ngang nếu chưa có derivative phù hợp.

## 11. ACT 03 — Projection Contact Sheet

ACT 03 không tiếp tục là card `78vw` cuộn ngang.

### Desktop `1440 × 900`

- tổng section `820–880px`;
- header không quá `170px`;
- gap header/rail `24–32px`;
- rail/card không quá `470px` chiều cao;
- thấy đủ 3 proof frame trong một hàng;
- card khoảng `390–410px`;
- ảnh `3:2`;
- body `150–170px`.

### Desktop `1280 × 800`

- tổng section `760–820px`;
- vẫn thấy trọn 3 proof frame;
- title không chiếm quá 3 dòng.

### Tablet/mobile

- tablet thấy 2 frame và một phần frame tiếp theo;
- mobile thấy 1 frame và `10–15%` frame tiếp theo;
- swipe thủ công, có nút trước/sau;
- không autoplay khi người dùng đang đọc evidence;
- click/tap mở detail dialog/drawer chứa source, caption, điều nó chứng minh và link liên quan.

Dialog/drawer phải có focus management, Escape, close button và reduced-motion-safe transition.

## 12. Unified Library

### 12.1 Information architecture

`/library` là hub duy nhất với ba lane:

1. **Tuyển đọc thế giới** — 13 bài nhập từ Read.
2. **Bài của Thông** — 4 bài hiện có, giữ canonical `/blog/[slug]` trong vòng này.
3. **Ghi chú sống** — 14 note hiện có tại `/library/[slug]`.

Hub dùng selected Film Archive Editorial mock. Không render 27–31 equal cards trong first viewport.

### 12.2 Route contract

- `/library` — unified hub;
- `/library/read` — explore 13 curated readings;
- `/library/read/[slug]` — long-form reader;
- `/library/[slug]` — living note;
- `/blog` và `/blog/[slug]` — giữ route/canonical nhưng dùng shared editorial shell;
- unknown reading/note slug trả `404` bằng `notFound()`.

Không thêm redirect cho `read.thongphan.com`.

### 12.3 Selected library first viewport

- black masthead;
- warm archival paper;
- headline: `Một thư viện để đọc sâu, nghĩ rõ và làm ra thứ có giá trị.`;
- one concise support paragraph;
- primary CTA: `Bắt đầu đọc` → `/library/read/steve-jobs-2005-stanford-commencement-address`;
- featured reading cố định cho release đầu: `Hãy tìm điều bạn yêu`;
- hai primary collection lanes trong first viewport: `Tuyển đọc thế giới` và `Ghi chú sống của Thông`;
- `Bài của Thông` xuất hiện thành lane thứ ba ngay sau first viewport và có link từ library navigation;
- thin film contact sheet ở đáy viewport;
- no graph hero, no circle nodes, no fake stats.

### 12.4 Discovery

- search theo title, author, source, topic và promise;
- đúng 4 filter group: `Loại nội dung`, `Chủ đề`, `Thời lượng`, `Mục tiêu đọc`;
- `Loại nội dung`: `Tuyển đọc`, `Bài của Thông`, `Ghi chú sống`;
- `Thời lượng`: `Dưới 10 phút`, `10–20 phút`, `Trên 20 phút`;
- `Mục tiêu đọc` dùng enum adapter chung: `Sáng tỏ`, `Rèn gu`, `Làm ra tài sản`;
- `Chủ đề` lấy deterministic từ normalized topic list trong generated catalog;
- internal labels như `Catalog`, `Status`, `Growing`, `Section` không xuất hiện trên public UI;
- collection và reading path dùng ngôn ngữ tự nhiên;
- filters là row/chip nhỏ, không biến trang thành dashboard;
- mọi query/filter khác default phản ánh qua `q`, `type`, `topic`, `duration`, `intent`; clear filters xóa các params này.

### 12.5 Reader

Giữ những phần tốt từ Read:

- side TOC desktop;
- progress;
- elapsed reading time;
- Focus mode;
- audio khi asset `ready`;
- source pill;
- author/context disclosure;
- completion reward;
- related readings sau completion.

Body render tĩnh. Chỉ toolbar, audio, bookmark, completion và filter là client islands.

Bookmark là local-only feature mới với key `tp:library:saved:v1` lưu danh sách slug. Completion dùng key `tp:library:completed:v1`. Không hứa đồng bộ đa thiết bị và không migrate localStorage từ Read subdomain.

## 13. Read content ingestion

### 13.1 Runtime decision

Không nhúng hoặc proxy Vite app. Không copy `App.tsx` 1.205 dòng hoặc `sheetArticles.ts` 13.923 dòng vào client bundle.

Main site dùng static export. Reading data được validate/generate/import tại build time; không có server data fetch lúc runtime. `/library/read/[slug]` phải có `generateStaticParams`, `dynamicParams = false` và production test xác nhận unknown slug trả real `404` trên Cloudflare.

### 13.2 Source and output

```text
content/readings/<slug>/article.json
public/images/readings/<slug>/*
public/audio/readings/<slug>/*
scripts/generate-readings-data.mjs
lib/readings.ts
lib/readings-data.generated.ts
```

Google Sheet và plugin Thông Phan Read vẫn là nguồn vận hành. Plugin tạo package cho repo main, validator kiểm tra, main build/deploy, sau đó pipeline ghi canonical main URL về Sheet khi quyền write khả dụng.

Plugin deliverable nằm trong scope:

- sửa URL contract hardcode cũ từ `read.thongphan.com/doc/...` sang `thongphan.com/library/read/...`;
- cập nhật skill, helper script, validator, README/AGENTS liên quan;
- validate source plugin rồi sync marketplace/cache version đang active;
- verify bằng fresh invocation rằng publish package đi vào main repo và backlink target dùng canonical mới;
- không tiếp tục deploy Read Vite runtime sau main release.

Ảnh từ Read phải được localize vào `public/images/readings/<slug>/`; cấm hotlink. Mỗi file có deterministic filename, checksum, alt, caption, credit, source URL và quyền dùng. Audio áp dụng cùng quy tắc dưới `public/audio/readings/<slug>/`.

### 13.3 Reading schema additions

Mỗi article package cần:

- `slug`, `title`, `description`;
- `author`, `source`, `sourceUrl`;
- `sourcePublishedAt`;
- `translator`, `editor`;
- `translatedAt`, `lastReviewedAt`;
- `rightsStatus`;
- `minutes`, `topics`, `readingPath`;
- `sections`, structured blocks;
- image alt, caption, credit và license/source trace;
- audio metadata;
- content checksum/version.

### 13.4 Content gates

- unknown slug không fallback sang bài đầu tiên;
- no internal translation status on public UI;
- mỗi article có canonical riêng;
- body, ảnh, caption và audio checksum khớp package;
- `rightsStatus` là một trong `public-domain`, `permission-confirmed`, `licensed`, `source-link-only`, `blocked`;
- chỉ `public-domain`, `permission-confirmed` hoặc `licensed` được public full translated body;
- `source-link-only` chỉ xuất catalog metadata, editorial note và link nguồn; không render full translation;
- `blocked` không xuất hiện trong public catalog;
- không public ảnh thiếu source/credit cần thiết.

Slice 0 tạo rights report cho đủ 13 package và toàn bộ media. Migration complete nghĩa là đủ 13 package được version hóa/validate; public article count bằng số package vượt rights gate. Target vẫn là 13 full readings, nhưng acceptance không được ép public nội dung chưa có quyền.

## 14. Shared Editorial System

Tạo một lớp component dùng chung thay vì tiếp tục duy trì nhiều CSS article lớn:

- `EditorialMasthead`;
- `EditorialHero`;
- `ArticleHeader`;
- `ArticleMeta`;
- `ReadingToolbar`;
- `ArticleTOC`;
- `ArticleBody`;
- `EditorialFigure`;
- `EditorialCallout`;
- `SourceDisclosure`;
- `ReadNext`;
- `CompletionReward`.

Library note vẫn có local graph nhưng render như typed relation list, không phải decorative full graph.

## 15. Route-specific redesign

### `/about`

- Cinema-dark origin story;
- ảnh thật lớn, không rotated 3D stage console;
- timeline dạng editorial film chronology;
- proof source rõ;
- physical stamp và contact sheet có tiết chế.

### `/diagnostic`

- giữ nguyên câu hỏi, deterministic logic và result;
- Evidence Dossier thay scan/radar/halo;
- progress như archive folio;
- không nested `<main>`;
- one primary CTA sau result.

### `/assets`

- giữ catalog và product logic;
- physical product dossier thay green-gold cards;
- giá, nội dung bao gồm và CTA rõ;
- không fake 3D orbit hoặc card glow.

### `/challenges`

- giữ activation/product flow;
- 21 ngày thành editorial calendar/film slate có asset thật;
- bỏ electric-blue heading và CSS day deck.

### `/chat`

- giữ conversation functionality;
- Evidence Desk thay blue-grid system panel;
- prompt suggestions là text rows;
- không nested `<main>`;
- empty/loading/error states cùng brand system.

### `/blog/*`

- dùng shared editorial shell;
- giữ canonical và existing Markdown pipeline;
- giảm landing-page hero trong article;
- giữ author, proof, TOC, progress, share/bookmark và read-next.

## 16. Motion system

Chỉ dùng ba motion motif:

1. **Projector start:** opacity + nhẹ vertical settle cho hero/key visual.
2. **Film transport:** continuous horizontal reel ở hero, chỉ khi được phép autoplay.
3. **Focus pull:** ảnh từ soft về sharp rất nhẹ khi active/hover.

Không stagger mọi card. Không animate essential text từ trạng thái không đọc được. Reduced motion tắt reel và chuyển mọi reveal về trạng thái cuối ngay lập tức.

## 17. Accessibility

- một semantic `h1` mỗi route;
- không nested landmark;
- keyboard access cho menu, rail, dialog, filters, toolbar và reader controls;
- visible focus dùng paper/lacquer tương phản;
- auto reel có pause và bị tắt với reduced motion/touch;
- duplicate reel content `aria-hidden`;
- alt text mô tả bằng chứng, không lặp caption;
- decorative asset dùng empty alt hoặc `aria-hidden`;
- form có label, instructions, error và live result đúng;
- reading order DOM không phụ thuộc bố cục visual;
- zoom `200%` và mobile reflow không mất hành động chính.

## 18. Performance budgets

- hero LCP plate: `≤180KB` desktop, `≤180KB` mobile;
- stamp/signature/decorative asset: `≤80KB` mỗi asset khi khả thi;
- hero reel frame: `70–120KB`;
- ACT 03 frame: `≤160KB`;
- homepage-only interaction JS: `≤35KB gzip`;
- `/library` route-specific JS: `≤45KB gzip`;
- `/library/read/[slug]` route-specific JS gồm audio/focus/completion: `≤55KB gzip`;
- library CSS loaded ở hub: `≤35KB gzip`; reader CSS: `≤40KB gzip`;
- first-view font requests: tối đa 4 WOFF2, tổng transferred `≤220KB`;
- reader route không tải body của article khác;
- generated content không nằm trong một client bundle chung;
- no hero video/WebGL;
- lazy-load ảnh ngoài first viewport và non-active reel frames.

## 19. SEO and metadata

- `metadataBase` tiếp tục ở `https://thongphan.com`;
- canonical riêng cho mọi article/note/blog;
- `Article` JSON-LD cho long reading/blog;
- `CollectionPage`/`ItemList` phù hợp cho `/library` và `/library/read`;
- `app/sitemap.ts` gồm content routes public;
- `app/robots.ts` khai báo sitemap và loại legacy/noindex surfaces;
- unknown slug trả real `404`;
- Open Graph image dùng asset thật và title từng bài;
- không nhắc hoặc canonical về Read subdomain.

## 20. Code architecture

Minimum coherent structure:

```text
styles/brand-tokens.css
lib/site-route-mode.ts
components/site-chrome/*
components/editorial/*
components/library/*
components/home-cinema/*
content/readings/*
scripts/generate-readings-data.mjs
lib/readings.ts
app/library/read/page.tsx
app/library/read/[slug]/page.tsx
```

Page modules giữ layout đặc thù. Semantic color, typography, line, focus và motion lấy từ shared tokens. Không tạo một universal card component cho mọi loại nội dung.

## 21. Delivery sequence

### Slice 0 — Release safety

- inventory route, asset, public untracked Conan files và current deploy path;
- rights/source/media audit đủ 13 reading packages;
- đặt Read runtime `noindex, nofollow` trong thời gian migration;
- tạo contract test trước khi thay shared shell;
- giữ rollback checkpoint.

### Slice 1 — Foundation

- brand tokens;
- route mode map;
- universal SiteChrome;
- mobile menu;
- shared focus/motion primitives;
- noindex legacy routes.

### Slice 2 — Unified Library

- selected Film Archive Editorial hub;
- migrate 13 readings;
- `/library/read/*`;
- shared editorial reader;
- metadata/sitemap/robots;
- content validation and 404 behavior.

### Slice 3 — Homepage refinement

- hero bottom anchoring;
- physical stamp v4;
- face-safe image derivatives;
- running hero reel;
- ACT 03 projection contact sheet;
- detail dialog/drawer.

### Slice 4 — Direct-entry pages

- `/about`;
- `/diagnostic`;
- `/blog/*` shared editorial shell.

### Slice 5 — Utility/product pages

- `/assets/*`;
- `/challenges/*`;
- `/chat`;
- final route consistency audit.

Mỗi slice build, test, Browser QA và có preview deployment/checkpoint độc lập. Production promotion chỉ xảy ra khi một route batch đã hoàn chỉnh và coherent.

Route-mode activation dùng feature map: route chưa migrate tiếp tục nhận shell cũ, route đã migrate nhận shell mới. Shared token không được global-switch trước khi route consumer tương ứng pass. Khi tất cả Next routes trong scope pass, feature map trở thành default mới và legacy shell bị xóa.

Sau main production pass, gỡ Read custom domain/Worker route và xác minh subdomain không còn serve content. Không dùng redirect.

## 22. Acceptance criteria

### Visual consistency

- mọi Next route public trong scope dùng đúng route mode; `/conanmaker/*` được miễn vì là standalone bundle;
- không còn GardenSignature hoặc CSS-art brand visual trên route đã migrate;
- không còn primary green/gold/electric-blue UI trên route đã migrate;
- universal header/footer và mobile menu nhất quán;
- library implementation bám selected mock qua side-by-side visual QA.

### Homepage

- CTA/microcopy không va filmstrip ở các target viewport;
- ACT 03 xem được trọn 3 proof frame trong desktop viewport;
- tại `1280 × 800`, ACT 03 dùng content width khoảng `1160px`, grid 3 cột bằng nhau, gap `20px`, mỗi card khoảng `373px`;
- không crop mặt sai;
- reel pause/keyboard/reduced-motion hoạt động;
- stamp đọc như physical ink asset, không như vector badge.

### Library

- đủ 13 reading packages được version hóa và validate; mọi package vượt rights gate render tĩnh dưới `/library/read/[slug]`;
- rights report nêu rõ public/full, source-link-only và blocked count; không public full body khi chưa clear;
- 14 living notes không regression;
- 4 blog essays xuất hiện trong discovery lane mà không đổi canonical;
- no soft 404;
- unknown reading slug trả real Cloudflare `404`, không fallback;
- mỗi article có metadata/canonical/source;
- search/filter và core reader controls hoạt động;
- không tải toàn bộ 13 body trong một client bundle.

### Accessibility and responsive

- `390 × 844`, `834 × 1194`, `1280 × 800`, `1440 × 900`, `1490 × 1060` không horizontal overflow;
- keyboard journeys pass;
- keyboard journey gồm: mở menu → Tab trap → Escape → restore focus; search → chọn từng filter → URL params update → clear; reader TOC → audio play/pause → Focus mode → bookmark → completion;
- menu/dialog focus restore pass;
- reduced motion pass nghĩa là hero reel không autoplay, reveal render ngay trạng thái cuối và không transition dài hơn `1ms`;
- no nested main/duplicate h1.

### Verification

- unit/content/contract tests pass;
- TypeScript pass;
- production build/static route integrity pass;
- console warnings/errors relevant bằng 0;
- broken images bằng 0;
- visual comparison có source + implementation cùng viewport/state;
- JSON-LD parse được và vượt schema contract cho `Article`, `CollectionPage`/`ItemList`;
- bundle budget JS/CSS/font được đo từ production build;
- Read runtime preview trả `noindex, nofollow`; sau release custom domain/Worker route không còn serve content;
- production smoke pass trước khi báo hoàn tất.

## 23. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Scope quá rộng | triển khai theo slice độc lập |
| Shared token phá trang cũ | route-mode migration, contract test và visual checkpoint |
| Ảnh thật không đủ tỉ lệ | asset gate, derivative riêng, xin ảnh gốc thay vì fake evidence |
| ImageGen làm sai stamp text | compositing + spelling QA |
| Read data làm bundle phình | build-time generated data + static generation + client islands |
| Quyền tái bản bản dịch chưa rõ | bắt buộc `rightsStatus` trước publish |
| Audio/ảnh mất đường dẫn | checksum, asset validator, build contract |
| Local completion từ Read không chuyển | không migrate vì Read chưa public |
| User quay lại gặp cache cũ | fingerprinted assets, không đổi bytes dưới immutable URL |

## 24. Design review gate

Implementation chỉ bắt đầu sau khi anh Thông duyệt spec này. Bước tiếp theo sau approval là viết implementation plan chi tiết theo 6 slice, rồi triển khai từng slice với TDD, Browser QA và release checkpoint.
