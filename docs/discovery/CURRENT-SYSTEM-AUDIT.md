# Current System Audit — thongphan.com và nền móng Thongphan Read

**Document ID:** TPREAD-D03
**Version:** 2.2.0
**Status:** R0 baseline giữ nguyên; R0.1A remediation source đã hoàn tất qua Task 7, chờ Task 8 local release verification
**Last updated:** 2026-07-27
**Primary owner:** Thông Phan

---

## 1. Mục đích

Tài liệu này tách rõ ba lớp:

1. **Dữ kiện đã kiểm chứng từ website public.**
2. **Quyết định sản phẩm đã được chốt trong bộ foundation.**
3. **Giả định kỹ thuật phải được Codex xác minh trong repository ở Release 0.**

Repository và production surface đã được kiểm tra tại commit `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f`. Báo cáo bằng chứng đầy đủ nằm tại `docs/discovery/R0-AUDIT-REPORT.md` và vẫn là baseline R0 bất biến. R0.1A sau đó chỉ thay đổi source local; báo cáo triển khai nằm tại `docs/security/R0-1-IMPLEMENTATION-REPORT.md`. Các phần mô tả kiến trúc tương lai trong tài liệu này vẫn là target, không được hiểu là capability hiện có.

## 1.1. R0 verified snapshot

| Hạng mục | Dữ kiện đã xác minh |
|---|---|
| Runtime repo | `/Users/rio/thongphan-com`; branch `main`; HEAD `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f` |
| Legacy provenance | `/Users/rio/Projects/thongphan-read`; không phải Git repo; không còn là runtime |
| Framework | Next.js 16.2.10 App Router, React 19.2.5, TypeScript 6.0.3 |
| Render/deploy | `output: 'export'` → `out/` → Cloudflare Pages; Worker routes riêng cho API/router |
| Package manager | npm + `package-lock.json`; Node v22.22.3; Wrangler 4.110.0 |
| Public Read routes | `/library`, `/library/read`, 14 note detail, 13 reading detail |
| `/read` | Chưa tồn tại; live 404 `noindex`; không nằm sitemap |
| Content source | Git repository: Markdown + validated JSON + một số TypeScript hardcode; không phải D1/CMS |
| Reader identity | Chưa có account/member/entitlement; bookmark chỉ ở `localStorage` |
| Production data | D1 hiện phục vụ Brain2 challenge/access/email queue; chưa có bảng domain R1 |
| Environments | Preview và production Pages chưa tách D1/KV |
| Analytics | Chưa có product analytics hoặc Web Analytics beacon được xác minh |
| Payment | Chưa có provider/webhook/subscription/entitlement |
| Email | Production vẫn ở baseline trước cutover; source local ghi registration nhưng không tạo queue row; delivery/marketing consent chưa được kích hoạt |
| R2 / Queues | R2 bị tắt; không có Queue |
| Existing AI | R0.1A source thay cả hai API bằng binding-free 410 tombstone; `/chat` vẫn là trang static dùng local model; chưa production-deploy |
| Verification | typecheck, lint, 242 tests, 82-route build, release gate, SEO, bundle, 7 Worker dry-run pass |

R0 không deploy, không migration, không tạo database, không thay route/framework và không triển khai PRD-R1.

### 1.2. R0.1A implemented-source delta và production boundary

| Interface | Implemented source local | Production-deployed state | Boundary còn lại |
|---|---|---|---|
| `/api/embed` | `/api/embed` returns `410` cho mọi method qua shared tombstone; entry không có environment binding (`workers/embed-vault.ts:1-3`, `workers/security/disabled-endpoint.ts:22-50`, `wrangler.embed.toml:5-14`) | Chưa deploy trong R0.1A; không được mô tả production là đã remediated | R0.1B owner-gated cutover và smoke |
| `/api/chat` | `/api/chat` returns `410` qua cùng tombstone, không có AI/Vectorize binding (`workers/api/chat.ts:1-3`, `wrangler.chat.toml:5-14`) | Chưa deploy trong R0.1A | R0.1B owner-gated cutover và smoke |
| `/chat` | Trang public/static vẫn tồn tại; client luôn gọi `createLocalChatTurn()` và không gọi remote API (`app/chat/ChatClient.tsx:27-41`, `app/chat/chat-model.ts:28-33`) | Production page không được đổi bởi R0.1A | Không được suy diễn trang `/chat` là remote AI capability |
| Signup | Success chỉ xác nhận registration được lưu; D1 batch có đúng một signup statement và không chuẩn bị queue statement (`workers/brain2-campaign.ts:269-294`) | Production chưa cutover sang contract mới | Không có email-delivery promise hay marketing-consent grant |
| Email audience | Migration local đặt legacy rows thành `quarantined_legacy`, cột số tương ứng với `sendable = false`; trigger chặn mọi sendable state (`workers/migrations/0003_r0_1_email_integrity.sql:4-47`) | Migration chưa apply production; email Worker chưa deploy; cron vẫn rỗng | Delivery status như `pending` không tạo audience eligibility; retention/dedup/consent còn owner-gated |
| Environment isolation | Không thay đổi trong R0.1A | Preview và production D1 isolation chưa giải quyết | R0.2 chưa bắt đầu; tách resource không thuộc endpoint-binding removal |

