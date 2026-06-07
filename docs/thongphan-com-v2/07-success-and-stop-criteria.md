# Success And Stop Criteria — thongphan.com v2

## 1. Why This Exists

Goal này dễ phình scope vì nó chạm brand, content, UI, funnel, Conan, Brain2 và tech. Tài liệu này định nghĩa khi nào planning/build được coi là đủ, khi nào phải dừng lại chốt quyết định, và khi nào chưa được gọi là xong.

## 2. Planning Phase Definition Of Done

Planning phase đạt khi có bằng chứng trong docs rằng:

- Strategic role của website được định nghĩa trong 1 câu.
- Target audience rõ, gồm “for” và “not for”.
- Homepage narrative có thứ tự section cụ thể.
- CTA architecture align Conan Platform Architecture.
- Blog/content pillars align AI Expertise OS.
- Chat, Challenge, About có vai trò riêng trong funnel.
- UX/IA spec có sitemap và user journey.
- Visual direction đủ cụ thể để designer/dev build.
- Technical plan có phase, files, risks, verification commands.
- Success metrics và stop criteria rõ.

Planning phase chưa đạt nếu:

- Website vẫn có thể bị hiểu là blog cá nhân chung chung.
- CTA vẫn mâu thuẫn giữa email/newsletter/challenge/trial/com.
- Conan Maker model 13tr/năm không được phản ánh.
- Brain2 chỉ là buzzword, chưa thành product proof.
- Không có criteria để chống scope creep.

## 3. Build Phase Definition Of Done

V2 launch candidate đạt khi:

### Strategy

- First viewport nói rõ: ai được giúp, vấn đề gì, outcome gì.
- Site không còn dùng “người trẻ” làm audience chính nếu chưa chốt lại.
- Personal brand, Brain2 và Conan nối thành một hệ logic.

### Content

- Homepage copy rewritten.
- About proof arc rewritten.
- Chat prompts updated.
- Challenge copy updated.
- Existing blog posts mapped into strategic categories.
- At least one clear path for new visitors.

### UX/UI

- Desktop and mobile checked.
- No text overlap.
- CTA hierarchy clear.
- Footer links correct.
- Visual hierarchy supports strategy.

### Technical

- `npm run build` passes.
- Metadata warning resolved or documented if deferred.
- No unrelated files reverted.
- No worker flow broken.

### Funnel

- Primary CTA route confirmed.
- Conan outbound destinations confirmed.
- Challenge success has next steps.
- Blog posts have next-step CTA.

## 4. Stop Criteria

Stop planning and ask anh to decide if any of these remain unresolved:

- Primary CTA cannot be chosen between diagnostic/chat/trial.
- Canonical Conan URLs are unknown.
- Conan Elite/Maker offer structure is uncertain.
- Challenge should move to trial but platform endpoint is unavailable.
- Visual direction requires new assets that do not exist.
- Analytics access is required for claims but unavailable.

Stop implementation if:

- Build fails for unrelated pre-existing reasons and cannot be isolated.
- Dirty worktree changes conflict with required edits.
- A Worker/API endpoint requires credentials or deployment state not visible locally.
- A design change cannot be verified on mobile.

## 5. Success Metrics

### Minimum Launch Metrics

Measure:

- Homepage primary CTA click rate.
- Blog CTA click rate.
- Chat starts.
- Challenge signup completion.
- Conan outbound clicks.

### Quality Signals

Qualitative:

- Comments/DMs use language like “rõ hơn”, “bớt sợ”, “biết làm gì”.
- Users ask about building their own Brain2/system.
- Users understand Conan Maker is practice/community, not a random course.

### Business Signals

Eventually:

- Trial signups attributed to `thongphan.com`.
- Trial -> Conan Maker conversion.
- Qualified calls/inquiries from people with existing chuyên môn.

## 6. Token / Work Control Rules

Use this order:

1. Brain2 source notes before strategic changes.
2. Current repo/live site before implementation claims.
3. Docs before code when strategic decision is unsettled.
4. Code changes only after scope/CTA/page role is clear.
5. Build/test before claiming technical completion.

Avoid:

- Re-explaining all Brain2 notes in every doc.
- Redesigning before deciding CTA.
- Building new backend features before copy/IA coherence.
- Treating visual polish as strategic progress.

## 7. Completion Audit Checklist

Before marking the goal complete, verify:

- `docs/thongphan-com-v2/` exists with all planned docs.
- PRD covers strategy, content, UX/UI, success criteria, stop criteria, roadmap.
- Current site/repo audit is grounded in inspected files/live routes.
- Brain2 sources are named.
- Build command has been run after doc/code changes if relevant.
- If implementation has started, each changed route is checked.
- No open requirement from the original objective is missing.

## 8. Current Goal Status

As of this doc creation:

- Planning artifacts are created.
- Implementation has not started.
- Goal should remain active until anh reviews/chốt hướng or build phase is completed according to agreed scope.

