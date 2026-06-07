# Audit nâng cấp thongphan.com — Brain2 2026

Ngày audit: 2026-05-20  
Repo: `/Users/rio/thongphan-com`

## Nguồn Brain2 đã dùng

- `00-System/agent-context-index.md`
- `00-System/agent-operating-protocol-thong-phan.md`
- `00-System/codex-brain2-operating-protocol.md`
- `01-Atomic/Strategies/strategy-brand-positioning-thongphan-2026.md`
- `01-Atomic/Strategies/strategy-brand-statement-thongphan-ai-assets-cashflow.md`
- `01-Atomic/Projects/project-personal-brand.md`
- `01-Atomic/Insights/business-insight-conan-strategic-focus-depth-over-breadth.md`
- `01-Atomic/Insights/business-insight-ai-native-expertise-business-market-gap.md`
- `Conan/conan-platform-architecture.md`

## Những gì đã đúng với Brain2

- Homepage đã đi theo hành trình `hỗn loạn AI -> Brain2 -> tài sản số -> dòng tiền thứ 2 -> Conan Trial`.
- Hero đã dùng statement hiện tại: người có chuyên môn biến kiến thức thành tài sản và tạo dòng tiền thứ 2 bằng AI, giữ an toàn công việc chính.
- Nav/footer đã ưu tiên `/diagnostic`, `/challenges`, `/blog`, `/about` và kéo về `trial.conan.school`, `com.conan.school`.
- Visual hiện tại nghiêng về bản đồ, node, scan, hệ tri thức, đúng vibe "sáng tỏ giữa hỗn loạn".
- Có proof thật: 14 tháng flop, 40+ bài viral, 80k+ shares, 600+ comment đăng ký, Brain2 đang chạy thật.

## Điểm lệch positioning còn lại trước nâng cấp

- Diagnostic mới có 4 tầng, chưa khớp 5 tầng chiến lược: `Task AI`, `Content Leverage`, `Brain2 Base`, `Digital Asset`, `Conan Ready`.
- Result Diagnostic chưa tách rõ `chẩn đoán`, `kẹt ở đâu`, `bước tiếp theo`, `CTA phù hợp` cho từng tầng.
- Challenges đang đúng hướng nhưng chưa đủ rõ before/after và cấu trúc 3 tuần của activation product.
- About vẫn cần nhấn mạnh proof arc: hỗn loạn/flop -> 10 năm content/CMO -> 40+ viral/80k+ shares/600+ comment -> Brain2 thật -> Conan là môi trường thực hành.
- Blog category còn là taxonomy nội dung, chưa hiện rõ hành trình cảm xúc: sợ AI, dùng AI đúng cách, Brain2, content kéo khách, tài sản số, Conan.
- Một số CTA blog còn trỏ membership cũ thay vì Conan Trial/Maker architecture mới.

## Trang/section cần sửa

- `/`: bổ sung Proof Index đủ luận điểm, gồm 100+ Conan Makers.
- `/diagnostic`: nâng logic/result thành 5 tầng, CTA theo mức trưởng thành.
- `/challenges` và `/challenges/brain2-21-ngay`: định vị là activation product, thêm before/after và cấu trúc tuần 1-2-3.
- `/about`: viết rõ proof sống, không CV, không portfolio generic.
- `/blog`: nhóm theo journey, thêm ngữ cảnh từng card giúp người đọc nhẹ nhõm/sáng tỏ/kiểm soát.
- Metadata: thêm metadata riêng cho `/blog`, `/about`, `/challenges`, challenge detail.

## Checklist triển khai

- [x] Truy xuất Brain2 trước khi sửa code.
- [x] Đọc note gốc bắt buộc và repo handoff/spec.
- [x] Định vị repo/source code.
- [x] Diagnostic có đủ 5 tầng và CTA rõ.
- [x] Challenges có before/after và cấu trúc 21 ngày.
- [x] About có proof arc đầy đủ.
- [x] Blog có journey grouping/context.
- [x] Proof Index đủ số liệu và không khoe rỗng.
- [x] Metadata các trang chính đồng bộ positioning.
- [x] Build pass.
- [x] Kiểm tra route `/`, `/diagnostic`, `/blog`, `/challenges`, `/challenges/brain2-21-ngay`, `/about`.

## Verification 2026-05-20

- `npm run build`: pass.
- `npm run lint`: blocked because `next lint` is not valid under current Next 16 setup in this repo (`Invalid project directory provided ... /lint`).
- Local dev server: `http://localhost:3001` because port `3000` was already in use.
- HTTP route check: `/`, `/diagnostic`, `/blog`, `/challenges`, `/challenges/brain2-21-ngay`, `/about` all returned `200`.
- Playwright screenshot QA: skipped because repo has no Playwright dependency/setup; verification used production build plus local HTTP checks.
