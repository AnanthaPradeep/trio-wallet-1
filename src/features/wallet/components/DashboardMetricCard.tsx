import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'

interface DashboardMetricCardProps {
  title: string
  value: string
  description?: string
  caption: string
  badgeText?: string
  gradientClass?: string
}

export function DashboardMetricCard({
  title,
  value,
  description,
  caption,
  badgeText,
  gradientClass = 'from-blue-500 via-blue-600 to-sky-500',
}: DashboardMetricCardProps) {
  return (
    <article className="flex h-full min-h-64 w-full flex-col rounded-[20px] bg-white p-3 shadow-[0_20px_45px_rgba(17,24,39,0.12)] sm:p-4">
      <div className={cn('min-h-40 rounded-2xl bg-linear-to-br p-4 text-white sm:min-h-44 sm:p-5', gradientClass)}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-card-title text-sm font-semibold text-white/90">{title}</p>
          {badgeText && (
            <span className="font-card-body inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold backdrop-blur">
              <ArrowUpRight size={12} />
              {badgeText}
            </span>
          )}
        </div>
        <p className="font-card-value mt-3 max-w-full wrap-break-word text-[clamp(2rem,3vw,3rem)] font-bold leading-tight tracking-tight">
          {value}
        </p>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between gap-3">
        <div className="min-h-14 rounded-xl bg-gray-50 px-3 py-2">
          {description && <p className="font-card-description text-xs leading-5 text-gray-700">{description}</p>}
        </div>
        <p className="font-card-title text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{caption}</p>
      </div>
    </article>
  )
}
