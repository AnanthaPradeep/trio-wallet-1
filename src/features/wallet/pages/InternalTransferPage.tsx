import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { WalletCard } from '../components/WalletCard'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { useWalletApp } from '../hooks/useWalletApp'

export function InternalTransferPage() {
  const navigate = useNavigate()
  const { wallets, transferWalletToWallet } = useWalletApp()
  const { formatDisplay } = useDisplayCurrency()
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id ?? '')
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id ?? wallets[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fromWallet = wallets.find((w) => w.id === fromWalletId)
  const amountMinor = parseMajorToMinor(amount, fromWallet?.currency ?? 'INR')

  const toWalletOptions = useMemo(
    () => wallets.filter((w) => w.id !== fromWalletId && w.currency === fromWallet?.currency),
    [fromWalletId, fromWallet, wallets],
  )

  const balanceAfter = fromWallet ? fromWallet.balanceMinor - amountMinor : 0

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (fromWalletId === toWalletId) { setError('Source and destination must be different.'); return }
    try {
      transferWalletToWallet({ fromWalletId, toWalletId, amountMinor, note: note.trim() || 'Transfer' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Transfer complete!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Transfer Money</h1>
          <p className="text-sm text-gray-500">Move funds between your wallets</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Amount</p>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError('') }} currency={fromWallet?.currency ?? 'INR'} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">From</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} compact selected={fromWalletId === w.id} onClick={() => { setFromWalletId(w.id); setToWalletId(''); setError('') }} />
            ))}
          </div>
        </div>

        {fromWalletId && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">To</p>
            {toWalletOptions.length === 0 ? (
              <div className="glass rounded-2xl p-4 text-center text-sm text-gray-400">
                No compatible wallets for transfer (same currency required)
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {toWalletOptions.map((w) => (
                  <WalletCard key={w.id} wallet={w} compact selected={toWalletId === w.id} onClick={() => { setToWalletId(w.id); setError('') }} />
                ))}
              </div>
            )}
          </div>
        )}

        {fromWallet && amountMinor > 0 && (
          <div className="glass rounded-2xl p-4 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Preview</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current balance</span>
              <span className="font-semibold">{formatDisplay(fromWallet.balanceMinor, fromWallet.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">After transfer</span>
              <span className={`font-bold ${balanceAfter < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                {formatDisplay(Math.max(0, balanceAfter), fromWallet.currency)}
              </span>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl p-5">
          <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Reason for transfer" />
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
        <Button type="submit" fullWidth size="lg" variant="primary">Transfer</Button>
      </form>
    </div>
  )
}
