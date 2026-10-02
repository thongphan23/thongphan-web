# Đồng bộ mã truy cập Brain2 Challenges

## Cập nhật gần nhất

Ngày 02/10/2026, anh Thông yêu cầu dùng mã do anh chỉ định cho cổng đăng nhập Brain2 Challenges. Đã đồng bộ hash lên Worker production và đọc lại mã trong Keychain để xác nhận. Mã anh chỉ định trùng với giá trị đang có, nên phiên hợp lệ được giữ nguyên. Trang đã tải và mở bài thành công trên trình duyệt ở mạng hiện tại, bổ sung phần bằng chứng còn thiếu trong báo cáo kiểm tra trước đó cùng ngày.

## Kết quả

**PASS** cho phạm vi đồng bộ mã và kiểm chứng truy cập Brain2 Challenges. Học viên đã được cấp quyền dùng mã anh chỉ định tại `https://thongphan.com/brain2/21-ngay`. Không cần thêm thao tác của chủ dự án.

Chỉ tác động secret `BRAIN2_ACCESS_CODE_HASH` của `thongphan-brain2-access-api` và bản mã tương ứng trong macOS Keychain. Không dùng mã này cho các hệ thống khác, thay session secret, sửa quyền, bỏ cổng bảo vệ, sửa bài, đổi DNS hoặc cấu hình mạng.

## Bằng chứng production

- Hai phép tính SHA-256 độc lập bằng Python và Node.js khớp nhau trước khi upload. Không ghi hash hoặc mã vào báo cáo.
- Secret được truyền tới Wrangler qua stdin. Raw code chỉ truyền tới cổng HTTPS đúng origin và Keychain, không qua đối số tiến trình, file tạm hay Git.
- Worker version `d5404242-ee49-4f3d-8e5e-04b9fe22e0a0` phục vụ 100% traffic. Deployment `c8e971f7-550f-4a3c-905b-681bd8e63367`, tạo lúc 21:17:41 ngày 02/10/2026, giờ Việt Nam.
- Đọc lại Keychain xác nhận mã khớp giá trị chủ dự án vừa chỉ định.
- Kiểm tra sau đồng bộ đạt 54/54 điều kiện HTTP. Đăng nhập apex và www trả 204. Phiên vừa cấp được máy chủ xác nhận hợp lệ. 14/14 bài ngày 8–21 trả 200, checksum khớp manifest và giữ private/no-store. Mã sai, cookie giả mạo và origin ngoài đều bị chặn.
- Curl với cấu hình DNS hệ thống trả 200. Trình duyệt IAB tải ngày 8, hiển thị hộp nhập mã, nhận mã và hiển thị nội dung bài bảo vệ. Đã xem screenshot trực tiếp, không có mã hoặc cookie trong hình. Screenshot nội dung bảo vệ chỉ lưu local tại `/tmp/brain2-access-confirmed-20261002.png`, không đưa lên GitHub.

Bằng chứng an toàn tại `docs/discovery/BRAIN2-ACCESS-SYNC-20261002.json`. Báo cáo kiểm tra trước tại `docs/discovery/BRAIN2-ACCESS-HEALTH-20261002.md` mô tả đúng trạng thái ở thời điểm trước đó, khi mạng máy còn timeout.

## Lưu ý về phép kiểm phiên

Lần kiểm đầu tiên kỳ vọng phiên trước upload phải nhận 401. Máy chủ trả 200 vì mã anh chỉ định đã trùng với mã trước đó. Kỳ vọng 401 chỉ đúng khi giá trị mã thay đổi. Đã sửa điều kiện trong script kiểm tra tạm để phân biệt đồng bộ cùng mã với đổi sang mã khác. Không sửa logic ứng dụng hoặc tắt kiểm tra bảo mật. Phiên vẫn hợp lệ là hành vi đúng của hợp đồng chữ ký hiện có.

## Giới hạn

Đã kiểm chứng cổng Brain2 và truy cập nội dung trên một trình duyệt, cùng HTTP production cho toàn bộ bài bảo vệ. Không tuyên bố đã kiểm thử mọi thiết bị hoặc mọi mạng của học viên. Không đánh giá lại thẩm mỹ hoặc nội dung khoá trong task này.
