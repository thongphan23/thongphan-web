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

## Review correction — 2026-08-13

The selector resolution above closed only the provider-error branch. Review
correctly rejected the broader Task 5 PASS because live progress still changed
`startSeconds`, final checkpoints still passed through the five-second cadence,
and lifecycle QA used a parent-side fake Player/clock.

Those defects are now corrected. QA loads official Player.js read-only from
Bunny CDN and exercises its actual iframe `postMessage` client against an
iframe-side official `playerjs.MockAdapter`. An initial protocol run revealed a
separate load-order race (`ready=true`, zero observed listener registrations):
the iframe could mount before Player.js initialized. Mounting the iframe only
after `scriptReady` produced one initial seek and four stable provider-observed
listener registrations. Progress and `Xem sau` produced no re-seek or
re-registration, and forced `pause`, `ended` and `pagehide` checkpoints persisted
exact positions without duplicate writes.

The protocol fixture is deterministic evidence for lifecycle wiring, not proof
of real Bunny media playback. That public read-only runtime proof remains Task 6.
If the public Player.js GET fails, `qa:vid` records PARTIAL and exits non-zero;
it does not fall back to the retired parent fake.
