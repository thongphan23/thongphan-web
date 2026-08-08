# Content Workflow 7 Days Curriculum Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay bản thử thách đang dạy content artifacts bằng một chương trình bảy
ngày dạy người mới tự thiết kế workflow, dùng Conan School làm tình huống xuyên suốt,
rồi đưa đúng artifact đã QA lên production.

**Architecture:** Giữ nguyên hub, bảy route tĩnh, bố cục workbench ba vùng và cơ chế
lưu cục bộ. Thay toàn bộ domain model bằng schema v2 gồm bảy artifact tương ứng bảy
bước thiết kế workflow; tách nội dung học, bộ tài nguyên, trình chỉnh sửa artifact,
validation, storage và export thành các đơn vị có interface rõ. Dữ liệu v1 không tự
di chuyển sang v2 và chỉ bị xóa khi người dùng xác nhận đặt lại.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS Modules,
`node:test` + `tsx`, Playwright 1.58, Cloudflare Pages/Wrangler 4.110.

## Global Constraints

- Nội dung cốt lõi mỗi ngày tương ứng 45–60 phút; phần đào sâu với AI là tùy chọn
  20–30 phút.
- Mỗi ngày có concept, hiểu lầm, tình huống Conan, bài thực hành, artifact, Quality
  Gate, AI Deep Dive và bộ tài nguyên thật có thể mở/sao chép.
- Người học có thể bắt đầu bằng dữ liệu, nhận định và tài liệu đang có; customer
  evidence không phải điều kiện hoàn thành.
- Nội dung learner-facing dùng tiếng Việt, gọi người học là `bạn`; thuật ngữ tiếng
  Anh quan trọng chỉ xuất hiện sau nghĩa tiếng Việt ở lần đầu.
- Conan School và Conan Maker không được trộn; không hiển thị giá, testimonial hoặc
  outcome định lượng chưa được truy vết.
- Không thêm dependency, tài khoản, thanh toán, email gate, server persistence,
  in-product AI, API hoặc hệ điều hướng mới.
- Giữ route `/challenge/content-workflow-7days` và `/day-01` tới `/day-07`.
- Giữ visual contract đã duyệt tại `docs/visual/content-workflow-7days/`; phần mới
  dùng đúng token, typography, container model và responsive behavior hiện tại.
- Mọi production behavior mới phải đi theo RED → GREEN → REFACTOR.
- Deploy đúng cùng thư mục `out/` đã qua QA: preview trước, production sau, kiểm tra
  origin/apex/`www`, ghi rollback và fingerprint.

---

## File map

- `lib/content-workflow/model.ts`: schema v2, state factory, coverage, validation,
  workflow assembly và next-day behavior.
- `lib/content-workflow/storage.ts`: parser fail-closed, key v2, phát hiện legacy v1,
  read/write/reset an toàn.
- `lib/content-workflow/content.ts`: seven-day learning content và Conan case.
- `lib/content-workflow/resources.ts`: AI labs, templates, examples, checklists,
  glossary/further-learning resources.
- `lib/content-workflow/export.ts`: Markdown Starter Kit v2.
- `components/content-workflow/ArtifactEditor.tsx`: form primitives và editor cho
  bảy artifact.
- `components/content-workflow/LearningResources.tsx`: AI lab và resource cards có
  copy fallback.
- `components/content-workflow/ChallengeWorkbench.tsx`: orchestration, lesson
  narrative, persistence, gate, export và completion.
- `components/content-workflow/ChallengeHubClient.tsx`: readiness v2, legacy notice,
  resume/reset.
- `components/content-workflow/ContentWorkflow.module.css`: component families mới
  trong visual system hiện tại.
- `app/challenge/content-workflow-7days/page.tsx`: promise, boundaries, output rail.
- `app/challenge/content-workflow-7days/[day]/page.tsx`: metadata v2.
- `lib/site-journey.ts`: fit-based completion handoff.
- `scripts/content-workflow-model.test.ts`: curriculum/model validation contracts.
- `scripts/content-workflow-storage.test.ts`: parser/storage/export contracts.
- `scripts/content-workflow-route-contract.test.mjs`: public/copy/accessibility route
  contracts.
- `scripts/site-journey.test.ts`: completion handoff contract.
- `scripts/qa-content-workflow.mjs`: end-to-end browser workflow and language scan.
- `docs/STATUS.md`, `docs/DEPLOYMENT.md`,
  `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`: implementation/release evidence.

