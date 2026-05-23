import type { LucideIcon } from 'lucide-react'
import { Home, TrendingDown, Wallet, BarChart3, ClipboardList, Settings } from 'lucide-react'

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
  notFound: '/404',
} as const

export interface NavItem {
  to: string
  labelKey: string
  icon: LucideIcon
}

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: APP_ROUTES.dashboard,   labelKey: 'nav.dashboard',  icon: Home         },
  { to: APP_ROUTES.addExpense,  labelKey: 'nav.addExpense', icon: TrendingDown },
  { to: APP_ROUTES.addIncome,   labelKey: 'nav.addIncome',  icon: Wallet       },
  { to: APP_ROUTES.analytics,   labelKey: 'nav.analytics',  icon: BarChart3    },
  { to: APP_ROUTES.history,     labelKey: 'nav.history',    icon: ClipboardList },
  { to: APP_ROUTES.manage,      labelKey: 'nav.manage',     icon: Settings     },
]
