import { ArrowRight, ExternalLink, GraduationCap, BookOpen, Users, Sparkles } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';

const products = [
    {
        id: 'tensai',
        name: 'Tensai LMS',
        status: 'Live',
        statusType: 'live',
        description: 'Nền tảng học tập với các khóa học về tư duy, giao tiếp và kỹ năng mềm. Được thiết kế theo phương pháp khoa học, giúp bạn học hiệu quả hơn.',
        icon: GraduationCap,
        features: [
            'Khóa học tương tác',
            'Theo dõi tiến độ',
            'Chứng chỉ hoàn thành',
            'Cộng đồng học viên'
        ],
        href: 'https://learn.thongphan.com',
        color: 'primary',
    },
    {
        id: 'blog',
        name: 'Thông Phan Blog',
        status: 'Live',
        statusType: 'live',
        description: 'Nơi mình chia sẻ về xây dựng thương hiệu cá nhân, tạo thu nhập từ kiến thức và phát triển bản thân.',
        icon: BookOpen,
        features: [
            'Bài viết chuyên sâu',
            'Case studies',
            'Templates & frameworks',
            'Miễn phí 100%'
        ],
        to: '/blog',
        color: 'secondary',
    },
    {
        id: 'conan',
        name: 'Conan School',
        status: 'Live',
        statusType: 'live',
        description: 'Cộng đồng những người muốn nâng tầm chuyên môn và xây dựng nguồn thu nhập bền vững từ kiến thức.',
        icon: Users,
        features: [
            'Mạng lưới kết nối',
            'Hỏi đáp & thảo luận',
            'Workshop & events',
            'Mentorship'
        ],
        href: 'https://www.facebook.com/groups/conanschool',
        color: 'accent',
    },
];

export default function Products() {
    return (
        <main className="products-page">
            {/* Hero */}
            <section className="products-hero">
                <div className="products-hero-bg" />
                <div className="container products-hero-content">
                    <span className="products-hero-label">Sản phẩm</span>
                    <h1 className="products-hero-title">Xây dựng để phục vụ</h1>
                    <p className="products-hero-subtitle">
                        Những công cụ và tài nguyên giúp bạn phát triển bản thân và tạo thu nhập từ kiến thức
                    </p>
                </div>
            </section>

            {/* Products Grid */}
            <section className="products-grid-section section">
                <div className="container">
                    <div className="products-grid">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="products-cta section">
                <div className="container">
                    <div className="cta-card">
                        <Sparkles size={48} className="cta-icon" />
                        <h2>Không biết bắt đầu từ đâu?</h2>
                        <p>
                            Hãy bắt đầu với Tensai - nơi bạn có thể học các kỹ năng cần thiết từ cơ bản đến nâng cao
                        </p>
                        <MagneticButton
                            variant="accent"
                            size="large"
                            href="https://learn.thongphan.com"
                        >
                            <GraduationCap size={20} />
                            Khám phá Tensai
                        </MagneticButton>
                    </div>
                </div>
            </section>
        </main>
    );
}

function ProductCard({ product }) {
    const Icon = product.icon;

    return (
        <div className="card product-card-large">
            <div className="product-card-header">
                <div className="product-card-icon">
                    <Icon size={28} />
                </div>
                <span className={`product-status product-status-${product.statusType}`}>
                    {product.status}
                </span>
            </div>

            <h3 className="product-card-title">{product.name}</h3>
            <p className="product-card-description">{product.description}</p>

            <ul className="product-features">
                {product.features.map((feature, index) => (
                    <li key={index} className="product-feature">
                        <span className="feature-dot" />
                        {feature}
                    </li>
                ))}
            </ul>

            <MagneticButton
                variant={product.color === 'primary' ? 'primary' : product.color === 'accent' ? 'accent' : 'secondary'}
                href={product.href}
                to={product.to}
            >
                {product.href ? (
                    <>
                        Truy cập <ExternalLink size={16} />
                    </>
                ) : (
                    <>
                        Khám phá <ArrowRight size={16} />
                    </>
                )}
            </MagneticButton>
        </div>
    );
}
