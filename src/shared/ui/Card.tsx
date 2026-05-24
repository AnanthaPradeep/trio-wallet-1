import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'dark' | 'subtle' | 'outline'
}

export function Card({ children, className, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl',
        variant === 'default' && 'glass p-4 sm:p-5 md:p-6',
        variant === 'dark' && 'glass-dark p-4 text-white sm:p-5 md:p-6',
        variant === 'subtle' && 'glass-subtle p-4 sm:p-5 md:p-6',
          variant === 'outline' && 'glass-panel-soft border border-white/70 p-4 shadow-sm sm:p-5 md:p-6',
        className,
      )}
    >
      {children}
    </div>
  )
}
