# thongphan.com — Origin Story + 21 ngày Brain2

Date: 2026-07-12
Status: Approved direction, awaiting written-spec review

## Goal

Make visitors understand why Thông Phan builds systems, not merely what he sells,
then let them enter one concrete system: the 21-day Brain2 practice. The personal
story must create earned trust; the challenge must turn that trust into a useful,
repeatable action.

The release consolidates the public 21-day challenge currently hosted at
`brain2.thongphan.com` into the unified thongphan.com experience. It does not expose,
embed or modify Thông Phan's private Brain2 vault, personal Brain2 chat, or the
separate Brain2 application prototype.

## Product thesis

The story and the challenge are one causal sequence:

1. Thông learned that difference can create attention.
2. He also learned that attention cannot rescue a weak core product.
3. The resulting debt and long recovery changed how he builds.
4. Later content failures taught him to treat failed attempts as data.
5. Brain2 became the system for retaining those lessons, connecting them and turning
   them into better decisions and useful outputs.
6. The 21-day challenge gives visitors a small version of that practice for their own
   expertise.

Brain2 is therefore not presented as a productivity app, an AI chatbot, or a magic
vault. It is the visible consequence of a life that could no longer afford to waste
hard-earned lessons.

## Approved decisions

- Use the full narrative arc: difference → success → collapse → rebuilding → system.
- State the Hoa Sơn Tửu Lầu consequence plainly: the business was transferred, it
  left more than VND 2 billion of debt, and the recovery took close to ten years.
- Tell this without pity, spectacle or a redemption-guru posture.
- Canonical challenge URL: `/brain2/21-ngay`.
- Canonical lesson URLs: `/brain2/21-ngay/ngay-01` through
  `/brain2/21-ngay/ngay-21`.
- Week 1 is public. Weeks 2 and 3 are for Conan Maker and are protected server-side.
- Do not ship a passcode, protected lesson or private Brain2 material in public HTML,
  JavaScript, JSON, source maps or static assets.
- The `thongphan-web` repository is public. Days 08–21 may not be committed to that
  repository in source or generated form.
- `brain2.thongphan.com` becomes a redirect-only legacy surface only after canonical
  production parity passes.
- Do not touch the private Brain2 chat/vault application in this release.

## Current-state diagnosis

### Legacy Brain2 challenge

The current `brain2.thongphan.com` page contains valuable source material:

- 21 populated daily lesson objects;
- a three-week roadmap;
- prompt-copy actions and task instructions;
- a signup flow;
- a kickoff-video link;
- a reflection form and public wall;
- a week 2/3 access gate.

It is not suitable as the final public experience:

- the purple/gold AI-landing visual system conflicts with Unified Cinema;
- the page carries campaign-specific and time-sensitive May 2026/workshop language;
- mobile currently overflows horizontally;
- the shared passcode is readable in client JavaScript;
- unmoderated reflection data includes test/spam content;
- the page uses a second navigation, signup implementation and visual identity;
- several figures and tool references have drifted across sources.

### Existing main-site challenge

`/challenges/brain2-21-ngay` already has the unified header, editorial palette,
an active challenge record and a working main-site signup contract. It is a useful
visual and infrastructure foundation, but currently contains only the marketing
shell. None of the 21 complete daily lessons is available there.

### Separate Brain2 products

Local Brain2 chat/vault/application repositories are separate products. Their auth,
vault, import, chat, dashboard, payment and private-data concerns are explicitly
outside this consolidation.

## Scope

### 1. Compact homepage origin bridge

The homepage receives one compact origin bridge inside the existing proof chapter,
not a new full-height act. It must fit within a short-laptop viewport and must not
make the visitor scroll through the full biography.

The bridge contains:

- one real archival image or press artifact;
- one causal line, not a résumé claim: `Thắng sự chú ý. Thua sản phẩm cốt lõi.`;
- one consequence line: `Hơn 2 tỷ nợ và gần 10 năm làm lại.`;
- one present-day line: `Brain2 bắt đầu từ quyết định không bỏ phí bài học đó.`;
- one action: `Đọc câu chuyện thật` → `/about`.

The existing homepage chapter navigation and act numbering remain stable. The bridge
is part of ACT 03, so it adds meaning without lengthening the primary navigation.

### 2. Full `/about` origin film

