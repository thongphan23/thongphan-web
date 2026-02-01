import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import MagneticButton from '../components/ui/MagneticButton';
import './Home.css';

const rotatingValues = [
    'Xây dựng thương hiệu',
    'Tạo thu nhập bền vững',
    'Kết nối sâu sắc',
    'Phát triển chuyên môn'
];

export default function Home() {
    return (
        <>
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-background">
                    <div className="hero-overlay" />
                </div>

                <div className="hero-sparkles">
                    {[...Array(6)].map((_, i) => (
                        <span
                            key={i}
                            className="hero-sparkle"
                            style={{
                                left: `${15 + i * 15}%`,
                                animationDelay: `${i * 0.8}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="container hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="hero-tagline">Chuyên gia • Nhà sáng tạo nội dung</p>

                        <h1 className="hero-title">
                            <span className="hero-name">Thông Phan</span>
                        </h1>

                        <p className="hero-subtitle">
                            <span className="subtitle-prefix">Giúp bạn </span>
                            <motion.span
                                className="value-rotator text-rotate-item"
                                key={rotatingValues[0]}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {rotatingValues[0]}
                            </motion.span>
                        </p>

                        <div className="hero-ctas">
                            <MagneticButton to="/about" variant="primary" size="large">
                                Tìm hiểu thêm
                                <ArrowRight size={20} />
                            </MagneticButton>
                            <MagneticButton to="/portfolio" variant="ghost" size="large">
                                Xem năng lực
                            </MagneticButton>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Journey Section */}
            <section className="section journey-section">
                <div className="container">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2>Hành trình của bạn bắt đầu từ đây</h2>
                        <p className="text-secondary" style={{ maxWidth: 600, margin: '0 auto' }}>
                            Dù bạn đang ở giai đoạn nào, Thông đều có thể hỗ trợ bạn phát triển.
                        </p>
                    </motion.div>

                    <div className="pathways-stack">
                        {[
                            {
                                number: '01',
                                title: 'Học từ khóa học',
                                description: 'Nền tảng vững chắc với các khóa học được thiết kế kỹ lưỡng.',
                                cta: 'Khám phá khóa học',
                                link: '/courses'
                            },
                            {
                                number: '02',
                                title: 'Đọc blog & insights',
                                description: 'Những bài viết viral, chia sẻ kinh nghiệm thực tế.',
                                cta: 'Đọc blog',
                                link: '/blog'
                            },
                            {
                                number: '03',
                                title: 'Sử dụng sản phẩm',
                                description: 'Các công cụ và sản phẩm hỗ trợ hành trình của bạn.',
                                cta: 'Xem sản phẩm',
                                link: '/products'
                            }
                        ].map((pathway, index) => (
                            <motion.div
                                key={pathway.number}
                                className={`pathway-card ${index === 0 ? 'pathway-highlight' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <span className="pathway-number">{pathway.number}</span>
                                <div className="pathway-content">
                                    <h3>{pathway.title}</h3>
                                    <p>{pathway.description}</p>
                                    <MagneticButton to={pathway.link} variant="secondary" size="small">
                                        {pathway.cta}
                                        <ArrowRight size={16} />
                                    </MagneticButton>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Connect Section */}
                    <div className="connect-section">
                        <span className="connect-label">Kết nối với Thông</span>
                        <h3 className="connect-title">Bắt đầu cuộc trò chuyện</h3>
                        <div className="connect-buttons">
                            <MagneticButton href="https://www.facebook.com/thongphan23" variant="primary">
                                <Sparkles size={18} />
                                Facebook
                            </MagneticButton>
                            <MagneticButton href="https://zalo.me/thongphan" variant="secondary">
                                Zalo
                            </MagneticButton>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
