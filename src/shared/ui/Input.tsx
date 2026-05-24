import type { InputHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  prefix?: string
}

export function Input({ label, error, prefix, className, ...props }: InputProps) {
  const input = (
    <input
      {...props}
      className={cn(
        'glass-control w-full rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition sm:px-4 sm:py-3 sm:text-base',
        'focus:border-black focus:ring-2 focus:ring-black/10',
        error && 'border-red-400 focus:border-red-500 focus:ring-red-100',
        prefix && 'pl-10',
        className,
      )}
    />
  )

  if (!label && !prefix && !error) return input

  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
            {prefix}
          </span>
        )}
        {input}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
