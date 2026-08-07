# Conan Challenge — Content Workflow 7 Days Design

**Ngày:** 07/08/2026
**Trạng thái:** Bản viết và visual contract được anh Thông duyệt ngày 08/08/2026
**Phạm vi:** Trải nghiệm tự học miễn phí tại `thongphan.com/challenge/content-workflow-7days`
**Nguồn nội dung:** Bản thiết kế challenge do anh Thông cung cấp trong attachment Codex ngày 07/08/2026
**Nguồn định vị:** Brain2 canonical ngày 07/08/2026 về Conan School, Conan Maker và Established Builder

## 1. Quyết định sản phẩm

Xây một Learning Studio tự học, mở ngay và miễn phí. Người học không chỉ đọc bảy
bài lesson. Họ điền dữ liệu thật của business vào một workbook tương tác, dùng dữ
liệu đó để tạo một Content Workflow Prompt, kiểm thử workflow qua ba content và
đóng gói toàn bộ thành `Content Workflow Starter Kit v1.0`.

Sản phẩm không cần tài khoản, không có paywall và không gọi AI bên trong website.
Tiến độ cùng workbook được lưu trên chính trình duyệt của người học. Toàn bộ bảy
ngày luôn mở; “bảy ngày” là nhịp học khuyến nghị, không phải khóa thời gian.

## 2. Vấn đề và JTBD

### Vấn đề

Founder hoặc người ra quyết định đã dùng AI để làm content nhưng vẫn gặp ba lỗi:

1. Mỗi lần làm lại bắt đầu từ trang trắng.
2. AI tạo nội dung chung chung vì thiếu customer evidence và tiêu chuẩn đầu ra.
3. Founder vẫn phải tự sửa gần như toàn bộ vì workflow chưa giữ được context và
   Quality Gate của doanh nghiệp.

### JTBD

> Khi tôi cần tạo content đều đặn cho business nhưng mỗi lần vẫn phải bắt đầu lại,
> hãy giúp tôi biến dữ liệu khách hàng, mục tiêu content và tiêu chuẩn của mình
> thành một workflow AI đơn giản có thể dùng lại, để tôi tạo được content đúng
> người, đúng vấn đề và đúng mục đích mà không giao toàn bộ phán đoán cho AI.

## 3. Đối tượng và điều kiện đầu vào

### Đối tượng chính

- Founder, chủ doanh nghiệp hoặc người có quyền quyết định về content.
- Có một business hoặc dự án kinh doanh thật.
- Có một offer đang bán.
- Có khách hàng, người quan tâm hoặc customer evidence thật.
- Có một quy trình content hiện còn phụ thuộc nhiều vào founder.
- Sẵn sàng dành khoảng 45–60 phút cho mỗi ngày thực hành.

Đây có thể là người mới bước vào hệ sinh thái Conan, nhưng không phải người chưa có
business, offer hoặc ngữ cảnh thực tế.

### Readiness tối thiểu

Người học cần xác nhận bốn điều trước khi bắt đầu:

1. Tôi biết business/offer nào sẽ được dùng trong challenge.
2. Tôi chọn được một nhóm khách hàng có thật.
3. Tôi có hoặc biết cách tìm ít nhất năm câu nói/bằng chứng khách hàng.
4. Tôi có một kênh để đưa ít nhất một content tới người thật.

Người chưa có đủ evidence vẫn được bắt đầu nhưng nhận corrective path: xem lại inbox,
bình luận, cuộc gọi, review hoặc hỏi trực tiếp ba khách hàng. Website không bịa dữ
liệu thay cho họ.

## 4. Lời hứa và ranh giới lời hứa

### Sau bảy ngày, người học có

1. `Customer Focus Card`.
2. `Customer Voice Mini Bank` có tối thiểu năm bằng chứng.
3. `Content Job Card`.
4. `Reusable Content Brief`.
5. `Content Workflow Prompt v1`.
6. Ba content đã tự chấm và chỉnh sửa.
7. `Content Workflow One-Pager`.
8. Kế hoạch content 14 ngày.

