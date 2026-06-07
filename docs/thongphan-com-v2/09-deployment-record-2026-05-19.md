# Deployment Record — thongphan.com v2

> Date: 2026-05-19 21:54 +07  
> Status: deployed to production  
> Production domain: https://thongphan.com

## 1. Brain2 Context Used

- Brand statement source: `strategy-brand-statement-thongphan-ai-assets-cashflow`
- Conan platform source: `Conan/conan-platform-architecture`
- Challenge/community source: `project-public-conan-community`, `strategy-conan-community-growth-engine`
- Strategic lens: depth over breadth, Brain2, AI-native expertise, Conan Trial as activation path.

## 2. Production Changes Verified

- Homepage first viewport now leads with the new brand statement:
  - Người có chuyên môn
  - Kiến thức thành tài sản
  - Dòng tiền thứ 2 bằng AI
  - Giữ an toàn công việc chính
- Primary CTA points to `/diagnostic`.
- `/diagnostic` exists, has 5 questions, returns 4-level result mapping, and links to:
  - `/challenges/brain2-21-ngay`
  - `https://trial.conan.school`
- Challenge page `/challenges/brain2-21-ngay` frames 21-day Brain2 as the activation point into Conan Trial.
- Footer uses the new brand statement and links to:
  - `https://trial.conan.school`
  - `https://com.conan.school`
  - `https://conan.school`

## 3. Cloudflare Deployment

### Workers

- `thongphan-signup-api`
  - Route: `thongphan.com/api/signup`
  - Version ID: `98531d2c-f354-4948-b449-3e660eccc836`
- `thongphan-chat-api`
  - Route: `thongphan.com/api/chat`
  - Version ID: `44f4fde7-e536-4109-b971-cf3a871a4ea4`

### Pages

- Project: `thongphan-com`
- Production deploy URL: `https://b49a6e2c.thongphan-com.pages.dev`
- Production alias: `https://production.thongphan-com.pages.dev`
- Custom domains verified by Pages project:
  - `thongphan.com`
  - `www.thongphan.com`

## 4. Data Fix

Remote D1 `thongphan-db` challenge slug was updated from:

- Old: `21-ngay-brain2`
- New: `brain2-21-ngay`

Reason: website signup form posts `challenge_slug: "brain2-21-ngay"`. Without this fix, production signup would return `Challenge không tồn tại hoặc đã đóng`.

KV cache keys cleared:

- `challenges:all`
- `challenge:brain2-21-ngay`
- `challenge:21-ngay-brain2`

## 5. QA Results

### Build

Command:

```bash
npm run build
```

Result: pass.

### Local Browser QA

Routes checked on desktop `1440x1000` and mobile `390x844`:

- `/`
- `/diagnostic`
- `/challenges`
- `/challenges/brain2-21-ngay`
- `/about`
- `/chat`

Results:

- No console errors.
- No horizontal overflow.
- Diagnostic interaction returns a level result.
- Diagnostic result contains CTA to 21-day Brain2 and Conan Trial.
- Challenge signup form validation works.

Screenshots:

- `/tmp/thongphan-v2-qa`

### Live Browser QA

Routes checked on `https://thongphan.com` desktop and mobile:

- `/`
- `/diagnostic`
- `/challenges/brain2-21-ngay`
- `/about`
- `/chat`

Results:

- HTTP `200` on all checked routes.
- No browser console errors.
- No horizontal overflow.
- Homepage H1: `Biến kiến thức của bạn thành tài sản và dòng tiền.`
- Diagnostic interaction returns a level result.
- Diagnostic result contains CTA to `Kích hoạt 21 ngày Brain2` and `Vào Conan Trial`.

Screenshots:

- `/tmp/thongphan-v2-live-qa`

### API QA

`POST https://thongphan.com/api/signup`

- Invalid payload returns validation error.
- Test valid signup succeeded.
- D1 confirmed 21 queued email records.
- Test signup and queued records were deleted after verification.

`POST https://thongphan.com/api/chat`

- SSE stream returns response chunks successfully.

## 6. Completion Criteria

- [x] `thongphan.com` live đúng bản mới.
- [x] CTA tự chẩn đoán hoạt động.
- [x] Diagnostic route exists and returns result.
- [x] Challenge 21 ngày / Conan Trial bridge is clear.
- [x] `npm run build` passes.
- [x] Desktop browser QA passes.
- [x] Mobile browser QA passes.
- [x] Signup API route works with the production D1 slug.
- [x] Chat API route streams a response.

## 7. Notes

- The site is statically exported. Production `/api/chat` and `/api/signup` are served by Cloudflare Worker routes, not by the exported Next API route.
- Analytics events, diagnostic email capture, Conan Trial SSO/API integration, full blog taxonomy migration, and real proof screenshots remain out of scope per approved PRD.

## 8. Open Design UI Refresh

> Date: 2026-05-19 22:22 +07  
> Status: deployed to production  
> Production deployment: `https://7d0aa4de.thongphan-com.pages.dev`

Open Design source artifact:

- Project: `open-design-landing`
- Artifact: `thongphan-v2-atelier-zero-homepage.html`
- Prompt basis: `Produce a world-class single-page editorial landing site in the Atelier Zero visual language (Monocle / Apartamento / Études editorial collage) — the same aesthetic Open Design uses for its own marketing surface.`

Production UI changes verified:

- Homepage now uses a stronger editorial collage composition with proof card, portrait stack, paper labels, and visible grid/hairline rhythm.
- Font treatment combines heavy `Be Vietnam Pro` display text with soft italic `Lora` phrases for the editorial contrast requested in Open Design.
- Color treatment now uses stronger accent blocks across blue, yellow, sky, coral, and green instead of a flat SaaS palette.
- CTA to `/diagnostic`, 21-day Brain2, and Conan Trial remain visible.

QA results:

- `npm run build`: pass.
- Local browser QA: pass on desktop `1440x1000` and mobile `390x844`.
- Live browser QA on `https://thongphan.com`: pass on `/`, `/diagnostic`, `/challenges/brain2-21-ngay`, `/about`, `/chat`, and `/blog`.
- Live diagnostic interaction: pass, 5/5 answers produce a result with `Kích hoạt 21 ngày Brain2` and `Vào Conan Trial`.
- Live homepage H1: `Biến kiến thức thành tài sản và dòng tiền.`
- Live homepage serif/soft phrase check: `Lora, Georgia, serif`.
- Screenshots: `/tmp/thongphan-v2-open-design-live-qa`.
