# STUCK REPORT — Managed sandbox blocks rendered verification

Date: 2026-07-11

## Scope affected

- Production `next build` verification for the current Task 4 diff.
- Local rendered QA through the in-app Browser.

## Reproduction

1. `npm run build` completed all generators and the then-current 74-test suite had already passed, then failed while fetching six Google Fonts because this managed session has no network access.
2. A second build used `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` with previously cached local font files. Font fetching was bypassed, but Turbopack still failed when its evaluator attempted to bind a local port and received `EPERM`.
3. `npm run dev -- --port 3002` failed with `listen EPERM` on `0.0.0.0:3002`.
4. Retrying with `--hostname 127.0.0.1 --port 3002` failed with the same `listen EPERM`.

## Root cause

The current managed sandbox forbids both outbound font requests and local socket binding. These failures occur before rendered application verification and are not caused by a TypeScript or test failure in the repository.

## Evidence already green

- `npm test`: 76 passed, 0 failed after the final Task 4 review fixes.
- `npx tsc --noEmit`: exit 0.
- Focused homepage proof/cinema contracts: 20 passed, 0 failed.
- `git diff --check`: exit 0.

## Exit condition

Resume rendered verification in a session that permits local loopback binding and the normal Google Font build fetch, then run:

```bash
npm test
npx tsc --noEmit
npm run build
npm run test:build
```

After the build succeeds, complete in-app Browser QA at all target viewports, keyboard/modal, touch, and reduced-motion states before deployment. The Task 4 source slice may be committed independently because its contract, type, asset-integrity and review gates are green; this report must remain attached until the rendered gate passes.
