# Brain2 kickoff video — production release report

Date: 2026-07-16

## Goal

Restore the original kickoff video removed during the migration of the legacy
21-day Brain2 experience, preserve its source identity and integrate it into the
current Cinema visual system without changing protected Brain2 access or the
separate Conan Maker workstream.

## Released change

- Source commit: `12880bc`.
- Canonical route: `/brain2/21-ngay`.
- YouTube video ID: `ubsOey-hDyg`.
- Original label: `Buổi Kick-off Brain2 Challenge · Tháng 5/2026`.
- Real thumbnail: `https://img.youtube.com/vi/ubsOey-hDyg/maxresdefault.jpg`.
- Both the editorial action and poster use safe external-link attributes.
- The section stacks to one column on mobile and disables its transitions under
  reduced motion.

## Verification before deployment

- Focused Brain2 route contract: 7/7 passed.
- Full suite: 242/242 passed.
- Brain2 release suite: 143/143 passed.
- Release gate passed: lint, build contracts, SEO 4/4, bundle budgets 3/3 and
  Brain2 safety/release tests.
- Static build passed with 82/82 routes.
- Desktop `1440×900` and mobile `390×844` browser QA passed with a loaded natural
  thumbnail, no horizontal overflow and no content collision.
- YouTube watch URL and thumbnail returned HTTP 200.
- Four unrelated untracked Conan Maker assets were removed only from the release
  artifact and remained untouched in the workspace.
- Clean artifact manifest SHA-256:
  `450c6e8381cd14c46bab6c2c26538e7a395233cb61ea3c95089bfa728c6403a2`.

## Deployment record

- Previous production / rollback:
  `3bc101dc-4c23-4c3b-9b4b-5afe46a6e2d8`.
- Preview deployment:
  `e36e4d04-58b9-4be4-bb5d-745c86ead1a9`.
- Preview URL: `https://e36e4d04.thongphan-com.pages.dev`.
- Production deployment:
  `350ecbc7-9eec-4661-8451-2b129577b97c`.
- Production origin: `https://350ecbc7.thongphan-com.pages.dev`.
- Public URL: `https://thongphan.com/brain2/21-ngay`.
- Brain2 hub HTML SHA-256:
  `9f065cec85149ac38e14bfc4c31ffc080eb288b5259c98b0a02e39628f57d047`.

## Production smoke

The production origin, apex and `www` returned the same Brain2 hub HTML hash and
the exact kickoff URL, label and thumbnail. On all three surfaces:

- homepage, About, Library, Experiences, Diagnostic, the Brain2 hub, Day 01 and
  Conan Maker returned HTTP 200;
- `/challenges` preserved HTTP 301;
- disabled `/learn` preserved HTTP 404;
- all four excluded Conan Maker asset URLs returned HTTP 404.

## Result

Passed — the verified artifact is live on the production origin, apex and `www`;
the prior production deployment remains available as the documented rollback.
