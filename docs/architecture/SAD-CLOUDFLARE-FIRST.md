# System Architecture Document — Cloudflare-first

**Document ID:** TPREAD-D10
**Version:** 2.1.0
**Status:** Target architecture reconciled with R0 evidence; owner ADR gates pending
**Last updated:** 2026-07-26

---

## 1. Architecture objective

Xây Thongphan Read thành một hệ thống:

- public content nhanh, ổn định và SEO-safe;
- account/member experience có state;
- evidence-backed personalization;
- chi phí thấp trong giai đoạn kiểm nghiệm;
- ưu tiên Cloudflare;
- không phụ thuộc AI để hoạt động lõi;
- có thể trích xuất phương pháp cho Conan Maker;
- chưa chịu chi phí/phức tạp của SaaS đa tenant.

### 1.1. Current-state architecture verified in R0

Target architecture trong tài liệu này không phải mô tả capability đã triển khai. Current state tại commit `c8b10f9e2d8f732f6c3cf6bf62802ac1bd6b562f` là:

```text
Git Markdown / JSON / TypeScript
            │ build-time generators
            ▼
Next.js 16 App Router, output: export
            │ out/ (82 HTML routes)
            ▼
Cloudflare Pages origin
            │
thongphan-com-router catch-all
            │
thongphan.com/library*

Dedicated production Worker routes
├── /api/signup                 → D1 + KV + rate limits
├── /api/chat                   → Workers AI + Vectorize
├── /api/embed                  → Workers AI + Vectorize mutation
└── /brain2/21-ngay/api/*       → D1 + protected KV + signed session
```

Current public Read plane đã có `/library`, `/library/read`, 14 note details và 13 reading details. `/read`, account, membership, entitlement, reader API và admin plane chưa tồn tại. Bookmark chỉ lưu ở browser `localStorage`.

R0 cũng xác minh:

- Pages preview và production đang dùng chung D1/KV; topology chưa đạt environment isolation target.
- R2 đang disabled; Queues không tồn tại; email cron rỗng và email Worker chưa deploy.
- D1 hiện chỉ có schema blog-backup/challenge/signup/email/access, không có domain schema Thongphan Read R1.
- Không có product analytics/Web Analytics beacon đã xác minh.
- `/api/embed` hiện là unauthenticated production mutation boundary; đây là P0 cần quyết định riêng trước R1.
- Existing AI routes không thuộc Thongphan Read MVP và không được thêm/sửa trong R0.

Evidence chi tiết và command output: `docs/discovery/R0-AUDIT-REPORT.md`.

---

## 2. Architecture principles

1. **Static-first public plane.**
2. **Operational state in D1.**
3. **Large objects in R2.**
4. **Cache/config in KV, not truth.**
5. **Async coarse-grained via Queues.**
6. **Evidence lineage before AI.**
7. **Single workspace now, workspace boundary in domain.**
8. **Provider adapters for email/payment/auth.**
9. **Graceful degradation.**
10. **Measure product outcomes, not raw surveillance.**
11. **Vertical slices and rollback.**
12. **Productization only after gates.**

---

## 3. System context

```text
Facebook / Search / Email / Direct
                │
                ▼
        thongphan.com public
        ├── Home
        ├── /library
        └── public articles
                │
       account / member CTA
                ▼
            /read app
        ├── onboarding
        ├── reading plan
        ├── questions
        ├── history
        ├── notifications
        └── membership
                │
                ▼
        Cloudflare Worker API
        ├── identity adapter
        ├── membership/entitlement
        ├── reading/evidence
        ├── profile/state
        ├── recommendation
        ├── editorial/workshop
        └── admin APIs
                │
      ┌─────────┼──────────┐
      ▼         ▼          ▼
     D1        R2        Queues/Cron
      │                     │
      └──────────┬──────────┘
                 ▼
        Email / Payment providers
```

---

## 4. Logical planes

### 4.1. Public Content Plane

Chịu trách nhiệm:

- HTML/content public;
- assets;
- canonical URLs;
- SEO;
- public search index;
- CTA static/personalized nhẹ.

Yêu cầu:

- static assets hoặc cacheable responses;
- không cần user DB để render nội dung chính;
- vẫn hoạt động khi API/AI/email lỗi;
- content member không bị bundle public nếu policy không cho phép.

### 4.2. Application Plane

`/read`, account, member và admin UI.

- có thể là SPA/SSR tùy stack audit;
- API calls tới Worker;
- auth session;
- personalization;
- dynamic state.

### 4.3. Operational Data Plane

D1 giữ source of truth; R2 giữ object. Không dùng analytics provider để quyết entitlement/profile.

