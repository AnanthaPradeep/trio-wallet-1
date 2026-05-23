import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Globe } from 'lucide-react'
import { NAV_ITEMS } from '../../shared/constants/routes'
import { G20_REGIONS } from '../../shared/constants/regions'
import { QuickActionFAB } from '../../components/QuickActionFAB'
import { useDisplayCurrency } from '../../shared/hooks/useDisplayCurrency'
import { cn } from '../../shared/lib/cn'

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

  return (
    <div className="relative min-h-screen bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 text-gray-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed -left-32 -top-32 h-96 w-96 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none fixed -right-32 top-1/3 h-80 w-80 rounded-full bg-purple-100/50 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-64 w-96 -translate-x-1/2 rounded-full bg-pink-50/40 blur-3xl" />

      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-white text-sm font-bold">
              T
            </div>
            {isHome ? (
              <div>
                <p className="text-xs font-medium text-gray-400 leading-none">Trio Wallet</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">Smart Money</p>
              </div>
            ) : (
              <p className="text-base font-bold text-gray-900">{pageTitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Desktop nav */}
            <nav className="hidden gap-1 md:flex">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
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

            {/* Region selector */}
            <div className="flex items-center gap-1.5">
              <Globe size={15} className="text-gray-400 shrink-0" />
              <select
                value={region.code}
                onChange={(e) => setRegion(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 outline-none focus:border-black focus:ring-2 focus:ring-black/10"
              >
                {G20_REGIONS.map((r) => (
                  <option key={r.code} value={r.code}>{r.symbol} {r.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative mx-auto max-w-4xl px-4 py-6 md:py-8">
        <Outlet />
      </main>

      {/* Bottom tab bar (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/5 bg-white/90 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 px-1 text-xs font-medium transition-all',
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
                  <span className="truncate max-w-full text-center" style={{ fontSize: '10px' }}>
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
