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
        variant === 'default' && 'glass p-6',
        variant === 'dark' && 'glass-dark p-6 text-white',
        variant === 'subtle' && 'glass-subtle p-6',
        variant === 'outline' && 'rounded-2xl border border-black/8 bg-white p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </div>
  )
}
