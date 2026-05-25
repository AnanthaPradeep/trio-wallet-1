import { useState } from 'react'
import { RepeatIcon, Plus, X, Pencil, Play, Pause, Trash2, RefreshCw, Layers } from 'lucide-react'
import { EXPENSE_CATEGORIES, getCategoryMeta, PAYMENT_TYPES } from '../model/categories'
import type { AddRecurringRuleInput, RecurringRule } from '../model/types'
import { formatMinor, parseMajorToMinor, minorToMajor } from '../../../shared/lib/money'
import { AmountInput } from '../../../components/AmountInput'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'
import { SUPPORTED_CURRENCIES } from '../../../shared/constants/wallet'
import type { CurrencyCode } from '../../../shared/lib/money'

const FREQUENCY_LABELS: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
}

function formatNextDue(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const dateStr = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  if (diff <= 0) return `Due now (${dateStr})`
  if (diff === 1) return `Tomorrow (${dateStr})`
  if (diff <= 7) return `In ${diff} days (${dateStr})`
  return dateStr
}

interface RuleCardProps {
  rule: RecurringRule
  walletName?: string
  onEdit: () => void
  onToggle: () => void
  onRun: () => void
  onRemove: () => void
}

function RuleCard({ rule, walletName, onEdit, onToggle, onRun, onRemove }: RuleCardProps) {
  const [confirmRemove, setConfirmRemove] = useState(false)
  const catMeta = rule.category ? getCategoryMeta(rule.category) : null
  const isExpense = rule.type === 'expense'

  return (
    <div className={cn('glass rounded-3xl p-5 space-y-4 transition-opacity', !rule.isActive && 'opacity-60')}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', isExpense ? 'bg-red-50' : 'bg-emerald-50')}>
          {catMeta
            ? <catMeta.icon size={20} className={isExpense ? 'text-red-500' : 'text-emerald-600'} />
            : <Layers size={20} className={isExpense ? 'text-red-400' : 'text-emerald-500'} />
          }
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-gray-900 truncate">{rule.name}</p>
            <span className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold shrink-0',
              isExpense ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700',
            )}>
              {isExpense ? 'Expense' : 'Income'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {catMeta ? catMeta.label : rule.source ?? 'All'} · {formatMinor(rule.amountMinor, rule.currency)} · {FREQUENCY_LABELS[rule.frequency]}
          </p>
          {walletName && <p className="text-xs text-gray-400">{walletName}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <div className={cn('h-2 w-2 rounded-full', rule.isActive ? 'bg-emerald-400' : 'bg-gray-300')} />
          <span className="text-xs text-gray-400">{rule.isActive ? 'Active' : 'Paused'}</span>
        </div>
      </div>

      {/* Next due */}
      <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
        <RefreshCw size={13} className="text-gray-400 shrink-0" />
        <p className="text-xs text-gray-600">Next: <span className="font-semibold text-gray-800">{formatNextDue(rule.nextDueIso)}</span></p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRun}
          className="flex items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 active:scale-95"
        >
          <Play size={12} />
          Run Now
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-200 active:scale-95"
        >
          <Pencil size={12} />
          Edit
        </button>
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition active:scale-95',
            rule.isActive
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
          )}
        >
          {rule.isActive ? <Pause size={12} /> : <Play size={12} />}
          {rule.isActive ? 'Pause' : 'Resume'}
        </button>
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100 active:scale-95"
        >
          <Trash2 size={12} />
          Delete
        </button>
      </div>

      {/* Remove confirmation */}
      {confirmRemove && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-3">
          <p className="flex-1 text-xs text-red-700">Delete this rule? Future transactions won't be created.</p>
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
  )
}

