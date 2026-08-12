# VID Content Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add versioned, human-reviewed semantic understanding to published videos without slowing M0 upload or risking existing playback.

**Architecture:** Store transcripts, field-level model suggestions and immutable approved model versions in D1. Generate analysis through a provider-neutral packet/result boundary operated by Codex, then validate and approve it through signed admin APIs. Public discovery consumes only approved fields.

**Tech Stack:** TypeScript, Cloudflare Worker/D1, Node CLI/tests, existing VID contracts and signed admin authentication.

## Global Constraints

- This plan starts only after the video-first foundation plan is released or rebased cleanly.
- AI suggestions never auto-publish semantic truth.
- Every suggestion stores generator name/version, evidence spans, confidence and review state.
- Transcript failure never unpublishes an M0 video.
- Published semantic versions are immutable; revisions create a new version.
- D1 remains the operational source of truth; no graph database is added.
- Public APIs never expose internal confidence, raw review notes or private rights data.
- No paid model provider is coupled directly to the Worker runtime.

---

### Task 1: Add normalized intelligence schema

**Files:**
- Create: `workers/vid/migrations/0003_vid_content_intelligence.sql`
- Create: `scripts/vid-intelligence-migration.test.ts`
- Modify: `scripts/vid-release-gate.mjs`

**Interfaces:**
- Produces D1 tables: `vid_needs`, `vid_video_needs`, `vid_questions`, `vid_video_questions`, `vid_series`, `vid_series_videos`, `vid_transcripts`, `vid_model_versions`, `vid_model_suggestions`, `vid_relationships`, `vid_generator_versions`.

- [ ] **Step 1: Write a failing migration contract**

```ts
test('0003 adds intelligence tables without changing existing video rows', async () => {
  const db = await migratedFixture(['0001_vid_catalog.sql', '0002_vid_presentation.sql', '0003_vid_content_intelligence.sql'])
  assert.equal(await scalar(db, "SELECT COUNT(*) FROM vid_videos WHERE slug='existing-video'"), 1)
  for (const table of ['vid_transcripts', 'vid_model_versions', 'vid_model_suggestions', 'vid_relationships']) {
    assert.equal(await tableExists(db, table), true)
  }
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-intelligence-migration.test.ts`  
Expected: FAIL because migration `0003` is absent.

- [ ] **Step 3: Create the migration with strict states and indexes**

Use checks for transcript `draft|needs_review|approved|rejected`, model `draft|needs_review|approved|superseded`, suggestion `pending|approved|rejected|corrected`, relationship `draft|approved|archived`, and foreign keys to `vid_videos`. Add unique `(video_id, version_number)`, prevent self-relationships with `CHECK (from_video_id != to_video_id)`, and add update/delete triggers that reject mutation of approved model-version rows.

- [ ] **Step 4: Add migration invariants**

Test rollback-safe application on a fresh DB and a populated `0001` fixture, duplicate version rejection, self-edge rejection, cascade behavior for draft test records and preservation of archived/published video rows.

- [ ] **Step 5: Run migration tests**

Run: `node --import tsx --test scripts/vid-intelligence-migration.test.ts`  
Expected: PASS on both database shapes.

- [ ] **Step 6: Commit**

```bash
git add workers/vid/migrations/0003_vid_content_intelligence.sql scripts/vid-intelligence-migration.test.ts scripts/vid-release-gate.mjs
git commit -m "feat(vid): add content intelligence schema"
```

---

### Task 2: Define strict semantic contracts and validation

**Files:**
- Create: `lib/vid/intelligence-contracts.ts`
- Create: `scripts/vid-intelligence-contract.test.ts`

**Interfaces:**
- Produces: `TranscriptInput`, `VideoModelDraft`, `VideoModelSuggestion`, `VideoRelationshipDraft`, `validateTranscriptInput()`, `validateVideoModelDraft()`, `validateRelationshipDraft()`.

- [ ] **Step 1: Write failing validator tests**