### Không hứa

- Content viral.
- Lead hoặc doanh thu chắc chắn trong bảy ngày.
- AI tự viết và tự đăng hoàn toàn.
- Tự động hóa toàn bộ content marketing.
- Thay thế judgment của founder.
- Plugin, agent, API, MCP hoặc hệ thống kỹ thuật phức tạp.

## 5. Sáu giới hạn bắt buộc

Toàn bộ challenge chỉ dùng:

- một business;
- một offer;
- một nhóm khách hàng;
- một vấn đề khách hàng;
- một dạng content chính;
- một kênh chính.

Mặc định đề xuất là bài text 400–800 chữ trên Facebook hoặc LinkedIn. Video,
carousel, email và đa kênh là phần mở rộng sau challenge.

## 6. Kiến trúc trải nghiệm

### 6.1. Route graph

```text
/challenge/content-workflow-7days
  /day-01
  /day-02
  /day-03
  /day-04
  /day-05
  /day-06
  /day-07
```

Route gốc là trang giới thiệu, readiness check, trạng thái resume và bản đồ bảy
ngày. Mỗi route ngày là một lesson/workbench độc lập có canonical riêng. Tất cả route
được static export trong Next.js hiện tại.

Challenge được thêm vào Experience Registry và xuất hiện tại `/experiences` với:

- type: `challenge`;
- access: `public`;
- label: `Miễn phí · Không cần tài khoản`;
- duration: `7 ngày · 45–60 phút/ngày`;
- output: `Một Content Workflow Starter Kit có thể dùng lại mỗi tuần`.

Prefix `/challenge/content-workflow-7days` dùng route mode `evidence-dossier` và
site chrome hiện tại. Không tạo một navigation system cạnh tranh với website.

### 6.2. Nhịp mỗi ngày

Mỗi ngày có đúng bốn phần theo thứ tự:

1. **Học một ý:** một threshold concept, đọc trong 8–12 phút.
2. **Xem một ví dụ:** cùng một case mô phỏng xuyên suốt, 5–8 phút.
3. **Làm một việc:** workbook áp dụng vào business thật, 25–40 phút.
4. **Qua Quality Gate:** kiểm tra artifact, sửa nếu cần, sau đó đánh dấu hoàn thành.

Case mô phỏng phải được dán nhãn rõ là ví dụ tổng hợp phục vụ giảng dạy, không phải
testimonial, customer proof hoặc case kinh doanh có thật.

### 6.3. Không khóa theo lịch

- Tất cả bảy ngày mở ngay.
- Người học có thể hoàn thành nhanh hơn hoặc chậm hơn bảy ngày.
- Giao diện chỉ khuyến nghị bước tiếp theo, không chặn truy cập.
- Resume đưa người học tới ngày đang mở gần nhất, sau đó mới tới ngày chưa hoàn thành
  đầu tiên.

## 7. Chương trình bảy ngày

### Ngày 1 — Content không dành cho tất cả mọi người

**Câu hỏi:** Tôi đang tạo content cho ai?
**Threshold concept:** Một content chỉ có thể rõ khi người viết khóa một nhóm khách
hàng và một tình huống cụ thể.
**Artifact:** `Customer Focus Card` gồm business, offer, customer group, current
situation, primary problem và desired movement.
**Quality Gate:** Không dùng audience như “mọi người”, “chủ doanh nghiệp” hoặc “phụ
nữ” nếu thiếu tình huống và vấn đề cụ thể.
**Bản tối thiểu:** Một câu customer focus hoàn chỉnh.

### Ngày 2 — AI chỉ tốt bằng dữ liệu anh đưa cho nó