Replace the current three-card biography summary with a five-act narrative. Existing
portrait, principle and sourced proof remain, but serve the story rather than sit as
separate dossier sections.

#### Act 1 — Dám khác biệt

- 2015, Hoa Sơn Tửu Lầu and the decision to build a distinctly different experience.
- Nine months of losses, sleeping on arranged restaurant tables and eating with the
  staff.
- Emotional purpose: show hunger and conviction, not nostalgia.

#### Act 2 — Khi sự chú ý mở cửa

- Press attention and public recognition changed the business trajectory.
- Difference created opportunities, relationships and confidence.
- Emotional purpose: let the rise feel real enough that the later mistake matters.

#### Act 3 — Thắng truyền thông, thua sản phẩm

- The experience was memorable, but the food/product core was not strong enough for
  repeat demand.
- The business was transferred, leaving more than VND 2 billion of debt and a recovery
  lasting close to ten years.
- The number is presented once, as consequence, never enlarged into clickbait.
- Core lesson: communication can open the door; only substance keeps it open.

#### Act 4 — Học lại bằng những lần flop

- Fourteen months of content experiments and early posts with almost no response.
- Failed work becomes market data; eventually the work produces repeatable patterns,
  meaningful sharing and stronger trust.
- Core lesson: do not discard failure before extracting the pattern.

#### Act 5 — Không bỏ phí thêm một bài học nào

- Brain2 appears as the operating response to the previous acts: capture, connect,
  retrieve and apply lived knowledge.
- Conan appears as the environment for turning systems into repeated real work.
- Primary action: `Bắt đầu 21 ngày Brain2` → `/brain2/21-ngay`.
- Secondary action: `Xem nguồn và bằng chứng` → the existing public proof note.

### 3. Canonical 21-day challenge hub

`/brain2/21-ngay` replaces the existing campaign landing page and the duplicated
challenge-detail shell. It contains:

- a concise promise tied to visitor expertise, not note-taking enthusiasm;
- a real before/after state;
- the three-week map;
- current access labels for every day;
- a truthful progress summary stored locally for the current browser;
- signup using the existing canonical main-site API contract;
- a clear Week 1 public / Week 2–3 Conan Maker boundary;
- contextual links to the Brain2 article, `/about`, diagnostic and Conan Maker;
- no workshop-is-live banner, stale campaign date or generic AI-chat CTA.

`/brain2` is not a separate product hub in this release. It is a permanent shortcut
to `/brain2/21-ngay`, preventing the URL from implying access to a broader Brain2 app.

### 4. Daily lesson experience

Each lesson route renders one focused learning document with the same stable contract:

1. day/week/access metadata;
2. the reason this day matters;
3. one primary objective;
4. the minimum tasks for the day;
5. prompts or templates with explicit copy controls;
6. optional sources/resources;
7. an observable deliverable;
8. a completion checklist;
9. previous/next navigation;
10. a contextual handoff at week boundaries.

The interface uses a calm paper-light reading surface inside the shared Cinema shell.
The user should feel that they opened a working notebook from the same world, not a
separate learning-management system.

### 5. Access boundary

#### Public content

- hub, syllabus and access descriptions;
- days 01–07 in full;
- title, objective and short preview for days 08–21;
- public Brain2 articles and sourced story material.

#### Protected content

- full instructions, prompts, templates, resources and deliverables for days 08–21.

Protected bytes are stored behind a Pages Function/API boundary. A static locked-day
shell may render public metadata, but the protected body is never emitted at build
time.

Version 1 uses a server-validated Conan Maker access code:

- Cloudflare stores `BRAIN2_ACCESS_CODE_HASH` and a separate
  `BRAIN2_SESSION_SECRET`; the raw access code is absent from repo/config/client code;
- submission is rate-limited and validated server-side;
- failed attempts are limited per privacy-preserving client key to five per ten
  minutes;
- success issues a signed, `HttpOnly`, `Secure`, `SameSite=Lax` cookie;
- the cookie contains no private Brain2 data and expires after 30 days;
- protected lesson APIs fail closed when configuration, signature or membership
  validation is unavailable;
- code rotation invalidates new sessions without requiring a frontend rebuild.

The code is a lightweight entitlement gate, not Conan SSO. Per-member identity,
payment and Conan account integration remain future work.

### 6. Progress and completion

