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
        background: 'rgba(26, 22, 20, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(250, 247, 242, 0.1)',
        borderRadius: '4px',
        padding: '40px',
      }
    : {
        background: 'var(--color-cream)',
        border: '1px solid var(--color-dust)',
        borderLeft: leftBorder ? '4px solid var(--color-sepia)' : '1px solid var(--color-dust)',
        borderRadius: '4px',
        padding: '24px',
        boxShadow: 'none',
      };

  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={`${onClick ? 'cursor-pointer text-left w-full' : ''} ${className}`}
      style={baseStyles}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
}
