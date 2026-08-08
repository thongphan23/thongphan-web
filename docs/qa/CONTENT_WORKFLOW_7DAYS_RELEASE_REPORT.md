# Content Workflow 7 Days — Release Report

Last updated: 2026-08-08

## Release identity

- Route: `https://thongphan.com/challenge/content-workflow-7days`
- Source branch: `agent/content-workflow-7days`
- Base commit: `ed985507b04c19cddd60ceb6442d28e65c38d397`
- Initial release source commit: `68d7f1eb2005e6d9013c6d56f10cce4239adfc63` (`68d7f1e`).
- Completion-patch source commit:
  `5cc5cc83739754139a33275431ef69474141d2df` (`5cc5cc8`).
- Previous Vietnamese learner-copy source commit:
  `8790425ae4791e058433614ba3d8d8c905a5c4b7` (`8790425`).
- Current curriculum-redesign source commit:
  `6c1cee4c015aced3a7d96df1074462406c78fa38` (`6c1cee4`).
- Cloudflare project: `thongphan-com`

## Curriculum redesign production release — 2026-08-08

This release replaces the earlier content-production curriculum with the approved
beginner path for designing a reusable workflow, using content as the continuous
worked example. Customer evidence is not a prerequisite: learners may begin with
their own knowledge, assumptions, notes and permitted reference material. Each day
contains one deep concept, a 45–60 minute core lesson, optional 20–30 minute AI lab,
guided practice, revision, a deterministic quality gate and four reusable resources.

The seven-artifact spine is workflow brief → context pack → output contract →
workflow map → runnable workflow → test-run log → versioned workflow kit and transfer
blueprint. Conan School is the disclosed continuous teaching case. Conan School is
the primary continuation for first-time builders; Conan Maker is offered only to
established builders whose operating process still depends on founder context or
judgment. No price, customer result or unsupported performance claim is published.

Release evidence:

- `npx tsc --noEmit`, zero-warning lint, 484/484 full repository tests, the 91-route
  static build and `npm run test:release` all pass.
- The complete browser journey passes locally, on the immutable preview and on the
  public apex. It covers all seven gates, save/resume, runnable-workflow assembly,
  clipboard, Markdown export, transfer design and v1/v2 reset, plus 1280px, 390px
  and 320px responsive checks.
- Preview: `ac6d8353-4315-47d0-ad0e-b1a071ee23fc`,
  `https://ac6d8353.thongphan-com.pages.dev`, branch alias
  `https://preview-6c1cee4.thongphan-com.pages.dev`.
- Production: `8d6ec958-b09b-49c8-8170-65711c55ee73`,
  `https://8d6ec958.thongphan-com.pages.dev`.
- Rollback: previous production `51ab2e91-83d6-4fcd-a8d3-fff3a9f03e04` remains an
  immutable HTTP 200 artifact.
- Immutable origin, apex and `www` passed 30/30 route checks. Hub, Day 01, Day 07
  and the fieldbook asset matched byte-for-byte across all three serving layers:
  - Hub: `a30ef1929f950864435602a0150abd99db03c0e7fc18d1ff65c5f0f606b770dc`.
  - Day 01: `3b5564298e936b21d81567a37bb33e25a15bef9b673c7157588dd57459847cc9`.
  - Day 07: `22553b21c815fbddbef812cf825bcb94f50ade8564bf2c3d16850424d2b18e14`.
  - Fieldbook: `e5e3f25b3644d578ec3a08ff0b3bc779fb5439cb439d8d089216171aec269952`.
- No migration, backend, account, payment, email, new secret or dependency was added.
  Learner work remains on-device until explicitly copied or exported.

## Vietnamese learner-copy patch — 2026-08-08

Anh Thông's acceptance review identified two public-copy violations: English terms
were interleaved without Vietnamese meaning, and learner instructions addressed the
visitor as `anh` instead of `bạn`. Brain2 and the existing thongphan.com voice
contract both already required Vietnamese-first website copy and the `bạn` address.

