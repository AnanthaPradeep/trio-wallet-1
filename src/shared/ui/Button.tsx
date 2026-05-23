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
        size === 'sm' && 'px-4 py-2 text-sm rounded-xl',
        size === 'md' && 'px-6 py-3 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        variant === 'primary' && 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/20',
        variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        variant === 'ghost' && 'bg-transparent text-gray-700 hover:bg-gray-100 border border-gray-200',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25',
        variant === 'success' && 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    />
  )
}
