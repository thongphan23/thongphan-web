import { Mail, Award, Users, BookOpen, Target, Heart } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import './About.css';

const achievements = [
    {
        icon: Users,
        number: '10,000+',
        label: 'Học viên',
    },
    {
        icon: BookOpen,
        number: '50+',
        label: 'Bài viết',
    },
    {
        icon: Award,
        number: '3+',
        label: 'Năm kinh nghiệm',
    },
];

const values = [
    {
        icon: Target,
        title: 'Kết quả thực tế',
        description: 'Mọi thứ tui chia sẻ đều dựa trên kinh nghiệm thực chiến, không lý thuyết suông.',
    },
    {
        icon: Heart,
        title: 'Tận tâm phục vụ',
        description: 'Tui tin vào việc cho đi giá trị trước khi nhận lại bất cứ điều gì.',
    },
    {
        icon: Users,
        title: 'Cộng đồng hỗ trợ',
        description: 'Xây dựng một cộng đồng nơi mọi người cùng nhau phát triển.',
    },
];

export default function About() {
    return (
        <main className="about-page">
            {/* Hero */}
            <section className="about-hero">
                <div className="container">
                    <div className="about-hero-content">
                        <div className="about-avatar">
                            <span>TP</span>
                        </div>
                        <h1 className="about-title">Xin chào, mình là Thông Phan</h1>
                        <p className="about-subtitle">
                            Mình giúp các chuyên gia xây dựng thương hiệu cá nhân và tạo thu nhập bền vững từ kiến thức của họ.
                        </p>
                    </div>
                </div>
            </section>

            {/* Story */}
            <section className="about-story section">
                <div className="container container-narrow">
                    <h2 className="section-title">Câu chuyện của mình</h2>
                    <div className="story-content">
                        <p>
                            Mình bắt đầu hành trình xây dựng thương hiệu cá nhân từ con số 0. Không followers,
                            không connections, không biết bắt đầu từ đâu.
                        </p>
                        <p>
                            Sau nhiều năm thử nghiệm, thất bại và học hỏi, mình đã tìm ra được framework
                            giúp các chuyên gia như mình biến kiến thức thành thu nhập bền vững.
                        </p>
                        <p>
                            Bây giờ, mình dành phần lớn thời gian để chia sẻ những gì đã học được với cộng
                            đồng những người muốn nâng tầm bản thân và tạo ra giá trị thực sự.
                        </p>
                    </div>
                </div>
            </section>

            {/* Achievements */}
            <section className="about-achievements section">
                <div className="container">
                    <div className="achievements-grid">
                        {achievements.map((item, index) => (
                            <div key={index} className="achievement-card">
                                <div className="achievement-icon">
                                    <item.icon size={28} />
                                </div>
                                <div className="achievement-number">{item.number}</div>
                                <div className="achievement-label">{item.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="about-values section">
                <div className="container">
                    <h2 className="section-title text-center">Giá trị cốt lõi</h2>
                    <p className="section-description text-center">
                        Những nguyên tắc định hướng mọi việc mình làm
                    </p>
                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">
                                    <value.icon size={24} />
                                </div>
                                <h3 className="value-title">{value.title}</h3>
                                <p className="value-description">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta section">
                <div className="container text-center">
                    <h2 className="section-title">Kết nối với mình</h2>
                    <p className="section-description">
                        Bạn có câu hỏi hoặc muốn hợp tác? Mình luôn sẵn sàng lắng nghe.
                    </p>
                    <div className="about-cta-buttons">
                        <MagneticButton
                            variant="primary"
                            size="large"
                            href="mailto:thongphan.sales@gmail.com"
                        >
                            <Mail size={20} />
                            Gửi email cho mình
                        </MagneticButton>
                        <MagneticButton
                            variant="secondary"
                            size="large"
                            href="https://www.facebook.com/thongphanblog"
                        >
                            Theo dõi trên Facebook
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}
