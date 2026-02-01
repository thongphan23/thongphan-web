import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './MagneticButton.css';

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

        const distanceX = (e.clientX - centerX) * 0.3;
        const distanceY = (e.clientY - centerY) * 0.3;

        setPosition({ x: distanceX, y: distanceY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const buttonClass = `magnetic-btn magnetic-btn-${variant} ${size === 'large' ? 'magnetic-btn-large' : ''} ${size === 'small' ? 'magnetic-btn-small' : ''} ${className}`;

    const content = (
        <>
            <span className="magnetic-btn-text">{children}</span>
            <span className="magnetic-btn-glow" />
        </>
    );

    const MotionWrapper = motion.div;

    // External link
    if (href) {
        return (
            <MotionWrapper
                className="magnetic-wrapper"
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <a href={href} className={buttonClass} target="_blank" rel="noopener noreferrer" {...props}>
                    {content}
                </a>
            </MotionWrapper>
        );
    }

    // Internal link
    if (to) {
        return (
            <MotionWrapper
                className="magnetic-wrapper"
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                animate={{ x: position.x, y: position.y }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
                <Link to={to} className={buttonClass} {...props}>
                    {content}
                </Link>
            </MotionWrapper>
        );
    }

    // Button
    return (
        <MotionWrapper
            className="magnetic-wrapper"
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <button className={buttonClass} onClick={onClick} {...props}>
                {content}
            </button>
        </MotionWrapper>
    );
}
