# Thongphan 2.5D Homepage Prototype QA

Date: 2026-05-24

Scope: homepage cinematic prototype only.

## Verified

- `npm run build`: passed.
- `npm test`: passed, 2 tests passed.
- Playwright visual QA against `http://127.0.0.1:3002/`: passed for desktop, mobile, and reduced-motion first viewport checks.

## Playwright Viewports

- Desktop: `1440x1000`
- Mobile: `390x844`
- Reduced motion mobile: `390x844`, `prefers-reduced-motion: reduce`

## Results

- Console errors: `0`
- Page errors: `0`
- Horizontal overflow: `false` on all checked viewports.
- Hero card visible in first viewport: `true` on all checked viewports.
- Portrait image loaded at natural size: `1365x2048`.
- Desktop proof chips visible: `6`, clipped visible chips: `0`.
- Mobile proof chips visible: `3`, clipped visible chips: `0`.
- Reduced-motion mobile proof chips visible: `3`, clipped visible chips: `0`.

## Screenshots

- Desktop first viewport: `/tmp/thongphan-2-5d-homepage-qa/desktop-first.png`
- Desktop scrolled: `/tmp/thongphan-2-5d-homepage-qa/desktop-scrolled.png`
- Mobile first viewport: `/tmp/thongphan-2-5d-homepage-qa/mobile-first.png`
- Mobile scrolled: `/tmp/thongphan-2-5d-homepage-qa/mobile-scrolled.png`
- Reduced-motion first viewport: `/tmp/thongphan-2-5d-homepage-qa/reduced-motion-first.png`
- Reduced-motion scrolled: `/tmp/thongphan-2-5d-homepage-qa/reduced-motion-scrolled.png`
- Raw metrics: `/tmp/thongphan-2-5d-homepage-qa/results.json`

## Notes

- This is a prototype implementation, not a production deployment.
- Mobile intentionally shows fewer proof chips than desktop to avoid clipped or crowded floating elements.
- Browser plugin was not available in this session, so QA used local Playwright.