### 4.4. Event & Background Plane

Queues/Cron xử lý:

- reading finalized;
- profile recompute;
- recommendation recompute;
- notification;
- demand aggregate;
- inference expiry;
- case snapshot.

### 4.5. Analytics Plane

- Cloudflare Web Analytics: traffic/performance aggregate.
- Analytics Engine hoặc product analytics hiện có: product event aggregate.
- D1: facts/state cần nghiệp vụ.

### 4.6. Integration Plane

Adapters:

- auth;
- email;
- payment;
- optional workshop/calendar;
- AI provider.

### 4.7. Admin & Trust Plane

- content/model admin;
- evidence inspector;
- user/member support;
- editorial dashboard;
- offer qualification review;
- case study export;
- audit log.

---

## 5. Cloudflare service map

| Nhu cầu | Service baseline | Lý do | Không dùng cho |
|---|---|---|---|
| Public assets | Workers Static Assets hoặc Pages | static requests miễn phí/unlimited theo docs | business state |
| API | Workers | edge runtime, bindings | long CPU task Free |
| Operational DB | D1 | SQL, low ops, source of truth | raw telemetry vô hạn |
| Object storage | R2 | file/export/payload lớn, egress thuận lợi | transaction query |
| Cache/config | KV/Cache API | read-heavy | entitlement/profile truth |
| Async | Queues | retry, decouple | mỗi scroll event |
| Schedule | Cron Triggers | weekly/daily jobs | long workflow phức tạp nếu không cần |
| Durable flow | Workflows optional | multi-step wait/retry | MVP critical path |
| Analytics | Web Analytics + Analytics Engine | aggregate | reader completion truth |
| Anti-abuse | Turnstile + rate limit | public forms | identity/auth replacement |
| AI | Workers AI/AI Gateway later | classification/embedding | core decisions without fallback |
| Internal access | Cloudflare Access optional | admin shield | public reader auth |

---

## 6. Current free-tier constraints và architecture consequences

> Các con số phải được xác minh lại trước release vì Cloudflare thay đổi limits.

### Workers Free

Official docs tại 2026-07 ghi:

- 100.000 Worker requests/ngày;
- 10 ms CPU/invocation;
- 128 MB memory;
- 50 external subrequests/free invocation;
- static asset requests miễn phí và không giới hạn nếu không invoke Worker;
- 20.000 static files/version Free.

**Hệ quả:**

- public article static;
- không chạy expensive personalization trên mọi pageview;
- API endpoints nhỏ, I/O oriented;
- batch background work qua queue;
- upgrade Workers Paid khi CPU/request volume đạt threshold.

### D1 Free

- 5 triệu rows read/ngày;
- 100.000 rows write/ngày;
- 500 MB/database;
- 5 GB/account;
- 7 ngày Time Travel Free theo current limits.

**Hệ quả:**

- index tốt;
- query tránh full scan;
- không lưu raw events;
- summary/batch writes;
- usage dashboard;
- backup/export policy.

### KV Free

- 100.000 read/ngày;
- 1.000 write/ngày;
- eventually consistent.

**Hệ quả:**

- cache versioned config;
- không write per session;
- không entitlement.

### Queues Free

- 10.000 operations/ngày tổng read/write/delete;
- Free retention 24 giờ.

Một message xử lý bình thường tiêu nhiều operation. **Hệ quả:** không message per micro-event, cần batch/coarse job và dead-letter/alert phù hợp.

### Email Service

Cloudflare Email Service hiện yêu cầu Workers Paid để gửi arbitrary recipients; Free chỉ gửi verified destinations. **Hệ quả:** MVP dùng external email provider adapter hoặc nâng Paid khi phù hợp.

### Workers for Platforms

Là lựa chọn tương lai cho multi-creator compute, có paid base plan. Không nằm reference implementation.

---

## 7. Deployment topology baseline

### 7.1. Environments

```text
local
preview/staging
production
```

Mỗi environment có:

- D1 riêng;
- R2 bucket/prefix riêng;
- KV namespace riêng;
- Queue riêng;
- provider test/prod credentials;
- domain/route riêng;
- analytics property/dataset riêng nếu cần.

Không dùng production D1 cho local.

**R0 actual:** local config có `preview_id` riêng cho KV, nhưng remote Pages root và `env.production` bind cùng D1/KV. Chưa có D1 staging/preview độc lập, R2/Queue riêng hoặc provider test credential boundary. Vì vậy mọi stateful R1 preview bị chặn cho tới khi ADR environment isolation được duyệt và resources được tách trong một release có thẩm quyền riêng.

### 7.2. Suggested Worker boundaries

