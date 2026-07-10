# Task 1 Report — Unified Cinema Foundation

## Status

**PASS** for the Task 1 implementation and automated acceptance gates.

Interactive in-app Browser QA is **deferred to the controller** because the requested browser surface was unavailable in this agent session. No Playwright or Chrome fallback was used.

## Scope delivered

- Added the shared Cinema semantic tokens, focus, spacing, and motion primitives.
- Reduced root font declarations to Be Vietnam Pro, Cormorant Garamond, and Newsreader; only Be Vietnam Pro preloads, while Cormorant and Newsreader use `preload: false`.
- Added the exact-first/prefix-second route-mode matcher.
- Kept `isUnifiedRouteEnabled(pathname)` homepage-only.
- Split universal navigation, header, accessible mobile dialog, and footer into focused components.
- Added the complete five-link primary navigation and homepage-only chapter navigation.
- Preserved the legacy Default shell, Garden atmosphere, CSS logo mark, and `app/layout.module.css` for every route except `/`.
- Added `lucide-react` as a production dependency and used direct Menu, X, and ArrowRight imports only.
- Preserved the canonical `/conanmaker/` trailing slash with raw anchors for the standalone static bundle.

## RED evidence

### Route matcher

Command:

```text
npx tsx --test scripts/site-route-mode.test.ts
```

Observed RED:

- exit code `1`;
- `ERR_MODULE_NOT_FOUND` for `../lib/site-route-mode`;
- failure occurred before `lib/site-route-mode.ts` existed, as intended.

### Mobile and shell contract

Command:

```text
npx tsx --test scripts/site-chrome-contract.test.ts scripts/homepage-cinematic-contract.test.mjs
```

Observed RED:

- exit code `1`;
- 10 existing checks passed and 6 new checks failed;
- failures identified the absent navigation module, unified component split, mobile dialog contract, 44px width contract, root font/token contract, and Lucide dependency.

### Standalone trailing-slash regression

Static export inspection showed Next `<Link>` normalized `/conanmaker/` to `/conanmaker`. A regression test was added first:

```text
npx tsx --test scripts/site-chrome-contract.test.ts
```

Observed RED: 6 passed, 1 failed because the universal chrome did not yet use a canonical raw anchor for the standalone bundle.

## GREEN evidence

### Focused route matcher

```text
npx tsx --test scripts/site-route-mode.test.ts
```

Result: 2/2 passed.

### Focused shell suite

```text
npx tsx --test scripts/site-route-mode.test.ts scripts/site-chrome-contract.test.ts scripts/homepage-cinematic-contract.test.mjs
```

Result: 18/18 passed before the later trailing-slash regression was added.

After the trailing-slash fix:

```text
npx tsx --test scripts/site-chrome-contract.test.ts
```

Result: 7/7 passed.

## Final verification

```text
npm test
```

- exit code `0`;
- 27/27 tests passed.

```text
npx tsc --noEmit
```

- exit code `0`;
- no diagnostics.

```text
npm run build
```

- exit code `0`;
- production compilation and TypeScript checks passed;
- 38 static pages generated;
- expected route table included `/`, `/library`, and `/diagnostic`.

`git diff --check` also passed with no whitespace errors.

## Browser and export evidence

The in-app Browser runtime initialized, but selecting the requested surface returned exactly:

```text
Browser is not available: iab
```

Per the task constraint, no Playwright or Chrome fallback was used. Keyboard interaction and visual screenshots are therefore deferred to the controller.

Fresh static-export inspection confirmed:

- `/`: `data-site-shell="unified"`, `data-route-mode="cinema-dark"`, exactly one `<main>`, primary and chapter navigation landmarks, and canonical `/conanmaker/` links in the universal chrome;
- `/library`: `data-site-shell="legacy"`, `data-route-mode="editorial-light"`, legacy Garden atmosphere and logo mark retained;
- `/diagnostic`: `data-site-shell="legacy"`, `data-route-mode="evidence-dossier"`, legacy Garden atmosphere and logo mark retained.

Per the approved Task 1 boundary, `/library` and `/diagnostic` are regression checks only. Their route-specific landmark/mobile-shell migration remains for the later slice that enables each route family.

## Files

Created:

- `styles/brand-tokens.css`
- `lib/site-route-mode.ts`
- `components/site-chrome/site-navigation.ts`
- `components/site-chrome/SiteHeader.tsx`
- `components/site-chrome/MobileMenu.tsx`
- `components/site-chrome/SiteFooter.tsx`
- `scripts/site-route-mode.test.ts`
- `scripts/site-chrome-contract.test.ts`

Modified:

- `components/site-chrome/SiteChrome.tsx`
- `components/site-chrome/SiteChrome.module.css`
- `app/layout.tsx`
- `styles/globals.css`
- `scripts/homepage-cinematic-contract.test.mjs`
- `package.json`
- `package-lock.json`

Intentionally retained:

- `app/layout.module.css`
- all legacy Garden/default consumers
- all Conan Maker static files

## Self-review

