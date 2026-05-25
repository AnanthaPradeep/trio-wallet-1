import type { LucideIcon } from 'lucide-react'
import { Home, BarChart3, ClipboardList, Settings, ScanLine, CreditCard } from 'lucide-react'

export const APP_ROUTES = {
  dashboard: '/',
  login: '/login',
  register: '/register',
  addExpense: '/add-expense',
  addIncome: '/add-income',
  allocateFunds: '/allocate-funds',
  analytics: '/analytics',
  spend: '/spend',
  transferInternal: '/transfer-internal',
  transferBank: '/transfer-bank',
  bankToWallet: '/bank-to-wallet',
  history: '/history',
  manage: '/manage',
  profile: '/profile',
  notFound: '/404',
  pay: '/pay',
  scan: '/scan',
  bank: '/bank',
  budgets: '/budgets',
  recurring: '/recurring',
  goals: '/goals',
} as const

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: APP_ROUTES.dashboard, labelKey: 'nav.dashboard', icon: Home         },
  { to: APP_ROUTES.scan,      labelKey: 'nav.scan',      icon: ScanLine     },
  { to: APP_ROUTES.pay,       labelKey: 'nav.pay',       icon: CreditCard   },
  { to: APP_ROUTES.analytics, labelKey: 'nav.analytics', icon: BarChart3    },
  { to: APP_ROUTES.history,   labelKey: 'nav.history',   icon: ClipboardList },
  { to: APP_ROUTES.manage,    labelKey: 'nav.manage',    icon: Settings     },
]
