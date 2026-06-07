# Thongphan Full-Site Cinematic Pass QA

Date: 2026-05-24

Scope: global cinematic layer, scroll reveal behavior, scroll progress, Conan CTA correction, and key route smoke QA.

## Verified Commands

- `npm run build`: passed.
- `npm test`: passed, 2 tests passed.
- `curl -I -L --max-time 8 https://trial.conan.school`: failed to resolve.
- `curl -I -L --max-time 8 https://com.conan.school`: returned HTTP 200.

## Playwright Routes

Desktop viewport: `1440x1000`.

- `/`
- `/about`
- `/blog`
- `/library`
- `/diagnostic`
- `/challenges/brain2-21-ngay`
- `/chat`

Mobile viewport: `390x844`.

- `/blog`

## Results

- Console errors: `0` on all checked routes.
- Page errors: `0` on all checked routes.
- Horizontal overflow: `false` on all checked routes.
- `trial.conan.school` links in rendered checked routes: `0`.
- `com.conan.school` links present where Conan external CTA is needed.
- Scroll progress transform changes after scroll on scrollable routes.
- Hidden reveal elements in viewport after scroll: `0` on all checked routes after observer root-margin adjustment.
- Blog Brain2 filter: `1` visible card, `0` hidden cards.
- Diagnostic completed-result state: shows Conan Maker path, `0` Trial links, `2` Conan Maker links.

## Screenshots

- Home: `/tmp/thongphan-fullsite-qa/home-desktop.png`
- About: `/tmp/thongphan-fullsite-qa/about-desktop.png`
- Blog desktop: `/tmp/thongphan-fullsite-qa/blog-desktop.png`
- Blog mobile: `/tmp/thongphan-fullsite-qa/blog-mobile.png`
- Library: `/tmp/thongphan-fullsite-qa/library-desktop.png`
- Diagnostic initial: `/tmp/thongphan-fullsite-qa/diagnostic-desktop.png`
- Diagnostic result: `/tmp/thongphan-fullsite-qa/diagnostic-result.png`
- Challenge detail: `/tmp/thongphan-fullsite-qa/challenge-detail-desktop.png`
- Chat: `/tmp/thongphan-fullsite-qa/chat-desktop.png`
- Raw metrics: `/tmp/thongphan-fullsite-qa/results.json`

## Notes

- This pass does not claim the full website redesign goal is complete. It moves the entire site toward the cinematic direction by adding global motion/chrome and removing a dead external route.
- The visual depth is still strongest on the homepage. The next pass should give the diagnostic, blog/library detail pages, and challenge detail stronger 2.5D stage moments instead of only global reveal and grid atmosphere.
