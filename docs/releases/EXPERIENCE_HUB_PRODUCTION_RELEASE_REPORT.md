# Experience Hub Production Release Report

Date: 2026-07-14

## Artifact

- Pages source commit: `97b3dc18a3a454d9e79133e82fa85fba86d3fec7`
- Preview deployment: `b7a31c73-abc8-4358-b8af-36934e044d3f`
- Preview URL: `https://b7a31c73.thongphan-com.pages.dev`
- Production deployment: `faa9aeae-e548-4757-8ec8-44b412055866`
- Production origin: `https://faa9aeae.thongphan-com.pages.dev`
- Public URL: `https://thongphan.com`
- Rollback Pages deployment: `a0554edc-d877-4133-bac9-2262b5cefdb7`
- Release artifact SHA-256: `51a26ef732a9d974d49011d4632da9f11e6c52825db2eb286d5bc296b9744918`

## Custom-domain router

- Router source commit: `19e8dab`
- Router Worker: `thongphan-com-router`
- Production version: `dfaaca5d-7019-4f1d-9959-e607f519248b`
- Previous rollback version: `d6a877e3-2bee-40ab-ab41-ade7dfe0db4b`
- The release smoke exposed that the previous router used `redirect: 'follow'`,
  flattening the Pages `/challenges` 301 into an HTTP 200 on the custom domain.
  The tracked router now uses manual redirect handling and preserves the upstream
  status and `Location` header on both apex and `www`.

## Release gate

- `npm ci`: passed; 505 packages audited with zero vulnerability.
- `npm test`: 238/238 passed for the Pages artifact; 240/240 passed after the
  custom-domain router regression test was added.
- `npx tsc --noEmit --incremental false`: passed.
- `npm run build`: production export completed for 82 static routes.
- `npm run test:release`: lint, build, SEO, bundle and Brain2 release contracts passed.
- `npm run test:learn-pages-preview`: all six build/runtime combinations passed and
  restored the original release artifact byte-for-byte.
- `npm audit --omit=dev`: zero vulnerability.
- `git diff --check`: passed.
- Wrangler router dry-run: 2.02 KiB raw / 0.89 KiB gzip, no bindings.

## Rendered QA

- Local whole-site matrix: 70/70 responsive and motion cases plus 9/9 keyboard,
  no-JavaScript and protected-content interactions passed.
- Experience Hub local, preview and production runs each passed 5/5 configurations
  with 21 segmented viewport screenshots per run.
- Covered desktop, short laptop, tablet, 390px and 320px mobile, reduced motion,
  no JavaScript, keyboard focus, image decode, overflow and header/title collision.

## Production smoke

- Homepage, Experience Hub, Diagnostic, Library, About, public Brain2, Conan Maker
  and Crown & Citadel return HTTP 200 on the immutable origin and custom domain.
- `/challenges` returns HTTP 301 to `/experiences` on the immutable origin, apex and
  `www`; `/game` returns HTTP 301 to `/game/` through the same router.
- `/learn`, `/learn/free`, `/learn/diagnostic` and one course path return real HTTP
  404 responses with header and HTML `noindex, nofollow`; Experience exposes zero
  Learn anchors while Learn is disabled.
- The dedicated Brain2 API still bypasses the global router and returns private,
  no-store, cookie-varying, noindex responses.
- Public and immutable-origin homepage SHA-256:
  `57f122a1e4afaf54f8aaeebc4b1f384750adce52951b62c668afa89e9fba71d0`.
- Public and immutable-origin Experience HTML SHA-256:
  `36ec1e4d12593e0d3d24ed8b8b04cdcda803abe812a71c355608bbfbf2c0c842`.

## Verdict

PASS. Experience Hub is live on `https://thongphan.com/experiences`; the previous
Pages deployment and router version remain recorded as independent rollback points.