**Câu hỏi:** Tôi biết gì thật về họ?
**Threshold concept:** Customer evidence mạnh hơn persona do AI tưởng tượng.
**Artifact:** `Customer Voice Mini Bank` có ít nhất năm dòng: bằng chứng/câu nói,
hoàn cảnh, nguồn và điều có thể hiểu.
**Quality Gate:** Không coi câu do AI tạo ra là customer evidence; không đưa PII hoặc
dữ liệu nhạy cảm không cần thiết vào workbook.
**Bản tối thiểu:** Ba evidence thật và kế hoạch tìm thêm hai evidence.

### Ngày 3 — Một content chỉ nên làm một việc chính

**Câu hỏi:** Content này phải làm việc gì?
**Threshold concept:** Một bài content chỉ chọn một job chính.
**Ba lựa chọn:** giúp khách hàng nhận ra vấn đề; hiểu nguyên nhân; hoặc thử một bước
tiếp theo.
**Artifact:** `Content Job Card` gồm selected evidence, job, belief before, expected
shift và next action.
**Quality Gate:** Không gộp cả awareness, education, selling và conversion thành một
job mơ hồ.

### Ngày 4 — Brief trước, prompt sau

**Câu hỏi:** Làm sao brief AI cho đúng?
**Threshold concept:** Prompt không cứu được một content brief thiếu quyết định.
**Artifact:** `Reusable Content Brief` gồm audience, offer context, evidence, content
job, core message, format, channel, voice constraints, must include, must avoid và
call to action.
**Quality Gate:** Mọi field quan trọng phải dùng quyết định từ ba ngày trước; không
điền bằng từ ngữ chung chung chỉ để vượt gate.

### Ngày 5 — Workflow không phải một prompt thật dài

**Câu hỏi:** Làm sao biến brief thành workflow?
**Threshold concept:** Workflow là chuỗi bước có input, output và Quality Gate, không
phải một mega-prompt.
**Flow:** brief → ba góc khai thác → chọn một góc → outline → draft → self-check →
revision request.
**Artifact:** `Content Workflow Prompt v1` được tạo từ dữ liệu đã nhập nhưng vẫn cho
người học sửa trước khi sao chép.
**Quality Gate:** Prompt giữ rõ input thật, vai trò từng bước, output contract và điểm
con người quyết định.

### Ngày 6 — Bản nháp đầu tiên là nguyên liệu

**Câu hỏi:** Workflow có tạo được content dùng thật không?
**Threshold concept:** Một demo đẹp không chứng minh workflow ổn định; phải chạy ba
lần và tìm lỗi lặp lại.
**Artifact:** Ba ô content draft, mỗi ô có score và revision note.
**Checklist:** đúng customer, dùng evidence, làm đúng content job, có thesis rõ,
không bịa claim, không generic, đúng voice constraints, CTA phù hợp.
**Quality Gate:** Có ít nhất hai draft vượt ngưỡng tự chấm và mỗi draft có một quyết
định sửa do người học ghi lại.

### Ngày 7 — Workflow chỉ tồn tại khi được dùng

**Câu hỏi:** Làm sao tiếp tục dùng mà không bắt đầu lại?
**Threshold concept:** Workflow chỉ có giá trị khi tạo đầu ra ngoài đời và giữ được
feedback loop.
**Artifact:** Chọn content tốt nhất, ghi trạng thái publish/share, signal ban đầu,
đóng gói One-Pager và tạo sáu đề mục cho 14 ngày tiếp theo.
**Final Quality Gate:** Có tối thiểu sáu trong tám artifact, bắt buộc gồm Customer
Focus, Evidence Bank, Brief, Workflow Prompt, hai content và One-Page Workflow.

Không bắt website xác minh social URL là thật. Người học tự xác nhận trạng thái và có
thể lưu URL hoặc ghi “đã gửi cho khách hàng/đội ngũ” thay vì public post.

## 8. Workbench và hành vi giao diện

### 8.1. Trang gốc

Thứ tự nội dung:

