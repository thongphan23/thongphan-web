# 📋 Sổ Bàn Giao v4 — Deploy + AI Chat (Agent Team)

> ⚠️ NGUỒN SỰ THẬT DUY NHẤT.

---

## TRẠNG THÁI

Phase 1-3 hoàn tất: Next.js 16, 7 routes, build pass, content thật, QA sạch.  
**Phase này:** Deploy lên Cloudflare Pages + Build AI Chat — chạy song song 2 sub-agent.

---

## TEAM DESIGN

| Teammate | Task | File spec |
|----------|------|-----------|
| `deploy-agent` | Cloudflare Pages + Workers + D1 + Domain | `.claude/handoff-deploy.md` |
| `chat-agent` | AI Chat RAG + Vectorize + Chat UI | `.claude/handoff-chat.md` |

**Dependency:** 2 agent chạy SONG SONG — không phụ thuộc nhau.  
`deploy-agent` cần wrangler login. `chat-agent` cần Vectorize index + Workers AI.

---

## SPAWN PROMPTS

### deploy-agent:
> "You are a Cloudflare deployment specialist. Read `/Users/rio/thongphan-com/.claude/handoff-deploy.md` and execute ALL steps from STEP 1 to DONE CONDITION. Run all CLI commands, fix any errors encountered, and repeat QA until all checkboxes pass. Write results to 'KẾT QUẢ PHIÊN' in that file."

### chat-agent:
> "You are an AI/RAG specialist. Read `/Users/rio/thongphan-com/.claude/handoff-chat.md` and execute ALL steps from STEP 1 to DONE CONDITION. Build the embed script, deploy chat worker, build chat UI, run QA vòng 1-4. Fix bugs found. Write results to 'KẾT QUẢ PHIÊN' in that file."

---

## DONE CONDITION (toàn phiên)

Phiên xong khi CẢ 2 agent báo done:
- **deploy-agent:** `curl https://thongphan.com` → 200, signup API hoạt động
- **chat-agent:** Chat page stream response, đúng giọng "tui", RAG có context

---

## KẾT QUẢ PHIÊN

### [2026-05-04 04:31] Phase 4 — Deploy + AI Chat (Agent Team)
**Ai ghi:** Claude Code
**Status:** ⚠️ Hoàn thành một phần

**2 agents đã spawn:**
- **deploy-agent** — Deploy to Cloudflare Pages + Workers + D1
- **chat-agent** — Build AI Chat RAG + Vectorize + Chat UI

**Kết quả deploy-agent:**
- ⚠️ Agent dừng sớm, chưa hoàn thành đầy đủ
- ✅ Đã tạo: `workers/api/chat.ts` với system prompt đúng giọng
- ✅ Đã tạo: `scripts/embed-brain2.ts` (embed script)
- ✅ Đã tạo: `wrangler.chat.toml` (config cho chat worker)
- ❌ `wrangler.toml` vẫn còn PLACEHOLDER IDs (chưa tạo D1/KV)
- ❌ Chưa deploy lên Cloudflare Pages
- ❌ Chưa ghi kết quả vào `.claude/handoff-deploy.md`

**Kết quả chat-agent:**
- ⚠️ Agent dừng sớm, chưa hoàn thành đầy đủ
- ✅ Đã tạo: `workers/api/chat.ts` (chat worker với RAG)
- ✅ Đã tạo: `scripts/embed-brain2.ts` (embed script)
- ❌ `/app/chat/page.tsx` vẫn là placeholder (23 lines, chưa có chat UI)
- ❌ Chưa tạo Vectorize index
- ❌ Chưa embed Brain2 vault
- ❌ Chưa ghi kết quả vào `.claude/handoff-chat.md`

**Files created/modified:**
- Created: `workers/api/chat.ts` (3477 bytes)
- Created: `scripts/embed-brain2.ts` (3977 bytes)
- Created: `wrangler.chat.toml`
- Created: `.claude/handoff-deploy.md` (7115 bytes)
- Created: `.claude/handoff-chat.md` (19897 bytes)
- Modified: `wrangler.toml` (+19 lines)
- Modified: `.claude/handoff.md` (this file)

**DONE CONDITION check:**
- [ ] `curl https://thongphan.com` → 200 — **NOT DONE** (chưa deploy)
- [ ] Signup API hoạt động — **NOT DONE** (chưa deploy Workers)
- [ ] Chat page stream response — **NOT DONE** (chat UI chưa build)
- [ ] RAG có context — **NOT DONE** (Vectorize chưa tạo)

**Lý do chưa hoàn thành:**
- Cả 2 agents dừng sớm sau ~1 giờ chạy
- Deploy-agent cần interactive `wrangler login` (không thể automate)
- Chat-agent chưa build chat UI (chỉ tạo worker code)

**Next steps để hoàn thành:**
1. Manual: `wrangler login` → tạo D1/KV → update wrangler.toml
2. Deploy Next.js to Cloudflare Pages
3. Deploy Workers API
4. Build chat UI với streaming
5. Tạo Vectorize index + embed Brain2 vault
6. Test end-to-end

**Ghi chú cho Command Center:** Phase 4 chưa hoàn thành. Cần manual intervention để deploy vì wrangler login interactive.

---

<!-- Ghi tổng kết sau khi cả 2 agent xong -->
