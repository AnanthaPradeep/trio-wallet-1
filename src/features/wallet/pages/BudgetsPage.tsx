import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Plus, X, AlertTriangle, Pencil, Layers } from 'lucide-react'
import { EXPENSE_CATEGORIES, getCategoryMeta } from '../model/categories'
import type { Budget, AddBudgetInput, Transaction } from '../model/types'
import { formatMinor, parseMajorToMinor, minorToMajor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'
import { SUPPORTED_CURRENCIES } from '../../../shared/constants/wallet'
import { APP_ROUTES } from '../../../shared/constants/routes'

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

interface BudgetCardProps {
  budget: Budget
  spentMinor: number
  onEdit: () => void
  onRemove: () => void
}

function BudgetCard({ budget, spentMinor, onEdit, onRemove }: BudgetCardProps) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const pct = budget.limitMinor > 0 ? Math.round((spentMinor / budget.limitMinor) * 100) : 0
  const remainingMinor = Math.max(0, budget.limitMinor - spentMinor)
  const isOver = spentMinor > budget.limitMinor
  const isNear = !isOver && pct >= budget.alertThreshold

  const barColor = isOver ? 'bg-red-500' : isNear ? 'bg-amber-400' : 'bg-emerald-500'
  const pctColor = isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-emerald-600'

  const catMeta = budget.category !== 'all' ? getCategoryMeta(budget.category) : null

  return (
    <div className="glass rounded-3xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', catMeta ? '' : 'bg-indigo-50')}>
          {catMeta
            ? <catMeta.icon size={20} className="text-gray-700" />
            : <Layers size={20} className="text-indigo-500" />
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 truncate">{budget.name}</p>
          <p className="text-xs text-gray-500">
            {catMeta ? catMeta.label : 'All Categories'} · {budget.currency}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-900">{formatMinor(spentMinor, budget.currency)}</span>
            {' '}of {formatMinor(budget.limitMinor, budget.currency)}
          </p>
          <span className={cn('text-sm font-bold', pctColor)}>{Math.min(pct, 999)}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {isOver ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-600">
            <AlertTriangle size={12} />
            Over budget!
          </span>
        ) : isNear ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <AlertTriangle size={12} />
            Near limit
          </span>
        ) : (
          <span className="text-xs text-gray-500">
            {formatMinor(remainingMinor, budget.currency)} remaining
          </span>
        )}
        <span className="text-xs text-gray-400">Alert at {budget.alertThreshold}%</span>
      </div>

      {/* Remove confirmation */}
      {confirmRemove && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3">
          <p className="flex-1 text-xs text-red-700">Remove this budget?</p>
          <button
            type="button"
            onClick={() => { onRemove(); setConfirmRemove(false) }}
            className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={() => setConfirmRemove(false)}
            className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

const ALERT_THRESHOLDS = [70, 80, 90] as const

export function BudgetsPage() {
  const { budgets, transactions, addBudget, updateBudget, removeBudget } = useWalletApp()

  const [showForm, setShowForm] = useState(budgets.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<AddBudgetInput['category']>('food')
  const [limitMajor, setLimitMajor] = useState('')
  const [currency, setCurrency] = useState<typeof SUPPORTED_CURRENCIES[number]>('INR')
  const [alertThreshold, setAlertThreshold] = useState<70 | 80 | 90>(80)
  const [error, setError] = useState('')

  const now = new Date()
  const monthLabel = now.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })

  const spentMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const budget of budgets) {
      map[budget.id] = computeMonthlySpent(budget, transactions)
    }
    return map
  }, [budgets, transactions])

  const resetForm = () => {
    setName('')
    setCategory('food')
    setLimitMajor('')
    setCurrency('INR')
    setAlertThreshold(80)
    setError('')
    setEditingId(null)
  }

  const openEdit = (budget: Budget) => {
    setEditingId(budget.id)
    setName(budget.name)
    setCategory(budget.category)
    setLimitMajor(String(minorToMajor(budget.limitMinor, budget.currency)))
    setCurrency(budget.currency as typeof SUPPORTED_CURRENCIES[number])
    setAlertThreshold(budget.alertThreshold as 70 | 80 | 90)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    const limitMinor = parseMajorToMinor(limitMajor, currency)
    if (!name.trim()) { setError('Budget name is required.'); return }
    if (!limitMinor || limitMinor <= 0) { setError('Enter a valid limit amount.'); return }

    try {
      if (editingId) {
        updateBudget(editingId, { name: name.trim(), category, limitMinor, currency, alertThreshold })
      } else {
        addBudget({ name: name.trim(), category, limitMinor, currency, alertThreshold })
      }
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save budget.')
    }
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-20 sm:max-w-3xl sm:space-y-8 sm:pb-24 md:pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Budgets</h1>
          <p className="text-sm text-gray-500">{monthLabel} · {budgets.length} budget{budgets.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => { if (showForm && !editingId) { handleCancel() } else { resetForm(); setShowForm(true) } }}
          className={cn(
            'flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
            showForm && !editingId ? 'bg-gray-100 text-gray-600' : 'bg-black text-white hover:bg-gray-800',
          )}
        >
          {showForm && !editingId ? <X size={15} /> : <Plus size={15} />}
          {showForm && !editingId ? 'Cancel' : 'New Budget'}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 space-y-5 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">{editingId ? 'Edit Budget' : 'New Budget'}</p>

          <Input
            label="Budget Name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g. Monthly Food Budget"
          />

          {/* Category chips */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                  category === 'all'
                    ? 'border-indigo-400 bg-indigo-500 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-300',
                )}
              >
                <Layers size={12} />
                All Categories
              </button>
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                    category === cat.key
                      ? 'border-gray-800 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400',
                  )}
                >
                  <cat.icon size={12} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Limit + currency */}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly Limit"
              type="number"
              min="1"
              step="any"
              value={limitMajor}
              onChange={(e) => { setLimitMajor(e.target.value); setError('') }}
              placeholder="5000"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          {/* Alert threshold */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Alert me when spending reaches</label>
            <div className="flex gap-2">
              {ALERT_THRESHOLDS.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setAlertThreshold(pct)}
                  className={cn(
                    'flex-1 rounded-xl border py-2 text-sm font-semibold transition',
                    alertThreshold === pct
                      ? 'border-amber-400 bg-amber-500 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-amber-300',
                  )}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" variant="primary" fullWidth>
              {editingId ? 'Save Changes' : 'Create Budget'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Empty state */}
      {budgets.length === 0 && !showForm && (
        <div className="glass rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
          <PieChart size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500">No budgets yet. Set your first spending limit.</p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>Create First Budget</Button>
        </div>
      )}

      {/* Budget cards */}
      {budgets.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spentMinor={spentMap[budget.id] ?? 0}
              onEdit={() => openEdit(budget)}
              onRemove={() => removeBudget(budget.id)}
            />
          ))}
        </div>
      )}

      {/* Tip */}
      {budgets.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Budgets track completed expenses in the selected category for the current calendar month.{' '}
          <Link to={APP_ROUTES.addExpense} className="font-semibold text-gray-600 underline underline-offset-2">
            Add an expense
          </Link>{' '}
          to see your budget update.
        </p>
      )}
    </div>
  )
}
