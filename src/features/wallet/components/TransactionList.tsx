import { useMemo } from 'react'
import { Inbox } from 'lucide-react'
import { TransactionTile } from '../../../components/TransactionTile'
import type { BankAccount, Transaction, Wallet } from '../model/types'

interface TransactionListProps {
  transactions: Transaction[]
  wallets?: Wallet[]
  bankAccounts?: BankAccount[]
  emptyMessage?: string
  onDelete?: (id: string) => void
  groupByDate?: boolean
}

function groupTransactionsByDate(transactions: Transaction[]): Array<{ label: string; items: Transaction[] }> {
  const groups = new Map<string, Transaction[]>()
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const tx of transactions) {
    const d = new Date(tx.createdAtIso)
    let label: string

    if (d.toDateString() === today.toDateString()) {
      label = 'Today'
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = 'Yesterday'
    } else {
      label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }

    const existing = groups.get(label) ?? []
    existing.push(tx)
    groups.set(label, existing)
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
}

export function TransactionList({
  transactions,
  wallets,
  bankAccounts,
  emptyMessage,
  onDelete,
  groupByDate = true,
}: TransactionListProps) {
  const walletMap = useMemo(() => {
    if (!wallets) return new Map<string, string>()
    return new Map(wallets.map((w) => [w.id, w.name]))
  }, [wallets])

  const bankMap = useMemo(() => {
    if (!bankAccounts) return new Map<string, string>()
    return new Map(bankAccounts.map((b) => [b.id, b.bankName]))
  }, [bankAccounts])

  function getRouteText(tx: Transaction): string | undefined {
    if (tx.type === 'internal_transfer') {
      const from = tx.fromWalletId ? walletMap.get(tx.fromWalletId) : undefined
      const to = tx.toWalletId ? walletMap.get(tx.toWalletId) : undefined
      if (from || to) return `${from ?? 'Wallet'} -> ${to ?? 'Wallet'}`
      return 'Wallet -> Wallet'
    }

    if (tx.type === 'bank_transfer') {
      const from = tx.fromWalletId ? walletMap.get(tx.fromWalletId) : undefined
      const toBank = tx.toBankAccountId ? bankMap.get(tx.toBankAccountId) : undefined
      if (from || toBank) return `${from ?? 'Wallet'} -> ${toBank ?? 'Bank'}`
      return 'Wallet -> Bank'
    }

    if (tx.type === 'bank_to_wallet') {
      const fromBank = tx.fromBankAccountId ? bankMap.get(tx.fromBankAccountId) : undefined
      return `${fromBank ?? 'Bank'} -> Pool`
    }

    const walletId = tx.fromWalletId ?? tx.toWalletId
    return walletId ? walletMap.get(walletId) : undefined
  }

  if (!transactions.length) {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-3xl py-12 text-center sm:py-14">
        <Inbox size={40} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-500">{emptyMessage ?? 'No transactions yet'}</p>
      </div>
    )
  }

  if (!groupByDate) {
    return (
      <div className="space-y-2 sm:space-y-2.5">
        {transactions.map((tx, i) => {
          const routeText = getRouteText(tx)
          return (
            <TransactionTile key={tx.id} tx={tx} walletName={routeText} onDelete={onDelete} animationDelay={i * 40} />
          )
        })}
      </div>
    )
  }

  const groups = groupTransactionsByDate(transactions)

  return (
    <div className="space-y-5 sm:space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{group.label}</span>
            <div className="h-px flex-1 bg-gray-100" />
            <span className="text-xs text-gray-400">{group.items.length} item{group.items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="space-y-2">
            {group.items.map((tx, i) => {
              const routeText = getRouteText(tx)
              return (
                <TransactionTile key={tx.id} tx={tx} walletName={routeText} onDelete={onDelete} animationDelay={i * 40} />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
