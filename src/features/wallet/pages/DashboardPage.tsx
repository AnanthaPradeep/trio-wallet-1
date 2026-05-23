import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { TransactionList } from '../components/TransactionList'
import { WalletCard } from '../components/WalletCard'
import { useWalletApp } from '../hooks/useWalletApp'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { useMemo } from 'react'
import { cn } from '../../../shared/lib/cn'

export function DashboardPage() {
  const { wallets, pools, transactions, deleteTransaction } = useWalletApp()
  const { displayCurrency, convertToDisplay, formatDisplay } = useDisplayCurrency()

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const monthlyExpenses = useMemo(
    () =>
      transactions
        .filter(
          (tx) =>
            tx.status === 'completed' &&
            (tx.type === 'expense' || tx.type === 'spend' || tx.type === 'bank_transfer') &&
            new Date(tx.createdAtIso) >= startOfMonth,
        )
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [transactions, convertToDisplay],
  )

  const monthlyIncome = useMemo(
    () =>
      transactions
        .filter(
          (tx) =>
            tx.status === 'completed' &&
            (tx.type === 'income' || tx.type === 'bank_to_wallet') &&
            new Date(tx.createdAtIso) >= startOfMonth,
        )
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [transactions, convertToDisplay],
  )

  const totalEarnedMinor = useMemo(
    () => pools.reduce((sum, pool) => sum + convertToDisplay(pool.totalAddedMinor, pool.currency), 0),
    [pools, convertToDisplay],
  )

  const totalSpentMinor = useMemo(
    () => pools.reduce((sum, pool) => sum + convertToDisplay(pool.totalSpentMinor, pool.currency), 0),
    [pools, convertToDisplay],
  )

  const totalPoolMinor = useMemo(() => totalEarnedMinor - totalSpentMinor, [totalEarnedMinor, totalSpentMinor])

  const allocatedTotalMinor = useMemo(
    () => wallets.reduce((sum, wallet) => sum + convertToDisplay(wallet.balanceMinor, wallet.currency), 0),
    [wallets, convertToDisplay],
  )

  const unallocatedTotalMinor = useMemo(
    () => pools.reduce((sum, pool) => sum + convertToDisplay(pool.unallocatedMinor, pool.currency), 0),
    [pools, convertToDisplay],
  )

  const statCards = [
    { label: 'Total Pool', value: formatDisplay(totalPoolMinor, displayCurrency), tone: 'text-gray-900' },
    { label: 'Allocated Total', value: formatDisplay(allocatedTotalMinor, displayCurrency), tone: 'text-blue-600' },
    { label: 'Unallocated Amount', value: formatDisplay(unallocatedTotalMinor, displayCurrency), tone: 'text-amber-600' },
    { label: 'Total Spent', value: formatDisplay(totalSpentMinor, displayCurrency), tone: 'text-red-500' },
    { label: 'Total Earned', value: formatDisplay(totalEarnedMinor, displayCurrency), tone: 'text-emerald-600' },
    { label: 'Wallet Count', value: String(wallets.length), tone: 'text-gray-900' },
  ]

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 pb-20 sm:space-y-7 sm:pb-24 md:space-y-8 md:pb-10">
      {/* Hero greeting */}
      <div className="animate-slide-up space-y-1">
        <p className="text-sm text-gray-500 font-medium">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your Financial Overview</h1>
      </div>

      {/* Core pool and wallet math */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 animate-slide-up delay-75">
        {statCards.map((card) => (
          <div key={card.label} className="glass rounded-3xl p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{card.label}</p>
            <p className={cn('mt-2 text-lg font-bold sm:text-xl', card.tone)}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">In {displayCurrency}</p>
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 animate-slide-up delay-100">
        <div className="glass rounded-3xl p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Month Spent</p>
          <p className="mt-2 text-lg font-bold text-red-500 sm:text-xl">
            {formatDisplay(monthlyExpenses, displayCurrency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">This month</p>
        </div>
        <div className="glass rounded-3xl p-4 sm:p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Month Earned</p>
          <p className="mt-2 text-lg font-bold text-emerald-600 sm:text-xl">
            {formatDisplay(monthlyIncome, displayCurrency)}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">This month</p>
        </div>
      </div>

      {/* Quick action chips */}
      <div className="flex gap-2 flex-wrap animate-slide-up delay-150">
        {[
          { to: APP_ROUTES.addExpense,      label: '+ Expense',  color: 'bg-red-500 text-white'   },
          { to: APP_ROUTES.addIncome,       label: '+ Pool Add', color: 'bg-emerald-500 text-white'},
          { to: APP_ROUTES.allocateFunds,   label: 'Allocate',   color: 'bg-indigo-500 text-white' },
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
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