Tùy codebase audit, baseline có thể là một app Worker modular để giảm vận hành:

```text
thongphan-web-worker
  ├── assets
  ├── public/api
  ├── read/api
  └── admin/api

thongphan-jobs-worker
  ├── queue consumers
  └── cron handlers
```

Không tách quá nhiều Worker sớm. Service binding chỉ khi bundle/security/deploy boundary có lợi rõ.

### 7.3. Routes

```text
thongphan.com/*
```

Static assets được match trước. API/admin routes invoke Worker. Cẩn thận `run_worker_first` vì có thể làm mọi asset request tính quota.

---

## 8. Frontend architecture

R0 đã xác minh framework hiện tại là Next.js 16.2.10 App Router, React 19.2.5, TypeScript 6.0.3 với `output: 'export'`. Public plane build/test/SEO pass nên baseline là **retain**, không migrate framework. Cách host authenticated `/read` phải được quyết định bằng ADR mà không làm đổi canonical `/library*`. Requirements bất biến:

- public pages pre-render/static khi có thể;
- `/read` có authenticated shell;
- progressive enhancement;
- mobile-first;
- accessible;
- no hydration dependency cho article text nếu có thể;
- reading tracker client lightweight;
- API schema typed;
- feature flags;
- error boundary;
- offline/local progress optional later.

### Public article personalization

Không cần query profile để render body. Có thể chèn dynamic CTA/recommendation ở cuối sau client load; failure không ảnh hưởng bài.

### Member content

Hai lựa chọn sau audit:

1. dynamic server authorization và body private;
2. encrypted/private fetch;

Không build member body vào public static bundle nếu không muốn lộ.

---

## 9. Backend/module architecture

```text
src/domain/
  creator/
  content/
  offer/
  profile/
  evidence/
  reading/
  state/
  recommendation/
  membership/
  editorial/
  workshop/
  notification/
  case-study/

src/application/
  commands/
  queries/
  policies/

src/infrastructure/
  d1/
  r2/
  kv/
  queues/
  providers/

src/http/
  routes/
  middleware/
  schemas/
```

Actual structure theo framework, nhưng separation cần bảo toàn.

---

## 10. Authentication architecture

### Requirements

- low-friction public user auth;
- secure cookie/session;
- email verification;
- account deletion;
- role separation;
- provider adapter.

### Baseline options cần ADR sau audit

- managed auth compatible Workers;
- custom magic-link with external email;
- existing site auth nếu đã có.

Không chọn Cloudflare Access làm reader auth. Admin có thể đặt sau Access + app role defense-in-depth.

### Session

- HttpOnly, Secure, SameSite;
- rotation/expiry;
- CSRF strategy;
- session revocation;
- workspace server context.

---

## 11. Membership/payment architecture

```text
User initiates checkout
→ Payment provider
→ webhook to Worker
→ verify signature
→ idempotency check
→ record payment
→ update subscription
→ generate entitlement
→ outbox membership event
→ notification job
```

Invariants:

- client redirect không xác nhận payment;
- webhook event ID unique;
- entitlement generation retryable;
- payment raw payload redacted/R2 if needed;
- manual transfer có admin workflow riêng;
- provider abstraction.

---

## 12. Reading architecture

### Client

- starts session;
- Page Visibility;
- section Intersection Observer;
- aggregate active/visible/coverage;
- meaningful interactions;
- sends periodic coarse checkpoint optional;
- finalizes via fetch/sendBeacon;
- local retry/idempotency.

### Server

- authenticate/resolve identity;
- validate schema/version;
- sanity checks;
- upsert/finalize session idempotently;
- record evidence;
- outbox `reading_session_finalized`;
- queue profile/recommendation update.

### Failure

Nếu finalize thất bại:

- local retry next visit hoặc best effort;
- không block navigation;
- user confirmed completion endpoint ưu tiên reliability.

---

## 13. Evidence/Profile architecture

D1 tables normalized + materialized profile projection.

```text
Event
→ Evidence
→ Fact/Inference
→ State
→ Recommendation
```

Queue consumer phải idempotent. Profile projection có thể rebuild.

AI không trực tiếp viết `profile_snapshot`; chỉ tạo suggestion/inference qua validated application command.

---

## 14. Recommendation architecture

### R4 baseline rule engine

1. load active question/goal/state;
2. retrieve eligible content/action;
3. exclude access/freshness/completion;
4. check prerequisite;
5. score question/state/effectiveness;
6. create decision + rationale;
7. present one primary action;
8. record outcome.

### Semantic retrieval later

Workers AI embeddings/AI Search/Vectorize chỉ làm candidate retrieval. Policy vẫn enforce exclusions/offer rules.

