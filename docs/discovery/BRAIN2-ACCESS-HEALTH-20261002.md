# Kiểm tra mã truy cập Brain2 Challenges

## Cập nhật gần nhất

Ngày 02/10/2026, theo yêu cầu của anh Thông, đã kiểm tra trực tiếp cổng xác thực production và toàn bộ 14 bài cần mã. Mã hiện có vẫn hoạt động. Chưa xác minh được luồng trình duyệt trên mạng hiện tại vì DNS cục bộ còn lỗi sau đợt gián đoạn tên miền. Không thay credential hoặc cấu hình mạng.

## Kết quả và phạm vi

**PARTIAL** cho kiểm tra đầu cuối. Phần xác thực và cung cấp nội dung production đã được kiểm chứng bằng HTTP thật. Luồng nhập mã trên trình duyệt tại mạng của máy chưa xác minh được.

Mục tiêu là kiểm tra và khôi phục quyền truy cập đã có cho học viên. Chỉ kiểm tra cổng tại `https://thongphan.com/brain2/21-ngay`, biến thể `www`, phiên đăng nhập và ngày 8 đến 21. Không mở thêm quyền, bỏ cổng mã, đổi mã, xuất nội dung riêng tư, sửa bài học, gửi tin nhắn cho học viên hoặc deploy lại ứng dụng.

## Bằng chứng quan sát được

Thời điểm bắt đầu kiểm tra: 21:10:54 ngày 02/10/2026, giờ Việt Nam. Các yêu cầu kiểm chứng production dùng HTTPS với xác minh chứng chỉ mặc định và DNS công khai Cloudflare qua DoH. Cấu hình mạng của máy được giữ nguyên.

| Kiểm tra | Kết quả |
| --- | --- |
| Trang danh sách 21 ngày | HTTP 200 |
| Cổng xác thực khi chưa có phiên | HTTP 401 |
| Bài ngày 8 khi chưa có phiên | HTTP 401 |
| Đăng nhập bằng mã hiện có trong Keychain | HTTP 204 |
| Đọc lại phiên vừa cấp | HTTP 200, `authorized: true` |
| Cookie được cấp | HttpOnly, Secure, SameSite=Lax, giới hạn đường dẫn Brain2 |
| Ngày 8 đến 21 khi có phiên | 14/14 HTTP 200 |
| Nội dung ngày 8 đến 21 | 14/14 checksum khớp manifest trong Git |
| Cache nội dung bảo vệ | 14/14 có private và no-store |
| Mã sai | HTTP 401 |
| Cookie bị sửa | HTTP 401 |
| Yêu cầu đăng nhập từ origin khác | HTTP 403 |
| Đăng xuất | HTTP 204, cookie Max-Age=0 |
| Mã hiện có trên www | HTTP 204, bài ngày 21 HTTP 200 |

Tổng cộng 54 điều kiện kiểm tra HTTP đều đạt. Kiểm thử Worker bằng `node --import tsx --test scripts/brain2-access-worker.test.ts` đạt 13/13. Các thử nghiệm sai mã chỉ dùng một yêu cầu kiểm tra, không dò mã hoặc thay giới hạn bảo vệ.

Bằng chứng JSON an toàn tại `docs/discovery/BRAIN2-ACCESS-HEALTH-20261002.json`. Không lưu mã, hash của mã, cookie, session secret hoặc nội dung bài riêng tư vào tài liệu. Mã được đọc từ Keychain và truyền tới đúng cổng HTTPS qua bộ nhớ của tiến trình.

## Giới hạn còn lại

Yêu cầu thông thường từ mạng máy hiện tại bị timeout, curl exit 28. Kiểm tra hạ tầng trước đó cùng ngày xác định resolver mạng vẫn trả IP hosting cũ; tài liệu đối chiếu tại `/Users/rio/Projects/ui-thongphan/docs/DOMAIN_HEALTH_20261002.md`. Yêu cầu cùng trang qua DNS công khai trả HTTP 200 và cổng mã hoạt động. Đây là bằng chứng phân biệt đường kết nối với lỗi xác thực, không chứng minh mọi mạng của học viên đều đã cập nhật DNS.

Lần mở trang ngày 8 bằng trình duyệt IAB bị timeout. Không có screenshot giao diện hoạt động và không tuyên bố đã kiểm tra visual hoặc luồng nhập mã UI thành công.

## Hướng dùng lại

Học viên đã được cấp mã có thể dùng mã hiện có tại `https://thongphan.com/brain2/21-ngay`. Không có bằng chứng cần đổi mã hoặc deploy lại. Nếu một học viên vẫn không tải được trang, cần phân biệt lỗi tải trang/DNS với thông báo mã sai. Không thay cấu hình mạng của chủ dự án vì anh đã yêu cầu giữ nguyên.
