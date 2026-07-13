# Brain2 Content Restoration + Cinematic Learning Studio v2

Date: 2026-07-13
Status: awaiting written-spec and visual-target approval

## Goal

Restore the complete useful substance and program identity of the legacy 21-day
Brain2 experience at `thongphan.com/brain2/21-ngay`, then redesign the hub and lesson
reader as a cinematic, human-led learning studio rather than a static marketing page
or flattened article archive.

The release succeeds only when every source section and lesson block is accounted for,
the real kickoff video is visible, no useful content disappears because one sentence
is stale, and the primary learning action is clear in the first viewport on desktop
and mobile.

## Fixed boundaries

- Restore only the 21-day program and the context required to understand and complete
  it.
- Keep Brain2 Chat excluded. Do not restore the old chat CTA, app access, client-side
  passcode or standalone private Brain2 surface.
- Keep days 01–07 public and days 08–21 protected by the existing Conan Maker Worker.
  Protected packages remain outside the public repository and static export.
- Do not restore the old public Reflection Wall or its API. Reflection becomes a local
  or explicitly private learner action until a separate privacy design is approved.
- Do not silently restore expired Zalo, Zoom, hashtag, calendar, price or campaign
  claims. Replace each stale operational sentence with a current truthful action while
  preserving the surrounding instructional content.
- Do not promise daily email delivery while the Brevo sender is undeployed. The UI
  either activates a verified sender first or presents a truthful non-email start path.
- Use real source media and generated raster assets when needed. No CSS art, handmade
  SVG stand-ins, emoji-led visual hierarchy or generic placeholder imagery.

## Diagnosis and source of truth

Authoritative legacy inputs are the private snapshot at
`/Users/rio/Private/thongphan-brain2-legacy-2026-07-12` and the current protected
package directory at `/Users/rio/Private/thongphan-brain2-21`.

The current pipeline creates all 21 packages and retains 60 of 65 inventoried external
source links, but it has two fidelity gaps:

1. The migration reads `DAY_CONTENT` from `script.js`; it does not migrate the hub
   chapters in `index.html`. The canonical hub therefore omits the guide introduction,
   program explanation, kickoff video and richer Conan/program context.
2. Editorial omission rules run at whole text-unit or block boundaries. A useful block
   can disappear when only one sentence contains an expired campaign marker. A
   differential eight-token-window audit found 22 source units without exact output
   parity; each requires explicit classification rather than blanket deletion.

The old kickoff asset is real and must be restored from its source identity:

- YouTube video ID: `ubsOey-hDyg`
- label: `Buổi Kick-off Brain2 Challenge · Tháng 5/2026`
- source thumbnail: `https://img.youtube.com/vi/ubsOey-hDyg/maxresdefault.jpg`

The date remains provenance, not a current campaign claim.

## Content parity architecture

### 1. Hub ledger

Create a tracked, body-safe manifest for every legacy hub section with exactly one
decision:

- `restore`: current and useful as authored;
- `update`: useful concept with obsolete operational copy replaced;
- `replace`: same learner job served through a safer current component;
- `exclude`: outside scope or unsafe, with a required reason.

Required decisions:

| Legacy chapter | Decision |
| --- | --- |
| Hero | update into the selected learning-studio visual target |
| Người hướng dẫn — Thông Phan | restore with current verified copy and real image |
| Thử thách là gì | update; remove the unverified 15-minute/daily-email promise |
| Kickoff video | restore using the real YouTube identity and a real thumbnail |
| Lộ trình 21 ngày | restore through the current 21-day data model |
| Conan School & Conan Maker | update into a clear days 08–21 access handoff |
| Zalo join section | replace with the current truthful participation path |
| Brain2 Chat | exclude by owner decision |
| Reflection Wall | exclude; replace with private/local reflection guidance only |

### 2. Lesson ledger

Generate a deterministic parity report for days 01–21. For every source unit, record:

- day and stable source-unit ID;
- source hash and source type;
- decision and reason;
- destination block ID and rendered block type;
- source and destination external-link sets;
- whether copy was rewritten, with the rewrite class;
- public/protected storage boundary.

