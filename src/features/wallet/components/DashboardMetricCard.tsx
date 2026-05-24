import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'

interface DashboardMetricCardProps {
  title: string
  value: string
  caption: string
  badgeText?: string
  gradientClass?: string
}

export function DashboardMetricCard({
  title,
  value,
  caption,
  badgeText,
  gradientClass = 'from-blue-500 via-blue-600 to-sky-500',
}: DashboardMetricCardProps) {
  return (
    <article className="w-full rounded-[20px] bg-white p-3 shadow-[0_20px_45px_rgba(17,24,39,0.12)] sm:min-h-52.5 sm:p-4">
      <div className={cn('rounded-2xl bg-linear-to-br p-4 text-white sm:p-5', gradientClass)}>
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-white/85">{title}</p>
          {badgeText && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold backdrop-blur">
              <ArrowUpRight size={12} />
              {badgeText}
            </span>
          )}
        </div>
        <p className="mt-3 text-3xl font-bold leading-none tracking-tight sm:text-4xl">{value}</p>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{caption}</p>
    </article>
  )
}
