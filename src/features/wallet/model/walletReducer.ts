import { uid } from '../../../shared/lib/uid'
import type {
  AddBankAccountInput,
  AddBudgetInput,
  AddExpenseInput,
  AddGoalInput,
  AddIncomeInput,
  AddRecurringRuleInput,
  AddWalletInput,
  AllocateToWalletInput,
  BankToWalletInput,
  BankTransferInput,
  Budget,
  ContributeToGoalInput,
  CurrencyPool,
  Goal,
  InternalTransferInput,
  RecurringFrequency,
  RecurringRule,
  SpendInput,
  Transaction,
  TransactionStatus,
  UpdateWalletInput,
  Wallet,
  WalletAppState,
} from './types'

export type WalletAction =
  | { type: 'SPEND'; payload: SpendInput }
  | { type: 'ADD_EXPENSE'; payload: AddExpenseInput }
  | { type: 'ADD_INCOME'; payload: AddIncomeInput }
  | { type: 'ALLOCATE_TO_WALLET'; payload: AllocateToWalletInput }
  | { type: 'DELETE_TRANSACTION'; payload: { transactionId: string } }
  | { type: 'INTERNAL_TRANSFER'; payload: InternalTransferInput }
  | { type: 'BANK_TRANSFER'; payload: BankTransferInput }
  | { type: 'BANK_TO_WALLET'; payload: BankToWalletInput }
  | { type: 'SETTLE_TRANSACTION'; payload: { transactionId: string; status: TransactionStatus } }
  | { type: 'ADD_WALLET'; payload: AddWalletInput }
  | { type: 'UPDATE_WALLET'; payload: UpdateWalletInput }
  | { type: 'REMOVE_WALLET'; payload: { walletId: string } }
  | { type: 'ADD_BANK_ACCOUNT'; payload: AddBankAccountInput }
  | { type: 'REMOVE_BANK_ACCOUNT'; payload: { bankAccountId: string } }
  | { type: 'ADD_BUDGET'; payload: AddBudgetInput }
  | { type: 'UPDATE_BUDGET'; payload: { id: string } & Partial<AddBudgetInput> }
  | { type: 'REMOVE_BUDGET'; payload: { budgetId: string } }
  | { type: 'ADD_RECURRING_RULE'; payload: AddRecurringRuleInput }
  | { type: 'UPDATE_RECURRING_RULE'; payload: { id: string } & Partial<AddRecurringRuleInput> }
  | { type: 'REMOVE_RECURRING_RULE'; payload: { ruleId: string } }
  | { type: 'TOGGLE_RECURRING_RULE'; payload: { ruleId: string } }
  | { type: 'PROCESS_RECURRING_RULES' }
  | { type: 'RUN_RECURRING_RULE'; payload: { ruleId: string } }
  | { type: 'ADD_GOAL'; payload: AddGoalInput }
  | { type: 'UPDATE_GOAL'; payload: { id: string } & Partial<AddGoalInput> }
  | { type: 'REMOVE_GOAL'; payload: { goalId: string } }
  | { type: 'CONTRIBUTE_TO_GOAL'; payload: ContributeToGoalInput }
  | { type: 'MARK_GOAL_COMPLETE'; payload: { goalId: string } }

function findWallet(wallets: Wallet[], walletId: string): Wallet {
  const wallet = wallets.find((item) => item.id === walletId)
  if (!wallet) throw new Error('Wallet not found.')
  return wallet
}

function findPool(pools: CurrencyPool[], currency: Wallet['currency']): CurrencyPool {
  const pool = pools.find((item) => item.currency === currency)
  if (!pool) throw new Error(`Pool not found for ${currency}.`)
  return pool
}

