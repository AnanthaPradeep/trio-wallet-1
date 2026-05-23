import { uid } from '../../../shared/lib/uid'
import type {
  AddBankAccountInput,
  AddExpenseInput,
  AddIncomeInput,
  AddWalletInput,
  BankToWalletInput,
  BankTransferInput,
  InternalTransferInput,
  SpendInput,
  Transaction,
  TransactionStatus,
  Wallet,
  WalletAppState,
} from './types'

export type WalletAction =
  | { type: 'SPEND'; payload: SpendInput }
  | { type: 'ADD_EXPENSE'; payload: AddExpenseInput }
  | { type: 'ADD_INCOME'; payload: AddIncomeInput }
  | { type: 'DELETE_TRANSACTION'; payload: { transactionId: string } }
  | { type: 'INTERNAL_TRANSFER'; payload: InternalTransferInput }
  | { type: 'BANK_TRANSFER'; payload: BankTransferInput }
  | { type: 'BANK_TO_WALLET'; payload: BankToWalletInput }
  | { type: 'SETTLE_TRANSACTION'; payload: { transactionId: string; status: TransactionStatus } }
  | { type: 'ADD_WALLET'; payload: AddWalletInput }
  | { type: 'REMOVE_WALLET'; payload: { walletId: string } }
  | { type: 'ADD_BANK_ACCOUNT'; payload: AddBankAccountInput }
  | { type: 'REMOVE_BANK_ACCOUNT'; payload: { bankAccountId: string } }

function findWallet(wallets: Wallet[], walletId: string): Wallet {
  const wallet = wallets.find((item) => item.id === walletId)
  if (!wallet) throw new Error('Wallet not found.')
  return wallet
}

export function walletReducer(state: WalletAppState, action: WalletAction): WalletAppState {
  const extra = applyExtraActions(state, action)
  if (extra !== null) return extra

  if (action.type === 'ADD_EXPENSE') {
    const { walletId, amountMinor, category, note, date, paymentType, tags, isRecurring } = action.payload
    const wallet = findWallet(state.wallets, walletId)

    if (amountMinor <= 0) throw new Error('Amount must be greater than zero.')
    if (wallet.balanceMinor < amountMinor) throw new Error('Insufficient balance in selected wallet.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor - amountMinor } : item,
    )

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'expense',
      status: 'completed',
      currency: wallet.currency,
      amountMinor,
      fromWalletId: walletId,
      note: note.trim() || category,
      category,
      tags,
      paymentType,
      isRecurring: isRecurring ?? false,
      createdAtIso: date || new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'ADD_INCOME') {
    const { walletId, amountMinor, source, note, date } = action.payload
    const wallet = findWallet(state.wallets, walletId)

    if (amountMinor <= 0) throw new Error('Amount must be greater than zero.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor + amountMinor } : item,
    )

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'income',
      status: 'completed',
      currency: wallet.currency,
      amountMinor,
      toWalletId: walletId,
      note: note.trim() || source,
      source,
      createdAtIso: date || new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'SPEND') {
    const { walletId, amountMinor, note } = action.payload
    const wallet = findWallet(state.wallets, walletId)

    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')
    if (wallet.balanceMinor < amountMinor) throw new Error('Insufficient balance in selected wallet.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor - amountMinor } : item,
    )

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'spend',
      status: 'completed',
      currency: wallet.currency,
      amountMinor,
      fromWalletId: walletId,
      note,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'INTERNAL_TRANSFER') {
    const { fromWalletId, toWalletId, amountMinor, note } = action.payload

    if (fromWalletId === toWalletId) throw new Error('Source and destination wallets must be different.')

    const source = findWallet(state.wallets, fromWalletId)
    const target = findWallet(state.wallets, toWalletId)

    if (source.currency !== target.currency) throw new Error('Internal transfer requires same currency wallets.')
    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')
    if (source.balanceMinor < amountMinor) throw new Error('Insufficient source wallet balance.')

    const wallets = state.wallets.map((item) => {
      if (item.id === fromWalletId) return { ...item, balanceMinor: item.balanceMinor - amountMinor }
      if (item.id === toWalletId) return { ...item, balanceMinor: item.balanceMinor + amountMinor }
      return item
    })

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'internal_transfer',
      status: 'completed',
      currency: source.currency,
      amountMinor,
      fromWalletId,
      toWalletId,
      note,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'BANK_TO_WALLET') {
    const { bankAccountId, walletId, amountMinor, note } = action.payload
    const bank = state.bankAccounts.find((item) => item.id === bankAccountId)
    if (!bank) throw new Error('Bank account not found.')

    const target = findWallet(state.wallets, walletId)
    if (bank.currency !== target.currency) throw new Error('Bank to wallet transfer requires matching currency.')
    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor + amountMinor } : item,
    )

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'bank_to_wallet',
      status: 'completed',
      currency: target.currency,
      amountMinor,
      fromBankAccountId: bankAccountId,
      toWalletId: walletId,
      note,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'BANK_TRANSFER') {
    const { fromWalletId, bankAccountId, amountMinor, note } = action.payload
    const source = findWallet(state.wallets, fromWalletId)
    const bank = state.bankAccounts.find((item) => item.id === bankAccountId)

    if (!bank) throw new Error('Bank account not found.')
    if (source.currency !== bank.currency) throw new Error('Bank transfer requires matching currency.')
    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')
    if (source.balanceMinor < amountMinor) throw new Error('Insufficient source wallet balance.')

    const wallets = state.wallets.map((item) =>
      item.id === fromWalletId ? { ...item, balanceMinor: item.balanceMinor - amountMinor } : item,
    )

    const transaction: Transaction = {
      id: action.payload.id ?? uid('tx'),
      type: 'bank_transfer',
      status: 'pending',
      currency: source.currency,
      amountMinor,
      fromWalletId,
      toBankAccountId: bankAccountId,
      note,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, wallets, transactions: [transaction, ...state.transactions] }
  }

  return state
}

