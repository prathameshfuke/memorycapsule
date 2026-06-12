import { ReactNode } from 'react'

export function PageContainer({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[860px] px-6 md:px-8 pt-24 md:pt-24 pb-16 ${className}`}>
      {children}
    </div>
  )
}
