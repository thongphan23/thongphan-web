import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MagneticButton({
    children,
    variant = 'primary',
    size = 'default',
    href,
    to,
    onClick,
    className = '',
    ...props
}) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.2;
        const deltaY = (e.clientY - centerY) * 0.2;
        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variantClass = `magnetic-btn-${variant}`;
    const sizeClass = size === 'large' ? 'magnetic-btn-large' : size === 'small' ? 'magnetic-btn-small' : '';
    const buttonClass = `magnetic-btn ${variantClass} ${sizeClass} ${className}`.trim();

    const style = {
        transform: `translate(${position.x}px, ${position.y}px)`,
    };

    const content = (
        <>
            <span className="magnetic-btn-glow" />
            <span className="magnetic-btn-text">{children}</span>
        </>
    );

    if (href) {
        return (
            <div className="magnetic-wrapper">
                <a
                    ref={buttonRef}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass}
                    style={style}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    {...props}
                >
                    {content}
                </a>
            </div>
        );
    }

    if (to) {
        return (
            <div className="magnetic-wrapper">
                <Link
                    ref={buttonRef}
                    to={to}
                    className={buttonClass}
                    style={style}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    {...props}
                >
                    {content}
                </Link>
            </div>
        );
    }

    return (
        <div className="magnetic-wrapper">
            <button
                ref={buttonRef}
                className={buttonClass}
                style={style}
                onClick={onClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                {...props}
            >
                {content}
            </button>
        </div>
    );
}