1. Hero với headline `7 ngày tự xây Content Workflow đầu tiên bằng AI`.
2. Subhead giữ đúng promise nhỏ và thật.
3. Một primary CTA: `Bắt đầu với một offer`.
4. Readiness check bốn câu.
5. Output map bảy ngày.
6. Ranh giới “anh sẽ không nhận / anh sẽ tự tạo”.
7. Đối tượng phù hợp/không phù hợp.
8. Resume state nếu trình duyệt đã có tiến độ.

Không đặt email form, pricing, testimonial, countdown hoặc CTA Conan Maker ở first
viewport. Handoff Conan chỉ xuất hiện sau khi người học hoàn thành hoặc ở cuối trang.

### 8.2. Desktop lesson workbench

- Rail bên trái: bảy ngày, trạng thái hiện tại và tiến độ tổng.
- Canvas trung tâm: lesson, case mẫu, corrective path và Quality Gate.
- Artifact desk bên phải hoặc vùng liền kề: field nhập liệu và preview artifact.
- Sticky actions chỉ gồm lưu state, copy/export phù hợp và bước tiếp theo.
- Không dùng dashboard card grid, nested cards hoặc chrome giống SaaS chung chung.

### 8.3. Mobile lesson workbench

- Một cột theo thứ tự `Học → Xem → Làm → Kiểm`.
- Progress rail thu gọn nhưng vẫn truy cập đủ bảy ngày.
- Không dùng fixed split-pane hoặc sticky footer che input.
- Touch target tối thiểu 44×44 px; không có horizontal overflow ở 320 px.

### 8.4. Trạng thái hệ thống

Giao diện có trạng thái rõ cho:

- chưa bắt đầu;
- đang làm;
- đã lưu trên thiết bị;
- chưa qua Quality Gate;
- hoàn thành ngày;
- hoàn thành challenge;
- localStorage không khả dụng;
- dữ liệu cũ/corrupt bị bỏ qua an toàn;
- copy thành công/thất bại;
- export thành công;
- reset có xác nhận.

Website vẫn dùng được nếu localStorage hoặc clipboard API thất bại; khi đó hiển thị
hướng dẫn copy thủ công và cảnh báo tiến độ không thể được lưu.

## 9. Hướng thị giác

### Visual thesis

`Content Operations Fieldbook`: một bàn tác chiến content có tính biên tập, nơi brief,
evidence, annotation, Quality Gate và revision cùng hiện diện như tài liệu vận hành
đang được xây.

### Nguyên tắc

- Màu nền đen than, giấy sáng và oxblood kế thừa hệ thống thongphan.com nhưng không
  bê nguyên motif Brain2.
- Cảm giác tactile đến từ giấy, line, margin note, stamp và nhịp editorial; không dùng
  fantasy, AI gradient hoặc gamification hoạt hình.
- Typography phân biệt rõ lesson prose, artifact content, form control và metadata.
- Một motif tiến độ xuyên suốt, không lặp lại bảy card giống nhau.
- Motion chỉ phục vụ progress, saved state, section transition và artifact assembly.
- Tôn trọng `prefers-reduced-motion`.

Trước khi viết UI production, phải tạo Image Gen concept cho ít nhất:

1. Trang gốc desktop.
2. Lesson workbench desktop.
3. Lesson workbench mobile.
4. Ngày 7 — Starter Kit completion state.

Concept được anh Thông duyệt là source of truth cho copy, hierarchy, palette,
typography, spacing, container model, imagery và responsive behavior. Không triển khai
UI trước approval này.

### Visual contract đã duyệt ngày 08/08/2026

1. Hub desktop: `docs/visual/content-workflow-7days/hub-desktop-approved.png`
2. Workbench desktop: `docs/visual/content-workflow-7days/workbench-desktop-approved.png`
3. Workbench mobile: `docs/visual/content-workflow-7days/workbench-mobile-approved.png`
4. Ngày 7 hoàn thành: `docs/visual/content-workflow-7days/day-07-completion-approved.png`

