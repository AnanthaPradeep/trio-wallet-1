import { useState } from 'react'
import { Target, Plus, X, Pencil, Trash2, CheckCircle2, PiggyBank } from 'lucide-react'
import type { Goal, AddGoalInput } from '../model/types'
import { formatMinor, parseMajorToMinor, minorToMajor } from '../../../shared/lib/money'
import { AmountInput } from '../../../components/AmountInput'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'
import { SUPPORTED_CURRENCIES } from '../../../shared/constants/wallet'
import type { CurrencyCode } from '../../../shared/lib/money'

const GOAL_COLORS = [
  { hex: '#6366f1', label: 'Indigo' },
  { hex: '#8b5cf6', label: 'Violet' },
  { hex: '#0ea5e9', label: 'Sky' },
  { hex: '#10b981', label: 'Emerald' },
  { hex: '#f43f5e', label: 'Rose' },
]

function daysLeft(deadline?: string): string | null {
  if (!deadline) return null
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

interface ContributePanelProps {
  goal: Goal
  onClose: () => void
}

function ContributePanel({ goal, onClose }: ContributePanelProps) {
  const { wallets, contributeToGoal } = useWalletApp()
  const [walletId, setWalletId] = useState('')
  const [amountValue, setAmountValue] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const compatibleWallets = wallets.filter((w) => w.currency === goal.currency && w.balanceMinor > 0)

  const handleContribute = () => {
    const amountMinor = parseMajorToMinor(amountValue, goal.currency as CurrencyCode)
    if (!walletId) { setError('Select a wallet.'); return }
    if (!amountMinor || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    try {
      contributeToGoal({ goalId: goal.id, walletId, amountMinor })
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to contribute.')
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <CheckCircle2 size={32} className="text-emerald-500" />
        <p className="text-sm font-semibold text-emerald-700">Contribution added!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Add Funds to Goal</p>

      {compatibleWallets.length === 0 ? (
        <p className="text-sm text-gray-500">No {goal.currency} wallets with available balance.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {compatibleWallets.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => { setWalletId(w.id); setError('') }}
              className={cn(
                'rounded-2xl border px-3 py-2.5 text-left transition',
                walletId === w.id
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400',
              )}
            >
              <p className="text-xs font-bold truncate">{w.name}</p>
              <p className="text-xs opacity-70">{formatMinor(w.balanceMinor, w.currency)}</p>
            </button>
          ))}
        </div>
      )}

      <AmountInput value={amountValue} onChange={(v) => { setAmountValue(v); setError('') }} currency={goal.currency as CurrencyCode} />

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="primary" fullWidth onClick={handleContribute}>
          Confirm Contribution
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </div>
  )
}

interface GoalCardProps {
  goal: Goal
  onEdit: () => void
  onRemove: () => void
}

function GoalCard({ goal, onEdit, onRemove }: GoalCardProps) {
  const [showContribute, setShowContribute] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)

  const pct = goal.targetAmountMinor > 0
    ? Math.min(100, Math.round((goal.savedAmountMinor / goal.targetAmountMinor) * 100))
    : 0
  const remainingMinor = Math.max(0, goal.targetAmountMinor - goal.savedAmountMinor)
  const accentColor = goal.color ?? '#6366f1'
  const due = daysLeft(goal.deadline)

  return (
    <div
      className="glass rounded-3xl overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accentColor}20` }}>
            <Target size={20} style={{ color: accentColor }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 truncate">{goal.name}</p>
              {goal.isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={11} />
                  Achieved!
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatMinor(goal.targetAmountMinor, goal.currency)} goal
              {due && ` · ${due}`}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
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
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-gray-900">{formatMinor(goal.savedAmountMinor, goal.currency)}</span>
              {' '}saved
            </p>
            <span className="text-sm font-bold" style={{ color: accentColor }}>{pct}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: goal.isCompleted ? '#10b981' : accentColor }}
            />
          </div>
          {!goal.isCompleted && (
            <p className="mt-1.5 text-xs text-gray-400">{formatMinor(remainingMinor, goal.currency)} remaining</p>
          )}
        </div>

        {/* Actions */}
        {!goal.isCompleted && (
          <button
            type="button"
            onClick={() => setShowContribute((v) => !v)}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-semibold text-white transition active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            <Plus size={15} />
            Add Funds
          </button>
        )}

        {/* Remove confirm */}
        {confirmRemove && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3">
            <p className="flex-1 text-xs text-red-700">Delete this goal? Contributions remain in transaction history.</p>
            <button
              type="button"
              onClick={() => { onRemove(); setConfirmRemove(false) }}
              className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
            >
              Delete
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

      {/* Contribute panel */}
      {showContribute && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4">
          <ContributePanel goal={goal} onClose={() => setShowContribute(false)} />
        </div>
      )}
    </div>
  )
}