---

### Task 1: Khóa schema v2 và validation bảy ngày

**Files:**
- Modify: `scripts/content-workflow-model.test.ts`
- Modify: `lib/content-workflow/model.ts`

**Interfaces:**
- Produces: `ChallengeStateV2`, `ChallengeArtifactsV2`, `WorkflowStage`,
  `StepInstruction`, `TestRunEntry`, `ArtifactCoverage`,
  `createEmptyChallengeState()`, `validateDay()`, `getArtifactCoverage()`,
  `canCompleteChallenge()`, `assembleRunnableWorkflow()` và `nextChallengeDay()`.
- Consumes: không có interface mới từ task trước.

- [ ] **Step 1: Viết fixture và test RED cho schema v2**

```ts
const state = createEmptyChallengeState(new Date('2026-08-08T01:02:03.000Z'))
assert.equal(state.schemaVersion, 2)
assert.deepEqual(state.readiness, {
  outcome: false,
  materials: false,
  aiAccess: false,
  time: false,
})
assert.deepEqual(ARTIFACT_KEYS, [
  'workflowBrief', 'contextPack', 'outputContract', 'workflowMap',
  'runnableWorkflow', 'testRun', 'workflowKit',
])
```

- [ ] **Step 2: Viết test RED cho từng Quality Gate**

```ts
for (const day of [1, 2, 3, 4, 5, 6, 7] as const) {
  assert.equal(validateDay(day, createEmptyChallengeState()).valid, false)
}
assert.equal(validateDay(4, stateWithFourValidStages()).valid, true)
assert.equal(validateDay(4, stateWithOneGate()).valid, false)
assert.equal(validateDay(6, stateWithNoRecordedFailure()).valid, false)
assert.equal(validateDay(7, stateWithNoTransferBlueprint()).valid, false)
```

- [ ] **Step 3: Chạy test và xác nhận RED đúng lý do**

Run:

```bash
node --import tsx --test scripts/content-workflow-model.test.ts
```

Expected: FAIL vì schema vẫn là v1 và các type/artifact mới chưa tồn tại.

- [ ] **Step 4: Thay model bằng schema v2 tối thiểu**

```ts
export type ChallengeStateV2 = {
  schemaVersion: 2
  updatedAt: string
  currentDay: ChallengeDay
  completedDays: ChallengeDay[]
  readiness: Record<'outcome' | 'materials' | 'aiAccess' | 'time', boolean>
  artifacts: ChallengeArtifactsV2
}

export type WorkflowStage = {
  id: string
  name: string
  input: string
  transformation: string
  output: string
  humanDecision: string
  qualityGate: string
}
```

Implement validation theo đặc tả: Ngày 4 cần 4–7 stage và ít nhất hai gate; Ngày 5
cần instruction khớp mọi stage; Ngày 6 cần final content, stage logs, một failure,
một change và rerun; Ngày 7 cần run guide cùng transfer blueprint.

- [ ] **Step 5: Chạy test GREEN và refactor tên/guard dùng chung**

Run:

```bash
node --import tsx --test scripts/content-workflow-model.test.ts
```

Expected: PASS, không warning.

- [ ] **Step 6: Commit domain model**

```bash
git add lib/content-workflow/model.ts scripts/content-workflow-model.test.ts
git commit -m "feat: define workflow curriculum state v2"
```

---

### Task 2: Lưu trữ v2 và xuất Starter Kit mới

**Files:**
- Modify: `scripts/content-workflow-storage.test.ts`
- Modify: `lib/content-workflow/storage.ts`
- Modify: `lib/content-workflow/export.ts`

**Interfaces:**
- Consumes: `ChallengeStateV2` và validators từ Task 1.
- Produces: `CONTENT_WORKFLOW_STORAGE_KEY = 'tp.content-workflow-7days.v2'`,
  `LEGACY_CONTENT_WORKFLOW_STORAGE_KEY`, `hasLegacyChallengeState()`,
  `parseChallengeState()`, `readChallengeState()`, `writeChallengeState()`,
  `clearChallengeState()` và `buildStarterKitMarkdown()`.

- [ ] **Step 1: Viết test RED cho key v2, legacy isolation và reset hai key**

