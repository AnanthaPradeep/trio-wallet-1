import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { FolderOpen, TrendingDown, Wallet, ArrowLeftRight, Landmark } from 'lucide-react'
import { EXPENSE_CATEGORIES } from '../model/categories'
import type { ExpenseCategory, TransactionType } from '../model/types'
import { TransactionList } from '../components/TransactionList'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'

interface TypeFilter {
  key: TransactionType | 'all'
  label: string
  icon: LucideIcon
}

const TYPE_FILTERS: TypeFilter[] = [
  { key: 'all',               label: 'All',              icon: FolderOpen     },
  { key: 'expense',           label: 'Expenses',         icon: TrendingDown   },
  { key: 'income',            label: 'Income',           icon: Wallet         },
  { key: 'allocate_to_wallet',label: 'Allocate',         icon: Wallet         },
  { key: 'internal_transfer', label: 'Wallet to Wallet', icon: ArrowLeftRight },
  { key: 'bank_transfer',     label: 'Wallet to Bank',   icon: Landmark       },
  { key: 'bank_to_wallet',    label: 'Bank to Wallet',   icon: Landmark       },
]

export function HistoryPage() {
  const { transactions, wallets, bankAccounts, deleteTransaction } = useWalletApp()
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(
    () =>
      transactions.filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false
        if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false
        if (query.trim() && !tx.note.toLowerCase().includes(query.toLowerCase())) return false
        return true
      }),
    [transactions, typeFilter, categoryFilter, query],
  )

  const showCategoryFilter = typeFilter === 'all' || typeFilter === 'expense' || typeFilter === 'spend'

  return (
    <div className="space-y-5 pb-20 sm:pb-24 md:pb-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-sm text-gray-500">{transactions.length} total transactions</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search transactions..."
          className="glass-control w-full rounded-2xl py-3 pl-11 pr-10 text-gray-900 outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Type filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setTypeFilter(f.key); setCategoryFilter('all') }}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-sm font-semibold transition-all active:scale-95',
              typeFilter === f.key
                ? 'border-black bg-black text-white shadow-md'
                : 'glass-control text-gray-600 hover:border-gray-400',
            )}
          >
            <f.icon size={14} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      {showCategoryFilter && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          <button
            onClick={() => setCategoryFilter('all')}
            className={cn(
              'shrink-0 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
              categoryFilter === 'all'
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'glass-control text-gray-600',
            )}
          >
            All Categories
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(cat.key)}
              className={cn(
                'flex shrink-0 items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all',
                categoryFilter === cat.key
                  ? `${cat.cssClass} border-current`
                  : 'glass-control text-gray-600',
              )}
            >
              <cat.icon size={12} />
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {(typeFilter !== 'all' || categoryFilter !== 'all' || query) && (
        <p className="text-xs text-gray-400 font-medium">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
          <button
            onClick={() => { setTypeFilter('all'); setCategoryFilter('all'); setQuery('') }}
            className="ml-2 text-black underline"
          >
            Clear filters
          </button>
        </p>
      )}

      <TransactionList
        transactions={filtered}
        wallets={wallets}
        bankAccounts={bankAccounts}
        onDelete={deleteTransaction}
        emptyMessage="No transactions match your filters."
        groupByDate
      />
    </div>
  )
}
