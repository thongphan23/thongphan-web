# STUCK REPORT — Managed sandbox blocks rendered verification and Cloudflare access

Date: 2026-07-11

## Scope affected

- Local rendered QA through the in-app Browser.
- Rendered QA for the Task 5 direct-entry route migration (`/about`, `/diagnostic`, `/blog/*`, `/assets/*`, `/challenges/*`, `/chat`).
- The repository's stale `next lint` script: Next.js 16 treats `lint` as a project directory and no ESLint package/config is installed locally; restricted network prevents adding the missing toolchain in this session.
- Task 6 active plugin cache sync: writes under `/Users/rio/.codex/plugins/cache` are denied by the managed sandbox, although the source plugin contract passes and is enabled in config.
- Task 7 Cloudflare preview/production access: deployment listing and `wrangler whoami` both stalled without output; the process was interrupted after the second same-network failure.

## Reproduction

1. `npm run build` completed all generators and the then-current 74-test suite had already passed, then failed while fetching six Google Fonts because this managed session has no network access.
2. A second build used `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` with previously cached local font files. Font fetching was bypassed, but Turbopack still failed when its evaluator attempted to bind a local port and received `EPERM`.
3. `npm run dev -- --port 3002` failed with `listen EPERM` on `0.0.0.0:3002`.
4. Retrying with `--hostname 127.0.0.1 --port 3002` failed with the same `listen EPERM`.
5. Creating the upgraded cache directory under `/Users/rio/.codex/plugins/cache/personal/thong-phan-read` failed with `Operation not permitted`; `codex plugin marketplace upgrade personal` also cannot sync it because the personal marketplace is a local source directory rather than a Git repository.
6. `npx wrangler pages deployment list --project-name thongphan-com` returned no deployment data, then `npx wrangler whoami` stalled for more than 60 seconds with no output. No Cloudflare token is exposed to this managed shell. The second attempt was interrupted instead of retrying indefinitely.

## Root cause

The current managed sandbox forbids local socket binding and does not provide usable outbound Cloudflare CLI access. These failures are environmental and are not caused by a TypeScript, build, SEO or bundle-budget failure in the repository.

The earlier production-build blocker is resolved: the release now calls `next build --webpack`, and a cached Google Font response file was used only as an offline substitute for this sandbox. The complete static export generated 54/54 pages successfully.

## Evidence already green

- `npm test`: 76 passed, 0 failed after the final Task 4 review fixes.
- Task 5 final suite: 82 passed, 0 failed; independent spec and engineering reviews passed.
- `npx tsc --noEmit`: exit 0.
- Focused homepage proof/cinema contracts: 20 passed, 0 failed.
- `git diff --check`: exit 0.
- Task 6 source plugin: 6 tests passed, all Python scripts compile, the dry package resolver returns only main-site targets, and unsafe backlink URLs are rejected before authentication. Activation remains blocked because the live cache cannot be written or freshly invoked here.
- Task 7 production export: 54/54 pages generated with Webpack; 82/82 functional tests, 4/4 build contracts, 3/3 SEO contracts, 2/2 bundle contracts and TypeScript all pass.

## Exit condition

Resume in a session that provides the selected in-app Browser and Cloudflare authentication/network access. The build no longer requires Turbopack. Re-run:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:release
```

Then complete in-app Browser QA at all target viewports, keyboard/modal, touch, reduced-motion and reference-comparison states. Capture the previous Cloudflare deployment identifier, deploy the exact `out/` artifact to preview, smoke it, promote that artifact to production, and only then retire Read. This report must remain attached until those rendered and external-state gates pass.
