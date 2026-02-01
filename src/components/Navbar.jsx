import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import MagneticButton from './MagneticButton';
import './Navbar.css';

const navLinks = [
    { path: '/about', label: 'Về Thông' },
    { path: '/blog', label: 'Blog' },
    { path: '/products', label: 'Sản phẩm' },
    { path: '/courses', label: 'Khóa học' },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    return (
        <header className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-text">Thông Phan</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="navbar-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`nav-link ${location.pathname === link.path ? 'nav-link-active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* CTA Button */}
                <div className="navbar-cta">
                    <MagneticButton
                        variant="primary"
                        size="small"
                        href="https://learn.thongphan.com"
                    >
                        Vào Tensai
                    </MagneticButton>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="navbar-mobile-toggle"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`navbar-mobile-menu ${isMobileMenuOpen ? 'navbar-mobile-menu-open' : ''}`}>
                <nav className="navbar-mobile-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`mobile-nav-link ${location.pathname === link.path ? 'mobile-nav-link-active' : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <MagneticButton
                        variant="primary"
                        href="https://learn.thongphan.com"
                        className="mobile-cta"
                    >
                        Vào Tensai
                    </MagneticButton>
                </nav>
            </div>
        </header>
    );
}
