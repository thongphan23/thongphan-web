# Remotion Vertical Semantic Composition v2 - Production Release

Date: 2026-08-02

## Release identity

- Website branch: `agent/remotion-visual-semantic-frame-v1-20260731`
- Website source commit: `dfa736ad4bd3ee4628f1ced103372e58bcdd34b0`
- Plugin branch: `agent/director-core-v2`
- Plugin source/cache commit: `b1d73e725ccd217de8d8e8b16cdbed0f1780a889`
- Active plugin: `0.2.11-rc.1+codex.20260802010516`
- Preview deployment: `7b3e12c5-a276-4ad2-9635-5edf92c9f25f`
- Production deployment: `04a6a79d-cb2c-406f-ae26-b762d3217e94`
- Rollback deployment: `f3346e78-a820-4e72-a789-165c83043800`
- Owner-review URL: `https://thongphan.com/review/remotion-muc-dich-doi-song`

## Product result

Round 5 uses the supplied 59.652-second Vietnamese voice to produce three
single-film 9:16 videos with Soul, Forrest Gump and A Beautiful Mind. Vertical
planning is now independent from the horizontal choice: each timeline item
locks its source, trim, native source event, semantic carrier, identity,
subtitle zone and one of three stable frame modes before Remotion renders.

`cover_static` fills the portrait frame when the carrier remains readable.
`context_window` preserves the smallest horizontal evidence window needed for
an action or relationship. `contain_context` remains available when neither
crop can keep the mandatory proof. No mode invents a camera pan.

## Evidence result

| Film | Items | Encoded START/MID/END frames | Cover | Context window | Moving crop | Carrier failures |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Soul | 24 | 72 | 15 | 9 | 0 | 0 |
| Forrest Gump | 18 | 54 | 9 | 9 | 0 | 0 |
| A Beautiful Mind | 27 | 81 | 22 | 5 | 0 | 0 |
| **Total** | **69** | **207** | **46** | **23** | **0** | **0** |

Source preparation inspected 690 keyframes across 230 native events. Every
encoded frame is hash-bound to the Vertical Edit Plan. The pixel gate rejects
missing carriers, insufficient rendered scale, subtitle overlap, stale plan
evidence and unreviewed camera movement.

The Soul B07 sequence exposed and closed one real false-high before release. A
source trim crossed from a firetruck through motion blur to a different
character. Its scene score, about 0.186, was below the old 0.20 threshold. The
canonical detector now uses 0.16 with a regression test, and the final item is
a single-event close-up bound to `CHARACTER-22-SOUL`.

## Media

The local masters are 1080x1920 H.264/AAC. The published derivatives are
720x1280 H.264/AAC with `faststart`, posters and metadata-only preload. Each MP4
is between 9 and 12 MiB, below the Cloudflare Pages 25 MiB asset ceiling.

Master SHA-256 values:

- Soul: `f40af25812eff9fd2cf7074e9cdc463485b83ad0b183b69fbf072e43462c00b3`
- Forrest Gump: `816a6602462252a3c52cec34190fc6fabc8d8bc8f907524202529fa00b84d7c7`
- A Beautiful Mind: `907571812d647247aad807d8d7a213639bb80cd8a1713619da3242a21ac2a16e`

## Verification

- Plugin focused vertical suite: 33/33 passed.
- Plugin full regression: 907/907 passed.
- Plugin validator and source/cache checksum parity: passed.
- Canonical encoded-pixel audit: 69/69 timeline items passed.
- Review-page focused tests: 4/4 passed.
- Website full suite: 248/248 passed.
- TypeScript, ESLint and static 84-route build: passed.
- Local Playwright: 2 viewports and 30 media combinations passed.
- Preview Playwright: 2 viewports and 30 media combinations passed.
- Production Playwright: 2 viewports and 30 media combinations passed.
- Production `/review`: HTTP 302 to the canonical review page.
- Production page, Soul MP4 and owner evidence: HTTP 200.
- Protected `/tpr`: HTTP 401, `private, no-store`, noindex.

## Owner and Taste boundary

The release is ready for owner review, not automatically promoted Taste.
Feedback must resolve to the exact variant, beat, timeline item, source trim,
carrier ID, Edit Plan fingerprint and render hash. Technical PASS cannot claim
that all three films communicate or feel equally well.

## Rollback

Redeploy complete production deployment
`f3346e78-a820-4e72-a789-165c83043800`. Do not roll back only HTML while
leaving Round 5 media and evidence paths partially active.

