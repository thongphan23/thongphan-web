# VID Video-First Intelligence & Watching Path — Design Specification

**Ngày:** 2026-08-12  
**Trạng thái:** Approved in conversation; pending written-spec review  
**Phạm vi:** `vid.thongphan.com`  
**Runtime hiện tại:** Next.js static export + Cloudflare Worker/D1 + Bunny Stream

## 1. Quyết định sản phẩm

VID tiếp tục là thư viện video do Thông Phan giám tuyển. Mục tiêu gần nhất không
phải cá nhân hóa người xem mà là:

1. có video hoàn chỉnh thì đưa lên được nhanh;
2. phát video ổn định và mượt trên thiết bị thực;
3. sắp xếp khoa học theo nhu cầu, chủ đề, series và watching path;
4. cho phép khám phá liên tục bằng feed tải thêm khi cuộn;
5. xây nền dữ liệu đủ sâu để sau này mới phát triển đề xuất thông minh khi có
   đủ người dùng và evidence thật.

Video Intelligence không được trở thành publish blocker. Một video M0 hợp lệ có
thể public trước; transcript và enrichment chạy bổ sung sau.

## 2. Trạng thái lưu trữ và phát video

Kiến trúc production hiện tại được giữ nguyên:

- Bunny Stream sở hữu file video, transcoding, adaptive playback, thumbnail,
  preview và caption derivatives;
- Cloudflare D1 sở hữu catalog, metadata, trạng thái media/publish, taxonomy,
  relationship và watching path;
- Cloudflare Worker sở hữu public/admin API, signed webhook, upload authorization
  và routing;
- trình duyệt chỉ giữ tiến độ xem, xem sau và path đang theo trong local storage;
- MP4 nguồn đi thẳng từ máy local lên Bunny bằng TUS resumable upload, không đi
  qua browser bundle, Git hoặc R2 của website.

Video production đang public dùng Bunny GUID
`f6c61cfc-4135-4b1c-a99e-130cba6b3196`. GUID cũ vẫn được giữ làm rollback và
không được xóa tự động.

## 3. Phạm vi phát hành

### 3.1. Có trong release này

- upload video hoàn chỉnh lên Bunny qua Codex CLI;
- publish nhanh với metadata tối thiểu;
- kiểm tra media ready và production playback trước publish;
- catalog phân tầng M0–M3;
- taxonomy theo nhu cầu, chủ đề, series, format và độ khó;
- feed cursor-based tải thêm liên tục;
- watching path do Thông/Codex giám tuyển;
- transcript ingestion và AI-assisted enrichment không chặn publish;
- hồ sơ ý nghĩa có version, confidence, evidence và human review;
- typed relationship giữa video;
- search/discovery dựa trên metadata đã duyệt;
- trang chủ video-first mới;
- sửa dứt điểm lỗi cắt dấu/chữ ở featured video;
- local-only progress và watch-later tương thích dữ liệu hiện tại.

### 3.2. Chưa có trong release này

- tài khoản người xem;
- server-side viewing profile;
- thu thập dữ liệu cá nhân để cá nhân hóa;
- recommendation engine tự động;
- auto-publish output của AI;
- dashboard quản trị lớn;
- graph database riêng;
- dịch, lồng tiếng hoặc chỉnh sửa video bên trong VID.

## 4. Mức hoàn thiện của video

### M0 — Publishable media

Bắt buộc:

- `title`;
- mô tả ngắn;
- source creator và source URL;
- rights status đã owner-review;
- Bunny video ID;
- media status `ready`;
- thumbnail hợp lệ;
- ít nhất một nhu cầu hoặc chủ đề cơ bản.

M0 xuất hiện trong catalog, search cơ bản và feed. M0 chưa được dùng làm nguồn
cho quan hệ ngữ nghĩa hoặc path nếu editor chưa duyệt vai trò của nó.

### M1 — Discoverable

Bổ sung:

- primary need;
- topics và tags;
- content role;
- difficulty;
- format;
- series/playlist nếu có;
- primary question dạng editor-reviewed.

### M2 — Path eligible

Bổ sung:

- reader situations;
- problem/question mapping;
- prerequisite;
- uncertainty reduced;
- expected shift;
- misconceptions addressed;
- actions enabled;
- next-step candidates;
- freshness và evidence level.

M2 mới đủ điều kiện làm bước bắt buộc trong watching path.