export function RecurringPage() {
  const { recurringRules, wallets, addRecurringRule, updateRecurringRule, removeRecurringRule, toggleRecurringRule, runRecurringRule } = useWalletApp()

  const [showForm, setShowForm] = useState((recurringRules ?? []).length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [ruleType, setRuleType] = useState<'expense' | 'income'>('expense')
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<AddRecurringRuleInput['frequency']>('monthly')
  const [amountValue, setAmountValue] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('INR')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [walletId, setWalletId] = useState('')
  const [category, setCategory] = useState<AddRecurringRuleInput['category']>('food')
  const [paymentType, setPaymentType] = useState<AddRecurringRuleInput['paymentType']>('upi')
  const [source, setSource] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const resetForm = () => {
    setEditingId(null)
    setRuleType('expense')
    setName('')
    setFrequency('monthly')
    setAmountValue('')
    setCurrency('INR')
    setStartDate(new Date().toISOString().slice(0, 10))
    setWalletId('')
    setCategory('food')
    setPaymentType('upi')
    setSource('')
    setNote('')
    setError('')
  }

  const openEdit = (rule: RecurringRule) => {
    setEditingId(rule.id)
    setRuleType(rule.type)
    setName(rule.name)
    setFrequency(rule.frequency)
    setAmountValue(String(minorToMajor(rule.amountMinor, rule.currency as CurrencyCode)))
    setCurrency(rule.currency as CurrencyCode)
    setStartDate(rule.nextDueIso.slice(0, 10))
    setWalletId(rule.walletId ?? '')
    setCategory(rule.category ?? 'food')
    setPaymentType(rule.paymentType ?? 'upi')
    setSource(rule.source ?? '')
    setNote(rule.note)
    setError('')
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    const amountMinor = parseMajorToMinor(amountValue, currency)
    if (!name.trim()) { setError('Rule name is required.'); return }
    if (!amountMinor || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (ruleType === 'expense' && !walletId) { setError('Select a wallet for this expense.'); return }

    const input: AddRecurringRuleInput = {
      name: name.trim(),
      type: ruleType,
      frequency,
      amountMinor,
      currency,
      startDateIso: new Date(startDate).toISOString(),
      note: note.trim(),
      ...(ruleType === 'expense' ? { walletId, category, paymentType } : { source: source.trim() || 'Income' }),
    }

    try {
      if (editingId) {
        updateRecurringRule(editingId, input)
      } else {
        addRecurringRule(input)
      }
      resetForm()
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule.')
    }
  }

  const rules = recurringRules ?? []

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-20 sm:max-w-3xl sm:space-y-8 sm:pb-24 md:pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Recurring</h1>
          <p className="text-sm text-gray-500">{rules.length} rule{rules.length !== 1 ? 's' : ''} · auto-fires on app open</p>
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
          {showForm && !editingId ? 'Cancel' : 'New Rule'}
        </button>
      </div>

      {/* Add / Edit form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass rounded-3xl p-5 space-y-5 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">{editingId ? 'Edit Rule' : 'New Recurring Rule'}</p>

          {/* Type toggle */}
          <div className="glass-control flex rounded-2xl p-1">
            {(['expense', 'income'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRuleType(t)}
                className={cn(
                  'flex flex-1 items-center justify-center rounded-xl py-2 text-sm font-semibold transition-all duration-200 capitalize',
                  ruleType === t ? 'bg-black text-white shadow' : 'text-gray-600 hover:text-gray-900',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <Input
            label="Rule Name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
            placeholder={ruleType === 'expense' ? 'e.g. Monthly Rent' : 'e.g. Monthly Salary'}
          />

          {/* Frequency + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Frequency</label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value as typeof frequency)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <AmountInput value={amountValue} onChange={setAmountValue} currency={currency} />
          </div>

          {/* Start Date */}
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setError('') }}
          />

          {/* Expense-specific */}
          {ruleType === 'expense' && (
            <>
              {/* Wallet picker */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Wallet</label>
                {wallets.length === 0 ? (
                  <p className="text-sm text-gray-500">No wallets available. Create one first.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {wallets.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWalletId(w.id)}
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
              </div>

              {/* Category chips */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <div className="flex flex-wrap gap-2">
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

              {/* Payment type chips */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_TYPES.map((pt) => (
                    <button
                      key={pt.key}
                      type="button"
                      onClick={() => setPaymentType(pt.key)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition',
                        paymentType === pt.key
                          ? 'border-gray-800 bg-gray-900 text-white'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400',
                      )}
                    >
                      <pt.icon size={12} />
                      {pt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Income-specific */}
          {ruleType === 'income' && (
            <Input
              label="Source"
              type="text"
              value={source}
              onChange={(e) => { setSource(e.target.value); setError('') }}
              placeholder="e.g. Salary, Freelance, Rental"
            />
          )}

          <Input
            label="Note (optional)"
            type="text"
            value={note}
            onChange={(e) => { setNote(e.target.value); setError('') }}
            placeholder="Additional details"
          />

          {error && <p className="text-sm font-medium text-red-500">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" variant="primary" fullWidth>
              {editingId ? 'Save Changes' : 'Create Rule'}
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
      {rules.length === 0 && !showForm && (
        <div className="glass rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
          <RepeatIcon size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500">No recurring rules yet.</p>
          <p className="text-sm text-gray-400">Set up rules for rent, salary, subscriptions — they'll fire automatically each time you open the app.</p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>Create First Rule</Button>
        </div>
      )}

      {/* Rule cards */}
      {rules.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {rules.map((rule) => {
            const wallet = wallets.find((w) => w.id === rule.walletId)
            return (
              <RuleCard
                key={rule.id}
                rule={rule}
                walletName={wallet?.name}
                onEdit={() => openEdit(rule)}
                onToggle={() => toggleRecurringRule(rule.id)}
                onRun={() => runRecurringRule(rule.id)}
                onRemove={() => removeRecurringRule(rule.id)}
              />
            )
          })}
        </div>
      )}

      {rules.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          Rules marked Active fire automatically when you open the app and the due date has passed. Use "Run Now" to fire a rule immediately.
        </p>
      )}
    </div>
  )
}