Các ảnh trên khóa art direction, hệ phân cấp, bố cục, nhịp khoảng trắng, màu sắc và
mô hình container. Chữ do mô hình tạo ảnh tự điền không thay thế learner-facing copy,
validation hoặc completion rule trong đặc tả này. UI production phải dùng nội dung và
logic chính xác từ các mục 7–17; đặc biệt mobile không được sao chép validation mẫu
không nhất quán trong ảnh, và Ngày 7 phải giữ quy tắc hoàn thành sáu-trong-tám cùng
các artifact bắt buộc.

## 10. Dữ liệu và lưu trữ cục bộ

### 10.1. Ranh giới

- Không gửi workbook, customer quote, draft, URL hoặc progress lên server.
- Không cần account, cookie định danh, D1, KV, R2, Worker hoặc API mới.
- Dữ liệu thuộc về một browser profile trên một thiết bị.
- Người học được thông báo rõ giới hạn này trước khi nhập dữ liệu.

### 10.2. Storage contract

Một key versioned duy nhất:

```text
tp.content-workflow-7days.v1
```

Shape logic:

```ts
type ChallengeStateV1 = {
  schemaVersion: 1
  updatedAt: string
  currentDay: 1 | 2 | 3 | 4 | 5 | 6 | 7
  completedDays: number[]
  readiness: Record<string, boolean>
  artifacts: {
    customerFocus: Record<string, string>
    evidenceBank: Array<Record<string, string>>
    contentJob: Record<string, string>
    contentBrief: Record<string, string | string[]>
    workflowPrompt: string
    drafts: Array<Record<string, string | number | boolean>>
    onePager: Record<string, string>
    fourteenDayPlan: Array<Record<string, string>>
  }
}
```

Parser phải fail closed với JSON lỗi, schema version lạ, array quá kích thước hoặc
field không đúng kiểu. Dữ liệu người dùng chỉ render như text/value do React quản lý;
không dùng `dangerouslySetInnerHTML` và không tạo preview HTML từ draft.

### 10.3. Save, export và reset

- Autosave sau khi người học dừng nhập một khoảng ngắn; không ghi từng keystroke.
- Hiển thị thời điểm lưu gần nhất bằng ngôn ngữ tự nhiên.
- Export một file Markdown có timestamp trong tên và đủ tám artifact.
- Copy riêng Master Prompt và Starter Kit nếu Clipboard API khả dụng.
- Reset toàn bộ chỉ sau một confirm dialog mô tả dữ liệu sẽ mất trên thiết bị.
- Không tự động import file trong v1.

## 11. Completion và Quality Gate

Completion không được tạo từ scroll depth, thời gian mở trang hoặc việc click “tiếp”.
Mỗi ngày có pure validation function kiểm tra tối thiểu:

- required fields;
- độ cụ thể tối thiểu hợp lý;
- số lượng evidence/draft/plan item;
- lựa chọn content job hợp lệ;
- self-review và revision note ở ngày 6;
- final artifact coverage ở ngày 7.

Validation chỉ kiểm cấu trúc và nhắc tự đánh giá; không tuyên bố content “hay” hoặc
“đạt chuẩn thị trường”. Human judgment vẫn là điểm quyết định cuối.

## 12. Content governance

- Content public của bảy ngày được giữ trong source TypeScript có schema rõ, không
  nhúng một file attachment 1.688 dòng trực tiếp vào component.
- Một case mô phỏng xuyên suốt; mọi claim mô phỏng được ghi nhãn.
- Không dùng testimonial, tên người, doanh thu hoặc metric nếu chưa có proof và quyền
  sử dụng.
- UI ưu tiên tiếng Việt; giữ tiếng Anh cho tên artifact và thuật ngữ kỹ thuật cần thiết.
- Không đưa nội dung cohort, giá 490.000đ, live session, email sequence, peer review
  hoặc conversion countdown vào bản self-guided này.

## 13. SEO, discovery và journey

