import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { NAV_ITEMS } from '../../shared/constants/routes'
import { G20_REGIONS } from '../../shared/constants/regions'
import { QuickActionFAB } from '../../components/QuickActionFAB'
import { useDisplayCurrency } from '../../shared/hooks/useDisplayCurrency'
import { cn } from '../../shared/lib/cn'
import { useAuth } from '../../features/auth/hooks/useAuth'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/add-expense': 'Add Expense',
  '/add-income': 'Add Income',
  '/analytics': 'Analytics',
  '/history': 'History',
  '/manage': 'Manage',
  '/spend': 'Spend',
  '/transfer-internal': 'Transfer',
  '/transfer-bank': 'Wallet to Bank',
  '/bank-to-wallet': 'Bank to Wallet',
}

const NAV_LABELS: Record<string, string> = {
  '/': 'Home',
  '/add-expense': 'Expense',
  '/add-income': 'Income',
  '/analytics': 'Analytics',
  '/history': 'History',
  '/manage': 'Manage',
}

export function AppLayout() {
  const location = useLocation()
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Trio Wallet'
  const isHome = location.pathname === '/'
  const { region, setRegion } = useDisplayCurrency()
  const { user, logout } = useAuth()
  const initials = user?.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 text-gray-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 top-1/3 h-80 w-80 rounded-full bg-purple-100/50 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-pink-50/40 blur-3xl" />

      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3 md:gap-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-sm font-bold text-white sm:h-9 sm:w-9">
              T
            </div>
            {isHome ? (
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 leading-none">Trio Wallet</p>
                <p className="truncate text-sm font-bold leading-tight text-gray-900 sm:text-base">Smart Money</p>
              </div>
            ) : (
              <p className="truncate text-sm font-bold text-gray-900 sm:text-base md:text-lg">{pageTitle}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Desktop nav */}
            <nav className="hidden gap-1 md:flex lg:gap-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-medium transition-all lg:gap-1.5 lg:px-3 lg:text-sm',
                      isActive
                        ? 'bg-black text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                    )
                  }
                >
                  <item.icon size={16} />
                  <span className="hidden lg:inline">{NAV_LABELS[item.to] ?? item.to}</span>
                </NavLink>
              ))}
            </nav>

            {/* Region selector + user */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Globe size={15} className="text-gray-400 shrink-0" />
                <select
                  value={region.code}
                  onChange={(e) => setRegion(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-700 outline-none focus:border-black focus:ring-2 focus:ring-black/10 sm:text-xs"
                >
                  {G20_REGIONS.map((r) => (
                    <option key={r.code} value={r.code}>{r.symbol} {r.name}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900 md:hidden"
              >
                Logout
              </button>

              <div className="hidden items-center gap-2 rounded-2xl border border-black/10 bg-white px-2 py-1.5 md:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">
                  {initials || 'U'}
                </div>
                <div className="max-w-28 truncate text-xs font-semibold text-gray-700">{user?.name ?? 'User'}</div>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-semibold text-gray-600 transition hover:border-gray-300 hover:text-gray-900"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto w-full max-w-6xl px-3 py-5 pb-24 sm:px-4 sm:py-6 sm:pb-24 md:px-6 md:py-8 md:pb-10 lg:px-8">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-xs font-medium transition-all',
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl transition-all',
                      isActive ? 'bg-black/10 scale-110' : '',
                    )}
                  >
                    <item.icon size={18} />
                  </span>
                  <span className="max-w-full truncate text-center text-[10px]">
                    {NAV_LABELS[item.to] ?? item.to}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* FAB */}
      <QuickActionFAB />
    </div>
  )
}
