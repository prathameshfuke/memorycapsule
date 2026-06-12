import { ReactNode } from 'react'

export function PageContainer({ children, className = '' }: { children: ReactNode, className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[860px] px-4 md:px-8 pt-10 md:pt-16 pb-8 md:pb-16 ${className}`}>
      {children}
    </div>
  )
}
