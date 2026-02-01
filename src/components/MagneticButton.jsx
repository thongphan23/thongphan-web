import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MagneticButton({
    children,
    variant = 'primary',
    size = 'medium',
    href,
    to,
    onClick,
    className = '',
    disabled = false,
    ...props
}) {
    const buttonRef = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        if (!buttonRef.current || disabled) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.15;
        const deltaY = (e.clientY - centerY) * 0.15;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const variantClass = `magnetic-btn-${variant}`;
    const sizeClass = size === 'large' ? 'magnetic-btn-large' : size === 'small' ? 'magnetic-btn-small' : '';
    const combinedClassName = `magnetic-btn ${variantClass} ${sizeClass} ${className}`.trim();

    const style = {
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 && position.y === 0 ? 'transform 0.3s ease-out' : 'none',
    };

    const content = (
        <>
            <span className="magnetic-btn-text">{children}</span>
            <span className="magnetic-btn-glow" />
        </>
    );

    // External link
    if (href) {
        return (
            <div className="magnetic-wrapper">
                <a
                    ref={buttonRef}
                    href={href}
                    className={combinedClassName}
                    style={style}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                >
                    {content}
                </a>
            </div>
        );
    }

    // Internal link
    if (to) {
        return (
            <div className="magnetic-wrapper">
                <Link
                    ref={buttonRef}
                    to={to}
                    className={combinedClassName}
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

    // Button
    return (
        <div className="magnetic-wrapper">
            <button
                ref={buttonRef}
                className={combinedClassName}
                style={style}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={onClick}
                disabled={disabled}
                {...props}
            >
                {content}
            </button>
        </div>
    );
}
