# Learn Public And Commerce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add public Learn discovery and diagnostic to `thongphan.com`, connect it to shared identity, and provide a safe one-time paid-course flow with auditable entitlements.

**Architecture:** The Next.js public site renders SEO-friendly catalog and proof surfaces, while dynamic diagnostic/access operations call Learning Core. Commerce is provider-neutral at the domain boundary; V1 ships a no-new-subscription manual bank-transfer adapter with signed admin confirmation, and a future automated provider can implement the same webhook contract through an ADR.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Cloudflare Worker/D1/KV, Web Crypto HMAC, existing MailChannels, Vitest/Node tests, Playwright.

## Global Constraints

- Public Learn inherits Evidence Cinema; Cat World appears as a product object, not as a childish marketing theme.
- No paid recommendation appears inside lesson mode.
- AI Foundation is fully free; V1 paid access is one-time by course or path bundle.
- Purchase, entitlement, enrollment, and learning completion are separate records.
- A refund/revocation never deletes learner evidence or artifacts.
- Do not add a payment SaaS without a separate approved ADR.

---

### Task 1: Add public Learn information architecture

**Files:** Create `/Users/rio/thongphan-com/app/learn/page.tsx`, `page.module.css`, `LearnCatalogClient.tsx`, `app/learn/[course]/page.tsx`; modify `components/site-chrome/SiteChrome.tsx`; create route-contract tests.

- [ ] Add primary navigation `Câu chuyện`, `Thư viện`, `Học`, `Chẩn đoán`, `Conan Maker`; move `Tài sản` to secondary navigation.
- [ ] Render literal Learn offer, audience, interactive preview, free starting point, catalog, proof, and focused CTA without a card-heavy landing page.
- [ ] Add SEO metadata, canonical URLs, structured course data, loading/error/empty states, and real 404s.
- [ ] Run public route tests and `npm run build`; expected static public shells with client API hydration only where needed.
- [ ] Commit: `feat(site): add public Learn discovery`.

### Task 2: Implement 6-12 challenge diagnostic

**Files:** Create `app/learn/diagnostic/*`; create `worker/src/modules/diagnostic/*`, tests.

- [ ] Write scoring tests for all answer patterns, tie-breaking, confidence, and recommended start.
- [ ] Build 8 adaptive challenges with a 90-second median target, progress, skip, resume, and consent-safe anonymous session.
- [ ] Return recommended starting course and confidence with a direct preview/start action.
- [ ] Commit: `feat(learn): add placement diagnostic`.

### Task 3: Implement offers, purchases, and entitlements

**Files:** Create `worker/src/modules/access/{offers,purchases,entitlements,enrollment}.ts`, routes/tests; add D1 migration `0002_commerce.sql`.

- [ ] Test free, paid, Conan Maker-assigned, revoked, refunded, expired, and overlapping entitlement scopes.
- [ ] Model idempotent purchase creation and unique entitlement grants by purchase/scope.
- [ ] Enforce access on catalog map, session start, and asset download routes server-side.
- [ ] Commit: `feat(learn-api): add auditable course entitlements`.

### Task 4: Implement V1 manual bank-transfer checkout

**Files:** Create `app/learn/checkout/*`, `worker/src/modules/commerce/manual-provider.ts`, `admin-confirmation.ts`, tests; create `scripts/confirm-learn-payment.mjs`.

- [ ] Create checkout session with fixed offer snapshot, learner identity, expiry, bank-transfer reference, and receipt status URL.
- [ ] Sign admin confirmation payloads with Web Crypto HMAC and reject replay, altered amount, wrong offer, and expired session.
- [ ] Grant entitlement and write purchase/audit/outbox in one transaction after confirmation.
- [ ] Build receipt polling, delayed-confirmation support state, and deep link into the correct course.
- [ ] Test duplicate confirmation, refund/revoke, and race with receipt polling.
- [ ] Commit: `feat(learn-commerce): add one-time course checkout`.

### Task 5: Cross-domain handoff and commerce gate

- [ ] Test diagnostic-to-account, public-to-app deep link, logged-out return URL, checkout-to-entitlement, refund, and revoked access E2E.
- [ ] Verify session cookie, CORS allowlist, CSRF token, rate limit, and audit log across `thongphan.com`, `learn.thongphan.com`, and API host.
- [ ] Confirm paid UI never appears in lesson routes and free AI Foundation remains fully accessible.
- [ ] Update deployment docs, support runbook, privacy copy, and `docs/STATUS.md`.