The patch applies that contract to every learner-facing surface: hub and metadata,
readiness, seven lesson contracts, workbench labels and statuses, validation errors,
generated workflow prompt, Day 7 completion handoff and downloaded Markdown. Important
lookup terms retain the original English only after a Vietnamese meaning in
parentheses. Internal enum values such as `understand-cause` and `sent` are translated
before export.

Regression and release evidence:

- The rendered QA runner removes parenthetical English glosses, then rejects the
  known naked-English vocabulary and learner-facing `anh` on all eight routes. It
  repeats the same audit after completion, clipboard fallback and on the downloaded
  document.
- The language check failed first on 18 naked-English groups on the hub. A separate
  export test failed first on raw job and publish-status codes; both pass after the
  corrections.
- Full `npm test`, TypeScript, lint, 91-page build and `npm run test:release` pass.
- Complete four-viewport browser QA passes locally, on preview and on production with
  zero browser errors and zero failed responses.
- Preview: `c53deeb2-c64a-4903-8154-00d567dec987`,
  `https://c53deeb2.thongphan-com.pages.dev`.
- Production: `51ab2e91-83d6-4fcd-a8d3-fff3a9f03e04`,
  `https://51ab2e91.thongphan-com.pages.dev`.
- Rollback: previous production `40603e1e-45ee-40c2-87bd-1974aaab64e2`.
- Immutable production origin, apex and `www` passed 30/30 route checks and matched
  the preview fingerprints immediately:
  - Hub: `57655be82f0690d7f2d368439cd54660de402228063d71bd6d582c0c75cacbec`.
  - Day 01: `ee55d98e3db73b79dbea089db8d21b30f5f21b9293e953762df35d48cc7ee1d4`.
  - Day 07: `cd93449d2e60d3b068f31833a40aaab26230002942011b77c2ae3ceb56714087`.

## Completion patch release — 2026-08-08

The initial release was re-audited before anh Thông's acceptance check. Three
concrete gaps were reproduced with failing contracts before implementation:

1. Day 7 could pass without six valid 14-day plan items.
2. Resume selected the first incomplete day instead of an explicitly unfinished
   `currentDay`.
3. A rejected Clipboard API call claimed a manual fallback without rendering any
   selectable fallback content.

The completion patch adds structural six-item validation, current-day resume and a
focused/selectable manual-copy textarea. Commit `8717e75` first integrated current
`origin/main` (`c09481f`) so the release artifact would not roll back newer site work;
commit `5cc5cc8` contains the tested corrections.

Fresh verification on the integrated tree:

- `npm test`: 486/486 pass on two serial confirmation runs.
- `npx tsc --noEmit`, `npm run lint`, `npm run build` and
  `npm run test:release`: pass; build emits 91 static pages.
- `npm run qa:content-workflow`: pass locally, on immutable preview and on the public
  apex, covering completion, refresh/resume, export, clipboard success and forced
  clipboard-failure fallback at 1440×900, 1280×800, 390×844 and 320×568.
- Preview: `e981f028-9ef6-431c-bfea-608a86fb77aa`,
  `https://e981f028.thongphan-com.pages.dev`.
- Production: `40603e1e-45ee-40c2-87bd-1974aaab64e2`,
  `https://40603e1e.thongphan-com.pages.dev`.
- Rollback: previous production `8c0f6b38-0475-4aed-8eea-017b300d4fa6` remains
  immutable and returned HTTP 200 for the hub, Day 1 and Day 7 during the release.
- Origin, apex and `www` passed all 30 route checks. After edge propagation, hub,
  Day 1 and Day 7 HTML hashes matched exactly across all three hosts.

Current served fingerprints:

