import { Link } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { TransactionList } from '../components/TransactionList'
import { WalletCard } from '../components/WalletCard'
import { useWalletApp } from '../hooks/useWalletApp'
import { useWalletTotals } from '../hooks/useWalletTotals'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { useMemo } from 'react'
import { cn } from '../../../shared/lib/cn'
import type { CurrencyCode } from '../../../shared/lib/money'

export function DashboardPage() {
  const { wallets, transactions, deleteTransaction } = useWalletApp()
  const totals = useWalletTotals()
  const { formatDisplay } = useDisplayCurrency()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyExpenses = useMemo(
    () =>
      transactions
        .filter((tx) => (tx.type === 'expense' || tx.type === 'spend') && new Date(tx.createdAtIso) >= startOfMonth)
        .reduce((sum, tx) => sum + tx.amountMinor, 0),
    [transactions],
  )

  const monthlyIncome = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === 'income' && new Date(tx.createdAtIso) >= startOfMonth)
        .reduce((sum, tx) => sum + tx.amountMinor, 0),
    [transactions],
  )

  const activeBalances = Object.entries(totals).filter(([, amt]) => (amt ?? 0) > 0)
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8 pb-32">
      {/* Hero greeting */}
      <div className="animate-slide-up space-y-1">
        <p className="text-sm text-gray-500 font-medium">{greeting}</p>
        <h1 className="text-3xl font-bold text-gray-900">Your Financial Overview</h1>
      </div>

      {/* Net worth / total balance strip */}
      {activeBalances.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1 animate-slide-up delay-75">
          {activeBalances.map(([currency, amount]) => (
            <div key={currency} className="glass shrink-0 rounded-3xl px-6 py-4 min-w-40">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-gray-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{currency}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDisplay(amount ?? 0, currency as CurrencyCode)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Total balance</p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly summary */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up delay-100">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Month Spent</p>
          <p className="mt-2 text-xl font-bold text-red-500">
            {formatDisplay(monthlyExpenses, 'INR')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">This month</p>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Month Earned</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">
            {formatDisplay(monthlyIncome, 'INR')}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">This month</p>
        </div>
      </div>

      {/* Quick action chips */}
      <div className="flex gap-2 flex-wrap animate-slide-up delay-150">
        {[
          { to: APP_ROUTES.addExpense,      label: '+ Expense',  color: 'bg-red-500 text-white'   },
          { to: APP_ROUTES.addIncome,       label: '+ Income',   color: 'bg-emerald-500 text-white'},
          { to: APP_ROUTES.transferInternal,label: 'Transfer',   color: 'bg-blue-500 text-white'  },
          { to: APP_ROUTES.analytics,       label: 'Analytics',  color: 'bg-gray-900 text-white'  },
        ].map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={cn(
              'rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:scale-105 active:scale-95',
              action.color,
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>

      {/* Wallets */}
      <div className="animate-slide-up delay-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Wallets</h2>
          <Link to={APP_ROUTES.manage} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
            Manage →
          </Link>
        </div>
        {wallets.length === 0 ? (
          <div className="glass rounded-3xl border-2 border-dashed border-gray-200 py-12 text-center">
            <p className="text-gray-400">No wallets yet</p>
            <Link to={APP_ROUTES.manage} className="mt-2 block text-sm font-semibold text-black underline">
              Create your first wallet
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {wallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="animate-slide-up delay-300">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
          <Link to={APP_ROUTES.history} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
            See all →
          </Link>
        </div>
        <TransactionList
          transactions={transactions.slice(0, 5)}
          wallets={wallets}
          onDelete={deleteTransaction}
          groupByDate={false}
        />
      </div>
    </div>
  )
}