function updatePool(
  pools: CurrencyPool[],
  currency: Wallet['currency'],
  updater: (pool: CurrencyPool) => CurrencyPool,
): CurrencyPool[] {
  let found = false
  const next = pools.map((pool) => {
    if (pool.currency !== currency) return pool
    found = true
    return updater(pool)
  })
  if (!found) throw new Error(`Pool not found for ${currency}.`)
  return next
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
    const pools = updatePool(state.pools, wallet.currency, (pool) => ({
      ...pool,
      totalSpentMinor: pool.totalSpentMinor + amountMinor,
    }))

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

    return { ...state, wallets, pools, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'ADD_INCOME') {
    const { currency, amountMinor, source, note, date } = action.payload

    if (amountMinor <= 0) throw new Error('Amount must be greater than zero.')

    const pools = updatePool(state.pools, currency, (pool) => ({
      ...pool,
      totalAddedMinor: pool.totalAddedMinor + amountMinor,
      unallocatedMinor: pool.unallocatedMinor + amountMinor,
    }))

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'income',
      status: 'completed',
      currency,
      amountMinor,
      note: note.trim() || source,
      source,
      createdAtIso: date || new Date().toISOString(),
    }

    return { ...state, pools, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'ALLOCATE_TO_WALLET') {
    const { walletId, amountMinor, note } = action.payload
    const wallet = findWallet(state.wallets, walletId)
    const pool = findPool(state.pools, wallet.currency)

    if (amountMinor <= 0) throw new Error('Amount must be greater than zero.')
    if (pool.unallocatedMinor < amountMinor) throw new Error('Insufficient unallocated pool balance.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor + amountMinor } : item,
    )
    const pools = updatePool(state.pools, wallet.currency, (item) => ({
      ...item,
      totalAllocatedMinor: item.totalAllocatedMinor + amountMinor,
      unallocatedMinor: item.unallocatedMinor - amountMinor,
    }))

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'allocate_to_wallet',
      status: 'completed',
      currency: wallet.currency,
      amountMinor,
      toWalletId: walletId,
      note: note.trim() || `Allocated to ${wallet.name}`,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, wallets, pools, transactions: [transaction, ...state.transactions] }
  }

  if (action.type === 'SPEND') {
    const { walletId, amountMinor, note } = action.payload
    const wallet = findWallet(state.wallets, walletId)

    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')
    if (wallet.balanceMinor < amountMinor) throw new Error('Insufficient balance in selected wallet.')

    const wallets = state.wallets.map((item) =>
      item.id === walletId ? { ...item, balanceMinor: item.balanceMinor - amountMinor } : item,
    )
    const pools = updatePool(state.pools, wallet.currency, (pool) => ({
      ...pool,
      totalSpentMinor: pool.totalSpentMinor + amountMinor,
    }))

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

    return { ...state, wallets, pools, transactions: [transaction, ...state.transactions] }
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
    const { bankAccountId, amountMinor, note } = action.payload
    const bank = state.bankAccounts.find((item) => item.id === bankAccountId)
    if (!bank) throw new Error('Bank account not found.')
    if (amountMinor <= 0) throw new Error('Amount should be greater than zero.')
    const pools = updatePool(state.pools, bank.currency, (pool) => ({
      ...pool,
      totalAddedMinor: pool.totalAddedMinor + amountMinor,
      unallocatedMinor: pool.unallocatedMinor + amountMinor,
    }))

    const transaction: Transaction = {
      id: uid('tx'),
      type: 'bank_to_wallet',
      status: 'completed',
      currency: bank.currency,
      amountMinor,
      fromBankAccountId: bankAccountId,
      note,
      createdAtIso: new Date().toISOString(),
    }

    return { ...state, pools, transactions: [transaction, ...state.transactions] }
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
    const pools = updatePool(state.pools, source.currency, (pool) => ({
      ...pool,
      totalSpentMinor: pool.totalSpentMinor + amountMinor,
    }))

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

    return { ...state, wallets, pools, transactions: [transaction, ...state.transactions] }
  }

  return state
}