- Hub: `7e58ea50089ea6debec85c3213fc7fdeb701dd451854ea372ef41c8d16226ade`.
- Day 01: `12e86e3df93398c9c57baa139ff9b0ae6281068bb9c4630e84cae3c900c96111`.
- Day 07: `e8004343fba1076ec4265989b353f488660c36ed392d997c446a55ce508149f6`.

### Release hypothesis, decision gate and rollback

- Hypothesis: preventing incomplete 14-day plans, restoring the intended unfinished
  day and exposing a real copy fallback removes false completion and blocked export
  paths before learner acceptance.
- Technical baseline and acceptance metric: the deterministic browser journey must
  complete on all four viewports with zero relevant console/network error, and all
  three public serving layers must return the exact verified artifact. Both gates pass.
- Behavioral analytics are intentionally absent because this local-only, account-free
  product does not add tracking or a backend. Learner feedback from anh Thông is the
  next qualitative signal; no fabricated conversion baseline is claimed.
- Roll back if a core route, resume, Quality Gate, copy or export flow regresses by
  redeploying immutable artifact `8c0f6b38-0475-4aed-8eea-017b300d4fa6` to the
  production branch, then rerun the same apex/`www` browser and route matrix. The
  rollback artifact itself was read-verified; production was not deliberately rolled
  back after a passing release.

## Product contract

- Free, immediately accessible and self-guided.
- No account, payment, email gate, API, database or in-product AI generation.
- One current versioned browser key: `tp.content-workflow-7days.v2`; legacy v1 is
  isolated and cleared only by the explicit challenge reset.
- Seven open lesson routes and seven independent exportable artifact categories.
- Deterministic structural Quality Gates; no scroll/time completion.
- Workbook content stays in the browser unless the learner explicitly copies or exports it.

## Local implementation evidence

- Focused model, storage, route, registry and route-mode checks: 27/27 pass.
- Journey contract: 4/4 pass.
- Full `npm test`: 269/269 pass.
- `npx tsc --noEmit`: pass.
- `npm run lint`: pass with zero warning.
- `npm run build`: pass; Next generated 91 static pages including the hub and all seven lesson routes.
- Static artifact paths confirmed for `day-01.html` through `day-07.html`.
- `npm run test:release`: pass — build 6/6, SEO 4/4, bundle 3/3 and Brain2 143/143.
- `git diff --check`: pass.

### Shared dependency maintenance boundary

The challenge added no dependency. A fresh `npm audit --omit=dev` on the integrated
shared application tree reports five high-severity advisory groups in `next`,
`postcss`, `sharp`, `nanoid` and the transitive `js-yaml` used by `gray-matter`.
`npm audit fix --dry-run` proposes a broad
whole-site change including Next 16.3.0 and Sharp 0.35.3, so it was not applied as
an unreviewed side effect of this challenge release.

The released challenge is a static export, adds no Server Action or image-upload
surface and stores learner input only in browser localStorage. The advisory cleanup
therefore remains a separate shared-platform dependency upgrade that must run the
full-site release matrix before a later production promotion; it is not represented
as clean or silently auto-fixed here.

## Visual contract

Accepted references:

1. `docs/visual/content-workflow-7days/hub-desktop-approved.png`
2. `docs/visual/content-workflow-7days/workbench-desktop-approved.png`
3. `docs/visual/content-workflow-7days/workbench-mobile-approved.png`
4. `docs/visual/content-workflow-7days/day-07-completion-approved.png`

Production hero asset:

- `public/images/challenges/content-workflow-7days-fieldbook.webp`
- Native dimensions: 1254×1254.
- Encoded size at implementation checkpoint: 87 KB.
- Source: generated specifically for thongphan.com from the accepted concept.

## Rendered QA and fidelity ledger

The exact static artifact passed the automated browser journey at 1440×900,
1280×800, 390×844 and 320×568. Every checked viewport had one H1, zero horizontal
overflow and zero broken images. Browser console errors and failed HTTP responses
were both empty.

Evidence method:

- Codex in-app Browser was used first for DOM orientation, geometry checks and the
  final production render at 1440×900.
