# Thongphan.com Final Cinematic Site Pass QA

Date: 2026-05-24

## Scope

This pass upgrades the remaining public website surfaces so the homepage, conversion routes, reading routes, library routes, challenge routes, about page, and Brain2 chat feel like one cinematic 2.5D system.

Brain2 positioning used:

- Personal brand must build credibility, pull students toward Conan, and open advisory opportunities.
- Conan Maker is the current main offer; do not flatten it into generic AI or generic content training.
- Demand assets should attract people with expertise who are not yet visible, not yet scaled, or are producing generic AI output.
- `trial.conan.school` is not a valid CTA route in current checks; use `com.conan.school` / Conan Maker instead.

## User-Facing Changes

- `/about`: Added proof-stage hero with Thong Phan stage photo, proof console, and AI-native/Brain2/proof labels.
- `/blog`: Added reading compass hero for reader-state navigation.
- `/library`: Added public knowledge graph hero, graph nodes, and section rhythm.
- `/challenges`: Added 21-day activation lobby stage, fixed mobile stacking/readability.
- `/chat`: Fixed initial auto-scroll bug and added Brain2 context console. Chat now works in static export mode through client-side mock streaming when `NEXT_PUBLIC_CHAT_API_URL` is absent.
- `/`: Tightened mobile hero card so the opening card reveal remains first, while the headline begins inside the first viewport.
- Library content: Replaced public `Conan Trial` mentions with `Conan Maker`.

## Verification

Commands:

- `npm run build` passed.
- `npm test` passed: 2/2 tests.
- `rg -n "trial\\.conan\\.school|Conan Trial|Trial" app components content/blog content/library lib/blog-data.generated.ts lib/library-data.generated.ts` returned no matches.

Rendered QA:

- Playwright route checks: 20 checks passed across desktop `1440x1000` and mobile `390x844`.
- Routes checked: `/`, `/about`, `/blog`, `/blog/ai-khong-cuop-viec-ban`, `/library`, `/library/ban-do-xay-brain2-trong-21-ngay`, `/challenges`, `/challenges/brain2-21-ngay`, `/diagnostic`, `/chat`.
- Checks: no console errors, no page errors, no horizontal overflow, no hidden reveal elements in viewport, no `trial.conan.school` links, required stage elements visible.
- Interactions checked: blog Brain2 filter, library Brain2 search, diagnostic result state, chat mock streaming response.

Artifacts:

- Report: `/tmp/thongphan-final-site-qa/report.json`
- Screenshots: `/tmp/thongphan-final-site-qa/*.png`

## Notes

- Browser plugin was not available in this session, so Playwright was used.
- The black `N` badge in screenshots is the Next.js development indicator, not production UI.
- The repo had a dirty baseline before this work; code changes were verified but not committed as a single code commit.
