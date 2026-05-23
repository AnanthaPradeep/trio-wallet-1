import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { INCOME_SOURCES } from '../model/categories'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useWalletApp } from '../hooks/useWalletApp'
import { WalletCard } from '../components/WalletCard'
import { cn } from '../../../shared/lib/cn'

export function AddIncomePage() {
  const navigate = useNavigate()
  const { wallets, addIncome } = useWalletApp()

  const [amount, setAmount] = useState('')
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')
  const [source, setSource] = useState(INCOME_SOURCES[0]!)
  const [customSource, setCustomSource] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const amountMinor = parseMajorToMinor(amount, selectedWallet?.currency ?? 'INR')
  const finalSource = source === 'Other' ? customSource : source

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (!walletId) { setError('Select a wallet.'); return }
    if (!finalSource.trim()) { setError('Enter an income source.'); return }
    try {
      addIncome({ walletId, amountMinor, source: finalSource.trim(), note, date: new Date().toISOString() })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save income.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Income added!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-32 animate-slide-up">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Income</h1>
          <p className="text-sm text-gray-500">Record money received</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Amount Received</p>
          <AmountInput
            value={amount}
            onChange={(v) => { setAmount(v); setError('') }}
            currency={selectedWallet?.currency ?? 'INR'}
          />
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
                    : 'border-gray-200 bg-white text-gray-700 hover:border-emerald-300',
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

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Add to Wallet</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} compact selected={walletId === w.id} onClick={() => { setWalletId(w.id); setError('') }} />
            ))}
          </div>
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
