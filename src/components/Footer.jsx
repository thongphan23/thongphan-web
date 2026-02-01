import { Link } from 'react-router-dom';
import { Facebook, Mail, BookOpen, GraduationCap } from 'lucide-react';
import './Footer.css';

const quickLinks = [
    { path: '/about', label: 'Về Thông' },
    { path: '/blog', label: 'Blog' },
    { path: '/products', label: 'Sản phẩm' },
    { path: '/courses', label: 'Khóa học' },
];

const socialLinks = [
    {
        href: 'https://www.facebook.com/thongphanblog',
        icon: Facebook,
        label: 'Facebook'
    },
    {
        href: 'mailto:thongphan.sales@gmail.com',
        icon: Mail,
        label: 'Email'
    },
];

const productLinks = [
    {
        href: 'https://learn.thongphan.com',
        icon: GraduationCap,
        label: 'Tensai Learning'
    },
    {
        href: '/blog',
        icon: BookOpen,
        label: 'Thông Phan Blog'
    },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Column */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <span className="footer-logo-text">Thông Phan</span>
                        </Link>
                        <p className="footer-tagline">
                            Giúp bạn xây dựng thương hiệu cá nhân và thu nhập bền vững từ chuyên môn của mình.
                        </p>
                        <div className="footer-social">
                            {socialLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="footer-social-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={link.label}
                                >
                                    <link.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="footer-column">
                        <h4 className="footer-column-title">Điều hướng</h4>
                        <nav className="footer-nav">
                            {quickLinks.map((link) => (
                                <Link key={link.path} to={link.path} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Products Column */}
                    <div className="footer-column">
                        <h4 className="footer-column-title">Sản phẩm</h4>
                        <nav className="footer-nav">
                            {productLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="footer-link footer-link-with-icon"
                                    target={link.href.startsWith('http') ? '_blank' : undefined}
                                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                >
                                    <link.icon size={16} />
                                    <span>{link.label}</span>
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Contact Column */}
                    <div className="footer-column">
                        <h4 className="footer-column-title">Liên hệ</h4>
                        <div className="footer-contact">
                            <p className="footer-contact-item">
                                <Mail size={16} />
                                <a href="mailto:thongphan.sales@gmail.com">thongphan.sales@gmail.com</a>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} Thông Phan. Tất cả quyền được bảo lưu.
                    </p>
                </div>
            </div>
        </footer>
    );
}
