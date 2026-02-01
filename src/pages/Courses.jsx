import { ArrowRight, ExternalLink, GraduationCap, Brain, MessageCircle, Lightbulb, Users } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const conanCourses = [
    {
        id: 'customer-decode',
        title: 'Customer Decode',
        description: 'Giải mã hành vi khách hàng, không còn đoán mò',
        href: 'https://www.conan.school/live-courses/customer-decode',
    },
    {
        id: 'viral-content',
        title: 'Viral Content',
        description: 'Công thức khoa học để viết content kết nối',
        href: 'https://www.conan.school/live-courses/viral-content',
    },
    {
        id: 'personal-branding',
        title: 'Personal Branding',
        description: 'Chọn định vị "Right-to-Win" phù hợp',
        href: 'https://www.conan.school/live-courses/personal-branding',
    },
    {
        id: 'ai-master',
        title: 'AI Master',
        description: 'Thành thạo AI thực chiến: ChatGPT, Claude, NotebookLM, AG',
        href: 'https://www.conan.school/live-courses/ai-master',
    },
    {
        id: 'offer-design',
        title: 'Offer Design',
        description: 'Thiết kế offer khiến khách "ngu nếu từ chối"',
        href: 'https://www.conan.school/live-courses/offer-design',
    },
];

const tensaiPillars = [
    {
        id: 'thinking',
        name: 'Tư Duy',
        value: 'Ra quyết định đúng',
    },
    {
        id: 'communication',
        name: 'Giao Tiếp',
        value: 'Thuyết phục hiệu quả',
    },
    {
        id: 'digital-leverage',
        name: 'Đòn Bẩy Số',
        value: 'Nhân bản giá trị',
    },
    {
        id: 'productivity',
        name: 'Hiệu Suất',
        value: 'Làm ít đạt nhiều',
    },
];

export default function Courses() {
    return (
        <main className="courses-page">
            {/* Hero Section */}
            <section className="courses-hero">
                <div className="courses-hero-bg" />
                <div className="container">
                    <span className="section-label">Học tập & Phát triển</span>
                    <h1>Khoá học</h1>
                    <p className="courses-subtitle">
                        Nâng cao năng lực kinh doanh hiệu quả cùng Conan School
                        và phát triển tư duy nền tảng với Tensai.
                    </p>
                </div>
            </section>

            {/* Conan School Section */}
            <section className="conan-section section">
                <div className="container">
                    <div className="conan-header">
                        <span className="conan-badge">Premium Business</span>
                        <h2>Conan School</h2>
                        <p className="conan-tagline">
                            Trường học "hút khách" đầu tiên tại Việt Nam
                        </p>
                        <p className="conan-description">
                            Học kinh doanh hiệu quả - Được hướng dẫn trực tiếp bởi mentor có kinh nghiệm thực chiến
                        </p>
                    </div>

                    <div className="conan-courses">
                        {conanCourses.map((course) => (
                            <a
                                key={course.id}
                                href={course.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="conan-course-card"
                            >
                                <div className="conan-course-content">
                                    <h3 className="conan-course-title">{course.title}</h3>
                                    <p className="conan-course-desc">{course.description}</p>
                                </div>
                                <ArrowRight size={20} className="conan-course-arrow" />
                            </a>
                        ))}
                    </div>

                    <div className="conan-cta">
                        <MagneticButton
                            variant="primary"
                            size="large"
                            href="https://www.conan.school"
                        >
                            Khám phá Conan School
                            <ExternalLink size={18} />
                        </MagneticButton>
                    </div>
                </div>
            </section>

            {/* Social Proof - Padlet */}
            <section className="testimonials-section section">
                <div className="container">
                    <h2>Học viên nói gì?</h2>
                    <div className="padlet-embed">
                        <iframe
                            src="https://padlet.com/embed/conanschool_testimonials"
                            title="Conan School Testimonials"
                            frameBorder="0"
                            allow="camera;microphone;geolocation"
                            style={{ width: '100%', height: '600px', borderRadius: '12px' }}
                        />
                    </div>
                </div>
            </section>

            {/* Tensai Section */}
            <section className="tensai-section section">
                <div className="container">
                    <div className="tensai-header">
                        <span className="tensai-badge">Miễn phí</span>
                        <h2>Tensai</h2>
                        <p className="tensai-tagline">
                            Học tập tương tác cao — Giúp người đi làm chạm mốc thu nhập <strong>40 triệu/tháng</strong>
                        </p>
                    </div>

                    <div className="tensai-pillars">
                        {tensaiPillars.map((pillar) => (
                            <div key={pillar.id} className="tensai-pillar">
                                <h3 className="pillar-name">{pillar.name}</h3>
                                <p className="pillar-value">{pillar.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="tensai-cta">
                        <MagneticButton
                            variant="secondary"
                            size="large"
                            href="https://learn.thongphan.com"
                        >
                            Vào Tensai
                            <ArrowRight size={18} />
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}
