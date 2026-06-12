import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'rounded px-6 py-3 min-h-[44px] font-body text-sm tracking-wide transition-colors'
  const variants = {
    primary: 'bg-crimson text-cream hover:bg-ember',
    ghost: 'bg-transparent border border-dust text-cream hover:border-crimson',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