export function GoalsPage() {
  const { goals, addGoal, updateGoal, removeGoal } = useWalletApp()

  const safeGoals = goals ?? []
  const [showForm, setShowForm] = useState(safeGoals.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [targetValue, setTargetValue] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('INR')
  const [deadline, setDeadline] = useState('')
  const [color, setColor] = useState(GOAL_COLORS[0]!.hex)
  const [error, setError] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setTargetValue('')
    setCurrency('INR')
    setDeadline('')
    setColor(GOAL_COLORS[0]!.hex)
    setError('')
  }

  const openEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setName(goal.name)
    setTargetValue(String(minorToMajor(goal.targetAmountMinor, goal.currency as CurrencyCode)))
    setCurrency(goal.currency as CurrencyCode)
    setDeadline(goal.deadline ?? '')
    setColor(goal.color ?? GOAL_COLORS[0]!.hex)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    const targetAmountMinor = parseMajorToMinor(targetValue, currency)
    if (!name.trim()) { setError('Goal name is required.'); return }
    if (!targetAmountMinor || targetAmountMinor <= 0) { setError('Enter a valid target amount.'); return }

    const input: AddGoalInput = {
      name: name.trim(),
      targetAmountMinor,
      currency,
      deadline: deadline || undefined,
      color,
    }

    try {
      if (editingId) {
        updateGoal(editingId, input)
      } else {
        addGoal(input)
      }
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save goal.')
    }
  }

  const activeGoals = safeGoals.filter((g) => !g.isCompleted)
  const completedGoals = safeGoals.filter((g) => g.isCompleted)

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-20 sm:max-w-3xl sm:space-y-8 sm:pb-24 md:pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Goals</h1>
          <p className="text-sm text-gray-500">
            {activeGoals.length} active · {completedGoals.length} achieved
          </p>
        </div>
        <button
          type="button"
          onClick={() => { if (showForm && !editingId) { resetForm(); setShowForm(false) } else { resetForm(); setShowForm(true) } }}
          className={cn(
            'flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
            showForm && !editingId ? 'bg-gray-100 text-gray-600' : 'bg-black text-white hover:bg-gray-800',
          )}
        >
          {showForm && !editingId ? <X size={15} /> : <Plus size={15} />}
          {showForm && !editingId ? 'Cancel' : 'New Goal'}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 space-y-5 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">{editingId ? 'Edit Goal' : 'New Savings Goal'}</p>

          <Input
            label="Goal Name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder="e.g. New Laptop, Emergency Fund, Vacation"
          />

          {/* Target amount + currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Target Amount</label>
              <AmountInput value={targetValue} onChange={(v) => { setTargetValue(v); setError('') }} currency={currency} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          {/* Deadline */}
          <Input
            label="Deadline (optional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          {/* Color picker */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <div className="flex gap-3">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    color === c.hex ? 'ring-2 ring-offset-2 ring-gray-700 scale-110' : 'hover:scale-105',
                  )}
                  style={{ backgroundColor: c.hex }}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" variant="primary" fullWidth>
              {editingId ? 'Save Changes' : 'Create Goal'}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={() => { resetForm(); setShowForm(false) }}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {/* Empty state */}
      {safeGoals.length === 0 && !showForm && (
        <div className="glass rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
          <PiggyBank size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500">No goals yet. Set your first savings target.</p>
          <p className="text-sm text-gray-400">Save toward a laptop, emergency fund, vacation — anything that matters.</p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>Create First Goal</Button>
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          {activeGoals.length > 0 && completedGoals.length > 0 && (
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">In Progress</p>
          )}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => openEdit(goal)}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Achieved</p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={() => openEdit(goal)}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
