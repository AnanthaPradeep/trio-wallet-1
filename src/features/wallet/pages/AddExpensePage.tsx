import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { CategorySelector } from '../../../components/CategorySelector'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { PAYMENT_TYPES } from '../model/categories'
import type { ExpenseCategory, PaymentType } from '../model/types'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'
import { WalletCard } from '../components/WalletCard'

export function AddExpensePage() {
  const navigate = useNavigate()
  const { wallets, addExpense } = useWalletApp()

  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [note, setNote] = useState('')
  const [paymentType, setPaymentType] = useState<PaymentType>('card')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<'amount' | 'details'>('amount')

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const amountMinor = parseMajorToMinor(amount, selectedWallet?.currency ?? 'INR')

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const goToDetails = () => {
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (!walletId) { setError('Select a wallet.'); return }
    if (selectedWallet && selectedWallet.balanceMinor < amountMinor) { setError('Insufficient balance in selected wallet.'); return }
    setError('')
    setStep('details')
  }

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    try {
      addExpense({ walletId, amountMinor, category, note, date: new Date().toISOString(), paymentType, tags, isRecurring })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Expense recorded!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => (step === 'details' ? setStep('amount') : navigate(-1))}
          className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-600 transition hover:bg-white/75"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Add Expense</h1>
          <p className="text-sm text-gray-500">Step {step === 'amount' ? 1 : 2} of 2</p>
        </div>
      </div>

      <div className="flex gap-2">
        <div className={cn('h-1.5 flex-1 rounded-full transition-colors', step === 'amount' || step === 'details' ? 'bg-black' : 'bg-gray-200')} />
        <div className={cn('h-1.5 flex-1 rounded-full transition-colors', step === 'details' ? 'bg-black' : 'bg-gray-200')} />
      </div>

      {step === 'amount' ? (
        <div className="space-y-5">
          <div className="glass rounded-3xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Amount</p>
            <AmountInput
              value={amount}
              onChange={(v) => { setAmount(v); setError('') }}
              currency={selectedWallet?.currency ?? 'INR'}
              error={error.includes('amount') || error.includes('balance') ? error : undefined}
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">From Wallet</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {wallets.map((w) => (
                <WalletCard key={w.id} wallet={w} compact selected={walletId === w.id} onClick={() => { setWalletId(w.id); setError('') }} />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-500 px-1">{error}</p>}
          <Button fullWidth size="lg" onClick={goToDetails}>Continue</Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div className="glass rounded-3xl p-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Category</p>
            <CategorySelector value={category} onChange={setCategory} />
          </div>

          <div className="glass rounded-3xl p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Details</p>

            <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you spend on?" />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Payment Type</label>
              <div className="flex flex-wrap gap-2">
                {PAYMENT_TYPES.map((pt) => (
                  <button
                    key={pt.key}
                    type="button"
                    onClick={() => setPaymentType(pt.key as PaymentType)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all active:scale-95',
                      paymentType === pt.key
                        ? 'border-black bg-black text-white'
                        : 'glass-control text-gray-700 hover:border-gray-400',
                    )}
                  >
                    <pt.icon size={14} />
                    {pt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="e.g. work, routine"
                  className="glass-control flex-1 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
                />
                <button type="button" onClick={addTag} className="glass-control rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/75">
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tags.map((tag) => (
                    <span key={tag} className="glass-control flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-gray-700">
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-red-500 transition">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <div
                onClick={() => setIsRecurring((v) => !v)}
                className={cn('relative h-6 w-11 rounded-full transition-colors duration-200', isRecurring ? 'bg-black' : 'bg-gray-200')}
              >
                <div className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', isRecurring ? 'translate-x-5' : 'translate-x-0.5')} />
              </div>
              <span className="text-sm font-medium text-gray-700">Recurring expense</span>
            </label>
          </div>

          {error && <p className="text-sm text-red-500 px-1">{error}</p>}
          <Button type="submit" fullWidth size="lg">Save Expense</Button>
        </form>
      )}
    </div>
  )
}