- Canonical gốc: `https://thongphan.com/challenge/content-workflow-7days`.
- Từng ngày có title/description/canonical riêng.
- Route gốc indexable; route ngày cũng indexable vì toàn bộ content miễn phí và có
  giá trị độc lập, nhưng tránh duplicate copy giữa hub và lesson.
- Thêm route vào sitemap.
- Experience Registry là nguồn discovery chính; không hồi sinh `/challenges` cũ.
- Sau hoàn thành, handoff chính là tiếp tục dùng workflow trong 14 ngày.
- Conan Maker chỉ là handoff phụ có lý do: xây tiếp SOP/AI Workflow cho bottleneck
  doanh nghiệp khác. Không mô tả Conan như “nhiều bài học hơn”.

## 14. Analytics và riêng tư

Bản v1 không thêm event API hoặc identity tracking. Chỉ chấp nhận traffic aggregate
đang có ở Cloudflare nếu website hiện tại đã bật. Nội dung workbook và completion
state không rời thiết bị.

Điều này có nghĩa không đo được completion funnel chính xác trong v1. Nếu cần pilot
analytics về sau, nó phải là release riêng với event contract coarse-grained, consent,
retention và tuyệt đối không gửi nội dung artifact.

## 15. Khả năng truy cập

- Một semantic `h1` cho mỗi route.
- Form field có label thật, description và error liên kết bằng `aria-describedby`.
- Error summary có thể focus và đưa người học tới field cần sửa.
- Không dùng màu làm tín hiệu duy nhất.
- Focus visible; điều hướng và dialog dùng được bằng bàn phím.
- Touch target tối thiểu 44×44 px.
- Text body public tối thiểu 16 px; control typography được định nghĩa rõ.
- Tôn trọng reduced motion và high contrast hợp lý.
- Live region chỉ dùng cho saved/copy state ngắn, không spam khi autosave.

## 16. Kiến trúc implementation dự kiến

Giữ Next.js, React, TypeScript, CSS Modules và Lucide đang có. Không thêm dependency.

Ranh giới module dự kiến:

```text
app/challenge/content-workflow-7days/       routes + route-local styles
components/content-workflow/                workbench UI và controls
lib/content-workflow/content.ts             lesson/case/template source
lib/content-workflow/model.ts               types, validation, progression
lib/content-workflow/storage.ts             parse/read/write local state
lib/content-workflow/export.ts              Markdown generation
scripts/content-workflow-*.test.ts|mjs      contract và domain tests
```

Tái sử dụng site chrome, route mode, Experience Registry, semantic tokens, focus
patterns và test harness hiện có. Không tạo design system, storage abstraction hoặc
form framework mới cho một challenge.

## 17. Tiêu chí nghiệm thu

### Product

- [x] Route gốc và đủ bảy route ngày trả về 200 trong static artifact.
- [x] Mỗi ngày có lesson, case, task, artifact, bản tối thiểu và Quality Gate thật.
- [x] Toàn bộ nội dung phản ánh đúng execution contract trong attachment.
- [x] Không có account, paywall, email requirement hoặc server-side artifact storage.

### Workflow

- [x] Readiness check dẫn vào ngày 1 và không khóa người thiếu evidence.
- [x] Người học điền workbook, refresh và tiếp tục từ trạng thái đã lưu.
- [x] Ngày 5 tạo Master Prompt từ dữ liệu ngày 1–4 và cho phép chỉnh sửa.
- [x] Ngày 6 giữ ba draft, score và revision note độc lập.
- [x] Ngày 7 tạo One-Pager, kế hoạch 14 ngày và final completion state.
- [x] Export Markdown có đủ artifact và không chứa HTML thực thi.
- [x] Reset cần xác nhận và xóa đúng một key versioned.

### Quality, privacy và safety

