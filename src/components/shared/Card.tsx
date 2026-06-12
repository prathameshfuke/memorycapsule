import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds a 4px --sepia left border (used for game cards) */
  leftBorder?: boolean;
  /** Frosted glass variant for locked overlays */
  frosted?: boolean;
  /** onClick handler for clickable cards */
  onClick?: () => void;
}

export default function Card({
  children,
  className = '',
  leftBorder = false,
  frosted = false,
  onClick,
}: CardProps) {
  const baseStyles: React.CSSProperties = frosted
    ? {
        background: 'rgba(28, 20, 16, 0.86)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(156, 138, 124, 0.65)',
        borderRadius: '4px',
        padding: '40px',
      }
    : {
        background: 'var(--color-cream)',
        border: '1px solid var(--color-dust)',
        borderRadius: '4px',
        padding: '24px',
        boxShadow: 'none',
        color: 'var(--color-ink)',
      };

  const Tag = onClick ? 'button' : 'div';
  const leftBorderClass = leftBorder ? 'border-l-4 border-l-[var(--color-red)] hover:border-l-[var(--color-red-deep)] transition-colors' : '';

  return (
    <Tag
      className={`app-card ${onClick ? 'app-card-clickable cursor-pointer text-left w-full' : ''} ${leftBorderClass} ${className}`}
      style={baseStyles}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
