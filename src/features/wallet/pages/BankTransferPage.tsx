import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { AmountInput } from '../../../components/AmountInput'
import { WalletCard } from '../components/WalletCard'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'

export function BankTransferPage() {
  const navigate = useNavigate()
  const { wallets, bankAccounts, transferWalletToBank } = useWalletApp()
  const { formatDisplay } = useDisplayCurrency()
  const [fromWalletId, setFromWalletId] = useState(wallets[0]?.id ?? '')
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedWallet = wallets.find((w) => w.id === fromWalletId)
  const amountMinor = parseMajorToMinor(amount, selectedWallet?.currency ?? 'INR')
  const bankOptions = useMemo(
    () => bankAccounts.filter((a) => a.currency === selectedWallet?.currency),
    [bankAccounts, selectedWallet?.currency],
  )

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (!bankAccountId) { setError('Select a bank account.'); return }
    try {
      transferWalletToBank({ fromWalletId, bankAccountId, amountMinor, note: note.trim() || 'Bank transfer' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Transfer initiated!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="glass-control flex h-10 w-10 items-center justify-center rounded-2xl text-gray-700 transition hover:bg-white/75">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Wallet to Bank</h1>
          <p className="text-sm text-gray-700">Send funds to your bank account</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-700">Amount</p>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError('') }} currency={selectedWallet?.currency ?? 'INR'} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-700">From Wallet</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {wallets.map((w) => (
              <WalletCard key={w.id} wallet={w} compact selected={fromWalletId === w.id} onClick={() => { setFromWalletId(w.id); setBankAccountId(''); setError('') }} />
            ))}
          </div>
        </div>

        <div className="glass rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-700">To Bank Account</p>
          {bankOptions.length === 0 ? (
            <p className="text-sm text-gray-700">No bank accounts match this wallet's currency.</p>
          ) : (
            <Select value={bankAccountId} onChange={(e) => { setBankAccountId(e.target.value); setError('') }}>
              <option value="">Select bank account</option>
              {bankOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.bankName} — ****{a.accountLast4} ({a.currency})</option>
              ))}
            </Select>
          )}
        </div>

        {selectedWallet && amountMinor > 0 && (
          <div className="glass rounded-2xl p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">Balance after</span>
              <span className={`font-bold ${selectedWallet.balanceMinor - amountMinor < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                {formatDisplay(Math.max(0, selectedWallet.balanceMinor - amountMinor), selectedWallet.currency)}
              </span>
            </div>
            <p className="text-xs text-indigo-600">Bank transfers may take 1–3 business days</p>
          </div>
        )}

        <div className="glass rounded-3xl p-5">
          <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Rent, savings, etc." />
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
        <Button type="submit" fullWidth size="lg">Initiate Transfer</Button>
      </form>
    </div>
  )
}