The report stores no protected body text. Protected rows use hashes, counts, decision
codes and destination IDs only.

The release gate fails when:

- a source unit has no decision;
- a retained/updated unit has no destination block;
- a block disappears only because it contains one stale sentence;
- a source link disappears without an approved exclusion reason;
- a protected body enters Git, `.next`, `out`, a source map or a public Worker bundle.

### 3. Surgical normalization

Replace whole-block omission with sentence/child-level transforms. Split mixed units
before applying rules. Preserve the useful instruction and replace only the unsafe or
expired fragment.

Examples:

- `Đăng screenshot lên Zalo #ngay3` becomes a private evidence checkpoint such as
  `Lưu một ảnh chụp kết quả vào thư mục bằng chứng của bạn`.
- An Antigravity-specific step becomes a tool-neutral AI instruction while retaining
  its prompt and expected output.
- A local machine path becomes a relative example path, not a removed explanation.
- Dynamic price/free claims are omitted without deleting the surrounding resource
  description.

## Rich lesson contract

Extend the typed lesson schema only where it restores source meaning or improves the
learning action. Supported blocks become:

- `prose`: narrative and explanation;
- `steps`: ordered action with reason and observable completion;
- `prompt`: copyable working document;
- `resource`: real link with thumbnail, source and why it matters;
- `video`: YouTube identity, thumbnail, duration/provenance and transcript/summary
  status;
- `figure`: real screenshot or generated educational visual with caption/credit;
- `example`: expected output without pretending it is the learner's data;
- `checkpoint`: private/local evidence and completion state;
- `callout`: warning, principle or bounded tool note;
- `deliverable`: final artifact for the day;
- `reflection`: private prompt, never a public wall by default.

Every block has a stable ID. Media requires explicit source/provenance, safe alt text,
dimensions and crop behavior. External links remain HTTPS-only.

## Product flow

### Hub

The first viewport answers four questions without scrolling:

1. What will I build in 21 days?
2. Who is guiding me?
3. Can I begin free now?
4. Where is the kickoff explanation?

Primary action: start or resume the next available day.
Secondary action: watch kickoff.
Supporting action: understand Conan Maker access for days 08–21.

The hub includes, in order:

1. learning-studio hero with real program evidence;
2. compact guide/program contract;
3. real kickoff film chapter;
4. transformation and 21-day map;
5. clear public/protected access split;
6. truthful participation method;
7. final start/resume action.

### Public lesson

The first viewport contains the day title, one-sentence outcome, time, progress and
the first meaningful action. The masthead may not consume the complete viewport.

The body alternates explanation with action, source media and observable checkpoints.
The learner can copy prompts, check tasks and continue without losing reading position.

### Protected lesson

The locked state presents the access action in the first mobile viewport. It explains
where an existing member gets the code and what a non-member should do. Metadata may
preview the outcome, but protected body content remains absent until server validation.

## Visual directions to explore

All directions preserve the existing Cinema identity, oxblood accent, warm paper
reader and real evidence. They differ in hierarchy and learning model.

### A. Documentary Control Room — recommended

A dark evidence-led hub with a real kickoff film frame, guide presence, physical
artifacts and a clear current-day console. Lessons open into warm editorial sheets with
compact progress rails and field-note annotations. Motion resembles projector light,
film transport and focus changes, never decorative floating UI.

Best balance of Thông Phan identity, Cinema continuity, trust and actionable learning.

### B. Editorial Field Manual

The hub behaves like a premium printed curriculum laid open on a dark desk. The map,
artifacts, kickoff and progress read like annotated dossier spreads. Lessons prioritize
maximum readability, marginal notes and printable/copyable templates.

Strongest for long-form learning, but less cinematic and emotionally immediate.

### C. Human-led Screening Room

The guide and kickoff footage dominate the opening. The learner enters through a
sequence of short film chapters, then moves into focused workshop sheets. Progress is
expressed as scenes completed rather than dashboard metrics.

Strongest emotional connection and motion potential, but depends on a sufficient set
of real photos/video frames and must avoid feeling like a course-sales page.