```ts
assert.equal(CONTENT_WORKFLOW_STORAGE_KEY, 'tp.content-workflow-7days.v2')
assert.equal(LEGACY_CONTENT_WORKFLOW_STORAGE_KEY, 'tp.content-workflow-7days.v1')
storage.setItem(LEGACY_CONTENT_WORKFLOW_STORAGE_KEY, JSON.stringify({ schemaVersion: 1 }))
assert.equal(hasLegacyChallengeState(storage), true)
assert.equal(readChallengeState(storage).schemaVersion, 2)
assert.equal(clearChallengeState(storage), true)
assert.equal(storage.data.size, 0)
```

- [ ] **Step 2: Viết test RED cho parser bound và Markdown bảy nhóm**

```ts
assert.deepEqual(parseChallengeState(JSON.stringify(populatedState())), populatedState())
assert.equal(parseChallengeState(JSON.stringify({ ...populatedState(), schemaVersion: 1 })).schemaVersion, 2)
for (const heading of [
  'Bản mô tả thiết kế workflow', 'Hồ sơ bối cảnh', 'Hợp đồng đầu ra',
  'Bản đồ workflow', 'Bộ hướng dẫn người–AI', 'Lần chạy thử',
  'Workflow phiên bản 1 và bản chuyển giao',
]) assert.match(markdown, new RegExp(`## ${heading}`))
```

- [ ] **Step 3: Chạy test và xác nhận RED**

Run:

```bash
node --import tsx --test scripts/content-workflow-storage.test.ts
```

Expected: FAIL do key/export v1.

- [ ] **Step 4: Implement parser/storage/export v2**

Parser dùng exact-key validation, giới hạn text `20_000`, stage tối đa `7`, log tối
đa `7`, instruction tối đa `7`; dữ liệu sai trả state v2 rỗng. `clearChallengeState`
chỉ xóa hai key xác định. Export escape `<`, `>`, `&` và dịch mọi enum trước khi
ghi Markdown.

- [ ] **Step 5: Chạy test GREEN**

Run:

```bash
node --import tsx --test scripts/content-workflow-storage.test.ts
```

Expected: PASS, không warning.

- [ ] **Step 6: Commit persistence/export**

```bash
git add lib/content-workflow/storage.ts lib/content-workflow/export.ts scripts/content-workflow-storage.test.ts
git commit -m "feat: persist and export workflow starter kit v2"
```

---

### Task 3: Biên soạn nội dung, Conan case và resource pack

**Files:**
- Modify: `scripts/content-workflow-model.test.ts`
- Modify: `lib/content-workflow/content.ts`
- Create: `lib/content-workflow/resources.ts`

**Interfaces:**
- Produces: `ContentWorkflowDay`, `LearningResource`, `AiDeepDive`,
  `CONAN_SCHOOL_CASE`, `CONTENT_WORKFLOW_DAYS`, `DAY_RESOURCES`.
- Consumes: `ChallengeDay` từ Task 1 và approved curriculum spec.

- [ ] **Step 1: Viết test RED cho hợp đồng bài học sâu**

```ts
for (const lesson of CONTENT_WORKFLOW_DAYS) {
  assert.equal(lesson.locked, false)
  assert.equal(lesson.theory.length, 3)
  assert.ok(lesson.misconceptions.length >= 3)
  assert.ok(lesson.practice.length >= 4)
  assert.ok(lesson.qualityGate.length >= 3)
  assert.equal(lesson.conanCase.label, 'Tình huống Conan School')
  assert.match(lesson.conanCase.disclosure, /thiết kế.*giảng dạy/i)
  assert.equal(lesson.aiLab.duration, '20–30 phút tùy chọn')
  assert.ok(DAY_RESOURCES[lesson.day].length >= 4)
}
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```bash
node --import tsx --test scripts/content-workflow-model.test.ts
```

Expected: FAIL vì content v1 chỉ có `learn/see/do` và Studio Mộc.

- [ ] **Step 3: Implement nội dung bảy ngày đúng spec**

Mỗi ngày ghi đủ: problem scene, ba theory beats, ít nhất ba misconceptions, Conan
decision trail, 4–7 practice steps, minimum artifact, 3–6 Quality Gates, AI role,
copy-ready prompt và guardrail. Dùng đúng sequence:

```text
Workflow Brief → Context Pack → Output Contract → Workflow Map
→ Human/AI Run Sheet → Test Run → Run Guide + Transfer Blueprint
```

- [ ] **Step 4: Implement bốn resource thật cho mỗi ngày**