### M3 — Recommendation ready

Bổ sung:

- calibrated outcome evidence;
- reviewed semantic relationships;
- effectiveness signals;
- model/rule version;
- exclusions và confidence đã đánh giá.

M3 chỉ là readiness contract. Release này không bật recommendation cá nhân hóa.

## 5. Domain model

### 5.1. Video và phiên bản nội dung

`vid_videos` tiếp tục giữ identity, source, rights, Bunny lifecycle và current
publication state. Transcript và semantic model không được nhồi vào cùng record.

Các bảng mới ở mức logical design:

- `vid_transcripts` — language, source, version, quality status, text/payload ref,
  created/reviewed timestamps;
- `vid_model_versions` — immutable published semantic snapshots;
- `vid_model_suggestions` — AI draft per field, generator version, confidence,
  evidence span và review status;
- `vid_needs`, `vid_video_needs` — nhu cầu/vấn đề ổn định;
- `vid_questions`, `vid_video_questions` — câu hỏi canonical và scope;
- `vid_series`, `vid_series_videos` — series có thứ tự editorial;
- `vid_relationships` — typed edges có source, reason, confidence, validity và
  review state;
- `vid_paths`, `vid_path_stages`, `vid_path_items` — path, chặng và video;
- `vid_path_local_contract_versions` — version contract để migrate local progress,
  không lưu history người xem trên server.

### 5.2. Hồ sơ ý nghĩa

Một published model version có:

- identity/classification: role, format, topics, difficulty, language;
- audience fit: reader situation, high-fit, low-fit;
- question mapping: primary, secondary, partial;
- progression intent: uncertainty reduced, expected shift, misconceptions,
  decisions supported, actions enabled;
- prerequisites và next steps;
- trust: evidence quality, source refs, freshness, limitation;
- transferability và creator-specific notes.

AI được phép draft các field. AI không tự publish primary question, expected
shift, progression intent, evidence level, path order hoặc commercial relevance.

### 5.3. Quan hệ typed

Các relationship baseline:

- `REQUIRES_VIDEO`;
- `LEADS_TO_VIDEO`;
- `ANSWERS_SAME_QUESTION`;
- `DEEPENS_CONCEPT`;
- `CONTRASTS_VIEWPOINT`;
- `PROVIDES_EXAMPLE`;
- `MOVES_TO_ACTION`;
- `ALTERNATIVE_FOR`.

Mỗi quan hệ bắt buộc có reason, source type, source/model version, review status
và validity. Generic “related” không đủ cho path reasoning.

## 6. Upload và publish workflow

### 6.1. Fast lane M0

```text
Completed MP4
→ local validation
→ create D1 draft + Bunny video object
→ TUS upload trực tiếp lên Bunny
→ Bunny processing/webhook
→ production media probe
→ validate M0 metadata
→ owner/Codex publish
```

Fast lane phải idempotent và resumable. Upload lỗi không tạo duplicate Bunny
object hoặc duplicate catalog item. Publish bị chặn nếu media chưa ready, source
hoặc rights chưa hợp lệ.

### 6.2. Enrichment lane

```text
Published or draft video
→ transcript/caption intake
→ transcript quality gate
→ model creates field-level suggestions
→ schema/contradiction validation
→ Codex review packet
→ Thông/Codex approval
→ immutable model version
→ discovery/path eligibility recompute
```

Enrichment lỗi không unpublish video M0 đang hoạt động. Transcript kém được gắn
`needs_review`; hệ thống không giả vờ hiểu sâu.

### 6.3. Codex-first administration

Release này không cần dashboard. Các operation cần hỗ trợ qua command/service
boundary rõ:

- upload/publish video;
- inspect processing/playback;
- ingest/revise transcript;
- enrich/re-enrich;
- approve/reject individual suggestion;
- add/remove topic, need, question, series;
- create/reorder/publish path;
- inspect why a video/path is eligible;
- list incomplete, failed hoặc stale records.

Secret chỉ đọc từ secure local source/Worker secrets, không nằm trong argv, Git,
public DTO hoặc log.

## 7. Watching path

Watching path là sản phẩm biên tập có outcome, không phải playlist đổi tên.

Một path có:

- problem/need đầu vào;
- high-fit và low-fit;
- promise/expected outcome;
- total required/optional time;
- cover/visual treatment;
- ordered stages;
- required và optional videos;
- reason, notice và expected shift cho từng video;
- final action/reflection;
- draft/review/published/archived state.

