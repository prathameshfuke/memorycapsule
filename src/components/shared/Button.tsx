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
  const base =
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[4px] text-xs uppercase tracking-[0.18em] font-semibold transition-all duration-200 ease-out cursor-pointer transform disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const variants = {
    primary: onDark
      ? 'bg-crimson text-cream hover:bg-ember border border-transparent py-3 px-6 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(195,35,43,0.4)] active:translate-y-0 active:scale-[0.97]'
      : 'bg-crimson text-cream hover:bg-ember border border-transparent py-3 px-6 hover:-translate-y-[2px] hover:shadow-[0_6px_20px_rgba(195,35,43,0.25)] active:translate-y-0 active:scale-[0.97]',
    
    ghost: onDark
      ? 'bg-transparent border border-dust text-cream hover:border-cream hover:text-cream hover:bg-cream/10 py-3 px-6 hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.97]'
      : 'bg-transparent border border-dust text-ink hover:border-crimson hover:text-crimson hover:bg-cream py-3 px-6 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(28,20,16,0.05)] active:translate-y-0 active:scale-[0.97]',
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