Mỗi `LearningResource` có `kind`, `title`, `description`, `content`; mọi nội dung
phải hoàn chỉnh và dùng được. Ngày 1–7 lần lượt có bản mẫu, ví dụ Conan hoàn chỉnh,
checklist/troubleshooting và glossary/further-learning guide.

- [ ] **Step 5: Chạy test GREEN và quét copy nguồn**

Run:

```bash
node --import tsx --test scripts/content-workflow-model.test.ts
rg -n "Studio Mộc|testimonial|15\.000\.000|18\.000\.000|1\.250\.000" lib/content-workflow/content.ts lib/content-workflow/resources.ts
```

Expected: test PASS; `rg` không trả match.

- [ ] **Step 6: Commit curriculum content**

```bash
git add lib/content-workflow/content.ts lib/content-workflow/resources.ts scripts/content-workflow-model.test.ts
git commit -m "feat: add deep seven-day workflow curriculum"
```

---

### Task 4: Xây editor bảy artifact và learning resource UI

**Files:**
- Modify: `scripts/content-workflow-route-contract.test.mjs`
- Create: `components/content-workflow/ArtifactEditor.tsx`
- Create: `components/content-workflow/LearningResources.tsx`
- Modify: `components/content-workflow/ChallengeWorkbench.tsx`
- Modify: `components/content-workflow/ContentWorkflow.module.css`

**Interfaces:**
- Consumes: state/update/validation từ Task 1; content/resources từ Task 3;
  persistence/export từ Task 2.
- Produces: accessible interactive editors, resource copy behavior, completion desk
  và export controls.

- [ ] **Step 1: Viết route/UI contract RED**

```js
assert.doesNotMatch(component, /dangerouslySetInnerHTML|fetch\s*\(|sendBeacon/)
assert.match(component, /LearningResources/)
assert.match(component, /ArtifactEditor/)
assert.match(component, /Khái niệm lõi/)
assert.match(component, /Hiểu lầm cần phá/)
assert.match(component, /Tình huống Conan School/)
assert.match(component, /Đào sâu với AI/)
assert.match(component, /Bộ tài nguyên/)
assert.match(css, /min-height:\s*44px/)
```

- [ ] **Step 2: Chạy contract và xác nhận RED**

Run:

```bash
node --test scripts/content-workflow-route-contract.test.mjs
```

Expected: FAIL vì component/resource section chưa tồn tại.

- [ ] **Step 3: Tạo `ArtifactEditor` với primitives dùng chung**

Implement `Field`, `SelectField`, `StageEditor`, `InstructionEditor`, `TestRunEditor`
và `TransferEditor`. ID phải ổn định theo validation path; mọi control có label,
description, `aria-invalid`, error link và touch target tối thiểu 44px.

- [ ] **Step 4: Tạo `LearningResources`**

Render AI Lab và resource cards bằng `<details>`. Mỗi item có nút sao chép; clipboard
failure reveal một `<textarea readOnly>` đã focus/select. Không render HTML thô.

- [ ] **Step 5: Thay workbench orchestration**

Render thứ tự: Bài toán → Khái niệm lõi → Hiểu lầm → Conan làm mẫu → Bạn tự xây →
AI Deep Dive → Bộ tài nguyên → Artifact Desk → Gate. Giữ autosave 450ms,
navigation mở, reset dialog, completion view, Markdown download/copy.

- [ ] **Step 6: Bổ sung CSS trong visual system hiện có**

Tạo style families `.problemSection`, `.theoryGrid`, `.misconceptionList`,
`.decisionTrail`, `.aiLab`, `.resourceGrid`, `.resourceCard`, `.stageEditor`,
`.instructionEditor`, `.testRunEditor`; giữ palette hiện tại và responsive tại
1180/960/720/360px.

- [ ] **Step 7: Chạy contract, TypeScript và focused tests GREEN**

Run:

```bash
node --test scripts/content-workflow-route-contract.test.mjs
node --import tsx --test scripts/content-workflow-model.test.ts scripts/content-workflow-storage.test.ts
npx tsc --noEmit
```

Expected: tất cả PASS.

- [ ] **Step 8: Commit workbench**

```bash
git add components/content-workflow/ArtifactEditor.tsx components/content-workflow/LearningResources.tsx components/content-workflow/ChallengeWorkbench.tsx components/content-workflow/ContentWorkflow.module.css scripts/content-workflow-route-contract.test.mjs
git commit -m "feat: rebuild workflow challenge workbench"
```