Validation:

- video bắt buộc phải M2, published, ready và fresh;
- không cycle prerequisite;
- không duplicate item trong cùng path;
- stage order và item order phải deterministic;
- path dưới hai video giữ draft, không dựng giả lên home;
- archive video làm path `needs_review`, không âm thầm bỏ bước.

Người xem có thể chọn path hoặc khám phá tự do. Path progress và playback
position tiếp tục lưu local-only trong release này.

## 8. Discovery và infinite feed

### 8.1. Hai lớp discovery

Trang chủ gồm:

1. curated layer: featured video, watching paths, needs, series;
2. continuous discovery layer: feed video tải thêm liên tục.

Người xem lọc bằng nhu cầu, chủ đề, series, độ khó và content role. URL giữ filter
để refresh/chia sẻ không mất context.

### 8.2. Cursor contract

API feed dùng opaque cursor, không dùng page number. Cursor khóa ít nhất:

- sort policy version;
- filter fingerprint;
- last rank key;
- last stable tie-breaker;
- expiry.

Response:

```text
items
next_cursor | null
has_more
policy_version
```

Server không trả video draft, processing, archived hoặc duplicate trong cùng
cursor chain. Cursor sai filter/version trả lỗi typed để client restart có chủ ý.

### 8.3. Ranking baseline

Không có personalization. Ranking deterministic theo:

1. editorial pin/priority;
2. match nhu cầu/filter hiện tại;
3. model completeness và freshness;
4. diversity guard giữa topic/series/creator;
5. published date;
6. stable ID tie-breaker.

Khi user chưa chọn nhu cầu, editorial mix là nguồn chính. Không dùng fake
engagement hoặc fabricated popularity.

### 8.4. Client loading

- IntersectionObserver prefetch khi gần cuối viewport;
- một request in-flight cho mỗi feed;
- dedupe theo public video ID/slug;
- abort stale request khi filter đổi;
- lightweight skeleton;
- explicit retry khi lỗi;
- `has_more=false` tạo end state thật;
- fallback button “Tải thêm” cho keyboard/screen reader;
- announcement không gây ồn cho assistive technology;
- window/virtualize DOM sau ngưỡng đo được để cuộn lâu không tăng memory vô hạn;
- không preload stream media cho cards, chỉ metadata/thumbnail cần thiết.

Feed “vô hạn” nghĩa là tải tiếp cho đến khi hết catalog, không phải tạo nội dung
hoặc quay vòng video đã xem.

## 9. Playback quality

- Bunny adaptive HLS/player là playback source;
- giữ một player instance ổn định trong watch route;
- watch-later/local-progress update không remount player;
- resume position local-only;
- player hỗ trợ caption, speed, quality, fullscreen và keyboard theo capability
  chính thức của Bunny;
- chỉ preconnect/preload ở mức có bằng chứng hiệu năng;
- processing/failed/unavailable có state và retry rõ;
- media smoke phải chứng minh currentTime tăng trên production, không chỉ iframe
  render;
- navigation sang video tiếp theo giữ shell ổn định và không tải feed video file.

## 10. Trang chủ và visual direction

Thứ tự:

1. featured screening;
2. watching paths nổi bật nếu có đủ path published;
3. “Anh đang muốn giải quyết điều gì?”;
4. mới tuyển chọn;
5. series đang chiếu;
6. feed khám phá liên tục.

Visual giữ Unified Cinema: nền tối, typography biên tập, frame thật từ video,
ánh sáng và depth chuyển động tinh tế. Không dùng generic AI gradient, CSS art,
placeholder hoặc asset giả.

### 10.1. Featured clipping bug

Root risk đã quan sát trên production:

- section dùng `max-height` và `overflow:hidden`;
- heading dùng line-height thấp hơn font size;
- glyph range tiếng Việt cao hơn content box;
- tại một số viewport phần an toàn chỉ còn rất ít pixel, dễ cắt dấu hoặc dòng khi
  title dài hơn.

Thiết kế sửa:

- content column không bị `max-height` hoặc clipping;
- chỉ media layer được crop;
- typography dùng line box an toàn cho dấu Việt;
- chuyển layout trước khi copy chạm media;
- mobile đặt media trên, copy dưới;
- hero không ellipsis title;
- ảnh có focal-point metadata và object-position theo breakpoint;
- CTA luôn nằm trong flow và có contrast/focus rõ.

