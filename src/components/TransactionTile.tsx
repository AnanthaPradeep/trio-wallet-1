import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, Wallet, ArrowLeftRight, Landmark, ArrowRightLeft } from 'lucide-react'
import { getCategoryMeta } from '../features/wallet/model/categories'
import type { Transaction } from '../features/wallet/model/types'
import { useDisplayCurrency } from '../shared/hooks/useDisplayCurrency'
import { cn } from '../shared/lib/cn'

interface TransactionTileProps {
  tx: Transaction
  walletName?: string
  onDelete?: (id: string) => void
  animationDelay?: number
}

const TYPE_CONFIG: Record<
  string,
  { label: string; amountColor: string; amountPrefix: string; bgColor: string; icon: LucideIcon }
> = {
  expense:           { label: 'Expense',  amountColor: 'text-red-500',     amountPrefix: '−', bgColor: 'bg-red-50',     icon: TrendingDown    },
  spend:             { label: 'Spend',    amountColor: 'text-red-500',     amountPrefix: '−', bgColor: 'bg-red-50',     icon: TrendingDown    },
  income:            { label: 'Income',   amountColor: 'text-emerald-600', amountPrefix: '+', bgColor: 'bg-emerald-50', icon: Wallet          },
  allocate_to_wallet:{ label: 'Allocate', amountColor: 'text-indigo-600',  amountPrefix: '⇢', bgColor: 'bg-indigo-50',  icon: ArrowRightLeft  },
  internal_transfer: { label: 'Wallet to Wallet', amountColor: 'text-blue-600',    amountPrefix: '⇄', bgColor: 'bg-blue-50',   icon: ArrowLeftRight  },
  bank_transfer:     { label: 'Wallet to Bank',   amountColor: 'text-violet-600',  amountPrefix: '→', bgColor: 'bg-violet-50', icon: Landmark        },
  bank_to_wallet:    { label: 'Bank to Wallet',   amountColor: 'text-emerald-600', amountPrefix: '←', bgColor: 'bg-emerald-50',icon: ArrowRightLeft  },
}

export function TransactionTile({ tx, walletName, onDelete, animationDelay = 0 }: TransactionTileProps) {
  const [showDelete, setShowDelete] = useState(false)
  const { formatDisplay } = useDisplayCurrency()
  const config = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.expense!
  const catMeta = tx.category ? getCategoryMeta(tx.category) : null

  const date = new Date(tx.createdAtIso)
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className="group opacity-0 animate-slide-up"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: 'forwards' }}
    >
      <div
        className="glass flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-200 hover:shadow-md cursor-pointer"
        onClick={() => onDelete && setShowDelete((v) => !v)}
      >
        {/* Icon */}
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', config.bgColor)}>
          {catMeta
            ? <catMeta.icon size={20} />
            : <config.icon size={20} />
          }
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{tx.note || config.label}</p>
          <div className="mt-0.5 flex items-center gap-2">
            {catMeta && (
              <span className={cn('rounded-full border px-2 py-0.5 text-xs font-medium', catMeta.cssClass)}>
                {catMeta.label}
              </span>
            )}
            {walletName && (
              <span className="text-xs text-gray-400 truncate">{walletName}</span>
            )}
          </div>
        </div>

        {/* Amount + time */}
        <div className="text-right shrink-0">
          <p className={cn('text-sm font-bold', config.amountColor)}>
            {config.amountPrefix} {formatDisplay(tx.amountMinor, tx.currency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{timeStr}</p>
        </div>

        {tx.status !== 'completed' && (
          <span
            className={cn(
              'ml-1 rounded-full px-2 py-0.5 text-xs font-medium',
              tx.status === 'pending' && 'bg-violet-50 text-violet-600',
              tx.status === 'failed' && 'bg-red-50 text-red-600',
            )}
          >
            {tx.status}
          </span>
        )}
      </div>

      {showDelete && onDelete && (
        <div className="animate-slide-down mt-1 flex justify-end px-2">
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(tx.id); setShowDelete(false) }}
            className="rounded-xl bg-red-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-red-600 active:scale-95"
          >
            Delete transaction
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(false) }}
            className="ml-2 rounded-xl bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-95"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
