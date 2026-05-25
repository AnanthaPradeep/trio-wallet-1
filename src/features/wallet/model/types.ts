import type { CurrencyCode } from '../../../shared/lib/money'

export interface Wallet {
  id: string
  name: string
  currency: CurrencyCode
  balanceMinor: number
  purpose: 'daily' | 'bills' | 'travel' | 'savings' | 'custom'
  color?: string
}

export interface BankAccount {
  id: string
  bankName: string
  accountHolder: string
  accountLast4: string
  currency: CurrencyCode
}

export interface CurrencyPool {
  currency: CurrencyCode
  totalAddedMinor: number
  totalSpentMinor: number
  totalAllocatedMinor: number
  unallocatedMinor: number
}

export type ExpenseCategory =
  | 'food'
  | 'bills'
  | 'shopping'
  | 'investment'
  | 'health'
  | 'entertainment'
  | 'travel'
  | 'transport'
  | 'education'
  | 'emergency'
  | 'other'

export type PaymentType = 'cash' | 'card' | 'upi' | 'bank_transfer' | 'other'

export type TransactionType =
  | 'expense'
  | 'income'
  | 'spend'
  | 'internal_transfer'
  | 'bank_transfer'
  | 'bank_to_wallet'
  | 'allocate_to_wallet'
  | 'goal_contribution'

export type TransactionStatus = 'completed' | 'pending' | 'failed'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  currency: CurrencyCode
  amountMinor: number
  fromWalletId?: string
  fromBankAccountId?: string
  toWalletId?: string
  toBankAccountId?: string
  note: string
  category?: ExpenseCategory
  tags?: string[]
  paymentType?: PaymentType
  source?: string
  isRecurring?: boolean
  recurringId?: string
  createdAtIso: string
}

export interface SpendInput {
  walletId: string
  amountMinor: number
  note: string
}

export interface AddExpenseInput {
  walletId: string
  amountMinor: number
  category: ExpenseCategory
  note: string
  date: string
  paymentType: PaymentType
  tags: string[]
  isRecurring?: boolean
}

export interface AddIncomeInput {
  currency: CurrencyCode
  amountMinor: number
  source: string
  note: string
  date: string
}

export interface AllocateToWalletInput {
  walletId: string
  amountMinor: number
  note: string
}

export interface InternalTransferInput {
  fromWalletId: string
  toWalletId: string
  amountMinor: number
  note: string
}

export interface BankTransferInput {
  id?: string
  fromWalletId: string
  bankAccountId: string
  amountMinor: number
  note: string
}

export interface AddWalletInput {
  name: string
  currency: CurrencyCode
  purpose: Wallet['purpose']
  initialBalanceMinor: number
  color?: string
}

export interface UpdateWalletInput {
  walletId: string
  name: string
  purpose: Wallet['purpose']
  color?: string
  balanceMinor?: number
}

export interface AddBankAccountInput {
  bankName: string
  accountHolder: string
  accountLast4: string
  currency: CurrencyCode
}

export interface BankToWalletInput {
  bankAccountId: string
  amountMinor: number
  note: string
}

export interface Budget {
  id: string
  name: string
  category: ExpenseCategory | 'all'
  limitMinor: number
  currency: CurrencyCode
  alertThreshold: number
  createdAtIso: string
}

export interface AddBudgetInput {
  name: string
  category: ExpenseCategory | 'all'
  limitMinor: number
  currency: CurrencyCode
  alertThreshold?: number
}

export interface Goal {
  id: string
  name: string
  targetAmountMinor: number
  savedAmountMinor: number
  currency: CurrencyCode
  deadline?: string
  color?: string
  isCompleted: boolean
  createdAtIso: string
}

export interface AddGoalInput {
  name: string
  targetAmountMinor: number
  currency: CurrencyCode
  deadline?: string
  color?: string
}

export interface ContributeToGoalInput {
  goalId: string
  walletId: string
  amountMinor: number
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRule {
  id: string
  name: string
  type: 'expense' | 'income'
  frequency: RecurringFrequency
  amountMinor: number
  currency: CurrencyCode
  walletId?: string
  category?: ExpenseCategory
  paymentType?: PaymentType
  source?: string
  note: string
  nextDueIso: string
  isActive: boolean
  createdAtIso: string
}

export interface AddRecurringRuleInput {
  name: string
  type: 'expense' | 'income'
  frequency: RecurringFrequency
  amountMinor: number
  currency: CurrencyCode
  walletId?: string
  category?: ExpenseCategory
  paymentType?: PaymentType
  source?: string
  note: string
  startDateIso: string
}

export interface WalletAppState {
  pools: CurrencyPool[]
  wallets: Wallet[]
  bankAccounts: BankAccount[]
  transactions: Transaction[]
  budgets: Budget[]
  recurringRules: RecurringRule[]
  goals: Goal[]
}
