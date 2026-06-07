# PRD — thongphan.com v2

## 1. Product Summary

`thongphan.com` v2 là personal-brand hub của Thông Phan trong thời AI. Sản phẩm giúp người có chuyên môn đi từ hoang mang/FOMO sang sáng tỏ/kiểm soát thông qua nội dung sâu, Brain2 chat, diagnostic/challenge và route tự nhiên về Conan Trial/Maker.

## 2. Problem Statement

Người có 3-15 năm kinh nghiệm đang thấy AI thay đổi công việc nhưng không biết nên làm gì:

- Họ không thiếu tool.
- Họ thiếu bản đồ.
- Họ có chuyên môn thật nhưng chưa biết biến nó thành content, tài sản số, AI assistant, offer và hệ thống tăng trưởng.
- Họ sợ người khác biết dùng AI + content + phễu tốt hơn sẽ vượt mình.

Website hiện tại có nhiều asset đúng nhưng chưa dẫn người đọc qua một journey rõ. V2 cần biến website thành entry point chiến lược cho toàn bộ ecosystem.

## 3. Goals

### Business Goals

- Tăng lead chất lượng cho Conan Trial/Maker.
- Tăng trust trước khi user gặp offer 13tr/năm.
- Biến Brain2/content proof thành lợi thế cạnh tranh public.
- Tạo SEO/content compound quanh AI Expertise OS.

### User Goals

- Hiểu mình đang kẹt ở đâu trong AI transformation.
- Bớt FOMO vì biết không cần chạy theo tất cả tool.
- Thấy cách dùng kinh nghiệm thật làm lợi thế.
- Có bước tiếp theo rõ: đọc, chat, làm challenge, vào trial, tham gia Maker.

### Brand Goals

- Củng cố định vị “Clarity in Chaos”.
- Không bị flatten thành AI tips/content tips/personal branding chung chung.
- Chứng minh Thông là người đã build system thật, không chỉ dạy lý thuyết.

## 4. Non-goals

- Không biến `thongphan.com` thành sales page trực tiếp cho Conan Maker.
- Không xây full LMS/community trong site này.
- Không tạo CMS/admin nếu markdown file-based còn đủ.
- Không mở rộng sang quá nhiều chủ đề ngoài AI, expertise, content, Brain2, business of expertise.
- Không làm redesign chỉ để đẹp hơn mà không tăng clarity/conversion.

## 5. Target Audience

### Primary Persona — Người Có Chuyên Môn Bị Kẹt

- 3-15 năm kinh nghiệm.
- Coach, trainer, consultant, freelancer senior, marketer, founder dịch vụ nhỏ, manager, creator có chuyên môn.
- Có năng lực thật nhưng chưa hệ thống hóa thành tài sản.
- Đã hoặc đang bán 1-1, muốn scale nhưng không biết đóng gói.
- Dùng AI lẻ tẻ nhưng output generic.

Core pain:

- “Tôi có kinh nghiệm nhưng thị trường không thấy.”
- “Tôi biết AI mạnh nhưng không biết dùng vào hệ thống của mình.”
- “Tôi không muốn học tips rẻ tiền.”
- “Tôi muốn biến thứ trong đầu thành content/lead magnet/offer.”

### Secondary Persona — Người Đi Làm FOMO Vì AI

- Có thu nhập, có kinh nghiệm, chưa bị thay thế nhưng lo.
- Thấy bạn bè khoe AI workflow/tool.
- Cần relief và map trước khi mua sâu.

### Not For

- Beginner hoàn toàn chưa có nền.
- Người chỉ muốn tool list/prompt hack.
- Người muốn kiếm tiền nhanh không chịu thực hành.
- Developer/coder đã có lộ trình AI riêng.

## 6. Core Positioning

Hero-level promise:

> AI không cướp việc bạn. Người dùng AI giỏi hơn bạn mới cướp.

Product-level explanation:

> Tui giúp người có chuyên môn biến kinh nghiệm thật thành content kéo khách, tài sản số và hệ thống AI tăng trưởng.

Conan bridge:

> Nếu bạn muốn đi xa hơn, Conan Maker là nơi biến hệ này thành practice, community và output thật.

## 7. User Journey

### Journey A — Problem-aware Reader

1. Vào homepage từ Facebook/Google/referral.
2. Gặp tension về AI và thu nhập.
3. Thấy proof thật: 40+ viral posts, Brain2, Conan, workflow.
4. Chọn `Đọc bài nền tảng`.
5. Đọc blog cornerstone.
6. CTA cuối bài: làm diagnostic/chat/vào trial.

### Journey B — Curious About Brain2

1. Vào bài Brain2 hoặc `/chat`.
2. Hỏi câu cụ thể.
3. Nhận câu trả lời có context.
4. Thấy “knowledge system” hoạt động.
5. CTA: xây hệ thống tương tự trong challenge/trial/Conan Maker.

### Journey C — Ready To Act

1. Click diagnostic/challenge.
2. Nhận kết quả/bài tập.
3. Có output nhỏ.
4. Được route sang `trial.conan.school` để tiếp tục.
5. Sau nurture, sang `com.conan.school`/Conan Maker.

## 8. Information Architecture

### MVP Sitemap

```
/
/start-here hoặc /diagnostic   (optional MVP; nếu chưa build, route về /chat)
/blog
/blog/[slug]
/chat
/challenges
/challenges/brain2-21-ngay
/about
```

