# Unified Cinema release QA

Date: 2026-07-11
Candidate branch: `feat/unified-cinema-system`
Verdict: **BLOCKED — automated artifact green; rendered and external gates pending**

## Automated evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Functional contracts | PASS | `npm test`: 82 passed, 0 failed |
| TypeScript | PASS | `npx tsc --noEmit`: exit 0 |
| Static export | PASS | Webpack generated 54/54 pages |
| Homepage build | PASS | 4 passed, 0 failed |
| SEO/export | PASS | 3 passed, 0 failed |
| Bundle/image budgets | PASS | 2 passed, 0 failed |
| Diff hygiene | PASS | `git diff --check`: exit 0 |
| Legacy indexing safety | PASS | robots exclusions, route metadata and `_headers` noindex contracts |

The export contains `404.html`, `robots.txt`, `sitemap.xml`, `_headers`, `_redirects`, all 13 reading routes, 14 living notes, 4 blog posts, 7 asset details, the challenge detail and standalone Conan Maker bundle.

## Rendered matrix still required

Use only the selected in-app Browser. Do not substitute Playwright CLI.

| Surface | 1490×1060 | 1280×720 | 834×1194 | 390×844 | 320×568 |
| --- | --- | --- | --- | --- | --- |
| Homepage + ACT 03 | pending | pending | pending | pending | pending |
| About + diagnostic | pending | pending | pending | pending | pending |
| Library hub, note and reading | pending | pending | pending | pending | pending |
| Blog index/detail | pending | pending | pending | pending | pending |
| Assets, challenge and chat | pending | pending | pending | pending | pending |
| Custom 404 | pending | pending | pending | pending | pending |

For each representative route verify no overflow, no face crop, no broken images, consistent paper/ink/lacquer identity, console cleanliness, image-failure fallback, keyboard focus, mobile menu trap/Escape/focus restore, modal close/restore, diagnostic completion, chat success/failure handling, reader controls and reduced motion.

## Reference comparison

Reference: `docs/superpowers/specs/assets/2026-07-10-evidence-cinema-selected.png`.

The historical homepage comparison in `design-qa.md` is the visual baseline. The current artifact still requires a same-viewport combined comparison for the homepage hero and ACT 03 after motion settles. Subpage QA must compare tone, typography, spacing, rule weight, image crop and paper/ink/lacquer proportion against that baseline; screenshot capture alone is not a pass.

## Deployment and rollback

- Previous deployment identifier: **not captured — Cloudflare CLI unavailable**.
- Preview URL: **not deployed**.
- Production URL: `https://thongphan.com` (existing release; not modified in this session).
- Rollback command: redeploy the complete artifact for the captured previous deployment/known-good commit; never mix old HTML with new immutable assets.

Two same-network Cloudflare checks failed (`pages deployment list`, then `wrangler whoami`), so no further upload was attempted. See `docs/STUCK_REPORT-2026-07-11-managed-sandbox.md`.

## Read retirement

Not performed. Retirement is authorized only after preview and production smoke pass. No 301/302 will be added; source data remains local migration provenance.
