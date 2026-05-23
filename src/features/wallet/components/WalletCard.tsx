import type { LucideIcon } from 'lucide-react'
import { Sun, Receipt, Plane, PiggyBank, Star } from 'lucide-react'
import type { Wallet } from '../model/types'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { cn } from '../../../shared/lib/cn'

interface WalletCardProps {
  wallet: Wallet
  compact?: boolean
  selected?: boolean
  onClick?: () => void
}

const PURPOSE_ICON: Record<Wallet['purpose'], LucideIcon> = {
  daily:   Sun,
  bills:   Receipt,
  travel:  Plane,
  savings: PiggyBank,
  custom:  Star,
}

export function WalletCard({ wallet, compact, selected, onClick }: WalletCardProps) {
  const Icon = PURPOSE_ICON[wallet.purpose]
  const accentColor = wallet.color ?? '#0a0a0a'
  const { formatDisplay } = useDisplayCurrency()

  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 w-full',
          selected
            ? 'border-black bg-black text-white shadow-lg shadow-black/15'
            : 'glass border-white/80 hover:border-gray-300',
        )}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: selected ? 'rgba(255,255,255,0.15)' : `${accentColor}15`,
                   color: selected ? 'white' : accentColor }}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn('text-sm font-semibold truncate', selected ? 'text-white' : 'text-gray-900')}>
            {wallet.name}
          </p>
          <p className={cn('text-xs truncate', selected ? 'text-white/70' : 'text-gray-500')}>
            {formatDisplay(wallet.balanceMinor, wallet.currency)}
          </p>
        </div>
      </button>
    )
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
      style={{ background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}cc 100%)` }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/8" />

      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
          <Icon size={20} />
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium uppercase tracking-wide">
          {wallet.purpose}
        </span>
      </div>

      <div className="mt-6">
        <p className="text-xs font-medium uppercase tracking-widest text-white/60">Balance</p>
        <p className="mt-1 text-2xl font-bold leading-tight">
          {formatDisplay(wallet.balanceMinor, wallet.currency)}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-3">
        <p className="text-sm font-semibold">{wallet.name}</p>
        <p className="text-xs text-white/60">{wallet.currency}</p>
      </div>
    </div>
  )
}
