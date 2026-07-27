# Acceptance results

Verdict: **READY FOR INDEPENDENT RE-REVIEW — second P1 correction deployed**

## Product definition of done

| # | Tiêu chí | Kết quả | Bằng chứng ngắn |
|---:|---|---|---|
| 1 | Public preview | PASS | Pages alias trả HTTP 200 |
| 2 | Desktop `/read` | PASS | Playwright 1440×1000 |
| 3 | Mobile `/read` | PASS | Playwright 390×844 |
| 4 | Năm sample questions | PASS | deterministic unit test |
| 5 | Custom question | PASS | Scenario B |
| 6 | Repository-backed content | PASS | sáu canonical `/library/*` items |
| 7 | Recommendation reason | PASS | UI + contract test |
| 8 | Primary article mở được | PASS | Scenario A/B/C |
| 9 | Session lưu preview D1 | PASS | remote aggregate readback |
| 10 | Active time aggregate | PASS | evidence API + browser flow |
| 11 | Coverage aggregate | PASS | Scenario C asserts persisted coverage > 0 |
| 12 | Manual completion riêng | PASS | `manual_completions` |
| 13 | Hai reflection fields | PASS | required UI/API + `reflections` |
| 14 | Một Next Best Action | PASS | versioned decision record |
| 15 | Reload/resume | PASS | Scenario B |
| 16 | Evidence Inspector | PASS | eight-step chain rendered |
| 17 | D1 khác production | PASS | dedicated ID verified |
| 18 | Không production data copy | PASS | fresh migration-only schema |
| 19 | Không production write | PASS | no production bindings/routes |
| 20 | Scenario A | PASS | sample → next action |
| 21 | Scenario B | PASS | custom → refresh/resume → complete |
| 22 | Scenario C | PASS | incomplete → return → continue → complete |
| 23 | Recommendation unit tests | PASS | 3 recommendation tests |
| 24 | Persistence/traceability integration | PASS | API, migration and D1 readback |
| 25 | Desktop browser QA | PASS | 1440px |
| 26 | Mobile browser QA | PASS | 390px |
| 27 | Không console error nghiêm trọng | PASS | zero unplanned console/page errors; forced 503 only |
| 28 | Không horizontal overflow | PASS | mobile assertion ≤ 1px |
| 29 | P0 = 0 | PASS | final audit |
| 30 | P1 = 0 | PENDING | second correction implemented; independent re-review requested |
| 31 | Screenshots | PASS | committed under `screenshots/` |
| 32 | PR Ready, chưa merge | PASS | PR #8 open, `isDraft=false` |

## P1 closure evidence

| Closure | Result | Evidence |
|---|---|---|
| Production build fail-closed | PASS | disabled build hides `/read`, Inspector and article panel; no API origin |
| Session/article binding | PASS | UI and API reject wrong canonical `content_url`; browser proves zero writes |
| Atomic evidence | PASS | real SQLite order tests converge; completed session rejects later writes |
| Release artifact restoration | PASS | build gate always restores and re-verifies a production-disabled final `out/` |
| Reader abuse boundary | PASS | mandatory Origin, 10/hour per rotating HMAC caller digest; one caller does not block another |
| Finite data lifetime | PASS | 24-hour rate rows and seven-day FK-safe reader-graph cleanup; 1.000 active-reader atomic cap |

## Final verification gates

- `npm run test:reader-loop`: **24/24 pass**.
- `npm run test:reader-loop-build-gate`: **pass** for production-disabled,
  preview-enabled and restored final production-disabled artifacts.
- `npm test`: **458/458 pass** on the final documentation-inclusive rerun.
- `npx tsc --noEmit`: **pass**.
- `npm run lint`: **pass, zero warnings**.
- Preview-bound `npm run build`: **84/84 routes**, including `/read` and `/read/inspector`.
- `npm run test:release`: **pass** (`6/6 + 4/4 + 3/3 + 144/144`), including
  the final production-disabled artifact assertion.
- `npm run test:read-release-safety`: **3/3 pass**.
- `npm run test:secret-integrity`: **pass, zero finding**.
- `wrangler deploy --dry-run --config wrangler.reader-loop-preview.toml`: **pass**, only dedicated preview D1 binding reported.
- Public-preview `npm run qa:reader-loop-browser`: **Scenario A/B/C + wrong-article binding pass**.
- Origin-less public `POST /v1/readers`: **403**.
- Missing-secret runtime: **local 503 fail-closed**; configured local runtime: **201 and browser E2E pass**.
- Preview migration `0003_reader_caller_expiry.sql`: **remote applied; no migrations pending**.
- Preview secret metadata lists `CALLER_HASH_SECRET` as `secret_text`; its value was never printed or persisted in the repo.
- Preview Worker deployed as `2cfed213-942c-4646-ae2b-ed46d89376a6`, including daily cleanup cron.
- Preview Pages deployment: `352e6327`; stable branch alias passed public browser QA.
- Read-only remote D1 check: one rate row, min/max caller digest length 64,
  zero non-hex rows, `rows_written=0` and `changed_db=false`.

## Audit correction and final closure

The original internal audit was not sufficient: an independent focused review found
four P1 issues after the initial handoff. After those were corrected, the next
independent review found two further P1s: final `out/` state and global/lifetime
reader controls. Both are corrected on implementation head `2d7c1f5`; the table
below records implementation evidence and must not be read as an independent verdict:

| Trục | Verdict | P0 | P1 | Ghi chú |
|---|---|---:|---:|---|
| Product/UX | IMPLEMENTED | 0 | pending | public A/B/C, wrong-article and failure states pass |
| Data integrity | IMPLEMENTED | 0 | pending | monotonic evidence plus FK-safe seven-day graph cleanup pass in real SQLite |
| Security/privacy | IMPLEMENTED | 0 | pending | Origin required; keyed daily digest; caller-specific D1 limit; absent secret fails closed |
| Engineering/release | IMPLEMENTED | 0 | pending | final disabled artifact rechecked; migrations, secret metadata, cron, dry-run and public E2E pass |

Correction status: **the latest two independent P1 findings are corrected by
implementation and regression evidence; independent re-review requested before
claiming P1=0 or merging**. Remaining P2/P3 are recorded in `BACKLOG-P2-P3.md`.
