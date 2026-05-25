import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { STORAGE_KEYS } from '../../../shared/constants/storage'
import { uid } from '../../../shared/lib/uid'
import { initialWalletState } from '../model/mockData'
import { walletReducer } from '../model/walletReducer'
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
  ContributeToGoalInput,
  InternalTransferInput,
  SpendInput,
  UpdateWalletInput,
  WalletAppState,
} from '../model/types'

interface WalletContextValue extends WalletAppState {
  spendFromWallet: (input: SpendInput) => void
  addExpense: (input: AddExpenseInput) => void
  addIncome: (input: AddIncomeInput) => void
  allocateToWallet: (input: AllocateToWalletInput) => void
  deleteTransaction: (transactionId: string) => void
  transferWalletToWallet: (input: InternalTransferInput) => void
  transferWalletToBank: (input: BankTransferInput) => void
  transferBankToWallet: (input: BankToWalletInput) => void
  addWallet: (input: AddWalletInput) => void
  updateWallet: (input: UpdateWalletInput) => void
  removeWallet: (walletId: string) => void
  addBankAccount: (input: AddBankAccountInput) => void
  removeBankAccount: (bankAccountId: string) => void
  addBudget: (input: AddBudgetInput) => void
  updateBudget: (id: string, changes: Partial<AddBudgetInput>) => void
  removeBudget: (budgetId: string) => void
  addRecurringRule: (input: AddRecurringRuleInput) => void
  updateRecurringRule: (id: string, changes: Partial<AddRecurringRuleInput>) => void
  removeRecurringRule: (ruleId: string) => void
  toggleRecurringRule: (ruleId: string) => void
  runRecurringRule: (ruleId: string) => void
  addGoal: (input: AddGoalInput) => void
  updateGoal: (id: string, changes: Partial<AddGoalInput>) => void
  removeGoal: (goalId: string) => void
  contributeToGoal: (input: ContributeToGoalInput) => void
  markGoalComplete: (goalId: string) => void
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined)

function loadState(): WalletAppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.walletState)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<WalletAppState>
      if (Array.isArray(parsed.pools) && Array.isArray(parsed.wallets) && Array.isArray(parsed.transactions)) {
        return {
          ...parsed,
          budgets: parsed.budgets ?? [],
          recurringRules: parsed.recurringRules ?? [],
          goals: parsed.goals ?? [],
        } as WalletAppState
      }
    }
  } catch {}
  return initialWalletState
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, undefined, loadState)

  useEffect(() => {
    dispatch({ type: 'PROCESS_RECURRING_RULES' })
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.walletState, JSON.stringify(state))
  }, [state])

  const value = useMemo<WalletContextValue>(
    () => ({
      ...state,
      spendFromWallet: (input) => dispatch({ type: 'SPEND', payload: input }),
      addExpense: (input) => dispatch({ type: 'ADD_EXPENSE', payload: input }),
      addIncome: (input) => dispatch({ type: 'ADD_INCOME', payload: input }),
      allocateToWallet: (input) => dispatch({ type: 'ALLOCATE_TO_WALLET', payload: input }),
      deleteTransaction: (transactionId) => dispatch({ type: 'DELETE_TRANSACTION', payload: { transactionId } }),
      transferWalletToWallet: (input) => dispatch({ type: 'INTERNAL_TRANSFER', payload: input }),
      transferWalletToBank: (input) => {
        const txId = uid('tx')
        dispatch({ type: 'BANK_TRANSFER', payload: { ...input, id: txId } })
        setTimeout(() => {
          dispatch({ type: 'SETTLE_TRANSACTION', payload: { transactionId: txId, status: 'completed' } })
        }, 4000)
      },
      transferBankToWallet: (input) => dispatch({ type: 'BANK_TO_WALLET', payload: input }),
      addWallet: (input) => dispatch({ type: 'ADD_WALLET', payload: input }),
      updateWallet: (input) => dispatch({ type: 'UPDATE_WALLET', payload: input }),
      removeWallet: (walletId) => dispatch({ type: 'REMOVE_WALLET', payload: { walletId } }),
      addBankAccount: (input) => dispatch({ type: 'ADD_BANK_ACCOUNT', payload: input }),
      removeBankAccount: (bankAccountId) => dispatch({ type: 'REMOVE_BANK_ACCOUNT', payload: { bankAccountId } }),
      addBudget: (input) => dispatch({ type: 'ADD_BUDGET', payload: input }),
      updateBudget: (id, changes) => dispatch({ type: 'UPDATE_BUDGET', payload: { id, ...changes } }),
      removeBudget: (budgetId) => dispatch({ type: 'REMOVE_BUDGET', payload: { budgetId } }),
      addRecurringRule: (input) => dispatch({ type: 'ADD_RECURRING_RULE', payload: input }),
      updateRecurringRule: (id, changes) => dispatch({ type: 'UPDATE_RECURRING_RULE', payload: { id, ...changes } }),
      removeRecurringRule: (ruleId) => dispatch({ type: 'REMOVE_RECURRING_RULE', payload: { ruleId } }),
      toggleRecurringRule: (ruleId) => dispatch({ type: 'TOGGLE_RECURRING_RULE', payload: { ruleId } }),
      runRecurringRule: (ruleId) => dispatch({ type: 'RUN_RECURRING_RULE', payload: { ruleId } }),
      addGoal: (input) => dispatch({ type: 'ADD_GOAL', payload: input }),
      updateGoal: (id, changes) => dispatch({ type: 'UPDATE_GOAL', payload: { id, ...changes } }),
      removeGoal: (goalId) => dispatch({ type: 'REMOVE_GOAL', payload: { goalId } }),
      contributeToGoal: (input) => dispatch({ type: 'CONTRIBUTE_TO_GOAL', payload: input }),
      markGoalComplete: (goalId) => dispatch({ type: 'MARK_GOAL_COMPLETE', payload: { goalId } }),
    }),
    [state],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext(): WalletContextValue {
  const context = useContext(WalletContext)
  if (!context) throw new Error('useWalletContext must be used inside WalletProvider.')
  return context
}
