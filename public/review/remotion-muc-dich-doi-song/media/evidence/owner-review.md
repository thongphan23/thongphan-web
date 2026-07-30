# Gói duyệt 3 video: Mục đích đời sống

## Trạng thái

- Run: `RUN-MUC-DICH-DOI-SONG-VISUAL-PROPOSITION-20260730`
- Voice gốc: `59.652 giây`, giữ nguyên, không thay bằng TTS.
- Định dạng: ngang `1920x1080`, `30fps`, H.264 + AAC.
- Phụ đề: `28` đoạn, khóa theo timestamp của voice, mỗi đoạn đúng một dòng.
- Mỗi video: `16` cảnh, `16` nguồn hình duy nhất, không lặp nguồn trong cùng video.
- Kết quả QA: `PASS` cho cả ba bản.

## Ba giả thuyết hình ảnh

### 1. About Time

Giả thuyết: mục đích sống được hiểu rõ nhất qua những khoảnh khắc hiện diện, gia đình và các vai trò đời thường. Mạch hình đi từ bình yên, công việc, kết quả, áp lực đến hậu quả đối với người thân.

- Video: `review/about-time.mp4`
- Quyết định hình ảnh: `variants/about-time/content/visual_selection_review.md`
- Đồ thị lựa chọn đã khóa: `variants/about-time/content/visual_proposition_graph.json`
- Edit plan: `variants/about-time/content/edit_plan.json`

### 2. Click

Giả thuyết: sự lệch pha giữa mục tiêu bên ngoài và đời sống bên trong được diễn đạt bằng chuỗi lựa chọn công việc, thành tựu, bỏ lỡ gia đình và hậu quả thấy được. Đây là bản có tương phản mạnh nhất.

- Video: `review/click.mp4`
- Quyết định hình ảnh: `variants/click/content/visual_selection_review.md`
- Đồ thị lựa chọn đã khóa: `variants/click/content/visual_proposition_graph.json`
- Edit plan: `variants/click/content/edit_plan.json`

### 3. Up in the Air

Giả thuyết: nhóm người đi làm thành thị sẽ nhận ra chính mình qua sân bay, văn phòng, cuộc họp, hiệu suất và sự cô lập phía sau thành công nghề nghiệp. Có một cảnh trung tính về gia đình để tạo bằng chứng trực tiếp cho sự hiện diện; `15/16` cảnh còn lại đến từ phim.

- Video: `review/up-in-the-air.mp4`
- Quyết định hình ảnh: `variants/up-in-the-air/content/visual_selection_review.md`
- Đồ thị lựa chọn đã khóa: `variants/up-in-the-air/content/visual_proposition_graph.json`
- Edit plan: `variants/up-in-the-air/content/edit_plan.json`

## Những thay đổi đã áp dụng

1. Mỗi ý chính có ba phương án hình ảnh được chấm riêng; Taste chỉ được điều chỉnh tối đa `0.05` và không được cứu một phương án sai nghĩa.
2. Phương án được chọn phải qua đồng thời cổng đúng nghĩa và cổng hiểu ngay khi xem không tiếng.
3. Bằng chứng cảm xúc không được dùng thay bằng chứng ý nghĩa. Cảnh chỉ có không khí nhưng không chứng minh được ý bị loại.
4. Các quan hệ nhân quả phải dùng chuỗi cảnh; không ép một cảnh đơn lẻ gánh cả nguyên nhân lẫn hậu quả.
5. Nhịp dựng thay đổi theo ý: cảnh dài ở đoạn suy ngẫm, dồn năm cảnh ngắn ở đoạn áp lực, rồi hạ nhịp ở hậu quả.
6. Edit plan chỉ được sinh từ đồ thị quyết định đã khóa; render không tự thay cảnh.

## Bằng chứng xuyên suốt

- Transcript và phụ đề: `shared/content/`
- Claim, cảm xúc cần tạo và điều cần nhớ: `content/claim_timeline.json`
- Báo cáo chọn và loại nguồn phim: `content/source_gate_report.json`
- Quan sát cảnh và các phương án: `variants/*/content/`
- Chỉ số rủi ro: `variants/*/audit/visual_selection_risk_report.json`
- Edit plan đã khóa: `variants/*/content/edit_plan.json`
- Báo cáo QA đầu ra: `content/render_qa_report.json`
- Chỉ mục toàn workflow: `content/workflow_evidence_index.json`

## Câu hỏi cần chấm

1. Với từng bản, bỏ tiếng trong 10 giây bất kỳ, anh có hiểu ý chính đang được nói tới không?
2. Cảnh nào đúng nghĩa nhưng chưa tạo được cảm xúc?
3. Cảnh nào đẹp hoặc có cảm xúc nhưng quan hệ với voice còn phải suy diễn?
4. Nhịp dồn ở đoạn `38.58-49.96` giây đã đủ căng chưa?
5. Trong ba giả thuyết, bản nào gần gu anh nhất và vì sao?