### Fallback

- curated path;
- popular relevant content;
- ask user to refine question;
- browse library.

---

## 15. Editorial/Workshop architecture

Cron weekly:

```text
aggregate active questions/search gaps/reflections
→ question clusters
→ demand snapshots
→ compare content coverage
→ editorial recommendations
→ admin review
```

Publication:

```text
editor publishes content + model
→ link questions/clusters
→ compute eligible audience
→ operator approves notification audience
→ queue dispatch
→ outcomes measured
```

Workshop:

- model and registration;
- pre-reading;
- attendance import;
- outputs;
- questions to demand;
- post-workshop NBA.

---

## 16. Email/notification architecture

### Provider adapter

```ts
interface EmailProvider {
  sendTransactional(input): Promise<DeliveryResult>;
  sendBroadcastBatch(input): Promise<DeliveryResult[]>;
  verifyWebhook(request): Promise<EmailEvent[]>;
}
```

Domain owns:

- notification intent;
- audience;
- preference;
- frequency cap;
- status;
- idempotency.

Provider owns delivery.

In-app notification stored D1. Web push later.

---

## 17. Analytics architecture

### Cloudflare Web Analytics

- public traffic;
- pageview;
- referrer;
- Web Vitals.

### Product analytics events

Có thể Analytics Engine hoặc existing approved tool:

- account_created;
- onboarding_completed;
- recommendation_presented;
- reading_session_finalized;
- completion_confirmed;
- reflection_submitted;
- member_activated;
- content_request_created;
- workshop_output_created;
- offer_handoff_reviewed.

### D1 facts

Chỉ state/fact cần nghiệp vụ. Dashboard có thể query projections/aggregates, không full raw events.

---

## 18. Admin architecture

Admin routes:

- app auth + role;
- optional Cloudflare Access;
- audit all mutations;
- PII redaction theo role;
- evidence inspector;
- no direct SQL in UI;
- safe bulk actions với preview/confirmation;
- publication/notification require review.

---

## 19. Case study/transfer architecture

### Case pack generation

```text
Hypothesis definition
→ cohort snapshot
→ intervention/version
→ metric queries
→ outcome snapshot
→ qualitative evidence attach
→ anonymization
→ owner review
→ export PDF/Markdown/JSON later
```

R2 lưu export; D1 giữ metadata.

### Transfer artifacts

Sinh template không chứa production data:

- Creator Canvas;
- Content Cards;
- Offer Canvas;
- manual relationship sheet;
- weekly review.

### Pilot isolation

R7 không đưa học viên vào production workspace của Thông. Dùng:

- copy template;
- isolated pilot database/tool;
- separate access;
- anonymized case collection.

Architecture multi-tenant chỉ ADR sau pilot.

---

## 20. Security architecture

### Edge controls

- TLS/Cloudflare proxy;
- WAF/rate limit nếu available;
- Turnstile;
- request size limit;
- CSP/security headers.

### Application controls

- schema validation;
- authorization;
- CSRF;
- output encoding;
- webhook signature;
- idempotency;
- least privilege;
- audit.

### Data controls

- secrets outside code;
- separate env;
- PII classification;
- R2 signed/private access;
- no public bucket for evidence;
- deletion propagation;
- backup access.

### Workspace controls

- workspace derived server-side;
- every scoped query includes workspace;
- cross-workspace invariant test;
- no data exports without owner/role.

---

## 21. Reliability và degradation

### Dependency failure order

#### AI down

Use rules/curated path. Core works.

#### Email down

Store notification intent, retry; in-app remains.

#### Queue down/backlog

Synchronous critical state committed; profiles/recommendations stale with banner/admin alert.

#### D1 limit/down

Public static works; dynamic features fail gracefully/read-only; alert/upgrade.

#### R2 down

Text/content metadata works; file/evidence payload unavailable with retry.

#### Payment provider down

No false activation; show pending/retry.

### Degradation priorities

1. Public reading.
2. Account/security.
3. Entitlement.
4. User-declared completion/question.
5. Reading telemetry.
6. Recommendation.
7. Email.
8. Analytics/AI.

---

## 22. Observability

### Logs

Structured:

```json
{
  "level": "error",
  "trace_id": "...",
  "workspace_id": "thongphan",
  "operation": "finalize_reading_session",
  "error_code": "D1_WRITE_FAILED",
  "duration_ms": 42
}
```

No PII/free text.

### Alerts

- error rate;
- auth failure spike;
- payment webhook failure;
- entitlement mismatch;
- queue age/backlog;
- email failure;
- inference invariant failure;
- D1/Worker/Queue quota threshold;
- case export privacy failure.