---

### Task 5: Cập nhật hub, readiness, metadata và journey

**Files:**
- Modify: `scripts/content-workflow-route-contract.test.mjs`
- Modify: `scripts/site-journey.test.ts`
- Modify: `components/content-workflow/ChallengeHubClient.tsx`
- Modify: `app/challenge/content-workflow-7days/page.tsx`
- Modify: `app/challenge/content-workflow-7days/[day]/page.tsx`
- Modify: `lib/site-journey.ts`

**Interfaces:**
- Consumes: readiness v2, content v2 và legacy detection.
- Produces: accurate public promise and fit-based completion actions.

- [ ] **Step 1: Viết RED contracts cho promise/readiness/handoff**

```js
for (const key of ['outcome', 'materials', 'aiAccess', 'time']) {
  assert.match(client, new RegExp(`['"]${key}['"]`))
}
assert.match(page, /tự xây một workflow nội dung/)
assert.doesNotMatch(combined, /ngân hàng bằng chứng|ba bản nháp|14 bài/i)
```

```ts
assert.equal(contentWorkflow.primary.href, 'https://tokyo.conan.school/')
assert.equal(contentWorkflow.primary.external, true)
assert.equal(contentWorkflow.secondary[0].href, '/conanmaker/')
assert.match(contentWorkflow.secondary[0].reason, /doanh nghiệp.*phụ thuộc/i)
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```bash
node --test scripts/content-workflow-route-contract.test.mjs
node --import tsx --test scripts/site-journey.test.ts
```

Expected: FAIL vì readiness và CTA còn contract cũ.

- [ ] **Step 3: Implement hub/readiness v2**

Readiness items: biết kết quả lặp lại; có dữ liệu/nhận định/tài liệu ban đầu; có công
cụ AI; có 45–60 phút/ngày. Không mục nào khóa bắt đầu. Nếu key v1 tồn tại nhưng v2
chưa có, hiển thị thông báo chương trình đã thiết kế lại và tiến trình cũ không được
đánh dấu hoàn thành thay cho chương trình mới.

- [ ] **Step 4: Implement public copy và metadata v2**

Hero promise nói rõ học phương pháp xây workflow; output rail là bảy artifact; fit
section mở cho người mới có một công việc content lặp lại; bỏ mọi customer evidence,
three-draft và fourteen-post claim.

- [ ] **Step 5: Implement fit-based journey**

Primary: Conan School/Tokyo cho First-Time Builder. Secondary: Conan Maker cho
founder đã có doanh nghiệp và operating bottleneck. Self-directed continuation nằm
trong Day 7 resource, không làm CTA cạnh tranh.

- [ ] **Step 6: Chạy tests GREEN và commit**

Run:

```bash
node --test scripts/content-workflow-route-contract.test.mjs
node --import tsx --test scripts/site-journey.test.ts
```

Expected: PASS.

```bash
git add components/content-workflow/ChallengeHubClient.tsx app/challenge/content-workflow-7days/page.tsx app/challenge/content-workflow-7days/\[day\]/page.tsx lib/site-journey.ts scripts/content-workflow-route-contract.test.mjs scripts/site-journey.test.ts
git commit -m "feat: align workflow challenge entry and handoff"
```

---

### Task 6: Thay end-to-end QA và chạy full local release gate

**Files:**
- Modify: `scripts/qa-content-workflow.mjs`
- Modify: `docs/STATUS.md`
- Modify: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`

**Interfaces:**
- Consumes: toàn bộ rendered product từ Tasks 1–5.
- Produces: browser evidence JSON/screenshots/download và release readiness verdict.

- [ ] **Step 1: Thay browser flow bằng schema v2**

Test exact flow:

```text
hub readiness → Day 1 brief → Day 2 context → Day 3 contract
→ Day 4 add four stages/two gates → Day 5 assign roles/copy workflow
→ refresh/resume → Day 6 run log/failure/fix/rerun
→ Day 7 run guide/transfer → complete → download/copy fallback → reset
```

Browser assertions phải kiểm tra resource expand/copy, Conan disclosure, language,
localStorage v2, completion 7/7, Markdown headings, fit-based handoff và reset cả v1/v2.

- [ ] **Step 2: Chạy QA local và sửa từng regression bằng TDD**

Run:

```bash
npm run qa:content-workflow
```

Expected: PASS tại 1280×800, 390×844 và 320×568; không console/page error.

- [ ] **Step 3: Chạy full verification gate**

Run tuần tự:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
npm run test:release
git diff --check
```

