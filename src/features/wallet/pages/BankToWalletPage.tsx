import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { AmountInput } from '../../../components/AmountInput'
import { WalletCard } from '../components/WalletCard'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'

export function BankToWalletPage() {
  const navigate = useNavigate()
  const { wallets, bankAccounts, transferBankToWallet } = useWalletApp()
  const [bankAccountId, setBankAccountId] = useState(bankAccounts[0]?.id ?? '')
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedBank = bankAccounts.find((a) => a.id === bankAccountId)
  const amountMinor = parseMajorToMinor(amount, selectedBank?.currency ?? 'INR')
  const walletOptions = useMemo(
    () => wallets.filter((w) => w.currency === selectedBank?.currency),
    [selectedBank?.currency, wallets],
  )

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!amount || amountMinor <= 0) { setError('Enter a valid amount.'); return }
    if (!walletId) { setError('Select a destination wallet.'); return }
    try {
      transferBankToWallet({ bankAccountId, walletId, amountMinor, note: note.trim() || 'Bank deposit' })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Funds added to wallet!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-32 animate-slide-up">
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank to Wallet</h1>
          <p className="text-sm text-gray-500">Top up your wallet from bank</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">From Bank Account</p>
          <Select value={bankAccountId} onChange={(e) => { setBankAccountId(e.target.value); setWalletId(''); setError('') }}>
            {bankAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.bankName} — ****{a.accountLast4} ({a.currency})</option>
            ))}
          </Select>
        </div>

        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Amount to Add</p>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError('') }} currency={selectedBank?.currency ?? 'INR'} />
        </div>

        {selectedBank && (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">To Wallet</p>
            {walletOptions.length === 0 ? (
              <p className="text-sm text-gray-400">No wallets match this bank's currency.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {walletOptions.map((w) => (
                  <WalletCard key={w.id} wallet={w} compact selected={walletId === w.id} onClick={() => { setWalletId(w.id); setError('') }} />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="glass rounded-3xl p-5">
          <Input label="Note (optional)" type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Salary, savings top-up, etc." />
        </div>

        {error && <p className="text-sm text-red-500 px-1">{error}</p>}
        <Button type="submit" variant="success" fullWidth size="lg">Add Funds</Button>
      </form>
    </div>
  )
}
