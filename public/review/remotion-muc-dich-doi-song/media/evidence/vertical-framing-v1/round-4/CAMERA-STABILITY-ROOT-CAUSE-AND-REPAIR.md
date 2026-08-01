# Gốc rễ và bản sửa ổn định camera

## Kết luận

- Trước sửa: **24/51** shot có camera crop di động.
- Sau sửa: **0/51** shot có camera crop di động.
- Cổng crop: **51/51 PASS**; kiểm tra pixel START/MID/END: **51/51 camera ổn định**.
- Đây là sửa chính sách toàn plugin: crop tĩnh mặc định; tracking chỉ khi có intent được duyệt và cùng một semantic carrier.

## Gốc rễ

- The generator selected face or saliency independently at three keyframes, without carrier identity continuity.
- A center span above 0.04 automatically created a multi-point camera path, converting detector variance into editorial motion.
- Remotion interpolated every supplied renderer position on every frame, amplifying the bad path into a visible pan.
- QA allowed movement when retention and max step passed, but had no camera-motion intent or static-first gate.

## Các shot bị khuếch đại mạnh nhất trước sửa

| Variant | Shot | Span cũ | Travel mới |
|---|---|---:|---:|
| forrest-gump | `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-RM-REACTION-TAIL-02` | 0.487 | 0.000 |
| forrest-gump | `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-SS-REACTION-TAIL-01` | 0.484 | 0.000 |
| soul | `SHOT-SOUL-CAND-SOUL-SE-REACTION-TAIL-01` | 0.426 | 0.000 |
| soul | `SHOT-SOUL-CAND-SOUL-GN-ACTION-CORE-02` | 0.327 | 0.000 |
| a-beautiful-mind | `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-RK-ACTION-CORE-01` | 0.290 | 0.000 |
| soul | `SHOT-SOUL-CAND-SOUL-RM-REACTION-TAIL-01` | 0.271 | 0.000 |
| a-beautiful-mind | `SHOT-A-BEAUTIFUL-MIND-CAND-A-BEAUTIFUL-MIND-GN-ACTION-CORE-02` | 0.231 | 0.000 |
| forrest-gump | `SHOT-FORREST-GUMP-CAND-FORREST-GUMP-ES-REACTION-TAIL-01` | 0.205 | 0.000 |

## Bằng chứng

- `content/owner_feedback_evidence/camera-stability-20260801.json`
- `content/vertical_static_adjudications.json`
- `rounds/round-4/self_evaluation.json`
- `rounds/round-4/manual_pixel_adjudication.json`
- `audit/round-4/*-camera-stability-contact-sheet.jpg`

## Ranh giới Taste

FeedbackService đã fail-closed vì run thử nghiệm dùng Edit Plan cũ không có `revision`. Evidence capsule được giữ nguyên để ingest khi adapter legacy được phê duyệt; không giả mạo feedback event hoặc Taste promotion.
