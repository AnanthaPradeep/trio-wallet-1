import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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
      label: 'Total Balance',
      value: formatDisplay(totalPoolMinor, displayCurrency),
      description: 'All money added minus all money spent across your wallets.',
      caption: `In ${displayCurrency}`,
      badgeText: totalPoolMinor >= 0 ? '+Net' : '-Net',
      gradientClass: 'from-blue-500 via-blue-600 to-sky-500',
    },
    {
      label: 'Total Income',
      value: formatDisplay(totalEarnedMinor, displayCurrency),
      description: 'All completed money added into wallets.',
      caption: `In ${displayCurrency}`,
      badgeText: '+Inflow',
      gradientClass: 'from-emerald-500 via-emerald-600 to-teal-500',
    },
    {
      label: 'Total Expenses',
      value: formatDisplay(totalSpentMinor, displayCurrency),
      description: 'All completed spending taken from wallets.',
      caption: `In ${displayCurrency}`,
      badgeText: '-Outflow',
      gradientClass: 'from-rose-500 via-red-600 to-orange-500',
    },
    {
      label: 'Total Bank Transfers',
      value: formatDisplay(totalTransferMinor, displayCurrency),
      description: 'All completed transfers moved from wallets to bank accounts.',
      caption: `In ${displayCurrency}`,
      badgeText: '-Bank',
      gradientClass: 'from-violet-500 via-indigo-600 to-blue-500',
    },
  ]

  const monthlyCards = [
    {
      label: 'This Month Balance',
      value: formatDisplay(monthlyRemaining, displayCurrency),
      description: 'Money left this month after income and expenses.',
      caption: monthlyRemaining >= 0 ? 'Surplus this month' : 'Deficit this month',
      badgeText: monthlyRemaining >= 0 ? '+Net' : '-Net',
      gradientClass: monthlyRemaining >= 0
        ? 'from-blue-500 via-blue-600 to-cyan-500'
        : 'from-orange-500 via-amber-600 to-yellow-500',
    },
    {
      label: 'This Month Income',
      value: formatDisplay(monthlyIncome, displayCurrency),
      description: 'Money received this month from income and bank-to-wallet entries.',
      caption: `In ${displayCurrency}`,
      badgeText: '+Inflow',
      gradientClass: 'from-emerald-500 via-emerald-600 to-teal-500',
    },
    {
      label: 'This Month Expenses',
      value: formatDisplay(monthlyExpenses, displayCurrency),
      description: 'Money spent this month, including wallet spending and bank transfers.',
      caption: 'Includes bank transfers',
      badgeText: '-Outflow',
      gradientClass: 'from-rose-500 via-red-600 to-orange-500',
    },
    {
      label: 'This Month Bank Transfers',
      value: formatDisplay(monthlyBankTransfer, displayCurrency),
      description: 'Money moved from wallets to bank accounts during this month.',
      caption: 'Wallet to bank only',
      badgeText: '-Bank',
      gradientClass: 'from-violet-500 via-indigo-600 to-blue-500',
    },
  ]

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 pb-20 sm:space-y-7 sm:pb-24 md:space-y-8 md:pb-10">
      {/* Hero greeting */}
      <div className="glass-panel-soft animate-slide-up space-y-1 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm text-gray-500 font-medium">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your Financial Overview</h1>
      </div>

      {/* Overall totals */}
      <div className="glass-panel-faded animate-slide-up delay-75 space-y-4 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">Overall Totals</h2>
          <p className="text-sm font-medium text-gray-500">Lifetime snapshot across all wallets and transactions.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <Link
              key={card.label}
              to={APP_ROUTES.analytics}
              aria-label={`${card.label}: ${card.value}. ${card.description}`}
              className="block h-full rounded-[20px] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <DashboardMetricCard
                title={card.label}
                value={card.value}
                description={card.description}
                caption={card.caption}
                badgeText={card.badgeText}
                gradientClass={card.gradientClass}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* This month */}
      <div className="glass-panel-faded animate-slide-up delay-100 space-y-4 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">This Month</h2>
          <p className="text-sm font-medium text-gray-500">Current month performance and movement.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {monthlyCards.map((card) => (
            <Link
              key={card.label}
              to={APP_ROUTES.analytics}
              aria-label={`${card.label}: ${card.value}. ${card.description}`}
              className="block h-full rounded-[20px] transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <DashboardMetricCard
                title={card.label}
                value={card.value}
                description={card.description}
                caption={card.caption}
                badgeText={card.badgeText}
                gradientClass={card.gradientClass}
              />
            </Link>
          ))}
        </div>
      </div>

      {/* Quick action chips */}
      <div className="glass-panel-soft animate-slide-up delay-150 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Wallets */}
      <div className="glass-panel-faded animate-slide-up delay-200 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Wallets</h2>
          <Link to={APP_ROUTES.manage} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition">
            Manage →
          </Link>
        </div>
        {wallets.length === 0 ? (
            <div className="glass-panel-soft rounded-3xl border-2 border-dashed border-white/65 py-12 text-center">
            <p className="text-gray-400">No wallets yet</p>
            <Link to={APP_ROUTES.manage} className="mt-2 block text-sm font-semibold text-black underline">
              Create your first wallet
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onClick={() =>
                  navigate(APP_ROUTES.manage, { state: { editWalletId: wallet.id } })
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="glass-panel-soft animate-slide-up delay-300 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
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