Exactly three desktop hub mockups at `1440×1024` will be generated from current
production screenshots. The selected mock becomes the visual target before coding.

## Motion and accessibility

- Pinned navigation stays available without covering the hero or lesson title.
- Motion uses opacity, transform, clip and light only; no layout-shifting entrance.
- The stable first frame remains readable before JavaScript and during animation.
- `prefers-reduced-motion` removes projector sweeps, parallax and stagger while keeping
  all content and state visible.
- Dark surfaces meet readable contrast; secondary copy may not rely on low-opacity gray.
- Keyboard users can reach kickoff, start/resume, prompt copy, completion and access
  controls in visual order.
- Completion, access and copied states use text in addition to color/motion.
- Mobile at `320×568` and `390×844` shows the primary action in the first viewport.

## Data flow and boundaries

```text
private legacy snapshot
  -> source-unit extractor
  -> parity ledger + surgical transforms
  -> typed public/protected lesson packages
  -> public Git packages (01–07) / private KV packages (08–21)
  -> shared validated renderer
  -> desktop/mobile/reduced-motion QA
```

Hub media metadata may be public. Protected lesson body, protected examples and
protected prompts remain private. The access Worker, rate limiting, signed cookie,
KV namespace and `no-store` behavior stay unchanged unless a failing regression test
requires a scoped fix.

## Error handling

- Missing source media produces a visible source-unavailable state in development and
  fails the release gate; it never silently renders a generic placeholder.
- A dead external resource is marked unavailable or replaced through an explicit
  ledger decision.
- If kickoff playback is blocked, the thumbnail remains and opens the canonical
  YouTube URL in a new tab.
- A protected-content failure keeps the locked/error state and never falls back to
  bundled private text.
- Progress storage failure never blocks reading or completing the lesson.
- Email remains absent or honestly labeled until provider health and controlled smoke
  pass.

## Verification

### Content

- 100% hub sections classified.
- 100% source lesson units classified for 21/21 days.
- Zero unreasoned unit/link loss.
- Kickoff ID, canonical URL, thumbnail and visible label verified.
- Public package bytes and private KV readback match the approved parity ledger.
- Brain2 Chat and public Reflection Wall remain absent.

### UI and interaction

- Hub, day 01, day 07, day 08 locked/authorized and day 21 authorized at desktop,
  tablet, `390×844` and `320×568`.
- Normal and reduced motion.
- Keyboard path and modal focus containment.
- No crop, overlap, overflow, broken media or hidden first-frame text.
- Primary action is visible in the first viewport on hub, public and locked lesson.
- Comparison screenshots use the selected mock at the same viewport and state.

### Safety and release

- Main and Brain2 suites, lint, frontend/Worker TypeScript and static build pass.
- Strict private fingerprint scan includes Git, build, source maps and Worker bundles.
- Preview leak and visual QA pass before production.
- Production readback covers canonical hub, public lesson, access `401→204→200`,
  kickoff link, legacy redirect and email truthfulness.

## Non-goals

- Restoring or exposing Brain2 Chat.
- Recreating the old passcode/client app.
- Reopening the public reflection database.
- Building a full learning-management system, account dashboard, billing or cross-device
  identity in this slice.
- Restoring obsolete campaign operations verbatim.
- Redesigning unrelated thongphan.com routes.

## Acceptance criteria

1. A tracked, deterministic hub and 21-day parity ledger accounts for every source
   unit and link without exposing protected text.
2. Useful mixed blocks survive surgical removal/rewrite of stale campaign fragments.
3. The canonical hub visibly restores the real kickoff and guide/program context.
4. All 21 lesson packages render the complete approved content with richer typed
   structure; days 08–21 remain server-protected.
5. Hub and lessons implement the user-selected visual mock, not an improvised fourth
   direction.
6. The first meaningful action is visible without scrolling on desktop and mobile.
7. The daily-email claim is absent until verified delivery is live.
8. Visual, interaction, accessibility, content-parity, leak, build and production
   gates pass with recorded evidence.