function applyExtraActions(state: WalletAppState, action: WalletAction): WalletAppState | null {
  if (action.type === 'DELETE_TRANSACTION') {
    const tx = state.transactions.find((t) => t.id === action.payload.transactionId)
    if (!tx) return state

    let wallets = state.wallets
    let pools = state.pools
    if (tx.type === 'expense' || tx.type === 'spend') {
      wallets = state.wallets.map((w) =>
        w.id === tx.fromWalletId ? { ...w, balanceMinor: w.balanceMinor + tx.amountMinor } : w,
      )
      pools = updatePool(state.pools, tx.currency, (pool) => ({
        ...pool,
        totalSpentMinor: Math.max(0, pool.totalSpentMinor - tx.amountMinor),
      }))
    } else if (tx.type === 'income') {
      const pool = findPool(state.pools, tx.currency)
      if (pool.unallocatedMinor < tx.amountMinor) {
        throw new Error('Cannot delete income after allocation or spend. Remove dependent transactions first.')
      }
      pools = updatePool(state.pools, tx.currency, (item) => ({
        ...item,
        totalAddedMinor: Math.max(0, item.totalAddedMinor - tx.amountMinor),
        unallocatedMinor: item.unallocatedMinor - tx.amountMinor,
      }))
    } else if (tx.type === 'bank_to_wallet') {
      const pool = findPool(state.pools, tx.currency)
      if (pool.unallocatedMinor < tx.amountMinor) {
        throw new Error('Cannot delete bank deposit after allocation or spend. Remove dependent transactions first.')
      }
      pools = updatePool(state.pools, tx.currency, (item) => ({
        ...item,
        totalAddedMinor: Math.max(0, item.totalAddedMinor - tx.amountMinor),
        unallocatedMinor: item.unallocatedMinor - tx.amountMinor,
      }))
    } else if (tx.type === 'allocate_to_wallet') {
      wallets = state.wallets.map((w) =>
        w.id === tx.toWalletId ? { ...w, balanceMinor: w.balanceMinor - tx.amountMinor } : w,
      )
      pools = updatePool(state.pools, tx.currency, (pool) => ({
        ...pool,
        totalAllocatedMinor: Math.max(0, pool.totalAllocatedMinor - tx.amountMinor),
        unallocatedMinor: pool.unallocatedMinor + tx.amountMinor,
      }))
    } else if (tx.type === 'internal_transfer') {
      wallets = state.wallets.map((w) => {
        if (w.id === tx.fromWalletId) return { ...w, balanceMinor: w.balanceMinor + tx.amountMinor }
        if (w.id === tx.toWalletId) return { ...w, balanceMinor: w.balanceMinor - tx.amountMinor }
        return w
      })
    } else if (tx.type === 'bank_transfer') {
      wallets = state.wallets.map((w) =>
        w.id === tx.fromWalletId ? { ...w, balanceMinor: w.balanceMinor + tx.amountMinor } : w,
      )
      pools = updatePool(state.pools, tx.currency, (pool) => ({
        ...pool,
        totalSpentMinor: Math.max(0, pool.totalSpentMinor - tx.amountMinor),
      }))
    }

    return {
      ...state,
      wallets,
      pools,
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
    const pools = updatePool(state.pools, currency, (pool) => ({
      ...pool,
      totalAddedMinor: pool.totalAddedMinor + initialBalanceMinor,
      totalAllocatedMinor: pool.totalAllocatedMinor + initialBalanceMinor,
    }))
    return { ...state, wallets: [...state.wallets, wallet], pools }
  }

  if (action.type === 'REMOVE_WALLET') {
    const { walletId } = action.payload
    const wallet = findWallet(state.wallets, walletId)
    const hasPending = state.transactions.some(
      (tx) => tx.status === 'pending' && (tx.fromWalletId === walletId || tx.toWalletId === walletId),
    )
    if (hasPending) throw new Error('Cannot remove a wallet with pending transactions.')
    if (state.wallets.length <= 1) throw new Error('You must keep at least one wallet.')
    if (wallet.balanceMinor > 0) throw new Error('Move or spend wallet funds before removing this wallet.')
    return { ...state, wallets: state.wallets.filter((w) => w.id !== walletId) }
  }

  if (action.type === 'UPDATE_WALLET') {
    const { walletId, name, purpose, color, balanceMinor } = action.payload
    const existingWallet = findWallet(state.wallets, walletId)

    const trimmedName = name.trim()
    if (!trimmedName) throw new Error('Wallet name cannot be empty.')
    if (balanceMinor !== undefined && balanceMinor < 0) throw new Error('Balance cannot be negative.')

    let pools = state.pools
    if (balanceMinor !== undefined && balanceMinor !== existingWallet.balanceMinor) {
      const delta = balanceMinor - existingWallet.balanceMinor
      if (delta > 0) {
        pools = updatePool(state.pools, existingWallet.currency, (pool) => ({
          ...pool,
          totalAddedMinor: pool.totalAddedMinor + delta,
          totalAllocatedMinor: pool.totalAllocatedMinor + delta,
        }))
      } else {
        pools = updatePool(state.pools, existingWallet.currency, (pool) => ({
          ...pool,
          totalSpentMinor: pool.totalSpentMinor + Math.abs(delta),
        }))
      }
    }

    return {
      ...state,
      pools,
      wallets: state.wallets.map((wallet) =>
        wallet.id === walletId
          ? {
              ...wallet,
              name: trimmedName,
              purpose,
              color,
              balanceMinor: balanceMinor ?? wallet.balanceMinor,
            }
          : wallet,
      ),
    }
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

  if (action.type === 'ADD_BUDGET') {
    const { name, category, limitMinor, currency, alertThreshold } = action.payload
    if (limitMinor <= 0) throw new Error('Budget limit must be greater than zero.')
    const budget: Budget = {
      id: uid('bgt'),
      name: name.trim() || category,
      category,
      limitMinor,
      currency,
      alertThreshold: alertThreshold ?? 80,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, budgets: [...(state.budgets ?? []), budget] }
  }

  if (action.type === 'UPDATE_BUDGET') {
    const { id, ...changes } = action.payload
    return {
      ...state,
      budgets: (state.budgets ?? []).map((b) => (b.id === id ? { ...b, ...changes } : b)),
    }
  }

  if (action.type === 'REMOVE_BUDGET') {
    return {
      ...state,
      budgets: (state.budgets ?? []).filter((b) => b.id !== action.payload.budgetId),
    }
  }

  if (action.type === 'ADD_RECURRING_RULE') {
    const { startDateIso, ...rest } = action.payload
    const rule: RecurringRule = {
      id: uid('rec'),
      ...rest,
      nextDueIso: startDateIso,
      isActive: true,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, recurringRules: [...(state.recurringRules ?? []), rule] }
  }

  if (action.type === 'UPDATE_RECURRING_RULE') {
    const { id, startDateIso, ...changes } = action.payload
    return {
      ...state,
      recurringRules: (state.recurringRules ?? []).map((r) =>
        r.id === id ? { ...r, ...changes, ...(startDateIso ? { nextDueIso: startDateIso } : {}) } : r,
      ),
    }
  }

  if (action.type === 'REMOVE_RECURRING_RULE') {
    return {
      ...state,
      recurringRules: (state.recurringRules ?? []).filter((r) => r.id !== action.payload.ruleId),
    }
  }

  if (action.type === 'TOGGLE_RECURRING_RULE') {
    return {
      ...state,
      recurringRules: (state.recurringRules ?? []).map((r) =>
        r.id === action.payload.ruleId ? { ...r, isActive: !r.isActive } : r,
      ),
    }
  }

  if (action.type === 'PROCESS_RECURRING_RULES') {
    const now = new Date()
    const dueRules = (state.recurringRules ?? []).filter(
      (r) => r.isActive && new Date(r.nextDueIso) <= now,
    )
    if (dueRules.length === 0) return state
    let next = state
    for (const rule of dueRules) {
      next = fireRecurringRule(next, rule)
    }
    return next
  }

  if (action.type === 'RUN_RECURRING_RULE') {
    const rule = (state.recurringRules ?? []).find((r) => r.id === action.payload.ruleId)
    if (!rule) return state
    return fireRecurringRule(state, rule)
  }

  if (action.type === 'ADD_GOAL') {
    const { name, targetAmountMinor, currency, deadline, color } = action.payload
    if (targetAmountMinor <= 0) throw new Error('Target amount must be greater than zero.')
    const goal: Goal = {
      id: uid('goal'),
      name: name.trim(),
      targetAmountMinor,
      savedAmountMinor: 0,
      currency,
      deadline,
      color,
      isCompleted: false,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, goals: [...(state.goals ?? []), goal] }
  }

  if (action.type === 'UPDATE_GOAL') {
    const { id, ...changes } = action.payload
    return {
      ...state,
      goals: (state.goals ?? []).map((g) => (g.id === id ? { ...g, ...changes } : g)),
    }
  }

  if (action.type === 'REMOVE_GOAL') {
    return {
      ...state,
      goals: (state.goals ?? []).filter((g) => g.id !== action.payload.goalId),
    }
  }

  if (action.type === 'CONTRIBUTE_TO_GOAL') {
    const { goalId, walletId, amountMinor } = action.payload
    const goal = (state.goals ?? []).find((g) => g.id === goalId)
    const wallet = findWallet(state.wallets, walletId)
    if (!goal) throw new Error('Goal not found.')
    if (amountMinor <= 0) throw new Error('Contribution must be greater than zero.')
    if (wallet.balanceMinor < amountMinor) throw new Error('Insufficient wallet balance.')

    const newSaved = goal.savedAmountMinor + amountMinor
    const goals = (state.goals ?? []).map((g) =>
      g.id === goalId
        ? { ...g, savedAmountMinor: newSaved, isCompleted: newSaved >= g.targetAmountMinor }
        : g,
    )
    const wallets = state.wallets.map((w) =>
      w.id === walletId ? { ...w, balanceMinor: w.balanceMinor - amountMinor } : w,
    )
    const pools = updatePool(state.pools, wallet.currency, (p) => ({
      ...p,
      totalSpentMinor: p.totalSpentMinor + amountMinor,
    }))
    const tx: Transaction = {
      id: uid('tx'),
      type: 'goal_contribution',
      status: 'completed',
      currency: wallet.currency,
      amountMinor,
      fromWalletId: walletId,
      note: `Goal: ${goal.name}`,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, goals, wallets, pools, transactions: [tx, ...state.transactions] }
  }

  if (action.type === 'MARK_GOAL_COMPLETE') {
    return {
      ...state,
      goals: (state.goals ?? []).map((g) =>
        g.id === action.payload.goalId ? { ...g, isCompleted: true } : g,
      ),
    }
  }

  return null
}

function advanceNextDue(current: string, frequency: RecurringFrequency): string {

  const now = new Date()
  const date = new Date(current)
  do {
    if (frequency === 'daily')   date.setDate(date.getDate() + 1)
    else if (frequency === 'weekly')  date.setDate(date.getDate() + 7)
    else if (frequency === 'monthly') date.setMonth(date.getMonth() + 1)
    else if (frequency === 'yearly')  date.setFullYear(date.getFullYear() + 1)
  } while (date <= now)
  return date.toISOString()
}

function fireRecurringRule(state: WalletAppState, rule: RecurringRule): WalletAppState {
  const nextDueIso = advanceNextDue(rule.nextDueIso, rule.frequency)
  const updatedRules = (state.recurringRules ?? []).map((r) =>
    r.id === rule.id ? { ...r, nextDueIso } : r,
  )

  if (rule.type === 'income') {
    const pool = state.pools.find((p) => p.currency === rule.currency)
    if (!pool) return { ...state, recurringRules: updatedRules }
    const pools = updatePool(state.pools, rule.currency, (p) => ({
      ...p,
      totalAddedMinor: p.totalAddedMinor + rule.amountMinor,
      unallocatedMinor: p.unallocatedMinor + rule.amountMinor,
    }))
    const tx: Transaction = {
      id: uid('tx'),
      type: 'income',
      status: 'completed',
      currency: rule.currency,
      amountMinor: rule.amountMinor,
      note: rule.note || rule.name,
      source: rule.source,
      isRecurring: true,
      recurringId: rule.id,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, pools, recurringRules: updatedRules, transactions: [tx, ...state.transactions] }
  }

  if (rule.type === 'expense' && rule.walletId) {
    const wallet = state.wallets.find((w) => w.id === rule.walletId)
    if (!wallet || wallet.balanceMinor < rule.amountMinor) {
      return { ...state, recurringRules: updatedRules }
    }
    const wallets = state.wallets.map((w) =>
      w.id === rule.walletId ? { ...w, balanceMinor: w.balanceMinor - rule.amountMinor } : w,
    )
    const pools = updatePool(state.pools, rule.currency, (p) => ({
      ...p,
      totalSpentMinor: p.totalSpentMinor + rule.amountMinor,
    }))
    const tx: Transaction = {
      id: uid('tx'),
      type: 'expense',
      status: 'completed',
      currency: rule.currency,
      amountMinor: rule.amountMinor,
      fromWalletId: rule.walletId,
      note: rule.note || rule.name,
      category: rule.category,
      paymentType: rule.paymentType,
      isRecurring: true,
      recurringId: rule.id,
      createdAtIso: new Date().toISOString(),
    }
    return { ...state, wallets, pools, recurringRules: updatedRules, transactions: [tx, ...state.transactions] }
  }

  return { ...state, recurringRules: updatedRules }
}
