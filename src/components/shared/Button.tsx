import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** 'primary' = --blush bg, --ink text. 'ghost' = transparent, --dust border */
  variant?: 'primary' | 'ghost';
  /** Makes the button full-width */
  fullWidth?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-[4px] text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-[var(--color-blush)] text-[var(--color-ink)] hover:bg-[var(--color-blush)]/85 py-3.5 px-8',
    ghost:
      'bg-transparent border border-[var(--color-dust)] text-[var(--color-ink)] hover:bg-[var(--color-cream)] py-3.5 px-8',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
