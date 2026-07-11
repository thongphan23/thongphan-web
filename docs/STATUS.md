# thongphan.com — Unified Cinema status

Last updated: 2026-07-11

## Current phase

Release candidate source complete; production promotion blocked on rendered Browser QA and Cloudflare access.

## Completed

- Homepage Evidence Cinema proof slice committed at `4750e18`.
- Unified Cinema subpage slice committed at `8019b92`.
- Main Read publishing plugin source now targets only `https://thongphan.com/library/read/<slug>` and passes 6/6 source-contract tests.
- Static export now uses explicit Webpack and generated 54/54 pages.
- SEO primitives, website JSON-LD, custom Cinema 404, sitemap/robots contracts, legacy noindex headers and per-route bundle budgets are implemented.
- Merged the current `main` branch at `105c8f6`, preserving the latest Crown & Citadel `/game/` release, its 65 runtime PNGs and canonical redirect.
- Current local release gates after that merge: 83/83 functional, 4/4 build, 3/3 SEO, 2/2 bundle, 4/4 static-route checks, TypeScript and diff check pass.

## Blocked external gates

- The managed sandbox cannot bind a local loopback server, so the selected in-app Browser cannot inspect the current artifact.
- No Browser-control tool is exposed in this session.
- Cloudflare deployment listing and `wrangler whoami` both failed to return data; do not deploy without capturing the previous production deployment identifier.
- The upgraded Read plugin source cannot be synced into `/Users/rio/.codex/plugins/cache` because that directory is read-only in this session.

## Safety boundary

Do not retire `read.thongphan.com`, remove its custom domain, or write new main-library backlinks until the main-site preview and production release pass. No Read redirect will be added.
