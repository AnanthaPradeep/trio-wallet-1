import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Sun, Receipt, Plane, PiggyBank, Star, Landmark } from 'lucide-react'
import { SUPPORTED_CURRENCIES } from '../../../shared/constants/wallet'
import { parseMajorToMinor } from '../../../shared/lib/money'
import { useDisplayCurrency } from '../../../shared/hooks/useDisplayCurrency'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import type { Wallet } from '../model/types'
import { cn } from '../../../shared/lib/cn'

const PURPOSES: Wallet['purpose'][] = ['daily', 'bills', 'travel', 'savings', 'custom']

const PURPOSE_ICON: Record<Wallet['purpose'], LucideIcon> = {
  daily:   Sun,
  bills:   Receipt,
  travel:  Plane,
  savings: PiggyBank,
  custom:  Star,
}

const WALLET_COLORS = [
  '#0a0a0a', '#1d4ed8', '#059669', '#7c3aed', '#dc2626', '#d97706', '#0891b2', '#be185d',
]

function ManageWallets() {
  const { wallets, addWallet, removeWallet } = useWalletApp()
  const { formatDisplay } = useDisplayCurrency()
  const [name, setName] = useState('')
  const [currency, setCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>('INR')
  const [purpose, setPurpose] = useState<Wallet['purpose']>('daily')
  const [initialBalance, setInitialBalance] = useState('')
  const [color, setColor] = useState(WALLET_COLORS[0]!)
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!name.trim()) { setIsError(true); setFeedback('Wallet name is required.'); return }
    try {
      addWallet({
        name: name.trim(),
        currency,
        purpose,
        initialBalanceMinor: initialBalance ? parseMajorToMinor(initialBalance, currency) : 0,
        color,
      })
      setName(''); setInitialBalance(''); setFeedback('Wallet added!'); setIsError(false); setShowForm(false)
    } catch (err) {
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to add wallet.')
    }
  }

  const handleRemove = (walletId: string) => {
    try {
      removeWallet(walletId)
      setFeedback('Wallet removed.'); setIsError(false)
    } catch (err) {
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to remove wallet.')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Your Wallets</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Wallet'}
        </Button>
      </div>

      <div className="space-y-2">
        {wallets.length === 0 ? (
          <div className="glass rounded-2xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No wallets yet. Add your first one!
          </div>
        ) : (
          wallets.map((wallet) => {
            const Icon = PURPOSE_ICON[wallet.purpose]
            return (
              <div key={wallet.id} className="glass flex items-center gap-4 rounded-2xl p-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: wallet.color ?? '#0a0a0a' }}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{wallet.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDisplay(wallet.balanceMinor, wallet.currency)} · {wallet.purpose}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(wallet.id)}
                  disabled={wallets.length <= 1}
                  className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            )
          })
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass rounded-3xl p-5 space-y-4 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">New Wallet</p>

          <Input label="Wallet Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency Fund" />

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Purpose</label>
              <Select value={purpose} onChange={(e) => setPurpose(e.target.value as Wallet['purpose'])}>
                {PURPOSES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </Select>
            </div>
          </div>

          <Input label="Initial Balance (optional)" type="number" min="0" step="0.01" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} placeholder="0.00" />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Card Color</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn('h-8 w-8 rounded-xl transition-all', color === c ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" fullWidth>Add Wallet</Button>
        </form>
      )}

      {feedback && (
        <p className={cn('text-sm font-medium px-1', isError ? 'text-red-500' : 'text-emerald-600')}>{feedback}</p>
      )}
    </section>
  )
}

function ManageBankAccounts() {
  const { bankAccounts, addBankAccount, removeBankAccount } = useWalletApp()
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountLast4, setAccountLast4] = useState('')
  const [currency, setCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>('INR')
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (accountLast4.length !== 4 || !/^\d{4}$/.test(accountLast4)) {
      setIsError(true); setFeedback('Last 4 digits must be exactly 4 numbers.'); return
    }
    try {
      addBankAccount({ bankName: bankName.trim(), accountHolder: accountHolder.trim(), accountLast4, currency })
      setBankName(''); setAccountHolder(''); setAccountLast4('')
      setFeedback('Bank account added!'); setIsError(false); setShowForm(false)
    } catch (err) {
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to add bank account.')
    }
  }

  const handleRemove = (id: string) => {
    try {
      removeBankAccount(id)
      setFeedback('Bank account removed.'); setIsError(false)
    } catch (err) {
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to remove bank account.')
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Bank Accounts</h2>
        <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Bank'}
        </Button>
      </div>

      <div className="space-y-2">
        {bankAccounts.length === 0 ? (
          <div className="glass rounded-2xl border-2 border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
            No bank accounts linked yet.
          </div>
        ) : (
          bankAccounts.map((account) => (
            <div key={account.id} className="glass flex items-center gap-4 rounded-2xl p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                <Landmark size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{account.bankName}</p>
                <p className="text-sm text-gray-500">{account.accountHolder} · ****{account.accountLast4} · {account.currency}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(account.id)}
                className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="glass rounded-3xl p-5 space-y-4 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">New Bank Account</p>
          <Input label="Bank Name" type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Sunrise Bank" />
          <Input label="Account Holder" type="text" value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)} placeholder="Full name" />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <Input label="Last 4 Digits" type="text" maxLength={4} value={accountLast4} onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, ''))} placeholder="1234" />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          <Button type="submit" fullWidth>Link Bank Account</Button>
        </form>
      )}

      {feedback && (
        <p className={cn('text-sm font-medium px-1', isError ? 'text-red-500' : 'text-emerald-600')}>{feedback}</p>
      )}
    </section>
  )
}

export function ManagePage() {
  return (
    <div className="space-y-8 pb-20 sm:space-y-9 sm:pb-24 md:space-y-10 md:pb-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage</h1>
        <p className="text-sm text-gray-500">Configure your wallets and bank accounts</p>
      </div>
      <ManageWallets />
      <ManageBankAccounts />
    </div>
  )
}
