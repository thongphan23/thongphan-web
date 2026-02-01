import { Link } from 'react-router-dom';
import { ExternalLink, Facebook, Mail } from 'lucide-react';

const quickLinks = [
    { to: '/about', label: 'Về tôi' },
    { to: '/blog', label: 'Blog' },
    { to: '/products', label: 'Sản phẩm' },
    { to: '/courses', label: 'Khóa học' },
];

const externalLinks = [
    { href: 'https://learn.thongphan.com', label: 'Tensai LMS', icon: ExternalLink },
    { href: 'https://www.facebook.com/groups/conanschool', label: 'Conan School', icon: Facebook },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand-col">
                        <div className="footer-logo">Thông Phan</div>
                        <p className="footer-tagline">
                            Xây dựng sản phẩm, chia sẻ kiến thức và giúp mọi người tăng tốc hành trình thành công.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links-col">
                        <h4 className="footer-heading">Liên kết</h4>
                        <div className="footer-links">
                            {quickLinks.map((link) => (
                                <Link key={link.to} to={link.to} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* External Links */}
                    <div className="footer-links-col">
                        <h4 className="footer-heading">Nền tảng</h4>
                        <div className="footer-links">
                            {externalLinks.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="footer-link footer-link-external"
                                >
                                    {link.label}
                                    <link.icon size={14} />
                                </a>
                            ))}
                            <a
                                href="mailto:thong@thongphan.com"
                                className="footer-link footer-link-external"
                            >
                                Liên hệ
                                <Mail size={14} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Thông Phan. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
}
