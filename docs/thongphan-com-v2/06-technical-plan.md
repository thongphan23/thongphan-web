# Technical Plan — thongphan.com v2

## 1. Current Stack

Observed current repo:

- Next.js `16.2.4`
- React `19.2.5`
- App Router
- Markdown blog in `content/blog/*.md`
- Generated blog data in `lib/blog-data.generated.ts`
- Cloudflare Worker-related files for chat/signup/embed/email
- CSS Modules + global CSS

Current build command:

```bash
npm run build
```

Current build status: pass.

Warnings:

- `metadataBase` missing.
- Edge runtime disables static generation for the chat API route/page context.

## 2. Implementation Phases

### Phase 0 — Safety / Baseline

Actions:

- Confirm git status.
- Identify user/uncommitted changes.
- Run `npm run build`.
- Capture live site route map.
- Do not refactor unrelated workers.

Exit criteria:

- Build pass.
- Dirty worktree risks documented.

### Phase 1 — Copy/IA Update

Actions:

- Update homepage narrative.
- Update nav/footer labels and links.
- Update About proof arc.
- Update Chat suggested questions.
- Update Challenge copy/success path.
- Standardize CTA map.

Exit criteria:

- Site promise clear.
- External Conan links align confirmed platform URLs.
- Build pass.

### Phase 2 — Content System

Actions:

- Update blog category model.
- Add cornerstone content placeholders or first articles.
- Add related/next-step CTA rules.
- Improve metadata per post if missing.

Exit criteria:

- Blog listing supports strategic pillars.
- Current posts mapped cleanly.
- Build pass.

### Phase 3 — UX/UI Redesign

Actions:

- Refactor homepage sections.
- Build system map component.
- Replace excessive decorative cards with proof/diagram sections.
- Add proof media when assets are available.
- Mobile QA with screenshots.

Exit criteria:

- Desktop/mobile screenshots pass.
- No overlapping text/elements.
- CTA hierarchy clear.

### Phase 4 — Tracking / Funnel

Actions:

- Add analytics event plan.
- Track CTA clicks.
- Track chat starts.
- Track challenge signups.
- Track outbound clicks to trial/com.

Exit criteria:

- Events fire in dev/prod.
- Conversion paths measurable.

### Phase 5 — Conan Platform Integration

Actions:

- Confirm canonical URLs:
  - `trial.conan.school`
  - `com.conan.school`
  - any membership route.
- Decide whether challenge migrates to Conan Trial.
- Add diagnostic/quiz if scoped.

Exit criteria:

- Website no longer has orphan lead flows.
- Conan attribution works.

## 3. Technical Requirements By Area

### Metadata / SEO

Must:

- Set `metadataBase`.
- Add canonical URL strategy.
- Add OG title/description/image for homepage and articles.
- Ensure `html lang="vi"`.
- Generate sitemap/robots if missing.

Should:

- Add structured data for Person and BlogPosting.
- Add per-category metadata.

### Blog

Current pipeline is generated-data based. Preserve it unless it blocks needs.

Must:

- Keep markdown as source of truth.
- Keep build-time generated data.
- Ensure all slugs are generated.
- Support strategic categories.

Should:

- Add TOC/reading progress if not already fully implemented.
- Add related posts.
- Add inline CTA blocks.

### Chat

Current route proxies to Cloudflare Worker or mock in dev.

Must:

- Preserve streaming behavior.
- Update empty-state questions.
- Add error states that preserve trust.
- Add CTA after useful interaction.

Should:

- Add source/context explanation if response uses Brain2.
- Track chat starts and message count.

### Challenges / Signup

Current challenge data is static in page files; signup posts to `/api/signup`.

Must:

- Verify `/api/signup` route or Worker wiring before changing.
- Preserve form validation.
- Update success state with next steps.

Should:

- Move challenge data to a single source.
- Add UTM/source tracking.

### Cloudflare Workers

Do not rewrite workers blindly.

Before changes:

- Read `workers/README.md`.
- Inspect each `wrangler*.toml`.
- Confirm deployed endpoints.
- Confirm env vars/bindings.

Potential cleanup:

- Align Worker config names.
- Remove duplicate signup/challenge implementations if obsolete.
- Document deploy commands.

## 4. Analytics Event Plan

Recommended event names:

| Event | Properties |
|---|---|
| `homepage_primary_cta_click` | `cta_label`, `destination` |
| `homepage_secondary_cta_click` | `cta_label`, `destination` |
| `blog_post_view` | `slug`, `category` |
| `blog_cta_click` | `slug`, `cta_type`, `destination` |
| `chat_started` | `source_page` |
| `chat_suggested_question_click` | `question` |
| `challenge_signup_started` | `challenge_slug` |
| `challenge_signup_completed` | `challenge_slug` |
| `conan_outbound_click` | `destination`, `source_page` |

## 5. File Ownership Suggestions

Likely files for Phase 1:

- `app/page.tsx`
- `app/page.module.css`
- `app/layout.tsx`
- `app/about/page.tsx`
- `app/chat/page.tsx`
- `app/challenges/[slug]/page.tsx`
- `components/SignupForm.tsx`

Likely files for Phase 2:

- `content/blog/*.md`
- `scripts/generate-blog-data.mjs`
- `lib/blog-data.generated.ts` generated
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

## 6. Verification Commands

Run after meaningful code changes:

```bash
npm run build
```

If dev QA is needed:

```bash
npm run dev
```

Then use Playwright/manual browser checks for:

- `/`
- `/blog`
- `/blog/ai-khong-cuop-viec-ban`
- `/chat`
- `/challenges/brain2-21-ngay`
- `/about`

## 7. Known Risks

| Risk | Mitigation |
|---|---|
| Dirty worktree overwrite | Inspect diffs before editing touched files |
| Conan URLs stale | Confirm with Brain2/current platform before release |
| Challenge email conflicts with trial strategy | Treat as MVP bridge, not final architecture |
| Visual redesign breaks readability | Screenshot QA desktop/mobile |
| Chat worker unavailable | Preserve dev mock and production fallback |
| SEO metadata incomplete | Add metadataBase and per-page metadata |

## 8. Recommended First Build Sprint

Sprint goal:

> Make the website strategically coherent without changing backend architecture.

Scope:

- Homepage narrative.
- Footer/nav CTA map.
- About proof arc.
- Chat empty-state.
- Challenge copy/success next steps.
- MetadataBase.

Out of scope:

- New diagnostic app.
- Worker rewrite.
- Full visual redesign.
- Full analytics pipeline.

This sprint is low-risk and creates a coherent v2 foundation.