### Future Sitemap

```
/
/diagnostic/ai-transformation
/playbooks
/playbooks/brain2
/playbooks/content
/playbooks/ai-workflow
/case-studies
/blog
/chat
/about
```

Không nên thêm future pages trước khi có đủ content/proof.

## 9. Feature Requirements

### F1 — Homepage Narrative v2

Must have:

- Hero tension rõ về AI + người dùng AI + chuyên môn.
- Subhead nói rõ ai được giúp và outcome.
- Proof strip.
- “System map” section giải thích Brain2 -> Content -> AI workflow -> Conan.
- Entry cards theo intent, không theo feature đơn thuần.
- Conan bridge section align `trial`/`com`.

Acceptance:

- Người đọc mới hiểu trong 10 giây website này giúp ai, giúp việc gì, bằng proof gì.
- Primary CTA duy nhất rõ, secondary CTA không tranh chấp.

### F2 — Blog as Clarity Library

Must have:

- Blog taxonomy align AI Expertise OS.
- Cornerstone posts surfaced.
- Per-post CTA theo intent.
- Related posts dẫn theo journey, không random.

Acceptance:

- Blog listing không chỉ là archive 4 bài.
- Mỗi bài có role trong funnel: relief, clarity, mastery, proof, conversion.

### F3 — Chat as Brain2 Proof

Must have:

- Chat framed as “hỏi Brain2 của tui”, not generic chatbot.
- Suggested questions align target persona.
- CTA after interaction: next step into challenge/trial.
- Trust note: AI trả lời dựa trên Brain2/tri thức đã hệ thống hóa.

Acceptance:

- User hiểu chat là demo của AI Knowledge System, không chỉ chatbot vui.

### F4 — Challenge/Diagnostic Bridge

Must have:

- Challenge 21 ngày Brain2 positioned as first transformation.
- Email signup flow can remain in MVP.
- Success state routes user to next step.
- Future diagnostic spec maps to `trial.conan.school`.

Acceptance:

- Challenge không tự tách khỏi Conan ecosystem.

### F5 — About as Proof Arc

Must have:

- Timeline được interpret theo “đã đi qua hỗn loạn -> tìm ra clarity -> build system”.
- Proof grouped by capabilities: marketing, content, business, AI system, teaching/community.
- CTA contextual, not generic “muốn phát triển cùng nhau”.

Acceptance:

- About page tăng trust cho promise, không chỉ kể đời.

### F6 — CTA Architecture

Must have:

| User state | CTA |
|---|---|
| Hoang mang | Diagnostic / Start Here |
| Muốn hiểu sâu | Blog cornerstone |
| Có câu hỏi riêng | Chat |
| Muốn thực hành nhẹ | Challenge |
| Sẵn sàng vào ecosystem | `trial.conan.school` |
| Sẵn sàng trả phí | `com.conan.school` |

Acceptance:

- No random external CTA.
- No generic newsletter unless tied to a strategic flow.

## 10. Content Requirements

Minimum v2 launch content:

- Homepage rewritten.
- About rewritten.
- Blog listing has taxonomy/intents.
- Existing 4 posts mapped into pillars.
- At least 3 planned cornerstone placeholders in docs.
- Chat suggested questions updated.
- Challenge copy updated to bridge ecosystem.

## 11. UX Requirements

- First viewport must communicate promise, proof and primary action.
- Keep nav short.
- Avoid card overload.
- Make routes scannable for mobile.
- Ensure text never overlaps floating visual elements.
- CTAs must be label-specific, not vague.
- Page sections should form a narrative, not a feature list.

## 12. UI Requirements

- Keep dark editorial/professional base if it supports brand.
- Reduce decorative glow/card excess where it competes with content.
- Use real images/proof screenshots where possible.
- Favor dense, readable sections over marketing fluff.
- Cards max radius should be restrained in new UI unless existing design system requires otherwise.
- Avoid one-note purple/blue/gold gradient dominance.

## 13. Technical Requirements

- Preserve Next app router.
- Preserve markdown blog pipeline unless a better parser is needed.
- Set `metadataBase`.
- Add per-page metadata.
- Add analytics events for CTA clicks and chat usage.
- Audit Cloudflare Workers before changing signup/chat.
- Keep build green.
- Do not overwrite current dirty worktree changes.

## 14. Metrics

### Leading Metrics

- Homepage primary CTA click rate.
- Blog -> CTA click rate.
- Chat starts and completed responses.
- Challenge signups.
- Trial outbound clicks.

### Quality Metrics

- Time on cornerstone posts.
- Scroll depth.
- Return visits.
- Comment/DM patterns: “rõ rồi”, “bớt sợ”, “biết làm gì”.

### Business Metrics

- `thongphan.com` -> `trial.conan.school` signups.
- Trial -> `com.conan.school` upgrades.
- Conan Maker attribution from website.

## 15. Open Questions

1. Primary CTA v2 là diagnostic, chat hay trial?
2. Challenge 21 ngày Brain2 giữ email flow hay migrate sang trial?
3. `Conan Elite` còn là offer thật không, hay phải remove/rename theo Conan Maker model mới?
4. Có analytics access để baseline conversion không?
5. Có screenshot/testimonial thật từ Conan Maker để dùng làm proof không?