`R0.1A source complete` ở đây chỉ áp dụng cho remediation source qua Task 7. Task 8 local release verification chưa chạy, `R0.1B production cutover not started`, và R0.H1 public-history residual vẫn là nhánh riêng, nonblocking.

---

## 2. Executive summary

### 2.1. Những gì đã tồn tại và có giá trị

Website `thongphan.com` đã có định vị rõ:

> Biến chuyên môn thật thành tài sản có người muốn dùng.

Public experience hiện đã có các thành phần phù hợp với tầm nhìn Thongphan Read:

- trang chủ theo hành trình chuyên môn → bằng chứng → tài sản → offer → cộng đồng;
- thư viện public;
- nội dung tuyển đọc, ghi chú sống và bài dài của Thông;
- thời lượng đọc;
- mô tả “đọc xong sẽ thấy gì”;
- chẩn đoán/bản đồ chuyên môn;
- asset và lộ trình 21 ngày;
- handoff sang Conan Maker.

Đây là lợi thế lớn: Thongphan Read không bắt đầu từ một trang trắng. Nó mở rộng từ một hệ content và positioning đã có dấu vết thực tế.

### 2.2. Khoảng trống hiện tại

Từ public surface, chưa có bằng chứng xác nhận các năng lực sau đã tồn tại:

- canonical reader account;
- free Reader và paid Member;
- entitlement;
- reading session tracking có evidence;
- Profile Model;
- Creator Model có cấu trúc;
- Offer Model;
- Relationship Graph;
- Active Question;
- personalized recommendation;
- content demand dashboard;
- workshop intelligence;
- email lifecycle;
- lead qualification có bằng chứng;
- case-study evidence export;
- workspace boundary.

### 2.3. Hướng migration được khuyến nghị

Không viết lại big-bang. Giữ website public và bổ sung theo vertical slice:

```text
/library/*  → public, static-first, canonical content
/read       → personalized workspace shell
/api/*      → business API
/admin/*    → internal operations
```

Bản đầu phục vụ workspace `thongphan`. Domain được chuẩn bị để sau này trích xuất phương pháp cho Conan Maker nhưng không xây multi-tenant.

---

## 3. Dữ kiện public đã kiểm chứng

### 3.1. Trang chủ

Tại thời điểm audit tài liệu:

- Title/positioning tập trung vào biến chuyên môn thành tài sản.
- Có liên kết tới Câu chuyện, Thư viện, Trải nghiệm, Chẩn đoán và Conan Maker.
- Có lớp Evidence Archive.
- Có mô hình năm bước: Chuyên môn → Bằng chứng → Tài sản → Offer → Cộng đồng.
- Có bản soi nhanh ba câu hỏi nhưng trang nói rõ hiện chưa lưu dữ liệu.
- Có nhiều lối vào theo tình trạng người dùng.

**Ý nghĩa đối với Thongphan Read:**

- Có sẵn Creator Model bản narrative.
- Có sẵn một số desired state transitions.
- Có sẵn nguồn onboarding question.
- Có sẵn offer handoff.
- Có thể chuyển các cấu trúc hiện tại thành metadata, không cần phát minh lại positioning.

### 3.2. Public Library

Public library hiện thể hiện:

- lời hứa “đọc sâu, nghĩ rõ và làm ra thứ có giá trị”;
- tuyển đọc thế giới;
- ghi chú sống của Thông;
- bài của Thông;
- lối vào theo nhu cầu: gọi đúng vấn đề, tạo vật thể, tạo nhịp làm;
- thời lượng đọc;
- nguồn/tác giả;
- kết quả mong đợi sau đọc.

**Ý nghĩa:**

Nhiều trường của Content Model đã có biểu hiện trên giao diện:

- content type;
- source;
- author;
- estimated reading time;
- expected shift/outcome;
- path positioning.

R0 cần xác định những dữ liệu này đang hardcode, nằm trong CMS, Markdown frontmatter hay database.