- Public and authorized visitors can mark lessons complete.
- Progress uses a versioned local-storage record containing day numbers and timestamps,
  no name, email or private note content.
- The hub exposes `Tiếp tục ngày …` when progress exists.
- Locked lessons cannot be marked complete until protected content has loaded.
- Clearing browser storage only clears local progress; it never affects membership.
- No streak pressure, fake scarcity or shame language is used.

### 7. Signup and email continuity

- Reuse `/api/signup` and the active `brain2-21-ngay` challenge record.
- Do not migrate the legacy Brevo-specific function or expose its secrets.
- Update email content and canonical links from `brain2.thongphan.com` to the new day
  routes before redirecting the legacy domain.
- Preserve unsubscribe behavior and existing signup deduplication.
- A production test signup may use only an explicitly controlled QA address; automated
  tests use fixtures and may not enqueue real email.

### 8. Reflection handling

The legacy reflection form and wall are not shipped in this release.

- Capture a private provenance snapshot before retirement.
- Test, spam and unverified entries are excluded from public rendering.
- Keep lesson reflection exercises as private work performed by the learner; do not
  collect or display their answers on thongphan.com.
- A future moderated reflection feature requires a separate privacy and moderation
  design.

## Content architecture

Do not hand-copy large HTML template strings into React components. Build a migration
pipeline similar in discipline to Read:

```text
legacy index.html + script.js
        ↓ snapshot + SHA-256
extractor / normalizer
        ├─ days 01–07 → public repo content packages
        └─ days 08–21 → gitignored private staging directory
                              ↓ validate + checksum
                         private R2 content objects
        ↓
tracked public manifest + protected metadata/checksum manifest
        ↓
static public pages + authenticated Pages Function/R2 response
```

The private staging directory is supplied through `BRAIN2_PRIVATE_CONTENT_DIR`, must
resolve outside the public repository, and is never uploaded as a build artifact. The
canonical protected objects are versioned JSON documents in a private R2 bucket bound
only to the lesson Pages Function. The public repository tracks their schema, day/title
metadata and checksums, not their body, prompts, templates or resource notes.

Automated tests use synthetic protected fixtures. They never copy real days 08–21
into the repository or CI artifacts.

Every lesson package includes:

- schema version;
- day, week and access tier;
- title, promise, estimated duration and deliverable;
- structured body blocks;
- copyable prompts/templates;
- external resource records;
- legacy-source checksum and migration timestamp;
- editorial-review state;
- protected/public classification.

The extractor must prove 21/21 source lessons were found. The validator must reject
duplicate days, missing required fields, unknown block types, unsafe HTML, public
protected content and stale banned strings.

## Editorial normalization

Migration preserves the instructional substance but not stale campaign language.

Required normalization includes:

- remove the May 2026 launch label and live-workshop banner;
- remove the Zoom QR and expired real-time urgency;
- replace embedded client passcodes with the server access flow;
- change old-domain links to canonical routes;
- replace Antigravity-only instructions with tool-neutral `trợ lý AI` language or a
  currently supported named tool when the lesson truly depends on it;
- reconcile note counts, dates, Conan naming and other changing claims against a
  release manifest;
- replace English-heavy instruction where natural Vietnamese is clearer;
- use `tui` for Thông and `bạn` for the visitor across public website copy;
- preserve externally sourced resource titles/URLs but verify every link before release.

The 21 lessons are not silently rewritten into a different curriculum. Material
pedagogical changes require a content-diff report in the release evidence.

## Visual system

### Origin story

- Dark Cinema acts with warm paper intertitles and restrained red lacquer accents.
- Real photographs, press captures, handwritten records and system artifacts lead.
- No AI-generated image may impersonate a real event from Thông's life.
- If a period lacks a usable photograph, use typography, dates and a truthful artifact
  rather than fabricate a scene.
- Images use focal metadata; faces may not be cropped at supported breakpoints.
- Motion behaves like a film edit: cut, dissolve, light sweep and contact-sheet drift.
  No scroll hijacking or long sticky trap.

### Challenge hub

- Dark editorial opening with the 21-day map as the primary interactive object.
- Avoid generic purple AI gradients, emoji decoration, glowing pill soup and nested
  SaaS cards.
- Week states are expressed through paper tabs, stamped access marks and progress
  notation rather than color alone.

### Lesson reader

