# Báo cáo triển khai Semantic Vertical Framing v1

Ngày: 2026-08-01

## Kết quả

```text
STATUS: IMPLEMENTED_TESTED_REAL_RENDER_QA_PASS
FEATURE_FLAG: semantic_vertical_framing_v1
SOURCE_SCHEMA: schemas/v2.11/vertical_composition_plan.v1.schema.json
TARGET_FORMAT: 1080x1920_30FPS
FULL_REGRESSION: 880_PASSED
ACTIVE_TASTE_CHANGED: NO
```

Năng lực dọc mới coi 9:16 là một bố cục ngữ nghĩa độc lập, không phải crop giữa
từ video ngang. Mỗi shot dùng kích thước source thật, các `focus_atom` gắn với
chủ thể/hành động/vật chứng của claim, nhiều phương án crop, cổng giữ bằng
chứng, cổng tốc độ pan, vùng phụ đề an toàn và tọa độ renderer dành cho CSS
`object-position`.

## Lỗi false-high đã đóng

Phép đo chỉ dựa trên saliency có thể giữ một bức tường sáng hoặc vai áo và vẫn
chấm điểm cao. Bản mới cấm `saliency_hint` làm bằng chứng bắt buộc. Mọi focus
bắt buộc phải là `observed_carrier` hoặc `reviewed_carrier`. Sau render, contact
sheet từ MP4 đã mã hóa và kiểm tra pixel về vật mang nghĩa là cổng riêng; điểm
hình học không được thay thế cổng này.

## Hợp đồng và graph

- `VerticalFramingService` tạo tối thiểu ba phương án:
  `center_static`, `subject_static`, `proof_track`.
- Crop dùng tỷ lệ source thật; footage 2.39:1 không bị giả định thành 16:9.
- Mỗi candidate có source center và renderer position riêng.
- Giữ focus bắt buộc tối thiểu `0.82`; pan tối đa `0.18` bề rộng source/giây.
- Graph nối `focus_atom -> shot -> vertical decision -> candidate -> claim`
  bằng `must_keep`, `selected_for`, `proposes`, `derived_from`.
- CLI: `scripts/thongphan_motion.py vertical-frame plan`.

## Kiểm thử thật ba vòng

Run:

`/Users/rio/Movies/thong-phan-remotion-runs/muc-dich-doi-song-vertical-framing-v1-20260801`

Voice được cung cấp giữ nguyên làm timeline. Mỗi vòng tạo ba video, mỗi video
chỉ dùng một phim: `Soul`, `Forrest Gump`, `A Beautiful Mind`.

| Vòng | Video | Shot qua cổng | Giữ focus TB | Kiểm tra pixel vật mang nghĩa | Điểm |
|---|---:|---:|---:|---:|---:|
| 1 - crop giữa | 3 | 27/51 | 79.6% | chẩn đoán thủ công | 59.0 |
| 2 - face/saliency tracking | 3 | 44/51 | 96.6% | chẩn đoán thủ công | 59.0 |
| 3 - semantic carrier + renderer mapping | 3 | 51/51 | 99.5% | 48/51 | 97.2 |

Ba lỗi nguồn còn lại được công khai trong
`rounds/round-3/manual_pixel_adjudication.json`; kết quả vòng 3 là
`PASS_WITH_RESIDUAL_SOURCE_RISKS`, không tuyên bố owner fit.

## Sửa cạnh hồi quy

Full regression phát hiện test cũ ghi SQLite đồng thời bị khóa trước khi
`busy_timeout` có hiệu lực. `DirectorStateDB.connect()` nay thiết lập timeout
trước khi bật WAL. Test cạnh tranh đạt 5 lần liên tiếp; full suite đạt
`880 passed`.

## Bằng chứng

- `rounds/round-1/SELF-EVALUATION.md`
- `rounds/round-2/SELF-EVALUATION.md`
- `rounds/round-3/SELF-EVALUATION.md`
- `rounds/round-3/manual_pixel_adjudication.json`
- `content/vertical_focus_observations.json`
- `content/vertical_focus_overrides.json`
- `audit/round-1`, `audit/round-2`, `audit/round-3`
- `renders/round-1-*.mp4`, `renders/round-2-*.mp4`, `renders/round-3-*.mp4`

Owner feedback sau khi xem phải gắn với hash video, shot ID và plan fingerprint
trước khi trở thành bằng chứng cho Taste Model.