### 3.3. Route baseline

Route public đã xác minh từ source, static build và live production:

```text
/
/library
/library/[slug]          # 14 living notes
/library/read
/library/read/[slug]     # 13 curated readings
/blog
/blog/[slug]             # 4 authored posts
/sitemap.xml
/robots.txt
```

Baseline product decision:

```text
/library = public library
/read    = personalized workspace
```

`/read` hiện không tồn tại trong source/static build, trả HTTP 404 với `noindex` trên production và không nằm trong sitemap. Đây là khoảng trống capability đã xác minh, không phải route cần sửa trong R0.

---

## 4. Tài sản sản phẩm có thể tái sử dụng

### 4.1. Positioning asset

- Lời hứa rõ.
- Audience tương đối rõ.
- Phương pháp năm bước.
- Handoff Conan Maker.

### 4.2. Content asset

- Bài của Thông.
- Ghi chú sống.
- Tuyển đọc có source.
- Asset nhỏ.
- Chẩn đoán.
- Lộ trình 21 ngày.

### 4.3. Evidence asset

- Case cá nhân.
- Tư liệu workshop/sân khấu.
- Sách và sản phẩm đã xuất bản.
- Quy trình nội dung.
- Brain2 challenge.

### 4.4. Audience channel asset

- Facebook/personal brand.
- Workshop hàng tuần.
- Conan Maker.
- Website first-party.

### 4.5. Chuyển giao Conan asset

- Anh là creator/operator thật.
- Có học viên để pilot method transfer.
- Có môi trường ghi lại case.
- Có technical partner trong hệ Conan nhưng Thongphan Read vẫn là tài sản cá nhân/reference system.

---

## 5. Những câu hỏi repository audit bắt buộc

### 5.1. Repository và môi trường

Codex phải thu:

```text
Repository URL:
Default branch:
Current commit SHA:
Working tree status:
Package manager:
Node/runtime version:
Monorepo tool:
Local dev command:
Build command:
Test command:
Deploy command:
```

### 5.2. Framework

Xác minh:

- React/Next/Astro/Vite/khác;
- SSR/SSG/static;
- routing;
- server actions/API routes;
- content rendering;
- image pipeline;
- dependency nặng;
- Cloudflare compatibility.

Không được quyết định migrate framework trước khi có:

- lỗi/giới hạn cụ thể;
- cost/benefit;
- migration path;
- SEO path;
- ADR.

### 5.3. Cloudflare hiện trạng

Tìm:

- `wrangler.toml` hoặc `wrangler.jsonc`;
- Pages project config;
- Workers routes/custom domain;
- D1 binding;
- R2 binding;
- KV binding;
- Queue binding;
- Analytics Engine;
- Turnstile;
- secrets;
- environments staging/production;
- logs/observability.

### 5.4. Content source

Xác minh content nằm ở:

- Markdown/MDX;
- JSON/TS object;
- headless CMS;
- Google Sheets/Docs import;
- database;
- hardcoded component;
- mixed source.

Lập inventory:

```text
content_id
slug
canonical_url
type
title
author
source
published_at
updated_at
reading_time
access_level
content_model_coverage
```

### 5.5. SEO

Kiểm tra:

- canonical;
- sitemap;
- robots;
- Open Graph;
- JSON-LD;
- redirects;
- trailing slash;
- route case;
- index status;
- duplicate content;
- page title/meta description;
- article dates;
- source attribution.

### 5.6. Auth và session

Xác minh có hay chưa:

- provider;
- email magic link;
- Google login;
- session cookie;
- CSRF;
- logout;
- user table;
- role/admin;
- account deletion;
- privacy consent.

### 5.7. Analytics

Xác minh:

- Cloudflare Web Analytics;
- GA/PostHog/khác;
- custom events;
- session replay;
- consent banner;
- UTM;
- funnels;
- retention;
- data export.

### 5.8. Payment và email

Xác minh:

- provider;
- webhook;
- retry;
- idempotency;
- subscription model;
- email delivery;
- domain authentication;
- unsubscribe;
- bounce/complaint;
- template.

### 5.9. Test và CI/CD

Xác minh:

- unit test;
- integration test;
- browser E2E;
- lint/typecheck;
- preview deploy;
- branch protection;
- secret scan;
- dependency update;
- migration process;
- rollback.

---

## 6. Audit commands mẫu

Codex điều chỉnh theo package manager/framework thực tế:

```bash
pwd
git status --short
git rev-parse HEAD
git remote -v
find .. -name AGENTS.md -print
find . -maxdepth 3 -type f | sort | sed -n '1,250p'
cat package.json
find . -maxdepth 3 \( -name 'wrangler.toml' -o -name 'wrangler.jsonc' -o -name '_redirects' -o -name '_headers' \) -print
rg -n "cloudflare|D1|R2|KV|QUEUE|Turnstile|analytics|auth|stripe|payos|resend" .
rg -n "canonical|sitemap|robots|json-ld|application/ld\+json" .
```

Với build/test:

```bash
<package-manager> install --frozen/locked mode
<typecheck command>
<lint command>
<test command>
<build command>
wrangler deploy --dry-run --outdir dist-check
```

Không chạy production migration hoặc deploy trong audit nếu task không được cấp quyền rõ.

---

## 7. Evidence format cho audit

Mỗi kết luận phải theo mẫu:

```markdown
### Finding AUD-xxx — [Tên]

- Status: Verified / Partially verified / Unknown
- Evidence:
  - file:path:line
  - command + output summary
  - public URL
- Impact:
- Decision needed:
- Recommended action:
- Blocking release:
```

Ví dụ:

```markdown
### Finding AUD-014 — Public article metadata đang hardcode

- Status: Verified
- Evidence: src/data/articles.ts:1-240
- Impact: Content Model migration cần script/import layer.
- Recommended action: giữ source hiện tại ở R1, bổ sung schema validator; chưa chuyển CMS.
- Blocking release: R3.
```

---

## 8. Gap analysis theo capability

| Capability | Public evidence | Repository status sau R0 | Target release |
|---|---|---|---|
| Public library | Có | Verified: static-first, canonical, 29 `/library*` routes gồm hub/index | Giữ xuyên suốt |
| Reader account | Không | Verified absent | R1 |
| Paid membership | Không | Verified absent | R1 |
| Entitlement | Không | Verified absent | R1 |
| Reading summary | Không | Verified absent | R2 |
| Evidence Ledger | Không | Verified absent | R2 |
| Creator Model | Có narrative | Chưa có structured operational model | R3 |
| Content Model | Có metadata trong Git | Có partial schema/generator, chưa có D1 model | R3 |
| Offer Model | Có narrative handoff | Chưa có structured model/payment | R3 |
| Profile Model | Không | Verified absent | R3 |
| Active Question | Chẩn đoán không lưu data | Verified absent | R3 |
| Relationship Graph | Không | Verified absent | R3 |
| Personalized recommendation | Không | Verified absent | R4 |
| Editorial demand | Không | Verified absent | R5 |
| Workshop loop | Có workshop ngoài site | Không có integration trong repo | R5 |
| Qualification | Không | Verified absent | R6 |
| Conan transfer pilot | Chưa làm | N/A | R7 |
| Multi-creator software | Không | N/A | Sau Productization Gate |

---

## 9. Route và IA baseline

### Public

```text
/
/library
/library/[collection]
/library/[article]
/story hoặc route hiện tại
/diagnosis hoặc route hiện tại
/assets hoặc route hiện tại
```

### Personalized

```text
/read
/read/onboarding
/read/plan
/read/history
/read/questions
/read/notifications
/read/settings
/read/membership
```

### API

```text
/api/auth/*
/api/reading/*
/api/profile/*
/api/recommendations/*
/api/questions/*
/api/membership/*
/api/webhooks/*
```

### Admin/internal

```text
/admin/content
/admin/users
/admin/evidence
/admin/recommendations
/admin/editorial
/admin/workshops
/admin/offers
/admin/case-study
```

Đây là baseline information architecture, không phải xác nhận route code hiện tại.

---

## 10. Single-workspace và tương lai chuyển giao

R0 phải xác định cách thêm `workspace_id` mà không gây phức tạp không cần thiết.

Baseline:

- một row workspace `thongphan`;
- một creator profile chính;
- tất cả content/offer/question cluster creator-scoped có `workspace_id`;
- user identity global trong deployment, relationship/profile creator-scoped;
- không có UI chọn workspace;
- không có cross-workspace query trong production app.

Lý do thêm workspace boundary ngay:

- tránh hardcode Creator Model của Thông vào source code;
- tách profile theo creator nếu sau này pilot;
- tách content/offer/evidence;
- dễ export method/case;
- không phải migration toàn domain khi productize.

Lý do chưa xây multi-tenant:

- chưa có case study;
- chưa biết workflow phổ quát;
- chưa biết học viên cần software hay template/service;
- security/support/cost sẽ tăng mạnh;
- có nguy cơ làm chậm sản phẩm thật của Thông.

---

## 11. Cloudflare fit audit

R0 phải lập bảng cho từng thành phần:

