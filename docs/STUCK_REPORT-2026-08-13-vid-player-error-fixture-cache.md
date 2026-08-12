# STUCK REPORT — VID player error fixture cache

Date: 2026-08-13

## Scope

Task 5 browser QA for the Bunny player lifecycle in the local static artifact.

## Verified working state

- `node --test scripts/vid-watch-contract.test.mjs` passes 3/3, including the
  no-key/no-watch-later-player-URL lifecycle contract.
- `npm run lint` passes.
- `npm run build` passes with 88 static pages.
- The fixture QA reached the watch route and verified the stable player anchor,
  the same iframe DOM node after `Xem sau`, Player.js-delivered time advancement,
  persisted local progress and resume tolerance before this branch.

## Repeated blocker

The bounded provider-error QA branch needs a fresh Player.js script request.
Within the Chromium process that has already loaded the real fixture script,
Playwright route abort/fulfil rules do not cause Next's `Script` component to
emit its `onError` callback for the later error context. Both attempts timed out
after 30 seconds while waiting for the accessible bounded error alert:

1. a `playerjs` fixture `error` event did not surface the alert;
2. a fresh-context aborted Player.js script request also did not surface the
   alert, consistent with script/cache de-duplication inside the running browser.

## Decision

Stop retrying QA-fixture variations after the second repeated lifecycle blocker.
Do not claim `qa:vid` PASS and do not make the required Task 5 commit yet. The
production component contains the bounded `error` listener and script `onError`
path, and the source contract locks both; a fresh isolated-browser fixture or a
dedicated browser-process harness is required to close the runtime error branch.

No Bunny request, deployment, production request or network mutation occurred.

## Resolution — 2026-08-13

This blocker is resolved. The historical cache diagnosis above was disproved by
a diagnostic rerun in a fresh Chromium process:

- Playwright observed the Player.js request as resource type `script` and the
  route aborted it with `net::ERR_FAILED`.
- Next Script's `onError` path rendered the exact bounded Vietnamese alert in
  the DOM within one second.
- The timeout came from `getByRole('alert', { name: ... })`: this alert markup
  has no matching accessible name, so Playwright could not match it by `name`
  even though its visible text was correct.

The regression now locks `getByRole('alert').filter({ hasText: ... })`, and the
full `npm run qa:vid` command passes with `VID_VISUAL_QA=PASS`. No timeout was
increased and no cache, URL or player lifecycle behavior was changed.
