import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'rounded-[4px] px-6 py-3 min-h-[44px] font-body text-sm tracking-wide transition-colors'
  const variants = {
    primary: 'bg-crimson text-cream hover:bg-ember',
    ghost: 'bg-transparent border border-dust text-ink hover:border-crimson hover:text-crimson',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
