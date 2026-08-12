# VID · Thông Phan — Production release report

**Released:** 2026-08-12  
**Verdict:** `PASS_PRODUCTION`  
**Public URL:** <https://vid.thongphan.com>

## Released product

The standalone Thong Phan screening room is live with a YouTube-familiar
catalog, search, topics, playlists, local continue/watch-later state, a Bunny
Stream watch surface, source attribution, VideoObject metadata and sitemap. The
first published item is the completed Vietnamese version of “This NEW Claude
Prompting Technique is blowing people's minds (gauntlet-loop)”.

This release is isolated from the main `thongphan.com` Pages production branch
and from the parallel Learn work. The main-site navigation source is ready, but
the main Pages production was intentionally not overwritten during this cutover.

## Immutable release evidence

| Surface | Evidence |
|---|---|
| Source commit | `fc3d7f4` — production shell/runtime hardening |
| Pages deployment | `6e11cd9a-4a14-4534-b70b-6eab7c4e0a6e` |
| Pages immutable origin | `https://6e11cd9a.thongphan-com.pages.dev` |
| Static artifact SHA-256 | `3624e4fd51c6e807e30cbe4d6a5069410df11a3c22e1930da4985cd7a7205f40` |
| Home HTML SHA-256 | `ea7ba5e0176867b05504af5393d91b9c0955d8740690e694fa8ac310f373070c` on local, Pages and production |
| Production D1 | `thongphan-vid` · `cfcb0914-6d71-4c3d-bd02-d7e1fe9d8997` |
| Preview D1 | `thongphan-vid-preview` · `f7ef9fb7-0988-4bf5-a611-79beb61c9ef4` |
| Active Worker version | `e9fedb7c-e756-4418-aa26-a15a64afc980` · 100% traffic |
| Deployment ID | `3f64a6c4-7b90-492a-a179-2d0cef5be750` |
| Rollback Worker version | `40d42cab-7217-448d-997e-985aebdc6f11` |
| Active preview version | `d956f0e3-f7cc-41fa-aaae-62732d29488b` |
| Bunny library | `726519` · CDN `vz-1fb1e85d-0d0.b-cdn.net` |
| Bunny video GUID | `3c5ae7cc-54d1-4d45-830e-56a784a70e47` |

## Secret and lifecycle evidence

Secrets live only in macOS Keychain and Cloudflare secret bindings. The API key
was rotated during the release after a value appeared in diagnostic output; the
old key is invalid, the new key is installed on preview and production, and the
clipboard was cleared.

| Binding | Keychain fingerprint prefix | Live proof |
|---|---:|---|
| `BUNNY_STREAM_API_KEY` | `e82b0ceb9cca` | Bunny metadata HTTP 200, duration 809 |
| `BUNNY_WEBHOOK_SECRET` | `3419fb516262` | signed webhook v1 HTTP 204 |
| `VID_ADMIN_HMAC_SECRET` | `4cbefc2c087f` | signed admin status HTTP 200 |

Bunny webhook is configured to
`https://vid.thongphan.com/api/webhooks/bunny`. Production catalog state is
`published / ready`; the public DTO does not expose the private rights note.

## Verification

- Focused VID tests: `42/42` pass.
- Full repository tests: `500/500` pass.
- App and Worker TypeScript: pass; lint: zero warnings.
- Next.js static build: `88/88` pages; bundle checks: `3/3`.
- Secret-integrity scan, Wrangler dry-run and diff check: pass.
- Rendered QA: desktop 1440/1280, tablet 1024, mobile 390/320, search, watch,
  player hit target, API error, keyboard and reduced motion: pass.
- Production route smoke: health, catalog, home, search, library, watch, robots
  and sitemap all HTTP 200.
- Chrome production inspection: one VID shell, no duplicate site chrome, no
  horizontal overflow, no broken image, no React error overlay; search and watch
  journeys complete with real Bunny media and original-source links.

## Operational note

The Bunny account currently displays trial credit and a 14-day trial window.
This does not block the release today, but billing/credit status must remain
valid for future uploads and delivery. The production Worker rollback version
above retains the final valid secret set.
