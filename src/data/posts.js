// Blog posts data - reverse engineered from thongphan.com

export const posts = [
    {
        id: 'loi-goc-xay-dung-thuong-hieu-ca-nhan',
        slug: 'loi-goc-khien-90-chuyen-gia-xay-dung-thuong-hieu-ca-nhan-that-bai',
        title: 'Lỗi Gốc Khiến 90% Chuyên Gia Xây Dựng Thương Hiệu Cá Nhân Thất Bại',
        excerpt: 'Sau khi quan sát và phân tích hàng trăm trường hợp, tui nhận ra phần lớn không phải thất bại vì họ không đủ giỏi, mà vì họ đã bắt đầu sai ngay từ gốc rễ.',
        category: 'Thương hiệu cá nhân',
        date: '2026-01-20',
        readingTime: '8 phút',
        featured: true,
        content: `
Chào anh em, Thông đây.

Hôm nay tui muốn nói về một chủ đề mà tui thấy rất nhiều anh em chuyên gia đang gặp phải. Anh em có chuyên môn rất sâu, 10-15 năm kinh nghiệm trong ngành, nhưng lại gần như "vô hình" trên bản đồ. Anh em làm rất nhiều, nhưng kết quả thu về (cả về tầm ảnh hưởng lẫn tài chính) lại không tương xứng.

## Lỗi Gốc: Nhầm Lẫn Giữa "Biểu Diễn" và "Kết Nối"

Cái sai này chí mạng tới mức, nếu không sửa, mọi nỗ lực sau đó của anh em đều sẽ như "xây lâu đài trên cát".

## 4 Lỗi Phát Sinh

### 1. Sản xuất nội dung tùy hứng, không nhất quán
### 2. Nói những điều mình thích, không phải những điều thị trường cần
### 3. Nhanh chóng kiệt sức (Burnout)
### 4. Không biết cách biến giá trị thành tiền (Monetize)

## Kết Luận

Thay Đổi Gốc Rễ Để Thay Đổi Kết Quả.
    `
    },
    {
        id: 'tai-sao-toi-bat-dau-viet',
        slug: 'tai-sao-toi-bat-dau-viet',
        title: 'Tại sao tôi bắt đầu viết?',
        excerpt: 'Viết để suy nghĩ rõ ràng hơn. Viết để kết nối với những người cùng tần số.',
        category: 'Góc suy ngẫm',
        date: '2026-01-15',
        readingTime: '5 phút',
        featured: true,
        content: `
## Viết để suy nghĩ

Khi viết, tôi buộc phải sắp xếp lại suy nghĩ. Những ý tưởng mơ hồ trong đầu trở nên rõ ràng khi được viết ra.

## Viết để kết nối

Mỗi bài viết là một cơ hội để kết nối với những người cùng suy nghĩ, cùng quan điểm.

## Bắt đầu từ đâu?

Đơn giản thôi: Viết về những gì bạn biết, những gì bạn quan tâm.
    `
    },
    {
        id: 'bi-quyet-hoc-nhanh',
        slug: 'bi-quyet-hoc-nhanh-khong-phai-la-cham-chi-hon',
        title: 'Bí quyết học nhanh: Không phải là chăm chỉ hơn',
        excerpt: 'Vấn đề không phải là thời gian. Bí quyết là học đúng cách.',
        category: 'Học tập',
        date: '2026-01-10',
        readingTime: '6 phút',
        featured: false,
        content: `
## Vấn đề không phải là thời gian

Nhiều người nghĩ học nhiều hơn = học giỏi hơn. Sai lầm.

## 3 nguyên tắc học nhanh

### 1. Dạy lại ngay lập tức
### 2. Thực hành trước, lý thuyết sau  
### 3. Spaced Repetition

## Áp dụng ngay hôm nay

Chọn một kỹ năng, áp dụng 3 nguyên tắc trên trong 1 tuần.
    `
    },
    {
        id: 'sai-lam-giao-tiep',
        slug: 'sai-lam-lon-nhat-khi-giao-tiep-ma-ai-cung-mac-phai',
        title: 'Sai lầm lớn nhất khi giao tiếp mà ai cũng mắc phải',
        excerpt: 'Nghe để trả lời vs Nghe để hiểu - một sự khác biệt tạo nên kết quả hoàn toàn khác.',
        category: 'Kỹ năng mềm',
        date: '2026-01-05',
        readingTime: '4 phút',
        featured: false,
        content: `
## Nghe để trả lời vs Nghe để hiểu

90% chúng ta nghe với mục đích để trả lời, không phải để hiểu.

## Cách nghe khác đi

Tập trung 100% vào người nói. Đừng nghĩ về câu trả lời khi họ còn đang nói.

## Điều kỳ diệu xảy ra

Khi bạn thực sự lắng nghe, người khác cảm nhận được. Mối quan hệ sẽ khác.

## Thử nghiệm 7 ngày

Trong 7 ngày tới, hãy thử nghe mà không nghĩ đến việc trả lời.
    `
    }
];

export const getPostBySlug = (slug) => {
    return posts.find(post => post.slug === slug);
};

export const getFeaturedPosts = () => {
    return posts.filter(post => post.featured);
};

export const getRecentPosts = (count = 5) => {
    return [...posts].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, count);
};

export const getRelatedPosts = (currentSlug, count = 2) => {
    const current = getPostBySlug(currentSlug);
    if (!current) return [];

    return posts
        .filter(post => post.slug !== currentSlug && post.category === current.category)
        .slice(0, count);
};