- Warm paper background, ink text, lacquer links and mono operational labels.
- Body measure stays approximately 65–72 characters on desktop.
- Prompts appear as copyable working documents, not terminal cosplay.
- Motion is minimal and stops under reduced motion.
- Mobile is recomposed as a single reading column; desktop grids may not simply shrink.

## Navigation and journey wiring

- Add `21 ngày Brain2` to primary/mobile navigation without removing Câu chuyện,
  Thư viện, Chẩn đoán or Conan Maker.
- Update all challenge, blog, library, chat and handoff references from
  `/challenges/brain2-21-ngay` to `/brain2/21-ngay`.
- `/challenges/brain2-21-ngay` permanently redirects to `/brain2/21-ngay`.
- `/brain2` permanently redirects to `/brain2/21-ngay`.
- The generic `/challenges` index may remain for future practice programs, but it must
  point to the canonical Brain2 URL and must not host a duplicate detail page.
- About ends at Brain2; day 07 ends at the Conan Maker access decision; day 21 ends at
  a reflective completion and Conan Maker continuation.

## Legacy-domain migration

Because `brain2.thongphan.com` has been public and appears in campaign/email links, it
is not retired like the unpublished Read subdomain.

Release order:

1. snapshot legacy source, API-visible public data and current production HTML;
2. migrate and validate all 21 lessons locally;
3. deploy canonical routes as noindex preview;
4. run content parity, access, visual, signup and production smoke;
5. make canonical routes indexable and update sitemap/email links;
6. replace the legacy frontend with a redirect-only Worker/domain rule;
7. verify root, query strings and known campaign links reach `/brain2/21-ngay`;
8. retain source and rollback metadata locally.

The legacy origin must not serve a second copy after release. Do not delete its source
or Cloudflare rollback reference until the canonical release and redirect have passed.

## Claims and asset provenance

Create a typed story evidence manifest. Every public claim has:

- claim text and category;
- source type (`personal account`, `owned archive`, `public press`, `system record`);
- source location;
- public-source link when one exists;
- review date;
- display permission;
- caption and image focal metadata where relevant.

The debt figure is an approved first-person account, not presented as third-party
audited data. Changing operational figures such as note count, shares, membership or
revenue never render from prose without passing the release manifest.

## SEO and structured data

- `/about`: canonical `AboutPage` plus the existing truthful `Person` identity.
- `/brain2/21-ngay`: canonical `Course`/`LearningResource` and an `ItemList` of 21 days.
- Public lessons: canonical `LearningResource` with previous/next links.
- Protected lesson shells: `noindex, follow` until their full public indexing policy is
  deliberately changed.
- Sitemap contains the hub and public lessons only.
- Redirects are tested for exact status/location and canonical loops.
- Metadata never claims access to Thông's private Brain2 or an AI trained on the whole
  private vault.

## Accessibility

- One H1 and one main landmark per page.
- Timeline/day navigation is usable by keyboard and screen reader.
- Access state is expressed in text, not color alone.
- Dialog/gate behavior traps focus, closes with Escape and restores focus.
- Copy buttons announce success without moving focus.
- Completion controls expose checked state semantically.
- All targets meet the existing 44px mobile target contract.
- Reduced motion disables parallax, automatic rail movement and decorative reveals.
- Lessons remain readable with JavaScript disabled when the lesson is public.

## Security and privacy

- No private Brain2 note, embedding, chat, vault path or personal secret enters the
  public repo or build output.
- Protected lesson content never enters the public Git index, CI artifact, static
  output, source map or unauthenticated API response.
- Access endpoints validate method, origin/content type, payload shape and rate limits.
- Access cookie signatures use a secret unavailable to client code.
- Error responses do not reveal whether a particular Conan member exists.
- Reflection input is escaped/sanitized and never auto-published.
- Signup and reflection endpoints retain only the data required by their stated use.
- Logs and QA screenshots must not expose email addresses, access codes or cookies.

## Performance budget

- No new general animation framework, LMS dependency, WebGL or background video.
- Reuse the existing motion system and static-export architecture.
- Public lesson body stays server-rendered/static and readable without hydration.
- Protected lesson JavaScript is route-scoped.
- The hub's initial route JavaScript target is at most 65KB gzip excluding shared shell.
- Public lesson route-specific JavaScript target is at most 45KB gzip.
- No page introduces horizontal overflow or cumulative layout shift above 0.1.