- Route matcher checks exact paths before bounded `prefix/` matches and defaults unknown paths safely.
- Unified activation is exactly `pathname === '/'`; route mode alone never activates a subpage.
- The universal shell source contains one `<main>` and one rendered header/footer branch.
- Primary navigation contains all five specified destinations; chapter navigation is homepage-only.
- Mobile dialog includes initial focus, Tab/Shift+Tab trapping, Escape close, body scroll lock/restore, focus restoration, and minimum 44 × 44px targets.
- Legacy subpages still receive the previous DefaultHeader, DefaultFooter, Garden atmosphere, CSS logo mark, and main wrapper.
- Cormorant and Newsreader are non-preloaded; removed font variables retain compatibility fallbacks for legacy consumers.
- No Conan file was modified.
- `tsconfig.tsbuildinfo` was already dirty at task start, was changed again by TypeScript tooling, and is explicitly excluded from staging.

## Commit

Subject: `feat: establish unified Cinema foundation`

This report is included in that Task 1 commit; the immutable SHA is provided in the handoff after commit creation.

## Concerns / follow-up

- In-app Browser keyboard/visual QA remains to be run by the controller because `iab` was unavailable here.
- `/diagnostic` still has the known legacy nested-main condition; it is intentionally not changed until its route family is migrated and enabled in Task 5.
- Next build reports the existing multiple-lockfile workspace-root warning and edge-runtime static-generation warning.
- `npm install` reports four dependency audit findings (1 low, 2 moderate, 1 high); no unrelated dependency remediation was attempted in this focused task.

---

## Reviewer fix pass — 2026-07-10

### Findings resolved

1. Restored Inter, Lora, and JetBrains Mono for disabled legacy routes without preloading them. Their Next font variable classes are passed from the server layout and applied only when `isUnified` is false. The legacy wrapper restores `--font-body`, `--font-serif`, `--font-mono`, and inherited body typography. Unified `/` retains only Be Vietnam Pro, Cormorant, and Newsreader classes.
2. Added `min-width: 44px` to `.mobileChapterNav a`, completing the 44 × 44px target contract.
3. Added the pure `resolveMenuKeyAction` helper and Node tests for Escape, Tab, Shift+Tab, first/middle/last/outside/empty/one-item cases. `MobileMenu` calls the helper against a fresh focusable-element list on every keydown.
4. Added `data-home-section` to the real `#mirror` section and locked every homepage chapter destination to an observable section contract.

### Reviewer-fix RED evidence

Command:

```text
npx tsx --test scripts/site-chrome-contract.test.ts scripts/mobile-menu-focus.test.ts
```

Observed RED:

- exit code `1`;
- 3 tests passed and 5 failed for the intended reasons;
- missing pure helper module;
- `#mirror` lacked `data-home-section`;
- `MobileMenu` did not call the helper;
- `.mobileChapterNav a` reported `min-width is 0px`;
- Inter/Lora/JetBrains and their isolated legacy wrapper contract were absent.

Self-review found one additional inheritance gap and added a failing contract before the fix:

```text
npx tsx --test scripts/site-chrome-contract.test.ts
```

- exit code `1`;
- 6 tests passed and 1 failed because the legacy wrapper had not yet applied `font-family: var(--font-body)`.

### Reviewer-fix GREEN evidence

Focused command:

```text
npx tsx --test scripts/site-chrome-contract.test.ts scripts/mobile-menu-focus.test.ts scripts/homepage-cinematic-contract.test.mjs
```

- exit code `0`;
- 23/23 tests passed.

Final verification:

```text
npm test
```

- exit code `0`;
- 33/33 tests passed.

```text
npx tsc --noEmit
```

- exit code `0`;
- no diagnostics.

```text
npm run build
```

- exit code `0`;
- production compilation and TypeScript passed;
- 38 static pages generated.

`git diff --check` passed with no whitespace errors.

### Export font isolation evidence

Fresh generated HTML inspection:

- `/`: body carries Be Vietnam Pro, Cormorant, and Newsreader variable classes; the unified shell carries no Inter/Lora/JetBrains class; one `<main>`.
- `/library`: legacy shell carries Inter, Lora, and JetBrains Mono variable classes.
- `/diagnostic`: legacy shell carries Inter, Lora, and JetBrains Mono variable classes; its known nested-main migration remains out of Task 1 scope.
- all inspected routes contain the same 14 Be Vietnam Pro preload entries; Inter/Lora/JetBrains are `preload:false` and absent from the preload manifest.

Mandatory in-app Browser QA remains assigned to the controller as requested; no Playwright fallback was used.

### Fix files

Created:

- `components/site-chrome/mobile-menu-focus.ts`
- `scripts/mobile-menu-focus.test.ts`

Modified:

- `app/layout.tsx`
- `components/home-cinema/HomeCinema.tsx`
- `components/site-chrome/MobileMenu.tsx`
- `components/site-chrome/SiteChrome.module.css`
- `components/site-chrome/SiteChrome.tsx`
- `scripts/homepage-cinematic-contract.test.mjs`
- `scripts/site-chrome-contract.test.ts`
- `package.json`

`tsconfig.tsbuildinfo` remains deliberately unstaged.

Fix commit subject: `fix: preserve legacy shell contracts` (immutable SHA reported in handoff).
