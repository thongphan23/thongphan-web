# Content Workflow 7 Days — Release Report

Last updated: 2026-08-08

## Release identity

- Route: `https://thongphan.com/challenge/content-workflow-7days`
- Source branch: `agent/content-workflow-7days`
- Base commit: `ed985507b04c19cddd60ceb6442d28e65c38d397`
- Release source commit: `68d7f1eb0455fd6032759e3515016be93aa2867d` (`68d7f1e`).
- Cloudflare project: `thongphan-com`

## Product contract

- Free, immediately accessible and self-guided.
- No account, payment, email gate, API, database or in-product AI generation.
- One versioned browser key: `tp.content-workflow-7days.v1`.
- Seven open lesson routes and eight exportable artifact categories.
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

The challenge added no dependency. A post-release `npm audit --omit=dev` on the
existing shared application tree reports four high-severity advisory groups in
`next@16.2.10`, the pinned `postcss@8.5.10`, `sharp@0.34.5` and the transitive
`js-yaml@3.15.0` used by `gray-matter`. `npm audit fix --dry-run` proposes a broad
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