- The repeatable Playwright journey in `scripts/qa-content-workflow.mjs` exercised
  all form and persistence states and wrote viewport evidence to a dedicated temp
  directory outside the repository.
- Approved concepts and the latest implementation captures were compared directly
  with `view_image` at original resolution.

Fidelity ledger:

1. Hub hierarchy matches the approved split scene: editorial H1 and offer CTA on the
   left; a physical fieldbook object with red thread on the right.
2. Palette and typography match the contract: charcoal, warm paper, oxblood,
   display serif and operational mono labels; no AI gradient or fantasy motif.
3. Desktop workbench keeps the approved three-zone model: progress rail, lesson
   canvas and live artifact desk.
4. Mobile keeps the same hierarchy as a single readable column with a horizontally
   scrollable seven-day rail and full-width 44px controls. It deliberately exposes
   lesson content continuously instead of copying the concept's illustrative
   accordion, so required guidance is never hidden.
5. Day 7 now switches to a dedicated `Assembly ledger · 8/8 artifacts` completion
   view with `7/7 ngày`, export, copy and an explicit edit path before the final
   14-day continuation handoff.
6. The production fieldbook asset is the approved visual metaphor, encoded at
   1254×1254 and 87 KB; it loads with non-zero natural dimensions at every viewport.
7. The desktop concept's native 1505×1045 proportions were checked directly. Mobile
   was verified at its intended logical 390×844 and fallback 320×568 viewports; the
   generated concept's 853×1844 file represents a high-density mobile capture, not
   an 853 CSS-pixel layout.

Above-the-fold copy diff:

- H1 and CTA match the approved direction exactly.
- The implementation lead uses the product-spec copy beginning `Mang một offer thật
  vào` instead of the image model's placeholder lead. This is intentional: the
  visual contract explicitly defers learner-facing copy to the approved execution
  contract.

## Preview and production evidence

- Previous production rollback point captured before upload:
  `4170518d-273d-42cc-9801-6af60493253a`, source `40a8df2`, origin
  `https://4170518d.thongphan-com.pages.dev`.
- Preview deployment: `52b3c7a3-9406-447d-8dff-fca758a7632f`, source `68d7f1e`,
  `https://52b3c7a3.thongphan-com.pages.dev` and branch alias
  `https://preview-68d7f1e.thongphan-com.pages.dev`.
- Preview passed the complete browser workflow: readiness; Days 1–4; prompt assembly,
  copy and refresh resume; two reviewed drafts; Day 7 completion; Markdown download;
  Starter Kit copy; reset keep/cancel and confirmed deletion.
- Production deployment: `8c0f6b38-0475-4aed-8eea-017b300d4fa6`, source `68d7f1e`,
  immutable origin `https://8c0f6b38.thongphan-com.pages.dev`.
- The same complete browser workflow passed on `https://thongphan.com` after edge
  propagation, at all four target viewports, with zero console/network error.
- Immutable origin, apex and `www` each returned HTTP 200 for the hub, all seven day
  routes, `/experiences` and `/sitemap.xml`: 30/30 route checks passed.
- Final in-app Browser production probe confirmed the canonical URL, exact title and
  H1, one H1, zero overflow and zero broken images at 1440×900.

Served fingerprint parity:

- Hub HTML local = production:
  `1eae8e9062adce8c73e00c9937eeafe2209ab5efcf75e78c3985d04e735240fd`.
- Day 01 HTML local = production:
  `acc7bc9c233d323b6546c5e267c1bae64e072601a6a5e3c37d3ace7166e5d36a`.
- Day 07 HTML local = production:
  `4bd3eb88aff2b11eb2f280145a0aa99c9df405c754c7bde66945b3967cc9af0a`.
- Fieldbook asset local = production:
  `e5e3f25b3644d578ec3a08ff0b3bc779fb5439cb439d8d089216171aec269952`.
