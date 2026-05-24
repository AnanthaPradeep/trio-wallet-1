import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { DashboardMetricCard } from '../components/DashboardMetricCard'
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

  const monthlyBankTransfer = useMemo(
    () =>
      transactions
        .filter(
          (tx) =>
            tx.status === 'completed' &&
            tx.type === 'bank_transfer' &&
            new Date(tx.createdAtIso) >= startOfMonth,
        )
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [transactions, convertToDisplay],
  )

  const monthlyRemaining = useMemo(
    () => monthlyIncome - monthlyExpenses,
    [monthlyIncome, monthlyExpenses],
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

  const totalTransferMinor = useMemo(
    () =>
      transactions
        .filter((tx) => tx.status === 'completed' && tx.type === 'bank_transfer')
        .reduce((sum, tx) => sum + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [transactions, convertToDisplay],
  )

  const statCards = [
    {
      label: 'Total Pool',
      value: formatDisplay(totalPoolMinor, displayCurrency),
      caption: `In ${displayCurrency}`,
      badgeText: totalPoolMinor >= 0 ? '+Active' : '-Low',
      gradientClass: 'from-blue-500 via-blue-600 to-sky-500',
    },
    {
      label: 'Total Earned',
      value: formatDisplay(totalEarnedMinor, displayCurrency),
      caption: `In ${displayCurrency}`,
      badgeText: '+Inflow',
      gradientClass: 'from-emerald-500 via-emerald-600 to-teal-500',
    },
    {
      label: 'Total Spent',
      value: formatDisplay(totalSpentMinor, displayCurrency),
      caption: `In ${displayCurrency}`,
      badgeText: '-Outflow',
      gradientClass: 'from-rose-500 via-red-600 to-orange-500',
    },
    {
      label: 'Total Transfer',
      value: formatDisplay(totalTransferMinor, displayCurrency),
      caption: `In ${displayCurrency}`,
      badgeText: '+Moved',
      gradientClass: 'from-violet-500 via-indigo-600 to-blue-500',
    },
  ]

  const monthlyCards = [
    {
      label: 'Month Spent',
      value: formatDisplay(monthlyExpenses, displayCurrency),
      caption: 'Includes bank transfer payments',
      badgeText: '-Outflow',
      gradientClass: 'from-rose-500 via-red-600 to-orange-500',
    },
    {
      label: 'Monthly Earned',
      value: formatDisplay(monthlyIncome, displayCurrency),
      caption: 'This month',
      badgeText: '+Inflow',
      gradientClass: 'from-emerald-500 via-emerald-600 to-teal-500',
    },
    {
      label: 'Monthly Remaining',
      value: formatDisplay(Math.abs(monthlyRemaining), displayCurrency),
      caption: monthlyRemaining >= 0 ? 'Surplus this month' : 'Deficit this month',
      badgeText: monthlyRemaining >= 0 ? '+Surplus' : '-Deficit',
      gradientClass: monthlyRemaining >= 0
        ? 'from-blue-500 via-blue-600 to-cyan-500'
        : 'from-orange-500 via-amber-600 to-yellow-500',
    },
    {
      label: 'Monthly Bank Transfer',
      value: formatDisplay(monthlyBankTransfer, displayCurrency),
      caption: 'Wallet to bank this month',
      badgeText: '-Bank',
      gradientClass: 'from-violet-500 via-indigo-600 to-blue-500',
    },
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

      {/* Core cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up delay-75">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={APP_ROUTES.analytics}
            className="block h-full transition-transform hover:scale-[1.01]"
          >
            <DashboardMetricCard
              title={card.label}
              value={card.value}
              caption={card.caption}
              badgeText={card.badgeText}
              gradientClass={card.gradientClass}
            />
          </Link>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up delay-100">
        {monthlyCards.map((card) => (
          <Link
            key={card.label}
            to={APP_ROUTES.analytics}
            className="block h-full transition-transform hover:scale-[1.01]"
          >
            <DashboardMetricCard
              title={card.label}
              value={card.value}
              caption={card.caption}
              badgeText={card.badgeText}
              gradientClass={card.gradientClass}
            />
          </Link>
        ))}
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
