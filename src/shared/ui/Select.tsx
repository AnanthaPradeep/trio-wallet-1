import type { SelectHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition appearance-none',
        'focus:border-black focus:ring-2 focus:ring-black/10',
        'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-position-[right_12px_center] bg-no-repeat bg-size-[20px]',
        props.className,
      )}
    />
  )
}
