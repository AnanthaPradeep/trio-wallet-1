import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button({ variant = 'primary', size = 'md', fullWidth, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'rounded-xl px-3 py-2 text-xs sm:px-4 sm:text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm sm:px-6 sm:py-3',
        size === 'lg' && 'px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base',
        variant === 'primary' && 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20',
        variant === 'secondary' && 'glass-control text-gray-900 hover:bg-white/75',
        variant === 'ghost' && 'glass-control border border-white/70 text-gray-700 hover:bg-white/68',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
        variant === 'success' && 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
