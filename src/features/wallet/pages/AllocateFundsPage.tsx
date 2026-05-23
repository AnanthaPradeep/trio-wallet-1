import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AmountInput } from '../../../components/AmountInput'
import { SuccessOverlay } from '../../../components/SuccessOverlay'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { WalletCard } from '../components/WalletCard'

export function AllocateFundsPage() {
  const navigate = useNavigate()
  const { pools, wallets, allocateToWallet } = useWalletApp()
  const { formatDisplay } = useDisplayCurrency()

  const activePools = useMemo(() => pools.filter((pool) => pool.unallocatedMinor > 0), [pools])

  const [currency, setCurrency] = useState(activePools[0]?.currency ?? pools[0]?.currency ?? 'INR')
  const [walletId, setWalletId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const selectedPool = pools.find((pool) => pool.currency === currency)
  const walletOptions = useMemo(() => wallets.filter((wallet) => wallet.currency === currency), [wallets, currency])

  const amountMinor = parseMajorToMinor(amount, currency)

  const submit = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!walletId) {
      setError('Select a wallet for allocation.')
      return
    }
    if (!amount || amountMinor <= 0) {
      setError('Enter a valid amount.')
      return
    }

    try {
      allocateToWallet({ walletId, amountMinor, note: note.trim() || `Allocate ${currency} funds` })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Allocation failed.')
    }
  }

  if (success) {
    return <SuccessOverlay message="Funds allocated!" onDone={() => navigate('/')} />
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-5 pb-20 sm:max-w-2xl sm:space-y-6 sm:pb-24 md:max-w-2xl md:pb-10 animate-slide-up">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-600 transition hover:bg-gray-200"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Allocate Funds</h1>
          <p className="text-sm text-gray-500">Split total pool amount into specific wallets</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass rounded-3xl p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Pool Currency</p>
          <Select
            value={currency}
            onChange={(e) => {
              const nextCurrency = e.target.value
              setCurrency(nextCurrency as typeof currency)
              setWalletId('')
              setError('')
            }}
          >
            {pools.map((pool) => (
              <option key={pool.currency} value={pool.currency}>
                {pool.currency} ({formatDisplay(pool.unallocatedMinor, pool.currency)} unallocated)
              </option>
            ))}
          </Select>
        </div>

        {selectedPool && (
          <div className="glass rounded-2xl p-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total earned</span>
              <span className="font-semibold">{formatDisplay(selectedPool.totalAddedMinor, selectedPool.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Currently unallocated</span>
              <span className="font-bold text-amber-700">{formatDisplay(selectedPool.unallocatedMinor, selectedPool.currency)}</span>
            </div>
          </div>
        )}

        <div className="glass rounded-3xl p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Amount to Allocate</p>
          <AmountInput value={amount} onChange={(v) => { setAmount(v); setError('') }} currency={currency} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Destination Wallet</p>
          {walletOptions.length === 0 ? (
            <p className="text-sm text-gray-400">No wallets available in {currency}. Create one in Manage first.</p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {walletOptions.map((wallet) => (
                <WalletCard
                  key={wallet.id}
                  wallet={wallet}
                  compact
                  selected={walletId === wallet.id}
                  onClick={() => {
                    setWalletId(wallet.id)
                    setError('')
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-3xl p-5">
          <Input
            label="Note (optional)"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Monthly split, emergency reserve, etc."
          />
        </div>

        {error && <p className="px-1 text-sm text-red-500">{error}</p>}
        <Button type="submit" fullWidth size="lg" variant="primary">Confirm Allocation</Button>
      </form>
    </div>
  )
}