Expected: mọi lệnh exit `0`, không warning bị bỏ qua.

- [ ] **Step 4: Kiểm tra React/Next.js implementation**

Rà soát: versioned/minimal localStorage; static data hoisted; không effect-derived
state; functional updates; không component định nghĩa bên trong render; không tăng
bundle bằng dependency mới.

- [ ] **Step 5: Cập nhật STATUS và release report ở trạng thái candidate**

Ghi source SHA, test counts, build route count, browser evidence path, known limits,
Conan source boundary và production vẫn chưa thay đổi.

- [ ] **Step 6: Commit release candidate**

```bash
git add scripts/qa-content-workflow.mjs docs/STATUS.md docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md
git commit -m "test: verify workflow curriculum redesign"
```

---

### Task 7: Visual QA, preview, production và live verification

**Files:**
- Modify: `docs/DEPLOYMENT.md`
- Modify: `docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md`
- Modify: `docs/STATUS.md`

**Interfaces:**
- Consumes: exact verified `out/` from Task 6.
- Produces: preview URL, production deployment ID, rollback ID, origin/apex/`www`
  fingerprints và final live verdict.

- [ ] **Step 1: Chạy Browser/IAB visual loop trên local build**

Flow under test: hub → mở Day 1 → expand resource → nhập artifact → gate feedback →
mobile navigation → Day 7 completion. Kiểm tra page identity, DOM, overlay, console,
screenshots và interaction tại desktop/mobile.

- [ ] **Step 2: So sánh concept đã duyệt và render mới bằng `view_image`**

Concept paths:

```text
docs/visual/content-workflow-7days/hub-desktop-approved.png
docs/visual/content-workflow-7days/workbench-desktop-approved.png
docs/visual/content-workflow-7days/workbench-mobile-approved.png
docs/visual/content-workflow-7days/day-07-completion-approved.png
```

Ghi mismatch ledger cho copy hierarchy, layout, typography, palette, resource cards,
artifact editor, responsive rail và completion state; sửa mọi mismatch material.

- [ ] **Step 3: Chụp rollback và deploy preview từ exact `out/`**

Run:

```bash
npx wrangler pages deployment list --project-name thongphan-com
npx wrangler pages deploy out --project-name thongphan-com --branch agent-content-workflow-7days --commit-hash "$(git rev-parse HEAD)"
```

Record previous production ID and preview ID before promotion.

- [ ] **Step 4: Chạy browser QA và route fingerprints trên preview**

Run:

```bash
TP_CW_PREVIEW_URL="URL chính xác do lệnh deploy preview vừa trả về"
CONTENT_WORKFLOW_QA_BASE_URL="$TP_CW_PREVIEW_URL" npm run qa:content-workflow
```

Expected: PASS; hub, Day 1, Day 7 HTTP 200; HTML hashes captured.

- [ ] **Step 5: Promote cùng `out/` lên production**

Run:

```bash
npx wrangler pages deploy out --project-name thongphan-com --branch main --commit-hash "$(git rev-parse HEAD)"
```

Expected: command exit `0` và trả production deployment ID.

- [ ] **Step 6: Xác minh origin, apex và `www` sau propagation**

Run QA với production origin và:

```bash
CONTENT_WORKFLOW_QA_BASE_URL="https://thongphan.com" npm run qa:content-workflow
CONTENT_WORKFLOW_QA_BASE_URL="https://www.thongphan.com" npm run qa:content-workflow
```

Retry bounded nếu edge propagation chưa đồng bộ; không tuyên bố complete chỉ từ
origin. So sánh HTML fingerprints hub/Day 1/Day 7 giữa ba host.

- [ ] **Step 7: Cập nhật release evidence và commit**

Ghi source SHA, preview/production/rollback IDs, origin URL, test counts, screenshot
evidence, fingerprints, timestamp và final PASS/FAIL.

```bash
git add docs/DEPLOYMENT.md docs/qa/CONTENT_WORKFLOW_7DAYS_RELEASE_REPORT.md docs/STATUS.md
git commit -m "docs: record workflow curriculum production release"
git push origin agent/content-workflow-7days
```

Expected: branch sạch, remote chứa final release evidence.
