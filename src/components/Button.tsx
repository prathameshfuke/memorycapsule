import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const btnClass = [
    'app-button',
    variant === 'primary' ? 'app-button-primary' : 'app-button-ghost',
    className
  ].filter(Boolean).join(' ');

  return <button className={btnClass} {...props} />
}
