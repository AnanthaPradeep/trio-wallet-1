import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { INCOME_SOURCES } from '../model/categories'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { cn } from '../../../shared/lib/cn'

export function AddIncomePage() {
  const navigate = useNavigate()
  const { pools, addIncome } = useWalletApp()

  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(pools[0]?.currency ?? 'INR')
  const [source, setSource] = useState(INCOME_SOURCES[0]!)
  const [customSource, setCustomSource] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const amountMinor = parseMajorToMinor(amount, currency)
  const finalSource = source === 'Other' ? customSource : source

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (!finalSource.trim()) { setError('Enter an income source.'); return }
    try {
      addIncome({ currency, amountMinor, source: finalSource.trim(), note, date: new Date().toISOString() })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save income.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Income added!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-700 transition hover:bg-white/75"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Add Income</h1>
          <p className="text-sm text-gray-500">Record money received</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Amount Received</p>
          <AmountInput
            value={amount}
            onChange={(v) => { setAmount(v); setError('') }}
            currency={currency}
          />
        </div>

        <div className="glass rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Add to Total Pool Currency</p>
          <Select value={currency} onChange={(e) => { setCurrency(e.target.value as typeof currency); setError('') }}>
            {pools.map((pool) => (
              <option key={pool.currency} value={pool.currency}>{pool.currency}</option>
            ))}
          </Select>
        </div>

        <div className="glass rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Income Source</p>
          <div className="flex flex-wrap gap-2">
            {INCOME_SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setSource(s); setError('') }}
                className={cn(
                  'rounded-xl border px-3 py-2 text-sm font-semibold transition-all active:scale-95',
                  source === s
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md'
                    : 'glass-control text-gray-700 hover:border-emerald-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {source === 'Other' && (
            <Input type="text" value={customSource} onChange={(e) => setCustomSource(e.target.value)} placeholder="Describe the source" />
          )}
        </div>

        <div className="glass rounded-3xl p-5">
          <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Additional notes..." />
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
        <Button type="submit" variant="success" fullWidth size="lg">Save Income</Button>
      </form>
    </div>
  )
}
