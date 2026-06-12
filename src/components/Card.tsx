import { ReactNode } from 'react'

export function Card({ children, accent = false, className = '' }: { children: ReactNode, accent?: boolean, className?: string }) {
  return (
    <div className={`bg-cream text-ink rounded p-6 border border-dust ${accent ? 'border-l-4 border-l-ember' : ''} ${className}`}>
      {children}
    </div>
  )
}