## 11. Future recommendation seam

Release này không thu thập profile cá nhân. Architecture chỉ để sẵn interface:

- `RecommendationRequest`;
- eligible candidates;
- score components/exclusion reasons;
- policy/model version;
- presentation/feedback/outcome event contract.

Chỉ triển khai recommendation cá nhân hóa khi:

- có user consent và identity policy;
- có đủ volume dữ liệu thật;
- xác định rõ tín hiệu được thu và retention;
- có evaluation baseline;
- recommendation giải thích được;
- user có quyền sửa/xóa dữ liệu;
- một spec/release riêng được phê duyệt.

Không dùng pageview đơn lẻ để suy ra hiểu biết, tiến triển hoặc nhu cầu mạnh.

## 12. Failure handling

- upload retry/resume không duplicate;
- Bunny webhook idempotent;
- media status và publish status tách biệt;
- enrichment failure không ảnh hưởng playback;
- cursor expired/invalid có recover path;
- partial feed failure giữ items đã tải;
- taxonomy/path update transaction-safe;
- published model immutable; update tạo version;
- rollback website không xóa Bunny media;
- archive catalog không xóa Bunny media mặc định.

## 13. Verification plan

### 13.1. Structural

- D1 migration chạy trên database mới và snapshot hiện tại;
- schema constraints, indexes và foreign keys;
- public DTO không lộ secrets, rights notes, drafts hoặc AI internal confidence;
- signed admin API/webhook/idempotency/resume tests;
- M0–M3 validation tests;
- path cycle/order/archive tests;
- cursor stability, no duplicate, filter reset và end-state tests.

### 13.2. Model quality

Eval set gồm transcript tiếng Việt chuẩn, transcript lỗi, video trùng, chủ đề khó,
multi-topic và nội dung thiếu evidence. Đo:

- editor agreement;
- field edit rate;
- false prerequisite;
- lost nuance;
- relationship/path acceptance.

Machine validation không được gọi là bằng chứng model “hiểu đúng” nếu chưa có
human-reviewed eval.

### 13.3. Playback/performance

- upload file thật vào Bunny test/production flow;
- processing → ready → publish;
- production currentTime advances;
- resume, caption, speed, fullscreen và retry;
- slow/unstable network behavior;
- feed 100+ synthetic items không duplicate và không tăng DOM/memory vô hạn;
- không tải media streams từ feed cards.

### 13.4. UI/UX

- 390, 768, 1024, 1280 và 1440 px;
- title tiếng Việt dài nhiều dòng;
- không overlap, crop dấu, chìm CTA hoặc media phá khung;
- keyboard, focus, screen reader load-more fallback;
- reduced motion và contrast;
- filter state, error, empty, loading, exhausted;
- watching path draft absence và published presence.

### 13.5. Release evidence

- test, lint, typecheck, build và release gate;
- Wrangler dry-run và secret scan;
- production routes/API/Bunny playback smoke;
- deployment/version IDs và rollback target;
- fingerprint parity nơi áp dụng;
- `docs/STATUS.md` và release/QA report được cập nhật.

## 14. Acceptance criteria

Release là PASS khi:

1. video M0 hoàn chỉnh có thể upload, process, publish và phát thật qua Bunny;
2. video hiện tại không regress playback, source disclosure, search hoặc local
   progress;
3. catalog có cấu trúc khoa học và feed cursor-based tải tới hết kho không lặp;
4. watching path có thể draft/review/publish khi đủ nội dung;
5. enrichment không chặn publish và không tự public output AI;
6. featured title/CTA không bị cắt hoặc overlap ở viewport đã định;
7. public system chưa thu thập profile cá nhân hoặc bật recommendation;
8. verification structural, runtime, visual và production đều có evidence thật.

## 15. Thứ tự triển khai dự kiến

1. fix featured clipping và khóa visual regression;
2. cursor feed API/client + long-scroll performance;
3. M0 fast-lane upload/publish hardening và batch usability;
4. taxonomy needs/series/discovery;
5. transcript/model schema và enrichment workflow;
6. semantic relationships;
7. watching path authoring, pages và local progress;
8. homepage curated/path/need presentation;
9. full QA, migration, production cutover và release evidence.

