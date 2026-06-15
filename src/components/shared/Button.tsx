import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** 'primary' = --crimson bg, --cream text. 'ghost' = transparent, --dust border */
  variant?: 'primary' | 'ghost';
  /** Makes the button full-width */
  fullWidth?: boolean;
  /** Adapts button contrast and styles for dark backgrounds */
  onDark?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  onDark = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const btnClass = [
    'app-button',
    variant === 'primary'
      ? (onDark ? 'app-button-primary-dark' : 'app-button-primary')
      : (onDark ? 'app-button-ghost-dark' : 'app-button-ghost'),
    fullWidth ? 'app-button-full' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={btnClass}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