## Analytics events

Only anonymous product events are required:

- `origin_story_opened`;
- `origin_story_brain2_clicked`;
- `brain2_hub_viewed`;
- `brain2_lesson_opened` with day/access tier;
- `brain2_access_gate_viewed`;
- `brain2_access_granted` or coarse failure category;
- `brain2_prompt_copied` with day/block ID;
- `brain2_lesson_completed` with day;
- `brain2_conan_handoff_clicked`.

No prompt text, lesson answer, email or access code is included in analytics.

## Error handling and progressive enhancement

- If the protected lesson API is unavailable, the page stays locked and offers retry;
  it never falls back to embedded content.
- If signup is unavailable, form data remains in the fields and the page shows a
  truthful retry message; it does not claim success.
- Missing/malformed lesson data fails the build for known days and returns a real 404
  for unknown routes.
- If progress storage is unavailable, lessons still work without completion state.
- If copy-to-clipboard is unavailable, the prompt stays selectable.
- If motion initialization fails, all content remains visible.

## Acceptance criteria

### Story

1. Homepage exposes the origin bridge without adding a new full-height act or changing
   chapter navigation.
2. `/about` presents all five causal acts and ends at the 21-day Brain2 action.
3. The HSTL debt consequence is stated once, calmly and with source classification.
4. No claim renders without a valid story evidence record.
5. No generated image depicts a claimed real event; every visual has provenance.
6. No face crop, text collision, header intrusion or horizontal overflow appears at
   supported desktop/tablet/mobile breakpoints.

### Content migration

7. Extractor finds 21/21 unique populated legacy lessons.
8. All 21 packages pass schema, checksum, link and stale-string validation.
9. A migration report shows retained, normalized and intentionally omitted material.
10. No live-workshop, Zoom QR, embedded passcode, old canonical URL or unreviewed
    reflection remains in public output.

### Access and function

11. Hub and days 01–07 work without authentication.
12. Days 08–21 expose metadata but no protected body before authorization.
13. Valid server authorization exposes protected content through a signed session;
    invalid, expired and tampered sessions fail closed.
14. Git-index, CI-artifact and build-output scans find zero protected lesson phrases
    and zero access secret.
15. Signup preserves the active challenge contract, duplicate handling and truthful
    success/error states without sending real email during automated tests.
16. Progress, prompt copy, previous/next navigation and resume work with keyboard and
    at mobile widths.

### Release

17. `/challenges/brain2-21-ngay` and `/brain2` redirect permanently to the canonical hub.
18. All internal journey links resolve to canonical URLs with no duplicate content.
19. Main test, typecheck, static build, release, SEO, bundle and Read-safety gates pass.
20. Visual QA covers `/`, `/about`, hub, a public lesson and a protected lesson at
    `1440x900`, `1280x720`, `390x844` and `320x568`, including reduced motion.
21. Production origin and `https://thongphan.com` pass the same core story/challenge
    smoke before legacy-domain redirect.
22. `brain2.thongphan.com` returns a permanent redirect to `/brain2/21-ngay` only after
    canonical production passes, and rollback metadata is recorded in `docs/STATUS.md`.

## Non-goals

- No access to or conversation with Thông Phan's private Brain2.
- No private vault browser, semantic search, embeddings, note import or chat UI.
- No integration or migration of `/Users/rio/brain2-app`.
- No Conan payment, account, SSO or per-member entitlement implementation.
- No public exposure of weeks 2–3 content.
- No new LMS, certificate system, streak economy or gamified leaderboard.
- No wholesale rewrite of the 21-day curriculum without a content-diff review.
- No deletion of legacy source before release verification and rollback capture.

## Verification evidence required for release

- legacy source and public-data checksums;
- 21/21 migration/validation report;
- story claim/asset provenance report;
- public/protected build-output leak scan;
- access API unit/integration tests including tampered cookie and rate limit;
- signup fixture test and controlled production smoke;
- internal/external link report;
- keyboard, focus, dialog, copy and completion interaction evidence;
- desktop/mobile/reduced-motion screenshots and DOM collision measurements;
- fresh test, typecheck, build, release, SEO, bundle and Read-safety output;
- production deployment IDs, redirect proof and rollback reference in `docs/STATUS.md`.
