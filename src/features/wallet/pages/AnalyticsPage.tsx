import { useState, useMemo } from 'react'
import { useWalletApp } from '../hooks/useWalletApp'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { cn } from '../../../shared/lib/cn'
import { getCategoryMeta } from '../model/categories'
import { DashboardMetricCard } from '../components/DashboardMetricCard'
import type { ExpenseCategory } from '../model/types'

// ─── Types ────────────────────────────────────────────────────────────────────
type DateRange = '7d' | '30d' | '3m' | '12m' | 'all'

// ─── Constants ────────────────────────────────────────────────────────────────
const INCOME_TYPES = new Set(['income', 'bank_to_wallet'])
const EXPENSE_TYPES = new Set(['expense', 'spend', 'bank_transfer'])

const DATE_RANGE_PILLS: { id: DateRange; label: string }[] = [
  { id: '7d',  label: '7 days'    },
  { id: '30d', label: '30 days'   },
  { id: '3m',  label: '3 months'  },
  { id: '12m', label: '12 months' },
  { id: 'all', label: 'All time'  },
]

const RANGE_LABEL: Record<DateRange, string> = {
  '7d':  'Last 7 days',
  '30d': 'Last 30 days',
  '3m':  'Last 3 months',
  '12m': 'Last 12 months',
  'all': 'All time',
}