### SLO baseline later

Define after traffic baseline; public static availability highest priority.

---

## 23. Cost guardrails

Create daily usage projection:

- Worker invocations;
- D1 rows read/written;
- Queue ops;
- KV reads/writes;
- R2 operations/storage;
- email sends;
- AI neurons/tokens.

Threshold example:

```text
60%: observe
80%: investigate/optimize
95%: degrade or upgrade before hard failure
```

Free tier hard failures make monitoring mandatory.

---

## 24. CI/CD

Sau audit, pipeline tối thiểu:

```text
install locked deps
→ typecheck
→ lint
→ unit/integration
→ migration test
→ build
→ wrangler dry-run
→ preview deploy
→ E2E smoke
→ manual approval production
→ post-deploy smoke
```

Production migrations:

- backup/Time Travel awareness;
- forward compatible deploy;
- no destructive same-step unless approved;
- rollback plan.

---

## 25. Data migration pattern

- add nullable/new tables;
- dual write/read if needed;
- backfill job;
- verify counts/invariants;
- switch read path;
- remove old after observation.

Content model migration wave-based.

---

## 26. AI architecture later

### Allowed components

- question normalization/classification;
- embeddings candidate retrieval;
- content model suggestion;
- evidence summary;
- editorial clustering;
- recommendation rationale draft.

### Required controls

- AI Gateway where external model;
- prompt/model version;
- data minimization;
- no sensitive PII;
- evaluation set;
- fallback;
- cost cap;
- human approval.

### SLM

Không nằm roadmap trước khi:

- repeated stable task;
- enough labeled examples;
- model baseline;
- deployment economics.

---

## 27. Transferability architecture principles

1. Creator-specific config nằm trong models/data, không hardcode.
2. `workspace_id` hiện diện ở creator-scoped entity.
3. Provider adapters.
4. Case/export capability.
5. No cross-workspace query.
6. Single workspace UI.
7. Multi-tenancy not implemented.
8. Pilot method manual first.

---

## 28. Future architecture decision points

Sau Productization Gate:

- shared D1 vs D1 per workspace;
- central identity vs per deployment;
- custom domains;
- Workers for Platforms;
- creator billing;
- template/self-hosted vs hosted;
- analytics isolation;
- support/admin delegation;
- anonymized benchmark policy.

Không chọn trước bằng suy đoán.

---

## 29. Architecture Decision Records đề xuất sau R0

1. Canonical runtime repo and legacy Read provenance boundary.
2. Retain Next.js static public plane and define `/read` dynamic hosting boundary.
3. Auth provider, session, recovery and account deletion.
4. Payment provider, renewal, webhook idempotency and entitlement.
5. Email provider, legacy queue disposition and truthful UI promise.
6. Content source retention and the trigger for CMS/database migration.
7. Preview/staging/production resource isolation.
8. D1 schema and migration ownership.
9. Privacy, consent, retention and data-request policy.
10. Product event catalog and analytics storage.
11. Existing `/api/chat` and `/api/embed` ownership, isolation or retirement.
12. Worker routing precedence, admin access and observability.
13. Member-content delivery boundary.
14. Queue/outbox introduction criteria.
15. Case export/anonymization.
16. Manual versus CI deployment, immutable promotion and dependency scanning.

Không ADR nào trong danh sách này được coi là approved chỉ vì xuất hiện trong SAD. Owner phải duyệt R0 decision gates trước PRD-R1.

---

## 30. Architecture fitness tests

- public article loads without D1;
- member resource denied without entitlement;
- all creator-scoped queries filter workspace;
- raw scroll not written;
- queue consumer idempotent;
- inference without evidence rejected;
- provider outage degradation;
- static asset request does not invoke Worker unexpectedly;
- build bundle within plan limit;
- no PII in logs;
- case export fails closed if anonymization incomplete.

---

## 31. References

- Workers limits: <https://developers.cloudflare.com/workers/platform/limits/>
- Static Assets billing: <https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/>
- D1 limits: <https://developers.cloudflare.com/d1/platform/limits/>
- D1 pricing: <https://developers.cloudflare.com/d1/platform/pricing/>
- KV limits: <https://developers.cloudflare.com/kv/platform/limits/>
- Queues pricing: <https://developers.cloudflare.com/queues/platform/pricing/>
- Queues limits: <https://developers.cloudflare.com/queues/platform/limits/>
- Email Service pricing: <https://developers.cloudflare.com/email-service/platform/pricing/>
- Workers for Platforms pricing: <https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/reference/pricing/>

Tất cả limits phải được re-check trong R0/Rx planning.
