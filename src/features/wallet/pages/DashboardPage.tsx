import { Link, useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '../../../shared/constants/routes'
import { DashboardMetricCard } from '../components/DashboardMetricCard'
import { TransactionList } from '../components/TransactionList'
import { WalletCard } from '../components/WalletCard'
import { useWalletApp } from '../hooks/useWalletApp'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { useMemo } from 'react'
import { cn } from '../../../shared/lib/cn'
import { getCategoryMeta } from '../model/categories'
import { formatMinor } from '../../../shared/lib/money'
import { AlertTriangle, Layers, RefreshCw, Target } from 'lucide-react'
import type { Budget, Transaction } from '../model/types'

function computeMonthlySpent(budget: Budget, transactions: Transaction[]): number {
  const now = new Date()
  return transactions
    .filter(
      (tx) =>
        (tx.type === 'expense' || tx.type === 'spend') &&
        tx.status === 'completed' &&
        tx.currency === budget.currency &&
        (budget.category === 'all' || tx.category === budget.category) &&
        new Date(tx.createdAtIso).getMonth() === now.getMonth() &&
        new Date(tx.createdAtIso).getFullYear() === now.getFullYear(),
    )
    .reduce((sum, tx) => sum + tx.amountMinor, 0)
}

export function DashboardPage() {
  const { wallets, pools, transactions, budgets, recurringRules, goals, deleteTransaction } = useWalletApp()
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
      gradientClass: 'from-rose-500 via-red-600 to-fuchsia-500',
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
        : 'from-violet-500 via-purple-600 to-indigo-500',
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
      gradientClass: 'from-rose-500 via-red-600 to-fuchsia-500',
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

  const upcomingRules = useMemo(() => {
    const in7days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    return (recurringRules ?? [])
      .filter((r) => r.isActive && new Date(r.nextDueIso) <= in7days)
      .sort((a, b) => new Date(a.nextDueIso).getTime() - new Date(b.nextDueIso).getTime())
      .slice(0, 4)
  }, [recurringRules])

  const budgetAlerts = useMemo(
    () =>
      (budgets ?? [])
        .map((budget) => {
          const spentMinor = computeMonthlySpent(budget, transactions)
          const pct = budget.limitMinor > 0 ? Math.round((spentMinor / budget.limitMinor) * 100) : 0
          return { budget, spentMinor, pct }
        })
        .filter(({ pct, budget }) => pct >= budget.alertThreshold)
        .slice(0, 3),
    [budgets, transactions],
  )

  const myGoals = useMemo(
    () =>
      (goals ?? [])
        .filter((g) => !g.isCompleted)
        .sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        })
        .slice(0, 3),
    [goals],
  )

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6 pb-20 sm:space-y-7 sm:pb-24 md:space-y-8 md:pb-10">
      {/* Hero greeting */}
      <div className="glass-panel-soft animate-slide-up space-y-1 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <p className="text-sm text-gray-700 font-medium">{greeting}</p>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Your Financial Overview</h1>
      </div>

      {/* Overall totals */}
      <div className="glass-panel-faded animate-slide-up delay-75 space-y-4 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">Overall Totals</h2>
          <p className="text-sm font-medium text-gray-700">Lifetime snapshot across all wallets and transactions.</p>
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
          <p className="text-sm font-medium text-gray-700">Current month performance and movement.</p>
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
          { to: APP_ROUTES.budgets,         label: 'Budgets',    color: 'bg-violet-500 text-white' },
          { to: APP_ROUTES.recurring,       label: 'Recurring',  color: 'bg-sky-500 text-white'    },
          { to: APP_ROUTES.goals,           label: 'Goals',      color: 'bg-teal-500 text-white'   },
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

      {/* Upcoming recurring */}
      {upcomingRules.length > 0 && (
        <div className="glass-panel-soft animate-slide-up delay-200 rounded-3xl px-4 py-4 sm:px-5 sm:py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Upcoming</h2>
            <Link to={APP_ROUTES.recurring} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
              Manage →
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingRules.map((rule) => {
              const catMeta = rule.category ? getCategoryMeta(rule.category) : null
              const dueDate = new Date(rule.nextDueIso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
              const isExpense = rule.type === 'expense'
              return (
                <Link
                  key={rule.id}
                  to={APP_ROUTES.recurring}
                  className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 transition hover:bg-white/80"
                >
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', isExpense ? 'bg-red-50' : 'bg-emerald-50')}>
                    {catMeta
                      ? <catMeta.icon size={16} className={isExpense ? 'text-red-500' : 'text-emerald-600'} />
                      : <RefreshCw size={16} className="text-sky-500" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{rule.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{rule.frequency}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn('text-sm font-bold', isExpense ? 'text-red-500' : 'text-emerald-600')}>
                      {isExpense ? '-' : '+'}{formatMinor(rule.amountMinor, rule.currency)}
                    </p>
                    <p className="text-xs text-gray-400">{dueDate}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="glass-panel-soft animate-slide-up delay-200 rounded-3xl px-4 py-4 sm:px-5 sm:py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Budget Alerts</h2>
            <Link to={APP_ROUTES.budgets} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map(({ budget, spentMinor, pct }) => {
              const catMeta = budget.category !== 'all' ? getCategoryMeta(budget.category) : null
              const isOver = spentMinor > budget.limitMinor
              return (
                <Link
                  key={budget.id}
                  to={APP_ROUTES.budgets}
                  className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 transition hover:bg-white/80"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                    {catMeta ? <catMeta.icon size={16} className="text-gray-600" /> : <Layers size={16} className="text-indigo-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{budget.name}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn('h-full rounded-full', isOver ? 'bg-red-500' : 'bg-amber-400')}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">{formatMinor(spentMinor, budget.currency)} / {formatMinor(budget.limitMinor, budget.currency)}</p>
                    <p className={cn('text-xs font-semibold flex items-center justify-end gap-0.5', isOver ? 'text-red-500' : 'text-amber-600')}>
                      <AlertTriangle size={10} />
                      {isOver ? 'Over budget' : `${pct}% used`}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* My Goals */}
      {myGoals.length > 0 && (
        <div className="glass-panel-soft animate-slide-up delay-200 rounded-3xl px-4 py-4 sm:px-5 sm:py-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">My Goals</h2>
            <Link to={APP_ROUTES.goals} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {myGoals.map((goal) => {
              const pct = goal.targetAmountMinor > 0
                ? Math.min(Math.round((goal.savedAmountMinor / goal.targetAmountMinor) * 100), 100)
                : 0
              const accentColor = goal.color ?? '#6366f1'
              return (
                <Link
                  key={goal.id}
                  to={APP_ROUTES.goals}
                  className="flex items-center gap-3 rounded-2xl bg-white/60 px-4 py-3 transition hover:bg-white/80"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50">
                    <Target size={16} style={{ color: accentColor }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{goal.name}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: accentColor }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-gray-900">{formatMinor(goal.savedAmountMinor, goal.currency)}</p>
                    <p className="text-xs text-gray-400">of {formatMinor(goal.targetAmountMinor, goal.currency)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Wallets */}
      <div className="glass-panel-faded animate-slide-up delay-200 rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Wallets</h2>
          <Link to={APP_ROUTES.manage} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
            Manage →
          </Link>
        </div>
        {wallets.length === 0 ? (
            <div className="glass-panel-soft rounded-3xl border-2 border-dashed border-white/65 py-12 text-center">
            <p className="text-gray-700">No wallets yet</p>
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
          <Link to={APP_ROUTES.history} className="text-sm font-medium text-gray-700 hover:text-gray-900 transition">
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