```ts
test('M2 model requires question, audience, shift, action, freshness and evidence', () => {
  assert.throws(() => validateVideoModelDraft({ videoSlug: 'a', tier: 'M2' }), /primaryQuestion/)
  assert.equal(validateVideoModelDraft(validM2).expectedShift, 'Từ thử prompt rời rạc sang vòng lặp kiểm chứng')
})

test('confidence is field-level and labelled heuristic until calibrated', () => {
  assert.throws(() => validateVideoModelDraft({ ...validM2, suggestions: [{ field: 'primaryQuestion', confidence: 0.82 }] }), /confidenceKind/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-intelligence-contract.test.ts`  
Expected: FAIL because the contracts do not exist.

- [ ] **Step 3: Implement exact enums and schemas**

```ts
export const CONTENT_ROLES = ['orientation', 'problem-framing', 'explanation', 'decision-support', 'action-guide', 'evidence-case', 'reflection', 'reference'] as const
export const RELATIONSHIP_TYPES = ['REQUIRES_VIDEO', 'LEADS_TO_VIDEO', 'ANSWERS_SAME_QUESTION', 'DEEPENS_CONCEPT', 'CONTRASTS_VIEWPOINT', 'PROVIDES_EXAMPLE', 'MOVES_TO_ACTION', 'ALTERNATIVE_FOR'] as const
export type VideoModelDraft = {
  videoSlug: string
  tier: 'M1' | 'M2' | 'M3'
  primaryNeed: string
  primaryQuestion: string
  readerSituations: string[]
  contentRole: typeof CONTENT_ROLES[number]
  difficulty: 'foundation' | 'intermediate' | 'advanced'
  uncertaintyReduced: string[]
  expectedShift: string
  misconceptionsAddressed: string[]
  actionsEnabled: string[]
  prerequisiteVideoSlugs: string[]
  nextVideoSlugs: string[]
  evidenceLevel: 'C0' | 'C1' | 'C2' | 'C3' | 'C4'
  freshness: 'fresh' | 'review_due' | 'stale' | 'superseded'
}
```

- [ ] **Step 4: Enforce limits and cross-field rules**

Reject unknown keys, empty trimmed strings, duplicate arrays, overlong text, M2 without action/shift/evidence, M3 without approved effectiveness evidence, stale model marked recommendation-ready, and relationship to the same slug.

- [ ] **Step 5: Run tests and typecheck**