- [x] Corrupt/stale storage không làm crash UI.
- [x] localStorage/clipboard failure có fallback usable.
- [x] Không có workbook payload trong request, log hoặc generated server artifact.
- [x] User text không được render như HTML.
- [x] Completion không dựa trên scroll/time-on-page.
- [x] Case mô phỏng không bị trình bày như bằng chứng thật.

### Discovery và visual

- [x] Challenge xuất hiện đúng trong `/experiences`.
- [x] Sitemap, metadata, canonical, route mode và journey contracts được cập nhật.
- [x] Browser QA đạt ở 1440×900, 1280×800, 390×844 và 320×568.
- [x] Không horizontal overflow, clipped input, broken image hoặc console error.
- [x] Render desktop/mobile được so trực tiếp với concept đã duyệt bằng `view_image`.
- [x] Above-the-fold copy không lệch khỏi copy đã duyệt.
- [x] Core workflow được click-through từ readiness tới export.

### Repository và release

- [x] Focused tests, full `npm test`, `npx tsc --noEmit`, `npm run lint`,
  `npm run build`, `npm run test:release` và `git diff --check` đều pass.
- [x] `docs/STATUS.md` và release QA report có evidence thật.
- [x] Commit chỉ chứa file trong phạm vi challenge.
- [x] Push branch, preview deploy, preview browser QA, production deploy và production
  smoke được thực hiện theo `docs/DEPLOYMENT.md`.
- [x] Ghi lại previous deployment ID trước khi production promotion để rollback.
- [x] Production URL canonical trả 200 và toàn bộ bảy day route hoạt động.

## 18. Non-goals của bản self-guided v1

- Account, cross-device sync hoặc cloud backup.
- Email daily reminder.
- Community thread, peer review, submission hoặc mentor review.
- Live kickoff, clinic hoặc showcase.
- Payment, application hoặc cohort operations.
- AI generation bên trong website.
- Social publishing hoặc analytics chuyên sâu.
- Plugin, Codex Skill, Custom GPT hoặc multi-agent workflow.
- PDF renderer riêng, file import hoặc dashboard quản trị.
- Capability Map cá nhân hóa tự động.

## 19. Rủi ro và cách giảm

### Người học mất dữ liệu khi đổi máy/xóa browser storage

Nêu rõ giới hạn, autosave, hiển thị saved state và cho export Markdown bất cứ lúc
nào. Cross-device sync chỉ được cân nhắc sau bằng chứng sử dụng.

### Attachment quá nhiều nội dung làm lesson nặng

Mỗi ngày chỉ giữ một threshold concept và một artifact bắt buộc. Phần marketing,
cohort, live, email, pricing và conversion bị loại khỏi learner runtime v1.

### Quality Gate tạo ảo tưởng AI chấm đúng

Validation chỉ kiểm cấu trúc và self-review. Copy nói rõ founder là người quyết định
về quality, claim, voice và việc xuất bản.

### Giao diện đẹp nhưng giống landing page hơn công cụ học

Concept phải thể hiện workbench có state thật. Browser QA bắt buộc kiểm việc nhập,
resume, copy, revision, export và reset chứ không chỉ chụp hero.

### Challenge drift khỏi định vị Conan mới

Audience và handoff giữ focus vào founder/business/owner dependency. Content workflow
là một Transformation Bet nhỏ, không biến Conan Maker thành khóa content chung chung.

## 20. Definition of Done

Challenge chỉ được gọi là hoàn thành khi:

1. Nội dung bảy ngày và tám artifact tồn tại thật trong sản phẩm.
2. Người học có thể đi toàn bộ luồng trên desktop và mobile mà không cần tài khoản.
3. State local, Quality Gate, Master Prompt, export và reset đã được test bằng browser.
4. Concept được triển khai faithful, không còn mismatch có thể sửa.
5. Full release gate pass trên exact commit.
6. Preview và production đều qua smoke; canonical URL trả 200.
7. GitHub branch/commit, Cloudflare deployment IDs, rollback point và QA evidence được
   ghi trong repo.
