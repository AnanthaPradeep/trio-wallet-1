import { useMemo } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Sun, Receipt, Plane, PiggyBank, Star } from 'lucide-react'
import { getCategoryMeta } from '../model/categories'
import type { ExpenseCategory } from '../model/types'
import type { Wallet } from '../model/types'
import { useWalletApp } from '../hooks/useWalletApp'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { cn } from '../../../shared/lib/cn'

const PURPOSE_ICON: Record<Wallet['purpose'], LucideIcon> = {
  daily:   Sun,
  bills:   Receipt,
  travel:  Plane,
  savings: PiggyBank,
  custom:  Star,
}

function StatCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="glass rounded-3xl p-5 animate-slide-up">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold', positive ? 'text-emerald-600' : 'text-gray-900')}>{value}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}

export function AnalyticsPage() {
  const { transactions, wallets, pools } = useWalletApp()
  const { displayCurrency, convertToDisplay, formatDisplay } = useDisplayCurrency()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyTx = useMemo(
    () => transactions.filter((tx) => new Date(tx.createdAtIso) >= startOfMonth),
    [transactions],
  )

  const totalExpensesMinor = useMemo(
    () =>
      monthlyTx
        .filter((tx) => tx.status === 'completed' && (tx.type === 'expense' || tx.type === 'spend' || tx.type === 'bank_transfer'))
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [monthlyTx, convertToDisplay],
  )

  const totalIncomeMinor = useMemo(
    () =>
      monthlyTx
        .filter((tx) => tx.status === 'completed' && (tx.type === 'income' || tx.type === 'bank_to_wallet'))
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [monthlyTx, convertToDisplay],
  )

  const totalPoolMinor = useMemo(
    () => pools.reduce((sum, pool) => sum + convertToDisplay(pool.totalAddedMinor - pool.totalSpentMinor, pool.currency), 0),
    [pools, convertToDisplay],
  )

  const categoryBreakdown = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    for (const tx of transactions) {
      if ((tx.type === 'expense' || tx.type === 'spend') && tx.category && tx.status === 'completed') {
        map.set(tx.category, (map.get(tx.category) ?? 0) + convertToDisplay(tx.amountMinor, tx.currency))
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [transactions, convertToDisplay])

  const savingsRate = totalIncomeMinor > 0
    ? Math.round(((totalIncomeMinor - totalExpensesMinor) / totalIncomeMinor) * 100)
    : 0

  const maxCategoryAmount = categoryBreakdown[0]?.[1] ?? 1
  const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="space-y-6 pb-20 sm:pb-24 md:pb-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">{monthName} overview</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Monthly Spend"  value={formatDisplay(totalExpensesMinor, displayCurrency)} sub="This month" />
        <StatCard label="Monthly Income" value={formatDisplay(totalIncomeMinor, displayCurrency)}   sub="This month" positive />
        <StatCard label="Savings Rate"   value={`${savingsRate}%`} sub={savingsRate >= 0 ? 'On track' : 'Overspending'} />
        <StatCard
          label="Total Pool"
          value={formatDisplay(totalPoolMinor, displayCurrency)}
          sub={`${wallets.length} wallets`}
        />
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="glass rounded-3xl p-5 space-y-4 animate-slide-up delay-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Spending by Category</p>
            <span className="text-xs text-gray-500">All time</span>
          </div>
          <div className="space-y-3">
            {categoryBreakdown.map(([cat, amount]) => {
              const meta = getCategoryMeta(cat)
              const pct = Math.round((amount / maxCategoryAmount) * 100)
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <meta.icon size={18} />
                      <span className="text-sm font-medium text-gray-800">{meta.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatDisplay(amount, displayCurrency)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-black transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Wallet balances */}
      <div className="glass rounded-3xl p-5 space-y-4 animate-slide-up delay-200">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Wallet Balances</p>
        <div className="space-y-3">
          {wallets.map((wallet) => {
            const Icon = PURPOSE_ICON[wallet.purpose]
            return (
              <div key={wallet.id} className="flex items-center gap-4">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: wallet.color ?? '#0a0a0a' }}
                >
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-gray-800 truncate">{wallet.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-2 shrink-0">
                      {formatDisplay(wallet.balanceMinor, wallet.currency)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{wallet.currency}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Activity summary */}
      <div className="glass rounded-3xl p-4 sm:p-5 animate-slide-up delay-300">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Activity Summary</p>
        <div className="grid grid-cols-1 gap-4 text-center sm:grid-cols-3">
          {[
            { label: 'Expenses',  count: monthlyTx.filter((t) => t.type === 'expense' || t.type === 'spend').length, color: 'text-red-500'     },
            { label: 'Income',    count: monthlyTx.filter((t) => t.type === 'income' || t.type === 'bank_to_wallet').length, color: 'text-emerald-600' },
            { label: 'Transfers', count: monthlyTx.filter((t) => t.type === 'internal_transfer' || t.type === 'allocate_to_wallet').length, color: 'text-blue-600'   },
          ].map((item) => (
            <div key={item.label}>
              <p className={cn('text-3xl font-bold', item.color)}>{item.count}</p>
              <p className="mt-1 text-xs text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
