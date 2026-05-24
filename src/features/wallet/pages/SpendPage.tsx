import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { WalletCard } from '../components/WalletCard'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useWalletApp } from '../hooks/useWalletApp'

export function SpendPage() {
  const navigate = useNavigate()
  const { wallets, spendFromWallet } = useWalletApp()
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const amountMinor = parseMajorToMinor(amount, selectedWallet?.currency ?? 'INR')

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    try {
      spendFromWallet({ walletId, amountMinor, note: note.trim() || 'Spend' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Payment recorded!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-600 transition hover:bg-white/75">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Quick Spend</h1>
          <p className="text-sm text-gray-500">Deduct from wallet balance</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-red-500">Amount</p>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError('') }} currency={selectedWallet?.currency ?? 'INR'} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">From Wallet</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} compact selected={walletId === w.id} onClick={() => { setWalletId(w.id); setError('') }} />
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Coffee, groceries, etc." />
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
        <Button type="submit" variant="danger" fullWidth size="lg">Confirm Spend</Button>
      </form>
    </div>
  )
}
