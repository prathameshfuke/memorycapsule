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
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] text-xs uppercase tracking-[0.16em] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-crimson text-cream hover:bg-ember border border-transparent py-3 px-6',
    ghost: 'bg-transparent border border-dust text-ink hover:border-crimson hover:text-crimson py-3 px-6',
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