const DONUT_COLORS: Record<string, string> = {
  food:          '#f97316',
  bills:         '#6366f1',
  shopping:      '#ec4899',
  investment:    '#22c55e',
  health:        '#3b82f6',
  entertainment: '#a855f7',
  travel:        '#06b6d4',
  transport:     '#eab308',
  education:     '#0ea5e9',
  emergency:     '#ef4444',
  other:         '#94a3b8',
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────
function donutSlicePath(
  cx: number, cy: number, outerR: number, innerR: number,
  startAngle: number, endAngle: number,
): string {
  const toRad = (deg: number) => (deg - 90) * (Math.PI / 180)
  const x1o = cx + outerR * Math.cos(toRad(startAngle))
  const y1o = cy + outerR * Math.sin(toRad(startAngle))
  const x2o = cx + outerR * Math.cos(toRad(endAngle))
  const y2o = cy + outerR * Math.sin(toRad(endAngle))
  const x1i = cx + innerR * Math.cos(toRad(endAngle))
  const y1i = cy + innerR * Math.sin(toRad(endAngle))
  const x2i = cx + innerR * Math.cos(toRad(startAngle))
  const y2i = cy + innerR * Math.sin(toRad(startAngle))
  const large = endAngle - startAngle > 180 ? 1 : 0
  return [
    `M ${x1o.toFixed(2)} ${y1o.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${x2o.toFixed(2)} ${y2o.toFixed(2)}`,
    `L ${x1i.toFixed(2)} ${y1i.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${x2i.toFixed(2)} ${y2i.toFixed(2)}`,
    'Z',
  ].join(' ')
}

function shortLabel(n: number): string {
  if (n >= 100_000) return `${(n / 100_000).toFixed(1)}L`
  if (n >= 1_000)   return `${(n / 1_000).toFixed(0)}K`
  return String(Math.round(n))
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DateRangeFilter({ value, onChange }: { value: DateRange; onChange: (r: DateRange) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap mt-4">
      {DATE_RANGE_PILLS.map(pill => (
        <button
          key={pill.id}
          type="button"
          onClick={() => onChange(pill.id)}
          className={cn(
            'rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all',
            value === pill.id
              ? 'bg-gray-900 text-white shadow-sm'
              : 'glass text-gray-700 hover:bg-white/80',
          )}
        >
          {pill.label}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-700">{label}</p>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
    </div>
  )
}

function EmptyState({ message = 'No data in this range' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-sm text-gray-400">{message}</div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AnalyticsPage() {
  const { transactions, wallets } = useWalletApp()
  const { displayCurrency, convertToDisplay, formatDisplay } = useDisplayCurrency()

  const [range, setRange] = useState<DateRange>('30d')

  const cutoff = useMemo((): Date | null => {
    const msMap: Record<DateRange, number | null> = {
      '7d':  7   * 86_400_000,
      '30d': 30  * 86_400_000,
      '3m':  90  * 86_400_000,
      '12m': 365 * 86_400_000,
      'all': null,
    }
    const ms = msMap[range]
    return ms === null ? null : new Date(Date.now() - ms)
  }, [range])

  const filteredTx = useMemo(
    () => transactions.filter(
      tx => tx.status === 'completed' && (cutoff === null || new Date(tx.createdAtIso) >= cutoff),
    ),
    [transactions, cutoff],
  )

  // Summary totals
  const totalIncomeDisplay = useMemo(
    () => filteredTx
      .filter(tx => INCOME_TYPES.has(tx.type))
      .reduce((s, tx) => s + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [filteredTx, convertToDisplay],
  )

  const totalExpenseDisplay = useMemo(
    () => filteredTx
      .filter(tx => EXPENSE_TYPES.has(tx.type))
      .reduce((s, tx) => s + convertToDisplay(tx.amountMinor, tx.currency), 0),
    [filteredTx, convertToDisplay],
  )

  const netDisplay = totalIncomeDisplay - totalExpenseDisplay
  const savingsRate = totalIncomeDisplay > 0
    ? Math.round((netDisplay / totalIncomeDisplay) * 100)
    : 0

  // Monthly grouped data for bar chart
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number }>()
    for (const tx of filteredTx) {
      const d = new Date(tx.createdAtIso)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map.has(key)) map.set(key, { income: 0, expenses: 0 })
      const bucket = map.get(key)!
      if (INCOME_TYPES.has(tx.type))  bucket.income   += convertToDisplay(tx.amountMinor, tx.currency)
      if (EXPENSE_TYPES.has(tx.type)) bucket.expenses += convertToDisplay(tx.amountMinor, tx.currency)
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => {
        const [y, m] = key.split('-')
        const label = new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        return { key, label, ...vals }
      })
  }, [filteredTx, convertToDisplay])

  // Category donut data
  const categoryData = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    for (const tx of filteredTx) {
      if ((tx.type === 'expense' || tx.type === 'spend') && tx.category) {
        map.set(tx.category, (map.get(tx.category) ?? 0) + convertToDisplay(tx.amountMinor, tx.currency))
      }
    }
    const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1])
    const top6 = sorted.slice(0, 6)
    const otherTotal = sorted.slice(6).reduce((s, [, v]) => s + v, 0)
    if (otherTotal > 0) top6.push(['other' as ExpenseCategory, otherTotal])
    const total = top6.reduce((s, [, v]) => s + v, 0) || 1
    return top6.map(([cat, amount]) => {
      const meta = getCategoryMeta(cat)
      return {
        cat,
        label: meta.label,
        icon: meta.icon,
        color: DONUT_COLORS[cat] ?? '#94a3b8',
        amount,
        pct: Math.round((amount / total) * 100),
      }
    })
  }, [filteredTx, convertToDisplay])

  // Wallet balance data
  const walletBalanceData = useMemo(
    () => [...wallets]
      .map(w => ({
        name: w.name,
        color: w.color ?? '#0a0a0a',
        displayAmount: convertToDisplay(w.balanceMinor, w.currency),
      }))
      .sort((a, b) => b.displayAmount - a.displayAmount),
    [wallets, convertToDisplay],
  )

  // Daily spend for sparkline
  const dailySpend = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of filteredTx) {
      if (EXPENSE_TYPES.has(tx.type)) {
        const d = new Date(tx.createdAtIso)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        map.set(key, (map.get(key) ?? 0) + convertToDisplay(tx.amountMinor, tx.currency))
      }
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, amount]) => amount)
  }, [filteredTx, convertToDisplay])

  // ─── Bar chart geometry ───────────────────────────────────────────────────
  const BAR_W = 500, BAR_H = 220
  const BAR_PAD = { left: 52, right: 16, top: 20, bottom: 40 }
  const barChartW = BAR_W - BAR_PAD.left - BAR_PAD.right
  const barChartH = BAR_H - BAR_PAD.top - BAR_PAD.bottom
  const barMaxVal = Math.max(...monthlyData.flatMap(d => [d.income, d.expenses]), 1)
  const yScale = (v: number) => BAR_PAD.top + barChartH - (v / barMaxVal) * barChartH
  const groupW = monthlyData.length > 0 ? barChartW / monthlyData.length : barChartW
  const barW = Math.min(groupW * 0.32, 20)

  // ─── Donut slices ─────────────────────────────────────────────────────────
  const donutSlices = useMemo(() => {
    let angle = 0
    return categoryData.map(slice => {
      const sweep = categoryData.length === 1
        ? 359.99
        : (slice.pct / 100) * (360 - categoryData.length * 2)
      const path = donutSlicePath(90, 90, 72, 46, angle, angle + sweep)
      angle += sweep + 2
      return { ...slice, path }
    })
  }, [categoryData])

  // ─── Sparkline points ─────────────────────────────────────────────────────
  const sparkMaxDay = Math.max(...dailySpend, 1)
  const sparkPoints = dailySpend
    .map((v, i) => {
      const x = 8 + (i / Math.max(dailySpend.length - 1, 1)) * 484
      const y = 8 + 44 - (v / sparkMaxDay) * 44
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const maxWalletBal = walletBalanceData[0]?.displayAmount ?? 1

  return (
    <div className="space-y-6 pb-20 sm:pb-24 md:pb-10">
      {/* Header + range filter */}
      <div className="glass-panel-soft animate-slide-up rounded-3xl px-4 py-4 sm:px-5 sm:py-5">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-700 mt-0.5">Deep insights across your financial activity</p>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {/* 1. Summary cards */}
      <div className="animate-slide-up delay-75 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Income"
          value={formatDisplay(totalIncomeDisplay, displayCurrency)}
          description="Total money received in the selected period."
          caption={RANGE_LABEL[range]}
          badgeText="+Inflow"
          gradientClass="from-emerald-500 via-emerald-600 to-teal-500"
        />
        <DashboardMetricCard
          title="Expenses"
          value={formatDisplay(totalExpenseDisplay, displayCurrency)}
          description="Total money spent in the selected period."
          caption={RANGE_LABEL[range]}
          badgeText="-Outflow"
          gradientClass="from-rose-500 via-red-600 to-fuchsia-500"
        />
        <DashboardMetricCard
          title="Net"
          value={formatDisplay(Math.abs(netDisplay), displayCurrency)}
          description={netDisplay >= 0 ? 'Surplus in the selected period.' : 'Deficit in the selected period.'}
          caption={netDisplay >= 0 ? 'Surplus' : 'Deficit'}
          badgeText={netDisplay >= 0 ? '+Net' : '-Net'}
          gradientClass={netDisplay >= 0
            ? 'from-blue-500 via-blue-600 to-sky-500'
            : 'from-violet-500 via-purple-600 to-indigo-500'}
        />
        <DashboardMetricCard
          title="Savings Rate"
          value={`${Math.max(savingsRate, 0)}%`}
          description="Net as a percentage of total income in this period."
          caption={savingsRate >= 20 ? 'Excellent' : savingsRate >= 0 ? 'On track' : 'Overspending'}
          badgeText={savingsRate >= 0 ? `+${savingsRate}%` : `${savingsRate}%`}
          gradientClass="from-teal-500 via-teal-600 to-emerald-500"
        />
      </div>

      {/* 2. Income vs Expenses bar chart */}
      <div className="glass animate-slide-up delay-100 rounded-3xl p-5">
        <SectionHeader label="Income vs Expenses" sub="Monthly comparison for selected range" />
        {monthlyData.length === 0
          ? <EmptyState />
          : (
            <svg viewBox={`0 0 ${BAR_W} ${BAR_H}`} className="w-full overflow-visible" aria-label="Income vs expenses monthly bar chart">
              {/* Legend */}
              <g transform={`translate(${BAR_PAD.left}, 6)`}>
                <rect x="0" y="0" width="10" height="10" rx="2" fill="#10b981" />
                <text x="14" y="9" fontSize="9" fill="rgba(0,0,0,0.6)">Income</text>
                <rect x="58" y="0" width="10" height="10" rx="2" fill="#f43f5e" />
                <text x="72" y="9" fontSize="9" fill="rgba(0,0,0,0.6)">Expenses</text>
              </g>
              {/* Gridlines + Y labels */}
              {[0, 0.25, 0.5, 0.75, 1].map(pct => {
                const y = yScale(barMaxVal * pct)
                return (
                  <g key={pct}>
                    <line
                      x1={BAR_PAD.left} x2={BAR_W - BAR_PAD.right} y1={y} y2={y}
                      stroke="rgba(0,0,0,0.07)" strokeWidth="1" strokeDasharray="3 3"
                    />
                    <text x={BAR_PAD.left - 4} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(0,0,0,0.45)">
                      {shortLabel(Math.round(barMaxVal * pct))}
                    </text>
                  </g>
                )
              })}
              {/* Grouped bars */}
              {monthlyData.map((d, i) => {
                const cx = BAR_PAD.left + i * groupW + groupW / 2
                const incomeH = Math.max((BAR_PAD.top + barChartH) - yScale(d.income), 1)
                const expenseH = Math.max((BAR_PAD.top + barChartH) - yScale(d.expenses), 1)
                return (
                  <g key={d.key}>
                    <rect x={cx - barW - 1} y={yScale(d.income)}   width={barW} height={incomeH}  rx="3" fill="#10b981" opacity="0.85" />
                    <rect x={cx + 1}         y={yScale(d.expenses)} width={barW} height={expenseH} rx="3" fill="#f43f5e" opacity="0.85" />
                    <text x={cx} y={BAR_H - 8} textAnchor="middle" fontSize="9" fill="rgba(0,0,0,0.5)">{d.label}</text>
                  </g>
                )
              })}
            </svg>
          )}
      </div>

      {/* 3. Donut + 4. Top spending list */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass animate-slide-up delay-150 rounded-3xl p-5">
          <SectionHeader label="Spending by Category" sub="Top categories in selected range" />
          {categoryData.length === 0
            ? <EmptyState />
            : (
              <div className="flex flex-col sm:flex-row gap-5 items-center">
                <svg viewBox="0 0 180 180" className="shrink-0 w-36 h-36 sm:w-40 sm:h-40" aria-label="Category spending donut chart">
                  {donutSlices.map(s => <path key={s.cat} d={s.path} fill={s.color} />)}
                  <text x="90" y="86" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">Spend</text>
                  <text x="90" y="100" textAnchor="middle" fontSize="9" fill="#6b7280">{RANGE_LABEL[range]}</text>
                </svg>
                <ul className="flex-1 w-full space-y-2">
                  {categoryData.map(s => (
                    <li key={s.cat} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="flex-1 truncate text-xs font-medium text-gray-700">{s.label}</span>
                      <span className="text-xs font-bold text-gray-900">{formatDisplay(s.amount, displayCurrency)}</span>
                      <span className="w-8 text-right text-xs text-gray-400">{s.pct}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        <div className="glass animate-slide-up delay-150 rounded-3xl p-5">
          <SectionHeader label="Top Spending Categories" sub="Ranked by total spend in range" />
          {categoryData.length === 0
            ? <EmptyState />
            : (
              <ol className="space-y-3">
                {categoryData.slice(0, 5).map((s, i) => (
                  <li key={s.cat} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-sm font-bold text-gray-400">{i + 1}</span>
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${s.color}22` }}
                    >
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                        <span className="text-sm font-bold text-gray-900">{formatDisplay(s.amount, displayCurrency)}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                    <span className="w-8 shrink-0 text-right text-xs text-gray-400">{s.pct}%</span>
                  </li>
                ))}
              </ol>
            )}
        </div>
      </div>

      {/* 5. Wallet balance comparison */}
      <div className="glass animate-slide-up delay-200 rounded-3xl p-5">
        <SectionHeader label="Wallet Balances" sub="Current balance per wallet, sorted highest first" />
        {walletBalanceData.length === 0
          ? <EmptyState message="No wallets yet" />
          : (
            <div className="space-y-3">
              {walletBalanceData.map(w => {
                const pct = maxWalletBal > 0 ? Math.round((w.displayAmount / maxWalletBal) * 100) : 0
                return (
                  <div key={w.name} className="flex items-center gap-3">
                    <div className="w-24 shrink-0 text-right">
                      <span className="text-xs font-semibold text-gray-700 truncate block">{w.name}</span>
                    </div>
                    <div className="relative h-5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: w.color }}
                      />
                    </div>
                    <div className="w-28 shrink-0">
                      <span className="text-xs font-bold text-gray-900">{formatDisplay(w.displayAmount, displayCurrency)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* 6. Daily spend sparkline */}
      <div className="glass animate-slide-up delay-300 rounded-3xl p-5">
        <SectionHeader label="Daily Spend Trend" sub="Expense activity day by day over selected range" />
        {dailySpend.length < 2
          ? <EmptyState message="Not enough data for this range" />
          : (
            <svg viewBox="0 0 500 60" className="w-full" preserveAspectRatio="none" aria-label="Daily spend sparkline">
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#f43f5e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`8,52 ${sparkPoints} 492,52`} fill="url(#sparkGrad)" />
              <polyline
                points={sparkPoints}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {dailySpend.length <= 30 && dailySpend.map((v, i) => {
                const x = 8 + (i / Math.max(dailySpend.length - 1, 1)) * 484
                const y = 8 + 44 - (v / sparkMaxDay) * 44
                return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="2.5" fill="#f43f5e" />
              })}
            </svg>
          )}
      </div>
    </div>
  )
}