| Thành phần | Hiện tại đã xác minh | Cloudflare target | Migration needed | Risk |
|---|---|---|---|---|
| Static site | Next static export trên Pages | Giữ Pages/static plane | Không ở R1 nếu chưa có evidence mới | SEO/build đang pass |
| API | Nhiều Worker route riêng | Workers có boundary rõ | Cần ADR routing/ownership | auth, abuse, drift |
| DB | Một D1 cho Brain2 challenge/access/email | D1 operational state | Cần schema mới sau ADR, không reuse mù | preview dùng chung prod |
| Object | R2 disabled | Chỉ dùng nếu có object/export thật | Chưa provision | scope/cost |
| Cache | KV chung rỗng + KV protected Brain2 | KV cho cache/config, không làm truth | Tách environment | consistency/isolation |
| Background | Không Queue; source email cron rỗng; signup local không tạo email queue row | Queue/Cron khi R1 chứng minh nhu cầu | Chưa provision/deploy | registration không phải delivery consent |
| Analytics | Không thấy Web Analytics/product SDK | Privacy-preserving event aggregate | Cần ADR/event catalog | không có field baseline |
| Anti-bot | Rate limit chỉ ở signup; không Turnstile | Chọn theo threat model | Chờ ADR | UX/abuse |
| AI | Source local dùng binding-free 410 tombstones; `/chat` local-only; production chưa cutover | None trong MVP Read | R0.1B deploy/smoke riêng | không được claim production remediated trước cutover |

Không migrate một component chỉ vì Cloudflare có dịch vụ tương ứng. Cần chứng minh fit và migration cost.

---

## 12. Baseline performance và SEO cần lưu

Trước thay đổi R1:

- export sitemap;
- lưu danh sách URL;
- crawl status code/title/canonical;
- đo Lighthouse hoặc WebPageTest cho trang chủ, library, article;
- ghi Core Web Vitals nếu có;
- lưu bundle size;
- lưu build time;
- lưu Cloudflare request baseline;
- lưu traffic 28 ngày nếu có quyền.

Sau mỗi release so với baseline để tránh “nâng cấp chức năng nhưng phá phân phối”.

---

## 13. Data/privacy audit

R0 phải trả lời:

- hiện có cookie/identifier nào;
- dữ liệu đi tới bên thứ ba nào;
- retention hiện tại;
- consent hiện tại;
- privacy policy;
- terms/membership policy;
- email list source;
- workshop data source;
- cách user yêu cầu xóa;
- ai có quyền admin;
- secret nằm ở đâu.

Đặc biệt, không nhập toàn bộ contact Facebook hoặc dữ liệu bạn bè vào hệ thống nếu không có consent, source và purpose phù hợp.

---

## 14. Release 0 deliverables

Codex đã tạo/cập nhật:

1. `docs/discovery/R0-AUDIT-REPORT.md` với findings và command outputs.
2. Repository map.
3. Route map.
4. Content inventory sample và count.
5. Cloudflare binding map.
6. Data flow map hiện tại.
7. Build/test/deploy runbook.
8. Security/privacy gap list.
9. SEO baseline.
10. Proposed ADR list.
11. Recommendation giữ nguyên/migrate từng component.
12. Updated SAD/Data Architecture với file path thật.
13. R1 feasibility report.

---

## 15. Exit criteria R0

Trạng thái exit criteria:

- local build: **pass**, 82 routes;
- test baseline: **pass**, 242/242 và release gate pass;
- Worker dry-run: **pass**, 7/7; Pages không có flag deploy dry-run nên dùng static artifact validation;
- framework/hosting/content/auth/analytics: **đã xác minh**;
- route/SEO/performance/bundle baseline: **đã lưu**;
- source of truth: **đã biết**;
- assumption blocking R1: **còn decision gates**, không còn repository unknown mang tính nền;
- Thông duyệt quyết định giữ/migrate: **pending**;
- PRD-R1: **chưa được tạo và bị khóa tới khi owner duyệt R0**.

R0.1 update: remediation source qua Task 7 đã được ghi nhận local-only; Task 8 local release verification, R0.1B production cutover, R0.H1 history remediation và R0.2 environment isolation đều chưa được mở bởi tài liệu này.

---

## 16. References public

- Trang chủ: <https://thongphan.com/>
- Thư viện: <https://thongphan.com/library>
- Cloudflare Workers limits: <https://developers.cloudflare.com/workers/platform/limits/>
- Workers Static Assets: <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>

Tài liệu này phải được cập nhật sau khi có repository access. Những mục `Unknown` không phải lỗi tài liệu; chúng là hàng rào chống kiến trúc dựa trên tưởng tượng.