function applyExtraActions(state: WalletAppState, action: WalletAction): WalletAppState | null {
  if (action.type === 'DELETE_TRANSACTION') {
    const tx = state.transactions.find((t) => t.id === action.payload.transactionId)
    if (!tx) return state

    let wallets = state.wallets
    if (tx.type === 'expense' || tx.type === 'spend') {
      wallets = state.wallets.map((w) =>
        w.id === tx.fromWalletId ? { ...w, balanceMinor: w.balanceMinor + tx.amountMinor } : w,
      )
    } else if (tx.type === 'income') {
      wallets = state.wallets.map((w) =>
        w.id === tx.toWalletId ? { ...w, balanceMinor: w.balanceMinor - tx.amountMinor } : w,
      )
    } else if (tx.type === 'internal_transfer') {
      wallets = state.wallets.map((w) => {
        if (w.id === tx.fromWalletId) return { ...w, balanceMinor: w.balanceMinor + tx.amountMinor }
        if (w.id === tx.toWalletId) return { ...w, balanceMinor: w.balanceMinor - tx.amountMinor }
        return w
      })
    }

    return {
      ...state,
      wallets,
      transactions: state.transactions.filter((t) => t.id !== action.payload.transactionId),
    }
  }

  if (action.type === 'SETTLE_TRANSACTION') {
    return {
      ...state,
      transactions: state.transactions.map((tx) =>
        tx.id === action.payload.transactionId ? { ...tx, status: action.payload.status } : tx,
      ),
    }
  }

  if (action.type === 'ADD_WALLET') {
    const { name, currency, purpose, initialBalanceMinor, color } = action.payload
    const wallet: Wallet = { id: uid('w'), name, currency, purpose, balanceMinor: initialBalanceMinor, color }
    return { ...state, wallets: [...state.wallets, wallet] }
  }

  if (action.type === 'REMOVE_WALLET') {
    const { walletId } = action.payload
    const hasPending = state.transactions.some(
      (tx) => tx.status === 'pending' && (tx.fromWalletId === walletId || tx.toWalletId === walletId),
    )
    if (hasPending) throw new Error('Cannot remove a wallet with pending transactions.')
    if (state.wallets.length <= 1) throw new Error('You must keep at least one wallet.')
    return { ...state, wallets: state.wallets.filter((w) => w.id !== walletId) }
  }

  if (action.type === 'ADD_BANK_ACCOUNT') {
    const { bankName, accountHolder, accountLast4, currency } = action.payload
    return {
      ...state,
      bankAccounts: [...state.bankAccounts, { id: uid('b'), bankName, accountHolder, accountLast4, currency }],
    }
  }

  if (action.type === 'REMOVE_BANK_ACCOUNT') {
    const { bankAccountId } = action.payload
    const hasPending = state.transactions.some(
      (tx) =>
        tx.status === 'pending' &&
        (tx.fromBankAccountId === bankAccountId || tx.toBankAccountId === bankAccountId),
    )
    if (hasPending) throw new Error('Cannot remove a bank account with pending transactions.')
    return { ...state, bankAccounts: state.bankAccounts.filter((b) => b.id !== bankAccountId) }
  }

  return null
}
