import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Landmark, ArrowDownToLine, ArrowUpFromLine, Plus, X } from 'lucide-react'
import { SUPPORTED_CURRENCIES } from '../../../shared/constants/wallet'
import { formatMinor } from '../../../shared/lib/money'
import { Button } from '../../../shared/ui/Button'
import { Input } from '../../../shared/ui/Input'
import { Select } from '../../../shared/ui/Select'
import { useWalletApp } from '../hooks/useWalletApp'
import { TransactionList } from '../components/TransactionList'
import { cn } from '../../../shared/lib/cn'
import { APP_ROUTES } from '../../../shared/constants/routes'
import type { BankAccount, Transaction } from '../model/types'

const SEED_MINOR = 5_000_000

function computeBankBalance(id: string, bankAccounts: BankAccount[], transactions: Transaction[]): { minor: number; currency: BankAccount['currency'] } {
  const account = bankAccounts.find((b) => b.id === id)
  const currency = account?.currency ?? 'INR'

  const withdrawn = transactions
    .filter((tx) => tx.type === 'bank_to_wallet' && tx.fromBankAccountId === id && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amountMinor, 0)

  const deposited = transactions
    .filter((tx) => tx.type === 'bank_transfer' && tx.toBankAccountId === id && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amountMinor, 0)

  return { minor: Math.max(0, SEED_MINOR - withdrawn + deposited), currency }
}

export function BankPage() {
  const navigate = useNavigate()
  const { bankAccounts, transactions, wallets, addBankAccount, removeBankAccount, deleteTransaction } = useWalletApp()

  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(bankAccounts.length === 0)
  const [bankName, setBankName] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [accountLast4, setAccountLast4] = useState('')
  const [currency, setCurrency] = useState<(typeof SUPPORTED_CURRENCIES)[number]>('INR')
  const [feedback, setFeedback] = useState('')
  const [isError, setIsError] = useState(false)

  const bankTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === 'bank_transfer' || tx.type === 'bank_to_wallet'),
    [transactions]
  )

  const handleAdd = (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!bankName.trim()) { setIsError(true); setFeedback('Bank name is required.'); return }
    if (!accountHolder.trim()) { setIsError(true); setFeedback('Account holder name is required.'); return }
    if (accountLast4.length !== 4 || !/^\d{4}$/.test(accountLast4)) {
      setIsError(true); setFeedback('Last 4 digits must be exactly 4 numbers.'); return
    }
    try {
      addBankAccount({ bankName: bankName.trim(), accountHolder: accountHolder.trim(), accountLast4, currency })
      setBankName(''); setAccountHolder(''); setAccountLast4('')
      setFeedback('Bank account linked!'); setIsError(false); setShowForm(false)
    } catch (err) {
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to add bank account.')
    }
  }

  const handleRemove = (id: string) => {
    try {
      removeBankAccount(id)
      setConfirmingId(null)
      setFeedback('Bank account removed.'); setIsError(false)
    } catch (err) {
      setConfirmingId(null)
      setIsError(true); setFeedback(err instanceof Error ? err.message : 'Failed to remove.')
    }
  }

  return (
    <div className="mx-auto w-full max-w-full space-y-6 pb-20 sm:max-w-3xl sm:space-y-8 sm:pb-24 md:pb-10 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Bank Accounts</h1>
          <p className="text-sm text-gray-500">{bankAccounts.length} linked account{bankAccounts.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setFeedback('') }}
          className={cn(
            'flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-semibold transition-all',
            showForm ? 'bg-gray-100 text-gray-600' : 'bg-black text-white hover:bg-gray-800'
          )}
        >
          {showForm ? <X size={15} /> : <Plus size={15} />}
          {showForm ? 'Cancel' : 'Add Bank'}
        </button>
      </div>

      {/* Bank account cards */}
      {bankAccounts.length === 0 && !showForm && (
        <div className="glass rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center space-y-3">
          <Landmark size={36} className="mx-auto text-gray-300" />
          <p className="text-gray-500">No bank accounts linked yet.</p>
          <Button variant="secondary" onClick={() => setShowForm(true)}>Link Your First Bank</Button>
        </div>
      )}

      {bankAccounts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bankAccounts.map((account) => {
            const { minor: balMinor, currency: balCurrency } = computeBankBalance(account.id, bankAccounts, transactions)
            const isConfirming = confirmingId === account.id

            return (
              <div key={account.id} className="glass-dark rounded-3xl p-5 text-white space-y-4">
                {/* Account info */}
                <div className="flex items-start gap-3">
                  <div className="glass-dark-elevated flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
                    <Landmark size={20} className="text-white/80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">{account.bankName}</p>
                    <p className="text-sm text-white/60">{account.accountHolder}</p>
                    <p className="text-sm font-mono text-white/70">****{account.accountLast4}</p>
                  </div>
                  <span className="rounded-xl bg-white/10 px-2 py-1 text-xs font-semibold text-white/70">
                    {account.currency}
                  </span>
                </div>

                {/* Simulated balance */}
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest">Available Balance</p>
                  <p className="text-2xl font-black text-white">
                    {formatMinor(balMinor, balCurrency)}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.bankToWallet)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                  >
                    <ArrowDownToLine size={15} />
                    Add to Wallet
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.transferBank)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/10 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95"
                  >
                    <ArrowUpFromLine size={15} />
                    Transfer Out
                  </button>
                </div>

                {/* Remove with confirmation */}
                {isConfirming ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-red-500/20 p-3">
                    <p className="flex-1 text-xs text-red-200">Remove this account?</p>
                    <button
                      type="button"
                      onClick={() => handleRemove(account.id)}
                      className="rounded-xl bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-600"
                    >
                      Yes, Remove
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      className="rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/20"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmingId(account.id)}
                    className="w-full rounded-2xl bg-red-500/10 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
                  >
                    Remove Account
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add bank form */}
      {showForm && (
        <form onSubmit={handleAdd} className="glass rounded-3xl p-5 space-y-4 animate-scale-in">
          <p className="text-sm font-bold text-gray-700">Link New Bank Account</p>
          <Input
            label="Bank Name"
            type="text"
            value={bankName}
            onChange={(e) => { setBankName(e.target.value); setFeedback('') }}
            placeholder="e.g. State Bank of India"
          />
          <Input
            label="Account Holder"
            type="text"
            value={accountHolder}
            onChange={(e) => { setAccountHolder(e.target.value); setFeedback('') }}
            placeholder="Full name as on account"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Last 4 Digits"
              type="text"
              maxLength={4}
              value={accountLast4}
              onChange={(e) => { setAccountLast4(e.target.value.replace(/\D/g, '')); setFeedback('') }}
              placeholder="1234"
            />
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value as typeof currency)}>
                {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
          </div>
          {feedback && <p className={cn('text-sm font-medium', isError ? 'text-red-500' : 'text-emerald-600')}>{feedback}</p>}
          <Button type="submit" variant="primary" fullWidth>Link Bank Account</Button>
        </form>
      )}

      {feedback && !showForm && (
        <p className={cn('text-sm font-medium px-1', isError ? 'text-red-500' : 'text-emerald-600')}>{feedback}</p>
      )}

      {/* Recent bank transactions */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Bank Transaction History</p>
        <TransactionList
          transactions={bankTransactions}
          wallets={wallets}
          bankAccounts={bankAccounts}
          onDelete={deleteTransaction}
          groupByDate
          emptyMessage="No bank transactions yet"
        />
      </div>
    </div>
  )
}