Run: `node --import tsx --test scripts/vid-intelligence-contract.test.ts && npm run typecheck:vid-worker`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add lib/vid/intelligence-contracts.ts scripts/vid-intelligence-contract.test.ts
git commit -m "feat(vid): define semantic model contracts"
```

---

### Task 3: Add transcript and versioned model repositories

**Files:**
- Create: `workers/vid/intelligence.ts`
- Create: `scripts/vid-intelligence-repository.test.ts`

**Interfaces:**
- Consumes: Task 1 schema and Task 2 validators.
- Produces: `saveTranscript()`, `saveModelSuggestions()`, `reviewSuggestion()`, `publishModelVersion()`, `listIntelligenceStatus()`, `saveRelationshipDraft()`, `approveRelationship()`.
- Produces taxonomy operations `upsertNeed()`, `upsertQuestion()`, `upsertSeries()` and `replaceSeriesItems()`.

- [ ] **Step 1: Write failing repository tests**

```ts
test('publishing a model creates an immutable version from approved suggestions', async () => {
  const version = await publishModelVersion(env, 'vid_01', reviewer)
  assert.equal(version.versionNumber, 1)
  await assert.rejects(
    () => env.VID_DB.prepare('UPDATE vid_model_versions SET model_json = ? WHERE id = ?').bind('{}', version.id).run(),
    /immutable_model_version/,
  )
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-intelligence-repository.test.ts`  
Expected: FAIL because repository functions do not exist.

- [ ] **Step 3: Implement repository transactions**

```ts
export async function saveTranscript(env: VidEnv, videoId: string, input: TranscriptInput, actor: string): Promise<{ transcriptId: string; versionNumber: number }>
export async function saveModelSuggestions(env: VidEnv, videoId: string, generator: GeneratorRef, suggestions: VideoModelSuggestion[]): Promise<void>
export async function reviewSuggestion(env: VidEnv, suggestionId: string, decision: 'approved' | 'rejected' | 'corrected', correction: unknown, reviewer: string): Promise<void>
export async function publishModelVersion(env: VidEnv, videoId: string, reviewer: string): Promise<PublishedVideoModel>
export async function upsertNeed(env: VidEnv, input: { slug: string; label: string; description: string; sortOrder: number }, actor: string): Promise<void>
export async function upsertSeries(env: VidEnv, input: { slug: string; title: string; description: string; published: boolean; videoSlugs: string[] }, actor: string): Promise<void>
```

Use D1 batch/transaction semantics so a published version and its source links cannot diverge. Never update an approved version row.

- [ ] **Step 4: Add relationship eligibility checks**

Only published/ready videos may receive approved edges; `REQUIRES_VIDEO` and `LEADS_TO_VIDEO` cannot create a cycle; stale/superseded target makes the draft ineligible.

- [ ] **Step 5: Run repository tests**

Run: `node --import tsx --test scripts/vid-intelligence-repository.test.ts`  
Expected: PASS for immutability, review state, cycle protection and concurrent version-number conflicts.

- [ ] **Step 6: Commit**

```bash
git add workers/vid/intelligence.ts scripts/vid-intelligence-repository.test.ts
git commit -m "feat(vid): persist reviewed video intelligence"
```

---

### Task 4: Expose signed admin intelligence operations

**Files:**
- Create: `workers/vid/admin-intelligence.ts`
- Modify: `workers/vid/index.ts`
- Modify: `workers/vid/types.ts`
- Modify: `scripts/vid-worker.test.ts`
- Create: `scripts/vid-intelligence-admin.test.ts`

**Interfaces:**
- Produces signed routes:
  - `POST /api/admin/videos/:id/transcripts`
  - `POST /api/admin/videos/:id/suggestions`
  - `POST /api/admin/suggestions/:id/review`
  - `POST /api/admin/videos/:id/model/publish`
  - `POST /api/admin/relationships`
  - `POST /api/admin/relationships/:id/approve`
  - `PUT /api/admin/taxonomy/needs/:slug`
  - `PUT /api/admin/taxonomy/questions/:slug`
  - `PUT /api/admin/series/:slug`
  - `GET /api/admin/videos/:id/intelligence`

- [ ] **Step 1: Write failing route/auth tests**

Verify unsigned requests return 401, oversize transcript returns 413, unknown keys return 400, duplicate idempotency returns the original operation and public routes cannot access admin payloads.

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-intelligence-admin.test.ts`  
Expected: FAIL with `admin_not_found`.

- [ ] **Step 3: Split admin intelligence routing before adding routes**

Create focused handlers in `workers/vid/admin-intelligence.ts`. The exported Worker interface remains `handleVidRequest()`; body ceiling and HMAC validation stay centralized in `workers/vid/index.ts` before dispatch.

- [ ] **Step 4: Implement exact typed responses**

Use `{ operationId, status }` for writes and an inspector response containing transcript quality, pending/approved/rejected counts, current model version and blocked reasons. Never include full transcript in a generic status list.

- [ ] **Step 5: Run route and security tests**

Run: `node --import tsx --test scripts/vid-intelligence-admin.test.ts scripts/vid-worker.test.ts scripts/vid-admin-auth.test.ts`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add workers/vid/admin-intelligence.ts workers/vid/index.ts workers/vid/types.ts scripts/vid-worker.test.ts scripts/vid-intelligence-admin.test.ts
git commit -m "feat(vid): add signed intelligence operations"
```

---

### Task 5: Build the Codex-operated analysis packet workflow

**Files:**
- Create: `lib/vid/analysis-packet.ts`
- Create: `scripts/vid-analysis-cli.ts`
- Create: `scripts/vid-analysis-packet.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `buildAnalysisPacket()`, `validateAnalysisResult()`, `submitAnalysisResult()`.
- Packet contains catalog identity, transcript version/hash, allowed taxonomy, output JSON schema and generator registry reference.

- [ ] **Step 1: Write failing packet/result tests**

```ts
test('analysis packet binds output to exact transcript hash and generator version', () => {
  const packet = buildAnalysisPacket(video, transcript, generator)
  assert.equal(packet.transcriptSha256, sha256(transcript.text))
  assert.equal(packet.outputSchemaVersion, 'vid-analysis-v1')
  assert.equal('rightsNote' in packet.video, false)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-analysis-packet.test.ts`  
Expected: FAIL because packet functions do not exist.

- [ ] **Step 3: Implement a provider-neutral packet**

```ts
export type VideoAnalysisPacket = {
  schemaVersion: 'vid-analysis-packet-v1'
  outputSchemaVersion: 'vid-analysis-v1'
  video: { slug: string; title: string; description: string; sourceCreator: string }
  transcript: { id: string; language: string; text: string }
  transcriptSha256: string
  allowedTaxonomy: { needs: string[]; topics: string[]; roles: string[] }
  generator: { id: string; version: string }
}
```

CLI commands:

```text
npm run vid:analysis -- packet --video <slug> --output <absolute.json>
npm run vid:analysis -- submit --video <slug> --result <absolute.json>
npm run vid:analysis -- inspect --video <slug>
```

- [ ] **Step 4: Validate evidence spans and transcript binding**

Every suggested semantic field must cite one or more character/time spans inside the exact transcript version. Reject output if the transcript hash, generator version, schema version or video slug differs.

- [ ] **Step 5: Run tests and dry-run packet creation**

Run: `node --import tsx --test scripts/vid-analysis-packet.test.ts`  
Run: `npm run vid:analysis -- packet --video tu-duy-ai --output /private/tmp/vid-analysis-packet.json --dry-run`  
Expected: tests PASS; dry-run prints no secret and writes no production state.

- [ ] **Step 6: Commit**

```bash
git add lib/vid/analysis-packet.ts scripts/vid-analysis-cli.ts scripts/vid-analysis-packet.test.ts package.json
git commit -m "feat(vid): add Codex video analysis packets"
```

---

### Task 6: Add needs, series and approved-semantic discovery

**Files:**
- Modify: `lib/vid/contracts.ts`
- Modify: `lib/vid/api-client.ts`
- Modify: `lib/vid/discovery.ts`
- Modify: `lib/vid/feed-cursor.ts`
- Modify: `workers/vid/catalog.ts`
- Modify: `workers/vid/index.ts`
- Modify: `components/vid/CatalogView.tsx`
- Modify: `components/vid/Vid.module.css`
- Modify: `scripts/vid-discovery.test.ts`
- Modify: `scripts/vid-contract.test.ts`
- Modify: `scripts/vid-worker.test.ts`

**Interfaces:**
- Public filters add `need`, `series`, `difficulty`, `role`.
- Public video may expose approved `primaryNeed`, `primaryQuestion`, `contentRole`, `difficulty`, `modelTier`; no internal confidence.
- Discovery ordering changes the cursor policy from `vid-feed-v1` to `vid-feed-v2`; v1 cursors receive the typed `cursor_policy_changed` response and the client restarts from the first v2 slice once.

- [ ] **Step 1: Write failing search/ranking tests**

```ts
test('approved need and primary question outrank a title-only tag match', () => {
  const ranked = rankDiscovery([semanticMatch, titleMatch], { query: 'bắt đầu prompting', need: 'prompting-foundation' })
  assert.deepEqual(ranked.map((video) => video.slug), ['semantic-match', 'title-match'])
  assert.match(ranked[0].matchReason, /giải quyết nhu cầu/)
})
```

- [ ] **Step 2: Run and confirm RED**

Run: `node --import tsx --test scripts/vid-discovery.test.ts`  
Expected: FAIL because semantic fields and match reason are absent.

- [ ] **Step 3: Extend public projection from approved versions only**

Join the current approved model version and M1 taxonomy. M0 remains visible with nullable semantic fields. Add filters to the cursor fingerprint so changing need/series/role invalidates the old chain. Bump the deterministic ordering contract and cursor codec to `vid-feed-v2`; add a single client recovery path for `cursor_policy_changed` and prevent restart loops.

- [ ] **Step 4: Implement deterministic match reasons**

Return one short reason selected from approved fields, for example `Giải quyết nhu cầu bắt đầu với prompting` or `Thuộc series Gauntlet Loop`. Do not generate reasons at request time with AI.

- [ ] **Step 5: Add accessible discovery controls**

Render shareable URL filters and keep the continuous feed. Filter changes abort the previous chain and return focus to the catalog heading without forcing page reload.

- [ ] **Step 6: Run focused/full checks**

Run: `node --import tsx --test scripts/vid-discovery.test.ts scripts/vid-contract.test.ts scripts/vid-worker.test.ts scripts/vid-api-client.test.ts && npm run build && npm run qa:vid`  
Expected: PASS; M0 videos remain discoverable.

- [ ] **Step 7: Commit**

```bash
git add lib/vid/contracts.ts lib/vid/api-client.ts lib/vid/discovery.ts lib/vid/feed-cursor.ts workers/vid/catalog.ts workers/vid/index.ts components/vid/CatalogView.tsx components/vid/Vid.module.css scripts/vid-discovery.test.ts scripts/vid-contract.test.ts scripts/vid-worker.test.ts
git commit -m "feat(vid): add need-led semantic discovery"
```

---

### Task 7: Evaluate and release content intelligence

**Files:**
- Create: `content/vid/eval/intelligence-eval-v1.json`
- Create: `scripts/vid-intelligence-eval.ts`
- Create: `scripts/vid-intelligence-eval.test.ts`
- Modify: `scripts/vid-release-gate.mjs`
- Modify: `docs/STATUS.md`
- Create: `docs/qa/VID_CONTENT_INTELLIGENCE_REPORT.md`

**Interfaces:**
- Produces human-reviewed eval summary: agreement, edit rate, lost nuance, false prerequisite and relationship acceptance.

- [ ] **Step 1: Add the fixed eval fixture contract**

Include Vietnamese clean transcript, noisy transcript, duplicate topic, multi-topic, evidence-poor and prerequisite-sensitive cases. Store only licensed/owned test text or compact synthetic fixtures.

- [ ] **Step 2: Write evaluator tests**

Verify missing human labels produce `PARTIAL`, not PASS; schema validity is reported separately from semantic agreement; every metric denominator is explicit.

- [ ] **Step 3: Run evaluator and review samples manually**

Run: `node --import tsx --test scripts/vid-intelligence-eval.test.ts`  
Run: `node --import tsx scripts/vid-intelligence-eval.ts --fixture content/vid/eval/intelligence-eval-v1.json`  
Expected: structural checks PASS; semantic verdict reflects the actual reviewed sample.

- [ ] **Step 4: Run release verification**

Run focused VID tests, full `npm test`, lint, Worker typecheck, build, secret scan, D1 migration dry-run and visual QA. Record current counts.

- [ ] **Step 5: Deploy migration and Worker before public shell changes**

Back up/export the scoped D1 state, apply `0003`, verify existing public video unchanged, deploy Worker, then deploy static discovery UI. Keep previous Worker/Pages versions as rollback targets.

- [ ] **Step 6: Verify production and write report**

Confirm M0 video playback, admin transcript/model flow, M1/M2 filters, cursor continuation and absence of private suggestion fields. Report model quality as PASS/PARTIAL/BLOCKED independently from runtime release.

- [ ] **Step 7: Commit evidence**

```bash
git add content/vid/eval/intelligence-eval-v1.json scripts/vid-intelligence-eval.ts scripts/vid-intelligence-eval.test.ts scripts/vid-release-gate.mjs docs/STATUS.md docs/qa/VID_CONTENT_INTELLIGENCE_REPORT.md
git commit -m "docs(vid): record content intelligence evidence"
```
